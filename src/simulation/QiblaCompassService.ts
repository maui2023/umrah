/**
 * QiblaCompassService
 * Accurately calculates Qibla bearing towards the Holy Kaabah in Makkah (21.422487° N, 39.826206° E)
 * using Great-Circle spherical trigonometry.
 * Handles:
 * - Real DeviceOrientation sensors (iOS webkitCompassHeading, Android deviceorientationabsolute, standard deviceorientation)
 * - iOS DeviceOrientation permission handling (DeviceOrientationEvent.requestPermission)
 * - Geolocation API (GPS tracking & distance calculation)
 * - Preset location fallbacks (Makkah, Madinah, Kuala Lumpur, Jakarta, Singapore, London, New York)
 * - Desktop / manual orientation fallback (slider & rotate controls so it always works)
 * - Vibration / Haptic feedback when device aligns within ±5° of Kaabah
 */

export interface QiblaLocationPreset {
  id: string;
  name: string;
  country: string;
  lat: number;
  lng: number;
}

export const PRESET_LOCATIONS: QiblaLocationPreset[] = [
  { id: 'makkah', name: 'Masjidil Haram, Makkah', country: 'Tanah Suci', lat: 21.422487, lng: 39.826206 },
  { id: 'madinah', name: 'Masjid Nabawi, Madinah', country: 'Tanah Suci', lat: 24.4672, lng: 39.6109 },
  { id: 'kl', name: 'Kuala Lumpur', country: 'Malaysia', lat: 3.1390, lng: 101.6869 },
  { id: 'penang', name: 'Pulau Pinang', country: 'Malaysia', lat: 5.4164, lng: 100.3327 },
  { id: 'jb', name: 'Johor Bahru', country: 'Malaysia', lat: 1.4927, lng: 103.7414 },
  { id: 'kuching', name: 'Kuching', country: 'Sarawak, Malaysia', lat: 1.5533, lng: 110.3592 },
  { id: 'kk', name: 'Kota Kinabalu', country: 'Sabah, Malaysia', lat: 5.9804, lng: 116.0735 },
  { id: 'jakarta', name: 'Jakarta', country: 'Indonesia', lat: -6.2088, lng: 106.8456 },
  { id: 'singapore', name: 'Singapura', country: 'Singapura', lat: 1.3521, lng: 103.8198 },
  { id: 'brunei', name: 'Bandar Seri Begawan', country: 'Brunei', lat: 4.9031, lng: 114.9398 },
  { id: 'london', name: 'London', country: 'United Kingdom', lat: 51.5074, lng: -0.1278 },
  { id: 'newyork', name: 'New York', country: 'USA', lat: 40.7128, lng: -74.0060 }
];

export interface QiblaState {
  heading: number; // 0..360 deg (0 = North, 90 = East, etc.)
  qiblaBearing: number; // 0..360 deg (Bearing from current location to Kaabah)
  relativeQibla: number; // 0..360 deg (Where the needle should point relative to device: (qiblaBearing - heading + 360) % 360)
  isFacingQibla: boolean; // true if within ±5° of Kaabah
  distanceKm: number; // Distance in km to Kaabah
  latitude: number;
  longitude: number;
  locationName: string;
  isGpsActive: boolean;
  isSensorActive: boolean;
  isSensorSupported: boolean;
  needsPermission: boolean;
}

export class QiblaCompassService {
  public static readonly KAABAH_LAT = 21.422487;
  public static readonly KAABAH_LNG = 39.826206;

  private heading: number = 0;
  private isManualMode: boolean = false;

  private currentLat: number = 3.1390; // Default: Kuala Lumpur
  private currentLng: number = 101.6869;
  private currentLocationName: string = 'Kuala Lumpur (Preset)';
  private isGpsActive: boolean = false;

  private isSensorActive: boolean = false;
  private isSensorSupported: boolean = true;
  private needsPermission: boolean = false;
  private lastSensorEventTime: number = 0;
  private lastVibrationTime: number = 0;

  private watchId: number | null = null;
  private orientationListener: ((e: DeviceOrientationEvent) => void) | null = null;
  private updateCallbacks: Set<(state: QiblaState) => void> = new Set();
  private isRunning: boolean = false;

  constructor() {
    this.checkPermissionNeed();
  }

  private checkPermissionNeed() {
    if (typeof window !== 'undefined') {
      const doe = (window as any).DeviceOrientationEvent;
      if (doe && typeof doe.requestPermission === 'function') {
        this.needsPermission = true;
      }
    }
  }

  public subscribe(callback: (state: QiblaState) => void): () => void {
    this.updateCallbacks.add(callback);
    callback(this.getState());
    return () => {
      this.updateCallbacks.delete(callback);
    };
  }

  private notify() {
    const state = this.getState();
    this.updateCallbacks.forEach((cb) => cb(state));
  }

  public start() {
    if (this.isRunning) return;
    this.isRunning = true;

    this.startGeolocation();
    this.startOrientation();
  }

  public stop() {
    this.isRunning = false;

    if (this.watchId !== null && navigator.geolocation) {
      navigator.geolocation.clearWatch(this.watchId);
      this.watchId = null;
    }

    if (this.orientationListener) {
      window.removeEventListener('deviceorientationabsolute' as any, this.orientationListener, true);
      window.removeEventListener('deviceorientation', this.orientationListener, true);
      this.orientationListener = null;
    }

    this.isSensorActive = false;
  }

  /**
   * Request iOS permission if required
   */
  public async requestPermission(): Promise<boolean> {
    const doe = (window as any).DeviceOrientationEvent;
    if (doe && typeof doe.requestPermission === 'function') {
      try {
        const response = await doe.requestPermission();
        if (response === 'granted') {
          this.needsPermission = false;
          this.startOrientation();
          return true;
        }
      } catch (err) {
        console.warn('DeviceOrientation permission request failed:', err);
      }
      return false;
    }
    return true;
  }

  /**
   * Start device orientation listeners
   */
  private startOrientation() {
    if (typeof window === 'undefined') return;

    this.orientationListener = (e: DeviceOrientationEvent) => {
      this.lastSensorEventTime = Date.now();
      this.isSensorActive = true;
      this.isSensorSupported = true;

      let compassHeading: number | null = null;

      // 1. iOS Safari webkitCompassHeading (True Heading)
      if (typeof (e as any).webkitCompassHeading === 'number') {
        compassHeading = (e as any).webkitCompassHeading;
      }
      // 2. Android absolute orientation or standard alpha
      else if (e.alpha !== null && e.alpha !== undefined) {
        if ((e as any).absolute) {
          compassHeading = (360 - e.alpha) % 360;
        } else {
          // Compute heading from Euler angles (alpha, beta, gamma)
          const degToRad = Math.PI / 180;
          const a = (e.alpha || 0) * degToRad;
          const b = (e.beta || 0) * degToRad;
          const g = (e.gamma || 0) * degToRad;

          const cA = Math.cos(a);
          const sA = Math.sin(a);
          const sB = Math.sin(b);
          const cG = Math.cos(g);
          const sG = Math.sin(g);

          const rA = -cA * sG - sA * sB * cG;
          const rB = -sA * sG + cA * sB * cG;

          let calc = Math.atan2(rA, rB) * (180 / Math.PI);
          if (calc < 0) calc += 360;
          compassHeading = calc;
        }
      }

      if (compassHeading !== null && !this.isManualMode) {
        this.applySmoothedHeading(compassHeading);
      }
    };

    // Prefer deviceorientationabsolute on Android Chrome
    if ('ondeviceorientationabsolute' in window) {
      window.addEventListener('deviceorientationabsolute' as any, this.orientationListener, true);
    }
    window.addEventListener('deviceorientation', this.orientationListener, true);

    // Watchdog: If no event received after 1.5s, mark sensor as unassisted/fallback to manual mode
    setTimeout(() => {
      if (this.lastSensorEventTime === 0) {
        this.isSensorSupported = false;
        this.notify();
      }
    }, 1500);
  }

  private applySmoothedHeading(raw: number) {
    // Handle wrap-around across 0° / 360° boundary
    let diff = (raw - this.heading + 360) % 360;
    if (diff > 180) diff -= 360;

    // Exponential smoothing
    this.heading = (this.heading + diff * 0.35 + 360) % 360;
    this.checkQiblaAlignment();
    this.notify();
  }

  /**
   * Set manual heading (e.g. from slider, buttons, or desktop testing)
   */
  public setManualHeading(deg: number) {
    this.isManualMode = true;
    this.heading = ((deg % 360) + 360) % 360;
    this.checkQiblaAlignment();
    this.notify();
  }

  public rotateManualHeading(deltaDeg: number) {
    this.isManualMode = true;
    this.heading = (((this.heading + deltaDeg) % 360) + 360) % 360;
    this.checkQiblaAlignment();
    this.notify();
  }

  public resetToSensorMode() {
    this.isManualMode = false;
    this.notify();
  }

  /**
   * Set user location to preset or custom coordinates
   */
  public setLocation(presetId: string) {
    const preset = PRESET_LOCATIONS.find((p) => p.id === presetId);
    if (preset) {
      this.currentLat = preset.lat;
      this.currentLng = preset.lng;
      this.currentLocationName = `${preset.name} (${preset.country})`;
      this.isGpsActive = false;
      this.checkQiblaAlignment();
      this.notify();
    }
  }

  public setCustomCoordinates(lat: number, lng: number, name: string = 'Lokasi Khas') {
    this.currentLat = lat;
    this.currentLng = lng;
    this.currentLocationName = name;
    this.isGpsActive = false;
    this.checkQiblaAlignment();
    this.notify();
  }

  /**
   * Start Geolocation
   */
  public startGeolocation() {
    if (!navigator.geolocation) {
      this.isGpsActive = false;
      this.notify();
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        this.handleGpsPosition(pos);
      },
      (err) => {
        console.warn('Geolocation initial query error:', err.message);
        this.isGpsActive = false;
        this.notify();
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );

    this.watchId = navigator.geolocation.watchPosition(
      (pos) => {
        this.handleGpsPosition(pos);
      },
      (err) => {
        console.warn('Geolocation watch error:', err.message);
      },
      { enableHighAccuracy: true, maximumAge: 10000 }
    );
  }

  private handleGpsPosition(pos: GeolocationPosition) {
    this.currentLat = pos.coords.latitude;
    this.currentLng = pos.coords.longitude;
    this.isGpsActive = true;

    // Check if within Makkah / Masjidil Haram
    const distToKaabah = this.calculateDistanceKm(this.currentLat, this.currentLng);
    if (distToKaabah < 1.0) {
      this.currentLocationName = 'Masjidil Haram, Makkah (GPS)';
    } else if (distToKaabah < 25.0) {
      this.currentLocationName = 'Tanah Suci Makkah (GPS)';
    } else {
      this.currentLocationName = `GPS (${this.currentLat.toFixed(2)}°, ${this.currentLng.toFixed(2)}°)`;
    }

    this.checkQiblaAlignment();
    this.notify();
  }

  /**
   * Great-Circle Qibla calculation
   * Formula:
   * y = sin(dLng)
   * x = cos(lat1)*tan(latKaabah) - sin(lat1)*cos(dLng)
   * qibla = atan2(y, x)
   */
  public calculateQiblaBearing(lat: number, lng: number): number {
    const phiK = (QiblaCompassService.KAABAH_LAT * Math.PI) / 180;
    const lambdaK = (QiblaCompassService.KAABAH_LNG * Math.PI) / 180;
    const phiU = (lat * Math.PI) / 180;
    const lambdaU = (lng * Math.PI) / 180;
    const deltaLambda = lambdaK - lambdaU;

    const y = Math.sin(deltaLambda);
    const x = Math.cos(phiU) * Math.tan(phiK) - Math.sin(phiU) * Math.cos(deltaLambda);
    let qibla = (Math.atan2(y, x) * 180) / Math.PI;
    return ((qibla % 360) + 360) % 360;
  }

  /**
   * Haversine distance in km
   */
  public calculateDistanceKm(lat: number, lng: number): number {
    const R = 6371; // Earth radius in km
    const dLat = ((QiblaCompassService.KAABAH_LAT - lat) * Math.PI) / 180;
    const dLng = ((QiblaCompassService.KAABAH_LNG - lng) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat * Math.PI) / 180) *
        Math.cos((QiblaCompassService.KAABAH_LAT * Math.PI) / 180) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c * 10) / 10;
  }

  private checkQiblaAlignment() {
    const qiblaBearing = this.calculateQiblaBearing(this.currentLat, this.currentLng);
    const rel = ((qiblaBearing - this.heading) % 360 + 360) % 360;
    const isAligned = rel <= 5 || rel >= 355;

    if (isAligned) {
      const now = Date.now();
      if (now - this.lastVibrationTime > 2500) {
        this.lastVibrationTime = now;
        try {
          if ('vibrate' in navigator) {
            navigator.vibrate(60);
          }
        } catch {
          // ignore
        }
      }
    }
  }

  public alignHeadingToQibla() {
    const qibla = this.calculateQiblaBearing(this.currentLat, this.currentLng);
    this.setManualHeading(qibla);
  }

  public getState(): QiblaState {
    const qiblaBearing = this.calculateQiblaBearing(this.currentLat, this.currentLng);
    const rel = ((qiblaBearing - this.heading) % 360 + 360) % 360;
    const isAligned = rel <= 5 || rel >= 355;
    const dist = this.calculateDistanceKm(this.currentLat, this.currentLng);

    return {
      heading: Math.round(this.heading),
      qiblaBearing: Math.round(qiblaBearing),
      relativeQibla: Math.round(rel),
      isFacingQibla: isAligned,
      distanceKm: dist,
      latitude: this.currentLat,
      longitude: this.currentLng,
      locationName: this.currentLocationName,
      isGpsActive: this.isGpsActive,
      isSensorActive: this.isSensorActive && !this.isManualMode,
      isSensorSupported: this.isSensorSupported,
      needsPermission: this.needsPermission
    };
  }
}

export const qiblaCompassService = new QiblaCompassService();
