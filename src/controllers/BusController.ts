import * as THREE from 'three';
import { AvatarModel } from '../characters/AvatarModel';
import { soundManager } from '../audio/SoundManager';

export interface BusWaypoint {
  x: number;
  z: number;
  rotation?: number;
  label?: string;
}

export class BusController {
  public parent: THREE.Object3D;
  public busGroup: THREE.Group;
  
  // Dimensions
  public busLength = 13.5;
  public busWidth = 3.6;
  public busHeight = 3.8;
  
  // Physics & Movement State
  public position = new THREE.Vector3(-135, 0, -8);
  public rotationY = 0; // heading angle in radians
  public speed = 0; // m/s
  public maxForwardSpeed = 12.0; // ~43 km/h
  public maxReverseSpeed = -4.0; // ~14 km/h
  public acceleration = 7.5; // m/s^2
  public brakingDecel = 12.0; // m/s^2
  public friction = 3.2; // natural deceleration
  public steerAngle = 0;
  public maxSteerAngle = 0.48; // max wheel turn angle
  public steerSpeed = 2.2;
  
  // Wheels & Mesh references
  private wheels: THREE.Group[] = [];
  private frontWheelGroups: THREE.Group[] = [];
  private wheelRadius = 0.7;
  private interiorGroup!: THREE.Group;
  private doorMarkerGroup!: THREE.Group;
  private passengerSeatPos = new THREE.Vector3(0.9, 1.15, 3.2);

  // Boarding & Cruising State
  public isPlayerInside = false;
  public isAutoCruising = false;
  public cruiseTarget: THREE.Vector3 | null = null;
  public cruiseTargetHeading: number | null = null;
  public waypointsQueue: BusWaypoint[] = [];
  public onCruiseArrived?: () => void;
  public currentDestinationName = 'Masjid Quba';

  // Sound throttles
  private engineSoundTimer = 0;

  constructor(parent: THREE.Object3D) {
    this.parent = parent;
    this.busGroup = new THREE.Group();
    this.busGroup.name = 'BasZiarahUmrah';
    this.buildBusModel();
    this.updateTransform();
    this.parent.add(this.busGroup);
  }

  /**
   * Build complete 3D luxury tour bus with realistic exterior, windows, interior seats & lights
   */
  private buildBusModel() {
    const busL = this.busLength;
    const busW = this.busWidth;
    const busH = this.busHeight;

    // Materials
    const pearlWhiteMat = new THREE.MeshLambertMaterial({ color: 0xfafafa });
    const greenAccentMat = new THREE.MeshLambertMaterial({ color: 0x059669 });
    const goldMat = new THREE.MeshLambertMaterial({ color: 0xd97706 });
    const darkInteriorMat = new THREE.MeshLambertMaterial({ color: 0x1e293b });
    const carpetMat = new THREE.MeshLambertMaterial({ color: 0x065f46 });
    const seatVelvetMat = new THREE.MeshLambertMaterial({ color: 0x1e3a8a });
    const seatBackMat = new THREE.MeshLambertMaterial({ color: 0x3b82f6 });
    const glassMat = new THREE.MeshLambertMaterial({
      color: 0x0f172a,
      transparent: true,
      opacity: 0.78
    });

    // 1. Lower Chassis (White & Emerald band)
    const lowerChassis = new THREE.Mesh(
      new THREE.BoxGeometry(busW, 1.2, busL),
      pearlWhiteMat
    );
    lowerChassis.position.y = 1.1;
    lowerChassis.castShadow = true;
    lowerChassis.receiveShadow = true;
    this.busGroup.add(lowerChassis);

    // Emerald Green side livery swoosh
    const sideBand = new THREE.Mesh(
      new THREE.BoxGeometry(busW + 0.05, 0.75, busL - 0.8),
      greenAccentMat
    );
    sideBand.position.y = 1.6;
    this.busGroup.add(sideBand);

    // Golden accent pinstripe
    const goldStripe = new THREE.Mesh(
      new THREE.BoxGeometry(busW + 0.06, 0.14, busL - 0.6),
      goldMat
    );
    goldStripe.position.y = 2.05;
    this.busGroup.add(goldStripe);

    // 2. Bus Roof & Pillars
    const roof = new THREE.Mesh(
      new THREE.BoxGeometry(busW, 0.45, busL),
      pearlWhiteMat
    );
    roof.position.y = busH - 0.1;
    roof.castShadow = true;
    this.busGroup.add(roof);

    // Roof edge aerodynamic bevel
    const roofCrown = new THREE.Mesh(
      new THREE.BoxGeometry(busW - 0.4, 0.25, busL - 1.2),
      greenAccentMat
    );
    roofCrown.position.y = busH + 0.15;
    this.busGroup.add(roofCrown);

    // 3. Panoramic Windows (Left & Right Sides)
    const windowLength = busL - 2.6;
    const windowGlass = new THREE.Mesh(
      new THREE.BoxGeometry(busW + 0.08, 1.45, windowLength),
      glassMat
    );
    windowGlass.position.y = 2.85;
    this.busGroup.add(windowGlass);

    // Front Windshield (Angled curved panoramic)
    const frontWindshield = new THREE.Mesh(
      new THREE.BoxGeometry(busW - 0.2, 1.7, 0.4),
      glassMat
    );
    frontWindshield.position.set(0, 2.75, busL / 2 + 0.05);
    frontWindshield.rotation.x = -0.16;
    this.busGroup.add(frontWindshield);

    // Rear Window
    const rearWindow = new THREE.Mesh(
      new THREE.BoxGeometry(busW - 0.4, 1.4, 0.2),
      glassMat
    );
    rearWindow.position.set(0, 2.85, -busL / 2 - 0.02);
    this.busGroup.add(rearWindow);

    // 4. Luxury Interior (Aisle, Seats, Driver Dashboard)
    this.interiorGroup = new THREE.Group();

    // Floor Carpet
    const floorAisle = new THREE.Mesh(
      new THREE.PlaneGeometry(busW - 0.4, busL - 1.5),
      carpetMat
    );
    floorAisle.rotation.x = -Math.PI / 2;
    floorAisle.position.y = 1.72;
    this.interiorGroup.add(floorAisle);

    // Passenger Seats (4 rows on Left and Right)
    for (let r = 0; r < 5; r++) {
      const zRow = busL / 2 - 3.2 - r * 1.8;
      
      // Left side seat pair
      [-0.9, 0.9].forEach((xSide) => {
        const seatBase = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.35, 0.7), seatVelvetMat);
        seatBase.position.set(xSide, 2.0, zRow);
        const seatBack = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.9, 0.2), seatBackMat);
        seatBack.position.set(xSide, 2.45, zRow - 0.3);
        const headrest = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.25, 0.15), goldMat);
        headrest.position.set(xSide, 2.95, zRow - 0.3);
        this.interiorGroup.add(seatBase, seatBack, headrest);
      });
    }

    // Driver Dashboard & Steering Wheel
    const dashboard = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.8, 0.9), darkInteriorMat);
    dashboard.position.set(-0.75, 2.2, busL / 2 - 1.0);
    const steerWheel = new THREE.Mesh(new THREE.TorusGeometry(0.25, 0.04, 8, 16), goldMat);
    steerWheel.position.set(-0.75, 2.65, busL / 2 - 1.25);
    steerWheel.rotation.x = Math.PI / 3;
    this.interiorGroup.add(dashboard, steerWheel);

    this.busGroup.add(this.interiorGroup);

    // 5. LED Destination Display (Front top)
    const ledCanvas = document.createElement('canvas');
    ledCanvas.width = 512;
    ledCanvas.height = 128;
    const ledCtx = ledCanvas.getContext('2d')!;
    ledCtx.fillStyle = '#0f172a';
    ledCtx.fillRect(0, 0, 512, 128);
    ledCtx.strokeStyle = '#22c55e';
    ledCtx.lineWidth = 6;
    ledCtx.strokeRect(6, 6, 500, 116);
    ledCtx.fillStyle = '#4ade80';
    ledCtx.textAlign = 'center';
    ledCtx.font = 'bold 36px Amiri, serif';
    ledCtx.fillText('حَافِلَة العُمْرَة • المَدِينَة ➔ مَكَّة', 256, 52);
    ledCtx.fillStyle = '#facc15';
    ledCtx.font = 'bold 28px Inter, sans-serif';
    ledCtx.fillText('BAS ZIARAH UMRAH & MIQAT', 256, 95);

    const ledTexture = new THREE.CanvasTexture(ledCanvas);
    const ledMat = new THREE.MeshBasicMaterial({ map: ledTexture });
    const ledScreen = new THREE.Mesh(new THREE.PlaneGeometry(2.8, 0.65), ledMat);
    ledScreen.position.set(0, busH + 0.05, busL / 2 + 0.06);
    this.busGroup.add(ledScreen);

    // 6. Side Livery Banners
    const sideBannerCanvas = document.createElement('canvas');
    sideBannerCanvas.width = 512;
    sideBannerCanvas.height = 128;
    const sideCtx = sideBannerCanvas.getContext('2d')!;
    sideCtx.fillStyle = '#065f46';
    sideCtx.fillRect(0, 0, 512, 128);
    sideCtx.fillStyle = '#fef08a';
    sideCtx.textAlign = 'center';
    sideCtx.font = 'bold 32px Amiri, serif';
    sideCtx.fillText('زِيَارَة المَدِينَة المُنَوَّرَة • مِيقَات بِئْر عَلِي', 256, 50);
    sideCtx.fillStyle = '#ffffff';
    sideCtx.font = 'bold 26px Inter, sans-serif';
    sideCtx.fillText('BAS ZIARAH & MIQAT BIR ALI', 256, 96);

    const sideBannerTexture = new THREE.CanvasTexture(sideBannerCanvas);
    const sideBannerMat = new THREE.MeshBasicMaterial({ map: sideBannerTexture });

    const rightBanner = new THREE.Mesh(new THREE.PlaneGeometry(6.5, 1.15), sideBannerMat);
    rightBanner.position.set(busW / 2 + 0.06, 1.8, 0);
    rightBanner.rotation.y = Math.PI / 2;
    this.busGroup.add(rightBanner);

    const leftBanner = new THREE.Mesh(new THREE.PlaneGeometry(6.5, 1.15), sideBannerMat);
    leftBanner.position.set(-busW / 2 - 0.06, 1.8, 0);
    leftBanner.rotation.y = -Math.PI / 2;
    this.busGroup.add(leftBanner);

    // 7. Passenger Door (Entrance Steps on Right Side)
    const doorMat = new THREE.MeshLambertMaterial({ color: 0x334155 });
    const door = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 2.3), doorMat);
    door.position.set(busW / 2 + 0.06, 1.8, busL / 2 - 1.8);
    door.rotation.y = Math.PI / 2;
    this.busGroup.add(door);

    // Welcome mat outside bus door
    const welcomeMat = new THREE.Mesh(
      new THREE.PlaneGeometry(1.8, 1.2),
      new THREE.MeshLambertMaterial({ color: 0x059669 })
    );
    welcomeMat.rotation.x = -Math.PI / 2;
    welcomeMat.position.set(busW / 2 + 1.2, 0.04, busL / 2 - 1.8);
    this.busGroup.add(welcomeMat);

    // Floating Holographic Door Boarding Marker [E] NAIK BAS
    this.doorMarkerGroup = new THREE.Group();
    const markerCanvas = document.createElement('canvas');
    markerCanvas.width = 256;
    markerCanvas.height = 96;
    const mCtx = markerCanvas.getContext('2d')!;
    mCtx.fillStyle = 'rgba(6, 95, 70, 0.9)';
    mCtx.fillRect(0, 0, 256, 96);
    mCtx.strokeStyle = '#facc15';
    mCtx.lineWidth = 6;
    mCtx.strokeRect(4, 4, 248, 88);
    mCtx.fillStyle = '#ffffff';
    mCtx.textAlign = 'center';
    mCtx.font = 'bold 30px sans-serif';
    mCtx.fillText('🚌 [E] NAIK BAS', 128, 48);
    mCtx.fillStyle = '#fde047';
    mCtx.font = 'bold 20px sans-serif';
    mCtx.fillText('PINTU MASUK', 128, 80);

    const markerTex = new THREE.CanvasTexture(markerCanvas);
    const markerSprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: markerTex }));
    markerSprite.scale.set(2.4, 0.9, 1);
    markerSprite.position.set(busW / 2 + 1.4, 2.4, busL / 2 - 1.8);
    this.doorMarkerGroup.add(markerSprite);
    this.busGroup.add(this.doorMarkerGroup);

    // 8. Wheels (Rubber Tires with Chrome Hubcaps)
    const wheelMat = new THREE.MeshLambertMaterial({ color: 0x1f2937 });
    const rimMat = new THREE.MeshLambertMaterial({ color: 0xd1d5db });

    const wheelConfigs = [
      // Front steerable wheels
      { x: busW / 2 + 0.05, z: busL / 2 - 2.5, isFront: true },
      { x: -busW / 2 - 0.05, z: busL / 2 - 2.5, isFront: true },
      // Rear tandem axles
      { x: busW / 2 + 0.05, z: -busL / 2 + 3.8, isFront: false },
      { x: -busW / 2 - 0.05, z: -busL / 2 + 3.8, isFront: false },
      { x: busW / 2 + 0.05, z: -busL / 2 + 2.0, isFront: false },
      { x: -busW / 2 - 0.05, z: -busL / 2 + 2.0, isFront: false }
    ];

    wheelConfigs.forEach((wc) => {
      const pivot = new THREE.Group();
      pivot.position.set(wc.x, this.wheelRadius, wc.z);

      const wheelMesh = new THREE.Group();
      const tire = new THREE.Mesh(new THREE.CylinderGeometry(this.wheelRadius, this.wheelRadius, 0.45, 16), wheelMat);
      tire.rotation.z = Math.PI / 2;
      const rim = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.42, 0.48, 16), rimMat);
      rim.rotation.z = Math.PI / 2;
      wheelMesh.add(tire, rim);
      wheelMesh.castShadow = true;
      pivot.add(wheelMesh);

      this.wheels.push(wheelMesh);
      if (wc.isFront) {
        this.frontWheelGroups.push(pivot);
      }
      this.busGroup.add(pivot);
    });

    // 9. Rooftop Air Conditioning Pods
    const acMat = new THREE.MeshLambertMaterial({ color: 0xe2e8f0 });
    const ac1 = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.45, 3.2), acMat);
    ac1.position.set(0, busH + 0.35, 1.2);
    const ac2 = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.45, 2.5), acMat);
    ac2.position.set(0, busH + 0.35, -2.8);
    this.busGroup.add(ac1, ac2);

    // 10. Headlights & Real Three.js SpotLight Beams
    const headlightMat = new THREE.MeshBasicMaterial({ color: 0xfef08a });
    [-1.2, 1.2].forEach((xOff) => {
      const hl = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.1, 12), headlightMat);
      hl.rotation.x = Math.PI / 2;
      hl.position.set(xOff, 1.2, busL / 2 + 0.05);
      this.busGroup.add(hl);

      const spot = new THREE.SpotLight(0xfffbeb, 1.8, 45, Math.PI / 5, 0.4, 1.2);
      spot.position.set(xOff, 1.2, busL / 2 + 0.3);
      const targetObj = new THREE.Object3D();
      targetObj.position.set(xOff * 0.5, 0, busL / 2 + 25);
      this.busGroup.add(spot, targetObj);
      spot.target = targetObj;
    });

    // Rear Taillights
    const taillightMat = new THREE.MeshBasicMaterial({ color: 0xef4444 });
    const tl1 = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.35, 0.1), taillightMat);
    tl1.position.set(-1.2, 1.4, -busL / 2 - 0.05);
    const tl2 = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.35, 0.1), taillightMat);
    tl2.position.set(1.2, 1.4, -busL / 2 - 0.05);
    this.busGroup.add(tl1, tl2);
  }

  /**
   * Sync group position & rotation with physics variables
   */
  public updateTransform() {
    this.busGroup.position.copy(this.position);
    this.busGroup.rotation.y = this.rotationY;
  }

  /**
   * Main bus physics update loop
   */
  public update(delta: number, inputForward: number = 0, inputSteer: number = 0, avatar?: AvatarModel) {
    // 1. Automatic Cruise Mode to Ziarah Destination
    if (this.isAutoCruising && this.cruiseTarget) {
      this.handleAutoCruise(delta);
    } else if (this.isPlayerInside) {
      // 2. Manual Player Driving Mode
      this.handleManualDrive(delta, inputForward, inputSteer);
    } else {
      // 3. Idle Friction Deceleration when unoperated
      if (Math.abs(this.speed) > 0.05) {
        this.speed -= Math.sign(this.speed) * this.friction * delta;
      } else {
        this.speed = 0;
      }
      this.steerAngle *= Math.max(0, 1 - delta * 4);
    }

    // 4. Update Position from Heading and Speed
    if (Math.abs(this.speed) > 0.001) {
      const moveDistance = this.speed * delta;
      const dx = Math.sin(this.rotationY) * moveDistance;
      const dz = Math.cos(this.rotationY) * moveDistance;

      const newX = this.position.x + dx;
      const newZ = this.position.z + dz;

      // Obstacle boundary check for bus (prevent driving off into the void, mountains, or inside Nabawi sacred pedestrian area)
      const isInsideNabawiPedestrian = newX > -138 && newZ > -3 && newZ < 25;
      if (!isInsideNabawiPedestrian && newX > -185 && newX < -98 && newZ > -90 && newZ < 90) {
        this.position.x = newX;
        this.position.z = newZ;
      } else {
        this.speed = 0; // bump stop at bounds or pedestrian zone barrier
      }

      // Rotate Wheels around wheel axle as bus travels
      const wheelDeltaAngle = moveDistance / this.wheelRadius;
      for (const w of this.wheels) {
        w.rotation.x += wheelDeltaAngle;
      }

      // Engine sound loop pitch adjustment
      this.engineSoundTimer += delta;
      if (this.engineSoundTimer > 2.5 && Math.abs(this.speed) > 1.5) {
        this.engineSoundTimer = 0;
        soundManager.playBusDepartureSound();
      }
    }

    // 5. Update Front Wheel Steering Angles
    for (const fw of this.frontWheelGroups) {
      fw.rotation.y = this.steerAngle;
    }

    // 6. Update 3D bus mesh transform
    this.updateTransform();

    // 7. Update Avatar position if player is inside the bus
    if (this.isPlayerInside && avatar) {
      // Position seated avatar inside the bus relative to bus world position & rotation
      const seatedWorldPos = this.passengerSeatPos.clone()
        .applyAxisAngle(new THREE.Vector3(0, 1, 0), this.rotationY)
        .add(this.position);

      avatar.group.position.copy(seatedWorldPos);
      avatar.group.rotation.y = this.rotationY;
      avatar.update(delta, false); // seated idle animation
    }

    // Pulse door marker if player is outside
    if (!this.isPlayerInside && this.doorMarkerGroup) {
      this.doorMarkerGroup.visible = true;
      const pulse = 1.0 + Math.sin(Date.now() * 0.005) * 0.1;
      this.doorMarkerGroup.scale.set(pulse, pulse, pulse);
    } else if (this.doorMarkerGroup) {
      this.doorMarkerGroup.visible = false;
    }
  }

  /**
   * Handle Manual Driving Controls
   */
  private handleManualDrive(delta: number, inputForward: number, inputSteer: number) {
    // Acceleration & Braking
    if (inputForward > 0.05) {
      // Accelerate forward
      if (this.speed < this.maxForwardSpeed) {
        this.speed += this.acceleration * inputForward * delta;
      }
    } else if (inputForward < -0.05) {
      // Reverse or Brake
      if (this.speed > 0.5) {
        this.speed -= this.brakingDecel * delta; // strong braking
      } else if (this.speed > this.maxReverseSpeed) {
        this.speed -= this.acceleration * 0.6 * delta; // reverse
      }
    } else {
      // Natural rolling friction
      if (Math.abs(this.speed) > 0.05) {
        this.speed -= Math.sign(this.speed) * this.friction * delta;
      } else {
        this.speed = 0;
      }
    }

    // Steering
    const targetSteer = -inputSteer * this.maxSteerAngle;
    this.steerAngle += (targetSteer - this.steerAngle) * Math.min(delta * this.steerSpeed * 2.5, 1.0);

    // Apply rotation only when moving
    if (Math.abs(this.speed) > 0.1) {
      const turnMultiplier = this.speed >= 0 ? 1 : -1;
      const turnRate = (this.steerAngle / this.busLength) * this.speed * turnMultiplier;
      this.rotationY += turnRate * delta * 1.8;
    }
  }

  /**
   * Handle Smooth Auto-Cruising to Destination Waypoints along Paved Road Network
   */
  private handleAutoCruise(delta: number) {
    if (!this.cruiseTarget) return;

    const dx = this.cruiseTarget.x - this.position.x;
    const dz = this.cruiseTarget.z - this.position.z;
    const distToTarget = Math.hypot(dx, dz);

    // If more waypoints exist in queue, transition to next waypoint smoothly upon approaching
    if (this.waypointsQueue.length > 0 && distToTarget < 5.0) {
      const nextWp = this.waypointsQueue.shift()!;
      this.cruiseTarget = new THREE.Vector3(nextWp.x, 0, nextWp.z);
      this.cruiseTargetHeading = nextWp.rotation !== undefined ? nextWp.rotation : null;
      return;
    }

    // Final destination arrival detection: decelerate when entering destination proximity
    if (this.waypointsQueue.length === 0 && (distToTarget < 3.2 || (distToTarget < 5.0 && this.speed < 2.0))) {
      this.speed = Math.max(0, this.speed - this.brakingDecel * delta * 2.0);
      if (this.speed < 0.6 || distToTarget < 1.8) {
        // Confirmed arrival at parking bay
        this.speed = 0;
        this.isAutoCruising = false;
        this.position.set(this.cruiseTarget.x, 0, this.cruiseTarget.z);
        if (this.cruiseTargetHeading !== null) {
          this.rotationY = this.cruiseTargetHeading;
        }
        this.steerAngle = 0;
        this.updateTransform();
        soundManager.playBusDepartureSound();
        const cb = this.onCruiseArrived;
        this.cruiseTarget = null;
        this.onCruiseArrived = undefined;
        cb?.();
        return;
      }
    }

    // Calculate desired heading angle towards target
    const targetAngle = Math.atan2(dx, dz);
    let angleDiff = targetAngle - this.rotationY;
    while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
    while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;

    // Smoothly turn towards target
    const targetSteer = Math.max(-this.maxSteerAngle, Math.min(this.maxSteerAngle, angleDiff * 1.5));
    this.steerAngle += (targetSteer - this.steerAngle) * Math.min(delta * 3.0, 1.0);

    // Accelerate smoothly, decelerate when approaching final target
    const desiredSpeed = distToTarget > 15 ? this.maxForwardSpeed * 0.85 : Math.max(2.5, (distToTarget / 15) * 8.0);
    if (this.speed < desiredSpeed) {
      this.speed += this.acceleration * delta;
    } else {
      this.speed -= this.friction * delta;
    }

    // Turn bus
    const turnRate = (this.steerAngle / this.busLength) * this.speed;
    this.rotationY += turnRate * delta * 1.8;
  }

  /**
   * Order the bus to cruise automatically along road network waypoints to a destination
   */
  public cruiseTo(targetX: number, targetZ: number, targetRot?: number, destinationName?: string, onArrived?: () => void) {
    let finalX = targetX;
    let finalZ = targetZ;
    let finalRot = targetRot;

    // Safety check: Buses NEVER enter the pedestrian sacred zone of Masjid Nabawi / Madinah
    if (targetX > -138 && targetZ > -3 && targetZ < 25) {
      finalX = -135;
      finalZ = -8;
      finalRot = -Math.PI / 2;
      destinationName = 'Terminal Bas Ziarah Madinah (Pejalan Kaki Sahaja)';
    }

    this.waypointsQueue = [];

    // If the bus is currently off the central highway spine (x = -140),
    // first return to highway corridor at current Z
    if (Math.abs(this.position.x - (-140)) > 3.5) {
      this.waypointsQueue.push({ x: -140, z: this.position.z });
    }

    // Follow highway spine along Z to the destination's latitude
    if (Math.abs(this.position.z - finalZ) > 4.5) {
      this.waypointsQueue.push({ x: -140, z: finalZ });
    }

    // Branch off from highway into the destination parking bay
    this.waypointsQueue.push({
      x: finalX,
      z: finalZ,
      rotation: finalRot,
      label: destinationName
    });

    const firstWp = this.waypointsQueue.shift()!;
    this.isAutoCruising = true;
    this.cruiseTarget = new THREE.Vector3(firstWp.x, 0, firstWp.z);
    this.cruiseTargetHeading = firstWp.rotation !== undefined ? firstWp.rotation : null;
    if (destinationName) {
      this.currentDestinationName = destinationName;
    }
    this.onCruiseArrived = onArrived;
    soundManager.playBusDepartureSound();
  }

  /**
   * Check if player on foot is colliding with the bus (Oriented Bounding Box test)
   */
  public checkPlayerCollision(px: number, pz: number, playerRadius: number = 0.5): boolean {
    const dx = px - this.position.x;
    const dz = pz - this.position.z;

    // Rotate point into Bus local coordinate frame
    const cos = Math.cos(-this.rotationY);
    const sin = Math.sin(-this.rotationY);
    const localX = dx * cos - dz * sin;
    const localZ = dx * sin + dz * cos;

    const halfW = this.busWidth / 2 + playerRadius;
    const halfL = this.busLength / 2 + playerRadius;

    return Math.abs(localX) < halfW && Math.abs(localZ) < halfL;
  }

  /**
   * Check if player on foot is near the passenger entrance door
   */
  public isNearDoor(px: number, pz: number): boolean {
    const dx = px - this.position.x;
    const dz = pz - this.position.z;

    const cos = Math.cos(-this.rotationY);
    const sin = Math.sin(-this.rotationY);
    const localX = dx * cos - dz * sin;
    const localZ = dx * sin + dz * cos;

    // Door is at right side: localX ~ +1.8 to +3.6, localZ ~ +3.2 to +6.5
    const doorX = this.busWidth / 2 + 1.2;
    const doorZ = this.busLength / 2 - 1.8;

    const distToDoor = Math.hypot(localX - doorX, localZ - doorZ);
    return distToDoor < 3.8;
  }

  /**
   * Board the bus
   */
  public board(avatar?: AvatarModel) {
    this.isPlayerInside = true;
    if (avatar) {
      const seatedWorldPos = this.passengerSeatPos.clone()
        .applyAxisAngle(new THREE.Vector3(0, 1, 0), this.rotationY)
        .add(this.position);
      avatar.group.position.copy(seatedWorldPos);
      avatar.group.rotation.y = this.rotationY;
    }
    soundManager.playBusDepartureSound();
    if (this.doorMarkerGroup) {
      this.doorMarkerGroup.visible = false;
    }
  }

  /**
   * Disembark from the bus
   */
  public disembark(avatar: AvatarModel) {
    this.isPlayerInside = false;
    this.speed = 0;
    this.isAutoCruising = false;

    // Place avatar outside passenger door on the welcome mat
    const exitOffset = new THREE.Vector3(this.busWidth / 2 + 1.5, 0, this.busLength / 2 - 1.8);
    exitOffset.applyAxisAngle(new THREE.Vector3(0, 1, 0), this.rotationY);

    const exitPos = this.position.clone().add(exitOffset);
    avatar.group.position.set(exitPos.x, 0, exitPos.z);
    avatar.group.rotation.y = this.rotationY + Math.PI / 2; // Facing away from door

    soundManager.playBusDepartureSound();
    if (this.doorMarkerGroup) {
      this.doorMarkerGroup.visible = true;
    }
  }

  /**
   * Teleport the bus to a specific roadside bay
   */
  public teleportBus(x: number, z: number, rot: number = 0) {
    this.position.set(x, 0, z);
    this.rotationY = rot;
    this.speed = 0;
    this.isAutoCruising = false;
    this.updateTransform();
  }
}
