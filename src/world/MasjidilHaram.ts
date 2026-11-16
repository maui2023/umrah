import * as THREE from 'three';
import { CheckpointZone } from '../types';

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

    // Grand Mosque outer plaza floor
    const plazaGeo = new THREE.PlaneGeometry(350, 350);
    const plazaMat = new THREE.MeshLambertMaterial({ color: 0xedebe6 });
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
  }
}
