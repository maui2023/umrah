import * as THREE from 'three';
import { AvatarModel } from '../characters/AvatarModel';
import { BusController } from './BusController';

export class PlayerController {
  public avatar: AvatarModel;
  public camera: THREE.PerspectiveCamera;
  public domElement: HTMLElement;
  public busController: BusController | null = null;

  // Movement State
  private keys: Record<string, boolean> = {};
  public isMoving: boolean = false;
  public isSprinting: boolean = false;
  public isRaml: boolean = false;
  private walkSpeed: number = 4.2; // meters/sec
  private ramlSpeed: number = 5.8; // meters/sec (jogging / lari anak)
  private sprintSpeed: number = 7.5; // meters/sec

  // Bus Riding State
  public isInBus: boolean = false;
  private wasNearDoor: boolean = false;

  // Camera Orbit
  private cameraDistance: number = 4.8;
  private cameraHeight: number = 2.2;
  private cameraYaw: number = 0; // horizontal angle
  private cameraPitch: number = 0.22; // vertical angle
  private isPointerDown: boolean = false;
  private activePointerId: number | null = null;
  private previousPointerPosition = { x: 0, y: 0 };

  // Virtual Joystick (Mobile)
  private joystickActive: boolean = false;
  private joystickVector = new THREE.Vector2(0, 0);

  // Callbacks
  public onNearDoorStateChange?: (isNear: boolean) => void;
  public onBusBoardStateChange?: (inBus: boolean) => void;
  public onBusSpeedChange?: (speedKmh: number, isCruising: boolean) => void;
  public onInteractiveKeyPress?: () => void;

  constructor(
    avatar: AvatarModel,
    camera: THREE.PerspectiveCamera,
    domElement: HTMLElement,
    initialYaw: number = 0,
    busController: BusController | null = null
  ) {
    this.avatar = avatar;
    this.camera = camera;
    this.domElement = domElement;
    this.cameraYaw = initialYaw;
    this.busController = busController;

    this.setupKeyboardListeners();
    this.setupPointerListeners();
    this.snapCamera();
  }

  public setBusController(busController: BusController) {
    this.busController = busController;
  }

  private setupKeyboardListeners() {
    window.addEventListener('keydown', (e) => {
      this.keys[e.code] = true;

      // 'KeyE' interactive key for entering mosques or boarding / exiting the bus
      if (e.code === 'KeyE') {
        if (this.onInteractiveKeyPress) {
          this.onInteractiveKeyPress();
        } else {
          this.toggleBusBoarding();
        }
      }
    });

    window.addEventListener('keyup', (e) => {
      this.keys[e.code] = false;
    });
  }

  private setupPointerListeners() {
    window.addEventListener('pointerdown', (e) => {
      const target = e.target as HTMLElement;
      if (
        target.closest('.interactive-ui') ||
        target.closest('#touch-joystick-zone') ||
        target.closest('#btn-mobile-sprint') ||
        (target !== this.domElement && target.closest('#umrah-hud-overlay')) ||
        this.activePointerId !== null
      ) {
        return;
      }

      this.isPointerDown = true;
      this.activePointerId = e.pointerId;
      this.previousPointerPosition = { x: e.clientX, y: e.clientY };
    });

    window.addEventListener('pointermove', (e) => {
      if (!this.isPointerDown || e.pointerId !== this.activePointerId) return;

      const deltaX = e.clientX - this.previousPointerPosition.x;
      const deltaY = e.clientY - this.previousPointerPosition.y;

      // Natural third-person camera rotation:
      // Dragging right rotates view to the right; dragging left rotates view to the left.
      this.cameraYaw -= deltaX * 0.005;
      this.cameraPitch = Math.max(0.06, Math.min(Math.PI / 2.3, this.cameraPitch + deltaY * 0.0035));

      this.previousPointerPosition = { x: e.clientX, y: e.clientY };
    });

    const releasePointer = (e: PointerEvent) => {
      if (e.pointerId === this.activePointerId) {
        this.isPointerDown = false;
        this.activePointerId = null;
      }
    };

    window.addEventListener('pointerup', releasePointer);
    window.addEventListener('pointercancel', releasePointer);

    // Mouse wheel zoom
    window.addEventListener('wheel', (e) => {
      if ((e.target as HTMLElement).closest('.interactive-ui') || (e.target as HTMLElement).closest('#umrah-hud-overlay')) return;
      const minDist = this.isInBus ? 5.0 : 2.0;
      const maxDist = this.isInBus ? 22.0 : 12.0;
      this.cameraDistance = Math.max(minDist, Math.min(maxDist, this.cameraDistance + e.deltaY * 0.005));
    }, { passive: true });

    // Touch pinch-to-zoom for mobile screens
    let initialPinchDistance: number | null = null;
    let initialCameraDist: number = this.cameraDistance;

    window.addEventListener('touchstart', (e) => {
      if (e.touches.length === 2) {
        const t1 = e.touches[0];
        const t2 = e.touches[1];
        if ((t1.target as HTMLElement).closest('.interactive-ui') || (t2.target as HTMLElement).closest('.interactive-ui')) return;
        initialPinchDistance = Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY);
        initialCameraDist = this.cameraDistance;
      }
    }, { passive: true });

    window.addEventListener('touchmove', (e) => {
      if (e.touches.length === 2 && initialPinchDistance !== null) {
        const t1 = e.touches[0];
        const t2 = e.touches[1];
        const currentDist = Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY);
        if (currentDist > 0) {
          const factor = initialPinchDistance / currentDist;
          const minDist = this.isInBus ? 5.0 : 2.0;
          const maxDist = this.isInBus ? 22.0 : 12.0;
          this.cameraDistance = Math.max(minDist, Math.min(maxDist, initialCameraDist * factor));
        }
      }
    }, { passive: true });

    const endPinch = (e: TouchEvent) => {
      if (e.touches.length < 2) {
        initialPinchDistance = null;
      }
    };
    window.addEventListener('touchend', endPinch, { passive: true });
    window.addEventListener('touchcancel', endPinch, { passive: true });
  }

  public setJoystickVector(x: number, y: number) {
    this.joystickVector.set(x, y);
    this.joystickActive = x !== 0 || y !== 0;
  }

  public setSprinting(sprint: boolean) {
    this.isSprinting = sprint;
  }

  public setRaml(active: boolean) {
    this.isRaml = active;
    this.avatar.setRaml(active);
  }

  /**
   * Toggle between boarding and disembarking the bus
   */
  public toggleBusBoarding() {
    if (this.isInBus) {
      this.exitBus();
    } else if (this.busController) {
      const pos = this.avatar.group.position;
      if (this.busController.isNearDoor(pos.x, pos.z)) {
        this.boardBus();
      }
    }
  }

  /**
   * Board the bus
   */
  public boardBus() {
    if (!this.busController) return;
    this.isInBus = true;
    this.busController.board(this.avatar);
    this.cameraDistance = 13.0; // wider vehicle camera
    this.cameraHeight = 4.2;
    this.cameraPitch = 0.28;
    this.onBusBoardStateChange?.(true);
  }

  /**
   * Exit the bus
   */
  public exitBus() {
    if (!this.busController) return;
    this.isInBus = false;
    this.busController.disembark(this.avatar);
    this.cameraDistance = 4.8;
    this.cameraHeight = 2.2;
    this.cameraPitch = 0.22;
    this.cameraYaw = this.avatar.group.rotation.y;
    this.snapCamera();
    this.onBusBoardStateChange?.(false);
  }

  /**
   * Comprehensive World & Mosque Collision Detection
   * Prevents clipping through walls, colonnades, buildings, mountains, and the bus!
   */
  public checkCollision(x: number, z: number): boolean {
    // 1. Bus Collision (when walking on foot outside the bus)
    if (!this.isInBus && this.busController) {
      if (this.busController.checkPlayerCollision(x, z, 0.45)) {
        return true;
      }
    }

    // 2. Kaabah Bounding Box (Kaabah size is 11m x 12.5m)
    const kaabahHalfWidth = 6.2;
    const kaabahHalfDepth = 7.0;
    if (Math.abs(x) < kaabahHalfWidth && Math.abs(z) < kaabahHalfDepth) {
      return true;
    }

    // 3. Hijr Ismail Semicircular Marble Hateem Wall
    // Arc center (0, -6.6), radius ~6.2, tube thickness ~0.8. Semicircle for z < -6.6
    if (z < -6.4) {
      const distToHijrCenter = Math.hypot(x, z - (-6.6));
      if (distToHijrCenter > 5.4 && distToHijrCenter < 7.0) {
        return true;
      }
    }

    // 4. Maqam Ibrahim Enclosure (x: 13, z: 3.5, radius: 1.8)
    if (Math.hypot(x - 13, z - 3.5) < 1.8) {
      return true;
    }

    // 5. Zamzam Kiosks Station (x: 38, z: 8, radius: 2.6)
    if (Math.hypot(x - 38, z - 8) < 2.6) {
      return true;
    }

    // 6. Mas'a Gallery Boundary Walls & Hill Summit Balustrades
    // Mas'a extends from Z = -52 to +52, center X = 65, width = 14 (X from ~58 to 72)
    if (x > 56 && x < 74) {
      // East outer wall of Mas'a
      if (x > 71.4) return true;
      // West wall of Mas'a (with grand opening corridor to Mataf at Z between -2 and +9)
      if (x < 58.6 && !(z >= -2 && z <= 9)) return true;
      // North summit protective balustrade behind Bukit Marwah
      if (z < -48.0) return true;
      // South summit protective balustrade behind Bukit Safa
      if (z > 48.0) return true;
    }

    // 7. Masjidil Haram Colonnade & Perimeter Walls (Radius ~54-58m from Kaabah center)
    if (x > -80) {
      const distFromCenter = Math.hypot(x, z);
      if (distFromCenter > 54.0 && distFromCenter < 58.0) {
        // Grand opening corridor connecting Mataf to Mas'a on the East
        const isMasaOpening = x > 38 && Math.abs(z) < 11;
        // Pintu Masuk Utama Bab Abdul Aziz (South)
        const isBabAbdulAziz = Math.abs(x) < 4.8 && z > 51.5;
        // Bab Umrah (North-West)
        const isNorthWestGate = Math.abs(x) < 4.8 && z < -51.5;
        if (!isMasaOpening && !isBabAbdulAziz && !isNorthWestGate) {
          return true;
        }
      }
      // Corner Minarets
      const minarets = [
        { x: -75, z: -75 },
        { x: -75, z: 75 },
        { x: 85, z: -75 },
        { x: 85, z: 75 }
      ];
      for (const m of minarets) {
        if (Math.hypot(x - m.x, z - m.z) < 3.2) return true;
      }
    }

    // 8. Madinah Zone Colliders (X < -90)
    if (x < -90) {
      // Masjid Quba Accessible Building with Open South Doorway (x: -117.5 to -112.5)
      // Center (-115, -35), outer boundary x: [-123.5, -106.5], z: [-43.5, -26.5]
      if (Math.abs(x - (-115)) < 8.6 && Math.abs(z - (-35)) < 8.6) {
        // North wall
        if (z < -42.2) return true;
        // East wall
        if (x > -107.5) return true;
        // West wall
        if (x < -122.5) return true;
        // South wall (leave entrance doorway open between -117.5 and -112.5)
        if (z > -27.5 && (x < -117.5 || x > -112.5)) return true;
        // Inside prayer hall: free to walk!
      }

      // Makam 70 Shuhada Uhud Enclosure Wall: center (-162, -47), width 14 (half 7.2), depth 10 (half 5.2)
      if (Math.abs(x - (-162)) < 7.4 && Math.abs(z - (-47)) < 5.4) {
        return true;
      }

      // Jabal Uhud Steep Mountain Range Barrier
      if (z < -56 && x < -148) {
        return true;
      }

      // Masjid Bir Ali Minaret Base: at (-167, 22), half width 2.5
      if (Math.abs(x - (-167)) < 2.5 && Math.abs(z - 22) < 2.5) {
        return true;
      }

      // Masjid Bir Ali Back Colonnade Wall: (-155, 24..28)
      if (Math.abs(x - (-155)) < 13.5 && Math.abs(z - 24) < 1.4) {
        return true;
      }

      // Date Palm Tree Trunks (solid obstacles)
      const palms = [
        { x: -128, z: -48 }, { x: -134, z: -52 }, { x: -122, z: -44 },
        { x: -130, z: -40 }, { x: -138, z: -46 }, { x: -125, z: -55 },
        { x: -142, z: -38 }, { x: -118, z: -50 }
      ];
      for (const p of palms) {
        if (Math.hypot(x - p.x, z - p.z) < 0.75) return true;
      }

      // Highway Overhead Gantry Poles
      if (Math.hypot(x - (-148), z - 10) < 0.6 || Math.hypot(x - (-132), z - 10) < 0.6) {
        return true;
      }
    }

    // 9. World Out-of-Bounds Outer Boundaries
    if (x < -195 || x > 108 || z < -95 || z > 95) {
      return true;
    }

    return false;
  }

  /**
   * Instantly snap camera behind player or bus
   */
  public snapCamera() {
    const focusPos = this.isInBus && this.busController
      ? this.busController.position
      : this.avatar.group.position;

    const horizontalDist = this.cameraDistance * Math.cos(this.cameraPitch);
    const verticalDist = this.cameraDistance * Math.sin(this.cameraPitch);

    const camOffset = new THREE.Vector3(
      -Math.sin(this.cameraYaw) * horizontalDist,
      verticalDist + this.cameraHeight,
      -Math.cos(this.cameraYaw) * horizontalDist
    );

    this.camera.position.copy(focusPos).add(camOffset);
    const lookTarget = focusPos.clone().add(new THREE.Vector3(0, this.isInBus ? 2.2 : 1.4, 0));
    this.camera.lookAt(lookTarget);
  }

  public update(delta: number) {
    // 1. Gather Input
    let inputForward = 0;
    let inputRight = 0;

    if (this.keys['KeyW'] || this.keys['ArrowUp']) inputForward += 1;
    if (this.keys['KeyS'] || this.keys['ArrowDown']) inputForward -= 1;
    if (this.keys['KeyA'] || this.keys['ArrowLeft']) inputRight -= 1;
    if (this.keys['KeyD'] || this.keys['ArrowRight']) inputRight += 1;

    if (this.joystickActive) {
      inputRight += this.joystickVector.x;
      inputForward += -this.joystickVector.y;
    }

    // 2. BUS MODE OR ON-FOOT MODE
    if (this.isInBus && this.busController) {
      // Drive the bus!
      this.isMoving = Math.abs(this.busController.speed) > 0.1;
      this.busController.update(delta, inputForward, inputRight, this.avatar);

      // Report bus speed to HUD
      const speedKmh = Math.round(Math.abs(this.busController.speed) * 3.6);
      this.onBusSpeedChange?.(speedKmh, this.busController.isAutoCruising);

      // Camera Third-Person Chase Orbit behind the bus
      const busPos = this.busController.position;
      const horizontalDist = this.cameraDistance * Math.cos(this.cameraPitch);
      const verticalDist = this.cameraDistance * Math.sin(this.cameraPitch);

      const camOffset = new THREE.Vector3(
        -Math.sin(this.cameraYaw) * horizontalDist,
        verticalDist + this.cameraHeight,
        -Math.cos(this.cameraYaw) * horizontalDist
      );

      const targetCameraPos = busPos.clone().add(camOffset);
      this.camera.position.lerp(targetCameraPos, Math.min(delta * 12, 1.0));
      this.camera.lookAt(busPos.clone().add(new THREE.Vector3(0, 2.2, 0)));
      return;
    }

    // 3. ON-FOOT WALKING MODE WITH FULL WALL & BUS SLIDING COLLISION
    const inputLen = Math.hypot(inputRight, inputForward);
    const isSprintKey = this.keys['ShiftLeft'] || this.keys['ShiftRight'] || this.isSprinting;
    const baseSpeed = isSprintKey ? this.sprintSpeed : (this.isRaml ? this.ramlSpeed : this.walkSpeed);

    if (inputLen > 0.05) {
      this.isMoving = true;
      const currentSpeed = baseSpeed * Math.min(inputLen, 1.0);

      const normRight = inputRight / inputLen;
      const normForward = inputForward / inputLen;

      const camForward = new THREE.Vector3(
        Math.sin(this.cameraYaw),
        0,
        Math.cos(this.cameraYaw)
      );
      // camRight: horizontal vector pointing to the screen's right side
      const camRight = new THREE.Vector3(
        -Math.cos(this.cameraYaw),
        0,
        Math.sin(this.cameraYaw)
      );

      const moveDir = new THREE.Vector3()
        .addScaledVector(camForward, normForward)
        .addScaledVector(camRight, normRight)
        .normalize();

      const dx = moveDir.x * currentSpeed * delta;
      const dz = moveDir.z * currentSpeed * delta;

      const currentX = this.avatar.group.position.x;
      const currentZ = this.avatar.group.position.z;
      const newX = currentX + dx;
      const newZ = currentZ + dz;

      // Wall Sliding Physics: slide along Z if X collides, slide along X if Z collides
      if (!this.checkCollision(newX, currentZ)) {
        this.avatar.group.position.x = newX;
      }
      if (!this.checkCollision(this.avatar.group.position.x, newZ)) {
        this.avatar.group.position.z = newZ;
      }

      // Smooth avatar rotation towards movement direction (PUBG style)
      const targetRotation = Math.atan2(moveDir.x, moveDir.z);
      let diff = targetRotation - this.avatar.group.rotation.y;
      while (diff < -Math.PI) diff += Math.PI * 2;
      while (diff > Math.PI) diff -= Math.PI * 2;
      this.avatar.group.rotation.y += diff * Math.min(delta * 16, 1.0);

      this.avatar.update(delta, true, isSprintKey ? 1.5 : 1.0);
    } else {
      this.isMoving = false;
      this.avatar.update(delta, false);
    }

    // Check proximity to bus entrance door
    if (this.busController) {
      const pos = this.avatar.group.position;
      const isNear = this.busController.isNearDoor(pos.x, pos.z);
      if (isNear !== this.wasNearDoor) {
        this.wasNearDoor = isNear;
        this.onNearDoorStateChange?.(isNear);
      }
    }

    // Dynamic Terrain & Hill Elevation Physics ("Sa'i panjat bukit")
    // Ensures pilgrim ascends Safa & Marwah smoothly up to 1.8m atop the hill, never clipping inside
    if (!this.isInBus) {
      const targetY = this.getWorldElevation(
        this.avatar.group.position.x,
        this.avatar.group.position.z
      );
      this.avatar.group.position.y = THREE.MathUtils.lerp(
        this.avatar.group.position.y,
        targetY,
        Math.min(delta * 22, 1.0)
      );
    }

    // Camera Third-Person Orbit Follow (Behind player)
    const playerPos = this.avatar.group.position;
    const horizontalDist = this.cameraDistance * Math.cos(this.cameraPitch);
    const verticalDist = this.cameraDistance * Math.sin(this.cameraPitch);

    const camOffset = new THREE.Vector3(
      -Math.sin(this.cameraYaw) * horizontalDist,
      verticalDist + this.cameraHeight,
      -Math.cos(this.cameraYaw) * horizontalDist
    );

    const targetCameraPos = playerPos.clone().add(camOffset);
    this.camera.position.lerp(targetCameraPos, Math.min(delta * 14, 1.0));
    this.camera.lookAt(playerPos.clone().add(new THREE.Vector3(0, 1.4, 0)));
  }

  /**
   * Calculate precise 3D terrain elevation for walking and climbing.
   * Enables realistic ascent/descent of Bukit Safa and Bukit Marwah ("panjat bukit").
   */
  public getWorldElevation(x: number, z: number): number {
    // Mas'a gallery is located between X: 57.5 and X: 72.5
    if (x >= 57.5 && x <= 72.5) {
      // 1. Bukit Safa Incline & Summit (z from 32 to 48.5)
      if (z >= 32) {
        if (z >= 44) {
          // Elevated Summit Viewing & Du'a Plateau
          return Math.min(1.8 + (z - 44) * 0.02, 1.9);
        }
        // Smoothstep ramp ascent from z = 32 (y = 0) to z = 44 (y = 1.8)
        const t = (z - 32) / 12;
        const smoothT = t * t * (3 - 2 * t);
        return smoothT * 1.8;
      }

      // 2. Bukit Marwah Incline & Summit (z from -32 to -48.5)
      if (z <= -32) {
        if (z <= -44) {
          // Elevated Summit Viewing & Du'a Plateau
          return Math.min(1.8 + (-44 - z) * 0.02, 1.9);
        }
        // Smoothstep ramp ascent from z = -32 (y = 0) to z = -44 (y = 1.8)
        const t = (-32 - z) / 12;
        const smoothT = t * t * (3 - 2 * t);
        return smoothT * 1.8;
      }
    }

    // Default flat ground level across Mataf, Mosque Plaza & Madinah
    return 0;
  }

  public teleport(x: number, z: number, rotation: number = 0) {
    if (this.isInBus) {
      this.exitBus();
    }
    const y = this.getWorldElevation(x, z);
    this.avatar.group.position.set(x, y, z);
    this.avatar.group.rotation.y = rotation;
    this.cameraYaw = rotation;
    this.snapCamera();
  }
}
