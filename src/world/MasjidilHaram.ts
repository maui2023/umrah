import * as THREE from 'three';
import { CheckpointZone } from '../types';
import { MadinahZone } from './MadinahZone';

// =============================================================================
// PROCEDURAL REALISTIC ROCK TEXTURES & 3D POLY MOUNTAIN HELPERS (Bukit Safa & Marwah)
// =============================================================================
let sharedRockTexture: THREE.CanvasTexture | null = null;
let sharedRockBumpMap: THREE.CanvasTexture | null = null;

function getRealisticRockTexture(): THREE.CanvasTexture {
  if (sharedRockTexture) return sharedRockTexture;

  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d')!;

  // 1. Natural warm weathered Makkah mountain granite base (earthy brownish-grey)
  const baseGrad = ctx.createLinearGradient(0, 0, 1024, 1024);
  baseGrad.addColorStop(0, '#584738');
  baseGrad.addColorStop(0.35, '#6a5644');
  baseGrad.addColorStop(0.65, '#504133');
  baseGrad.addColorStop(1, '#614f3e');
  ctx.fillStyle = baseGrad;
  ctx.fillRect(0, 0, 1024, 1024);

  // 2. Stratified geological sediment bands & wavy strata layers
  const strataColors = [
    'rgba(145, 120, 95, 0.45)',  // ochre sandstone band
    'rgba(58, 46, 36, 0.65)',    // dark basalt/ironstone band
    'rgba(125, 106, 84, 0.40)',  // tan limestone band
    'rgba(42, 34, 26, 0.60)',    // deep charcoal seam
    'rgba(168, 142, 112, 0.35)'  // light quartz-feldspar band
  ];

  for (let y = 30; y < 1000; y += 45 + Math.random() * 30) {
    ctx.save();
    ctx.fillStyle = strataColors[Math.floor(Math.random() * strataColors.length)];
    ctx.beginPath();
    ctx.moveTo(0, y);
    for (let x = 0; x <= 1024; x += 64) {
      const wave = Math.sin(x * 0.015 + y * 0.02) * 18 + Math.cos(x * 0.035) * 8;
      ctx.lineTo(x, y + wave);
    }
    const bandH = 20 + Math.random() * 35;
    for (let x = 1024; x >= 0; x -= 64) {
      const wave = Math.sin(x * 0.015 + y * 0.02) * 18 + Math.cos(x * 0.035) * 8;
      ctx.lineTo(x, y + wave + bandH);
    }
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  // 3. Angular geological fractures, joints, and chiseled crevices
  for (let i = 0; i < 28; i++) {
    ctx.save();
    let cx = Math.random() * 1024;
    let cy = Math.random() * 1024;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    const steps = 4 + Math.floor(Math.random() * 5);
    for (let s = 0; s < steps; s++) {
      cx += (Math.random() - 0.45) * 160;
      cy += (Math.random() - 0.45) * 160;
      ctx.lineTo(cx, cy);
    }
    // Shadow core of fracture
    ctx.strokeStyle = 'rgba(25, 20, 15, 0.65)';
    ctx.lineWidth = 3 + Math.random() * 3;
    ctx.stroke();

    // Highlight edge along fracture
    ctx.strokeStyle = 'rgba(215, 195, 170, 0.35)';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.restore();
  }

  // 4. Crystalline mineral flecks (speckled granite quartz, mica, feldspar)
  for (let f = 0; f < 3500; f++) {
    const fx = Math.random() * 1024;
    const fy = Math.random() * 1024;
    const r = Math.random();
    if (r < 0.35) {
      ctx.fillStyle = 'rgba(245, 238, 225, 0.45)'; // quartz fleck
    } else if (r < 0.7) {
      ctx.fillStyle = 'rgba(30, 24, 18, 0.55)'; // mica fleck
    } else {
      ctx.fillStyle = 'rgba(195, 155, 115, 0.40)'; // feldspar fleck
    }
    const sz = 1.2 + Math.random() * 2.4;
    ctx.fillRect(fx, fy, sz, sz);
  }

  // 5. Natural desert patina & weathered erosion blotches
  for (let b = 0; b < 18; b++) {
    const bx = Math.random() * 1024;
    const by = Math.random() * 1024;
    const rad = 40 + Math.random() * 90;
    const blotchGrad = ctx.createRadialGradient(bx, by, 5, bx, by, rad);
    blotchGrad.addColorStop(0, 'rgba(80, 64, 48, 0.32)');
    blotchGrad.addColorStop(0.6, 'rgba(120, 100, 75, 0.18)');
    blotchGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = blotchGrad;
    ctx.beginPath();
    ctx.arc(bx, by, rad, 0, Math.PI * 2);
    ctx.fill();
  }

  sharedRockTexture = new THREE.CanvasTexture(canvas);
  sharedRockTexture.wrapS = THREE.RepeatWrapping;
  sharedRockTexture.wrapT = THREE.RepeatWrapping;
  return sharedRockTexture;
}

function getRealisticRockBumpMap(): THREE.CanvasTexture {
  if (sharedRockBumpMap) return sharedRockBumpMap;

  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#808080';
  ctx.fillRect(0, 0, 1024, 1024);

  // Sharp fissures and cracks
  for (let i = 0; i < 35; i++) {
    let cx = Math.random() * 1024;
    let cy = Math.random() * 1024;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    for (let s = 0; s < 5; s++) {
      cx += (Math.random() - 0.5) * 180;
      cy += (Math.random() - 0.5) * 180;
      ctx.lineTo(cx, cy);
    }
    // Deep depression
    ctx.strokeStyle = '#222222';
    ctx.lineWidth = 4;
    ctx.stroke();

    // Raised lip/edge
    ctx.strokeStyle = '#e0e0e0';
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  // Chiseled surface facets
  for (let p = 0; p < 80; p++) {
    const px = Math.random() * 1024;
    const py = Math.random() * 1024;
    const pRad = 25 + Math.random() * 60;
    const grad = ctx.createLinearGradient(px - pRad, py - pRad, px + pRad, py + pRad);
    grad.addColorStop(0, '#555555');
    grad.addColorStop(0.5, '#808080');
    grad.addColorStop(1, '#b0b0b0');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(px, py, pRad, 0, Math.PI * 2);
    ctx.fill();
  }

  sharedRockBumpMap = new THREE.CanvasTexture(canvas);
  sharedRockBumpMap.wrapS = THREE.RepeatWrapping;
  sharedRockBumpMap.wrapT = THREE.RepeatWrapping;
  return sharedRockBumpMap;
}

/**
 * Creates faceted, organic rock meshes with deterministic vertex noise
 * to produce realistic natural mountain crags with sharp geological cleavage planes.
 */
function createCraggyRockMesh(
  geometry: THREE.BufferGeometry,
  material: THREE.Material,
  jitterAmount: number = 0.22,
  seed: number = 1
): THREE.Mesh {
  const pos = geometry.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const y = pos.getY(i);
    const z = pos.getZ(i);
    const n =
      Math.sin(x * 2.8 + seed * 2.1) *
      Math.cos(y * 3.4 + z * 2.3) *
      Math.sin(z * 2.7 + seed * 0.7);
    const scale = 1.0 + n * jitterAmount;
    pos.setXYZ(i, x * scale, y * (1.0 + n * jitterAmount * 0.8), z * scale);
  }
  geometry.computeVertexNormals();
  const mesh = new THREE.Mesh(geometry, material);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}

function createHillSignTexture(
  titleArabic: string,
  titleMalay: string,
  verseArabic: string,
  instructionText: string
): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  // Luxurious Dark Marble background with Golden Islamic border
  ctx.fillStyle = '#16191c';
  ctx.fillRect(0, 0, 1024, 512);

  // Gold metallic border
  ctx.strokeStyle = '#d4af37';
  ctx.lineWidth = 10;
  ctx.strokeRect(20, 20, 984, 472);

  ctx.strokeStyle = '#997c27';
  ctx.lineWidth = 2;
  ctx.strokeRect(32, 32, 960, 448);

  ctx.textAlign = 'center';

  // Arabic Title
  ctx.fillStyle = '#e8c868';
  ctx.font = 'bold 54px "Amiri", "Traditional Arabic", serif';
  ctx.fillText(titleArabic, 512, 110);

  // Malay Title
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 36px "Inter", sans-serif';
  ctx.fillText(titleMalay, 512, 175);

  // Gold divider
  ctx.strokeStyle = '#d4af37';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(250, 210);
  ctx.lineTo(774, 210);
  ctx.stroke();

  // Quranic Verse / Sunnah snippet
  ctx.fillStyle = '#f5e6c4';
  ctx.font = '32px "Amiri", serif';
  ctx.fillText(verseArabic, 512, 280);

  // Instructions / Description
  ctx.fillStyle = '#34d399';
  ctx.font = 'bold 26px "Inter", sans-serif';
  ctx.fillText(instructionText, 512, 360);

  ctx.fillStyle = '#94a3b8';
  ctx.font = '22px "Inter", sans-serif';
  ctx.fillText('DISUNATKAN MENGHADAP KAABAH, BERTASBIH & BERDOA', 512, 420);

  return new THREE.CanvasTexture(canvas);
}

export class MasjidilHaram {
  public scene: THREE.Scene;
  public kaabahMesh!: THREE.Mesh;
  public hajarAswadMarker!: THREE.Mesh;
  public rukunYamaniMarker!: THREE.Mesh;
  public maqamIbrahimMesh!: THREE.Group;
  public hijrIsmailMesh!: THREE.Group;
  public zamzamStationMesh!: THREE.Group;
  public safaHillMesh!: THREE.Group;
  public marwahHillMesh!: THREE.Group;
  public greenLightsMesh!: THREE.Group;
  public madinahZone!: MadinahZone;
  public checkpoints: CheckpointZone[] = [];

  constructor(scene: THREE.Scene) {
    this.scene = scene;
    this.buildWorld();
    this.setupCheckpoints();
  }

  private buildWorld() {
    this.setupLighting();
    this.createSkyAndGround();
    this.createMatafCourtyard();
    this.createKaabah();
    this.createHijrIsmail();
    this.createMaqamIbrahim();
    this.createZamzamStations();
    this.createMasaGallery();
    this.createMosqueArchitecture();
    this.createGrandMosqueEntrance();
    this.createHaramPrayerHall();
    this.madinahZone = new MadinahZone(this.scene);
  }

  private setupLighting() {
    // Soft bright sunlight
    const hemiLight = new THREE.HemisphereLight(0xfffaed, 0xd0e0e3, 0.75);
    hemiLight.position.set(0, 100, 0);
    this.scene.add(hemiLight);

    const dirLight = new THREE.DirectionalLight(0xfff5e6, 1.1);
    dirLight.position.set(45, 80, 50);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 2048;
    dirLight.shadow.mapSize.height = 2048;
    dirLight.shadow.camera.near = 0.5;
    dirLight.shadow.camera.far = 250;
    dirLight.shadow.camera.left = -75;
    dirLight.shadow.camera.right = 75;
    dirLight.shadow.camera.top = 75;
    dirLight.shadow.camera.bottom = -75;
    dirLight.shadow.bias = -0.0005;
    this.scene.add(dirLight);

    // Warm ambient accent
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    this.scene.add(ambientLight);
  }

  private createSkyAndGround() {
    // Clear blue Arabian sky background
    this.scene.background = new THREE.Color(0xbfe3f7);

    // Subtle atmospheric distance fog
    this.scene.fog = new THREE.FogExp2(0xbfe3f7, 0.0038);

    // Procedural warm sandstone paving tile texture matching screenshot
    const tileCanvas = document.createElement('canvas');
    tileCanvas.width = 512;
    tileCanvas.height = 512;
    const tCtx = tileCanvas.getContext('2d')!;

    // Warm limestone stone base
    tCtx.fillStyle = '#eae4d8';
    tCtx.fillRect(0, 0, 512, 512);

    // Subtle stone flecks & grain
    for (let i = 0; i < 4000; i++) {
      const rx = Math.random() * 512;
      const ry = Math.random() * 512;
      const gray = Math.floor(215 + Math.random() * 35);
      tCtx.fillStyle = `rgb(${gray},${gray - 4},${gray - 12})`;
      tCtx.fillRect(rx, ry, 1.5, 1.5);
    }

    // 4x4 square tile grid with crisp grout seams (like Madinah & Makkah plazas)
    const tileSize = 128;
    for (let x = 0; x <= 512; x += tileSize) {
      for (let y = 0; y <= 512; y += tileSize) {
        // Grout joint shadow
        tCtx.strokeStyle = 'rgba(150, 140, 128, 0.7)';
        tCtx.lineWidth = 3.5;
        tCtx.strokeRect(x + 1.5, y + 1.5, tileSize - 3, tileSize - 3);

        // Subtle tile bevel highlight
        tCtx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
        tCtx.lineWidth = 1.2;
        tCtx.strokeRect(x + 3, y + 3, tileSize - 6, tileSize - 6);
      }
    }

    const plazaTexture = new THREE.CanvasTexture(tileCanvas);
    plazaTexture.wrapS = THREE.RepeatWrapping;
    plazaTexture.wrapT = THREE.RepeatWrapping;
    plazaTexture.repeat.set(120, 120);

    // Grand Mosque outer plaza floor
    const plazaGeo = new THREE.PlaneGeometry(350, 350);
    const plazaMat = new THREE.MeshStandardMaterial({
      map: plazaTexture,
      roughness: 0.82,
      metalness: 0.04
    });
    const plaza = new THREE.Mesh(plazaGeo, plazaMat);
    plaza.rotation.x = -Math.PI / 2;
    plaza.position.y = -0.05;
    plaza.receiveShadow = true;
    this.scene.add(plaza);
  }

  private createMatafCourtyard() {
    // Pure radiant Thassos white marble circle
    const matafRadius = 42;
    const matafGeo = new THREE.CircleGeometry(matafRadius, 64);
    const matafMat = new THREE.MeshLambertMaterial({
      color: 0xfbfbfb,
      side: THREE.DoubleSide
    });
    const mataf = new THREE.Mesh(matafGeo, matafMat);
    mataf.rotation.x = -Math.PI / 2;
    mataf.position.y = 0;
    mataf.receiveShadow = true;
    this.scene.add(mataf);

    // Concentric guide rings in Mataf
    for (let r = 12; r <= 38; r += 5) {
      const ringGeo = new THREE.RingGeometry(r - 0.04, r + 0.04, 64);
      const ringMat = new THREE.MeshBasicMaterial({
        color: 0xe2ded4,
        side: THREE.DoubleSide
      });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.rotation.x = -Math.PI / 2;
      ring.position.y = 0.01;
      this.scene.add(ring);
    }

    // Counter-clockwise floor guide arrows (Inlaid subtle bronze/sandstone marble chevron in Mataf)
    // Points counter-clockwise (Lawan Arah Jam: Kaabah sentiasa di sebelah kiri jemaah)
    const arrowShape = new THREE.Shape();
    arrowShape.moveTo(0, 0.7);
    arrowShape.lineTo(0.3, -0.3);
    arrowShape.lineTo(0, -0.1);
    arrowShape.lineTo(-0.3, -0.3);
    arrowShape.closePath();
    const arrowGeo = new THREE.ShapeGeometry(arrowShape);
    const arrowMat = new THREE.MeshBasicMaterial({
      color: 0xc2af91,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.85
    });

    const guideRadii = [17, 27, 37];
    guideRadii.forEach((r) => {
      const count = r === 17 ? 6 : (r === 27 ? 8 : 10);
      for (let i = 0; i < count; i++) {
        const theta = (i / count) * Math.PI * 2;
        const x = Math.cos(theta) * r;
        const z = Math.sin(theta) * r;

        const arrow = new THREE.Mesh(arrowGeo, arrowMat);
        arrow.rotation.x = -Math.PI / 2;
        arrow.rotation.z = -theta;
        arrow.position.set(x, 0.015, z);
        this.scene.add(arrow);
      }
    });

    // Starting Line (Aligned with Hajarul Aswad, extending to outer Mataf edge)
    // Hajarul Aswad is at the South-East corner (approx x: 5.5, z: 6)
    const lineGeo = new THREE.PlaneGeometry(0.5, matafRadius - 8);
    const lineMat = new THREE.MeshLambertMaterial({
      color: 0x3d3025, // Dark granite band
      side: THREE.DoubleSide
    });
    const startLine = new THREE.Mesh(lineGeo, lineMat);
    startLine.rotation.x = -Math.PI / 2;
    // Angle pointing from Kaabah SE corner outwards
    startLine.rotation.z = Math.PI / 4;
    startLine.position.set(22, 0.02, 22);
    startLine.receiveShadow = true;
    this.scene.add(startLine);

    // Green Neon Indicator Pillar at outer Mataf boundary (Marks the Hajarul Aswad start line)
    const greenPillarGeo = new THREE.CylinderGeometry(0.35, 0.35, 12, 16);
    const greenPillarMat = new THREE.MeshBasicMaterial({
      color: 0x00ff66
    });
    const greenPillar = new THREE.Mesh(greenPillarGeo, greenPillarMat);
    greenPillar.position.set(32, 6, 32);
    this.scene.add(greenPillar);

    // Green laser beam guide upwards
    const laserGeo = new THREE.CylinderGeometry(0.08, 0.08, 60, 8);
    const laserMat = new THREE.MeshBasicMaterial({
      color: 0x33ff77,
      transparent: true,
      opacity: 0.6
    });
    const laser = new THREE.Mesh(laserGeo, laserMat);
    laser.position.set(32, 36, 32);
    this.scene.add(laser);
  }

  private createKaabah() {
    const kaabahWidth = 11;
    const kaabahHeight = 14;
    const kaabahDepth = 12.5;

    // Kiswah Black Body
    const bodyGeo = new THREE.BoxGeometry(kaabahWidth, kaabahHeight, kaabahDepth);
    const blackMat = new THREE.MeshLambertMaterial({ color: 0x111111 });
    this.kaabahMesh = new THREE.Mesh(bodyGeo, blackMat);
    this.kaabahMesh.position.set(0, kaabahHeight / 2, 0);
    this.kaabahMesh.castShadow = true;
    this.kaabahMesh.receiveShadow = true;
    this.scene.add(this.kaabahMesh);

    // Shadharwan (Sloping white marble skirting base)
    const baseGeo = new THREE.BoxGeometry(kaabahWidth + 0.8, 0.45, kaabahDepth + 0.8);
    const baseMat = new THREE.MeshLambertMaterial({ color: 0xf5f3ee });
    const base = new THREE.Mesh(baseGeo, baseMat);
    base.position.set(0, 0.22, 0);
    this.scene.add(base);

    // Golden Kiswah Band (Hizam al-Kaabah)
    const bandHeight = 1.1;
    const bandGeo = new THREE.BoxGeometry(kaabahWidth + 0.05, bandHeight, kaabahDepth + 0.05);
    const goldMat = new THREE.MeshLambertMaterial({
      color: 0xd4af37, // Rich Gold
      emissive: 0x4a3a10
    });
    const band = new THREE.Mesh(bandGeo, goldMat);
    band.position.set(0, 9.8, 0);
    this.scene.add(band);

    // Bab al-Kaabah (The Golden Door on the East face)
    const doorGeo = new THREE.PlaneGeometry(2.2, 3.8);
    const door = new THREE.Mesh(doorGeo, goldMat);
    door.position.set(2.4, 4.4, kaabahDepth / 2 + 0.04);
    this.scene.add(door);

    // Mizab al-Rahmah (Golden Rainspout on North face)
    const mizabGeo = new THREE.BoxGeometry(0.4, 0.35, 1.8);
    const mizab = new THREE.Mesh(mizabGeo, goldMat);
    mizab.position.set(0, kaabahHeight - 0.2, -kaabahDepth / 2 - 0.7);
    this.scene.add(mizab);

    // Hajarul Aswad (South-East Corner)
    // Mounted in iconic silver casing
    const silverMat = new THREE.MeshLambertMaterial({ color: 0xcccccc });
    const hajarCasing = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.35, 0.9, 12), silverMat);
    hajarCasing.rotation.z = Math.PI / 4;
    hajarCasing.position.set(kaabahWidth / 2 + 0.05, 1.5, kaabahDepth / 2 + 0.05);

    const blackStone = new THREE.Mesh(new THREE.SphereGeometry(0.22, 12, 12), blackMat);
    blackStone.position.set(0, 0, 0.15);
    hajarCasing.add(blackStone);

    this.hajarAswadMarker = hajarCasing;
    this.scene.add(this.hajarAswadMarker);

    // Rukun Yamani (South-West Corner)
    const yamaniGeo = new THREE.BoxGeometry(0.5, 2.2, 0.5);
    const yamaniMat = new THREE.MeshLambertMaterial({ color: 0x8c7355 });
    this.rukunYamaniMarker = new THREE.Mesh(yamaniGeo, yamaniMat);
    this.rukunYamaniMarker.position.set(-kaabahWidth / 2 - 0.1, 1.2, kaabahDepth / 2 + 0.1);
    this.scene.add(this.rukunYamaniMarker);
  }

  private createHijrIsmail() {
    this.hijrIsmailMesh = new THREE.Group();

    // Semi-circular low white marble wall (Hateem)
    const radius = 6.2;
    const tubeRadius = 0.55;
    const arcGeo = new THREE.TorusGeometry(radius, tubeRadius, 12, 32, Math.PI);
    const marbleMat = new THREE.MeshLambertMaterial({ color: 0xfdfdfd });

    const arc = new THREE.Mesh(arcGeo, marbleMat);
    arc.rotation.x = Math.PI / 2;
    arc.rotation.z = 0;
    arc.position.set(0, tubeRadius, -6.6);
    this.hijrIsmailMesh.add(arc);

    // Floor inside Hijr Ismail
    const floorGeo = new THREE.CircleGeometry(radius, 32, 0, Math.PI);
    const floorMat = new THREE.MeshLambertMaterial({ color: 0xf3efe6, side: THREE.DoubleSide });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.set(0, 0.03, -6.6);
    this.hijrIsmailMesh.add(floor);

    this.scene.add(this.hijrIsmailMesh);
  }

  private createMaqamIbrahim() {
    this.maqamIbrahimMesh = new THREE.Group();

    const goldMat = new THREE.MeshLambertMaterial({ color: 0xd4af37 });
    const glassMat = new THREE.MeshLambertMaterial({
      color: 0x88d9e6,
      transparent: true,
      opacity: 0.65
    });

    // Hexagonal Golden Base & Enclosure
    const base = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.4, 0.5, 6), goldMat);
    base.position.y = 0.25;
    this.maqamIbrahimMesh.add(base);

    // Glass Crystal Dome
    const glassDome = new THREE.Mesh(new THREE.CylinderGeometry(0.85, 0.85, 1.8, 12), glassMat);
    glassDome.position.y = 1.4;
    this.maqamIbrahimMesh.add(glassDome);

    // Golden Roof Dome & Crescent
    const roof = new THREE.Mesh(new THREE.SphereGeometry(0.9, 12, 12, 0, Math.PI * 2, 0, Math.PI / 2), goldMat);
    roof.position.y = 2.3;
    this.maqamIbrahimMesh.add(roof);

    // Position east of the Kaabah door
    this.maqamIbrahimMesh.position.set(13, 0, 3.5);
    this.scene.add(this.maqamIbrahimMesh);
  }

  private createZamzamStations() {
    this.zamzamStationMesh = new THREE.Group();

    const stationMat = new THREE.MeshLambertMaterial({ color: 0xd4af37 });
    const barrelMat = new THREE.MeshLambertMaterial({ color: 0xffffff });

    for (let i = -2; i <= 2; i++) {
      const stand = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.85, 0.9), stationMat);
      stand.position.set(i * 1.4, 0.42, 0);

      const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, 0.75, 16), barrelMat);
      barrel.position.set(i * 1.4, 1.2, 0);

      this.zamzamStationMesh.add(stand);
      this.zamzamStationMesh.add(barrel);
    }

    // Positioned near Mataf perimeter towards Mas'a
    this.zamzamStationMesh.position.set(38, 0, 8);
    this.zamzamStationMesh.rotation.y = -Math.PI / 4;
    this.scene.add(this.zamzamStationMesh);
  }

  private createMasaGallery() {
    // Mas'a: Grand gallery extending from Safa (south) to Marwah (north)
    // Scaled for comfortable interactive walking in the virtual world:
    // Distance between Safa and Marwah: 90 meters
    const safaZ = 45;
    const marwahZ = -45;
    const masaX = 65;
    const masaWidth = 14;
    const masaLength = 110;

    // -------------------------------------------------------------------------
    // 1. Central Flat Concourse Marble Floor (z: -32 to +32)
    // -------------------------------------------------------------------------
    const masaFloorGeo = new THREE.BoxGeometry(masaWidth, 0.2, 64);
    const masaFloorMat = new THREE.MeshStandardMaterial({
      color: 0xf5f2ea,
      roughness: 0.35,
      metalness: 0.05
    });
    const masaFloor = new THREE.Mesh(masaFloorGeo, masaFloorMat);
    masaFloor.position.set(masaX, 0.1, 0);
    masaFloor.receiveShadow = true;
    this.scene.add(masaFloor);

    // Mas'a Roof & Arches (Ceiling at Y = 7.0m)
    const roofGeo = new THREE.BoxGeometry(masaWidth + 2, 0.6, masaLength + 4);
    const roofMat = new THREE.MeshLambertMaterial({ color: 0xe5e1d8 });
    const roof = new THREE.Mesh(roofGeo, roofMat);
    roof.position.set(masaX, 7, 0);
    this.scene.add(roof);

    // Mas'a Pillars along both sides
    const pillarMat = new THREE.MeshStandardMaterial({
      color: 0xfdfdfd,
      roughness: 0.3,
      metalness: 0.08
    });
    for (let z = -48; z <= 48; z += 8) {
      // East side pillars
      const p1 = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, 6.8, 12), pillarMat);
      p1.position.set(masaX - masaWidth / 2 + 0.6, 3.4, z);
      this.scene.add(p1);

      // West side pillars
      const p2 = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, 6.8, 12), pillarMat);
      p2.position.set(masaX + masaWidth / 2 - 0.6, 3.4, z);
      this.scene.add(p2);
    }

    // Mas'a Solid Outer Walls & Safety Enclosure (Height 6.8m, fully sealing gallery up to roof)
    const wallScreenMat = new THREE.MeshLambertMaterial({ color: 0xf3efe6 });
    // East wall (full length)
    const eastWall = new THREE.Mesh(new THREE.BoxGeometry(0.45, 6.8, masaLength), wallScreenMat);
    eastWall.position.set(masaX + masaWidth / 2, 3.4, 0);
    this.scene.add(eastWall);

    // West wall (with opening connecting Mataf between z: -2 and +8)
    const westWallNorth = new THREE.Mesh(new THREE.BoxGeometry(0.45, 6.8, 48), wallScreenMat);
    westWallNorth.position.set(masaX - masaWidth / 2, 3.4, -29);
    const westWallSouth = new THREE.Mesh(new THREE.BoxGeometry(0.45, 6.8, 44), wallScreenMat);
    westWallSouth.position.set(masaX - masaWidth / 2, 3.4, 29);
    this.scene.add(westWallNorth, westWallSouth);

    // North & South End Walls behind Bukit Safa & Marwah (6.8m height sealing to ceiling)
    const northWall = new THREE.Mesh(new THREE.BoxGeometry(masaWidth + 1, 6.8, 0.5), wallScreenMat);
    northWall.position.set(masaX, 3.4, marwahZ - 7);
    const southWall = new THREE.Mesh(new THREE.BoxGeometry(masaWidth + 1, 6.8, 0.5), wallScreenMat);
    southWall.position.set(masaX, 3.4, safaZ + 7);
    this.scene.add(northWall, southWall);

    // -------------------------------------------------------------------------
    // 2. High-Quality Geological & Architectural Materials
    // -------------------------------------------------------------------------
    const rockTex = getRealisticRockTexture();
    const rockBump = getRealisticRockBumpMap();

    const rockMat = new THREE.MeshStandardMaterial({
      color: 0x6e5c4a,
      map: rockTex,
      bumpMap: rockBump,
      bumpScale: 0.12,
      roughness: 0.88,
      metalness: 0.04,
      flatShading: true
    });

    const darkRockMat = new THREE.MeshStandardMaterial({
      color: 0x4d3e32,
      map: rockTex,
      bumpMap: rockBump,
      bumpScale: 0.15,
      roughness: 0.92,
      metalness: 0.03,
      flatShading: true
    });

    const highlightRockMat = new THREE.MeshStandardMaterial({
      color: 0x8a755d,
      map: rockTex,
      bumpMap: rockBump,
      bumpScale: 0.10,
      roughness: 0.82,
      metalness: 0.05,
      flatShading: true
    });

    const brassMat = new THREE.MeshStandardMaterial({
      color: 0xd4af37,
      roughness: 0.25,
      metalness: 0.85
    });

    const safetyGlassMat = new THREE.MeshStandardMaterial({
      color: 0xd9eef7,
      transparent: true,
      opacity: 0.40,
      roughness: 0.12,
      metalness: 0.1
    });

    const marbleStepMat = new THREE.MeshStandardMaterial({
      color: 0xfbf9f4,
      roughness: 0.28,
      metalness: 0.05
    });

    const darkGraniteBorderMat = new THREE.MeshStandardMaterial({
      color: 0x362c23,
      roughness: 0.4,
      metalness: 0.1
    });

    // -------------------------------------------------------------------------
    // 3. Bukit Safa (Jabal Safa) - Incline Ramp, Summit Platform & Authentic Crags
    // -------------------------------------------------------------------------
    this.safaHillMesh = new THREE.Group();
    this.buildHillZone(
      this.safaHillMesh,
      masaX,
      true,
      rockMat,
      darkRockMat,
      highlightRockMat,
      brassMat,
      safetyGlassMat,
      marbleStepMat,
      darkGraniteBorderMat
    );
    this.scene.add(this.safaHillMesh);

    // -------------------------------------------------------------------------
    // 4. Bukit Marwah (Jabal Marwah) - Incline Ramp, Summit Platform & Authentic Crags
    // -------------------------------------------------------------------------
    this.marwahHillMesh = new THREE.Group();
    this.buildHillZone(
      this.marwahHillMesh,
      masaX,
      false,
      rockMat,
      darkRockMat,
      highlightRockMat,
      brassMat,
      safetyGlassMat,
      marbleStepMat,
      darkGraniteBorderMat
    );
    this.scene.add(this.marwahHillMesh);

    // -------------------------------------------------------------------------
    // 5. Batn al-Wadi (Green Lights Zone between Safa and Marwah)
    // -------------------------------------------------------------------------
    // Located roughly in the middle section (z: 12 to z: -8)
    this.greenLightsMesh = new THREE.Group();
    const greenNeonMat = new THREE.MeshBasicMaterial({
      color: 0x00ff44
    });

    for (let gz = -8; gz <= 14; gz += 4) {
      // Overhead green neon tubes across ceiling
      const tube = new THREE.Mesh(
        new THREE.CylinderGeometry(0.12, 0.12, masaWidth - 2, 8),
        greenNeonMat
      );
      tube.rotation.z = Math.PI / 2;
      tube.position.set(masaX, 6.5, gz);
      this.greenLightsMesh.add(tube);
    }

    // Floor green boundary marker lines
    const greenLineGeo = new THREE.PlaneGeometry(masaWidth - 1, 0.4);
    const greenLine1 = new THREE.Mesh(greenLineGeo, greenNeonMat);
    greenLine1.rotation.x = -Math.PI / 2;
    greenLine1.position.set(masaX, 0.22, 14);
    this.greenLightsMesh.add(greenLine1);

    const greenLine2 = new THREE.Mesh(greenLineGeo, greenNeonMat);
    greenLine2.rotation.x = -Math.PI / 2;
    greenLine2.position.set(masaX, 0.22, -8);
    this.greenLightsMesh.add(greenLine2);

    this.scene.add(this.greenLightsMesh);
  }

  /**
   * Constructs an authentic, highly detailed 3D polygonal mountain zone for Bukit Safa / Bukit Marwah,
   * including the ascending marble incline/ramp, stepped terraced flanking walkways with brass nosing,
   * elevated summit viewing & du'a platform (1.8m), glass & brass protective balustrades,
   * Islamic calligraphy gold plaque, floor Qibla indicator, and ancient preserved mountain rock formations
   * with multi-tiered bedrock, jagged crags, stratified shelves, mountain peaks, and warm architectural spotlights.
   */
  private buildHillZone(
    hillGroup: THREE.Group,
    masaX: number,
    isSafa: boolean,
    rockMat: THREE.Material,
    darkRockMat: THREE.Material,
    highlightRockMat: THREE.Material,
    brassMat: THREE.Material,
    safetyGlassMat: THREE.Material,
    marbleStepMat: THREE.Material,
    darkGraniteBorderMat: THREE.Material
  ) {
    const dir = isSafa ? 1 : -1;
    const internalWidth = 13.5;

    // -------------------------------------------------------------------------
    // 1. Ascending Marble Ramp Wedge (z: 32 to 44)
    // -------------------------------------------------------------------------
    const rampLength = Math.hypot(12, 1.6); // ~12.106m
    const rampAngle = dir * Math.atan2(1.6, 12);
    const rampGeo = new THREE.BoxGeometry(internalWidth, 0.3, rampLength);
    const rampMesh = new THREE.Mesh(rampGeo, marbleStepMat);
    rampMesh.position.set(masaX, 1.0, 38 * dir);
    rampMesh.rotation.x = rampAngle;
    rampMesh.receiveShadow = true;
    hillGroup.add(rampMesh);

    // Supporting foundation plinths underneath the ramp (fills gaps from y = 0 to ramp bottom)
    const f1 = new THREE.Mesh(new THREE.BoxGeometry(internalWidth, 0.4, 9), darkGraniteBorderMat);
    f1.position.set(masaX, 0.2, (32 + 4.5) * dir);
    hillGroup.add(f1);

    const f2 = new THREE.Mesh(new THREE.BoxGeometry(internalWidth, 0.5, 6), darkGraniteBorderMat);
    f2.position.set(masaX, 0.65, (35 + 3.0) * dir);
    hillGroup.add(f2);

    const f3 = new THREE.Mesh(new THREE.BoxGeometry(internalWidth, 0.5, 3), darkGraniteBorderMat);
    f3.position.set(masaX, 1.15, (38 + 1.5) * dir);
    hillGroup.add(f3);

    // -------------------------------------------------------------------------
    // 2. Side Stepped Terraces (Left & Right walkways with gold nosing strips)
    // -------------------------------------------------------------------------
    const stepWidth = 2.4;
    const sideOffsets = [-internalWidth / 2 + stepWidth / 2, internalWidth / 2 - stepWidth / 2];

    for (let s = 0; s < 6; s++) {
      const stepZ = (32.8 + s * 1.85) * dir;
      const stepY = 0.22 + s * 0.26;
      const stepH = 0.28;

      for (const offset of sideOffsets) {
        // Marble Step Tread
        const step = new THREE.Mesh(
          new THREE.BoxGeometry(stepWidth, stepH, 1.8),
          marbleStepMat
        );
        step.position.set(masaX + offset, stepY, stepZ);
        step.receiveShadow = true;
        hillGroup.add(step);

        // Polished Gold/Brass Anti-Slip Nosing Strip along leading edge
        const nosingZ = stepZ - (0.9 * dir);
        const nosing = new THREE.Mesh(
          new THREE.BoxGeometry(stepWidth, 0.04, 0.08),
          brassMat
        );
        nosing.position.set(masaX + offset, stepY + stepH / 2 + 0.02, nosingZ);
        hillGroup.add(nosing);
      }
    }

    // -------------------------------------------------------------------------
    // 3. Side Protective Balustrades (Along East & West walls from z: 32 to 48)
    // -------------------------------------------------------------------------
    for (const sideX of [masaX - internalWidth / 2 + 0.2, masaX + internalWidth / 2 - 0.2]) {
      // Brass stanchions along ramp
      for (let zOffset = 33; zOffset <= 47; zOffset += 2.8) {
        const postZ = zOffset * dir;
        const postT = (zOffset - 32) / 12;
        const postY = (zOffset >= 44 ? 1.8 : postT * 1.8) + 0.55;
        const post = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 1.1, 10), brassMat);
        post.position.set(sideX, postY, postZ);
        hillGroup.add(post);
      }

      // Angled brass handrail along ramp
      const rail = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, rampLength, 10), brassMat);
      rail.position.set(sideX, 1.0 + 1.05, 38 * dir);
      rail.rotation.x = rampAngle;
      hillGroup.add(rail);

      // Angled safety glass panels along ramp
      const glass = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.95, rampLength), safetyGlassMat);
      glass.position.set(sideX, 1.0 + 0.55, 38 * dir);
      glass.rotation.x = rampAngle;
      hillGroup.add(glass);
    }

    // -------------------------------------------------------------------------
    // 4. Elevated Summit Viewing & Du'a Platform (z: 44 to 48.2 at Y = 1.8m)
    // -------------------------------------------------------------------------
    const summitDepth = 4.2;
    const summitCenterZ = (44 + summitDepth / 2) * dir; // ~46.1 * dir
    const summitPlatform = new THREE.Mesh(
      new THREE.BoxGeometry(internalWidth, 0.35, summitDepth),
      marbleStepMat
    );
    summitPlatform.position.set(masaX, 1.625, summitCenterZ);
    summitPlatform.receiveShadow = true;
    hillGroup.add(summitPlatform);

    // Foundation block under summit platform
    const summitFoundation = new THREE.Mesh(
      new THREE.BoxGeometry(internalWidth, 1.45, summitDepth),
      darkGraniteBorderMat
    );
    summitFoundation.position.set(masaX, 0.725, summitCenterZ);
    hillGroup.add(summitFoundation);

    // Dark granite decorative border inlay around summit terrace
    const borderNorth = new THREE.Mesh(
      new THREE.BoxGeometry(internalWidth, 0.02, 0.4),
      darkGraniteBorderMat
    );
    borderNorth.position.set(masaX, 1.81, (44 + 0.2) * dir);
    hillGroup.add(borderNorth);

    // Qibla Directional Floor Inlay (Points West towards Kaabah)
    const qiblaStar = new THREE.Mesh(
      new THREE.CylinderGeometry(0.75, 0.75, 0.02, 8),
      brassMat
    );
    qiblaStar.position.set(masaX, 1.815, summitCenterZ);
    hillGroup.add(qiblaStar);

    // Directional Arrow pointing towards Kaabah (West: -X)
    const arrowShaft = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.025, 0.12), brassMat);
    arrowShaft.position.set(masaX - 0.6, 1.82, summitCenterZ);
    hillGroup.add(arrowShaft);

    const arrowHead = new THREE.Mesh(new THREE.ConeGeometry(0.24, 0.4, 3), brassMat);
    arrowHead.rotation.z = Math.PI / 2;
    arrowHead.position.set(masaX - 1.15, 1.82, summitCenterZ);
    hillGroup.add(arrowHead);

    // -------------------------------------------------------------------------
    // 5. Summit Glass & Brass Protective Balustrade (z = 48.15 * dir)
    // -------------------------------------------------------------------------
    const railZ = 48.15 * dir;
    const balustradeWidth = internalWidth - 0.2;

    // Brass Vertical Stanchions
    for (let x = -balustradeWidth / 2; x <= balustradeWidth / 2 + 0.1; x += 1.6) {
      const stanchion = new THREE.Mesh(
        new THREE.CylinderGeometry(0.045, 0.045, 1.25, 12),
        brassMat
      );
      stanchion.position.set(masaX + x, 1.8 + 0.625, railZ);
      hillGroup.add(stanchion);
    }

    // Top Handrail
    const summitHandrail = new THREE.Mesh(
      new THREE.CylinderGeometry(0.04, 0.04, balustradeWidth, 12),
      brassMat
    );
    summitHandrail.rotation.z = Math.PI / 2;
    summitHandrail.position.set(masaX, 1.8 + 1.25, railZ);
    hillGroup.add(summitHandrail);

    // Tempered Safety Glass Panel Enclosure
    const summitGlass = new THREE.Mesh(
      new THREE.BoxGeometry(balustradeWidth, 1.1, 0.04),
      safetyGlassMat
    );
    summitGlass.position.set(masaX, 1.8 + 0.58, railZ);
    hillGroup.add(summitGlass);

    // Bottom Brass Kickplate
    const kickplate = new THREE.Mesh(
      new THREE.BoxGeometry(balustradeWidth, 0.12, 0.06),
      brassMat
    );
    kickplate.position.set(masaX, 1.8 + 0.06, railZ);
    hillGroup.add(kickplate);

    // -------------------------------------------------------------------------
    // 6. Islamic Calligraphy Sign Plaque on Bronze Pedestal
    // -------------------------------------------------------------------------
    const plaquePedestal = new THREE.Mesh(
      new THREE.BoxGeometry(1.6, 0.85, 0.45),
      darkGraniteBorderMat
    );
    plaquePedestal.position.set(masaX, 1.8 + 0.425, (47.5) * dir);
    hillGroup.add(plaquePedestal);

    const signTexture = isSafa
      ? createHillSignTexture(
          'جَبَلُ الصَّفَا',
          'BUKIT SAFA • TITIK MULA SA\'I',
          'إِنَّ الصَّفَا وَالْمَرْوَةَ مِن شَعَائِرِ اللَّهِ',
          'PUSINGAN 1, 3, 5, 7 • MENGHADAP KAABAH'
        )
      : createHillSignTexture(
          'جَبَلُ الْمَرْوَة',
          'BUKIT MARWAH • PENAMAT SA\'I',
          'فَمَنْ حَجَّ الْبَيْتَ أَوِ اعْتَمَرَ فَلَا جُنَاحَ عَلَيْهِ',
          'TAMAT PUSINGAN 1, 3, 5 & PENAMAT (PUSINGAN 7)'
        );

    const signMat = new THREE.MeshStandardMaterial({
      map: signTexture,
      roughness: 0.35,
      metalness: 0.2
    });
    const signBoard = new THREE.Mesh(new THREE.PlaneGeometry(1.5, 0.75), signMat);
    signBoard.position.set(masaX, 1.8 + 0.88, (47.25) * dir);
    signBoard.rotation.x = isSafa ? -0.22 : 0.22;
    if (!isSafa) {
      signBoard.rotation.y = Math.PI;
    }
    hillGroup.add(signBoard);

    // -------------------------------------------------------------------------
    // 7. Authentic Preserved Mountain Rock Formation (Batuan Asli Jabal)
    // -------------------------------------------------------------------------
    // Foundation Bedrock slabs (Massive angular mountain base)
    const bedrockConfigs = [
      { x: masaX - 4.0, y: 1.4, z: (49.6) * dir, r: 3.5, seed: isSafa ? 12 : 52, mat: darkRockMat },
      { x: masaX + 0.2, y: 1.5, z: (50.4) * dir, r: 4.0, seed: isSafa ? 24 : 64, mat: rockMat },
      { x: masaX + 4.2, y: 1.4, z: (49.6) * dir, r: 3.4, seed: isSafa ? 36 : 76, mat: darkRockMat },
      { x: masaX - 1.2, y: 1.7, z: (51.0) * dir, r: 3.2, seed: isSafa ? 48 : 88, mat: rockMat }
    ];

    for (const c of bedrockConfigs) {
      const rock = createCraggyRockMesh(
        new THREE.DodecahedronGeometry(c.r),
        c.mat,
        0.24,
        c.seed
      );
      rock.position.set(c.x, c.y, c.z);
      hillGroup.add(rock);
    }

    // Stratified middle crags, jagged boulders & shelves
    const cragConfigs = [
      { x: masaX - 5.4, y: 2.1, z: (49.2) * dir, r: 1.6, seed: 15, mat: rockMat },
      { x: masaX - 3.2, y: 2.3, z: (49.5) * dir, r: 1.8, seed: 27, mat: highlightRockMat },
      { x: masaX - 1.5, y: 2.4, z: (49.4) * dir, r: 1.7, seed: 39, mat: rockMat },
      { x: masaX + 0.8, y: 2.5, z: (49.5) * dir, r: 1.9, seed: 41, mat: darkRockMat },
      { x: masaX + 2.8, y: 2.3, z: (49.4) * dir, r: 1.8, seed: 53, mat: highlightRockMat },
      { x: masaX + 4.8, y: 2.1, z: (49.2) * dir, r: 1.6, seed: 65, mat: rockMat },
      { x: masaX - 2.5, y: 2.7, z: (50.5) * dir, r: 2.0, seed: 77, mat: rockMat },
      { x: masaX + 2.2, y: 2.6, z: (50.6) * dir, r: 2.1, seed: 89, mat: darkRockMat }
    ];

    for (const c of cragConfigs) {
      const rock = createCraggyRockMesh(
        new THREE.IcosahedronGeometry(c.r, 1),
        c.mat,
        0.25,
        c.seed + (isSafa ? 100 : 200)
      );
      rock.position.set(c.x, c.y, c.z);
      hillGroup.add(rock);
    }

    // Majestic High Mountain Peaks
    // Central Peak (highest point of the rocky crest)
    const centralPeak = createCraggyRockMesh(
      new THREE.DodecahedronGeometry(isSafa ? 2.5 : 2.2),
      highlightRockMat,
      0.28,
      isSafa ? 301 : 401
    );
    centralPeak.position.set(masaX, isSafa ? 3.45 : 3.25, (50.5) * dir);
    hillGroup.add(centralPeak);

    // East Peak
    const eastPeak = createCraggyRockMesh(
      new THREE.IcosahedronGeometry(1.9, 1),
      rockMat,
      0.25,
      isSafa ? 303 : 403
    );
    eastPeak.position.set(masaX + 3.8, 3.05, (50.0) * dir);
    hillGroup.add(eastPeak);

    // West Peak
    const westPeak = createCraggyRockMesh(
      new THREE.IcosahedronGeometry(1.8, 1),
      darkRockMat,
      0.25,
      isSafa ? 305 : 405
    );
    westPeak.position.set(masaX - 3.8, 2.90, (49.8) * dir);
    hillGroup.add(westPeak);

    // Fissure scree & accent rocks
    for (let f = 0; f < 14; f++) {
      const scree = createCraggyRockMesh(
        new THREE.DodecahedronGeometry(0.35 + Math.random() * 0.45),
        f % 2 === 0 ? rockMat : darkRockMat,
        0.2,
        f * 7 + (isSafa ? 11 : 99)
      );
      scree.position.set(
        masaX + (Math.random() - 0.5) * 11.0,
        1.85 + Math.random() * 0.6,
        (48.6 + Math.random() * 2.2) * dir
      );
      hillGroup.add(scree);
    }

    // -------------------------------------------------------------------------
    // 8. Architectural Warm Spotlight (Highlights 3D facets and natural shadows)
    // -------------------------------------------------------------------------
    const hillSpot = new THREE.SpotLight(0xffedd8, 2.6, 26, Math.PI / 3, 0.45, 1.2);
    hillSpot.position.set(masaX, 6.2, (43.0) * dir);
    hillSpot.target.position.set(masaX, 2.6, (50.0) * dir);
    hillGroup.add(hillSpot);
    hillGroup.add(hillSpot.target);
  }

  private createMosqueArchitecture() {
    // Riwaq Colonnades & Arches enclosing the Mataf
    const colonnadeRadius = 55;
    const archMat = new THREE.MeshLambertMaterial({ color: 0xf5f3ee });

    // Multi-tiered colonnade building surrounding the Mataf
    for (let angle = 0; angle < Math.PI * 2; angle += Math.PI / 12) {
      // Skip the corridor opening to Mas'a (around angle ~0 / east side)
      if (Math.abs(angle) < 0.35 || Math.abs(angle - Math.PI * 2) < 0.35) continue;

      const px = Math.cos(angle) * colonnadeRadius;
      const pz = Math.sin(angle) * colonnadeRadius;

      // Colonnade Pillar
      const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.65, 0.75, 12, 12), archMat);
      pillar.position.set(px, 6, pz);
      pillar.castShadow = true;
      this.scene.add(pillar);

      // Arch Dome on top
      const dome = new THREE.Mesh(new THREE.SphereGeometry(1.6, 12, 12, 0, Math.PI * 2, 0, Math.PI / 2), archMat);
      dome.position.set(px, 12, pz);
      this.scene.add(dome);

      // Solid Islamic Architectural Wall Segment behind colonnade
      // Skip grand openings: Mas'a (angle ~ 0), Bab Abdul Aziz (angle ~ -PI/2), Bab Umrah (angle ~ PI)
      const midAngle = angle + (Math.PI / 24);
      const isMasaOpen = Math.abs(midAngle) < 0.38 || Math.abs(midAngle - Math.PI * 2) < 0.38;
      const isBabAbdulAziz = Math.abs(midAngle - (Math.PI / 2)) < 0.22;
      const isSouthGate = Math.abs(midAngle - (3 * Math.PI / 2)) < 0.22;
      const isNorthWestGate = Math.abs(midAngle - Math.PI) < 0.22;

      if (!isMasaOpen && !isSouthGate && !isNorthWestGate && !isBabAbdulAziz) {
        const wx = Math.cos(midAngle) * (colonnadeRadius + 0.8);
        const wz = Math.sin(midAngle) * (colonnadeRadius + 0.8);
        const wallSegment = new THREE.Mesh(
          new THREE.BoxGeometry(14, 7.5, 0.9),
          archMat
        );
        wallSegment.position.set(wx, 3.75, wz);
        wallSegment.rotation.y = -midAngle + Math.PI / 2;
        wallSegment.castShadow = true;
        this.scene.add(wallSegment);
      }
    }

    // 4 Majestic Minarets at Outer Corners
    const minaretPositions = [
      { x: -75, z: -75 },
      { x: -75, z: 75 },
      { x: 85, z: -75 },
      { x: 85, z: 75 }
    ];

    const minaretMat = new THREE.MeshLambertMaterial({ color: 0xf8f8f6 });
    const minaretGoldMat = new THREE.MeshLambertMaterial({ color: 0xd4af37 });

    minaretPositions.forEach((pos) => {
      const minaretGroup = new THREE.Group();

      // Base tower
      const tower = new THREE.Mesh(new THREE.CylinderGeometry(2.4, 3.2, 45, 16), minaretMat);
      tower.position.y = 22.5;
      tower.castShadow = true;
      minaretGroup.add(tower);

      // Balcony
      const balcony = new THREE.Mesh(new THREE.CylinderGeometry(3.6, 2.8, 2.5, 16), minaretMat);
      balcony.position.y = 44;
      minaretGroup.add(balcony);

      // Upper Spire & Crescent
      const spire = new THREE.Mesh(new THREE.ConeGeometry(1.8, 12, 16), minaretMat);
      spire.position.y = 51;
      minaretGroup.add(spire);

      const crescent = new THREE.Mesh(new THREE.TorusGeometry(0.9, 0.15, 8, 16, Math.PI * 1.5), minaretGoldMat);
      crescent.position.y = 57.5;
      crescent.rotation.y = Math.PI / 4;
      minaretGroup.add(crescent);

      minaretGroup.position.set(pos.x, 0, pos.z);
      this.scene.add(minaretGroup);
    });
  }

  /**
   * Pintu Masuk Utama Masjidil Haram (Bab King Abdul Aziz Gate)
   */
  private createGrandMosqueEntrance() {
    const entranceGroup = new THREE.Group();
    entranceGroup.name = 'PintuMasukMasjidilHaram';

    const stoneMat = new THREE.MeshLambertMaterial({ color: 0xf3efe6 });
    const goldMat = new THREE.MeshLambertMaterial({ color: 0xd4af37 });
    const carpetMat = new THREE.MeshLambertMaterial({ color: 0x991b1b });

    // 1. Two Grand Flanking Portal Towers
    [-4.5, 4.5].forEach((offset) => {
      const tower = new THREE.Mesh(new THREE.BoxGeometry(2.8, 12, 3.2), stoneMat);
      tower.position.set(offset, 6, 54.5);
      tower.castShadow = true;
      entranceGroup.add(tower);

      // Gold-trimmed balcony & spire
      const spire = new THREE.Mesh(new THREE.ConeGeometry(1.2, 4.5, 12), goldMat);
      spire.position.set(offset, 14.25, 54.5);
      entranceGroup.add(spire);
    });

    // 2. Grand Arch Spanning the Top
    const lintel = new THREE.Mesh(new THREE.BoxGeometry(11.8, 2.8, 3.4), stoneMat);
    lintel.position.set(0, 10.6, 54.5);
    entranceGroup.add(lintel);

    const archCrown = new THREE.Mesh(new THREE.CylinderGeometry(3.1, 3.1, 3.2, 16, 1, false, 0, Math.PI), stoneMat);
    archCrown.rotation.z = Math.PI;
    archCrown.rotation.y = Math.PI / 2;
    archCrown.position.set(0, 9.2, 54.5);
    entranceGroup.add(archCrown);

    // 3. Dual Signboards (Front: Plaza facing, Back: Mataf facing)
    const signCanvas = document.createElement('canvas');
    signCanvas.width = 1024;
    signCanvas.height = 256;
    const sCtx = signCanvas.getContext('2d')!;
    sCtx.fillStyle = '#065f46';
    sCtx.fillRect(0, 0, 1024, 256);
    sCtx.strokeStyle = '#d4af37';
    sCtx.lineWidth = 14;
    sCtx.strokeRect(10, 10, 1004, 236);

    sCtx.fillStyle = '#fef08a';
    sCtx.textAlign = 'center';
    sCtx.font = 'bold 50px Amiri, serif';
    sCtx.fillText('بَاب الْمَلِك عَبْد العَزِيز • المَسْجِد الحَرَام', 512, 90);

    sCtx.fillStyle = '#ffffff';
    sCtx.font = 'bold 32px Inter, sans-serif';
    sCtx.fillText('🚪 PINTU MASUK UTAMA MASJIDIL HARAM', 512, 155);

    sCtx.fillStyle = '#cbd5e1';
    sCtx.font = '22px Inter, sans-serif';
    sCtx.fillText('SOLAT DI SINI = 100,000 KALI GANDA PAHALA', 512, 210);

    const signTexture = new THREE.CanvasTexture(signCanvas);
    const signMat = new THREE.MeshBasicMaterial({ map: signTexture });

    // Front Sign
    const frontSign = new THREE.Mesh(new THREE.PlaneGeometry(9, 2.25), signMat);
    frontSign.position.set(0, 11, 56.25);
    entranceGroup.add(frontSign);

    // Back Sign
    const backSign = new THREE.Mesh(new THREE.PlaneGeometry(9, 2.25), signMat);
    backSign.position.set(0, 11, 52.75);
    backSign.rotation.y = Math.PI;
    entranceGroup.add(backSign);

    // 4. Crimson & Gold Entrance Welcome Carpet Runner
    const carpet = new THREE.Mesh(new THREE.PlaneGeometry(6, 16), carpetMat);
    carpet.rotation.x = -Math.PI / 2;
    carpet.position.set(0, 0.03, 54);
    entranceGroup.add(carpet);

    // Glowing threshold lights
    const beacon = new THREE.Mesh(
      new THREE.CylinderGeometry(0.8, 0.8, 0.08, 16),
      new THREE.MeshBasicMaterial({ color: 0x10b981, transparent: true, opacity: 0.85 })
    );
    beacon.position.set(0, 0.05, 54);
    entranceGroup.add(beacon);

    this.scene.add(entranceGroup);
  }

  /**
   * Dedicated Prayer Carpet Area inside Masjidil Haram (near Maqam Ibrahim / Mataf)
   */
  private createHaramPrayerHall() {
    const prayerGroup = new THREE.Group();
    prayerGroup.name = 'RuangSolatMasjidilHaram';

    const carpetMat = new THREE.MeshLambertMaterial({ color: 0x991b1b });
    const goldMat = new THREE.MeshBasicMaterial({ color: 0xf59e0b });

    // 1. Raised Prayer Carpet on Mataf
    const carpet = new THREE.Mesh(new THREE.PlaneGeometry(16, 10), carpetMat);
    carpet.rotation.x = -Math.PI / 2;
    carpet.position.set(14, 0.03, 4.5);
    prayerGroup.add(carpet);

    // Saf Lines
    [-3, -1, 1, 3].forEach((zOff) => {
      const line = new THREE.Mesh(new THREE.PlaneGeometry(15.6, 0.08), goldMat);
      line.rotation.x = -Math.PI / 2;
      line.position.set(14, 0.04, 4.5 + zOff);
      prayerGroup.add(line);
    });

    // 2. Prayer Area Floor Signboard
    const prayerCanvas = document.createElement('canvas');
    prayerCanvas.width = 512;
    prayerCanvas.height = 128;
    const pCtx = prayerCanvas.getContext('2d')!;
    pCtx.fillStyle = '#991b1b';
    pCtx.fillRect(0, 0, 512, 128);
    pCtx.strokeStyle = '#d4af37';
    pCtx.lineWidth = 6;
    pCtx.strokeRect(4, 4, 504, 120);

    pCtx.fillStyle = '#fef08a';
    pCtx.textAlign = 'center';
    pCtx.font = 'bold 30px Amiri, serif';
    pCtx.fillText('رِحَاب الصَّلاَة • المَسْجِد الحَرَام', 256, 45);

    pCtx.fillStyle = '#ffffff';
    pCtx.font = 'bold 22px Inter, sans-serif';
    pCtx.fillText('🕌 RUANG SOLAT MASJIDIL HARAM', 256, 85);

    pCtx.fillStyle = '#fde68a';
    pCtx.font = '16px Inter, sans-serif';
    pCtx.fillText('100,000 PAHALA BERBANDING MASJID LAIN', 256, 112);

    const prayerSign = new THREE.Mesh(
      new THREE.PlaneGeometry(4.5, 1.15),
      new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(prayerCanvas) })
    );
    prayerSign.position.set(14, 1.2, 9.6);
    prayerGroup.add(prayerSign);

    this.scene.add(prayerGroup);
  }

  private setupCheckpoints() {
    this.checkpoints = [
      {
        name: 'Garisan Hajarul Aswad',
        type: 'hajar_aswad',
        x: 18,
        z: 18,
        radius: 7.5,
        description: 'Titik mula dan akhir pusingan Tawaf. Berdiri mengadap Kaabah dan lakukan istilam.'
      },
      {
        name: 'Rukun Yamani',
        type: 'rukun_yamani',
        x: -12,
        z: 14,
        radius: 6.5,
        description: 'Sunnah menyapu atau melambai dengan tangan kanan sambil membaca doa Rabbana atina...'
      },
      {
        name: 'Maqam Ibrahim',
        type: 'maqam_ibrahim',
        x: 13,
        z: 3.5,
        radius: 5.5,
        description: 'Tempat solat sunat tawaf 2 rakaat di belakang Maqam Ibrahim.'
      },
      {
        name: 'Air Zamzam',
        type: 'zamzam',
        x: 38,
        z: 8,
        radius: 6.0,
        description: 'Stesen air Zamzam. Minum dengan membaca Bismillah dan doa.'
      },
      {
        name: 'Bukit Safa',
        type: 'safa',
        x: 65,
        z: 45,
        radius: 7.0,
        description: 'Titik permulaan Sa\'i. Panjat ke bukit Safa, mengadap Kaabah dan bertakbir.'
      },
      {
        name: 'Bukit Marwah',
        type: 'marwah',
        x: 65,
        z: -45,
        radius: 7.0,
        description: 'Titik penghujung pusingan ganjil Sa\'i dan penamat Sa\'i pada pusingan ke-7.'
      },
      {
        name: 'Zon Lampu Hijau Mas\'a',
        type: 'green_lights',
        x: 65,
        z: 3,
        radius: 12.0,
        description: 'Lelaki disunatkan berlari-lari anak (Harwalah / Raml) sambil berdoa.'
      }
    ];

    if (this.madinahZone && this.madinahZone.checkpoints) {
      this.checkpoints.push(...this.madinahZone.checkpoints);
    }
  }
}
