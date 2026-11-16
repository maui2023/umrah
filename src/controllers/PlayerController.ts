import * as THREE from 'three';
import { AvatarModel } from '../characters/AvatarModel';

export class PlayerController {
  public avatar: AvatarModel;
  public camera: THREE.PerspectiveCamera;
  private domElement: HTMLElement;

  // Movement State
  private keys: Record<string, boolean> = {};
  public isMoving: boolean = false;
  public isSprinting: boolean = false;
  private walkSpeed: number = 4.2; // meters/sec
  private sprintSpeed: number = 7.5; // meters/sec

  // Camera Orbit
  private cameraDistance: number = 5.5;
  private cameraHeight: number = 2.8;
  private cameraYaw: number = 0; // horizontal angle
  private cameraPitch: number = 0.28; // vertical angle
  private isPointerDown: boolean = false;
  private activePointerId: number | null = null;
  private previousPointerPosition = { x: 0, y: 0 };

  // Virtual Joystick (Mobile)
  private joystickActive: boolean = false;
  private joystickVector = new THREE.Vector2(0, 0);

  constructor(avatar: AvatarModel, camera: THREE.PerspectiveCamera, domElement: HTMLElement) {
    this.avatar = avatar;
    this.camera = camera;
    this.domElement = domElement;

    this.setupKeyboardListeners();
    this.setupPointerListeners();
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
    this.domElement.addEventListener('pointerdown', (e) => {
      // Ignore if clicking on UI interactive elements or secondary pointers
      if ((e.target as HTMLElement).closest('.interactive-ui') || this.activePointerId !== null) return;

      this.isPointerDown = true;
      this.activePointerId = e.pointerId;
      this.previousPointerPosition = { x: e.clientX, y: e.clientY };
    });

    window.addEventListener('pointermove', (e) => {
      if (!this.isPointerDown || e.pointerId !== this.activePointerId) return;

      const deltaX = e.clientX - this.previousPointerPosition.x;
      const deltaY = e.clientY - this.previousPointerPosition.y;

      this.cameraYaw -= deltaX * 0.0055;
      this.cameraPitch = Math.max(0.05, Math.min(Math.PI / 2.3, this.cameraPitch + deltaY * 0.0035));

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
    this.domElement.addEventListener('wheel', (e) => {
      e.preventDefault();
      this.cameraDistance = Math.max(2.5, Math.min(12.0, this.cameraDistance + e.deltaY * 0.005));
    }, { passive: false });
  }

  public setJoystickVector(x: number, y: number) {
    this.joystickVector.set(x, y);
    this.joystickActive = x !== 0 || y !== 0;
  }

  public setSprinting(sprint: boolean) {
    this.isSprinting = sprint;
  }

  public update(delta: number) {
    // 1. Gather Direction Input
    let moveForward = 0;
    let moveRight = 0;

    if (this.keys['KeyW'] || this.keys['ArrowUp']) moveForward += 1;
    if (this.keys['KeyS'] || this.keys['ArrowDown']) moveForward -= 1;
    if (this.keys['KeyA'] || this.keys['ArrowLeft']) moveRight -= 1;
    if (this.keys['KeyD'] || this.keys['ArrowRight']) moveRight += 1;

    // Joystick input integration
    if (this.joystickActive) {
      moveRight += this.joystickVector.x;
      moveForward -= this.joystickVector.y;
    }

    const isSprintKey = this.keys['ShiftLeft'] || this.keys['ShiftRight'] || this.isSprinting;
    const currentSpeed = isSprintKey ? this.sprintSpeed : this.walkSpeed;

    const inputVector = new THREE.Vector2(moveRight, moveForward);
    const inputLength = inputVector.length();

    if (inputLength > 0.05) {
      this.isMoving = true;
      inputVector.normalize();

      // Direction relative to camera yaw
      const moveAngle = Math.atan2(inputVector.x, inputVector.y) + this.cameraYaw;
      const dx = Math.sin(moveAngle) * currentSpeed * delta;
      const dz = Math.cos(moveAngle) * currentSpeed * delta;

      const newX = this.avatar.group.position.x + dx;
      const newZ = this.avatar.group.position.z + dz;

      // Collision Check with Kaabah Box
      const kaabahHalfWidth = 6.0;
      const kaabahHalfDepth = 6.8;
      const insideKaabahX = Math.abs(newX) < kaabahHalfWidth;
      const insideKaabahZ = Math.abs(newZ) < kaabahHalfDepth;

      if (!(insideKaabahX && insideKaabahZ)) {
        // Safe: apply movement
        this.avatar.group.position.x = newX;
        this.avatar.group.position.z = newZ;
      }

      // Smooth avatar rotation towards movement direction
      let diff = moveAngle - this.avatar.group.rotation.y;
      while (diff < -Math.PI) diff += Math.PI * 2;
      while (diff > Math.PI) diff -= Math.PI * 2;
      this.avatar.group.rotation.y += diff * Math.min(delta * 14, 1.0);

      this.avatar.update(delta, true, isSprintKey ? 1.5 : 1.0);
    } else {
      this.isMoving = false;
      this.avatar.update(delta, false);
    }

    // 2. Camera Third-Person Orbit Follow
    const playerPos = this.avatar.group.position;
    const camOffset = new THREE.Vector3(
      Math.sin(this.cameraYaw) * Math.cos(this.cameraPitch) * this.cameraDistance,
      Math.sin(this.cameraPitch) * this.cameraDistance + this.cameraHeight,
      Math.cos(this.cameraYaw) * Math.cos(this.cameraPitch) * this.cameraDistance
    );

    const targetCameraPos = playerPos.clone().add(camOffset);
    this.camera.position.lerp(targetCameraPos, Math.min(delta * 12, 1.0));

    // Look at player chest height
    const lookTarget = playerPos.clone().add(new THREE.Vector3(0, 1.5, 0));
    this.camera.lookAt(lookTarget);
  }

  public teleport(x: number, z: number, rotation: number = 0) {
    this.avatar.group.position.set(x, 0, z);
    this.avatar.group.rotation.y = rotation;
    this.cameraYaw = rotation;
  }
}
