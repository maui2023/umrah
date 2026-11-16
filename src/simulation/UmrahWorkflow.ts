import { DuaItem, SavedUmrahState, UmrahStage } from '../types';
import {
  GREEN_LIGHT_DUA,
  ISTILAM_DUA,
  MAQAM_IBRAHIM_DUA,
  NIAT_UMRAH,
  RUKUN_YAMANI_DUA,
  SAFA_START_DUA,
  SAI_DUAS,
  TAHALLUL_DUA,
  TAWAF_DUAS,
  ZAMZAM_DUA
} from '../data/duas';
import { soundManager } from '../audio/SoundManager';
import confetti from 'canvas-confetti';

export class UmrahWorkflow {
  public stage: UmrahStage = 'niat';
  public tawafLap: number = 0; // 0 before start, 1..7 during tawaf
  public saiLap: number = 0;   // 0 before start, 1..7 during sai
  public zamzamDone: boolean = false;
  public solatSunatDone: boolean = false;
  public tahallulDone: boolean = false;

  // Tawaf progress tracking (quadrant tracking to prevent cheating)
  private hasPassedYamani: boolean = false;
  private lastTawafAngle: number | null = null;
  private tawafAngularAccumulation: number = 0;

  // Sa'i progress tracking
  private saiNextTarget: 'safa' | 'marwah' = 'safa';
  public inGreenLightsZone: boolean = false;

  // Event callbacks
  private onStageChangedCallback: ((stage: UmrahStage) => void) | null = null;
  private onLapChangedCallback: ((stage: 'tawaf' | 'sai', lap: number) => void) | null = null;
  private onDuaTriggeredCallback: ((dua: DuaItem, alertMessage?: string) => void) | null = null;

  constructor() {
    this.loadSavedState();
  }

  public registerCallbacks(options: {
    onStageChanged: (stage: UmrahStage) => void;
    onLapChanged: (stage: 'tawaf' | 'sai', lap: number) => void;
    onDuaTriggered: (dua: DuaItem, alertMessage?: string) => void;
  }) {
    this.onStageChangedCallback = options.onStageChanged;
    this.onLapChangedCallback = options.onLapChanged;
    this.onDuaTriggeredCallback = options.onDuaTriggered;
  }

  public startUmrah() {
    this.stage = 'niat';
    this.saveState();
    this.onStageChangedCallback?.(this.stage);
    this.onDuaTriggeredCallback?.(NIAT_UMRAH, 'Mulakan Umrah dengan Niat di Miqat dan bertalbiyah.');
  }

  public confirmNiat() {
    this.stage = 'tawaf';
    this.tawafLap = 1;
    this.saveState();
    this.onStageChangedCallback?.(this.stage);
    this.onLapChangedCallback?.('tawaf', this.tawafLap);
    this.onDuaTriggeredCallback?.(
      ISTILAM_DUA,
      'Menuju ke garisan Hajarul Aswad untuk memulakan Tawaf pusingan pertama!'
    );
  }

  /**
   * Monitor player position in the 3D world and update Islamic ritual logic
   */
  public checkPosition(x: number, z: number) {
    if (this.stage === 'tawaf') {
      this.processTawafPosition(x, z);
    } else if (this.stage === 'solat_zamzam') {
      this.processSolatZamzamPosition(x, z);
    } else if (this.stage === 'sai') {
      this.processSaiPosition(x, z);
    }
  }

  /**
   * Accurate Tawaf angular progression & counter-clockwise validation
   */
  private processTawafPosition(x: number, z: number) {
    const distToKaabahCenter = Math.sqrt(x * x + z * z);

    // Only count if within Mataf courtyard (radius 8m to 42m)
    if (distToKaabahCenter < 7.5 || distToKaabahCenter > 42) {
      return;
    }

    // Angle around Kaabah (atan2 returns -PI to +PI)
    const currentAngle = Math.atan2(z, x);

    if (this.lastTawafAngle !== null) {
      let deltaAngle = currentAngle - this.lastTawafAngle;
      // Handle wrap-around
      if (deltaAngle > Math.PI) deltaAngle -= Math.PI * 2;
      if (deltaAngle < -Math.PI) deltaAngle += Math.PI * 2;

      // In three.js coord (x right, z down), counter-clockwise corresponds to negative deltaAngle
      if (deltaAngle < 0 && Math.abs(deltaAngle) < 0.6) {
        this.tawafAngularAccumulation += Math.abs(deltaAngle);
      }
    }
    this.lastTawafAngle = currentAngle;

    // Check if near Rukun Yamani (approx x: -12 to -8, z: 8 to 16)
    if (x < -6 && z > 6 && !this.hasPassedYamani) {
      this.hasPassedYamani = true;
      this.onDuaTriggeredCallback?.(
        RUKUN_YAMANI_DUA,
        'Mendekati Rukun Yamani: Sunnah membaca Rabbana atina fid-dunya hasanah...'
      );
    }

    // Check if crossing Hajarul Aswad Line (approx angle PI/4, x > 10, z > 10)
    const isNearHajarAswadLine = x > 8 && z > 8 && Math.abs(x - z) < 4.5;

    // A complete lap requires accumulated rotation >= 5.2 radians (~300 degrees) and passing Yamani
    if (isNearHajarAswadLine && this.hasPassedYamani && this.tawafAngularAccumulation > 5.0) {
      soundManager.playIstilamSound();
      this.hasPassedYamani = false;
      this.tawafAngularAccumulation = 0;

      if (this.tawafLap < 7) {
        this.tawafLap += 1;
        this.saveState();
        this.onLapChangedCallback?.('tawaf', this.tawafLap);

        const nextDua = TAWAF_DUAS[this.tawafLap] || ISTILAM_DUA;
        this.onDuaTriggeredCallback?.(
          nextDua,
          `Alhamdulillah! Memulakan Tawaf Pusingan ke-${this.tawafLap}. Lakukan Istilam!`
        );
      } else {
        // Tawaf Complete!
        soundManager.playCheckpointSound();
        this.stage = 'solat_zamzam';
        this.saveState();
        this.onStageChangedCallback?.(this.stage);
        this.onDuaTriggeredCallback?.(
          MAQAM_IBRAHIM_DUA,
          'Tahniah, 7 Pusingan Tawaf selesai! Seterusnya solat sunat di belakang Maqam Ibrahim.'
        );
      }
    }
  }

  /**
   * Monitor player at Maqam Ibrahim and Zamzam
   */
  private processSolatZamzamPosition(x: number, z: number) {
    // Maqam Ibrahim zone (x: 13, z: 3.5)
    const distToMaqam = Math.sqrt((x - 13) ** 2 + (z - 3.5) ** 2);
    if (distToMaqam < 4.0 && !this.solatSunatDone) {
      // Trigger prompt for Solat Sunat Tawaf
      this.onDuaTriggeredCallback?.(
        MAQAM_IBRAHIM_DUA,
        'Anda berada di belakang Maqam Ibrahim. Lakukan solat sunat tawaf 2 rakaat.'
      );
    }

    // Zamzam station zone (x: 38, z: 8)
    const distToZamzam = Math.sqrt((x - 38) ** 2 + (z - 8) ** 2);
    if (distToZamzam < 5.0 && !this.zamzamDone) {
      this.onDuaTriggeredCallback?.(
        ZAMZAM_DUA,
        'Anda berada di stesen Zamzam. Minum air Zamzam dengan niat kebaikan.'
      );
    }
  }

  public completeSolatSunat() {
    this.solatSunatDone = true;
    soundManager.playCheckpointSound();
    this.saveState();
    if (this.zamzamDone) {
      this.advanceToSai();
    } else {
      this.onDuaTriggeredCallback?.(
        ZAMZAM_DUA,
        'Solat sunat selesai. Sila menuju ke stesen Zamzam untuk minum air Zamzam.'
      );
    }
  }

  public completeZamzam() {
    this.zamzamDone = true;
    soundManager.playCheckpointSound();
    this.saveState();
    if (this.solatSunatDone) {
      this.advanceToSai();
    } else {
      this.onDuaTriggeredCallback?.(
        MAQAM_IBRAHIM_DUA,
        'Air Zamzam dinikmati. Sila tunaikan solat sunat di belakang Maqam Ibrahim jika belum.'
      );
    }
  }

  private advanceToSai() {
    this.stage = 'sai';
    this.saiLap = 1;
    this.saiNextTarget = 'marwah';
    this.saveState();
    this.onStageChangedCallback?.(this.stage);
    this.onLapChangedCallback?.('sai', this.saiLap);
    this.onDuaTriggeredCallback?.(
      SAFA_START_DUA,
      'Selesai Tawaf & Solat! Menuju ke Bukit Safa untuk memulakan Sa\'i pusingan 1.'
    );
  }

  /**
   * Monitor Sa'i between Safa and Marwah (MasaX ~ 65, Safa: z ~ 45, Marwah: z ~ -45)
   */
  private processSaiPosition(x: number, z: number) {
    // Only monitor if inside Mas'a gallery (x between 55 and 75)
    if (x < 55 || x > 75) return;

    // Green lights zone (z between -8 and 14)
    const inGreen = z >= -8 && z <= 14;
    if (inGreen && !this.inGreenLightsZone) {
      this.inGreenLightsZone = true;
      soundManager.playGreenLightAlert();
      this.onDuaTriggeredCallback?.(
        GREEN_LIGHT_DUA,
        '🟢 KAWASAN LAMPU HIJAU: Disunatkan bagi lelaki berlari-lari anak (Harwalah / Raml)!'
      );
    } else if (!inGreen && this.inGreenLightsZone) {
      this.inGreenLightsZone = false;
    }

    // Checkpoint Safa (z > 38)
    if (z > 38 && this.saiNextTarget === 'safa') {
      soundManager.playIstilamSound();
      if (this.saiLap < 7) {
        this.saiLap += 1;
        this.saiNextTarget = 'marwah';
        this.saveState();
        this.onLapChangedCallback?.('sai', this.saiLap);
        const dua = SAI_DUAS[this.saiLap] || SAFA_START_DUA;
        this.onDuaTriggeredCallback?.(
          dua,
          `Tiba di Bukit Safa! Memulakan Sa'i pusingan ke-${this.saiLap} menghala ke Marwah.`
        );
      }
    }

    // Checkpoint Marwah (z < -38)
    if (z < -38 && this.saiNextTarget === 'marwah') {
      soundManager.playIstilamSound();
      if (this.saiLap < 7) {
        this.saiLap += 1;
        this.saiNextTarget = 'safa';
        this.saveState();
        this.onLapChangedCallback?.('sai', this.saiLap);
        const dua = SAI_DUAS[this.saiLap] || SAFA_START_DUA;
        this.onDuaTriggeredCallback?.(
          dua,
          `Tiba di Bukit Marwah! Memulakan Sa'i pusingan ke-${this.saiLap} kembali ke Safa.`
        );
      } else {
        // Sa'i Complete on 7th Lap at Marwah!
        soundManager.playCheckpointSound();
        this.stage = 'tahallul';
        this.saveState();
        this.onStageChangedCallback?.(this.stage);
        this.onDuaTriggeredCallback?.(
          TAHALLUL_DUA,
          'Alhamdulillah! Sa\'i 7 pusingan sempurna di Bukit Marwah. Kini masa untuk Tahallul (bercukur / bergunting).'
        );
      }
    }
  }

  public completeTahallul() {
    this.tahallulDone = true;
    this.stage = 'completed';
    this.saveState();

    soundManager.playCompletionFanfare();
    confetti({
      particleCount: 160,
      spread: 90,
      origin: { y: 0.6 }
    });

    this.onStageChangedCallback?.(this.stage);
    this.onDuaTriggeredCallback?.(
      TAHALLUL_DUA,
      'Mabruk! Umrah anda telah selesai dengan sempurna. Semoga mendapat Umrah yang Mabrur!'
    );
  }

  public resetProgress() {
    localStorage.removeItem('umrah_save_state');
    this.stage = 'niat';
    this.tawafLap = 0;
    this.saiLap = 0;
    this.zamzamDone = false;
    this.solatSunatDone = false;
    this.tahallulDone = false;
    this.hasPassedYamani = false;
    this.tawafAngularAccumulation = 0;
    this.onStageChangedCallback?.(this.stage);
    this.onLapChangedCallback?.('tawaf', 0);
  }

  private saveState() {
    const state: SavedUmrahState = {
      playerId: localStorage.getItem('umrah_player_id') || 'guest_' + Math.random().toString(36).substring(2, 8),
      playerName: localStorage.getItem('umrah_player_name') || 'Jemaah',
      gender: (localStorage.getItem('umrah_gender') as 'male' | 'female') || 'male',
      role: (localStorage.getItem('umrah_role') as 'mutawwif' | 'jemaah') || 'jemaah',
      groupId: localStorage.getItem('umrah_group_id') || 'SOLO',
      groupName: localStorage.getItem('umrah_group_name') || 'Solo',
      groupColor: localStorage.getItem('umrah_group_color') || '#10B981',
      stage: this.stage,
      tawafLap: this.tawafLap,
      saiLap: this.saiLap,
      zamzamDone: this.zamzamDone,
      solatSunatDone: this.solatSunatDone,
      tahallulDone: this.tahallulDone,
      completedAt: this.stage === 'completed' ? new Date().toISOString() : undefined
    };

    localStorage.setItem('umrah_save_state', JSON.stringify(state));
  }

  private loadSavedState() {
    const raw = localStorage.getItem('umrah_save_state');
    if (!raw) return;

    try {
      const state: SavedUmrahState = JSON.parse(raw);
      if (state.stage) this.stage = state.stage;
      if (typeof state.tawafLap === 'number') this.tawafLap = state.tawafLap;
      if (typeof state.saiLap === 'number') this.saiLap = state.saiLap;
      if (state.zamzamDone) this.zamzamDone = true;
      if (state.solatSunatDone) this.solatSunatDone = true;
      if (state.tahallulDone) this.tahallulDone = true;
    } catch (e) {
      console.warn('Failed to parse saved state:', e);
    }
  }
}
