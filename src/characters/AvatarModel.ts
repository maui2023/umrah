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
  private mutawwifFlagGroup!: THREE.Group;
  private mutawwifFlagMesh!: THREE.Mesh;
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

    // Natural skin tone
    const skinMat = new THREE.MeshStandardMaterial({
      color: this.gender === 'male' ? 0xc48e6c : 0xd19f7e,
      roughness: 0.6,
      metalness: 0.04
    });

    // Clean white cloth for Ihram & Abaya/Telekung
    const whiteClothMat = new THREE.MeshStandardMaterial({
      color: 0xfcfcfc,
      roughness: 0.82,
      metalness: 0.02
    });

    // Shadowed / inner folds cloth material for depth & realism
    const clothShadeMat = new THREE.MeshStandardMaterial({
      color: 0xe0ddd8,
      roughness: 0.9,
      metalness: 0.02
    });

    // Fringed edge / seam trim
    const fringeMat = new THREE.MeshStandardMaterial({
      color: 0xeae6df,
      roughness: 0.95,
      metalness: 0.0
    });

    // Natural hair & eyebrows
    const hairMat = new THREE.MeshStandardMaterial({
      color: 0x1f1a17,
      roughness: 0.85,
      metalness: 0.08
    });

    // Pilgrim waist belt (Talbiyah / ihram pouch belt for money & essentials)
    const beltMat = new THREE.MeshStandardMaterial({
      color: 0x2e6930, // Traditional green pouch belt
      roughness: 0.5,
      metalness: 0.2
    });
    const buckleMat = new THREE.MeshStandardMaterial({
      color: 0xd4af37, // Brass / gold buckle
      roughness: 0.3,
      metalness: 0.8
    });

    // Footwear materials
    const soleMat = new THREE.MeshStandardMaterial({
      color: this.gender === 'male' ? 0xcc7a70 : 0x3d3d3d,
      roughness: 0.6,
      metalness: 0.05
    });
    const strapMat = new THREE.MeshStandardMaterial({
      color: this.gender === 'male' ? 0x3f9cb5 : 0x5a5a5a,
      roughness: 0.4,
      metalness: 0.1
    });

    // Facial feature materials
    const eyeMat = new THREE.MeshBasicMaterial({ color: 0x1a1a1a });
    const eyeWhiteMat = new THREE.MeshBasicMaterial({ color: 0xf5f5f5 });
    const lipMat = new THREE.MeshStandardMaterial({
      color: this.gender === 'male' ? 0xa86b5b : 0xb57065,
      roughness: 0.7
    });

    // =========================================================================
    // 1. TORSO & CLOTHING GROUP
    // =========================================================================
    this.torso = new THREE.Group();
    this.torso.position.y = this.gender === 'male' ? 1.05 : 0.95;

    if (this.gender === 'male') {
      // Anatomical upper torso (chest + waist taper)
      const chestGeo = new THREE.CylinderGeometry(0.23, 0.18, 0.44, 16);
      const chestMesh = new THREE.Mesh(chestGeo, skinMat);
      chestMesh.castShadow = true;
      this.torso.add(chestMesh);

      // Collarbones / sternum accent
      const clavicleGeo = new THREE.BoxGeometry(0.32, 0.02, 0.03);
      const clavicle = new THREE.Mesh(clavicleGeo, skinMat);
      clavicle.position.set(0, 0.19, 0.09);
      this.torso.add(clavicle);

      // --- Upper Shawl / Cape (Rida') ---
      // Flowing upper mantle draping over shoulders & upper body
      const mantleGeo = new THREE.CylinderGeometry(0.31, 0.39, 0.62, 20, 1, true);
      const mantle = new THREE.Mesh(mantleGeo, whiteClothMat);
      mantle.position.set(0, 0.06, 0);
      mantle.castShadow = true;
      mantle.receiveShadow = true;
      this.torso.add(mantle);

      // Cowl / loose neck drapery around the collar
      const cowlGeo = new THREE.TorusGeometry(0.18, 0.05, 10, 24, Math.PI * 1.5);
      const cowl = new THREE.Mesh(cowlGeo, clothShadeMat);
      cowl.position.set(0, 0.23, -0.04);
      cowl.rotation.x = Math.PI / 2.6;
      cowl.rotation.z = Math.PI;
      cowl.castShadow = true;
      this.torso.add(cowl);

      // Back fold drape
      const backDrape = new THREE.Mesh(
        new THREE.CylinderGeometry(0.28, 0.38, 0.52, 14, 1, true, -Math.PI * 0.45, Math.PI * 0.9),
        clothShadeMat
      );
      backDrape.position.set(0, 0.03, -0.03);
      backDrape.castShadow = true;
      this.torso.add(backDrape);

      // Front overlap drape with elegant diagonal wrap
      const frontOverlap = new THREE.Mesh(
        new THREE.CylinderGeometry(0.31, 0.40, 0.56, 16, 1, false, -Math.PI * 0.22, Math.PI * 0.78),
        whiteClothMat
      );
      frontOverlap.position.set(-0.02, 0.04, 0.02);
      frontOverlap.rotation.z = -0.06;
      frontOverlap.castShadow = true;
      this.torso.add(frontOverlap);

      // Shawl hem fringe border
      const fringeUpper = new THREE.Mesh(
        new THREE.CylinderGeometry(0.315, 0.405, 0.035, 16, 1, true, -Math.PI * 0.22, Math.PI * 0.78),
        fringeMat
      );
      fringeUpper.position.set(-0.02, -0.23, 0.02);
      this.torso.add(fringeUpper);

      // Ihram Belt / Pouch around waist
      const beltGeo = new THREE.CylinderGeometry(0.22, 0.22, 0.055, 18);
      const belt = new THREE.Mesh(beltGeo, beltMat);
      belt.position.set(0, -0.19, 0);
      this.torso.add(belt);

      // Belt pouch
      const pouchGeo = new THREE.BoxGeometry(0.10, 0.08, 0.05);
      const pouch = new THREE.Mesh(pouchGeo, beltMat);
      pouch.position.set(0.12, -0.19, 0.20);
      pouch.rotation.y = 0.4;
      this.torso.add(pouch);

      // Belt buckle
      const buckleGeo = new THREE.BoxGeometry(0.04, 0.055, 0.015);
      const buckle = new THREE.Mesh(buckleGeo, buckleMat);
      buckle.position.set(0, -0.19, 0.225);
      this.torso.add(buckle);

      // Lower wrap / Izar upper section (hips & pelvic area)
      const izarTop = new THREE.Mesh(
        new THREE.CylinderGeometry(0.22, 0.26, 0.35, 18),
        whiteClothMat
      );
      izarTop.position.set(0, -0.26, 0);
      izarTop.castShadow = true;
      this.torso.add(izarTop);

      // Vertical wrapped overlap fold down the front
      const frontWrapFold = new THREE.Mesh(
        new THREE.BoxGeometry(0.08, 0.36, 0.05),
        clothShadeMat
      );
      frontWrapFold.position.set(-0.07, -0.26, 0.22);
      frontWrapFold.rotation.y = -0.2;
      this.torso.add(frontWrapFold);

    } else {
      // Female Pilgrim: Refined human silhouette with flowing Abaya/Jubah
      // Slender shoulders & chest
      const upperTorso = new THREE.Mesh(
        new THREE.CylinderGeometry(0.19, 0.23, 0.42, 16),
        whiteClothMat
      );
      upperTorso.position.set(0, 0.20, 0);
      upperTorso.castShadow = true;
      this.torso.add(upperTorso);

      // Waist and natural flare of Jubah down to hips/lower body
      const lowerTorso = new THREE.Mesh(
        new THREE.CylinderGeometry(0.23, 0.36, 0.70, 18),
        whiteClothMat
      );
      lowerTorso.position.set(0, -0.25, 0);
      lowerTorso.castShadow = true;
      this.torso.add(lowerTorso);

      // Gentle vertical fabric pleats for dynamic dress folds
      for (let i = 0; i < 4; i++) {
        const pleatAngle = (i - 1.5) * 0.45;
        const pleat = new THREE.Mesh(
          new THREE.CylinderGeometry(0.018, 0.024, 0.68, 8),
          clothShadeMat
        );
        pleat.position.set(Math.sin(pleatAngle) * 0.27, -0.25, Math.cos(pleatAngle) * 0.28);
        this.torso.add(pleat);
      }
    }
    this.group.add(this.torso);

    // =========================================================================
    // 2. HEAD & FACIAL FEATURES (Anatomical cranium, facial features, ears, hair/hijab)
    // =========================================================================
    this.head = new THREE.Group();
    this.head.position.y = this.gender === 'male' ? 1.54 : 1.48;

    // Graceful anatomical neck
    const neck = new THREE.Mesh(
      new THREE.CylinderGeometry(
        this.gender === 'male' ? 0.07 : 0.06,
        this.gender === 'male' ? 0.085 : 0.075,
        0.14,
        14
      ),
      skinMat
    );
    neck.position.y = -0.12;
    neck.castShadow = true;
    this.head.add(neck);

    // Adam's apple for male
    if (this.gender === 'male') {
      const adamsApple = new THREE.Mesh(
        new THREE.ConeGeometry(0.018, 0.03, 6),
        skinMat
      );
      adamsApple.position.set(0, -0.10, 0.075);
      adamsApple.rotation.x = Math.PI / 2;
      this.head.add(adamsApple);
    }

    // Cranium / Upper Head
    const headCranium = new THREE.Mesh(
      new THREE.SphereGeometry(this.gender === 'male' ? 0.145 : 0.138, 18, 16),
      skinMat
    );
    headCranium.scale.set(1.0, 1.12, 1.05);
    headCranium.castShadow = true;
    this.head.add(headCranium);

    // Jaw & Chin
    const jaw = new THREE.Mesh(
      new THREE.CylinderGeometry(
        this.gender === 'male' ? 0.11 : 0.095,
        this.gender === 'male' ? 0.075 : 0.055,
        0.12,
        14
      ),
      skinMat
    );
    jaw.position.set(0, -0.075, 0.03);
    this.head.add(jaw);

    // Cheeks
    const leftCheek = new THREE.Mesh(new THREE.SphereGeometry(0.045, 8, 8), skinMat);
    leftCheek.position.set(-0.08, -0.03, 0.09);
    this.head.add(leftCheek);
    const rightCheek = new THREE.Mesh(new THREE.SphereGeometry(0.045, 8, 8), skinMat);
    rightCheek.position.set(0.08, -0.03, 0.09);
    this.head.add(rightCheek);

    // Sculpted Nose
    const noseBridge = new THREE.Mesh(
      new THREE.BoxGeometry(0.024, 0.065, 0.03),
      skinMat
    );
    noseBridge.position.set(0, 0.005, 0.155);
    this.head.add(noseBridge);

    const noseTip = new THREE.Mesh(
      new THREE.SphereGeometry(0.02, 8, 8),
      skinMat
    );
    noseTip.position.set(0, -0.025, 0.165);
    this.head.add(noseTip);

    // Realistic Eyes with Sclera (White) + Dark Iris
    const eyeSocketLeft = new THREE.Group();
    eyeSocketLeft.position.set(-0.052, 0.02, 0.132);
    const eyeScleraL = new THREE.Mesh(new THREE.SphereGeometry(0.022, 10, 8), eyeWhiteMat);
    eyeScleraL.scale.set(1, 0.75, 0.6);
    eyeSocketLeft.add(eyeScleraL);
    const eyePupilL = new THREE.Mesh(new THREE.SphereGeometry(0.013, 8, 8), eyeMat);
    eyePupilL.position.set(0, 0, 0.013);
    eyeSocketLeft.add(eyePupilL);
    this.head.add(eyeSocketLeft);

    const eyeSocketRight = new THREE.Group();
    eyeSocketRight.position.set(0.052, 0.02, 0.132);
    const eyeScleraR = new THREE.Mesh(new THREE.SphereGeometry(0.022, 10, 8), eyeWhiteMat);
    eyeScleraR.scale.set(1, 0.75, 0.6);
    eyeSocketRight.add(eyeScleraR);
    const eyePupilR = new THREE.Mesh(new THREE.SphereGeometry(0.013, 8, 8), eyeMat);
    eyePupilR.position.set(0, 0, 0.013);
    eyeSocketRight.add(eyePupilR);
    this.head.add(eyeSocketRight);

    // Eyebrows
    const browGeo = new THREE.BoxGeometry(0.048, 0.012, 0.018);
    const browLeft = new THREE.Mesh(browGeo, hairMat);
    browLeft.position.set(-0.052, 0.048, 0.142);
    browLeft.rotation.z = 0.08;
    this.head.add(browLeft);

    const browRight = new THREE.Mesh(browGeo, hairMat);
    browRight.position.set(0.052, 0.048, 0.142);
    browRight.rotation.z = -0.08;
    this.head.add(browRight);

    // Lips / Mouth
    const lips = new THREE.Mesh(
      new THREE.CylinderGeometry(0.035, 0.035, 0.012, 8),
      lipMat
    );
    lips.rotation.x = Math.PI / 2;
    lips.scale.set(1, 0.5, 1);
    lips.position.set(0, -0.065, 0.135);
    this.head.add(lips);

    // Anatomical Ears with inner concha
    const earGeo = new THREE.CylinderGeometry(0.03, 0.022, 0.015, 10);
    const leftEar = new THREE.Mesh(earGeo, skinMat);
    leftEar.position.set(-0.145, 0, 0);
    leftEar.rotation.z = Math.PI / 2 + 0.15;
    leftEar.rotation.y = 0.2;
    leftEar.scale.set(1.4, 0.6, 1.0);
    this.head.add(leftEar);

    const rightEar = new THREE.Mesh(earGeo, skinMat);
    rightEar.position.set(0.145, 0, 0);
    rightEar.rotation.z = -Math.PI / 2 - 0.15;
    rightEar.rotation.y = -0.2;
    rightEar.scale.set(1.4, 0.6, 1.0);
    this.head.add(rightEar);

    if (this.gender === 'male') {
      // Natural male hair: textured short cropped hair
      const hairCrown = new THREE.Mesh(
        new THREE.SphereGeometry(0.155, 18, 16, 0, Math.PI * 2, 0, Math.PI * 0.55),
        hairMat
      );
      hairCrown.position.set(0, 0.02, -0.01);
      this.head.add(hairCrown);

      const hairBack = new THREE.Mesh(
        new THREE.BoxGeometry(0.24, 0.15, 0.12),
        hairMat
      );
      hairBack.position.set(0, 0.01, -0.09);
      this.head.add(hairBack);

      // Neat sideburns
      const sideburnL = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.07, 0.03), hairMat);
      sideburnL.position.set(-0.138, -0.01, 0.03);
      this.head.add(sideburnL);
      const sideburnR = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.07, 0.03), hairMat);
      sideburnR.position.set(0.138, -0.01, 0.03);
      this.head.add(sideburnR);

      // Sunnah trimmed beard along jawline
      const beardJaw = new THREE.Mesh(
        new THREE.CylinderGeometry(0.115, 0.082, 0.09, 14, 1, true, -Math.PI * 0.75, Math.PI * 1.5),
        hairMat
      );
      beardJaw.position.set(0, -0.08, 0.035);
      this.head.add(beardJaw);

      // Chin beard tuft
      const chinBeard = new THREE.Mesh(
        new THREE.SphereGeometry(0.045, 10, 10),
        hairMat
      );
      chinBeard.position.set(0, -0.125, 0.075);
      chinBeard.scale.set(1.1, 0.8, 1.0);
      this.head.add(chinBeard);

    } else {
      // Female Pilgrim: Elegant Modest Telekung / Hijab / Khimar
      // Inner head cap / serkup framing the forehead
      const hijabInner = new THREE.Mesh(
        new THREE.SphereGeometry(0.144, 18, 16),
        clothShadeMat
      );
      hijabInner.position.set(0, 0.01, -0.01);
      this.head.add(hijabInner);

      // Outer draped Hijab covering hair, ears, neck, and shoulders
      const hijabCrown = new THREE.Mesh(
        new THREE.SphereGeometry(0.165, 18, 16, 0, Math.PI * 2, 0, Math.PI * 0.65),
        whiteClothMat
      );
      hijabCrown.position.set(0, 0.02, -0.015);
      hijabCrown.castShadow = true;
      this.head.add(hijabCrown);

      // Flowing Khimar drape falling gently around chest and upper back
      const khimarGeo = new THREE.CylinderGeometry(0.17, 0.38, 0.46, 20);
      const khimar = new THREE.Mesh(khimarGeo, whiteClothMat);
      khimar.position.set(0, -0.22, 0.01);
      khimar.castShadow = true;
      this.head.add(khimar);

      // Khimar front fold opening framing the oval face
      const faceFrameTrim = new THREE.Mesh(
        new THREE.TorusGeometry(0.13, 0.018, 10, 24, Math.PI * 1.4),
        clothShadeMat
      );
      faceFrameTrim.position.set(0, -0.02, 0.08);
      faceFrameTrim.rotation.z = Math.PI * 0.8;
      this.head.add(faceFrameTrim);
    }

    // =========================================================================
    // 2B. MUTAWWIF OVERHEAD GROUP FLAG (Bendera Penanda Mutawwif)
    // =========================================================================
    this.mutawwifFlagGroup = new THREE.Group();
    // Position pole on top-right of head so it flutters clearly above
    this.mutawwifFlagGroup.position.set(0.04, 0.18, -0.02);

    // Slim lightweight flagpole / tiang bendera
    const poleMat = new THREE.MeshStandardMaterial({
      color: 0xdcdcdc,
      metalness: 0.85,
      roughness: 0.25
    });
    const pole = new THREE.Mesh(
      new THREE.CylinderGeometry(0.009, 0.009, 0.72, 8),
      poleMat
    );
    pole.position.set(0, 0.36, 0);
    pole.castShadow = true;
    this.mutawwifFlagGroup.add(pole);

    // Golden dome finial on top of flagpole
    const finialMat = new THREE.MeshStandardMaterial({
      color: 0xd4af37,
      metalness: 0.9,
      roughness: 0.2
    });
    const finial = new THREE.Mesh(new THREE.SphereGeometry(0.024, 10, 10), finialMat);
    finial.position.set(0, 0.72, 0);
    this.mutawwifFlagGroup.add(finial);

    // Triangular Pennant Flag (matches user sketch on mutawwif's head)
    const flagShape = new THREE.Shape();
    flagShape.moveTo(0, 0);
    flagShape.lineTo(0.36, 0.12); // Tip pointing right/back
    flagShape.lineTo(0, 0.24); // Upper attachment
    flagShape.closePath();

    const flagGeo = new THREE.ShapeGeometry(flagShape);
    const flagMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(this.groupColor),
      side: THREE.DoubleSide,
      roughness: 0.45,
      metalness: 0.05
    });
    this.mutawwifFlagMesh = new THREE.Mesh(flagGeo, flagMat);
    this.mutawwifFlagMesh.position.set(0.005, 0.46, 0);
    this.mutawwifFlagMesh.castShadow = true;
    this.mutawwifFlagGroup.add(this.mutawwifFlagMesh);

    // Initial visibility according to role
    this.mutawwifFlagGroup.visible = this.role === 'mutawwif';
    this.head.add(this.mutawwifFlagGroup);

    this.group.add(this.head);

    // =========================================================================
    // 3. ARMS & HANDS (Anatomical shoulders, bicep, elbow, forearm, palm & fingers)
    // =========================================================================
    this.leftArm = new THREE.Group();
    this.rightArm = new THREE.Group();

    const shoulderY = this.gender === 'male' ? 1.28 : 1.22;
    const shoulderWidth = this.gender === 'male' ? 0.30 : 0.25;

    this.leftArm.position.set(-shoulderWidth, shoulderY, 0);
    this.rightArm.position.set(shoulderWidth, shoulderY, 0);

    const buildArm = (isLeft: boolean): THREE.Group => {
      const armGroup = new THREE.Group();
      const side = isLeft ? -1 : 1;

      // Deltoid / Shoulder cap
      const shoulderGeo = new THREE.SphereGeometry(this.gender === 'male' ? 0.075 : 0.065, 12, 10);
      const shoulderMesh = new THREE.Mesh(
        shoulderGeo,
        this.gender === 'male' ? whiteClothMat : whiteClothMat
      );
      shoulderMesh.position.set(0, 0, 0);
      armGroup.add(shoulderMesh);

      // Upper arm (Male has cloth drape at top, Female has full abaya sleeve)
      if (this.gender === 'male') {
        const upperArmCloth = new THREE.Mesh(
          new THREE.CylinderGeometry(0.068, 0.062, 0.16, 12),
          whiteClothMat
        );
        upperArmCloth.position.y = -0.08;
        upperArmCloth.castShadow = true;
        armGroup.add(upperArmCloth);

        // Bare lower bicep / elbow
        const bicep = new THREE.Mesh(
          new THREE.CylinderGeometry(0.060, 0.054, 0.14, 12),
          skinMat
        );
        bicep.position.y = -0.21;
        bicep.castShadow = true;
        armGroup.add(bicep);

        // Forearm with anatomical taper towards wrist
        const forearm = new THREE.Mesh(
          new THREE.CylinderGeometry(0.053, 0.042, 0.26, 12),
          skinMat
        );
        forearm.position.y = -0.38;
        forearm.castShadow = true;
        armGroup.add(forearm);
      } else {
        // Female modest long sleeve
        const sleeve = new THREE.Mesh(
          new THREE.CylinderGeometry(0.062, 0.072, 0.44, 14),
          whiteClothMat
        );
        sleeve.position.y = -0.22;
        sleeve.castShadow = true;
        armGroup.add(sleeve);

        // Sleeve cuff trim
        const cuff = new THREE.Mesh(
          new THREE.CylinderGeometry(0.073, 0.073, 0.03, 14),
          clothShadeMat
        );
        cuff.position.y = -0.43;
        armGroup.add(cuff);

        // Visible wrist
        const wrist = new THREE.Mesh(
          new THREE.CylinderGeometry(0.040, 0.036, 0.06, 10),
          skinMat
        );
        wrist.position.y = -0.46;
        armGroup.add(wrist);
      }

      // Sculpted Hand (Palm + Thumb + Fingers)
      const handGroup = new THREE.Group();
      handGroup.position.set(0, -0.52, 0);

      // Palm
      const palm = new THREE.Mesh(
        new THREE.BoxGeometry(0.042, 0.075, 0.065),
        skinMat
      );
      palm.castShadow = true;
      handGroup.add(palm);

      // Thumb
      const thumb = new THREE.Mesh(
        new THREE.CylinderGeometry(0.012, 0.010, 0.042, 8),
        skinMat
      );
      thumb.position.set(side * 0.024, 0.015, 0.024);
      thumb.rotation.x = 0.4;
      thumb.rotation.z = side * -0.6;
      handGroup.add(thumb);

      // Four fingers grouped naturally
      const fingers = new THREE.Mesh(
        new THREE.BoxGeometry(0.036, 0.045, 0.058),
        skinMat
      );
      fingers.position.set(0, -0.052, 0);
      handGroup.add(fingers);

      armGroup.add(handGroup);
      return armGroup;
    };

    this.leftArm.add(buildArm(true));
    this.rightArm.add(buildArm(false));

    this.group.add(this.leftArm);
    this.group.add(this.rightArm);

    // =========================================================================
    // 4. LEGS, FEET & FOOTWEAR (Izar for male, skirt/trouser for female)
    // =========================================================================
    this.leftLeg = new THREE.Group();
    this.rightLeg = new THREE.Group();

    const legPivotY = 0.72;
    const legSpacing = this.gender === 'male' ? 0.12 : 0.10;
    this.leftLeg.position.set(-legSpacing, legPivotY, 0);
    this.rightLeg.position.set(legSpacing, legPivotY, 0);

    const buildLeg = (isLeft: boolean): THREE.Group => {
      const legGroup = new THREE.Group();
      const side = isLeft ? -1 : 1;

      if (this.gender === 'male') {
        // Ihram Izar (Lower cloth wrap) draping around the leg
        const izarLeg = new THREE.Mesh(
          new THREE.CylinderGeometry(0.145, 0.165, 0.52, 14),
          whiteClothMat
        );
        izarLeg.position.y = -0.22;
        izarLeg.castShadow = true;
        legGroup.add(izarLeg);

        // Izar bottom hem fringe
        const izarFringe = new THREE.Mesh(
          new THREE.CylinderGeometry(0.166, 0.170, 0.035, 14),
          fringeMat
        );
        izarFringe.position.y = -0.46;
        legGroup.add(izarFringe);

        // Lower calf & Achilles tendon
        const calf = new THREE.Mesh(
          new THREE.CylinderGeometry(0.058, 0.046, 0.24, 12),
          skinMat
        );
        calf.position.y = -0.54;
        calf.castShadow = true;
        legGroup.add(calf);

        // Ankle joint malleolus
        const ankleBone = new THREE.Mesh(
          new THREE.SphereGeometry(0.048, 8, 8),
          skinMat
        );
        ankleBone.position.set(side * 0.02, -0.62, 0);
        ankleBone.scale.set(0.6, 0.6, 0.8);
        legGroup.add(ankleBone);

        // Human Foot with instep arch and toes
        const foot = new THREE.Mesh(
          new THREE.BoxGeometry(0.082, 0.05, 0.16),
          skinMat
        );
        foot.position.set(0, -0.66, 0.04);
        foot.castShadow = true;
        legGroup.add(foot);

        // Toes
        const toes = new THREE.Mesh(
          new THREE.BoxGeometry(0.078, 0.032, 0.05),
          skinMat
        );
        toes.position.set(0, -0.67, 0.13);
        legGroup.add(toes);

        // Realistic Flip-flop sandal (coral pink sole + sky blue straps)
        const sandalSole = new THREE.Mesh(
          new THREE.BoxGeometry(0.105, 0.024, 0.22),
          soleMat
        );
        sandalSole.position.set(0, -0.69, 0.04);
        sandalSole.castShadow = true;
        legGroup.add(sandalSole);

        // V-strap thong
        const strap1 = new THREE.Mesh(
          new THREE.BoxGeometry(0.08, 0.015, 0.022),
          strapMat
        );
        strap1.position.set(0.02, -0.655, 0.06);
        strap1.rotation.y = 0.5;
        strap1.rotation.z = -0.3;
        legGroup.add(strap1);

        const strap2 = new THREE.Mesh(
          new THREE.BoxGeometry(0.08, 0.015, 0.022),
          strapMat
        );
        strap2.position.set(-0.02, -0.655, 0.06);
        strap2.rotation.y = -0.5;
        strap2.rotation.z = 0.3;
        legGroup.add(strap2);

      } else {
        // Female: Jubah skirt covering down to shoes
        const skirtColumn = new THREE.Mesh(
          new THREE.CylinderGeometry(0.16, 0.19, 0.56, 14),
          whiteClothMat
        );
        skirtColumn.position.y = -0.24;
        skirtColumn.castShadow = true;
        legGroup.add(skirtColumn);

        // Modest walking shoe / comfortable pilgrimage flats
        const shoe = new THREE.Mesh(
          new THREE.BoxGeometry(0.082, 0.055, 0.17),
          soleMat
        );
        shoe.position.set(0, -0.66, 0.03);
        shoe.castShadow = true;
        legGroup.add(shoe);

        // Shoe sole
        const shoeSole = new THREE.Mesh(
          new THREE.BoxGeometry(0.086, 0.02, 0.18),
          strapMat
        );
        shoeSole.position.set(0, -0.69, 0.03);
        legGroup.add(shoeSole);
      }

      return legGroup;
    };

    this.leftLeg.add(buildLeg(true));
    this.rightLeg.add(buildLeg(false));

    this.group.add(this.leftLeg);
    this.group.add(this.rightLeg);

    // =========================================================================
    // 5. SUBTLE GROUND SHADOW / HALO RING
    // =========================================================================
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

    // =========================================================================
    // 6. OVERHEAD FLOATING NAME TAG
    // =========================================================================
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

    // Update mutawwif overhead flag visibility & color
    if (this.mutawwifFlagGroup) {
      this.mutawwifFlagGroup.visible = role === 'mutawwif';
    }
    if (this.mutawwifFlagMesh) {
      (this.mutawwifFlagMesh.material as THREE.MeshStandardMaterial).color.set(groupColor);
    }

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
      // Natural walking / running limb swings with subtle sideways sway
      const legAngle = Math.sin(this.animTimer) * 0.62;
      const armAngle = -Math.sin(this.animTimer) * 0.58;

      this.leftLeg.rotation.x = legAngle;
      this.rightLeg.rotation.x = -legAngle;

      this.leftArm.rotation.x = armAngle;
      this.rightArm.rotation.x = -armAngle;

      // Subtle hip & spine rotation for realistic gait
      const spineTwist = Math.sin(this.animTimer) * 0.05;
      this.torso.rotation.y = spineTwist;
      this.head.rotation.y = -spineTwist * 0.5;

      // Natural vertical bobbing
      const baseTorsoY = this.gender === 'male' ? 1.05 : 0.95;
      const baseHeadY = this.gender === 'male' ? 1.54 : 1.48;
      const bob = Math.abs(Math.sin(this.animTimer * 2)) * 0.04;
      this.torso.position.y = baseTorsoY + bob;
      this.head.position.y = baseHeadY + bob;

      // Realistic flag flutter & wind dynamic reaction while moving
      if (this.mutawwifFlagMesh && this.mutawwifFlagGroup.visible) {
        this.mutawwifFlagMesh.rotation.y = Math.sin(this.animTimer * 2.2) * 0.28;
        this.mutawwifFlagMesh.rotation.z = Math.cos(this.animTimer * 1.8) * 0.08;
      }
    } else {
      // Idle gentle breathing
      const breath = Math.sin(this.animTimer) * 0.015;
      this.leftLeg.rotation.x = 0;
      this.rightLeg.rotation.x = 0;
      this.leftArm.rotation.x = 0.05 + breath;
      this.rightArm.rotation.x = 0.05 + breath;
      this.torso.rotation.y = 0;
      this.head.rotation.y = 0;

      const baseTorsoY = this.gender === 'male' ? 1.05 : 0.95;
      const baseHeadY = this.gender === 'male' ? 1.54 : 1.48;
      this.torso.position.y = baseTorsoY + breath;
      this.head.position.y = baseHeadY + breath;

      // Gentle subtle flag wave in gentle breeze while standing
      if (this.mutawwifFlagMesh && this.mutawwifFlagGroup.visible) {
        this.mutawwifFlagMesh.rotation.y = Math.sin(this.animTimer * 1.2) * 0.12;
        this.mutawwifFlagMesh.rotation.z = Math.cos(this.animTimer * 1.0) * 0.03;
      }
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
