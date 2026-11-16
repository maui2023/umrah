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
    new MasjidilHaram(this.scene);
  }

  private showOnboarding() {
    new OnboardingModal((data: OnboardingData) => {
      this.startSimulation(data);
    });
  }

  private startSimulation(data: OnboardingData) {
    const playerId = 'player_' + Math.random().toString(36).substring(2, 9);
    const startAtMadinah = data.startLocation !== 'makkah';

    // Position player next to Bas Ziarah at Madinah Station if starting from beginning!
    const initX = startAtMadinah ? -130 : 18;
    const initY = 0;
    const initZ = startAtMadinah ? -8 : 18;
    const initRot = startAtMadinah ? -Math.PI / 2 : Math.PI / 4;

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
      currentLap: 1,
      stage: startAtMadinah ? 'ziarah_dalam' : 'tawaf'
    };

    // 1. Create Local Avatar
    this.localAvatar = new AvatarModel({
      name: this.playerData.name,
      gender: this.playerData.gender,
      role: this.playerData.role,
      groupColor: this.playerData.groupColor,
      groupName: this.playerData.groupName,
      currentLap: 1
    });

    this.localAvatar.group.position.set(this.playerData.x, 0, this.playerData.z);
    this.localAvatar.group.rotation.y = this.playerData.rotation;
    this.scene.add(this.localAvatar.group);

    // 2. Initialize Player Controller
    this.playerController = new PlayerController(
      this.localAvatar,
      this.camera,
      this.renderer.domElement,
      this.playerData.rotation
    );

    // Initial camera position for Madinah scenic overview
    if (startAtMadinah) {
      this.camera.position.set(initX + 8, 4.5, initZ + 6);
      this.camera.lookAt(initX - 4, 1.8, initZ);
    }

    // 3. Initialize HUD
    this.hud = new HUD();
    this.setupHUDCallbacks();

    // 4. Register Workflow Callbacks
    this.workflow.registerCallbacks({
      onStageChanged: (stage) => {
        this.playerData.stage = stage;
        this.hud.updateStage(stage);
        if (stage === 'solat_zamzam') {
          this.hud.updateSolatZamzamStatus(this.workflow.solatSunatDone, this.workflow.zamzamDone);
        }
        this.localAvatar.updateNameTag(
          this.playerData.name,
          this.playerData.groupName,
          this.playerData.groupColor,
          this.playerData.role,
          this.playerData.currentLap
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
      },
      onDuaTriggered: (dua, alertMessage) => {
        this.hud.displayDua(dua, alertMessage);
      },
      onTeleportRequested: (x, z, rot) => {
        this.playerController.teleport(x, z, rot ?? 0);
      }
    });

    // Start Umrah ritual from Madinah or directly Makkah
    this.workflow.startUmrah(startAtMadinah);

    // 5. Connect Multiplayer / Public World
    this.supabaseService.connect(this.playerData, (remotePlayers: PlayerData[]) => {
      this.handleRemotePlayersUpdate(remotePlayers);
    });

    // Start gentle ambient sound
    soundManager.startCourtyardAmbience();

    // 6. Start Render Loop
    this.animate();
  }

  private setupHUDCallbacks() {
    // Quick Teleport Handler
    this.hud.registerCallbacks({
      onTeleport: (loc) => {
        if (loc === 'madinah_bus') {
          this.playerController.teleport(-130, -8, -Math.PI / 2);
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
          this.playerController.teleport(-160, -45, Math.PI);
        } else if (loc === 'ladang_kurma') {
          this.playerController.teleport(-130, -42, 0);
        } else if (loc === 'miqat_bir_ali') {
          this.playerController.teleport(-155, 25, 0);
        } else if (loc === 'hajar_aswad') {
          this.playerController.teleport(18, 18, Math.PI / 4);
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
      onActionButton: (stage) => {
        if (stage === 'ziarah_dalam' || stage === 'ziarah_luar_bus' || stage === 'ziarah_wida_hotel') {
          const spot = this.workflow.getCurrentZiarahSpot();
          if (spot.id === 'masjid_quba' && !this.workflow.qubaSolatDone) {
            this.workflow.performSolatQuba();
          } else if (spot.id === 'memakai_ihram_hotel' && !this.workflow.ihramWorn) {
            this.workflow.wearIhramAtHotel();
          }
          this.workflow.nextZiarahSpot();
        } else if (stage === 'miqat_bir_ali') {
          this.workflow.confirmNiatAtMiqat();
        } else if (stage === 'perjalanan_makkah' || stage === 'niat') {
          this.workflow.arriveAtMakkah();
        } else if (stage === 'tawaf') {
          soundManager.playIstilamSound();
        } else if (stage === 'solat_zamzam') {
          if (!this.workflow.solatSunatDone) {
            this.workflow.completeSolatSunat();
          } else if (!this.workflow.zamzamDone) {
            this.workflow.completeZamzam();
          }
          this.hud.updateSolatZamzamStatus(this.workflow.solatSunatDone, this.workflow.zamzamDone);
        } else if (stage === 'sai') {
          soundManager.playIstilamSound();
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
      }
    });
  }

  /**
   * Handle updates of fellow pilgrims in the public world
   */
  private handleRemotePlayersUpdate(players: PlayerData[]) {
    this.allConnectedPlayers = players;
    const activeIds = new Set<string>();

    for (const p of players) {
      if (p.id === this.playerData.id) continue;
      activeIds.add(p.id);

      let avatar = this.remoteAvatars.get(p.id);
      if (!avatar) {
        avatar = new AvatarModel({
          name: p.name,
          gender: p.gender,
          role: p.role,
          groupColor: p.groupColor,
          groupName: p.groupName,
          currentLap: p.currentLap
        });
        avatar.group.position.set(p.x, 0, p.z);
        avatar.group.rotation.y = p.rotation;
        this.scene.add(avatar.group);
        this.remoteAvatars.set(p.id, avatar);
      }

      avatar.targetPosition.set(p.x, 0, p.z);
      avatar.targetRotation = p.rotation;
      avatar.isMoving = p.isMoving;

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
        this.playerData.role
      );
    }
  }

  private animate = () => {
    requestAnimationFrame(this.animate);

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

      // Broadcast position to Supabase Realtime (Throttled 10-12Hz)
      this.supabaseService.broadcastPosition(this.playerData);

      // Evaluate Umrah ritual checkpoints
      this.workflow.checkPosition(pos.x, pos.z);
    }

    // 2. Interpolate Remote Players
    for (const remoteAvatar of this.remoteAvatars.values()) {
      remoteAvatar.interpolate(delta);
    }

    // 3. Render 3D Scene
    this.renderer.render(this.scene, this.camera);
  };
}

// Start application when DOM is ready
window.addEventListener('DOMContentLoaded', () => {
  new UmrahSimulationApp();
});
