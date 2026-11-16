import * as THREE from 'three';
import { CheckpointZone } from '../types';
import { BusController } from '../controllers/BusController';

export class MadinahZone {
  public group: THREE.Group;
  public busController!: BusController;
  public busGroup!: THREE.Group;
  public birAliMesh!: THREE.Group;
  public qubaMesh!: THREE.Group;
  public uhudMesh!: THREE.Group;
  public datePalmsGroup!: THREE.Group;
  public highwayGroup!: THREE.Group;
  public checkpoints: CheckpointZone[] = [];

  constructor(scene: THREE.Scene) {
    this.group = new THREE.Group();
    this.group.name = 'MadinahZone';
    scene.add(this.group);

    this.buildZone();
    this.setupCheckpoints();
  }

  private buildZone() {
    this.createHighwayRoad();
    this.createUmrahTourBus();
    this.createMasjidBirAli();
    this.createMasjidQuba();
    this.createJabalUhud();
    this.createDatePalmOasis();
    this.createHistoricalWaypoints();
  }

  /**
   * Paved asphalt highway representing Lebuhraya Hijrah (Madinah to Makkah)
   */
  private createHighwayRoad() {
    this.highwayGroup = new THREE.Group();

    // Road asphalt surface (extended length)
    const roadWidth = 14;
    const roadLength = 200;
    const roadGeo = new THREE.PlaneGeometry(roadWidth, roadLength);
    const roadMat = new THREE.MeshLambertMaterial({ color: 0x24282f });
    const road = new THREE.Mesh(roadGeo, roadMat);
    road.rotation.x = -Math.PI / 2;
    road.position.set(-140, 0.02, 10);
    road.receiveShadow = true;
    this.highwayGroup.add(road);

    // Yellow center lines (dashed)
    for (let z = -85; z <= 100; z += 6) {
      const lineGeo = new THREE.PlaneGeometry(0.3, 3.5);
      const lineMat = new THREE.MeshBasicMaterial({ color: 0xfbbf24 });
      const line = new THREE.Mesh(lineGeo, lineMat);
      line.rotation.x = -Math.PI / 2;
      line.position.set(-140, 0.03, z);
      this.highwayGroup.add(line);
    }

    // White shoulder lines
    [-6.5, 6.5].forEach((offset) => {
      const lineGeo = new THREE.PlaneGeometry(0.35, roadLength);
      const lineMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
      const line = new THREE.Mesh(lineGeo, lineMat);
      line.rotation.x = -Math.PI / 2;
      line.position.set(-140 + offset, 0.03, 10);
      this.highwayGroup.add(line);
    });

    // Paved Branch Parking Bays & Roadside Turnouts
    const bayMat = new THREE.MeshLambertMaterial({ color: 0x24282f });

    // 1. Madinah Station / Start Bay (x: -133, z: -8)
    const bayStation = new THREE.Mesh(new THREE.PlaneGeometry(16, 26), bayMat);
    bayStation.rotation.x = -Math.PI / 2;
    bayStation.position.set(-133, 0.02, -8);
    bayStation.receiveShadow = true;
    this.highwayGroup.add(bayStation);

    // 2. Masjid Quba Bay (x: -125, z: -35)
    const bayQuba = new THREE.Mesh(new THREE.PlaneGeometry(24, 20), bayMat);
    bayQuba.rotation.x = -Math.PI / 2;
    bayQuba.position.set(-126, 0.02, -35);
    bayQuba.receiveShadow = true;
    this.highwayGroup.add(bayQuba);

    // 3. Ladang Kurma Bay (x: -133, z: -45)
    const bayKurma = new THREE.Mesh(new THREE.PlaneGeometry(16, 18), bayMat);
    bayKurma.rotation.x = -Math.PI / 2;
    bayKurma.position.set(-133, 0.02, -45);
    bayKurma.receiveShadow = true;
    this.highwayGroup.add(bayKurma);

    // 4. Jabal Uhud Bay (x: -151, z: -55)
    const bayUhud = new THREE.Mesh(new THREE.PlaneGeometry(22, 20), bayMat);
    bayUhud.rotation.x = -Math.PI / 2;
    bayUhud.position.set(-150, 0.02, -55);
    bayUhud.receiveShadow = true;
    this.highwayGroup.add(bayUhud);

    // 5. Masjid Bir Ali Bay (x: -148, z: 32)
    const bayBirAli = new THREE.Mesh(new THREE.PlaneGeometry(18, 26), bayMat);
    bayBirAli.rotation.x = -Math.PI / 2;
    bayBirAli.position.set(-148, 0.02, 32);
    bayBirAli.receiveShadow = true;
    this.highwayGroup.add(bayBirAli);

    // Overhead Highway Gantry Signboard (Madinah ➔ Miqat Bir Ali ➔ Makkah)
    const gantry = new THREE.Group();
    const poleMat = new THREE.MeshLambertMaterial({ color: 0x475569 });
    const leftPole = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.25, 9, 12), poleMat);
    leftPole.position.set(-148, 4.5, 10);
    const rightPole = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.25, 9, 12), poleMat);
    rightPole.position.set(-132, 4.5, 10);

    const beam = new THREE.Mesh(new THREE.BoxGeometry(16.5, 0.5, 0.5), poleMat);
    beam.position.set(-140, 8.5, 10);

    // Signboard panel
    const signBoardMat = new THREE.MeshLambertMaterial({ color: 0x047857 }); // Emerald Highway Green
    const signBoard = new THREE.Mesh(new THREE.BoxGeometry(14, 2.4, 0.2), signBoardMat);
    signBoard.position.set(-140, 8.5, 10.1);

    // Signboard Canvas Texture
    const signCanvas = document.createElement('canvas');
    signCanvas.width = 1024;
    signCanvas.height = 256;
    const ctx = signCanvas.getContext('2d')!;
    ctx.fillStyle = '#065f46';
    ctx.fillRect(0, 0, 1024, 256);
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 12;
    ctx.strokeRect(10, 10, 1004, 236);

    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.font = 'bold 44px Amiri, serif';
    ctx.fillText('طَرِيق الهِجْرَة النَّبَوِيَّة • مَكَّة المُكَرَّمَة', 512, 75);

    ctx.font = 'bold 36px Inter, sans-serif';
    ctx.fillText('LEBUHRAYA HIJRAH: MADINAH ➔ MIQAT BIR ALI ➔ MAKKAH', 512, 140);

    ctx.fillStyle = '#fde047';
    ctx.font = 'bold 32px Inter, sans-serif';
    ctx.fillText('MIQAT BIR ALI 11 KM   |   MAKKAH AL-MUKARRAMAH 450 KM', 512, 205);

    const signTexture = new THREE.CanvasTexture(signCanvas);
    const signFrontMat = new THREE.MeshBasicMaterial({ map: signTexture });
    const signFront = new THREE.Mesh(new THREE.PlaneGeometry(13.8, 2.2), signFrontMat);
    signFront.position.set(-140, 8.5, 10.22);

    gantry.add(leftPole, rightPole, beam, signBoard, signFront);
    this.highwayGroup.add(gantry);

    // Street light poles along highway
    [-60, -30, 0, 30, 60].forEach((zPos) => {
      const lamp = new THREE.Group();
      const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.16, 8, 8), poleMat);
      mast.position.set(0, 4, 0);
      const arm = new THREE.Mesh(new THREE.BoxGeometry(2, 0.12, 0.12), poleMat);
      arm.position.set(0.9, 7.8, 0);
      const lampHead = new THREE.Mesh(
        new THREE.BoxGeometry(0.8, 0.15, 0.35),
        new THREE.MeshBasicMaterial({ color: 0xfffbeb })
      );
      lampHead.position.set(1.8, 7.7, 0);
      lamp.add(mast, arm, lampHead);
      lamp.position.set(-148, 0, zPos);
      this.highwayGroup.add(lamp);
    });

    this.group.add(this.highwayGroup);
  }

  /**
   * 3D Umrah Tour Bus Controller & Interactive Coach
   */
  private createUmrahTourBus() {
    this.busController = new BusController(this.group);
    this.busGroup = this.busController.busGroup;
  }

  /**
   * Masjid Bir Ali (Dzulhulaifah) - Miqat Umrah Pertama
   */
  private createMasjidBirAli() {
    this.birAliMesh = new THREE.Group();
    this.birAliMesh.name = 'MasjidBirAli';

    const stoneMat = new THREE.MeshLambertMaterial({ color: 0xf1efe7 });
    const goldMat = new THREE.MeshLambertMaterial({ color: 0xd97706 });
    const greenCarpetMat = new THREE.MeshLambertMaterial({ color: 0x047857 });

    // Raised courtyard terrace
    const terrace = new THREE.Mesh(
      new THREE.BoxGeometry(32, 0.4, 28),
      new THREE.MeshLambertMaterial({ color: 0xe5e2d6 })
    );
    terrace.position.set(0, 0.2, 0);
    terrace.receiveShadow = true;
    this.birAliMesh.add(terrace);

    // Green Prayer Carpet Area (Solat Sunat Ihram & Niat)
    const carpet = new THREE.Mesh(new THREE.PlaneGeometry(24, 18), greenCarpetMat);
    carpet.rotation.x = -Math.PI / 2;
    carpet.position.set(0, 0.42, 0);
    this.birAliMesh.add(carpet);

    // Iconic Stepped Minaret of Masjid Bir Ali (Square base transitioning to tiered arcades)
    const minaretBase = new THREE.Mesh(new THREE.BoxGeometry(4.5, 12, 4.5), stoneMat);
    minaretBase.position.set(-12, 6, -10);
    const minaretTier2 = new THREE.Mesh(new THREE.BoxGeometry(3.6, 8, 3.6), stoneMat);
    minaretTier2.position.set(-12, 16, -10);
    const minaretTier3 = new THREE.Mesh(new THREE.CylinderGeometry(1.4, 1.6, 6, 12), stoneMat);
    minaretTier3.position.set(-12, 23, -10);
    const minaretDome = new THREE.Mesh(new THREE.ConeGeometry(1.5, 4, 12), goldMat);
    minaretDome.position.set(-12, 28, -10);

    this.birAliMesh.add(minaretBase, minaretTier2, minaretTier3, minaretDome);

    // Arcade Colonnade Pillars with Islamic Arches
    for (let x = -10; x <= 10; x += 5) {
      const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.45, 6, 12), stoneMat);
      pillar.position.set(x, 3, -8);
      this.birAliMesh.add(pillar);
    }

    // Colonnade roof
    const roof = new THREE.Mesh(new THREE.BoxGeometry(26, 0.6, 10), stoneMat);
    roof.position.set(0, 6.3, -4);
    this.birAliMesh.add(roof);

    // Islamic Miqat Welcome Gate Archway
    const gateArch = new THREE.Mesh(new THREE.BoxGeometry(14, 1.8, 1.2), stoneMat);
    gateArch.position.set(0, 6.2, 12);
    const gatePostL = new THREE.Mesh(new THREE.BoxGeometry(1.4, 6, 1.2), stoneMat);
    gatePostL.position.set(-6, 3, 12);
    const gatePostR = new THREE.Mesh(new THREE.BoxGeometry(1.4, 6, 1.2), stoneMat);
    gatePostR.position.set(6, 3, 12);
    this.birAliMesh.add(gateArch, gatePostL, gatePostR);

    // Miqat Bir Ali Signboard Canvas
    const miqatCanvas = document.createElement('canvas');
    miqatCanvas.width = 1024;
    miqatCanvas.height = 256;
    const mCtx = miqatCanvas.getContext('2d')!;
    mCtx.fillStyle = '#065f46';
    mCtx.fillRect(0, 0, 1024, 256);
    mCtx.strokeStyle = '#d97706';
    mCtx.lineWidth = 14;
    mCtx.strokeRect(10, 10, 1004, 236);

    mCtx.fillStyle = '#fef08a';
    mCtx.textAlign = 'center';
    mCtx.font = 'bold 50px Amiri, serif';
    mCtx.fillText('مِيقَات مَسْجِد ذِي الحُلَيْفَة (آبَار عَلِي)', 512, 85);

    mCtx.fillStyle = '#ffffff';
    mCtx.font = 'bold 40px Inter, sans-serif';
    mCtx.fillText('MIQAT MASJID BIR ALI - NIAT UMRAH PERTAMA', 512, 155);

    mCtx.fillStyle = '#86efac';
    mCtx.font = 'bold 30px Inter, sans-serif';
    mCtx.fillText('Solat Sunat Ihram 2 Rakaat & Lafaz Niat Umrah', 512, 210);

    const miqatTexture = new THREE.CanvasTexture(miqatCanvas);
    const miqatMat = new THREE.MeshBasicMaterial({ map: miqatTexture });
    const miqatSign = new THREE.Mesh(new THREE.PlaneGeometry(11, 2.2), miqatMat);
    miqatSign.position.set(0, 6.2, 12.65);
    this.birAliMesh.add(miqatSign);

    // Golden glowing checkpoint beacon for Niat Umrah
    const beaconGeo = new THREE.CylinderGeometry(1.8, 1.8, 0.2, 24);
    const beaconMat = new THREE.MeshBasicMaterial({
      color: 0x10b981,
      transparent: true,
      opacity: 0.8
    });
    const beacon = new THREE.Mesh(beaconGeo, beaconMat);
    beacon.position.set(0, 0.45, 0);
    this.birAliMesh.add(beacon);

    // Glowing beam pointing up
    const beamGeo = new THREE.CylinderGeometry(0.1, 0.1, 40, 8);
    const beamMat = new THREE.MeshBasicMaterial({
      color: 0x34d399,
      transparent: true,
      opacity: 0.5
    });
    const beam = new THREE.Mesh(beamGeo, beamMat);
    beam.position.set(0, 20, 0);
    this.birAliMesh.add(beam);

    // Position at x: -150, z: 32 (along the highway towards Makkah)
    this.birAliMesh.position.set(-155, 0, 32);
    this.group.add(this.birAliMesh);
  }

  /**
   * Masjid Quba (Solat di Masjid = Pahala 1 Umrah)
   */
  private createMasjidQuba() {
    this.qubaMesh = new THREE.Group();
    this.qubaMesh.name = 'MasjidQuba';

    const whiteMat = new THREE.MeshLambertMaterial({ color: 0xffffff });
    const domeMat = new THREE.MeshLambertMaterial({ color: 0xfafafa });

    // Courtyard base
    const base = new THREE.Mesh(new THREE.BoxGeometry(22, 0.4, 22), whiteMat);
    base.position.y = 0.2;
    this.qubaMesh.add(base);

    // Central Grand Dome
    const dome = new THREE.Mesh(
      new THREE.SphereGeometry(4.2, 20, 20, 0, Math.PI * 2, 0, Math.PI / 2),
      domeMat
    );
    dome.position.set(0, 6, 0);
    this.qubaMesh.add(dome);

    // 4 Corner domes
    [
      [-5.5, -5.5],
      [5.5, -5.5],
      [-5.5, 5.5],
      [5.5, 5.5]
    ].forEach(([cx, cz]) => {
      const miniDome = new THREE.Mesh(
        new THREE.SphereGeometry(1.8, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2),
        domeMat
      );
      miniDome.position.set(cx, 6, cz);
      this.qubaMesh.add(miniDome);
    });

    // Walls & Facade
    const mainBuilding = new THREE.Mesh(new THREE.BoxGeometry(16, 6, 16), whiteMat);
    mainBuilding.position.y = 3;
    mainBuilding.castShadow = true;
    this.qubaMesh.add(mainBuilding);

    // Signboard: MASJID QUBA
    const qubaCanvas = document.createElement('canvas');
    qubaCanvas.width = 512;
    qubaCanvas.height = 128;
    const qCtx = qubaCanvas.getContext('2d')!;
    qCtx.fillStyle = '#0f766e';
    qCtx.fillRect(0, 0, 512, 128);
    qCtx.strokeStyle = '#ffffff';
    qCtx.lineWidth = 8;
    qCtx.strokeRect(6, 6, 500, 116);
    qCtx.fillStyle = '#ffffff';
    qCtx.textAlign = 'center';
    qCtx.font = 'bold 36px Amiri, serif';
    qCtx.fillText('مَسْجِد قُبَاء • أَوَّل مَسْجِد فِي الإِسْلاَم', 256, 48);
    qCtx.font = 'bold 26px Inter, sans-serif';
    qCtx.fillText('MASJID QUBA (SOLAT = PAHALA 1 UMRAH)', 256, 95);

    const qubaTexture = new THREE.CanvasTexture(qubaCanvas);
    const qubaSign = new THREE.Mesh(
      new THREE.PlaneGeometry(8, 2),
      new THREE.MeshBasicMaterial({ map: qubaTexture })
    );
    qubaSign.position.set(0, 4.5, 8.05);
    this.qubaMesh.add(qubaSign);

    // Position at x: -115, z: -35
    this.qubaMesh.position.set(-115, 0, -35);
    this.group.add(this.qubaMesh);
  }

  /**
   * Jabal Uhud, Bukit Pemanah & Makam Shuhada
   */
  private createJabalUhud() {
    this.uhudMesh = new THREE.Group();
    this.uhudMesh.name = 'JabalUhud';

    const rockMat = new THREE.MeshLambertMaterial({ color: 0x8b5a2b }); // Reddish-brown mountain rock
    const sandMat = new THREE.MeshLambertMaterial({ color: 0xd2b48c });

    // Dramatic Mount Uhud Range Ridge
    for (let i = -3; i <= 3; i++) {
      const height = 16 + Math.sin(i) * 6;
      const mountainPeak = new THREE.Mesh(
        new THREE.ConeGeometry(9 + Math.abs(i) * 2, height, 8),
        rockMat
      );
      mountainPeak.position.set(-170 + i * 9, height / 2, -65 + Math.cos(i) * 4);
      mountainPeak.castShadow = true;
      this.uhudMesh.add(mountainPeak);
    }

    // Bukit Pemanah (Jabal Rumat) - Rocky hillock
    const archersHill = new THREE.Mesh(
      new THREE.CylinderGeometry(5, 7, 3.5, 12),
      sandMat
    );
    archersHill.position.set(-155, 1.75, -50);
    this.uhudMesh.add(archersHill);

    // Historical Flag on Bukit Pemanah
    const flagPole = new THREE.Mesh(
      new THREE.CylinderGeometry(0.08, 0.08, 5, 8),
      new THREE.MeshLambertMaterial({ color: 0x475569 })
    );
    flagPole.position.set(-155, 5, -50);
    const flagCloth = new THREE.Mesh(
      new THREE.PlaneGeometry(1.6, 1),
      new THREE.MeshBasicMaterial({ color: 0x059669, side: THREE.DoubleSide })
    );
    flagCloth.position.set(-154.2, 6.8, -50);
    this.uhudMesh.add(flagPole, flagCloth);

    // Makam 70 Shuhada Uhud Enclosure Wall
    const makamWallMat = new THREE.MeshLambertMaterial({ color: 0xf1f5f9 });
    const wall1 = new THREE.Mesh(new THREE.BoxGeometry(14, 1.8, 0.4), makamWallMat);
    wall1.position.set(-162, 0.9, -42);
    const wall2 = new THREE.Mesh(new THREE.BoxGeometry(14, 1.8, 0.4), makamWallMat);
    wall2.position.set(-162, 0.9, -52);
    const wall3 = new THREE.Mesh(new THREE.BoxGeometry(0.4, 1.8, 10), makamWallMat);
    wall3.position.set(-169, 0.9, -47);
    const wall4 = new THREE.Mesh(new THREE.BoxGeometry(0.4, 1.8, 10), makamWallMat);
    wall4.position.set(-155, 0.9, -47);
    this.uhudMesh.add(wall1, wall2, wall3, wall4);

    // Signboard Makam Shuhada Uhud & Sayyidina Hamzah
    const uhudCanvas = document.createElement('canvas');
    uhudCanvas.width = 512;
    uhudCanvas.height = 128;
    const uCtx = uhudCanvas.getContext('2d')!;
    uCtx.fillStyle = '#1e293b';
    uCtx.fillRect(0, 0, 512, 128);
    uCtx.strokeStyle = '#22c55e';
    uCtx.lineWidth = 6;
    uCtx.strokeRect(6, 6, 500, 116);
    uCtx.fillStyle = '#4ade80';
    uCtx.textAlign = 'center';
    uCtx.font = 'bold 32px Amiri, serif';
    uCtx.fillText('مَقْبَرَة شُهَدَاء أُحُد • سَيِّد الشُّهَدَاء حَمْزَة', 256, 48);
    uCtx.fillStyle = '#f8fafc';
    uCtx.font = 'bold 22px Inter, sans-serif';
    uCtx.fillText('MAKAM SHUHADA UHUD & BUKIT PEMANAH', 256, 92);

    const uhudTexture = new THREE.CanvasTexture(uhudCanvas);
    const uhudSign = new THREE.Mesh(
      new THREE.PlaneGeometry(6.5, 1.6),
      new THREE.MeshBasicMaterial({ map: uhudTexture })
    );
    uhudSign.position.set(-162, 2.2, -41.7);
    this.uhudMesh.add(uhudSign);

    this.group.add(this.uhudMesh);
  }

  /**
   * Ladang Kurma Madinah (Date Palm Oasis)
   */
  private createDatePalmOasis() {
    this.datePalmsGroup = new THREE.Group();
    this.datePalmsGroup.name = 'LadangKurma';

    const palmPositions = [
      { x: -128, z: -48 },
      { x: -134, z: -52 },
      { x: -122, z: -44 },
      { x: -130, z: -40 },
      { x: -138, z: -46 },
      { x: -125, z: -55 },
      { x: -142, z: -38 },
      { x: -118, z: -50 }
    ];

    const trunkMat = new THREE.MeshLambertMaterial({ color: 0x785338 });
    const frondMat = new THREE.MeshLambertMaterial({ color: 0x15803d, side: THREE.DoubleSide });
    const datesMat = new THREE.MeshLambertMaterial({ color: 0xb45309 });

    palmPositions.forEach((pos) => {
      const palm = new THREE.Group();

      // Slender tall curved trunk
      const trunk = new THREE.Mesh(
        new THREE.CylinderGeometry(0.35, 0.55, 7.5, 8),
        trunkMat
      );
      trunk.position.y = 3.75;
      trunk.castShadow = true;
      palm.add(trunk);

      // Fronds canopy (curved leaves radiating outward)
      for (let angle = 0; angle < Math.PI * 2; angle += Math.PI / 4) {
        const frond = new THREE.Mesh(
          new THREE.BoxGeometry(0.4, 0.08, 3.8),
          frondMat
        );
        frond.position.set(Math.cos(angle) * 1.6, 7.2, Math.sin(angle) * 1.6);
        frond.rotation.y = angle;
        frond.rotation.x = 0.45;
        palm.add(frond);
      }

      // Hanging Date clusters
      for (let d = 0; d < 3; d++) {
        const cluster = new THREE.Mesh(
          new THREE.DodecahedronGeometry(0.45),
          datesMat
        );
        cluster.position.set(
          Math.cos(d * 2) * 0.7,
          6.6,
          Math.sin(d * 2) * 0.7
        );
        palm.add(cluster);
      }

      palm.position.set(pos.x, 0, pos.z);
      this.datePalmsGroup.add(palm);
    });

    // Ladang Kurma Sign
    const palmSignCanvas = document.createElement('canvas');
    palmSignCanvas.width = 512;
    palmSignCanvas.height = 128;
    const pCtx = palmSignCanvas.getContext('2d')!;
    pCtx.fillStyle = '#064e3b';
    pCtx.fillRect(0, 0, 512, 128);
    pCtx.fillStyle = '#fde047';
    pCtx.textAlign = 'center';
    pCtx.font = 'bold 36px Amiri, serif';
    pCtx.fillText('مَزَارِع التُّمُور بِالمَدِينَة المُنَوَّرَة', 256, 50);
    pCtx.fillStyle = '#ffffff';
    pCtx.font = 'bold 26px Inter, sans-serif';
    pCtx.fillText('LADANG KURMA MADINAH (AJWA NABI)', 256, 96);

    const palmSign = new THREE.Mesh(
      new THREE.PlaneGeometry(6, 1.5),
      new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(palmSignCanvas) })
    );
    palmSign.position.set(-130, 2, -37);
    this.datePalmsGroup.add(palmSign);

    this.group.add(this.datePalmsGroup);
  }

  /**
   * Historical Landmark Waypoint Markers with Floating 3D Icons
   */
  private createHistoricalWaypoints() {
    const waypoints = [
      { id: 'saqifah', name: 'Saqifah Bani Saedah', x: -130, z: 2, icon: '🏛️' },
      { id: 'ghamamah', name: 'Masjid Alghamamah & Abu Bakar', x: -132, z: 8, icon: '☁️' },
      { id: 'muwajahah', name: 'Maqam Rasulullah ﷺ', x: -135, z: 12, icon: '💚' },
      { id: 'raudhah', name: 'Raudhah Syarifah (Nusuk)', x: -136, z: 15, icon: '🌿' },
      { id: 'baqi', name: 'Perkuburan Baqi\'', x: -138, z: 18, icon: '🤍' },
      { id: 'khandak', name: 'Medan Khandak / Masjid 7', x: -145, z: -55, icon: '⚔️' }
    ];

    waypoints.forEach((wp) => {
      const wpGroup = new THREE.Group();

      // Small stone pediment
      const pediment = new THREE.Mesh(
        new THREE.CylinderGeometry(0.8, 1.0, 0.35, 12),
        new THREE.MeshLambertMaterial({ color: 0x475569 })
      );
      pediment.position.y = 0.17;
      wpGroup.add(pediment);

      // Light beam
      const beam = new THREE.Mesh(
        new THREE.CylinderGeometry(0.05, 0.05, 8, 8),
        new THREE.MeshBasicMaterial({
          color: 0x10b981,
          transparent: true,
          opacity: 0.35
        })
      );
      beam.position.y = 4;
      wpGroup.add(beam);

      wpGroup.position.set(wp.x, 0, wp.z);
      this.group.add(wpGroup);
    });
  }

  private setupCheckpoints() {
    this.checkpoints = [
      {
        name: 'Bas Ziarah Umrah Madinah',
        type: 'madinah_bus',
        x: -135,
        z: -8,
        radius: 8.0,
        description: 'Menaiki bas ziarah rombongan untuk melawat tempat bersejarah di luar Madinah.'
      },
      {
        name: 'Masjid Quba',
        type: 'masjid_quba',
        x: -115,
        z: -35,
        radius: 9.0,
        description: 'Solat sunat di Masjid Quba. Sabda Nabi ﷺ ganjaran solat di sini seumpama pahala 1 Umrah.'
      },
      {
        name: 'Jabal Uhud & Makam Shuhada',
        type: 'jabal_uhud',
        x: -160,
        z: -50,
        radius: 12.0,
        description: 'Menziarahi Makam 70 Shuhada Uhud termasuk Penghulu Syuhada Sayyidina Hamzah R.A. & Bukit Pemanah.'
      },
      {
        name: 'Ladang Kurma',
        type: 'ladang_kurma',
        x: -130,
        z: -45,
        radius: 10.0,
        description: 'Melawat ladang kurma Madinah dan menikmati kurma Ajwa asli.'
      },
      {
        name: 'Miqat Masjid Bir Ali (Zulhulaifah)',
        type: 'miqat_bir_ali',
        x: -155,
        z: 32,
        radius: 10.0,
        description: 'Solat sunat Ihram 2 rakaat dan melafazkan Niat Umrah Pertama sebelum bertolak ke Makkah.'
      }
    ];
  }
}
