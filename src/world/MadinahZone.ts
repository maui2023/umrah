import * as THREE from 'three';
import { CheckpointZone } from '../types';
import { BusController } from '../controllers/BusController';

export class MadinahZone {
  public group: THREE.Group;
  public busController!: BusController;
  public busGroup!: THREE.Group;
  public birAliMesh!: THREE.Group;
  public qubaMesh!: THREE.Group;
  public nabawiMesh!: THREE.Group;
  public qiblatainMesh!: THREE.Group;
  public ghamamahMesh!: THREE.Group;
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
    this.createMasjidNabawi();
    this.createMasjidBirAli();
    this.createMasjidQuba();
    this.createMasjidQiblatain();
    this.createMasjidAlghamamah();
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
    mCtx.font = 'bold 36px Inter, sans-serif';
    mCtx.fillText('🚪 PINTU MASUK MASJID BIR ALI (MIQAT)', 512, 155);

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
   * Masjid Nabawi (Kubah Hijau & Raudhah Syarifah)
   */
  private createMasjidNabawi() {
    this.nabawiMesh = new THREE.Group();
    this.nabawiMesh.name = 'MasjidNabawi';

    const stoneMat = new THREE.MeshLambertMaterial({ color: 0xf5f3ee });
    const greenDomeMat = new THREE.MeshLambertMaterial({ color: 0x047857 }); // Iconic Green Dome
    const goldMat = new THREE.MeshLambertMaterial({ color: 0xd97706 });
    const raudhahCarpetMat = new THREE.MeshLambertMaterial({ color: 0x059669 }); // Raudhah Green Carpet

    // 1. Raised Courtyard Base
    const base = new THREE.Mesh(new THREE.BoxGeometry(20, 0.35, 18), stoneMat);
    base.position.set(0, 0.17, 0);
    base.receiveShadow = true;
    this.nabawiMesh.add(base);

    // 2. Raudhah Syarifah Prayer Carpet (Interior Green Carpet)
    const raudhahCarpet = new THREE.Mesh(new THREE.PlaneGeometry(16, 12), raudhahCarpetMat);
    raudhahCarpet.rotation.x = -Math.PI / 2;
    raudhahCarpet.position.set(0, 0.36, 1);
    this.nabawiMesh.add(raudhahCarpet);

    // Gold Saf Lines on Raudhah Carpet
    [-3.5, -1.2, 1.2, 3.5].forEach((zOff) => {
      const line = new THREE.Mesh(new THREE.PlaneGeometry(15.5, 0.08), new THREE.MeshBasicMaterial({ color: 0xfef08a }));
      line.rotation.x = -Math.PI / 2;
      line.position.set(0, 0.37, 1 + zOff);
      this.nabawiMesh.add(line);
    });

    // 3. Iconic Kubah Hijau (Green Dome of the Prophet's Mosque)
    const greenDome = new THREE.Mesh(
      new THREE.SphereGeometry(3.6, 24, 24, 0, Math.PI * 2, 0, Math.PI / 2),
      greenDomeMat
    );
    greenDome.position.set(-3.5, 7.5, -3);
    const crescent = new THREE.Mesh(new THREE.ConeGeometry(0.5, 2.0, 12), goldMat);
    crescent.position.set(-3.5, 12.2, -3);
    this.nabawiMesh.add(greenDome, crescent);

    // 4. White Domes of Masjid Nabawi
    [
      [3.5, -3],
      [-3.5, 3],
      [3.5, 3]
    ].forEach(([dx, dz]) => {
      const wDome = new THREE.Mesh(
        new THREE.SphereGeometry(2.0, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2),
        stoneMat
      );
      wDome.position.set(dx, 7.2, dz);
      this.nabawiMesh.add(wDome);
    });

    // 5. Grand Minaret of Masjid Nabawi
    const minaret = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.6, 26, 12), stoneMat);
    minaret.position.set(7.5, 13, -6.5);
    const minaretSpire = new THREE.Mesh(new THREE.ConeGeometry(1.2, 5, 12), goldMat);
    minaretSpire.position.set(7.5, 28, -6.5);
    this.nabawiMesh.add(minaret, minaretSpire);

    // 6. Colonnade Pillars & Arches
    for (let x = -7; x <= 7; x += 3.5) {
      const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.35, 6.8, 12), stoneMat);
      pillar.position.set(x, 3.4, -5);
      this.nabawiMesh.add(pillar);
    }

    // 7. Grand Entrance Gate (Bab As-Salam) at South Face
    const gateArch = new THREE.Mesh(new THREE.BoxGeometry(10, 1.6, 1.4), stoneMat);
    gateArch.position.set(0, 6.2, 7.5);
    const postL = new THREE.Mesh(new THREE.BoxGeometry(1.2, 6, 1.4), stoneMat);
    postL.position.set(-4.5, 3, 7.5);
    const postR = new THREE.Mesh(new THREE.BoxGeometry(1.2, 6, 1.4), stoneMat);
    postR.position.set(4.5, 3, 7.5);
    this.nabawiMesh.add(gateArch, postL, postR);

    // Dual Signboards: Bab As-Salam & Pintu Masuk Masjid Nabawi
    const nabawiCanvas = document.createElement('canvas');
    nabawiCanvas.width = 1024;
    nabawiCanvas.height = 256;
    const nCtx = nabawiCanvas.getContext('2d')!;
    nCtx.fillStyle = '#064e3b';
    nCtx.fillRect(0, 0, 1024, 256);
    nCtx.strokeStyle = '#d4af37';
    nCtx.lineWidth = 14;
    nCtx.strokeRect(10, 10, 1004, 236);

    nCtx.fillStyle = '#fef08a';
    nCtx.textAlign = 'center';
    nCtx.font = 'bold 50px Amiri, serif';
    nCtx.fillText('المَسْجِد النَّبَوِي الشَّرِيف • بَاب السَّلاَم', 512, 85);

    nCtx.fillStyle = '#ffffff';
    nCtx.font = 'bold 36px Inter, sans-serif';
    nCtx.fillText('🚪 PINTU MASUK MASJID NABAWI (RAUDHAH)', 512, 155);

    nCtx.fillStyle = '#86efac';
    nCtx.font = 'bold 24px Inter, sans-serif';
    nCtx.fillText('SOLAT DI MASJID NABAWI = 1,000 KALI GANDA PAHALA', 512, 210);

    const nabawiTexture = new THREE.CanvasTexture(nabawiCanvas);
    const nabawiSignMat = new THREE.MeshBasicMaterial({ map: nabawiTexture });
    const signFront = new THREE.Mesh(new THREE.PlaneGeometry(8.5, 2.1), nabawiSignMat);
    signFront.position.set(0, 6.2, 8.25);
    this.nabawiMesh.add(signFront);

    // Welcome Green Carpet Runner entering through gate
    const runner = new THREE.Mesh(new THREE.PlaneGeometry(4.5, 8), raudhahCarpetMat);
    runner.rotation.x = -Math.PI / 2;
    runner.position.set(0, 0.2, 8);
    this.nabawiMesh.add(runner);

    // Position Masjid Nabawi at x: -134, z: 14
    this.nabawiMesh.position.set(-134, 0, 14);
    this.group.add(this.nabawiMesh);
  }

  /**
   * Masjid Quba (Accessible Building with Entrance Door & Interior Prayer Hall)
   */
  private createMasjidQuba() {
    this.qubaMesh = new THREE.Group();
    this.qubaMesh.name = 'MasjidQuba';

    const whiteMat = new THREE.MeshLambertMaterial({ color: 0xfafafa });
    const domeMat = new THREE.MeshLambertMaterial({ color: 0xffffff });
    const greenCarpetMat = new THREE.MeshLambertMaterial({ color: 0x065f46 });
    const goldMat = new THREE.MeshLambertMaterial({ color: 0xd97706 });

    // 1. Courtyard Base
    const base = new THREE.Mesh(new THREE.BoxGeometry(22, 0.35, 22), whiteMat);
    base.position.y = 0.17;
    base.receiveShadow = true;
    this.qubaMesh.add(base);

    // 2. Interior Emerald Green Prayer Carpet
    const carpet = new THREE.Mesh(new THREE.PlaneGeometry(14, 14), greenCarpetMat);
    carpet.rotation.x = -Math.PI / 2;
    carpet.position.set(0, 0.36, 0);
    this.qubaMesh.add(carpet);

    // Saf Lines
    [-5, -2.5, 0, 2.5, 5].forEach((zOff) => {
      const line = new THREE.Mesh(new THREE.PlaneGeometry(13.5, 0.08), new THREE.MeshBasicMaterial({ color: 0xfef08a }));
      line.rotation.x = -Math.PI / 2;
      line.position.set(0, 0.37, zOff);
      this.qubaMesh.add(line);
    });

    // 3. Central Grand Dome & 4 Corner Domes
    const dome = new THREE.Mesh(
      new THREE.SphereGeometry(4.2, 20, 20, 0, Math.PI * 2, 0, Math.PI / 2),
      domeMat
    );
    dome.position.set(0, 6.2, 0);
    this.qubaMesh.add(dome);

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
      miniDome.position.set(cx, 6.2, cz);
      this.qubaMesh.add(miniDome);
    });

    // 4. Roof Slab with Central Aperture
    const roof = new THREE.Mesh(new THREE.BoxGeometry(16, 0.5, 16), whiteMat);
    roof.position.y = 6;
    this.qubaMesh.add(roof);

    // 5. Walls with Open Entrance Doorway on South Wall
    // North Wall (Solid, with interior Mihrab)
    const northWall = new THREE.Mesh(new THREE.BoxGeometry(16, 6, 0.8), whiteMat);
    northWall.position.set(0, 3, -7.6);
    northWall.castShadow = true;
    this.qubaMesh.add(northWall);

    // Mihrab on North Wall
    const mihrab = new THREE.Mesh(new THREE.BoxGeometry(3, 4, 0.6), goldMat);
    mihrab.position.set(0, 2.2, -7.1);
    this.qubaMesh.add(mihrab);

    // East Wall (Solid with decorative relief)
    const eastWall = new THREE.Mesh(new THREE.BoxGeometry(0.8, 6, 16), whiteMat);
    eastWall.position.set(7.6, 3, 0);
    eastWall.castShadow = true;
    this.qubaMesh.add(eastWall);

    // West Wall (Solid with decorative relief)
    const westWall = new THREE.Mesh(new THREE.BoxGeometry(0.8, 6, 16), whiteMat);
    westWall.position.set(-7.6, 3, 0);
    westWall.castShadow = true;
    this.qubaMesh.add(westWall);

    // South Wall Left Segment
    const southWallL = new THREE.Mesh(new THREE.BoxGeometry(5.5, 6, 0.8), whiteMat);
    southWallL.position.set(-5.25, 3, 7.6);
    this.qubaMesh.add(southWallL);

    // South Wall Right Segment
    const southWallR = new THREE.Mesh(new THREE.BoxGeometry(5.5, 6, 0.8), whiteMat);
    southWallR.position.set(5.25, 3, 7.6);
    this.qubaMesh.add(southWallR);

    // Archway Lintel above entrance door
    const doorLintel = new THREE.Mesh(new THREE.BoxGeometry(5.0, 1.8, 1.0), whiteMat);
    doorLintel.position.set(0, 5.1, 7.6);
    this.qubaMesh.add(doorLintel);

    // 6. Signboard: PINTU MASUK MASJID QUBA
    const qubaCanvas = document.createElement('canvas');
    qubaCanvas.width = 1024;
    qubaCanvas.height = 256;
    const qCtx = qubaCanvas.getContext('2d')!;
    qCtx.fillStyle = '#0f766e';
    qCtx.fillRect(0, 0, 1024, 256);
    qCtx.strokeStyle = '#ffffff';
    qCtx.lineWidth = 12;
    qCtx.strokeRect(10, 10, 1004, 236);

    qCtx.fillStyle = '#ffffff';
    qCtx.textAlign = 'center';
    qCtx.font = 'bold 50px Amiri, serif';
    qCtx.fillText('مَسْجِد قُبَاء • أَوَّل مَسْجِد فِي الإِسْلاَم', 512, 85);

    qCtx.fillStyle = '#fef08a';
    qCtx.font = 'bold 36px Inter, sans-serif';
    qCtx.fillText('🚪 PINTU MASUK UTAMA MASJID QUBA', 512, 155);

    qCtx.fillStyle = '#ffffff';
    qCtx.font = 'bold 24px Inter, sans-serif';
    qCtx.fillText('SOLAT DI SINI = GANJARAN PAHALA 1 UMRAH', 512, 210);

    const qubaTexture = new THREE.CanvasTexture(qubaCanvas);
    const qubaSign = new THREE.Mesh(
      new THREE.PlaneGeometry(7.5, 1.9),
      new THREE.MeshBasicMaterial({ map: qubaTexture })
    );
    qubaSign.position.set(0, 5.2, 8.2);
    this.qubaMesh.add(qubaSign);

    // Welcome carpet runner through door
    const doorRunner = new THREE.Mesh(new THREE.PlaneGeometry(4.2, 5.5), greenCarpetMat);
    doorRunner.rotation.x = -Math.PI / 2;
    doorRunner.position.set(0, 0.2, 8.5);
    this.qubaMesh.add(doorRunner);

    // Interior chandelier
    const chandelier = new THREE.Mesh(
      new THREE.DodecahedronGeometry(0.8),
      new THREE.MeshBasicMaterial({ color: 0xfef08a })
    );
    chandelier.position.set(0, 4.5, 0);
    this.qubaMesh.add(chandelier);

    // Position at x: -115, z: -35
    this.qubaMesh.position.set(-115, 0, -35);
    this.group.add(this.qubaMesh);
  }

  /**
   * Masjid Qiblatain (Dua Kiblat)
   */
  private createMasjidQiblatain() {
    this.qiblatainMesh = new THREE.Group();
    this.qiblatainMesh.name = 'MasjidQiblatain';

    const stoneMat = new THREE.MeshLambertMaterial({ color: 0xf1f5f9 });
    const goldMat = new THREE.MeshLambertMaterial({ color: 0xd97706 });
    const carpetMat = new THREE.MeshLambertMaterial({ color: 0x0f766e });

    // Base & carpet
    const base = new THREE.Mesh(new THREE.BoxGeometry(16, 0.35, 14), stoneMat);
    base.position.y = 0.17;
    this.qiblatainMesh.add(base);

    const carpet = new THREE.Mesh(new THREE.PlaneGeometry(12, 10), carpetMat);
    carpet.rotation.x = -Math.PI / 2;
    carpet.position.set(0, 0.36, 0);
    this.qiblatainMesh.add(carpet);

    // Twin Minarets
    [-6, 6].forEach((xOff) => {
      const minaret = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 1.1, 16, 12), stoneMat);
      minaret.position.set(xOff, 8, -4);
      const spire = new THREE.Mesh(new THREE.ConeGeometry(0.9, 3.5, 12), goldMat);
      spire.position.set(xOff, 17.5, -4);
      this.qiblatainMesh.add(minaret, spire);
    });

    // Central Dome
    const dome = new THREE.Mesh(
      new THREE.SphereGeometry(3.0, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2),
      stoneMat
    );
    dome.position.set(0, 5.5, -2);
    this.qiblatainMesh.add(dome);

    // Entrance Portal Gate Archway
    const arch = new THREE.Mesh(new THREE.BoxGeometry(8, 1.4, 1.0), stoneMat);
    arch.position.set(0, 5.2, 5.5);
    const postL = new THREE.Mesh(new THREE.BoxGeometry(1.0, 5, 1.0), stoneMat);
    postL.position.set(-3.5, 2.5, 5.5);
    const postR = new THREE.Mesh(new THREE.BoxGeometry(1.0, 5, 1.0), stoneMat);
    postR.position.set(3.5, 2.5, 5.5);
    this.qiblatainMesh.add(arch, postL, postR);

    // Signboard
    const signCanvas = document.createElement('canvas');
    signCanvas.width = 512;
    signCanvas.height = 128;
    const sCtx = signCanvas.getContext('2d')!;
    sCtx.fillStyle = '#0f766e';
    sCtx.fillRect(0, 0, 512, 128);
    sCtx.strokeStyle = '#ffffff';
    sCtx.lineWidth = 6;
    sCtx.strokeRect(4, 4, 504, 120);

    sCtx.fillStyle = '#ffffff';
    sCtx.textAlign = 'center';
    sCtx.font = 'bold 30px Amiri, serif';
    sCtx.fillText('مَسْجِد القِبْلَتَيْن', 256, 45);

    sCtx.fillStyle = '#fef08a';
    sCtx.font = 'bold 22px Inter, sans-serif';
    sCtx.fillText('🚪 PINTU MASUK MASJID QIBLATAIN', 256, 85);

    sCtx.fillStyle = '#ffffff';
    sCtx.font = '16px Inter, sans-serif';
    sCtx.fillText('PERISTIWA PERTUKARAN KIBLAT KE KAABAH', 256, 112);

    const sign = new THREE.Mesh(
      new THREE.PlaneGeometry(6, 1.5),
      new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(signCanvas) })
    );
    sign.position.set(0, 5.2, 6.1);
    this.qiblatainMesh.add(sign);

    this.qiblatainMesh.position.set(-150, 0, -18);
    this.group.add(this.qiblatainMesh);
  }

  /**
   * Masjid Alghamamah & Abu Bakar
   */
  private createMasjidAlghamamah() {
    this.ghamamahMesh = new THREE.Group();
    this.ghamamahMesh.name = 'MasjidAlghamamah';

    const basaltMat = new THREE.MeshLambertMaterial({ color: 0x334155 }); // Dark volcanic basalt stone
    const whiteMat = new THREE.MeshLambertMaterial({ color: 0xf8fafc });
    const carpetMat = new THREE.MeshLambertMaterial({ color: 0x064e3b });

    // Base & carpet
    const base = new THREE.Mesh(new THREE.BoxGeometry(14, 0.35, 12), basaltMat);
    base.position.y = 0.17;
    this.ghamamahMesh.add(base);

    const carpet = new THREE.Mesh(new THREE.PlaneGeometry(10, 8), carpetMat);
    carpet.rotation.x = -Math.PI / 2;
    carpet.position.set(0, 0.36, 0);
    this.ghamamahMesh.add(carpet);

    // Multi-domed basalt roof
    [-3, 0, 3].forEach((xOff) => {
      const dome = new THREE.Mesh(
        new THREE.SphereGeometry(1.8, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2),
        whiteMat
      );
      dome.position.set(xOff, 4.8, -2);
      this.ghamamahMesh.add(dome);
    });

    // Entrance Gate
    const arch = new THREE.Mesh(new THREE.BoxGeometry(7, 1.2, 0.8), basaltMat);
    arch.position.set(0, 4.6, 4.5);
    const postL = new THREE.Mesh(new THREE.BoxGeometry(0.8, 4.5, 0.8), basaltMat);
    postL.position.set(-3.1, 2.25, 4.5);
    const postR = new THREE.Mesh(new THREE.BoxGeometry(0.8, 4.5, 0.8), basaltMat);
    postR.position.set(3.1, 2.25, 4.5);
    this.ghamamahMesh.add(arch, postL, postR);

    // Signboard
    const signCanvas = document.createElement('canvas');
    signCanvas.width = 512;
    signCanvas.height = 128;
    const sCtx = signCanvas.getContext('2d')!;
    sCtx.fillStyle = '#1e293b';
    sCtx.fillRect(0, 0, 512, 128);
    sCtx.strokeStyle = '#d4af37';
    sCtx.lineWidth = 6;
    sCtx.strokeRect(4, 4, 504, 120);

    sCtx.fillStyle = '#fef08a';
    sCtx.textAlign = 'center';
    sCtx.font = 'bold 30px Amiri, serif';
    sCtx.fillText('مَسْجِد الغَمَامَة', 256, 45);

    sCtx.fillStyle = '#ffffff';
    sCtx.font = 'bold 22px Inter, sans-serif';
    sCtx.fillText('🚪 PINTU MASUK MASJID ALGHAMAMAH', 256, 85);

    sCtx.fillStyle = '#94a3b8';
    sCtx.font = '16px Inter, sans-serif';
    sCtx.fillText('TAPAK SOLAT ISTISQA\' MEMOHON HUJAN', 256, 112);

    const sign = new THREE.Mesh(
      new THREE.PlaneGeometry(5.5, 1.4),
      new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(signCanvas) })
    );
    sign.position.set(0, 4.6, 5.0);
    this.ghamamahMesh.add(sign);

    this.ghamamahMesh.position.set(-132, 0, 6);
    this.group.add(this.ghamamahMesh);
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
