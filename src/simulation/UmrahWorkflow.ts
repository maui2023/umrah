import { DuaItem, SavedUmrahState, UmrahStage, ZiarahSpot } from '../types';
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
import { ZIARAH_SPOTS } from '../data/ziarahData';
import { soundManager } from '../audio/SoundManager';
import confetti from 'canvas-confetti';

export class UmrahWorkflow {
  public stage: UmrahStage = 'ziarah_dalam';
  public currentZiarahIndex: number = 0;
  public tawafLap: number = 0; // 0 before start, 1..7 during tawaf
  public saiLap: number = 0;   // 0 before start, 1..7 during sai
  public zamzamDone: boolean = false;
  public solatSunatDone: boolean = false;
  public tahallulDone: boolean = false;
  public qubaSolatDone: boolean = false;
  public ihramWorn: boolean = false;
  public miqatNiatDone: boolean = false;

  // Tawaf progress tracking (quadrant tracking to prevent cheating)
  private hasPassedYamani: boolean = false;
  private lastTawafAngle: number | null = null;
  private tawafAngularAccumulation: number = 0;
  private clockwiseWrongAccumulation: number = 0;
  private lastWrongDirectionWarningTime: number = 0;

  // Sa'i progress tracking
  private saiNextTarget: 'safa' | 'marwah' = 'safa';
  public inGreenLightsZone: boolean = false;

  // Event callbacks
  private onStageChangedCallback: ((stage: UmrahStage) => void) | null = null;
  private onLapChangedCallback: ((stage: 'tawaf' | 'sai', lap: number) => void) | null = null;
  private onZiarahChangedCallback: ((spot: ZiarahSpot, index: number, total: number) => void) | null = null;
  private onDuaTriggeredCallback: ((dua: DuaItem, alertMessage?: string) => void) | null = null;
  private onTeleportRequestedCallback: ((x: number, z: number, rot?: number) => void) | null = null;
  public positionProvider: (() => { x: number; y: number; z: number; rotation: number; isInBus?: boolean }) | null = null;

  public static getSavedState(): SavedUmrahState | null {
    const raw = localStorage.getItem('umrah_save_state');
    if (!raw) return null;
    try {
      return JSON.parse(raw) as SavedUmrahState;
    } catch {
      return null;
    }
  }

  constructor() {
    this.loadSavedState();
  }

  public registerCallbacks(options: {
    onStageChanged: (stage: UmrahStage) => void;
    onLapChanged: (stage: 'tawaf' | 'sai', lap: number) => void;
    onZiarahChanged?: (spot: ZiarahSpot, index: number, total: number) => void;
    onDuaTriggered: (dua: DuaItem, alertMessage?: string) => void;
    onTeleportRequested?: (x: number, z: number, rot?: number) => void;
  }) {
    this.onStageChangedCallback = options.onStageChanged;
    this.onLapChangedCallback = options.onLapChanged;
    this.onZiarahChangedCallback = options.onZiarahChanged || null;
    this.onDuaTriggeredCallback = options.onDuaTriggered;
    this.onTeleportRequestedCallback = options.onTeleportRequested || null;
  }

  public getCurrentZiarahSpot(): ZiarahSpot {
    return ZIARAH_SPOTS[this.currentZiarahIndex] || ZIARAH_SPOTS[0];
  }

  public startUmrah(startFromBeginning: boolean = true) {
    if (startFromBeginning) {
      this.currentZiarahIndex = 0;
      const initialSpot = ZIARAH_SPOTS[0];
      this.stage = 'ziarah_dalam';
      this.saveState();
      this.onStageChangedCallback?.(this.stage);
      this.onZiarahChangedCallback?.(initialSpot, 0, ZIARAH_SPOTS.length);
      if (initialSpot.dua) {
        this.onDuaTriggeredCallback?.(initialSpot.dua, `Selamat Datang ke Madinah Al-Munawwarah! Mulakan Ziarah Dalam Madinah bersama Mutawwif.`);
      }
    } else {
      this.stage = 'niat';
      this.saveState();
      this.onStageChangedCallback?.(this.stage);
      this.onDuaTriggeredCallback?.(NIAT_UMRAH, 'Mulakan Umrah dengan Niat di Miqat dan bertalbiyah.');
    }
  }

  /**
   * Advance to next Ziarah / Itinerary spot
   */
  public nextZiarahSpot() {
    if (this.currentZiarahIndex < ZIARAH_SPOTS.length - 1) {
      this.goToZiarahSpot(this.currentZiarahIndex + 1);
    } else {
      // Arrived at the final stop: Tiba di Makkah ➔ Tawaf
      this.arriveAtMakkah();
    }
  }

  /**
   * Go to previous Ziarah spot
   */
  public prevZiarahSpot() {
    if (this.currentZiarahIndex > 0) {
      this.goToZiarahSpot(this.currentZiarahIndex - 1);
    }
  }

  /**
   * Jump or navigate directly to a specific Ziarah spot index
   */
  public goToZiarahSpot(index: number) {
    if (index < 0 || index >= ZIARAH_SPOTS.length) return;
    this.currentZiarahIndex = index;
    const spot = ZIARAH_SPOTS[this.currentZiarahIndex];

    // Determine stage based on spot category
    if (spot.category === 'dalam_madinah') {
      this.stage = 'ziarah_dalam';
    } else if (spot.category === 'luar_madinah_melintas' || spot.category === 'luar_madinah_turun' || spot.category === 'ziarah_pilihan') {
      this.stage = 'ziarah_luar_bus';
    } else if (spot.category === 'ziarah_wida_hotel') {
      this.stage = 'ziarah_wida_hotel';
    } else if (spot.category === 'miqat_bir_ali') {
      this.stage = 'miqat_bir_ali';
    } else if (spot.category === 'perjalanan_makkah') {
      if (spot.id === 'tiba_di_makkah_tawaf') {
        this.stage = 'tawaf';
      } else {
        this.stage = 'perjalanan_makkah';
      }
    }

    this.saveState();
    this.onStageChangedCallback?.(this.stage);
    this.onZiarahChangedCallback?.(spot, this.currentZiarahIndex, ZIARAH_SPOTS.length);

    // Play appropriate sound cue
    if (spot.transportType === 'bus_pass' || spot.transportType === 'bus_stop' || spot.transportType === 'bus_travel') {
      soundManager.playBusDepartureSound();
    } else {
      soundManager.playCheckpointSound();
    }

    if (spot.dua) {
      this.onDuaTriggeredCallback?.(spot.dua, `📍 ${spot.categoryLabel}: ${spot.title}`);
    }

    // Teleport avatar to coordinates if defined
    if (spot.coordinates && this.onTeleportRequestedCallback) {
      this.onTeleportRequestedCallback(spot.coordinates.x, spot.coordinates.z);
    }
  }

  /**
   * Board the Umrah Tour Bus
   */
  public boardBus() {
    soundManager.playBusDepartureSound();
    // Locate the first bus stop or advance to ziarah luar
    const busSpotIndex = ZIARAH_SPOTS.findIndex(s => s.category === 'luar_madinah_melintas');
    if (busSpotIndex !== -1 && this.currentZiarahIndex < busSpotIndex) {
      this.goToZiarahSpot(busSpotIndex);
    } else {
      this.nextZiarahSpot();
    }
  }

  /**
   * Perform Solat Sunat at Masjid Quba
   */
  public performSolatQuba() {
    this.qubaSolatDone = true;
    soundManager.playSolatChime();
    soundManager.playCheckpointSound();
    this.saveState();
    const qubaSpot = ZIARAH_SPOTS.find(s => s.id === 'masjid_quba');
    if (qubaSpot && qubaSpot.dua) {
      this.onDuaTriggeredCallback?.(
        qubaSpot.dua,
        'Alhamdulillah! Solat sunat di Masjid Quba selesai. Ganjaran seumpama satu Umrah yang sempurna!'
      );
    }
  }

  /**
   * Wear Ihram at Hotel in Madinah
   */
  public wearIhramAtHotel() {
    this.ihramWorn = true;
    soundManager.playCheckpointSound();
    this.stage = 'ziarah_wida_hotel';
    this.saveState();
    const hotelSpot = ZIARAH_SPOTS.find(s => s.id === 'memakai_ihram_hotel');
    if (hotelSpot && hotelSpot.dua) {
      this.onDuaTriggeredCallback?.(
        hotelSpot.dua,
        'Alhamdulillah! Pakaian Ihram telah disarungkan. Bersedia menaiki bas menuju ke Miqat Masjid Bir Ali!'
      );
    }
  }

  /**
   * Confirm Niat Umrah at Miqat Masjid Bir Ali
   */
  public confirmNiatAtMiqat() {
    this.miqatNiatDone = true;
    soundManager.playSolatChime();
    soundManager.playCheckpointSound();

    // Advance to Perjalanan Makkah
    const talbiyahSpotIndex = ZIARAH_SPOTS.findIndex(s => s.id === 'perjalanan_bas_talbiyah_makkah');
    if (talbiyahSpotIndex !== -1) {
      this.goToZiarahSpot(talbiyahSpotIndex);
    } else {
      this.stage = 'perjalanan_makkah';
      this.onStageChangedCallback?.(this.stage);
    }

    // Play Talbiyah announcement
    const miqatSpot = ZIARAH_SPOTS.find(s => s.id === 'miqat_masjid_bir_ali');
    if (miqatSpot && miqatSpot.dua) {
      this.onDuaTriggeredCallback?.(
        miqatSpot.dua,
        'Labbaikallahumma Labbaik! Niat Umrah di Miqat Bir Ali telah sah. 13 Pantang larang ihram berkuat kuasa.'
      );
    }
  }

  /**
   * Arrive at Makkah & Start Tawaf
   */
  public arriveAtMakkah() {
    this.stage = 'tawaf';
    this.tawafLap = 1;
    this.saveState();
    this.onStageChangedCallback?.(this.stage);
    this.onLapChangedCallback?.('tawaf', this.tawafLap);

    soundManager.playCheckpointSound();
    this.onTeleportRequestedCallback?.(18, 18, -3 * Math.PI / 4);

    this.onDuaTriggeredCallback?.(
      ISTILAM_DUA,
      'Alhamdulillah! Rombongan tiba di Masjidil Haram, Makkah. Mulakan Tawaf di garisan Hajarul Aswad secara LAWAN ARAH JAM (Kaabah sentiasa di sebelah kiri anda)!'
    );
  }

  public confirmNiat() {
    this.arriveAtMakkah();
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
    } else if (
      this.stage === 'ziarah_dalam' || 
      this.stage === 'ziarah_luar_bus' || 
      this.stage === 'ziarah_wida_hotel' || 
      this.stage === 'miqat_bir_ali'
    ) {
      this.processMadinahPosition(x, z);
    }
  }

  /**
   * Check if player walked near Madinah checkpoints
   */
  private processMadinahPosition(x: number, z: number) {
    // Masjid Bir Ali Zone (x: -155, z: 32)
    const distToBirAli = Math.sqrt((x - (-155)) ** 2 + (z - 32) ** 2);
    if (distToBirAli < 8.0 && this.stage !== 'miqat_bir_ali' && !this.miqatNiatDone) {
      const birAliIndex = ZIARAH_SPOTS.findIndex(s => s.id === 'miqat_masjid_bir_ali');
      if (birAliIndex !== -1 && this.currentZiarahIndex !== birAliIndex) {
        this.goToZiarahSpot(birAliIndex);
      }
    }

    // Masjid Quba Zone (x: -115, z: -35)
    const distToQuba = Math.sqrt((x - (-115)) ** 2 + (z - (-35)) ** 2);
    if (distToQuba < 7.0 && !this.qubaSolatDone) {
      const qubaIndex = ZIARAH_SPOTS.findIndex(s => s.id === 'masjid_quba');
      if (qubaIndex !== -1 && this.currentZiarahIndex !== qubaIndex) {
        this.goToZiarahSpot(qubaIndex);
      }
    }

    // Jabal Uhud Zone (x: -160, z: -50)
    const distToUhud = Math.sqrt((x - (-160)) ** 2 + (z - (-50)) ** 2);
    if (distToUhud < 9.0) {
      const uhudIndex = ZIARAH_SPOTS.findIndex(s => s.id === 'jabal_uhud_bukit_pemanah');
      if (uhudIndex !== -1 && this.currentZiarahIndex !== uhudIndex) {
        this.goToZiarahSpot(uhudIndex);
      }
    }
  }

  /**
   * Accurate Tawaf angular progression & counter-clockwise validation
   */
  private processTawafPosition(x: number, z: number) {
    const distToKaabahCenter = Math.sqrt(x * x + z * z);

    // Only count if within Mataf courtyard (radius 7.5m to 42m)
    if (distToKaabahCenter < 7.5 || distToKaabahCenter > 42) {
      return;
    }

    const currentAngle = Math.atan2(z, x);

    if (this.lastTawafAngle !== null) {
      let deltaAngle = currentAngle - this.lastTawafAngle;
      if (deltaAngle > Math.PI) deltaAngle -= Math.PI * 2;
      if (deltaAngle < -Math.PI) deltaAngle += Math.PI * 2;

      // In Three.js X-Z plane, counter-clockwise circling Kaabah has deltaAngle < 0
      if (deltaAngle < 0 && Math.abs(deltaAngle) < 0.6) {
        this.tawafAngularAccumulation += Math.abs(deltaAngle);
        this.clockwiseWrongAccumulation = 0;
      } else if (deltaAngle > 0.02 && deltaAngle < 0.6) {
        // Player is walking clockwise (wrong direction!)
        this.clockwiseWrongAccumulation += deltaAngle;
        const now = Date.now();
        if (this.clockwiseWrongAccumulation > 0.5 && now - this.lastWrongDirectionWarningTime > 12000) {
          this.lastWrongDirectionWarningTime = now;
          this.onDuaTriggeredCallback?.(
            ISTILAM_DUA,
            '⚠️ Peringatan Arah Tawaf: Sila pusing mengikut LAWAN ARAH JAM (Kaabah sentiasa di sebelah kiri anda)!'
          );
        }
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

    // Check if crossing Hajarul Aswad Line (approx angle PI/4, x > 8, z > 8)
    const isNearHajarAswadLine = x > 8 && z > 8 && Math.abs(x - z) < 4.5;

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
    const distToMaqam = Math.sqrt((x - 13) ** 2 + (z - 3.5) ** 2);
    if (distToMaqam < 4.0 && !this.solatSunatDone) {
      this.onDuaTriggeredCallback?.(
        MAQAM_IBRAHIM_DUA,
        'Anda berada di belakang Maqam Ibrahim. Lakukan solat sunat tawaf 2 rakaat.'
      );
    }

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
    soundManager.playSolatChime();
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
   * Monitor Sa'i between Safa and Marwah
   */
  private processSaiPosition(x: number, z: number) {
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

  public resumeUmrah() {
    this.loadSavedState();
    this.onStageChangedCallback?.(this.stage);

    if (this.stage === 'tawaf') {
      const lap = Math.max(this.tawafLap, 1);
      this.tawafLap = lap;
      this.onLapChangedCallback?.('tawaf', lap);
      const dua = TAWAF_DUAS[lap] || ISTILAM_DUA;
      this.onDuaTriggeredCallback?.(dua, `Alhamdulillah! Menyambung Tawaf pusingan ke-${lap}.`);
    } else if (this.stage === 'sai') {
      const lap = Math.max(this.saiLap, 1);
      this.saiLap = lap;
      this.saiNextTarget = (lap % 2 === 1) ? 'marwah' : 'safa';
      this.onLapChangedCallback?.('sai', lap);
      const dua = SAI_DUAS[lap] || SAFA_START_DUA;
      this.onDuaTriggeredCallback?.(
        dua,
        `Alhamdulillah! Menyambung Sa'i pusingan ke-${lap} menghala ke Bukit ${this.saiNextTarget === 'marwah' ? 'Marwah' : 'Safa'}.`
      );
    } else if (this.stage === 'solat_zamzam') {
      if (!this.solatSunatDone) {
        this.onDuaTriggeredCallback?.(MAQAM_IBRAHIM_DUA, 'Menyambung solat sunat tawaf di belakang Maqam Ibrahim.');
      } else if (!this.zamzamDone) {
        this.onDuaTriggeredCallback?.(ZAMZAM_DUA, 'Menyambung minum air zamzam di stesen Zamzam.');
      }
    } else if (this.stage === 'tahallul') {
      this.onDuaTriggeredCallback?.(TAHALLUL_DUA, 'Alhamdulillah! Sa\'i selesai. Teruskan dengan Tahallul (bercukur / bergunting).');
    } else if (this.stage === 'completed') {
      this.onDuaTriggeredCallback?.(TAHALLUL_DUA, 'Mabruk! Ibadah Umrah anda telah selesai dilaksanakan.');
    } else {
      // Ziarah stages
      const spot = this.getCurrentZiarahSpot();
      this.onZiarahChangedCallback?.(spot, this.currentZiarahIndex, ZIARAH_SPOTS.length);
      if (spot.dua) {
        this.onDuaTriggeredCallback?.(spot.dua, `📍 Sambung Ziarah: ${spot.title}`);
      }
    }
  }

  public resetProgress() {
    localStorage.removeItem('umrah_save_state');
    this.currentZiarahIndex = 0;
    this.stage = 'ziarah_dalam';
    this.tawafLap = 0;
    this.saiLap = 0;
    this.zamzamDone = false;
    this.solatSunatDone = false;
    this.tahallulDone = false;
    this.qubaSolatDone = false;
    this.ihramWorn = false;
    this.miqatNiatDone = false;
    this.hasPassedYamani = false;
    this.tawafAngularAccumulation = 0;
    this.onStageChangedCallback?.(this.stage);
    this.onLapChangedCallback?.('tawaf', 0);
    this.onZiarahChangedCallback?.(ZIARAH_SPOTS[0], 0, ZIARAH_SPOTS.length);
  }

  public saveState() {
    let lastPosition: SavedUmrahState['lastPosition'] = undefined;
    if (this.positionProvider) {
      try {
        lastPosition = this.positionProvider();
      } catch (err) {
        console.warn('Failed to retrieve player position for save:', err);
      }
    }

    let playerId = localStorage.getItem('umrah_player_id');
    if (!playerId) {
      playerId = 'player_' + Math.random().toString(36).substring(2, 9);
      localStorage.setItem('umrah_player_id', playerId);
    }

    const state: SavedUmrahState = {
      playerId,
      playerName: localStorage.getItem('umrah_player_name') || 'Jemaah',
      gender: (localStorage.getItem('umrah_gender') as 'male' | 'female') || 'male',
      role: (localStorage.getItem('umrah_role') as 'mutawwif' | 'jemaah') || 'jemaah',
      groupId: localStorage.getItem('umrah_group_id') || 'SOLO',
      groupName: localStorage.getItem('umrah_group_name') || 'Solo',
      groupColor: localStorage.getItem('umrah_group_color') || '#10B981',
      stage: this.stage,
      ziarahSpotIndex: this.currentZiarahIndex,
      tawafLap: this.tawafLap,
      saiLap: this.saiLap,
      zamzamDone: this.zamzamDone,
      solatSunatDone: this.solatSunatDone,
      tahallulDone: this.tahallulDone,
      qubaSolatDone: this.qubaSolatDone,
      ihramWorn: this.ihramWorn,
      miqatNiatDone: this.miqatNiatDone,
      lastPosition,
      lastSavedAt: new Date().toISOString(),
      completedAt: this.stage === 'completed' ? new Date().toISOString() : undefined
    };

    localStorage.setItem('umrah_save_state', JSON.stringify(state));
  }

  public loadSavedState() {
    const raw = localStorage.getItem('umrah_save_state');
    if (!raw) return;

    try {
      const state: SavedUmrahState = JSON.parse(raw);
      if (state.stage) this.stage = state.stage;
      if (typeof state.ziarahSpotIndex === 'number') this.currentZiarahIndex = state.ziarahSpotIndex;
      if (typeof state.tawafLap === 'number') this.tawafLap = state.tawafLap;
      if (typeof state.saiLap === 'number') {
        this.saiLap = state.saiLap;
        this.saiNextTarget = (this.saiLap % 2 === 1) ? 'marwah' : 'safa';
      }
      if (state.zamzamDone) this.zamzamDone = true;
      if (state.solatSunatDone) this.solatSunatDone = true;
      if (state.tahallulDone) this.tahallulDone = true;
      if (state.qubaSolatDone) this.qubaSolatDone = true;
      if (state.ihramWorn) this.ihramWorn = true;
      if (state.miqatNiatDone) this.miqatNiatDone = true;
    } catch (e) {
      console.warn('Failed to parse saved state:', e);
    }
  }
}
