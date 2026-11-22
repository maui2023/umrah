import { TawafMode, TawafProgress, TawafSectorId, TawafSectorInfo } from '../types';

export const TAWAF_SECTORS: Record<TawafSectorId, TawafSectorInfo> = {
  1: {
    id: 1,
    name: 'Hajarul Aswad ke Rukun Iraqi',
    shortName: 'Hajarul Aswad ➔ Iraqi',
    cornerName: 'Hajarul Aswad (Garisan Mula/Tamat)',
    startDeg: 0,
    endDeg: 90,
    duaTitle: 'Doa & Zikir Permulaan Pusingan',
    sunnahNote: 'Sunnah Idtiba\' (buka bahu kanan bagi lelaki) dan Raml (lari anak) pada 3 pusingan pertama.',
    arabicSnippet: 'سُبْحَانَ اللَّهِ، وَالْحَمْدُ لِلَّهِ، وَلاَ إِلَهَ إِلاَّ اللَّهُ، وَاللَّهُ أَكْبَرُ'
  },
  2: {
    id: 2,
    name: 'Rukun Iraqi ke Rukun Syami (Hijr Ismail)',
    shortName: 'Iraqi ➔ Syami (Hijr Ismail)',
    cornerName: 'Rukun Iraqi & Pancuran Emas',
    startDeg: 90,
    endDeg: 180,
    duaTitle: 'Doa Tawaf di Luar Hijr Ismail',
    sunnahNote: 'Wajib tawaf di LUAR dinding Hijr Ismail (Hateem). Sunnah berdoa di bawah pancuran emas (Mizabur Rahmah).',
    arabicSnippet: 'اللَّهُمَّ إِنَّ هَذَا الْبَيْتَ بَيْتُكَ، وَالْحَرَمَ حَرَمُكَ، وَالأَمْنَ أَمْنُكَ'
  },
  3: {
    id: 3,
    name: 'Rukun Syami ke Rukun Yamani',
    shortName: 'Syami ➔ Yamani',
    cornerName: 'Rukun Syami',
    startDeg: 180,
    endDeg: 270,
    duaTitle: 'Doa Perlindungan & Keampunan',
    sunnahNote: 'Kekalkan kedudukan Kaabah di sebelah kiri bahu anda sepanjang masa. Berjalan tenang dan tertib.',
    arabicSnippet: 'اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الشَّكِّ وَالشِّرْكِ، وَالشِّقَاقِ وَالنِّفَاقِ'
  },
  4: {
    id: 4,
    name: 'Rukun Yamani ke Hajarul Aswad (Rabbana Aatina)',
    shortName: 'Yamani ➔ Hajarul Aswad',
    cornerName: 'Rukun Yamani',
    startDeg: 270,
    endDeg: 360,
    duaTitle: 'Doa Rabbana Aatina Fid-Dunya Hasanah',
    sunnahNote: 'Sunnah mengusap Rukun Yamani atau berisyarat salam tanpa mencium tangan, lalu berdoa Rabbana Aatina hingga Hajarul Aswad.',
    arabicSnippet: 'رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ'
  }
};

export interface TawafTrackerCallbacks {
  onLapCompleted?: (lap: number) => void;
  onSectorChanged?: (sector: TawafSectorInfo) => void;
  onWrongDirection?: (warningText: string) => void;
  onHijrIsmailWarning?: (warningText: string) => void;
  onIstilamZone?: (isEntering: boolean) => void;
  onTawafFinished?: () => void;
}

export class TawafPolarTracker {
  // Center of Kaabah in 3D world coordinates
  public kaabahCenter = { x: 0, z: 0 };

  // Angle of Hajarul Aswad line in standard atan2(z, x) plane: PI/4 = 45 deg (SE direction)
  public static readonly HAJAR_ASWAD_LINE_ANGLE = Math.PI / 4;

  // Mataf boundaries
  public static readonly MIN_RADIUS_NORMAL = 7.0; // Distance to Kaabah wall
  public static readonly MIN_RADIUS_HIJR_ISMAIL = 13.5; // Must be outside Hateem
  public static readonly MAX_RADIUS_MATAF = 42.0; // Outer circle of white marble

  // State
  public tawafMode: TawafMode = 'real';
  public currentLap: number = 1;
  public totalLaps: number = 7;
  public isRamlActive: boolean = false;

  private lastAngleDeg: number | null = null;
  private currentSectorId: TawafSectorId = 1;
  private visitedSectorsInLap: Set<TawafSectorId> = new Set([1]);
  private forwardAngularAccumulation: number = 0;
  private wrongClockwiseAccumulation: number = 0;
  private lastWrongWarningTime: number = 0;
  private lastHijrWarningTime: number = 0;
  private wasInIstilamZone: boolean = false;

  private callbacks: TawafTrackerCallbacks = {};

  constructor(callbacks?: TawafTrackerCallbacks) {
    if (callbacks) {
      this.callbacks = callbacks;
    }
  }

  public setCallbacks(callbacks: TawafTrackerCallbacks) {
    this.callbacks = { ...this.callbacks, ...callbacks };
  }

  public setLap(lap: number) {
    this.currentLap = Math.max(1, Math.min(7, lap));
    this.visitedSectorsInLap.clear();
    this.visitedSectorsInLap.add(1);
    this.forwardAngularAccumulation = 0;
    this.wrongClockwiseAccumulation = 0;
  }

  public setMode(mode: TawafMode) {
    this.tawafMode = mode;
  }

  public setRaml(active: boolean) {
    this.isRamlActive = active;
  }

  /**
   * Process 3D avatar position (x, z) relative to Kaabah center
   * Returns complete real-time progress state
   */
  public update(x: number, z: number): TawafProgress {
    const dx = x - this.kaabahCenter.x;
    const dz = z - this.kaabahCenter.z;
    const radius = Math.hypot(dx, dz);

    // Standard Cartesian angle alpha in [-PI, PI]
    const alpha = Math.atan2(dz, dx);

    // Counter-clockwise azimuth angle starting at Hajarul Aswad (PI/4)
    // Moving CCW around Kaabah in Three.js plane decreases alpha,
    // so diff = (PI/4 - alpha) increases smoothly from 0 to 2*PI (0 to 360 deg)
    let rawDiff = TawafPolarTracker.HAJAR_ASWAD_LINE_ANGLE - alpha;
    rawDiff = ((rawDiff % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
    const angleDeg = (rawDiff * 180) / Math.PI;

    // Detect Sector (1, 2, 3, or 4)
    let sectorId: TawafSectorId = 1;
    if (angleDeg >= 0 && angleDeg < 90) {
      sectorId = 1;
    } else if (angleDeg >= 90 && angleDeg < 180) {
      sectorId = 2;
    } else if (angleDeg >= 180 && angleDeg < 270) {
      sectorId = 3;
    } else {
      sectorId = 4;
    }

    if (sectorId !== this.currentSectorId) {
      this.currentSectorId = sectorId;
      this.visitedSectorsInLap.add(sectorId);
      this.callbacks.onSectorChanged?.(TAWAF_SECTORS[sectorId]);
    } else {
      this.visitedSectorsInLap.add(sectorId);
    }

    // Check Hijr Ismail Violation
    // Hijr Ismail is situated on North face (z < 0) with arc centered at (0, -6.6) and radius ~6.2m
    const distToHijrCenter = Math.hypot(dx - 0, dz - (-6.6));
    const isInsideHijrIsmail = (sectorId === 2 && radius < TawafPolarTracker.MIN_RADIUS_HIJR_ISMAIL) ||
      (dz < -5.5 && distToHijrCenter <= 6.3);

    const now = Date.now();
    if (isInsideHijrIsmail && now - this.lastHijrWarningTime > 10000) {
      this.lastHijrWarningTime = now;
      this.callbacks.onHijrIsmailWarning?.(
        '⚠️ Peringatan Fiqh: Jangan Tawaf di dalam Hijr Ismail (Hateem)! Tawaf hendaklah di luar dinding lengkung marmar.'
      );
    }

    // Direction Tracking (Delta between frames)
    let isWrongDirection = false;
    if (this.lastAngleDeg !== null) {
      let delta = angleDeg - this.lastAngleDeg;
      // Un-wrap angle delta to [-180, 180]
      delta = ((delta + 540) % 360) - 180;

      // Moving Counter-Clockwise (Correct)
      if (delta > 0.01 && delta < 45) {
        this.forwardAngularAccumulation += delta;
        this.wrongClockwiseAccumulation = 0;
      } else if (delta < -0.05 && delta > -45) {
        // Moving Clockwise (Wrong direction!)
        this.wrongClockwiseAccumulation += Math.abs(delta);
        if (this.wrongClockwiseAccumulation > 20) {
          isWrongDirection = true;
          if (now - this.lastWrongWarningTime > 12000) {
            this.lastWrongWarningTime = now;
            this.callbacks.onWrongDirection?.(
              '⚠️ Arah Tawaf Salah! Kaabah hendaklah sentiasa di sebelah KIRI anda (Lawan Arah Jam).'
            );
          }
        }
      }

      // Auto-Lap Check: Crossing from Sector 4 (near 360 deg) back to Sector 1 (near 0 deg)
      // Must have visited all 4 sectors and accumulated full rotation
      const crossedStartLine = (this.lastAngleDeg >= 315 && angleDeg <= 45 && delta > 0) ||
        (this.forwardAngularAccumulation >= 330 && (angleDeg <= 25 || angleDeg >= 345));

      const hasVisitedAllSectors = this.visitedSectorsInLap.has(1) &&
        this.visitedSectorsInLap.has(2) &&
        this.visitedSectorsInLap.has(3) &&
        this.visitedSectorsInLap.has(4);

      if (crossedStartLine && hasVisitedAllSectors && !isInsideHijrIsmail) {
        this.completeLap();
      }
    }
    this.lastAngleDeg = angleDeg;

    // Boundary checks
    const isOutsideMataf = radius > TawafPolarTracker.MAX_RADIUS_MATAF;

    // Zones
    const isNearHajarAswad = (angleDeg <= 18 || angleDeg >= 342) && radius >= 7.0 && radius <= 40.0;
    const isNearYamani = (angleDeg >= 248 && angleDeg <= 292) && radius >= 7.0 && radius <= 40.0;
    const isIstilamAvailable = isNearHajarAswad;

    if (isIstilamAvailable !== this.wasInIstilamZone) {
      this.wasInIstilamZone = isIstilamAvailable;
      this.callbacks.onIstilamZone?.(isIstilamAvailable);
    }

    // Lap progress percentage (0% to 100%)
    const lapPercentage = Math.min(100, Math.max(0, Math.round((angleDeg / 360) * 100)));

    return {
      lap: this.currentLap,
      totalLaps: this.totalLaps,
      radius: Math.round(radius * 10) / 10,
      angleDeg: Math.round(angleDeg * 10) / 10,
      sector: sectorId,
      sectorInfo: TAWAF_SECTORS[sectorId],
      lapPercentage,
      isInsideHijrIsmail,
      isOutsideMataf,
      isWrongDirection,
      isNearHajarAswad,
      isNearYamani,
      isIstilamAvailable,
      tawafMode: this.tawafMode,
      isRamlActive: this.isRamlActive
    };
  }

  /**
   * Complete current lap and advance to next or finish
   */
  public completeLap() {
    this.visitedSectorsInLap.clear();
    this.visitedSectorsInLap.add(1);
    this.forwardAngularAccumulation = 0;
    this.wrongClockwiseAccumulation = 0;

    if (this.currentLap < this.totalLaps) {
      this.currentLap++;
      this.callbacks.onLapCompleted?.(this.currentLap);
    } else {
      // 7 laps completed!
      this.callbacks.onTawafFinished?.();
    }
  }

  public reset() {
    this.currentLap = 1;
    this.lastAngleDeg = null;
    this.currentSectorId = 1;
    this.visitedSectorsInLap = new Set([1]);
    this.forwardAngularAccumulation = 0;
    this.wrongClockwiseAccumulation = 0;
    this.wasInIstilamZone = false;
  }
}
