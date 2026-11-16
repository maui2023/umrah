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
  private head: THREE.Mesh;
  private torso: THREE.Mesh;
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
  }) {
    this.name = data.name;
    this.gender = data.gender;
    this.role = data.role;
    this.groupColor = data.groupColor || '#10B981';
    this.groupName = data.groupName || 'Solo';

    this.group = new THREE.Group();

    // Reusable Materials
    const skinMat = new THREE.MeshLambertMaterial({ color: 0xdfab81 });
    const whiteClothMat = new THREE.MeshLambertMaterial({ color: 0xfcfcfc });
    const hairMat = new THREE.MeshLambertMaterial({ color: 0x221811 });
    const sandalMat = new THREE.MeshLambertMaterial({ color: 0x4a3728 });

    // 1. Torso
    if (this.gender === 'male') {
      // Male Pilgrim (Ihram: Rida' draped over torso with bare right shoulder)
      const torsoGeo = new THREE.BoxGeometry(0.55, 0.65, 0.32);
      this.torso = new THREE.Mesh(torsoGeo, whiteClothMat);
      this.torso.position.y = 1.05;
      this.torso.castShadow = true;
      this.group.add(this.torso);

      // Bare right shoulder sash (Idtiba' detail - sunnah for tawaf)
      const bareShoulder = new THREE.Mesh(
        new THREE.BoxGeometry(0.18, 0.35, 0.33),
        skinMat
      );
      bareShoulder.position.set(0.24, 0.22, 0);
      this.torso.add(bareShoulder);
    } else {
      // Female Pilgrim: Modest full-length white Abaya/Jubah draping down
      const torsoGeo = new THREE.CylinderGeometry(0.26, 0.48, 1.15, 12);
      this.torso = new THREE.Mesh(torsoGeo, whiteClothMat);
      this.torso.position.y = 0.82;
      this.torso.castShadow = true;
      this.group.add(this.torso);
    }

    // 2. Head & Hair/Hijab
    const headGeo = new THREE.BoxGeometry(0.3, 0.32, 0.28);
    this.head = new THREE.Mesh(headGeo, skinMat);
    this.head.position.y = this.gender === 'male' ? 1.55 : 1.52;
    this.head.castShadow = true;
    this.group.add(this.head);

    if (this.gender === 'male') {
      // Male Hair (neatly trimmed or shaved)
      const hairGeo = new THREE.BoxGeometry(0.32, 0.12, 0.3);
      const hair = new THREE.Mesh(hairGeo, hairMat);
      hair.position.y = 0.14;
      this.head.add(hair);
    } else {
      // Female Hijab / Khimar: Complete modest head, neck, and shoulder covering in pure white
      const hijabTop = new THREE.Mesh(
        new THREE.CylinderGeometry(0.24, 0.32, 0.38, 12),
        whiteClothMat
      );
      hijabTop.position.y = 0.08;
      this.head.add(hijabTop);

      // Modest Khimar drape over chest and back
      const hijabDrape = new THREE.Mesh(
        new THREE.CylinderGeometry(0.32, 0.52, 0.48, 12),
        whiteClothMat
      );
      hijabDrape.position.y = -0.26;
      this.head.add(hijabDrape);
    }

    // 3. Arms
    this.leftArm = new THREE.Group();
    this.rightArm = new THREE.Group();

    const armGeo = new THREE.BoxGeometry(0.14, 0.55, 0.14);

    // Left Arm (White cloth sleeve)
    const leftArmMesh = new THREE.Mesh(armGeo, whiteClothMat);
    leftArmMesh.position.y = -0.22;
    leftArmMesh.castShadow = true;
    this.leftArm.add(leftArmMesh);

    // Left hand
    const leftHand = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.14, 0.11), skinMat);
    leftHand.position.y = -0.52;
    this.leftArm.add(leftHand);

    this.leftArm.position.set(-0.35, 1.3, 0);
    this.group.add(this.leftArm);

    // Right Arm (Skin for male idtiba' shoulder/arm, white cloth for female)
    const rightArmMesh = new THREE.Mesh(armGeo, this.gender === 'male' ? skinMat : whiteClothMat);
    rightArmMesh.position.y = -0.22;
    rightArmMesh.castShadow = true;
    this.rightArm.add(rightArmMesh);

    // Right hand
    const rightHand = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.14, 0.11), skinMat);
    rightHand.position.y = -0.52;
    this.rightArm.add(rightHand);

    this.rightArm.position.set(0.35, 1.3, 0);
    this.group.add(this.rightArm);

    // 4. Legs
    this.leftLeg = new THREE.Group();
    this.rightLeg = new THREE.Group();

    const legGeo = new THREE.BoxGeometry(0.18, 0.65, 0.18);
    const legMat = whiteClothMat; // Izar cloth / lower robe

    // Left Leg
    const leftLegMesh = new THREE.Mesh(legGeo, legMat);
    leftLegMesh.position.y = -0.32;
    leftLegMesh.castShadow = true;
    this.leftLeg.add(leftLegMesh);

    // Sandal
    const leftSandal = new THREE.Mesh(new THREE.BoxGeometry(0.19, 0.08, 0.28), sandalMat);
    leftSandal.position.set(0, -0.66, 0.04);
    this.leftLeg.add(leftSandal);

    this.leftLeg.position.set(-0.16, 0.72, 0);
    this.group.add(this.leftLeg);

    // Right Leg
    const rightLegMesh = new THREE.Mesh(legGeo, legMat);
    rightLegMesh.position.y = -0.32;
    rightLegMesh.castShadow = true;
    this.rightLeg.add(rightLegMesh);

    // Sandal
    const rightSandal = new THREE.Mesh(new THREE.BoxGeometry(0.19, 0.08, 0.28), sandalMat);
    rightSandal.position.set(0, -0.66, 0.04);
    this.rightLeg.add(rightSandal);

    this.rightLeg.position.set(0.16, 0.72, 0);
    this.group.add(this.rightLeg);

    // 5. Ground Halo Ring (Color-coded to player's group)
    const ringGeo = new THREE.RingGeometry(0.48, 0.64, 28);
    const ringMat = new THREE.MeshBasicMaterial({
      color: new THREE.Color(this.groupColor),
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.75
    });
    this.groundRing = new THREE.Mesh(ringGeo, ringMat);
    this.groundRing.rotation.x = -Math.PI / 2;
    this.groundRing.position.y = 0.02;
    this.group.add(this.groundRing);

    // 6. Overhead Floating Name Tag & Group Badge (Canvas Sprite Billboard)
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
    this.overheadSprite.scale.set(1.9, 0.72, 1);
    this.overheadSprite.position.set(0, 2.35, 0);
    this.group.add(this.overheadSprite);

    this.updateNameTag(this.name, this.groupName, this.groupColor, this.role, data.currentLap || 1);
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

    // Update ground ring color
    (this.groundRing.material as THREE.MeshBasicMaterial).color.set(groupColor);

    const ctx = this.spriteContext;
    ctx.clearRect(0, 0, 512, 192);

    // Rounded Box Background
    const radius = 24;
    ctx.fillStyle = 'rgba(15, 23, 42, 0.88)'; // Slate 900 translucent
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

    // Group Badge Line
    ctx.font = 'bold 24px "Segoe UI", Arial, sans-serif';
    ctx.fillStyle = groupColor;
    const badgeText = `[ ${groupName} ]  •  Pusingan ${lap}`;
    const badgeY = isLeader ? 104 : 118;
    ctx.fillText(badgeText, 256, badgeY);

    // Role sub-label
    if (isLeader) {
      ctx.font = 'bold 18px "Segoe UI", Arial, sans-serif';
      ctx.fillStyle = '#FBBF24'; // Gold
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
      // Walking / running limb swings
      const legAngle = Math.sin(this.animTimer) * 0.65;
      const armAngle = -Math.sin(this.animTimer) * 0.65;

      this.leftLeg.rotation.x = legAngle;
      this.rightLeg.rotation.x = -legAngle;

      this.leftArm.rotation.x = armAngle;
      this.rightArm.rotation.x = -armAngle;

      // Natural vertical bobbing
      const baseTorsoY = this.gender === 'male' ? 1.05 : 0.82;
      const baseHeadY = this.gender === 'male' ? 1.55 : 1.52;
      this.torso.position.y = baseTorsoY + Math.abs(Math.sin(this.animTimer * 2)) * 0.04;
      this.head.position.y = baseHeadY + Math.abs(Math.sin(this.animTimer * 2)) * 0.04;
    } else {
      // Idle gentle breathing
      const breath = Math.sin(this.animTimer) * 0.015;
      this.leftLeg.rotation.x = 0;
      this.rightLeg.rotation.x = 0;
      this.leftArm.rotation.x = 0.05 + breath;
      this.rightArm.rotation.x = 0.05 + breath;

      const baseTorsoY = this.gender === 'male' ? 1.05 : 0.82;
      const baseHeadY = this.gender === 'male' ? 1.55 : 1.52;
      this.torso.position.y = baseTorsoY + breath;
      this.head.position.y = baseHeadY + breath;
    }
  }

  /**
   * Interpolate remote player coordinates smoothly
   */
  public interpolate(delta: number) {
    const lerpFactor = Math.min(delta * 12, 1.0);
    this.group.position.lerp(this.targetPosition, lerpFactor);

    // Rotation shortest angle interpolation
    let diff = this.targetRotation - this.group.rotation.y;
    while (diff < -Math.PI) diff += Math.PI * 2;
    while (diff > Math.PI) diff -= Math.PI * 2;
    this.group.rotation.y += diff * lerpFactor;

    this.update(delta, this.isMoving);
  }

  /**
   * Clean up Three.js resources
   */
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
