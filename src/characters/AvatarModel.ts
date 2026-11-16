import * as THREE from 'three';
import { Gender, PlayerRole } from '../types';

export class AvatarModel {
  public group: THREE.Group;
  public gender: Gender;
  public role: PlayerRole;
  public name: string;
  public groupColor: string;
  public groupName: string;

  // Body parts for procedural animation
  private head: THREE.Group;
  private torso: THREE.Group;
  private leftArm: THREE.Group;
  private rightArm: THREE.Group;
  private leftLeg: THREE.Group;
  private rightLeg: THREE.Group;
  private overheadSprite: THREE.Sprite;
  private groundRing: THREE.Mesh;
  private animTimer: number = Math.random() * 10;
  private spriteCanvas: HTMLCanvasElement;
  private spriteContext: CanvasRenderingContext2D;
  private spriteTexture: THREE.CanvasTexture;

  // For remote interpolation
  public targetPosition = new THREE.Vector3();
  public targetRotation = 0;
  public isMoving = false;

  constructor(data: {
    name: string;
    gender: Gender;
    role: PlayerRole;
    groupColor: string;
    groupName: string;
    currentLap?: number;
    showOverheadTag?: boolean;
  }) {
    this.name = data.name;
    this.gender = data.gender;
    this.role = data.role;
    this.groupColor = data.groupColor || '#10B981';
    this.groupName = data.groupName || 'Solo';

    this.group = new THREE.Group();

    // High quality modern materials
    // Warm natural skin tone (as seen in user screenshot)
    const skinMat = new THREE.MeshLambertMaterial({ color: 0xdfab81 });
    // Pure clean ihram white cloth
    const whiteClothMat = new THREE.MeshLambertMaterial({ color: 0xfcfcfc });
    const whiteClothShadeMat = new THREE.MeshLambertMaterial({ color: 0xedebe8 });
    // Jet black natural hair
    const hairMat = new THREE.MeshLambertMaterial({ color: 0x1a1512 });
    // Sandal brown leather
    const sandalMat = new THREE.MeshLambertMaterial({ color: 0x3d2b1f });

    // 1. Torso Group
    this.torso = new THREE.Group();
    this.torso.position.y = this.gender === 'male' ? 1.05 : 0.85;

    if (this.gender === 'male') {
      // Male Pilgrim (Modern Stylized Ihram: Rida' draped over torso with bare right shoulder & upper back)
      // Core chest base (slight taper from chest to waist)
      const chestGeo = new THREE.CylinderGeometry(0.24, 0.20, 0.42, 16);
      const chestMesh = new THREE.Mesh(chestGeo, skinMat);
      chestMesh.castShadow = true;
      this.torso.add(chestMesh);

      // Bare right shoulder sphere & deltoid
      const rightShoulder = new THREE.Mesh(new THREE.SphereGeometry(0.12, 14, 14), skinMat);
      rightShoulder.position.set(0.25, 0.16, 0);
      rightShoulder.castShadow = true;
      this.torso.add(rightShoulder);

      // Upper back skin section
      const backSkin = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.32, 0.12), skinMat);
      backSkin.position.set(0.12, 0.08, -0.09);
      this.torso.add(backSkin);

      // White Ihram Rida' - Diagonal Drape across chest & back (Idtiba' sunnah)
      // Left shoulder cloth mantle (rounded & draped)
      const leftShoulderDrape = new THREE.Mesh(
        new THREE.CylinderGeometry(0.16, 0.18, 0.26, 14),
        whiteClothMat
      );
      leftShoulderDrape.position.set(-0.24, 0.15, 0);
      leftShoulderDrape.rotation.z = 0.15;
      leftShoulderDrape.castShadow = true;
      this.torso.add(leftShoulderDrape);

      // Main diagonal fold wrapping from under right armpit across chest to over left shoulder
      const chestDrape = new THREE.Mesh(
        new THREE.CylinderGeometry(0.26, 0.23, 0.38, 16, 1, false, 0, Math.PI * 1.55),
        whiteClothMat
      );
      chestDrape.position.set(-0.04, 0.02, 0.02);
      chestDrape.rotation.y = 0.3;
      chestDrape.castShadow = true;
      this.torso.add(chestDrape);

      // Back fold drape
      const backDrape = new THREE.Mesh(
        new THREE.BoxGeometry(0.32, 0.36, 0.14),
        whiteClothShadeMat
      );
      backDrape.position.set(-0.08, 0.04, -0.08);
      backDrape.rotation.z = -0.12;
      this.torso.add(backDrape);

      // Ihram waist wrap band / fold (Hizam)
      const waistFold = new THREE.Mesh(
        new THREE.CylinderGeometry(0.22, 0.23, 0.12, 16),
        whiteClothMat
      );
      waistFold.position.y = -0.19;
      this.torso.add(waistFold);

    } else {
      // Female Pilgrim: Modest, elegant flowing white Abaya/Jubah
      const dressBody = new THREE.Mesh(
        new THREE.CylinderGeometry(0.24, 0.46, 1.15, 16),
        whiteClothMat
      );
      dressBody.castShadow = true;
      this.torso.add(dressBody);
    }
    this.group.add(this.torso);

    // 2. Head Group & Hair / Hijab
    this.head = new THREE.Group();
    this.head.position.y = this.gender === 'male' ? 1.54 : 1.50;

    // Neck
    const neck = new THREE.Mesh(
      new THREE.CylinderGeometry(0.08, 0.09, 0.14, 12),
      skinMat
    );
    neck.position.y = -0.14;
    this.head.add(neck);

    // Head Cranium & Face (Smooth rounded shape)
    const headCranium = new THREE.Mesh(
      new THREE.SphereGeometry(0.16, 16, 16),
      skinMat
    );
    headCranium.castShadow = true;
    this.head.add(headCranium);

    // Subtle jaw / chin
    const jaw = new THREE.Mesh(
      new THREE.CylinderGeometry(0.12, 0.08, 0.12, 12),
      skinMat
    );
    jaw.position.set(0, -0.08, 0.04);
    this.head.add(jaw);

    if (this.gender === 'male') {
      // Modern short neatly trimmed hair (matches screenshot)
      const hairCrown = new THREE.Mesh(
        new THREE.SphereGeometry(0.165, 16, 14, 0, Math.PI * 2, 0, Math.PI * 0.58),
        hairMat
      );
      hairCrown.position.set(0, 0.02, -0.01);
      this.head.add(hairCrown);

      // Back of head hairline
      const hairBack = new THREE.Mesh(
        new THREE.BoxGeometry(0.26, 0.14, 0.12),
        hairMat
      );
      hairBack.position.set(0, 0.01, -0.11);
      this.head.add(hairBack);
    } else {
      // Female Hijab / Khimar: Modest, draped pure white covering
      const hijabCrown = new THREE.Mesh(
        new THREE.SphereGeometry(0.18, 16, 14),
        whiteClothMat
      );
      this.head.add(hijabCrown);

      const hijabDrape = new THREE.Mesh(
        new THREE.CylinderGeometry(0.20, 0.44, 0.48, 16),
        whiteClothMat
      );
      hijabDrape.position.y = -0.25;
      this.head.add(hijabDrape);
    }
    this.group.add(this.head);

    // 3. Arms (Articulated shoulder pivot)
    this.leftArm = new THREE.Group();
    this.rightArm = new THREE.Group();

    // Left Arm (Wrapped in white cloth on top, skin forearm)
    const leftArmShoulderY = 1.32;
    this.leftArm.position.set(-0.32, leftArmShoulderY, 0);

    const leftUpperArm = new THREE.Mesh(
      new THREE.CylinderGeometry(0.07, 0.065, 0.28, 12),
      whiteClothMat
    );
    leftUpperArm.position.y = -0.12;
    leftUpperArm.castShadow = true;
    this.leftArm.add(leftUpperArm);

    const leftForearm = new THREE.Mesh(
      new THREE.CylinderGeometry(0.06, 0.05, 0.26, 12),
      skinMat
    );
    leftForearm.position.y = -0.34;
    leftForearm.castShadow = true;
    this.leftArm.add(leftForearm);

    const leftHand = new THREE.Mesh(
      new THREE.SphereGeometry(0.05, 10, 10),
      skinMat
    );
    leftHand.position.y = -0.48;
    this.leftArm.add(leftHand);
    this.group.add(this.leftArm);

    // Right Arm (Skin shoulder & upper arm for male idtiba', white cloth for female)
    const rightArmShoulderY = 1.32;
    this.rightArm.position.set(0.32, rightArmShoulderY, 0);

    const rightUpperArm = new THREE.Mesh(
      new THREE.CylinderGeometry(0.07, 0.065, 0.28, 12),
      this.gender === 'male' ? skinMat : whiteClothMat
    );
    rightUpperArm.position.y = -0.12;
    rightUpperArm.castShadow = true;
    this.rightArm.add(rightUpperArm);

    const rightForearm = new THREE.Mesh(
      new THREE.CylinderGeometry(0.06, 0.05, 0.26, 12),
      skinMat
    );
    rightForearm.position.y = -0.34;
    rightForearm.castShadow = true;
    this.rightArm.add(rightForearm);

    const rightHand = new THREE.Mesh(
      new THREE.SphereGeometry(0.05, 10, 10),
      skinMat
    );
    rightHand.position.y = -0.48;
    this.rightArm.add(rightHand);
    this.group.add(this.rightArm);

    // 4. Legs & Lower Ihram Garment (Izar)
    this.leftLeg = new THREE.Group();
    this.rightLeg = new THREE.Group();

    const legPivotY = 0.74;
    this.leftLeg.position.set(-0.13, legPivotY, 0);
    this.rightLeg.position.set(0.13, legPivotY, 0);

    // Left Leg: Upper Izar drape + lower calf + sandal
    const leftIzar = new THREE.Mesh(
      new THREE.CylinderGeometry(0.12, 0.14, 0.42, 12),
      whiteClothMat
    );
    leftIzar.position.y = -0.18;
    leftIzar.castShadow = true;
    this.leftLeg.add(leftIzar);

    const leftCalf = new THREE.Mesh(
      new THREE.CylinderGeometry(0.065, 0.055, 0.32, 10),
      skinMat
    );
    leftCalf.position.y = -0.48;
    leftCalf.castShadow = true;
    this.leftLeg.add(leftCalf);

    const leftSandal = new THREE.Mesh(
      new THREE.BoxGeometry(0.14, 0.06, 0.24),
      sandalMat
    );
    leftSandal.position.set(0, -0.68, 0.04);
    leftSandal.castShadow = true;
    this.leftLeg.add(leftSandal);
    this.group.add(this.leftLeg);

    // Right Leg: Upper Izar drape + lower calf + sandal
    const rightIzar = new THREE.Mesh(
      new THREE.CylinderGeometry(0.12, 0.14, 0.42, 12),
      whiteClothMat
    );
    rightIzar.position.y = -0.18;
    rightIzar.castShadow = true;
    this.rightLeg.add(rightIzar);

    const rightCalf = new THREE.Mesh(
      new THREE.CylinderGeometry(0.065, 0.055, 0.32, 10),
      skinMat
    );
    rightCalf.position.y = -0.48;
    rightCalf.castShadow = true;
    this.rightLeg.add(rightCalf);

    const rightSandal = new THREE.Mesh(
      new THREE.BoxGeometry(0.14, 0.06, 0.24),
      sandalMat
    );
    rightSandal.position.set(0, -0.68, 0.04);
    rightSandal.castShadow = true;
    this.rightLeg.add(rightSandal);
    this.group.add(this.rightLeg);

    // 5. Subtle Shadow / Ground Halo Ring
    const ringGeo = new THREE.RingGeometry(0.38, 0.52, 28);
    const ringMat = new THREE.MeshBasicMaterial({
      color: new THREE.Color(this.groupColor),
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.35
    });
    this.groundRing = new THREE.Mesh(ringGeo, ringMat);
    this.groundRing.rotation.x = -Math.PI / 2;
    this.groundRing.position.y = 0.02;
    this.group.add(this.groundRing);

    // 6. Overhead Floating Name Tag
    // For local player in third-person mode, keep it hidden by default (clean view as in screenshot),
    // but available for remote players or when explicitly enabled
    this.spriteCanvas = document.createElement('canvas');
    this.spriteCanvas.width = 512;
    this.spriteCanvas.height = 192;
    this.spriteContext = this.spriteCanvas.getContext('2d')!;

    this.spriteTexture = new THREE.CanvasTexture(this.spriteCanvas);
    this.spriteTexture.minFilter = THREE.LinearFilter;

    const spriteMat = new THREE.SpriteMaterial({
      map: this.spriteTexture,
      transparent: true,
      depthTest: true,
      depthWrite: false
    });

    this.overheadSprite = new THREE.Sprite(spriteMat);
    this.overheadSprite.scale.set(1.6, 0.6, 1);
    this.overheadSprite.position.set(0, 2.30, 0);
    this.overheadSprite.visible = data.showOverheadTag ?? false;
    this.group.add(this.overheadSprite);

    this.updateNameTag(this.name, this.groupName, this.groupColor, this.role, data.currentLap || 1);
  }

  public setOverheadTagVisible(visible: boolean) {
    this.overheadSprite.visible = visible;
  }

  /**
   * Redraw the billboard name tag texture
   */
  public updateNameTag(
    name: string,
    groupName: string,
    groupColor: string,
    role: PlayerRole,
    lap: number = 1
  ) {
    this.name = name;
    this.groupName = groupName;
    this.groupColor = groupColor;
    this.role = role;

    (this.groundRing.material as THREE.MeshBasicMaterial).color.set(groupColor);

    const ctx = this.spriteContext;
    ctx.clearRect(0, 0, 512, 192);

    const radius = 24;
    ctx.fillStyle = 'rgba(15, 23, 42, 0.88)';
    ctx.strokeStyle = groupColor;
    ctx.lineWidth = 6;

    ctx.beginPath();
    ctx.roundRect(16, 16, 480, 160, radius);
    ctx.fill();
    ctx.stroke();

    const isLeader = role === 'mutawwif';
    ctx.font = 'bold 36px "Segoe UI", Arial, sans-serif';
    ctx.fillStyle = '#FFFFFF';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const displayName = isLeader ? `🚩 ${name}` : name;
    const nameY = isLeader ? 55 : 68;
    ctx.fillText(displayName, 256, nameY);

    ctx.font = 'bold 24px "Segoe UI", Arial, sans-serif';
    ctx.fillStyle = groupColor;
    const badgeText = `[ ${groupName} ]  •  Pusingan ${lap}`;
    const badgeY = isLeader ? 104 : 118;
    ctx.fillText(badgeText, 256, badgeY);

    if (isLeader) {
      ctx.font = 'bold 18px "Segoe UI", Arial, sans-serif';
      ctx.fillStyle = '#FBBF24';
      ctx.fillText('★ KETUA ROMBONGAN / MUTAWWIF ★', 256, 145);
    }

    this.spriteTexture.needsUpdate = true;
  }

  /**
   * Procedural animation loop (walking, swinging limbs, breathing)
   */
  public update(delta: number, isMoving: boolean, speedMultiplier: number = 1.0) {
    this.animTimer += delta * (isMoving ? 8 * speedMultiplier : 1.8);

    if (isMoving) {
      // Natural walking / running limb swings
      const legAngle = Math.sin(this.animTimer) * 0.62;
      const armAngle = -Math.sin(this.animTimer) * 0.62;

      this.leftLeg.rotation.x = legAngle;
      this.rightLeg.rotation.x = -legAngle;

      this.leftArm.rotation.x = armAngle;
      this.rightArm.rotation.x = -armAngle;

      // Natural vertical bobbing
      const baseTorsoY = this.gender === 'male' ? 1.05 : 0.85;
      const baseHeadY = this.gender === 'male' ? 1.54 : 1.50;
      const bob = Math.abs(Math.sin(this.animTimer * 2)) * 0.04;
      this.torso.position.y = baseTorsoY + bob;
      this.head.position.y = baseHeadY + bob;
    } else {
      // Idle gentle breathing
      const breath = Math.sin(this.animTimer) * 0.015;
      this.leftLeg.rotation.x = 0;
      this.rightLeg.rotation.x = 0;
      this.leftArm.rotation.x = 0.05 + breath;
      this.rightArm.rotation.x = 0.05 + breath;

      const baseTorsoY = this.gender === 'male' ? 1.05 : 0.85;
      const baseHeadY = this.gender === 'male' ? 1.54 : 1.50;
      this.torso.position.y = baseTorsoY + breath;
      this.head.position.y = baseHeadY + breath;
    }
  }

  public interpolate(delta: number) {
    const lerpFactor = Math.min(delta * 12, 1.0);
    this.group.position.lerp(this.targetPosition, lerpFactor);

    let diff = this.targetRotation - this.group.rotation.y;
    while (diff < -Math.PI) diff += Math.PI * 2;
    while (diff > Math.PI) diff -= Math.PI * 2;
    this.group.rotation.y += diff * lerpFactor;

    this.update(delta, this.isMoving);
  }

  public dispose() {
    this.spriteTexture.dispose();
    this.group.traverse((obj) => {
      if (obj instanceof THREE.Mesh) {
        obj.geometry.dispose();
        if (Array.isArray(obj.material)) {
          obj.material.forEach((m) => m.dispose());
        } else {
          obj.material.dispose();
        }
      }
    });
  }
}
