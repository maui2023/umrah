import * as THREE from 'three';
import { MasjidilHaram } from './world/MasjidilHaram';
import { AvatarModel } from './characters/AvatarModel';
import { PlayerController } from './controllers/PlayerController';
import { SupabaseService } from './multiplayer/SupabaseService';
import { UmrahWorkflow } from './simulation/UmrahWorkflow';
import { HUD } from './ui/HUD';
import { OnboardingData, OnboardingModal } from './ui/OnboardingModal';
import { PlayerData } from './types';
import { soundManager } from './audio/SoundManager';
import { MOSQUE_LOCATIONS, MosqueLocation } from './data/solatData';
import { SolatModal } from './ui/SolatModal';
import { RealTawafSection } from './ui/RealTawafSection';

class UmrahSimulationApp {
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private clock: THREE.Clock;

  // Simulation Components
  private localAvatar!: AvatarModel;
  private playerController!: PlayerController;
  private supabaseService: SupabaseService;
  private workflow: UmrahWorkflow;
  private hud!: HUD;
  private realTawafSection!: RealTawafSection;
  private isRealMode: boolean = false;
  private masjidilHaram!: MasjidilHaram;

  // Mosque & Solat Interactive Session
  private currentSolatModal: SolatModal | null = null;
  private congregationAvatars: AvatarModel[] = [];

  // Remote Players (Map of avatar models)
  private remoteAvatars: Map<string, AvatarModel> = new Map();
  private allConnectedPlayers: PlayerData[] = [];

  // Local Player Data
  private playerData!: PlayerData;

  constructor() {
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      0.1,
      600
    );
    this.clock = new THREE.Clock();

    // WebGL Renderer with High Quality & Optimized Mobile Shadows
    const container = document.getElementById('canvas-container')!;
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.05;
    container.appendChild(this.renderer.domElement);

    this.supabaseService = new SupabaseService();
    this.workflow = new UmrahWorkflow();

    this.setupResizeListener();
    this.initWorld();
    this.showOnboarding();
  }

  private setupResizeListener() {
    window.addEventListener('resize', () => {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
    });
  }

  private initWorld() {
    this.masjidilHaram = new MasjidilHaram(this.scene);
  }

  private showOnboarding() {
    new OnboardingModal((data: OnboardingData) => {
      this.startSimulation(data);
    });
  }

  private startSimulation(data: OnboardingData) {
    const savedState = UmrahWorkflow.getSavedState();
    let playerId = localStorage.getItem('umrah_player_id');
    if (!playerId) {
      playerId = savedState?.playerId || ('player_' + Math.random().toString(36).substring(2, 9));
      localStorage.setItem('umrah_player_id', playerId);
    }

    let initX = -129.5;
    let initY = 0;
    let initZ = -3.0;
    let initRot = -Math.PI / 2;
    let shouldBoardBus = false;

    if (data.isResume && savedState) {
      if (savedState.lastPosition && typeof savedState.lastPosition.x === 'number') {
        initX = savedState.lastPosition.x;
        initY = savedState.lastPosition.y || 0;
        initZ = savedState.lastPosition.z;
        initRot = savedState.lastPosition.rotation || 0;
        shouldBoardBus = !!savedState.lastPosition.isInBus;
      } else {
        if (savedState.stage === 'tawaf') {
          initX = 18; initZ = 18; initRot = -3 * Math.PI / 4;
        } else if (savedState.stage === 'solat_zamzam') {
          initX = 14; initZ = 4.5; initRot = -Math.PI / 2;
        } else if (savedState.stage === 'sai') {
          initX = 65; initZ = 42; initRot = Math.PI;
        } else if (savedState.stage === 'tahallul' || savedState.stage === 'completed') {
          initX = 65; initZ = -42; initRot = 0;
        } else {
          const spot = this.workflow.getCurrentZiarahSpot();
          if (spot?.coordinates) {
            initX = spot.coordinates.x;
            initZ = spot.coordinates.z;
          }
        }
      }
    } else {
      const startAtMadinah = data.startLocation !== 'makkah';
      initX = startAtMadinah ? -129.5 : 18;
      initY = 0;
      initZ = startAtMadinah ? -3.0 : 18;
      initRot = startAtMadinah ? -Math.PI / 2 : -3 * Math.PI / 4;
    }

    const currentLap = data.isResume && savedState
      ? (savedState.stage === 'sai' ? (savedState.saiLap || 1) : (savedState.stage === 'tawaf' ? (savedState.tawafLap || 1) : 1))
      : 1;

    const currentStage = data.isResume && savedState
      ? savedState.stage
      : (data.startLocation !== 'makkah' ? 'ziarah_dalam' : 'tawaf');

    this.playerData = {
      id: playerId,
      name: data.name,
      gender: data.gender,
      role: data.role,
      groupId: data.groupId,
      groupName: data.groupName,
      groupColor: data.groupColor,
      x: initX,
      y: initY,
      z: initZ,
      rotation: initRot,
      isMoving: false,
      currentLap: currentLap,
      stage: currentStage,
      isInBus: shouldBoardBus
    };

    // 1. Create Local Avatar
    this.localAvatar = new AvatarModel({
      name: this.playerData.name,
      gender: this.playerData.gender,
      role: this.playerData.role,
      groupColor: this.playerData.groupColor,
      groupName: this.playerData.groupName,
      currentLap: currentLap
    });

    this.localAvatar.group.position.set(this.playerData.x, 0, this.playerData.z);
    this.localAvatar.group.rotation.y = this.playerData.rotation;
    this.scene.add(this.localAvatar.group);

    const busController = this.masjidilHaram.madinahZone.busController;

    // 2. Initialize Player Controller (True 3rd-Person PUBG style camera & vehicle physics)
    this.playerController = new PlayerController(
      this.localAvatar,
      this.camera,
      this.renderer.domElement,
      this.playerData.rotation,
      busController
    );

    if (shouldBoardBus && busController) {
      this.playerController.boardBus();
    }

    // 3. Initialize HUD & Real Tawaf Section
    this.hud = new HUD();
    this.hud.currentPahala = this.workflow.totalPahala;
    this.hud.soloSolatCount = this.workflow.soloSolatCount;
    this.hud.jemaahSolatCount = this.workflow.jemaahSolatCount;
    this.hud.visitedMosques = this.workflow.visitedMosques;
    this.hud.updatePahala(this.workflow.totalPahala);

    this.realTawafSection = new RealTawafSection({
      onSwitchToGame: () => {
        this.closeRealMode();
      },
      onLapChanged: (lap) => {
        this.workflow.tawafLap = lap;
        this.playerData.currentLap = lap;
        this.workflow.saveState();
        if (this.hud) {
          this.hud.updateLap('tawaf', lap);
        }
        if (this.localAvatar) {
          this.localAvatar.updateNameTag(
            this.playerData.name,
            this.playerData.groupName,
            this.playerData.groupColor,
            this.playerData.role,
            lap
          );
        }
      },
      onTawafFinished: () => {
        this.workflow.stage = 'solat_zamzam';
        this.workflow.tawafLap = 7;
        this.playerData.stage = 'solat_zamzam';
        this.playerData.currentLap = 7;
        this.workflow.saveState();
        if (this.hud) {
          this.hud.updateStage('solat_zamzam');
          this.hud.updateSolatZamzamStatus(this.workflow.solatSunatDone, this.workflow.zamzamDone);
        }
      },
      onProceedToSai: () => {
        this.closeRealMode();
        this.workflow.advanceToSai(1);
        this.playerController.teleport(65, 42, Math.PI);
        this.playerData.stage = 'sai';
        this.playerData.currentLap = 1;
        this.hud.updateStage('sai');
        this.hud.updateLap('sai', 1);
        this.hud.showNotification('📍 Selamat tiba di Bukit Safa. Sila mulakan Sa\'i Pusingan 1 (Safa ➔ Marwah).');
      }
    });

    this.setupHUDCallbacks();

    if (data.startInRealMode) {
      this.openRealMode(currentLap);
    }

    // Wire Interactive Key (KeyE) for entering mosque doors, Istilam, and boarding/exiting bus
    this.playerController.onInteractiveKeyPress = () => {
      if (this.playerController.isInBus) {
        this.playerController.exitBus();
      } else if (this.workflow.stage === 'tawaf' && this.hud.currentTawafProgress?.isIstilamAvailable) {
        this.workflow.performIstilam();
        this.localAvatar.performIstilam();
      } else if (this.hud.currentNearMosque) {
        this.hud.onEnterMosqueDoorCallback?.(this.hud.currentNearMosque);
      } else {
        this.playerController.toggleBusBoarding();
      }
    };

    // Wire Bus Controller Events with HUD
    this.playerController.onNearDoorStateChange = (isNear) => {
      this.hud.setNearBusDoor(isNear);
    };

    this.playerController.onBusBoardStateChange = (inBus) => {
      this.hud.setBusBoarded(inBus);
      const spot = this.workflow.getCurrentZiarahSpot();
      this.hud.updateBusDrivingHUD(0, false, spot?.title);
    };

    this.playerController.onBusSpeedChange = (speedKmh, isCruising) => {
      const spot = this.workflow.getCurrentZiarahSpot();
      this.hud.updateBusDrivingHUD(speedKmh, isCruising, spot?.title);
    };

    // 4. Register Workflow Callbacks
    this.workflow.registerCallbacks({
      onStageChanged: (stage) => {
        this.playerData.stage = stage;
        this.hud.updateStage(stage);
        if (stage === 'tawaf') {
          this.hud.showTawafModeDialog(this.workflow.tawafMode, (mode) => {
            this.workflow.setTawafMode(mode);
            if (mode === 'real') {
              this.openRealMode();
            }
          });
        }
        if (stage === 'solat_zamzam') {
          this.hud.updateSolatZamzamStatus(this.workflow.solatSunatDone, this.workflow.zamzamDone);
        }
        if (stage === 'sai') {
          if (this.playerData.x < 50) {
            this.playerController.teleport(65, 42, Math.PI);
          }
          this.hud.updateLap('sai', this.workflow.saiLap || 1);
        }
        this.localAvatar.updateNameTag(
          this.playerData.name,
          this.playerData.groupName,
          this.playerData.groupColor,
          this.playerData.role,
          this.playerData.currentLap
        );
      },
      onTawafProgress: (progress) => {
        this.hud.updateTawafProgress(progress);
      },
      onSaiProgress: (progress) => {
        this.hud.updateSaiProgress(progress);
        this.playerData.currentLap = progress.lap;
        this.localAvatar.updateNameTag(
          this.playerData.name,
          this.playerData.groupName,
          this.playerData.groupColor,
          this.playerData.role,
          progress.lap
        );
      },
      onLapChanged: (stage, lap) => {
        this.playerData.currentLap = lap;
        this.hud.updateLap(stage, lap);
        this.localAvatar.updateNameTag(
          this.playerData.name,
          this.playerData.groupName,
          this.playerData.groupColor,
          this.playerData.role,
          lap
        );
      },
      onZiarahChanged: (spot, index, total) => {
        this.hud.updateZiarahSpot(spot, index, total);
        if (spot.id === 'tiba_di_makkah_tawaf') {
          if (this.playerController.isInBus) {
            this.playerController.exitBus();
          }
          this.playerController.teleport(18, 18, -3 * Math.PI / 4);
          return;
        }

        if (spot.category === 'dalam_madinah' || spot.transportType === 'walk') {
          if (this.playerController.isInBus) {
            this.playerController.exitBus();
            this.playerController.teleport(-131, -5, 0);
            this.hud.showNotification(
              '📍 Bas Ziarah tidak masuk ke dalam Madinah (kawasan pejalan kaki Masjid Nabawi). Ziarah Dalam Madinah dilakukan sepenuhnya dengan berjalan kaki bagi menghayati sirah Rasulullah ﷺ dan para sahabat.'
            );
          }
          return;
        }

        const isBusTransport = spot.transportType === 'bus_pass' || spot.transportType === 'bus_stop' || spot.transportType === 'bus_travel';
        if (isBusTransport && !this.playerController.isInBus) {
          this.playerController.boardBus();
        }

        if (spot.id === 'memakai_ihram_hotel') {
          this.hud.showNotification(
            '⚠️ Peringatan Ihram: Cawat tidak boleh diikat mati (simpul mudah buka/butterfly). Bagi wanita, jika pakaian ihram berwangian, jangan buka baju selepas niat!'
          );
        }

        if (this.playerController.isInBus && spot.coordinates && busController) {
          busController.cruiseTo(spot.coordinates.x, spot.coordinates.z, undefined, spot.title, () => {
            soundManager.playCheckpointSound();
            // Automatically disembark player when arriving at bus stop or outdoor visit location
            if (
              spot.transportType === 'bus_stop' ||
              spot.transportType === 'miqat' ||
              spot.category === 'luar_madinah_turun' ||
              spot.category === 'miqat_bir_ali'
            ) {
              this.playerController.exitBus();
              this.hud.showNotification(`📍 Bas telah selamat tiba di ${spot.title}. Pintu bas dibuka, selamat menziarahi!`);
            }
          });
        }
      },
      onDuaTriggered: (dua, alertMessage) => {
        this.hud.displayDua(dua, alertMessage);
      },
      onPahalaChanged: (total, added, isJemaah, mosqueName) => {
        this.hud.soloSolatCount = this.workflow.soloSolatCount;
        this.hud.jemaahSolatCount = this.workflow.jemaahSolatCount;
        this.hud.visitedMosques = this.workflow.visitedMosques;
        this.hud.updatePahala(total, added, isJemaah, mosqueName);
      },
      onTeleportRequested: (x, z, rot) => {
        if (this.playerController.isInBus && busController) {
          if (!busController.isAutoCruising) {
            busController.cruiseTo(x, z, rot);
          }
        } else {
          this.playerController.teleport(x, z, rot ?? 0);
        }
      }
    });

    // Position provider for continuous auto-save
    this.workflow.positionProvider = () => {
      return {
        x: this.playerData?.x ?? 0,
        y: this.playerData?.y ?? 0,
        z: this.playerData?.z ?? 0,
        rotation: this.playerData?.rotation ?? 0,
        isInBus: this.playerController?.isInBus ?? false
      };
    };

    // Start Umrah ritual or resume saved journey
    if (data.isResume) {
      this.workflow.resumeUmrah();
    } else {
      this.workflow.resetProgress();
      this.workflow.startUmrah(data.startLocation !== 'makkah');
    }

    // Auto-save interval (every 4 seconds)
    setInterval(() => {
      if (this.playerData && this.workflow) {
        this.workflow.saveState();
      }
    }, 4000);

    // Auto-save before browser unload or tab switch
    window.addEventListener('beforeunload', () => {
      if (this.playerData && this.workflow) {
        this.workflow.saveState();
      }
    });
    window.addEventListener('pagehide', () => {
      if (this.playerData && this.workflow) {
        this.workflow.saveState();
      }
    });

    // 5. Connect Multiplayer / Public World
    this.supabaseService.setStatusCallback((connected, realPlayerCount) => {
      this.hud.setSupabaseStatus(connected, realPlayerCount);
    });

    this.supabaseService.connect(this.playerData, (remotePlayers: PlayerData[]) => {
      this.handleRemotePlayersUpdate(remotePlayers);
    });

    // Start gentle ambient sound
    soundManager.startCourtyardAmbience();

    // 6. Start Render Loop
    this.animate();
  }

  private setupHUDCallbacks() {
    const busController = this.masjidilHaram.madinahZone.busController;

    // Quick Teleport Handler
    this.hud.registerCallbacks({
      onTeleport: (loc) => {
        if (loc === 'madinah_bus') {
          if (busController) {
            this.playerController.teleport(
              busController.position.x + 3.2,
              busController.position.z + 2.0,
              -Math.PI / 2
            );
          } else {
            this.playerController.teleport(-131, -8, -Math.PI / 2);
          }
        } else if (loc === 'saqifah') {
          this.playerController.teleport(-130, 2, 0);
        } else if (loc === 'muwajahah') {
          this.playerController.teleport(-135, 12, 0);
        } else if (loc === 'raudhah') {
          this.playerController.teleport(-136, 15, 0);
        } else if (loc === 'baqi') {
          this.playerController.teleport(-138, 18, 0);
        } else if (loc === 'masjid_quba') {
          this.playerController.teleport(-115, -25, Math.PI);
        } else if (loc === 'jabal_uhud') {
          this.playerController.teleport(-148, -45, Math.PI);
        } else if (loc === 'ladang_kurma') {
          this.playerController.teleport(-130, -42, 0);
        } else if (loc === 'miqat_bir_ali') {
          this.playerController.teleport(-155, 25, 0);
        } else if (loc === 'hajar_aswad') {
          this.playerController.teleport(18, 18, -3 * Math.PI / 4);
        } else if (loc === 'maqam_ibrahim') {
          this.playerController.teleport(14, 4.5, -Math.PI / 2);
        } else if (loc === 'zamzam') {
          this.playerController.teleport(38, 8, -Math.PI / 4);
        } else if (loc === 'safa') {
          this.playerController.teleport(65, 42, Math.PI);
        } else if (loc === 'marwah') {
          this.playerController.teleport(65, -42, 0);
        }
      },
      onBoardBus: () => {
        if (!this.playerController.isInBus && busController) {
          const pos = this.localAvatar.group.position;
          // If player is far away, move player near door first
          if (!busController.isNearDoor(pos.x, pos.z)) {
            const doorPos = busController.position.clone().add(
              new THREE.Vector3(busController.busWidth / 2 + 1.2, 0, busController.busLength / 2 - 1.8)
                .applyAxisAngle(new THREE.Vector3(0, 1, 0), busController.rotationY)
            );
            this.playerController.teleport(doorPos.x, doorPos.z, busController.rotationY);
          }
          this.playerController.boardBus();
        }
      },
      onExitBus: () => {
        this.playerController.exitBus();
      },
      onAutoCruise: () => {
        if (busController) {
          if (busController.isAutoCruising) {
            busController.isAutoCruising = false;
            busController.speed = 0;
            const spot = this.workflow.getCurrentZiarahSpot();
            this.hud.updateBusDrivingHUD(0, false, spot?.title);
          } else {
            const spot = this.workflow.getCurrentZiarahSpot();
            if (spot && spot.coordinates) {
              busController.cruiseTo(spot.coordinates.x, spot.coordinates.z, undefined, spot.title, () => {
                soundManager.playCheckpointSound();
              });
            }
          }
        }
      },
      onActionButton: (stage) => {
        if (stage === 'ziarah_dalam' || stage === 'ziarah_luar_bus' || stage === 'ziarah_wida_hotel') {
          const spot = this.workflow.getCurrentZiarahSpot();

          // If the player is still inside the bus at an activity/solat stop,
          // first disembark them so they can experience the location on foot!
          if (this.playerController.isInBus && (spot.transportType === 'bus_stop' || spot.category === 'luar_madinah_turun')) {
            if (busController) {
              busController.isAutoCruising = false;
              busController.speed = 0;
              if (spot.coordinates) {
                busController.teleportBus(spot.coordinates.x, spot.coordinates.z);
              }
            }
            this.playerController.exitBus();
            this.hud.showNotification(`📍 Bas telah tiba di ${spot.title}. Pintu bas dibuka, selamat menziarahi!`);
            return;
          }

          if (spot.id === 'masjid_quba' && !this.workflow.qubaSolatDone) {
            this.workflow.performSolatQuba();
          } else if (spot.id === 'memakai_ihram_hotel' && !this.workflow.ihramWorn) {
            this.workflow.wearIhramAtHotel();
            this.hud.showLaranganIhramModal();
          }
          this.workflow.nextZiarahSpot();
        } else if (stage === 'miqat_bir_ali') {
          const spot = this.workflow.getCurrentZiarahSpot();
          if (this.playerController.isInBus) {
            if (busController) {
              busController.isAutoCruising = false;
              busController.speed = 0;
              if (spot?.coordinates) {
                busController.teleportBus(spot.coordinates.x, spot.coordinates.z);
              }
            }
            this.playerController.exitBus();
            this.hud.showNotification('📍 Bas telah tiba di Masjid Bir Ali. Sila masuk untuk solat sunat dan lafaz niat Ihram.');
            return;
          }
          this.workflow.confirmNiatAtMiqat();
        } else if (stage === 'perjalanan_makkah' || stage === 'niat') {
          this.workflow.arriveAtMakkah();
        } else if (stage === 'tawaf') {
          this.workflow.performIstilam();
          this.localAvatar.performIstilam();
        } else if (stage === 'solat_zamzam') {
          if (!this.workflow.solatSunatDone) {
            this.workflow.completeSolatSunat();
          } else if (!this.workflow.zamzamDone) {
            this.workflow.completeZamzam();
          }
          this.hud.updateSolatZamzamStatus(this.workflow.solatSunatDone, this.workflow.zamzamDone);
        } else if (stage === 'sai') {
          this.workflow.advanceSaiLapManual();
        } else if (stage === 'tahallul') {
          this.workflow.completeTahallul();
        } else if (stage === 'completed') {
          this.hud.showCertificateModal({
            name: this.playerData.name,
            groupName: this.playerData.groupName,
            date: new Date().toLocaleDateString('ms-MY', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })
          });
        }
      },
      onPrevZiarah: () => {
        this.workflow.prevZiarahSpot();
      },
      onNextZiarah: () => {
        this.workflow.nextZiarahSpot();
      },
      onSelectZiarahIndex: (idx) => {
        this.workflow.goToZiarahSpot(idx);
      },
      onJoystickMove: (x, y) => {
        this.playerController.setJoystickVector(x, y);
      },
      onSprintToggle: (sprinting) => {
        this.playerController.setSprinting(sprinting);
      },
      onResetProgress: () => {
        if (confirm('Adakah anda pasti mahu memadamkan kemajuan dan mula semula dari awal?')) {
          this.workflow.resetProgress();
          window.location.reload();
        }
      },
      onManualSave: () => {
        this.workflow.saveState();
      },
      onEnterMosqueDoor: (mosque: MosqueLocation) => {
        if (this.playerController.isInBus) {
          this.playerController.exitBus();
        }
        soundManager.playSolatChime();
        this.playerController.teleport(mosque.prayerCoord.x, mosque.prayerCoord.z, 0);
      },
      onStartSolat: (mosque: MosqueLocation) => {
        this.openSolatSession(mosque);
      },
      onTeleportToCoords: (x: number, z: number) => {
        this.playerController.teleport(x, z, 0);
        this.hud.showNotification('📍 Telah teleport berdekatan jemaah!');
      },
      onReconnectSupabase: () => {
        this.supabaseService.reconnect(this.playerData);
        this.hud.showNotification('🔄 Mencuba menyambung semula ke pelayan Supabase...');
      },
      onSaveSupabaseConfig: (url: string, key: string) => {
        this.supabaseService.saveCustomCredentials(url, key, this.playerData);
        this.hud.showNotification('💾 Tetapan Supabase disimpan! Menyambung semula...');
      },
      onPerformIstilam: () => {
        this.workflow.performIstilam();
        this.localAvatar.performIstilam();
      },
      onToggleTawafMode: (mode) => {
        this.workflow.setTawafMode(mode);
        if (mode === 'real') {
          this.openRealMode();
        } else {
          this.closeRealMode();
        }
      },
      onOpenRealTawafSection: () => {
        this.openRealMode();
      },
      onToggleRaml: (active) => {
        this.playerController.setRaml(active);
        this.workflow.setRaml(active);
        if (this.hud.currentSaiProgress) {
          this.hud.currentSaiProgress.isRamlActive = active;
          this.hud.updateSaiUI();
        }
        this.hud.showNotification(
          active
            ? '🏃 Sunnah Raml/Harwalah diaktifkan: Berlari-lari anak bagi lelaki.'
            : '🚶 Raml dimatikan: Berjalan seperti biasa.'
        );
      },
      onOpenTawafModal: () => {
        this.hud.showTawafGuideModal(
          this.workflow.stage === 'tawaf' && this.workflow.tawafLap >= 1 && this.workflow.tawafLap <= 7
            ? (`lap${this.workflow.tawafLap}` as any)
            : 'lap1'
        );
      },
      onAdvanceSaiLap: () => {
        this.workflow.advanceSaiLapManual();
      },
      onPrevSaiLap: () => {
        this.workflow.prevSaiLapManual();
      },
      onResetSaiLaps: () => {
        this.workflow.resetSaiLaps();
      },
      onSelectSaiLap: (lap) => {
        this.workflow.setSaiLap(lap);
      },
      onOpenSaiModal: () => {
        this.hud.showSaiGuideModal();
      }
    });
  }

  /**
   * Open dedicated Real Tawaf Mode without 3D game interface
   */
  public openRealMode(lap?: number) {
    this.isRealMode = true;
    const canvasContainer = document.getElementById('canvas-container');
    const hudOverlay = document.getElementById('umrah-hud-overlay');
    if (canvasContainer) canvasContainer.style.display = 'none';
    if (hudOverlay) hudOverlay.style.display = 'none';

    this.realTawafSection.open(lap || this.workflow.tawafLap || 1);
  }

  /**
   * Close Real Tawaf Mode and restore 3D simulation
   */
  public closeRealMode() {
    this.isRealMode = false;
    this.realTawafSection.close();

    const canvasContainer = document.getElementById('canvas-container');
    const hudOverlay = document.getElementById('umrah-hud-overlay');
    if (canvasContainer) canvasContainer.style.display = 'block';
    if (hudOverlay) hudOverlay.style.display = 'flex';

    if (this.hud) {
      this.hud.showNotification('🎮 Kembali ke Mod Simulasi 3D');
    }
  }

  /**
   * Open sequential step-by-step solat session modal (Solo 1 Pahala, Berjemaah 27 Pahala)
   */
  private openSolatSession(mosque: MosqueLocation) {
    if (this.currentSolatModal) {
      this.currentSolatModal.close();
      this.currentSolatModal = null;
    }

    // Teleport player directly into prayer position on carpet
    this.playerController.teleport(mosque.prayerCoord.x, mosque.prayerCoord.z, 0);

    this.currentSolatModal = new SolatModal({
      mosque,
      localAvatar: this.localAvatar,
      initialMode: 'solo',
      onModeChange: (mode) => {
        if (mode === 'jemaah') {
          this.spawnCongregation(mosque);
        } else {
          this.clearCongregation();
        }
      },
      onPoseChange: (pose) => {
        // Mirrored unison prayer pose for all congregation avatars
        for (const cong of this.congregationAvatars) {
          cong.setPrayerPose(pose);
        }
      },
      onComplete: (_points, isJemaah, m) => {
        this.workflow.addPahala(isJemaah, m.id, m.name);
      },
      onClose: () => {
        this.clearCongregation();
        this.currentSolatModal = null;
      }
    });
  }

  /**
   * Spawn NPC congregation (Imam + Saf members) for 27 Pahala Berjemaah mode
   */
  private spawnCongregation(mosque: MosqueLocation) {
    this.clearCongregation();

    const px = mosque.prayerCoord.x;
    const pz = mosque.prayerCoord.z;

    // Imam stands in front (z - 2.2)
    const imam = new AvatarModel({
      name: 'Imam Masjid',
      gender: 'male',
      role: 'mutawwif',
      groupName: mosque.name,
      groupColor: '#10B981',
      showOverheadTag: true
    });
    imam.group.position.set(px, 0, pz - 2.2);
    imam.group.rotation.y = 0;
    this.scene.add(imam.group);
    this.congregationAvatars.push(imam);

    // Makmum A to the left
    const makmumLeft = new AvatarModel({
      name: 'Jemaah Saf (Kiri)',
      gender: 'male',
      role: 'jemaah',
      groupName: 'Saf 1',
      groupColor: '#3B82F6',
      showOverheadTag: true
    });
    makmumLeft.group.position.set(px - 1.25, 0, pz);
    makmumLeft.group.rotation.y = 0;
    this.scene.add(makmumLeft.group);
    this.congregationAvatars.push(makmumLeft);

    // Makmum B to the right
    const makmumRight = new AvatarModel({
      name: 'Jemaah Saf (Kanan)',
      gender: 'male',
      role: 'jemaah',
      groupName: 'Saf 1',
      groupColor: '#F59E0B',
      showOverheadTag: true
    });
    makmumRight.group.position.set(px + 1.25, 0, pz);
    makmumRight.group.rotation.y = 0;
    this.scene.add(makmumRight.group);
    this.congregationAvatars.push(makmumRight);

    // Synchronize initial pose with local avatar
    for (const c of this.congregationAvatars) {
      c.setPrayerPose(this.localAvatar.prayerPose);
    }
  }

  /**
   * Remove congregation avatars cleanly
   */
  private clearCongregation() {
    for (const avatar of this.congregationAvatars) {
      this.scene.remove(avatar.group);
      avatar.dispose();
    }
    this.congregationAvatars = [];
  }

  /**
   * Handle updates of fellow pilgrims in the public world
   */
  private handleRemotePlayersUpdate(players: PlayerData[]) {
    this.allConnectedPlayers = players;
    const activeIds = new Set<string>();

    for (const p of players) {
      if (p.id === this.playerData.id) continue;
      
      // CRITICAL: Protect against NaN / undefined coordinates
      if (typeof p.x !== 'number' || isNaN(p.x) || typeof p.z !== 'number' || isNaN(p.z)) {
        continue;
      }

      activeIds.add(p.id);

      let avatar = this.remoteAvatars.get(p.id);
      if (!avatar) {
        avatar = new AvatarModel({
          name: p.name,
          gender: p.gender,
          role: p.role,
          groupColor: p.groupColor,
          groupName: p.groupName,
          currentLap: p.currentLap,
          showOverheadTag: true
        });
        avatar.group.position.set(p.x, 0, p.z);
        avatar.group.rotation.y = typeof p.rotation === 'number' && !isNaN(p.rotation) ? p.rotation : 0;
        this.scene.add(avatar.group);
        this.remoteAvatars.set(p.id, avatar);
      }

      avatar.targetPosition.set(p.x, 0, p.z);
      if (typeof p.rotation === 'number' && !isNaN(p.rotation)) {
        avatar.targetRotation = p.rotation;
      }
      avatar.isMoving = !!p.isMoving;

      // Update name tag if lap or role changed
      if (avatar.name !== p.name || avatar.groupName !== p.groupName || avatar.groupColor !== p.groupColor) {
        avatar.updateNameTag(p.name, p.groupName, p.groupColor, p.role, p.currentLap);
      }
    }

    // Remove avatars that left
    for (const [id, avatar] of this.remoteAvatars.entries()) {
      if (!activeIds.has(id)) {
        this.scene.remove(avatar.group);
        avatar.dispose();
        this.remoteAvatars.delete(id);
      }
    }

    // Update HUD Group Roster and Mutawwif Compass
    if (this.hud && this.playerData) {
      this.hud.updateGroupRoster(
        this.playerData.groupName,
        this.playerData.groupColor,
        {
          x: this.playerData.x,
          z: this.playerData.z,
          rotation: this.playerData.rotation
        },
        this.allConnectedPlayers,
        this.playerData.role,
        this.playerData.name,
        this.supabaseService.isConnected
      );
    }
  }

  private animate = () => {
    requestAnimationFrame(this.animate);

    if (this.isRealMode) {
      // In Real Mode, skip 3D physics, rendering and updates to save CPU, GPU and battery
      return;
    }

    const delta = Math.min(this.clock.getDelta(), 0.1);

    // 1. Update Local Player Controls & Physics
    if (this.playerController) {
      this.playerController.update(delta);

      const pos = this.localAvatar.group.position;
      const rot = this.localAvatar.group.rotation.y;

      this.playerData.x = pos.x;
      this.playerData.z = pos.z;
      this.playerData.rotation = rot;
      this.playerData.isMoving = this.playerController.isMoving;
      this.playerData.isInBus = this.playerController.isInBus;

      // Broadcast position to Supabase Realtime (Throttled 10-12Hz)
      this.supabaseService.broadcastPosition(this.playerData);

      // Evaluate Umrah ritual checkpoints
      this.workflow.checkPosition(pos.x, pos.z);

      // Detect proximity to mosque doors and prayer carpets
      let nearMosque: MosqueLocation | null = null;
      let insideMosque: MosqueLocation | null = null;

      for (const m of MOSQUE_LOCATIONS) {
        const distDoor = Math.hypot(pos.x - m.entranceCoord.x, pos.z - m.entranceCoord.z);
        if (distDoor < m.triggerRadius) {
          nearMosque = m;
        }

        const distPrayer = Math.hypot(pos.x - m.prayerCoord.x, pos.z - m.prayerCoord.z);
        if (distPrayer < 8.5) {
          insideMosque = m;
        }
      }

      this.hud.setNearMosqueDoor(nearMosque);
      this.hud.setInsideMosque(insideMosque);

      // Periodically keep HUD position and Mutawwif distance fresh
      if (this.hud) {
        this.hud.updateGroupRoster(
          this.playerData.groupName,
          this.playerData.groupColor,
          {
            x: this.playerData.x,
            z: this.playerData.z,
            rotation: this.playerData.rotation
          },
          this.allConnectedPlayers,
          this.playerData.role,
          this.playerData.name,
          this.supabaseService.isConnected
        );
      }
    }

    // 2. Interpolate Remote Players
    for (const remoteAvatar of this.remoteAvatars.values()) {
      remoteAvatar.interpolate(delta);
    }

    // 3. Update Congregation Avatars in Prayer (Unison animation)
    for (const cong of this.congregationAvatars) {
      cong.update(delta, false);
    }

    // 4. Render 3D Scene
    this.renderer.render(this.scene, this.camera);
  };
}

// Start application when DOM is ready
window.addEventListener('DOMContentLoaded', () => {
  new UmrahSimulationApp();
});
