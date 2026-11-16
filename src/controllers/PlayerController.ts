import * as THREE from 'three';
import { AvatarModel } from '../characters/AvatarModel';

export class PlayerController {
  public avatar: AvatarModel;
  public camera: THREE.PerspectiveCamera;
  public domElement: HTMLElement;

  // Movement State
  private keys: Record<string, boolean> = {};
  public isMoving: boolean = false;
  public isSprinting: boolean = false;
  private walkSpeed: number = 4.2; // meters/sec
  private sprintSpeed: number = 7.5; // meters/sec

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

  constructor(avatar: AvatarModel, camera: THREE.PerspectiveCamera, domElement: HTMLElement, initialYaw: number = 0) {
    this.avatar = avatar;
    this.camera = camera;
    this.domElement = domElement;
    this.cameraYaw = initialYaw;

    this.setupKeyboardListeners();
    this.setupPointerListeners();
    this.snapCamera();
  }

  private setupKeyboardListeners() {
    window.addEventListener('keydown', (e) => {
      this.keys[e.code] = true;
    });

    window.addEventListener('keyup', (e) => {
      this.keys[e.code] = false;
    });
  }

  private setupPointerListeners() {
    // Pointer down: works for mouse click or single-finger touch on 3D viewport
    window.addEventListener('pointerdown', (e) => {
      // Ignore if clicking on UI interactive elements, touch joystick, buttons, or secondary pointers
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

      // Natural third-person camera rotation (PUBG style):
      // Dragging right rotates view right; dragging left rotates view left.
      this.cameraYaw += deltaX * 0.005;
      // Dragging down tilts view down; dragging up tilts view up.
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
      this.cameraDistance = Math.max(2.0, Math.min(12.0, this.cameraDistance + e.deltaY * 0.005));
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
          this.cameraDistance = Math.max(2.0, Math.min(12.0, initialCameraDist * factor));
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

  /**
   * Instantly snap camera behind player (used on initialization and teleport)
   */
  public snapCamera() {
    const playerPos = this.avatar.group.position;
    const horizontalDist = this.cameraDistance * Math.cos(this.cameraPitch);
    const verticalDist = this.cameraDistance * Math.sin(this.cameraPitch);

    const camOffset = new THREE.Vector3(
      -Math.sin(this.cameraYaw) * horizontalDist,
      verticalDist + this.cameraHeight,
      -Math.cos(this.cameraYaw) * horizontalDist
    );

    this.camera.position.copy(playerPos).add(camOffset);
    this.camera.lookAt(playerPos.clone().add(new THREE.Vector3(0, 1.4, 0)));
  }

  public update(delta: number) {
    // 1. Gather Direction Input
    let inputForward = 0;
    let inputRight = 0;

    // Keyboard controls (WASD & Arrow keys)
    if (this.keys['KeyW'] || this.keys['ArrowUp']) inputForward += 1;
    if (this.keys['KeyS'] || this.keys['ArrowDown']) inputForward -= 1;
    if (this.keys['KeyA'] || this.keys['ArrowLeft']) inputRight -= 1;
    if (this.keys['KeyD'] || this.keys['ArrowRight']) inputRight += 1;

    // Virtual Joystick input (Mobile touch / screen stick)
    // When pushing stick UP, joystickVector.y is negative, so -joystickVector.y gives positive forward
    if (this.joystickActive) {
      inputRight += this.joystickVector.x;
      inputForward += -this.joystickVector.y;
    }

    const inputLen = Math.hypot(inputRight, inputForward);
    const isSprintKey = this.keys['ShiftLeft'] || this.keys['ShiftRight'] || this.isSprinting;
    const baseSpeed = isSprintKey ? this.sprintSpeed : this.walkSpeed;

    if (inputLen > 0.05) {
      this.isMoving = true;

      // Speed proportional to analog joystick displacement (clamped to 1.0)
      const currentSpeed = baseSpeed * Math.min(inputLen, 1.0);

      // Normalized local input components
      const normRight = inputRight / inputLen;
      const normForward = inputForward / inputLen;

      // Camera view horizontal vectors:
      // camForward: direction camera is facing horizontally
      // camRight: horizontal vector pointing 90 degrees to camera's right
      const camForward = new THREE.Vector3(
        Math.sin(this.cameraYaw),
        0,
        Math.cos(this.cameraYaw)
      );
      const camRight = new THREE.Vector3(
        Math.cos(this.cameraYaw),
        0,
        -Math.sin(this.cameraYaw)
      );

      // Desired movement direction in world coordinates
      const moveDir = new THREE.Vector3()
        .addScaledVector(camForward, normForward)
        .addScaledVector(camRight, normRight)
        .normalize();

      const dx = moveDir.x * currentSpeed * delta;
      const dz = moveDir.z * currentSpeed * delta;

      const newX = this.avatar.group.position.x + dx;
      const newZ = this.avatar.group.position.z + dz;

      // Collision Check with Kaabah Box with wall sliding
      const kaabahHalfWidth = 6.0;
      const kaabahHalfDepth = 6.8;
      const currentZ = this.avatar.group.position.z;

      // Slide along Z if X collides
      if (!(Math.abs(newX) < kaabahHalfWidth && Math.abs(currentZ) < kaabahHalfDepth)) {
        this.avatar.group.position.x = newX;
      }
      // Slide along X if Z collides
      if (!(Math.abs(this.avatar.group.position.x) < kaabahHalfWidth && Math.abs(newZ) < kaabahHalfDepth)) {
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

    // 2. Camera Third-Person Orbit Follow (Behind the player)
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

    // Look at player chest/shoulder height
    const lookTarget = playerPos.clone().add(new THREE.Vector3(0, 1.4, 0));
    this.camera.lookAt(lookTarget);
  }

  public teleport(x: number, z: number, rotation: number = 0) {
    this.avatar.group.position.set(x, 0, z);
    this.avatar.group.rotation.y = rotation;
    this.cameraYaw = rotation;
    this.snapCamera();
  }
}
