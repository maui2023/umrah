import * as THREE from 'three';
import { Gender, PlayerRole } from '../types';
import { SolatAvatarPose } from '../data/solatData';

// =============================================================================
// SHARED PROCEDURAL TEXTURE CACHE (High-Resolution Textures for Realistic Look)
// =============================================================================
let sharedIhramTexture: THREE.CanvasTexture | null = null;
let sharedIhramBumpMap: THREE.CanvasTexture | null = null;
let sharedHairTexture: THREE.CanvasTexture | null = null;
let sharedLeatherTexture: THREE.CanvasTexture | null = null;
let sharedAbayaTexture: THREE.CanvasTexture | null = null;
let sharedAbayaBumpMap: THREE.CanvasTexture | null = null;

/**
 * Generate high-definition woven cotton Ihram cloth texture with authentic
 * weave grain, diagonal drapery folds, crease shadow gradients, and tasseled fringe borders.
 */
function getIhramTexture(): THREE.CanvasTexture {
  if (sharedIhramTexture) return sharedIhramTexture;

  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d')!;

  // 1. Natural warm off-white / ivory base cloth tone
  ctx.fillStyle = '#faf8f4';
  ctx.fillRect(0, 0, 1024, 1024);

  // 2. Micro-woven terrycloth / waffle cotton weave pattern
  ctx.fillStyle = 'rgba(215, 208, 198, 0.22)';
  for (let y = 0; y < 1024; y += 4) {
    for (let x = 0; x < 1024; x += 4) {
      if ((x + y) % 8 === 0) {
        ctx.fillRect(x, y, 2, 2);
      }
    }
  }

  // 3. Diagonal cloth drape creases & tension fold shadow gradients
  // (Mimics realistic fabric draping across shoulders, back, and waist)
  const drawFoldGradient = (
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    width: number,
    depth: number
  ) => {
    ctx.save();
    const grad = ctx.createLinearGradient(x1, y1, x2, y2);
    grad.addColorStop(0, 'rgba(255, 255, 255, 0.4)');
    grad.addColorStop(0.35, `rgba(180, 172, 160, ${depth})`);
    grad.addColorStop(0.5, `rgba(135, 126, 114, ${depth * 1.35})`);
    grad.addColorStop(0.7, `rgba(190, 182, 170, ${depth * 0.7})`);
    grad.addColorStop(1, 'rgba(255, 255, 255, 0.2)');

    ctx.strokeStyle = grad;
    ctx.lineWidth = width;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.bezierCurveTo(
      (x1 + x2) / 2 + 30,
      y1 + 40,
      (x1 + x2) / 2 - 30,
      y2 - 40,
      x2,
      y2
    );
    ctx.stroke();
    ctx.restore();
  };

  // Diagonal sweeping shawl drape folds
  drawFoldGradient(80, 120, 940, 480, 32, 0.25);
  drawFoldGradient(60, 260, 960, 620, 28, 0.22);
  drawFoldGradient(120, 400, 920, 780, 36, 0.28);
  drawFoldGradient(180, 560, 880, 890, 24, 0.20);

  // Vertical falling Izar skirt pleat folds
  for (let x = 120; x < 950; x += 110) {
    drawFoldGradient(x, 480, x + 15, 960, 18, 0.18);
  }

  // 4. Woven Fringe / Tassel Border along the lower hem (Bottom 64px)
  const fringeY = 960;
  ctx.fillStyle = 'rgba(225, 218, 208, 0.85)';
  ctx.fillRect(0, fringeY - 6, 1024, 6); // Seam stitch line

  // Fine vertical tassel threads with spacing & shadows
  for (let x = 0; x < 1024; x += 6) {
    const threadLen = 35 + Math.sin(x * 0.15) * 8 + Math.random() * 6;
    ctx.strokeStyle = (x % 12 === 0) ? '#d0c8bd' : '#f5f2eb';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(x, fringeY);
    ctx.lineTo(x + (Math.random() - 0.5) * 4, fringeY + threadLen);
    ctx.stroke();
  }

  sharedIhramTexture = new THREE.CanvasTexture(canvas);
  sharedIhramTexture.wrapS = THREE.RepeatWrapping;
  sharedIhramTexture.wrapT = THREE.RepeatWrapping;
  return sharedIhramTexture;
}

/**
 * Generate 1024x1024 bump/normal map for Ihram cloth to produce dynamic 3D
 * light-reacting fabric creases, cloth folds, and woven texture.
 */
function getIhramBumpMap(): THREE.CanvasTexture {
  if (sharedIhramBumpMap) return sharedIhramBumpMap;

  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d')!;

  // Mid-gray neutral base
  ctx.fillStyle = '#808080';
  ctx.fillRect(0, 0, 1024, 1024);

  // Micro-weave noise
  ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
  for (let y = 0; y < 1024; y += 4) {
    for (let x = 0; x < 1024; x += 4) {
      if ((x + y) % 8 === 0) {
        ctx.fillRect(x, y, 2, 2);
      }
    }
  }

  // Raised fold ridges (lighter gray) & crevice valleys (darker gray)
  const drawBumpCrease = (
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    width: number
  ) => {
    ctx.save();
    // Crevice shadow valley
    ctx.strokeStyle = '#484848';
    ctx.lineWidth = width * 0.6;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();

    // Raised lit ridge adjacent to crevice
    ctx.strokeStyle = '#c4c4c4';
    ctx.lineWidth = width * 0.4;
    ctx.beginPath();
    ctx.moveTo(x1 + 4, y1 - 4);
    ctx.lineTo(x2 + 4, y2 - 4);
    ctx.stroke();
    ctx.restore();
  };

  drawBumpCrease(80, 120, 940, 480, 22);
  drawBumpCrease(60, 260, 960, 620, 20);
  drawBumpCrease(120, 400, 920, 780, 24);
  drawBumpCrease(180, 560, 880, 890, 18);

  for (let x = 120; x < 950; x += 110) {
    drawBumpCrease(x, 480, x + 15, 960, 14);
  }

  sharedIhramBumpMap = new THREE.CanvasTexture(canvas);
  sharedIhramBumpMap.wrapS = THREE.RepeatWrapping;
  sharedIhramBumpMap.wrapT = THREE.RepeatWrapping;
  return sharedIhramBumpMap;
}

/**
 * Procedural dark textured wavy hair canvas texture.
 */
function getHairTexture(): THREE.CanvasTexture {
  if (sharedHairTexture) return sharedHairTexture;

  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#181412';
  ctx.fillRect(0, 0, 512, 512);

  // Fine wavy hair strands
  ctx.lineWidth = 1.2;
  for (let i = 0; i < 400; i++) {
    const x = Math.random() * 512;
    const y = Math.random() * 512;
    const len = 30 + Math.random() * 40;
    const alpha = 0.25 + Math.random() * 0.35;
    ctx.strokeStyle = `rgba(55, 45, 38, ${alpha})`;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.quadraticCurveTo(x + 10, y + len * 0.5, x + (Math.random() - 0.5) * 15, y + len);
    ctx.stroke();
  }

  sharedHairTexture = new THREE.CanvasTexture(canvas);
  sharedHairTexture.wrapS = THREE.RepeatWrapping;
  sharedHairTexture.wrapT = THREE.RepeatWrapping;
  return sharedHairTexture;
}

/**
 * Procedural rich chestnut brown leather texture for sandals.
 */
function getLeatherTexture(): THREE.CanvasTexture {
  if (sharedLeatherTexture) return sharedLeatherTexture;

  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#6b361a';
  ctx.fillRect(0, 0, 512, 512);

  // Subtle leather pores & grain
  for (let i = 0; i < 2000; i++) {
    const x = Math.random() * 512;
    const y = Math.random() * 512;
    ctx.fillStyle = (Math.random() > 0.5) ? 'rgba(125, 68, 38, 0.35)' : 'rgba(72, 34, 14, 0.4)';
    ctx.fillRect(x, y, 2, 2);
  }

  // Edge burnishing & stitch line
  ctx.strokeStyle = 'rgba(145, 85, 50, 0.6)';
  ctx.lineWidth = 4;
  ctx.strokeRect(8, 8, 496, 496);

  sharedLeatherTexture = new THREE.CanvasTexture(canvas);
  return sharedLeatherTexture;
}

/**
 * Procedural Abaya / Jubah fabric texture for female pilgrim.
 */
function getAbayaTexture(): THREE.CanvasTexture {
  if (sharedAbayaTexture) return sharedAbayaTexture;

  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#faf8f5';
  ctx.fillRect(0, 0, 1024, 1024);

  // Delicate crepe weave
  ctx.fillStyle = 'rgba(210, 204, 196, 0.2)';
  for (let y = 0; y < 1024; y += 4) {
    for (let x = 0; x < 1024; x += 4) {
      if ((x + y) % 6 === 0) ctx.fillRect(x, y, 1.5, 1.5);
    }
  }

  // Graceful vertical pleat shadows
  for (let x = 120; x < 950; x += 120) {
    const grad = ctx.createLinearGradient(x - 20, 0, x + 20, 0);
    grad.addColorStop(0, 'rgba(255, 255, 255, 0.1)');
    grad.addColorStop(0.5, 'rgba(175, 168, 158, 0.24)');
    grad.addColorStop(1, 'rgba(255, 255, 255, 0.1)');
    ctx.fillStyle = grad;
    ctx.fillRect(x - 20, 0, 40, 1024);
  }

  sharedAbayaTexture = new THREE.CanvasTexture(canvas);
  sharedAbayaTexture.wrapS = THREE.RepeatWrapping;
  sharedAbayaTexture.wrapT = THREE.RepeatWrapping;
  return sharedAbayaTexture;
}

function getAbayaBumpMap(): THREE.CanvasTexture {
  if (sharedAbayaBumpMap) return sharedAbayaBumpMap;

  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#808080';
  ctx.fillRect(0, 0, 1024, 1024);

  for (let x = 120; x < 950; x += 120) {
    ctx.strokeStyle = '#5a5a5a';
    ctx.lineWidth = 14;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, 1024);
    ctx.stroke();

    ctx.strokeStyle = '#b8b8b8';
    ctx.lineWidth = 10;
    ctx.beginPath();
    ctx.moveTo(x + 8, 0);
    ctx.lineTo(x + 8, 1024);
    ctx.stroke();
  }

  sharedAbayaBumpMap = new THREE.CanvasTexture(canvas);
  sharedAbayaBumpMap.wrapS = THREE.RepeatWrapping;
  sharedAbayaBumpMap.wrapT = THREE.RepeatWrapping;
  return sharedAbayaBumpMap;
}

// =============================================================================
// AVATAR MODEL CLASS (Ultra-High-Definition Realistic 3D Pilgrim)
// =============================================================================
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
  public prayerPose: SolatAvatarPose = 'berdiri';
  public isIstilam: boolean = false;
  public istilamTimer: number = 0;
  public isRaml: boolean = false;

  public setPrayerPose(pose: SolatAvatarPose) {
    this.prayerPose = pose;
  }

  public performIstilam(durationSeconds: number = 2.5) {
    this.isIstilam = true;
    this.istilamTimer = durationSeconds;
  }

  public setRaml(active: boolean) {
    this.isRaml = active;
  }

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

    // -------------------------------------------------------------------------
    // HIGH-QUALITY PBR MATERIALS (Matched to Reference Images)
    // -------------------------------------------------------------------------
    // Natural sun-kissed skin tone with authentic subcutaneous warmth
    const skinMat = new THREE.MeshStandardMaterial({
      color: this.gender === 'male' ? 0xc48c69 : 0xd19f7e,
      roughness: 0.62,
      metalness: 0.03
    });

    // Pure clean Ihram woven cotton material with dynamic normal/bump creases
    const ihramClothMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      map: getIhramTexture(),
      bumpMap: getIhramBumpMap(),
      bumpScale: 0.052,
      roughness: 0.82,
      metalness: 0.02
    });

    // Modest elegant female Abaya / Jubah material
    const abayaMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      map: getAbayaTexture(),
      bumpMap: getAbayaBumpMap(),
      bumpScale: 0.048,
      roughness: 0.85,
      metalness: 0.02
    });

    // Shaded inner drapery folds material for enhanced depth & self-shadowing
    const clothShadeMat = new THREE.MeshStandardMaterial({
      color: 0xded8ce,
      map: getIhramTexture(),
      bumpMap: getIhramBumpMap(),
      bumpScale: 0.065,
      roughness: 0.88,
      metalness: 0.02
    });

    // Woven fringed tassel trim material
    const fringeMat = new THREE.MeshStandardMaterial({
      color: 0xeae4db,
      map: getIhramTexture(),
      bumpMap: getIhramBumpMap(),
      bumpScale: 0.06,
      roughness: 0.92,
      metalness: 0.0
    });

    // Natural wavy hair material
    const hairMat = new THREE.MeshStandardMaterial({
      color: 0x1f1915,
      map: getHairTexture(),
      roughness: 0.72,
      metalness: 0.08
    });

    // Pilgrim waist pouch belt (Talbiyah belt)
    const beltMat = new THREE.MeshStandardMaterial({
      color: 0x245e2a, // Traditional green pilgrimage belt
      roughness: 0.52,
      metalness: 0.18
    });
    const buckleMat = new THREE.MeshStandardMaterial({
      color: 0xd4af37, // Polished brass gold
      roughness: 0.28,
      metalness: 0.85
    });

    // Authentic Chestnut Brown Leather Pilgrimage Sandals
    const sandalSoleMat = new THREE.MeshStandardMaterial({
      color: 0x7a3e26, // Warm rich chestnut leather
      map: getLeatherTexture(),
      roughness: 0.52,
      metalness: 0.12
    });
    const sandalStrapMat = new THREE.MeshStandardMaterial({
      color: 0x5a2d1a, // Darker leather strap
      roughness: 0.48,
      metalness: 0.15
    });
    const treadMat = new THREE.MeshStandardMaterial({
      color: 0x332219, // Durable bottom rubber grip
      roughness: 0.8,
      metalness: 0.02
    });

    // Facial feature materials
    const eyeMat = new THREE.MeshBasicMaterial({ color: 0x1a1512 });
    const eyeWhiteMat = new THREE.MeshBasicMaterial({ color: 0xf6f6f6 });
    const lipMat = new THREE.MeshStandardMaterial({
      color: this.gender === 'male' ? 0xa86758 : 0xb86e64,
      roughness: 0.68
    });

    // =========================================================================
    // 1. TORSO & IHRAM CLOTHING (Sculpted Cowl, Mantle, Folds & Drapery)
    // =========================================================================
    this.torso = new THREE.Group();
    this.torso.position.y = this.gender === 'male' ? 1.05 : 0.95;

    if (this.gender === 'male') {
      // Anatomical upper torso foundation
      const chestGeo = new THREE.CylinderGeometry(0.24, 0.19, 0.45, 18);
      const chestMesh = new THREE.Mesh(chestGeo, skinMat);
      chestMesh.castShadow = true;
      chestMesh.receiveShadow = true;
      this.torso.add(chestMesh);

      // Clavicle & sternum contours
      const clavicleGeo = new THREE.BoxGeometry(0.34, 0.02, 0.035);
      const clavicle = new THREE.Mesh(clavicleGeo, skinMat);
      clavicle.position.set(0, 0.20, 0.095);
      this.torso.add(clavicle);

      // --- UPPER SHAWL / CAPE (RIDA') MATCHING FRONT/BACK REFERENCE ---
      // Main flowing mantle draped over both shoulders
      const mantleGeo = new THREE.CylinderGeometry(0.33, 0.43, 0.66, 24, 1, true);
      const mantle = new THREE.Mesh(mantleGeo, ihramClothMat);
      mantle.position.set(0, 0.06, 0);
      mantle.castShadow = true;
      mantle.receiveShadow = true;
      this.torso.add(mantle);

      // --- ICONIC NECK COWL / HOOD-LIKE DRAPERY AT UPPER BACK ---
      // Distinct loose cowled fabric roll around back of neck & shoulders
      const cowlRollGeo = new THREE.TorusGeometry(0.20, 0.062, 14, 28, Math.PI * 1.55);
      const cowlRoll = new THREE.Mesh(cowlRollGeo, clothShadeMat);
      cowlRoll.position.set(0, 0.22, -0.06);
      cowlRoll.rotation.x = Math.PI / 2.5;
      cowlRoll.rotation.z = Math.PI;
      cowlRoll.castShadow = true;
      this.torso.add(cowlRoll);

      // Cowl cascading flap down the spine
      const cowlFlapGeo = new THREE.CylinderGeometry(
        0.28,
        0.39,
        0.36,
        18,
        1,
        true,
        -Math.PI * 0.45,
        Math.PI * 0.9
      );
      const cowlFlap = new THREE.Mesh(cowlFlapGeo, clothShadeMat);
      cowlFlap.position.set(0, 0.08, -0.05);
      cowlFlap.castShadow = true;
      this.torso.add(cowlFlap);

      // --- REALISTIC 3D SCULPTED FABRIC FOLD RIDGES ---
      // Diagonal fold sweeping across back & shoulder
      const fold1 = new THREE.Mesh(
        new THREE.TorusGeometry(0.34, 0.024, 10, 20, Math.PI * 0.7),
        clothShadeMat
      );
      fold1.position.set(0.04, 0.02, -0.05);
      fold1.rotation.set(0.4, 0.3, 0.7);
      fold1.castShadow = true;
      this.torso.add(fold1);

      const fold2 = new THREE.Mesh(
        new THREE.TorusGeometry(0.36, 0.022, 10, 20, Math.PI * 0.65),
        clothShadeMat
      );
      fold2.position.set(-0.04, -0.12, -0.05);
      fold2.rotation.set(0.35, -0.3, 0.6);
      fold2.castShadow = true;
      this.torso.add(fold2);

      // Front diagonal wrap panel overlapping across chest
      const frontOverlap = new THREE.Mesh(
        new THREE.CylinderGeometry(0.34, 0.44, 0.60, 20, 1, false, -Math.PI * 0.25, Math.PI * 0.85),
        ihramClothMat
      );
      frontOverlap.position.set(-0.02, 0.04, 0.025);
      frontOverlap.rotation.z = -0.07;
      frontOverlap.castShadow = true;
      frontOverlap.receiveShadow = true;
      this.torso.add(frontOverlap);

      // Front tension crease ridge
      const frontCrease = new THREE.Mesh(
        new THREE.BoxGeometry(0.05, 0.42, 0.04),
        clothShadeMat
      );
      frontCrease.position.set(0.05, 0.02, 0.22);
      frontCrease.rotation.z = 0.35;
      frontCrease.castShadow = true;
      this.torso.add(frontCrease);

      // Shawl hem fringe border
      const shawlFringe = new THREE.Mesh(
        new THREE.CylinderGeometry(0.342, 0.442, 0.045, 24, 1, true),
        fringeMat
      );
      shawlFringe.position.set(0, -0.24, 0);
      shawlFringe.castShadow = true;
      this.torso.add(shawlFringe);

      // --- PILGRIM WAIST BELT & TALBIYAH POUCH ---
      const beltGeo = new THREE.CylinderGeometry(0.23, 0.23, 0.055, 20);
      const belt = new THREE.Mesh(beltGeo, beltMat);
      belt.position.set(0, -0.19, 0);
      belt.castShadow = true;
      this.torso.add(belt);

      // Zippered essentials pouch
      const pouchGeo = new THREE.BoxGeometry(0.11, 0.085, 0.055);
      const pouch = new THREE.Mesh(pouchGeo, beltMat);
      pouch.position.set(0.13, -0.19, 0.21);
      pouch.rotation.y = 0.4;
      pouch.castShadow = true;
      this.torso.add(pouch);

      // Brass buckle
      const buckleGeo = new THREE.BoxGeometry(0.045, 0.06, 0.018);
      const buckle = new THREE.Mesh(buckleGeo, buckleMat);
      buckle.position.set(0, -0.19, 0.235);
      this.torso.add(buckle);

      // --- LOWER GARMENT (IZAR / SARONG WRAP) ---
      // Upper waistband / tuck roll
      const izarRoll = new THREE.Mesh(
        new THREE.TorusGeometry(0.235, 0.028, 12, 24),
        ihramClothMat
      );
      izarRoll.position.set(0, -0.22, 0);
      izarRoll.rotation.x = Math.PI / 2;
      this.torso.add(izarRoll);

      // Izar upper wrap section (pelvic & hip area)
      const izarTop = new THREE.Mesh(
        new THREE.CylinderGeometry(0.23, 0.28, 0.38, 20),
        ihramClothMat
      );
      izarTop.position.set(0, -0.28, 0);
      izarTop.castShadow = true;
      izarTop.receiveShadow = true;
      this.torso.add(izarTop);

      // Vertical wrapped overlap fold down the front
      const frontWrapFold = new THREE.Mesh(
        new THREE.BoxGeometry(0.09, 0.40, 0.055),
        clothShadeMat
      );
      frontWrapFold.position.set(-0.07, -0.28, 0.235);
      frontWrapFold.rotation.y = -0.22;
      frontWrapFold.castShadow = true;
      this.torso.add(frontWrapFold);

    } else {
      // Female Pilgrim: Refined human silhouette with flowing Abaya/Jubah
      const upperTorso = new THREE.Mesh(
        new THREE.CylinderGeometry(0.19, 0.23, 0.42, 18),
        abayaMat
      );
      upperTorso.position.set(0, 0.20, 0);
      upperTorso.castShadow = true;
      upperTorso.receiveShadow = true;
      this.torso.add(upperTorso);

      const lowerTorso = new THREE.Mesh(
        new THREE.CylinderGeometry(0.23, 0.38, 0.72, 20),
        abayaMat
      );
      lowerTorso.position.set(0, -0.26, 0);
      lowerTorso.castShadow = true;
      lowerTorso.receiveShadow = true;
      this.torso.add(lowerTorso);

      // Graceful vertical pleats for authentic fabric drape
      for (let i = 0; i < 5; i++) {
        const pleatAngle = (i - 2) * 0.42;
        const pleat = new THREE.Mesh(
          new THREE.CylinderGeometry(0.016, 0.024, 0.70, 8),
          clothShadeMat
        );
        pleat.position.set(Math.sin(pleatAngle) * 0.28, -0.26, Math.cos(pleatAngle) * 0.29);
        this.torso.add(pleat);
      }
    }
    this.group.add(this.torso);

    // =========================================================================
    // 2. HEAD & FACIAL FEATURES (Anatomical Cranium, Layered Wavy Hair, Beard)
    // =========================================================================
    this.head = new THREE.Group();
    this.head.position.y = this.gender === 'male' ? 1.54 : 1.48;

    // Muscular neck
    const neck = new THREE.Mesh(
      new THREE.CylinderGeometry(
        this.gender === 'male' ? 0.072 : 0.062,
        this.gender === 'male' ? 0.088 : 0.076,
        0.15,
        16
      ),
      skinMat
    );
    neck.position.y = -0.12;
    neck.castShadow = true;
    this.head.add(neck);

    // Adam's apple for male
    if (this.gender === 'male') {
      const adamsApple = new THREE.Mesh(new THREE.ConeGeometry(0.018, 0.032, 8), skinMat);
      adamsApple.position.set(0, -0.10, 0.082);
      adamsApple.rotation.x = Math.PI / 2;
      this.head.add(adamsApple);
    }

    // Cranium / Upper Head
    const headCranium = new THREE.Mesh(
      new THREE.SphereGeometry(this.gender === 'male' ? 0.142 : 0.136, 24, 20),
      skinMat
    );
    headCranium.scale.set(1.0, 1.13, 1.06);
    headCranium.castShadow = true;
    this.head.add(headCranium);

    // Jaw & Chin
    const jaw = new THREE.Mesh(
      new THREE.CylinderGeometry(
        this.gender === 'male' ? 0.112 : 0.096,
        this.gender === 'male' ? 0.078 : 0.056,
        0.13,
        16
      ),
      skinMat
    );
    jaw.position.set(0, -0.078, 0.032);
    this.head.add(jaw);

    // Cheeks
    const leftCheek = new THREE.Mesh(new THREE.SphereGeometry(0.046, 10, 10), skinMat);
    leftCheek.position.set(-0.082, -0.03, 0.092);
    this.head.add(leftCheek);
    const rightCheek = new THREE.Mesh(new THREE.SphereGeometry(0.046, 10, 10), skinMat);
    rightCheek.position.set(0.082, -0.03, 0.092);
    this.head.add(rightCheek);

    // Sculpted Nose
    const noseBridge = new THREE.Mesh(new THREE.BoxGeometry(0.024, 0.07, 0.034), skinMat);
    noseBridge.position.set(0, 0.005, 0.158);
    this.head.add(noseBridge);

    const noseTip = new THREE.Mesh(new THREE.SphereGeometry(0.022, 10, 10), skinMat);
    noseTip.position.set(0, -0.026, 0.168);
    this.head.add(noseTip);

    // Realistic Eyes with Sclera & Iris
    const buildEye = (isLeft: boolean) => {
      const socket = new THREE.Group();
      socket.position.set(isLeft ? -0.052 : 0.052, 0.02, 0.134);

      const sclera = new THREE.Mesh(new THREE.SphereGeometry(0.022, 10, 8), eyeWhiteMat);
      sclera.scale.set(1, 0.75, 0.6);
      socket.add(sclera);

      const pupil = new THREE.Mesh(new THREE.SphereGeometry(0.013, 8, 8), eyeMat);
      pupil.position.set(0, 0, 0.013);
      socket.add(pupil);

      return socket;
    };
    this.head.add(buildEye(true));
    this.head.add(buildEye(false));

    // Eyebrows
    const browGeo = new THREE.BoxGeometry(0.05, 0.014, 0.02);
    const browLeft = new THREE.Mesh(browGeo, hairMat);
    browLeft.position.set(-0.052, 0.05, 0.144);
    browLeft.rotation.z = 0.08;
    this.head.add(browLeft);

    const browRight = new THREE.Mesh(browGeo, hairMat);
    browRight.position.set(0.052, 0.05, 0.144);
    browRight.rotation.z = -0.08;
    this.head.add(browRight);

    // Lips / Mouth
    const lips = new THREE.Mesh(new THREE.CylinderGeometry(0.036, 0.036, 0.014, 10), lipMat);
    lips.rotation.x = Math.PI / 2;
    lips.scale.set(1, 0.5, 1);
    lips.position.set(0, -0.066, 0.138);
    this.head.add(lips);

    // Anatomical Ears
    const earGeo = new THREE.CylinderGeometry(0.032, 0.024, 0.016, 12);
    const leftEar = new THREE.Mesh(earGeo, skinMat);
    leftEar.position.set(-0.146, 0, 0);
    leftEar.rotation.set(0, 0.2, Math.PI / 2 + 0.15);
    leftEar.scale.set(1.4, 0.6, 1.0);
    this.head.add(leftEar);

    const rightEar = new THREE.Mesh(earGeo, skinMat);
    rightEar.position.set(0.146, 0, 0);
    rightEar.rotation.set(0, -0.2, -Math.PI / 2 - 0.15);
    rightEar.scale.set(1.4, 0.6, 1.0);
    this.head.add(rightEar);

    if (this.gender === 'male') {
      // --- LAYERED WAVY STYLIZED HAIR (MATCHES REFERENCE) ---
      // Base hair crown covering skull
      const hairCrown = new THREE.Mesh(
        new THREE.SphereGeometry(0.156, 24, 20, 0, Math.PI * 2, 0, Math.PI * 0.58),
        hairMat
      );
      hairCrown.position.set(0, 0.022, -0.01);
      this.head.add(hairCrown);

      const hairBack = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.16, 0.13), hairMat);
      hairBack.position.set(0, 0.01, -0.095);
      this.head.add(hairBack);

      // Sculpted wavy hair tufts & locks on top & sides for natural volume
      const lock1 = new THREE.Mesh(new THREE.SphereGeometry(0.065, 10, 8), hairMat);
      lock1.position.set(0.04, 0.13, 0.04);
      lock1.scale.set(1.3, 0.6, 1.0);
      lock1.rotation.y = 0.3;
      this.head.add(lock1);

      const lock2 = new THREE.Mesh(new THREE.SphereGeometry(0.062, 10, 8), hairMat);
      lock2.position.set(-0.05, 0.125, 0.035);
      lock2.scale.set(1.2, 0.6, 1.0);
      lock2.rotation.y = -0.3;
      this.head.add(lock2);

      const lock3 = new THREE.Mesh(new THREE.SphereGeometry(0.058, 10, 8), hairMat);
      lock3.position.set(0, 0.14, -0.04);
      lock3.scale.set(1.4, 0.7, 1.1);
      this.head.add(lock3);

      // Neat sideburns
      const sideburnL = new THREE.Mesh(new THREE.BoxGeometry(0.022, 0.075, 0.032), hairMat);
      sideburnL.position.set(-0.140, -0.01, 0.032);
      this.head.add(sideburnL);
      const sideburnR = new THREE.Mesh(new THREE.BoxGeometry(0.022, 0.075, 0.032), hairMat);
      sideburnR.position.set(0.140, -0.01, 0.032);
      this.head.add(sideburnR);

      // Sunnah trimmed beard along jawline
      const beardJaw = new THREE.Mesh(
        new THREE.CylinderGeometry(0.118, 0.085, 0.095, 16, 1, true, -Math.PI * 0.75, Math.PI * 1.5),
        hairMat
      );
      beardJaw.position.set(0, -0.082, 0.036);
      this.head.add(beardJaw);

      // Chin beard tuft
      const chinBeard = new THREE.Mesh(new THREE.SphereGeometry(0.046, 12, 10), hairMat);
      chinBeard.position.set(0, -0.128, 0.078);
      chinBeard.scale.set(1.1, 0.85, 1.0);
      this.head.add(chinBeard);

    } else {
      // Female Pilgrim: Elegant Modest Telekung / Hijab / Khimar
      const hijabInner = new THREE.Mesh(new THREE.SphereGeometry(0.146, 20, 18), clothShadeMat);
      hijabInner.position.set(0, 0.01, -0.01);
      this.head.add(hijabInner);

      const hijabCrown = new THREE.Mesh(
        new THREE.SphereGeometry(0.168, 24, 20, 0, Math.PI * 2, 0, Math.PI * 0.65),
        abayaMat
      );
      hijabCrown.position.set(0, 0.02, -0.015);
      hijabCrown.castShadow = true;
      this.head.add(hijabCrown);

      const khimarGeo = new THREE.CylinderGeometry(0.17, 0.39, 0.48, 24);
      const khimar = new THREE.Mesh(khimarGeo, abayaMat);
      khimar.position.set(0, -0.22, 0.01);
      khimar.castShadow = true;
      khimar.receiveShadow = true;
      this.head.add(khimar);

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
    this.mutawwifFlagGroup.position.set(0.04, 0.18, -0.02);

    const poleMat = new THREE.MeshStandardMaterial({
      color: 0xdcdcdc,
      metalness: 0.85,
      roughness: 0.25
    });
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.009, 0.009, 0.72, 8), poleMat);
    pole.position.set(0, 0.36, 0);
    pole.castShadow = true;
    this.mutawwifFlagGroup.add(pole);

    const finialMat = new THREE.MeshStandardMaterial({
      color: 0xd4af37,
      metalness: 0.9,
      roughness: 0.2
    });
    const finial = new THREE.Mesh(new THREE.SphereGeometry(0.024, 10, 10), finialMat);
    finial.position.set(0, 0.72, 0);
    this.mutawwifFlagGroup.add(finial);

    const flagShape = new THREE.Shape();
    flagShape.moveTo(0, 0);
    flagShape.lineTo(0.36, 0.12);
    flagShape.lineTo(0, 0.24);
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

    this.mutawwifFlagGroup.visible = this.role === 'mutawwif';
    this.head.add(this.mutawwifFlagGroup);

    this.group.add(this.head);

    // =========================================================================
    // 3. ARMS & HANDS (Anatomical Deltoids, Biceps, Forearms, Palm & Fingers)
    // =========================================================================
    this.leftArm = new THREE.Group();
    this.rightArm = new THREE.Group();

    const shoulderY = this.gender === 'male' ? 1.28 : 1.22;
    const shoulderWidth = this.gender === 'male' ? 0.31 : 0.25;

    this.leftArm.position.set(-shoulderWidth, shoulderY, 0);
    this.rightArm.position.set(shoulderWidth, shoulderY, 0);

    const buildArm = (isLeft: boolean): THREE.Group => {
      const armGroup = new THREE.Group();
      const side = isLeft ? -1 : 1;

      // Deltoid / Shoulder cap
      const shoulderGeo = new THREE.SphereGeometry(this.gender === 'male' ? 0.078 : 0.065, 14, 12);
      const shoulderMesh = new THREE.Mesh(shoulderGeo, ihramClothMat);
      shoulderMesh.position.set(0, 0, 0);
      shoulderMesh.castShadow = true;
      armGroup.add(shoulderMesh);

      if (this.gender === 'male') {
        // Upper arm draped cloth sleeve
        const upperArmCloth = new THREE.Mesh(
          new THREE.CylinderGeometry(0.072, 0.064, 0.16, 14),
          ihramClothMat
        );
        upperArmCloth.position.y = -0.08;
        upperArmCloth.castShadow = true;
        armGroup.add(upperArmCloth);

        // Bare lower bicep / elbow
        const bicep = new THREE.Mesh(
          new THREE.CylinderGeometry(0.062, 0.055, 0.15, 14),
          skinMat
        );
        bicep.position.y = -0.21;
        bicep.castShadow = true;
        armGroup.add(bicep);

        // Forearm with anatomical taper towards wrist
        const forearm = new THREE.Mesh(
          new THREE.CylinderGeometry(0.055, 0.043, 0.26, 14),
          skinMat
        );
        forearm.position.y = -0.38;
        forearm.castShadow = true;
        armGroup.add(forearm);
      } else {
        // Female modest long sleeve
        const sleeve = new THREE.Mesh(
          new THREE.CylinderGeometry(0.064, 0.074, 0.44, 16),
          abayaMat
        );
        sleeve.position.y = -0.22;
        sleeve.castShadow = true;
        armGroup.add(sleeve);

        const cuff = new THREE.Mesh(
          new THREE.CylinderGeometry(0.075, 0.075, 0.03, 16),
          clothShadeMat
        );
        cuff.position.y = -0.43;
        armGroup.add(cuff);

        const wrist = new THREE.Mesh(
          new THREE.CylinderGeometry(0.042, 0.038, 0.06, 12),
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
        new THREE.BoxGeometry(0.044, 0.076, 0.066),
        skinMat
      );
      palm.castShadow = true;
      handGroup.add(palm);

      // Thumb
      const thumb = new THREE.Mesh(
        new THREE.CylinderGeometry(0.013, 0.010, 0.044, 10),
        skinMat
      );
      thumb.position.set(side * 0.025, 0.016, 0.025);
      thumb.rotation.x = 0.4;
      thumb.rotation.z = side * -0.6;
      handGroup.add(thumb);

      // Four fingers
      const fingers = new THREE.Mesh(
        new THREE.BoxGeometry(0.038, 0.048, 0.058),
        skinMat
      );
      fingers.position.set(0, -0.054, 0);
      handGroup.add(fingers);

      armGroup.add(handGroup);
      return armGroup;
    };

    this.leftArm.add(buildArm(true));
    this.rightArm.add(buildArm(false));

    this.group.add(this.leftArm);
    this.group.add(this.rightArm);

    // =========================================================================
    // 4. LEGS, FEET & AUTHENTIC PILGRIMAGE SANDALS (Matched to Reference)
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
        // Ihram Izar (Lower cloth wrap column)
        const izarLeg = new THREE.Mesh(
          new THREE.CylinderGeometry(0.155, 0.175, 0.54, 18),
          ihramClothMat
        );
        izarLeg.position.y = -0.22;
        izarLeg.castShadow = true;
        izarLeg.receiveShadow = true;
        legGroup.add(izarLeg);

        // Izar bottom hem fringe
        const izarFringe = new THREE.Mesh(
          new THREE.CylinderGeometry(0.176, 0.180, 0.038, 18, 1, true),
          fringeMat
        );
        izarFringe.position.y = -0.47;
        legGroup.add(izarFringe);

        // Lower calf & Achilles tendon
        const calf = new THREE.Mesh(
          new THREE.CylinderGeometry(0.060, 0.046, 0.25, 14),
          skinMat
        );
        calf.position.y = -0.54;
        calf.castShadow = true;
        legGroup.add(calf);

        // Ankle joint malleolus
        const ankleBone = new THREE.Mesh(new THREE.SphereGeometry(0.048, 10, 10), skinMat);
        ankleBone.position.set(side * 0.022, -0.62, 0);
        ankleBone.scale.set(0.6, 0.6, 0.8);
        legGroup.add(ankleBone);

        // Foot with instep arch and toes
        const foot = new THREE.Mesh(new THREE.BoxGeometry(0.084, 0.052, 0.165), skinMat);
        foot.position.set(0, -0.66, 0.04);
        foot.castShadow = true;
        legGroup.add(foot);

        const toes = new THREE.Mesh(new THREE.BoxGeometry(0.080, 0.034, 0.052), skinMat);
        toes.position.set(0, -0.67, 0.135);
        legGroup.add(toes);

        // --- AUTHENTIC PILGRIMAGE SANDALS (CHESTNUT LEATHER & ERGONOMIC SOLE) ---
        // 1. Bottom Rubber Grip Tread
        const sandalTread = new THREE.Mesh(
          new THREE.BoxGeometry(0.108, 0.016, 0.23),
          treadMat
        );
        sandalTread.position.set(0, -0.70, 0.04);
        sandalTread.castShadow = true;
        legGroup.add(sandalTread);

        // 2. Contoured Leather Footbed Sole
        const sandalSole = new THREE.Mesh(
          new THREE.BoxGeometry(0.104, 0.018, 0.225),
          sandalSoleMat
        );
        sandalSole.position.set(0, -0.685, 0.04);
        sandalSole.castShadow = true;
        legGroup.add(sandalSole);

        // 3. V-Thong Leather Straps
        const strap1 = new THREE.Mesh(
          new THREE.BoxGeometry(0.085, 0.016, 0.024),
          sandalStrapMat
        );
        strap1.position.set(0.022, -0.655, 0.065);
        strap1.rotation.set(0, 0.52, -0.32);
        legGroup.add(strap1);

        const strap2 = new THREE.Mesh(
          new THREE.BoxGeometry(0.085, 0.016, 0.024),
          sandalStrapMat
        );
        strap2.position.set(-0.022, -0.655, 0.065);
        strap2.rotation.set(0, -0.52, 0.32);
        legGroup.add(strap2);

        // 4. Central Toe Post
        const toePost = new THREE.Mesh(
          new THREE.CylinderGeometry(0.007, 0.007, 0.038, 8),
          sandalStrapMat
        );
        toePost.position.set(0, -0.665, 0.115);
        legGroup.add(toePost);

      } else {
        // Female: Jubah skirt covering down to shoes
        const skirtColumn = new THREE.Mesh(
          new THREE.CylinderGeometry(0.165, 0.195, 0.56, 16),
          abayaMat
        );
        skirtColumn.position.y = -0.24;
        skirtColumn.castShadow = true;
        legGroup.add(skirtColumn);

        // Modest walking shoe / comfortable pilgrimage flats
        const shoe = new THREE.Mesh(
          new THREE.BoxGeometry(0.086, 0.055, 0.175),
          sandalSoleMat
        );
        shoe.position.set(0, -0.66, 0.03);
        shoe.castShadow = true;
        legGroup.add(shoe);

        const shoeSole = new THREE.Mesh(
          new THREE.BoxGeometry(0.090, 0.02, 0.185),
          treadMat
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
   * Procedural animation loop (realistic walking gait, swinging limbs, breathing)
   */
  public update(delta: number, isMoving: boolean, speedMultiplier: number = 1.0) {
    if (this.isRaml && isMoving) {
      speedMultiplier *= 1.35;
    }
    this.animTimer += delta * (isMoving ? 8 * speedMultiplier : 1.8);

    if (this.isIstilam) {
      this.istilamTimer -= delta;
      if (this.istilamTimer <= 0) {
        this.isIstilam = false;
      }
    }

    if (isMoving) {
      // Natural walking / running limb swings with subtle sideways sway
      const legAngle = Math.sin(this.animTimer) * (this.isRaml ? 0.78 : 0.62);
      const armAngle = -Math.sin(this.animTimer) * 0.58;

      this.leftLeg.rotation.x = legAngle;
      this.rightLeg.rotation.x = -legAngle;

      this.leftArm.rotation.x = armAngle;
      if (this.isIstilam) {
        // Raise right arm towards Hajarul Aswad with open palm gesture
        this.rightArm.rotation.set(-2.2, -0.15, 0.35);
        this.head.rotation.set(0.08, -0.28, 0);
      } else {
        this.rightArm.rotation.x = -armAngle;
      }

      // Subtle hip & spine rotation for realistic gait
      const spineTwist = Math.sin(this.animTimer) * 0.05;
      this.torso.rotation.y = spineTwist;
      if (!this.isIstilam) {
        this.head.rotation.y = -spineTwist * 0.5;
      }

      // Natural vertical bobbing
      const baseTorsoY = this.gender === 'male' ? 1.05 : 0.95;
      const baseHeadY = this.gender === 'male' ? 1.54 : 1.48;
      const bob = Math.abs(Math.sin(this.animTimer * 2)) * (this.isRaml ? 0.075 : 0.04);
      this.torso.position.y = baseTorsoY + bob;
      this.head.position.y = baseHeadY + bob;

      // Realistic flag flutter & wind dynamic reaction while moving
      if (this.mutawwifFlagMesh && this.mutawwifFlagGroup.visible) {
        this.mutawwifFlagMesh.rotation.y = Math.sin(this.animTimer * 2.2) * 0.28;
        this.mutawwifFlagMesh.rotation.z = Math.cos(this.animTimer * 1.8) * 0.08;
      }
    } else if (this.isIstilam) {
      // Standing still and performing Istilam
      const baseTorsoY = this.gender === 'male' ? 1.05 : 0.95;
      const baseHeadY = this.gender === 'male' ? 1.54 : 1.48;
      this.torso.position.y = baseTorsoY;
      this.head.position.y = baseHeadY;
      this.leftArm.rotation.set(0.08, 0, 0);
      this.rightArm.rotation.set(-2.2, -0.15, 0.35);
      this.head.rotation.set(0.08, -0.28, 0);
      this.leftLeg.rotation.set(0, 0, 0);
      this.rightLeg.rotation.set(0, 0, 0);
    } else if (this.prayerPose !== 'berdiri') {
      // Interactive Prayer Poser (Rukun Solat Poses)
      const baseTorsoY = this.gender === 'male' ? 1.05 : 0.95;
      const baseHeadY = this.gender === 'male' ? 1.54 : 1.48;

      if (this.prayerPose === 'takbir') {
        // Takbiratul Ihram: Hands raised beside ears/shoulders
        this.leftArm.rotation.set(-2.3, 0.1, -0.45);
        this.rightArm.rotation.set(-2.3, -0.1, 0.45);
        this.head.rotation.set(0.18, 0, 0);
        this.torso.rotation.set(0, 0, 0);
        this.leftLeg.rotation.set(0, 0, 0);
        this.rightLeg.rotation.set(0, 0, 0);
        this.torso.position.y = baseTorsoY;
        this.head.position.y = baseHeadY;
        this.head.position.z = 0;
      } else if (this.prayerPose === 'qiyam') {
        // Qiyam: Hands folded across chest (bersedekap)
        this.leftArm.rotation.set(-1.25, 0.25, 0.42);
        this.rightArm.rotation.set(-1.32, -0.25, -0.42);
        this.head.rotation.set(0.24, 0, 0);
        this.torso.rotation.set(0, 0, 0);
        this.leftLeg.rotation.set(0, 0, 0);
        this.rightLeg.rotation.set(0, 0, 0);
        this.torso.position.y = baseTorsoY;
        this.head.position.y = baseHeadY;
        this.head.position.z = 0;
      } else if (this.prayerPose === 'ruku') {
        // Ruku': Torso bent forward ~80-90 degrees, hands holding knees
        this.torso.rotation.set(1.35, 0, 0);
        this.head.rotation.set(0.1, 0, 0);
        this.leftArm.rotation.set(0.25, 0, -0.1);
        this.rightArm.rotation.set(0.25, 0, 0.1);
        this.leftLeg.rotation.set(0, 0, 0);
        this.rightLeg.rotation.set(0, 0, 0);
        this.torso.position.y = baseTorsoY - 0.25;
        this.head.position.y = baseHeadY - 0.58;
        this.head.position.z = 0.52;
      } else if (this.prayerPose === 'itidal') {
        // I'tidal: Standing upright after bowing
        this.torso.rotation.set(0, 0, 0);
        this.head.rotation.set(0.12, 0, 0);
        this.leftArm.rotation.set(0.08, 0, 0);
        this.rightArm.rotation.set(0.08, 0, 0);
        this.leftLeg.rotation.set(0, 0, 0);
        this.rightLeg.rotation.set(0, 0, 0);
        this.torso.position.y = baseTorsoY;
        this.head.position.y = baseHeadY;
        this.head.position.z = 0;
      } else if (this.prayerPose === 'sujud1' || this.prayerPose === 'sujud2') {
        // Sujud: Prostrating down to the ground
        this.torso.rotation.set(1.57, 0, 0);
        this.head.rotation.set(0.35, 0, 0);
        this.leftArm.rotation.set(1.35, 0, -0.35);
        this.rightArm.rotation.set(1.35, 0, 0.35);
        this.leftLeg.rotation.set(1.55, 0, 0);
        this.rightLeg.rotation.set(1.55, 0, 0);
        this.torso.position.y = 0.34;
        this.head.position.y = 0.2;
        this.head.position.z = 0.65;
      } else if (this.prayerPose === 'duduk' || this.prayerPose === 'tahiyyat' || this.prayerPose === 'selesai') {
        // Sitting on the ground (iftirasy / tawarruk)
        this.torso.rotation.set(0, 0, 0);
        this.head.rotation.set(0.22, 0, 0);
        this.leftArm.rotation.set(-0.6, 0, 0.15);
        this.rightArm.rotation.set(-0.6, 0, -0.15);
        this.leftLeg.rotation.set(1.48, 0, 0);
        this.rightLeg.rotation.set(1.48, 0, 0);
        this.torso.position.y = 0.52;
        this.head.position.y = 0.98;
        this.head.position.z = 0;
      } else if (this.prayerPose === 'salam_kanan') {
        // Salam to the right
        this.torso.rotation.set(0, 0, 0);
        this.head.rotation.set(0.1, -1.05, 0);
        this.leftArm.rotation.set(-0.6, 0, 0.15);
        this.rightArm.rotation.set(-0.6, 0, -0.15);
        this.leftLeg.rotation.set(1.48, 0, 0);
        this.rightLeg.rotation.set(1.48, 0, 0);
        this.torso.position.y = 0.52;
        this.head.position.y = 0.98;
        this.head.position.z = 0;
      } else if (this.prayerPose === 'salam_kiri') {
        // Salam to the left
        this.torso.rotation.set(0, 0, 0);
        this.head.rotation.set(0.1, 1.05, 0);
        this.leftArm.rotation.set(-0.6, 0, 0.15);
        this.rightArm.rotation.set(-0.6, 0, -0.15);
        this.leftLeg.rotation.set(1.48, 0, 0);
        this.rightLeg.rotation.set(1.48, 0, 0);
        this.torso.position.y = 0.52;
        this.head.position.y = 0.98;
        this.head.position.z = 0;
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
