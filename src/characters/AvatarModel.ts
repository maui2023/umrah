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

    // High quality modern materials based on screenshot reference
    // Warm natural middle-eastern / south-east asian tanned skin tone
    const skinMat = new THREE.MeshStandardMaterial({
      color: 0xc68e68,
      roughness: 0.65,
      metalness: 0.05
    });

    // Pure clean ihram white cloth with fabric-like matte roughness
    const whiteClothMat = new THREE.MeshStandardMaterial({
      color: 0xfdfdfd,
      roughness: 0.85,
      metalness: 0.02
    });

    // Shadowed / inner folds cloth material
    const whiteClothShadeMat = new THREE.MeshStandardMaterial({
      color: 0xdedcd7,
      roughness: 0.9,
      metalness: 0.02
    });

    // Fringed edge / hem texture material
    const fringeMat = new THREE.MeshStandardMaterial({
      color: 0xede9e3,
      roughness: 0.95,
      metalness: 0.0
    });

    // Natural hair and trim beard (short dark curly hair & neat short beard)
    const hairMat = new THREE.MeshStandardMaterial({
      color: 0x1f1916,
      roughness: 0.9,
      metalness: 0.1
    });

    // Flip-flop sandals matching screenshot (pinkish/coral sole, turquoise/sky-blue strap)
    const soleMat = new THREE.MeshStandardMaterial({
      color: 0xd98880,
      roughness: 0.6,
      metalness: 0.05
    });
    const strapMat = new THREE.MeshStandardMaterial({
      color: 0x4fa3b8,
      roughness: 0.4,
      metalness: 0.1
    });

    // 1. Torso Group
    this.torso = new THREE.Group();
    this.torso.position.y = this.gender === 'male' ? 1.05 : 0.85;

    if (this.gender === 'male') {
      // Male Pilgrim matching exact image:
      // In the reference image, the pilgrim has the Rida' (shawl) draped over BOTH shoulders like a cape/mantle
      // with a loose cowled hood/collar at the back of the neck, wrapping downwards over the arms and torso.
      
      // Upper anatomical chest/spine core
      const chestGeo = new THREE.CylinderGeometry(0.24, 0.20, 0.44, 16);
      const chestMesh = new THREE.Mesh(chestGeo, skinMat);
      chestMesh.castShadow = true;
      this.torso.add(chestMesh);

      // --- Upper Shawl / Cape (Rida') ---
      // Flowing upper mantle covering both shoulders and back (as seen from front & back in image)
      const mantleGeo = new THREE.CylinderGeometry(0.32, 0.44, 0.65, 20, 1, true);
      const mantle = new THREE.Mesh(mantleGeo, whiteClothMat);
      mantle.position.set(0, 0.08, 0);
      mantle.castShadow = true;
      mantle.receiveShadow = true;
      this.torso.add(mantle);

      // Folded back cowl / hood fold resting across upper back and neck (distinctive feature in back view)
      const cowlGeo = new THREE.TorusGeometry(0.22, 0.065, 10, 24, Math.PI * 1.3);
      const cowl = new THREE.Mesh(cowlGeo, whiteClothShadeMat);
      cowl.position.set(0, 0.28, -0.10);
      cowl.rotation.x = Math.PI / 3;
      cowl.rotation.z = Math.PI;
      cowl.castShadow = true;
      this.torso.add(cowl);

      // Back hanging fold drapery
      const backDrape = new THREE.Mesh(
        new THREE.CylinderGeometry(0.28, 0.42, 0.55, 14, 1, true, -Math.PI * 0.45, Math.PI * 0.9),
        whiteClothShadeMat
      );
      backDrape.position.set(0, 0.02, -0.04);
      backDrape.castShadow = true;
      this.torso.add(backDrape);

      // Front overlap drape with fringed diagonal seam
      const frontOverlap = new THREE.Mesh(
        new THREE.CylinderGeometry(0.33, 0.42, 0.58, 16, 1, false, -Math.PI * 0.2, Math.PI * 0.75),
        whiteClothMat
      );
      frontOverlap.position.set(-0.02, 0.06, 0.02);
      frontOverlap.rotation.z = -0.05;
      frontOverlap.castShadow = true;
      this.torso.add(frontOverlap);

      // Fringed edge trim on the shawl border (kain ihram berambu)
      const fringeUpper = new THREE.Mesh(
        new THREE.CylinderGeometry(0.335, 0.43, 0.04, 16, 1, true, -Math.PI * 0.2, Math.PI * 0.75),
        fringeMat
      );
      fringeUpper.position.set(-0.02, -0.22, 0.02);
      this.torso.add(fringeUpper);

      // Lower wrap / Izar upper section (skirt wrap around waist & hips)
      const izarTop = new THREE.Mesh(
        new THREE.CylinderGeometry(0.25, 0.28, 0.38, 18),
        whiteClothMat
      );
      izarTop.position.set(0, -0.26, 0);
      izarTop.castShadow = true;
      this.torso.add(izarTop);

      // Vertical wrapped overlap fold down the front
      const frontWrapFold = new THREE.Mesh(
        new THREE.BoxGeometry(0.09, 0.40, 0.06),
        whiteClothShadeMat
      );
      frontWrapFold.position.set(-0.08, -0.26, 0.24);
      frontWrapFold.rotation.y = -0.2;
      this.torso.add(frontWrapFold);

      // Fringed border on vertical wrap fold
      const frontFringe = new THREE.Mesh(
        new THREE.BoxGeometry(0.015, 0.38, 0.07),
        fringeMat
      );
      frontFringe.position.set(-0.13, -0.26, 0.24);
      this.torso.add(frontFringe);

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

    // 2. Head Group & Facial Details (Hair & Beard matching reference)
    this.head = new THREE.Group();
    this.head.position.y = this.gender === 'male' ? 1.54 : 1.50;

    // Neck
    const neck = new THREE.Mesh(
      new THREE.CylinderGeometry(0.075, 0.09, 0.15, 14),
      skinMat
    );
    neck.position.y = -0.13;
    neck.castShadow = true;
    this.head.add(neck);

    // Head Cranium & Face
    const headCranium = new THREE.Mesh(
      new THREE.SphereGeometry(0.155, 18, 16),
      skinMat
    );
    headCranium.castShadow = true;
    this.head.add(headCranium);

    // Jaw / Chin
    const jaw = new THREE.Mesh(
      new THREE.CylinderGeometry(0.11, 0.08, 0.12, 14),
      skinMat
    );
    jaw.position.set(0, -0.075, 0.035);
    this.head.add(jaw);

    // Nose
    const nose = new THREE.Mesh(
      new THREE.ConeGeometry(0.032, 0.07, 6),
      skinMat
    );
    nose.position.set(0, -0.02, 0.17);
    nose.rotation.x = Math.PI / 2;
    this.head.add(nose);

    // Eyes
    const eyeMat = new THREE.MeshBasicMaterial({ color: 0x1f1f1f });
    const eyeGeo = new THREE.SphereGeometry(0.02, 8, 8);
    const leftEye = new THREE.Mesh(eyeGeo, eyeMat);
    leftEye.position.set(-0.05, 0.02, 0.145);
    this.head.add(leftEye);
    const rightEye = new THREE.Mesh(eyeGeo, eyeMat);
    rightEye.position.set(0.05, 0.02, 0.145);
    this.head.add(rightEye);

    // Ears
    const earGeo = new THREE.SphereGeometry(0.035, 8, 8);
    const leftEar = new THREE.Mesh(earGeo, skinMat);
    leftEar.position.set(-0.15, 0, 0);
    leftEar.scale.set(0.5, 1, 0.6);
    this.head.add(leftEar);
    const rightEar = new THREE.Mesh(earGeo, skinMat);
    rightEar.position.set(0.15, 0, 0);
    rightEar.scale.set(0.5, 1, 0.6);
    this.head.add(rightEar);

    if (this.gender === 'male') {
      // Textured short dark hair crown
      const hairCrown = new THREE.Mesh(
        new THREE.SphereGeometry(0.162, 18, 16, 0, Math.PI * 2, 0, Math.PI * 0.58),
        hairMat
      );
      hairCrown.position.set(0, 0.015, -0.005);
      this.head.add(hairCrown);

      // Hair back and sideburns
      const hairBack = new THREE.Mesh(
        new THREE.BoxGeometry(0.25, 0.16, 0.12),
        hairMat
      );
      hairBack.position.set(0, 0.01, -0.10);
      this.head.add(hairBack);

      // Short neat trimmed beard along jawline & chin (as in user screenshot)
      const beardJaw = new THREE.Mesh(
        new THREE.CylinderGeometry(0.115, 0.085, 0.10, 14, 1, true, -Math.PI * 0.75, Math.PI * 1.5),
        hairMat
      );
      beardJaw.position.set(0, -0.08, 0.04);
      this.head.add(beardJaw);

      // Chin goatee / beard tuft
      const chinBeard = new THREE.Mesh(
        new THREE.SphereGeometry(0.05, 10, 10),
        hairMat
      );
      chinBeard.position.set(0, -0.13, 0.08);
      chinBeard.scale.set(1.2, 0.8, 1);
      this.head.add(chinBeard);
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

    // 3. Arms (Pivot at shoulders)
    this.leftArm = new THREE.Group();
    this.rightArm = new THREE.Group();

    const armShoulderY = 1.30;
    this.leftArm.position.set(-0.31, armShoulderY, 0);
    this.rightArm.position.set(0.31, armShoulderY, 0);

    // In the reference image, the cloth rests loosely over upper arms/shoulders,
    // and bare forearms/hands extend downwards naturally along the body sides
    const leftUpperArm = new THREE.Mesh(
      new THREE.CylinderGeometry(0.065, 0.06, 0.28, 12),
      this.gender === 'male' ? whiteClothMat : whiteClothMat
    );
    leftUpperArm.position.y = -0.12;
    leftUpperArm.castShadow = true;
    this.leftArm.add(leftUpperArm);

    const leftForearm = new THREE.Mesh(
      new THREE.CylinderGeometry(0.058, 0.048, 0.27, 12),
      skinMat
    );
    leftForearm.position.y = -0.34;
    leftForearm.castShadow = true;
    this.leftArm.add(leftForearm);

    const leftHand = new THREE.Mesh(
      new THREE.BoxGeometry(0.045, 0.10, 0.08),
      skinMat
    );
    leftHand.position.set(0, -0.50, 0);
    leftHand.castShadow = true;
    this.leftArm.add(leftHand);
    this.group.add(this.leftArm);

    // Right Arm
    const rightUpperArm = new THREE.Mesh(
      new THREE.CylinderGeometry(0.065, 0.06, 0.28, 12),
      this.gender === 'male' ? whiteClothMat : whiteClothMat
    );
    rightUpperArm.position.y = -0.12;
    rightUpperArm.castShadow = true;
    this.rightArm.add(rightUpperArm);

    const rightForearm = new THREE.Mesh(
      new THREE.CylinderGeometry(0.058, 0.048, 0.27, 12),
      skinMat
    );
    rightForearm.position.y = -0.34;
    rightForearm.castShadow = true;
    this.rightArm.add(rightForearm);

    const rightHand = new THREE.Mesh(
      new THREE.BoxGeometry(0.045, 0.10, 0.08),
      skinMat
    );
    rightHand.position.set(0, -0.50, 0);
    rightHand.castShadow = true;
    this.rightArm.add(rightHand);
    this.group.add(this.rightArm);

    // 4. Legs & Flowing Lower Ihram Garment (Izar) + Coral/Blue Flip-flops
    this.leftLeg = new THREE.Group();
    this.rightLeg = new THREE.Group();

    const legPivotY = 0.72;
    this.leftLeg.position.set(-0.12, legPivotY, 0);
    this.rightLeg.position.set(0.12, legPivotY, 0);

    // Left Leg: Long draping izar reaching down to lower calf (as in reference image)
    const leftIzar = new THREE.Mesh(
      new THREE.CylinderGeometry(0.15, 0.17, 0.54, 14),
      whiteClothMat
    );
    leftIzar.position.y = -0.22;
    leftIzar.castShadow = true;
    this.leftLeg.add(leftIzar);

    // Lower Izar hem fringe
    const leftIzarFringe = new THREE.Mesh(
      new THREE.CylinderGeometry(0.171, 0.175, 0.04, 14),
      fringeMat
    );
    leftIzarFringe.position.y = -0.47;
    this.leftLeg.add(leftIzarFringe);

    // Exposed lower calf and ankle
    const leftCalf = new THREE.Mesh(
      new THREE.CylinderGeometry(0.06, 0.05, 0.24, 12),
      skinMat
    );
    leftCalf.position.y = -0.54;
    leftCalf.castShadow = true;
    this.leftLeg.add(leftCalf);

    // Foot
    const leftFoot = new THREE.Mesh(
      new THREE.BoxGeometry(0.08, 0.05, 0.16),
      skinMat
    );
    leftFoot.position.set(0, -0.66, 0.04);
    leftFoot.castShadow = true;
    this.leftLeg.add(leftFoot);

    // Realistic Flip-flop sandal (coral pink sole + sky blue straps)
    const leftSandalSole = new THREE.Mesh(
      new THREE.BoxGeometry(0.11, 0.025, 0.22),
      soleMat
    );
    leftSandalSole.position.set(0, -0.69, 0.04);
    leftSandalSole.castShadow = true;
    this.leftLeg.add(leftSandalSole);

    const leftStrap1 = new THREE.Mesh(
      new THREE.BoxGeometry(0.09, 0.015, 0.025),
      strapMat
    );
    leftStrap1.position.set(0.02, -0.655, 0.06);
    leftStrap1.rotation.y = 0.5;
    leftStrap1.rotation.z = -0.3;
    this.leftLeg.add(leftStrap1);

    const leftStrap2 = new THREE.Mesh(
      new THREE.BoxGeometry(0.09, 0.015, 0.025),
      strapMat
    );
    leftStrap2.position.set(-0.02, -0.655, 0.06);
    leftStrap2.rotation.y = -0.5;
    leftStrap2.rotation.z = 0.3;
    this.leftLeg.add(leftStrap2);

    this.group.add(this.leftLeg);

    // Right Leg: Matching long drape & sandal
    const rightIzar = new THREE.Mesh(
      new THREE.CylinderGeometry(0.15, 0.17, 0.54, 14),
      whiteClothMat
    );
    rightIzar.position.y = -0.22;
    rightIzar.castShadow = true;
    this.rightLeg.add(rightIzar);

    const rightIzarFringe = new THREE.Mesh(
      new THREE.CylinderGeometry(0.171, 0.175, 0.04, 14),
      fringeMat
    );
    rightIzarFringe.position.y = -0.47;
    this.rightLeg.add(rightIzarFringe);

    const rightCalf = new THREE.Mesh(
      new THREE.CylinderGeometry(0.06, 0.05, 0.24, 12),
      skinMat
    );
    rightCalf.position.y = -0.54;
    rightCalf.castShadow = true;
    this.rightLeg.add(rightCalf);

    const rightFoot = new THREE.Mesh(
      new THREE.BoxGeometry(0.08, 0.05, 0.16),
      skinMat
    );
    rightFoot.position.set(0, -0.66, 0.04);
    rightFoot.castShadow = true;
    this.rightLeg.add(rightFoot);

    const rightSandalSole = new THREE.Mesh(
      new THREE.BoxGeometry(0.11, 0.025, 0.22),
      soleMat
    );
    rightSandalSole.position.set(0, -0.69, 0.04);
    rightSandalSole.castShadow = true;
    this.rightLeg.add(rightSandalSole);

    const rightStrap1 = new THREE.Mesh(
      new THREE.BoxGeometry(0.09, 0.015, 0.025),
      strapMat
    );
    rightStrap1.position.set(0.02, -0.655, 0.06);
    rightStrap1.rotation.y = 0.5;
    rightStrap1.rotation.z = -0.3;
    this.rightLeg.add(rightStrap1);

    const rightStrap2 = new THREE.Mesh(
      new THREE.BoxGeometry(0.09, 0.015, 0.025),
      strapMat
    );
    rightStrap2.position.set(-0.02, -0.655, 0.06);
    rightStrap2.rotation.y = -0.5;
    rightStrap2.rotation.z = 0.3;
    this.rightLeg.add(rightStrap2);

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
