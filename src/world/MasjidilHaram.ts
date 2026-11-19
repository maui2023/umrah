import * as THREE from 'three';
import { CheckpointZone } from '../types';
import { MadinahZone } from './MadinahZone';

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

    // Mas'a Floor (Polished cool marble)
    const masaFloorGeo = new THREE.BoxGeometry(masaWidth, 0.2, masaLength);
    const masaFloorMat = new THREE.MeshLambertMaterial({ color: 0xf4f0e6 });
    const masaFloor = new THREE.Mesh(masaFloorGeo, masaFloorMat);
    masaFloor.position.set(masaX, 0.1, 0);
    masaFloor.receiveShadow = true;
    this.scene.add(masaFloor);

    // Mas'a Roof & Arches
    const roofGeo = new THREE.BoxGeometry(masaWidth + 2, 0.6, masaLength + 4);
    const roofMat = new THREE.MeshLambertMaterial({ color: 0xe5e1d8 });
    const roof = new THREE.Mesh(roofGeo, roofMat);
    roof.position.set(masaX, 7, 0);
    this.scene.add(roof);

    // Mas'a Pillars along both sides
    const pillarMat = new THREE.MeshLambertMaterial({ color: 0xfdfdfd });
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

    // Mas'a Solid Outer Walls & Safety Glass Enclosure (Prevents falling off/walking through)
    const wallScreenMat = new THREE.MeshLambertMaterial({ color: 0xf3efe6 });
    // East wall (full length)
    const eastWall = new THREE.Mesh(new THREE.BoxGeometry(0.45, 3.8, masaLength), wallScreenMat);
    eastWall.position.set(masaX + masaWidth / 2, 1.9, 0);
    this.scene.add(eastWall);

    // West wall (with opening connecting Mataf between z: -2 and +8)
    const westWallNorth = new THREE.Mesh(new THREE.BoxGeometry(0.45, 3.8, 48), wallScreenMat);
    westWallNorth.position.set(masaX - masaWidth / 2, 1.9, -29);
    const westWallSouth = new THREE.Mesh(new THREE.BoxGeometry(0.45, 3.8, 44), wallScreenMat);
    westWallSouth.position.set(masaX - masaWidth / 2, 1.9, 29);
    this.scene.add(westWallNorth, westWallSouth);

    // North & South End Walls behind Bukit Safa & Marwah
    const northWall = new THREE.Mesh(new THREE.BoxGeometry(masaWidth + 1, 4.5, 0.5), wallScreenMat);
    northWall.position.set(masaX, 2.25, marwahZ - 7);
    const southWall = new THREE.Mesh(new THREE.BoxGeometry(masaWidth + 1, 4.5, 0.5), wallScreenMat);
    southWall.position.set(masaX, 2.25, safaZ + 7);
    this.scene.add(northWall, southWall);

    // 1. Bukit Safa (Jabal Safa)
    this.safaHillMesh = new THREE.Group();
    const rockMat = new THREE.MeshLambertMaterial({ color: 0x7a6a58 });

    // Rocky elevated platform & steps
    const safaPlatform = new THREE.Mesh(new THREE.CylinderGeometry(5.5, 6.5, 1.8, 16), rockMat);
    safaPlatform.position.set(0, 0.9, 0);
    this.safaHillMesh.add(safaPlatform);

    // Authentic crags/boulders on Safa
    for (let b = 0; b < 6; b++) {
      const boulder = new THREE.Mesh(
        new THREE.DodecahedronGeometry(0.8 + Math.random() * 0.5),
        rockMat
      );
      boulder.position.set(
        (Math.random() - 0.5) * 4,
        1.9 + Math.random() * 0.4,
        (Math.random() - 0.5) * 4
      );
      this.safaHillMesh.add(boulder);
    }
    this.safaHillMesh.position.set(masaX, 0, safaZ);
    this.scene.add(this.safaHillMesh);

    // 2. Bukit Marwah (Jabal Marwah)
    this.marwahHillMesh = new THREE.Group();
    const marwahPlatform = new THREE.Mesh(new THREE.CylinderGeometry(5.5, 6.5, 1.8, 16), rockMat);
    marwahPlatform.position.set(0, 0.9, 0);
    this.marwahHillMesh.add(marwahPlatform);

    for (let b = 0; b < 6; b++) {
      const boulder = new THREE.Mesh(
        new THREE.DodecahedronGeometry(0.8 + Math.random() * 0.5),
        rockMat
      );
      boulder.position.set(
        (Math.random() - 0.5) * 4,
        1.9 + Math.random() * 0.4,
        (Math.random() - 0.5) * 4
      );
      this.marwahHillMesh.add(boulder);
    }
    this.marwahHillMesh.position.set(masaX, 0, marwahZ);
    this.scene.add(this.marwahHillMesh);

    // 3. Batn al-Wadi (Green Lights Zone between Safa and Marwah)
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
