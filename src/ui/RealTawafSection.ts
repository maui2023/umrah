import { qiblaCompassService, QiblaState, PRESET_LOCATIONS } from '../simulation/QiblaCompassService';
import { soundManager } from '../audio/SoundManager';
import { TAWAF_DUAS } from '../data/duas';
import confetti from 'canvas-confetti';

export interface RealTawafSectionCallbacks {
  onSwitchToGame?: () => void;
  onLapChanged?: (lap: number) => void;
  onTawafFinished?: () => void;
  onProceedToSai?: () => void;
  onSwitchToSai?: () => void;
}

export type RealTawafTab = 'compass_laps' | 'duas' | 'rukun' | 'fiqh';

export interface TawafSectorInfo {
  id: number;
  angleDeg: number;
  title: string;
  subtitle: string;
  tip: string;
  duaSnippet: string;
}

export const TAWAF_SECTORS: TawafSectorInfo[] = [
  {
    id: 0,
    angleDeg: 90, // Bottom (Garisan Hajar Aswad)
    title: 'Zon Garisan Hijau (Hajar Aswad)',
    subtitle: 'Permulaan & Pengakhiran Setiap Pusingan Tawaf',
    tip: 'Luruskan bahu kiri ke arah Kaabah dan mulakan pusingan dengan lafaz Istilam "Bismillahi Allahu Akbar".',
    duaSnippet: 'بِسْمِ اللَّهِ، اللَّهُ أَكْبَرُ'
  },
  {
    id: 1,
    angleDeg: 15, // Heading to Iraqi & Hijr Ismail (East)
    title: 'Bergerak ke arah Rukun Iraqi & Hijr Ismail',
    subtitle: 'Kekalkan Kaabah sentiasa di sebelah bahu kiri',
    tip: 'Lelaki disunatkan Raml (berlari anak dengan langkah pendek) pada 3 pusingan pertama jika lapang.',
    duaSnippet: 'سُبْحَانَ اللَّهِ وَالْحَمْدُ لِلَّهِ وَلاَ إِلَهَ إِلاَّ اللَّهُ وَاللَّهُ أَكْبَرُ'
  },
  {
    id: 2,
    angleDeg: 300, // Top - Outside Hijr Ismail (North)
    title: 'Tawaf di LUAR dinding Hijr Ismail (Pancuran Emas)',
    subtitle: 'Wajib tawaf di luar Hijr Ismail, dilarang masuk ke dalam',
    tip: 'Hijr Ismail (Hateem) adalah sebahagian daripada Kaabah. Tawaf di dalamnya membatalkan pusingan tersebut.',
    duaSnippet: 'اللَّهُمَّ إِنَّ هَذَا الْبَيْتَ بَيْتُكَ، وَالْحَرَمَ حَرَمُكَ'
  },
  {
    id: 3,
    angleDeg: 210, // West side - Heading to Rukun Yamani
    title: 'Menuju ke Rukun Yamani',
    subtitle: 'Teruskan berzikir & istighfar memohon keampunan',
    tip: 'Kekalkan ketenangan langkah dan perbanyakkan doa hajat diri serta keluarga.',
    duaSnippet: 'اللَّهُمَّ اغْفِرْ وَارْحَمْ وَاعْفُ عَمَّا تَعْلَمْ'
  },
  {
    id: 4,
    angleDeg: 135, // Between Yamani & Hajar Aswad (South)
    title: 'Antara Rukun Yamani & Hajar Aswad',
    subtitle: 'Sunnah membaca: Rabbana aatina fid-dunya hasanah...',
    tip: 'Disunatkan mengusap Rukun Yamani (jika dekat) atau berisyarat dari jauh tanpa mencium tangan.',
    duaSnippet: 'رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ'
  }
];

export class RealTawafSection {
  private container: HTMLElement;
  private currentLap: number = 1;
  private currentSectorIndex: number = 0;
  private activeTab: RealTawafTab = 'compass_laps';
  private selectedDuaLap: number = 1;
  private selectedRukunIndex: number = 0; // 0: Hajarul Aswad, 1: Iraqi, 2: Syami, 3: Yamani
  private isSpeaking: boolean = false;
  private isTalbiyahAudioActive: boolean = false;
  private isSectionOpen: boolean = false;
  private unsubscribeCompass?: () => void;
  private callbacks: RealTawafSectionCallbacks = {};
  private lastQiblaState: QiblaState | null = null;

  // ==========================================
  // AUTO-TAWAF & STATIC KAABAH TRACKING STATE
  // ==========================================
  private tawafMode: 'pedometer' | 'auto' | 'manual' = 'pedometer'; // Default: Mod Langkah Sebenar (Pedometer)
  private isTawafActive: boolean = false; // Player presses "Mula" in green zone to activate
  private orbitAngle: number = 90; // Default: 90 deg = Bottom corner (Garisan Hajar Aswad)
  private traveledDegInLap: number = 0; // Cumulative degrees counter-clockwise in current lap (0..360)
  private visitedSectorsInLap: Set<number> = new Set([0]);
  private hasTraversedFar: boolean = false; // Becomes true once traveled > 200 deg

  // Auto-Walk Simulation Loop (Only active in 'auto' mode)
  private isAutoWalkPlaying: boolean = true;
  private autoWalkSpeed: 'normal' | 'raml' | 'fast' = 'normal';
  private autoWalkRafId: number | null = null;
  private lastFrameTimestamp: number = 0;

  // Real device sensors / Pedometer
  private stepCount: number = 0; // Cumulative steps across 7 laps
  private lapStepCount: number = 0; // Steps in current lap
  public readonly STEPS_PER_LAP: number = 260; // Standard ~260 steps for 1 full lap in Mataf
  public readonly DEG_PER_STEP: number = 360 / 260; // ~1.385 deg per step
  private gravityFilter: number = 9.81;
  private isStepArmed: boolean = true;
  private lastStepTimestamp: number = 0;
  private motionListenerBound: ((e: DeviceMotionEvent) => void) | null = null;

  constructor(callbacks?: RealTawafSectionCallbacks) {
    if (callbacks) {
      this.callbacks = callbacks;
    }

    this.container = document.createElement('div');
    this.container.id = 'real-tawaf-section';
    this.container.className =
      'fixed inset-0 z-50 overflow-y-auto bg-[#FDFBF7] text-stone-900 flex flex-col font-sans select-none transition-opacity duration-300';
    this.container.style.display = 'none';

    document.body.appendChild(this.container);
  }

  public open(initialLap: number = 1) {
    this.currentLap = Math.max(1, Math.min(7, initialLap));
    this.selectedDuaLap = this.currentLap;
    this.currentSectorIndex = 0;
    this.orbitAngle = 90; // Position at bottom (Hajar Aswad)
    this.traveledDegInLap = 0;
    this.visitedSectorsInLap = new Set([0]);
    this.hasTraversedFar = false;
    this.lapStepCount = 0;
    this.isTawafActive = false; // Waiting for user to press "Mula" in green zone
    this.isSectionOpen = true;
    this.container.style.display = 'flex';

    // Start Compass Service
    qiblaCompassService.start();
    this.unsubscribeCompass = qiblaCompassService.subscribe((state) => {
      this.lastQiblaState = state;
      this.updateCompassDisplay(state);
    });

    // Start Device Motion (Pedometer step detection)
    this.startMotionSensor();

    this.render();

    // Start Auto-Walk Loop only if auto mode is selected and active
    if (this.tawafMode === 'auto' && this.isTawafActive) {
      this.startAutoWalkLoop();
    }
  }

  public close() {
    this.isSectionOpen = false;
    this.container.style.display = 'none';

    this.stopAutoWalkLoop();
    this.stopMotionSensor();

    if (this.unsubscribeCompass) {
      this.unsubscribeCompass();
      this.unsubscribeCompass = undefined;
    }
    qiblaCompassService.stop();
    this.stopAudio();
  }

  public setLap(lap: number) {
    this.currentLap = Math.max(1, Math.min(7, lap));
    this.selectedDuaLap = this.currentLap;
    this.currentSectorIndex = 0;
    this.orbitAngle = 90;
    this.traveledDegInLap = 0;
    this.visitedSectorsInLap = new Set([0]);
    this.hasTraversedFar = false;
    this.callbacks.onLapChanged?.(this.currentLap);
    this.updateLapDisplay();
    this.updateMotawefVisuals();
  }

  // ==========================================
  // AUDIO & SPEECH
  // ==========================================
  private stopAudio() {
    soundManager.stopTalbiyahAudio();
    this.isTalbiyahAudioActive = false;
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    this.isSpeaking = false;
    this.updateAudioButtonState();
  }

  private toggleTalbiyahAudio() {
    if (this.isTalbiyahAudioActive) {
      this.stopAudio();
    } else {
      if ('speechSynthesis' in window) window.speechSynthesis.cancel();
      this.isSpeaking = false;
      this.isTalbiyahAudioActive = true;
      soundManager.playTalbiyahAudio(
        () => {
          this.isTalbiyahAudioActive = false;
          this.updateAudioButtonState();
        },
        () => {
          this.isTalbiyahAudioActive = false;
          this.updateAudioButtonState();
        }
      );
      this.updateAudioButtonState();
    }
  }

  private updateAudioButtonState() {
    const audioBtn = this.container.querySelector('#btn-motawef-audio') as HTMLElement;
    if (!audioBtn) return;
    if (this.isTalbiyahAudioActive) {
      audioBtn.className =
        'w-10 h-10 rounded-full bg-amber-500 text-stone-950 shadow-md ring-2 ring-amber-400/70 flex items-center justify-center transition active:scale-95 cursor-pointer animate-pulse';
    } else {
      audioBtn.className =
        'w-10 h-10 rounded-full bg-white/90 border border-stone-200/90 shadow-sm flex items-center justify-center text-stone-800 hover:bg-stone-100 transition active:scale-95 cursor-pointer';
    }
  }

  private speakText(arabicText: string) {
    if (!('speechSynthesis' in window)) return;
    this.stopAudio();

    this.isSpeaking = true;
    const utterance = new SpeechSynthesisUtterance(arabicText);
    utterance.lang = 'ar-SA';
    utterance.rate = 0.85;

    utterance.onend = () => {
      this.isSpeaking = false;
      this.updateSpeechButtonStates();
    };
    utterance.onerror = () => {
      this.isSpeaking = false;
      this.updateSpeechButtonStates();
    };

    window.speechSynthesis.speak(utterance);
    this.updateSpeechButtonStates();
  }

  private updateSpeechButtonStates() {
    const btns = this.container.querySelectorAll('.btn-listen-dua');
    btns.forEach((b) => {
      const icon = b.querySelector('.speech-icon');
      const label = b.querySelector('.speech-label');
      if (this.isSpeaking) {
        if (icon) icon.textContent = '⏹️';
        if (label) label.textContent = 'Berhenti';
      } else {
        if (icon) icon.textContent = '🔊';
        if (label) label.textContent = 'Dengar';
      }
    });
  }

  // ==========================================
  // PHYSICAL STEP SENSOR (DEV MOTION)
  // ==========================================
  private startMotionSensor() {
    if (typeof window === 'undefined' || !('DeviceMotionEvent' in window)) return;
    this.motionListenerBound = (e: DeviceMotionEvent) => this.handleDeviceMotion(e);
    window.addEventListener('devicemotion', this.motionListenerBound, true);
  }

  private stopMotionSensor() {
    if (this.motionListenerBound && typeof window !== 'undefined') {
      window.removeEventListener('devicemotion', this.motionListenerBound, true);
      this.motionListenerBound = null;
    }
  }

  private handleDeviceMotion(e: DeviceMotionEvent) {
    if (!this.isTawafActive || this.tawafMode !== 'pedometer') return;

    let dynamicMag = 0;
    const acc = e.acceleration;
    const accWithG = e.accelerationIncludingGravity;

    // 1. Prefer pure linear acceleration (gravity already removed by browser/OS)
    if (acc && acc.x !== null && acc.y !== null && acc.z !== null) {
      dynamicMag = Math.hypot(acc.x, acc.y, acc.z);
    } 
    // 2. Fallback to acceleration including gravity with dynamic high-pass filter
    else if (accWithG && accWithG.x !== null && accWithG.y !== null && accWithG.z !== null) {
      const rawMag = Math.hypot(accWithG.x, accWithG.y, accWithG.z);
      // Low-pass filter for gravity baseline (~9.8 m/s²)
      this.gravityFilter = this.gravityFilter * 0.90 + rawMag * 0.10;
      dynamicMag = Math.abs(rawMag - this.gravityFilter);
    } else {
      return;
    }

    const now = Date.now();
    // Dynamic acceleration peak for typical walking footstep is 1.6 - 3.5 m/s²
    // Min interval 360ms prevents double-counting (~2.7 steps/sec max)
    if (dynamicMag > 1.6 && this.isStepArmed && (now - this.lastStepTimestamp > 360)) {
      this.lastStepTimestamp = now;
      this.isStepArmed = false; // Disarm until signal returns below valley threshold
      this.registerStep(1);
    } else if (dynamicMag < 0.5) {
      this.isStepArmed = true; // Re-arm for next step
    }
  }

  public registerStep(multiplier: number = 1) {
    if (!this.isTawafActive) return;
    this.stepCount += multiplier;
    this.lapStepCount += multiplier;

    // Advance orbit proportional to footsteps (~1.385 deg per step)
    this.advanceOrbit(this.DEG_PER_STEP * multiplier);
    this.updateStepCounterDisplay();

    // Subtle haptic tick every 10 steps to confirm pedometer is working
    if (this.stepCount % 10 === 0) {
      try {
        if ('vibrate' in navigator) navigator.vibrate(25);
      } catch {}
    }
  }

  private updateStepCounterDisplay() {
    const stepEl = this.container.querySelector('#motawef-step-count');
    if (stepEl) {
      if (this.tawafMode === 'pedometer') {
        stepEl.textContent = `${this.lapStepCount} / ${this.STEPS_PER_LAP} langkah (P.${this.currentLap})`;
      } else {
        stepEl.textContent = `${this.stepCount} langkah`;
      }
    }
  }

  // ==========================================
  // AUTO-WALK ENGINE (SIMULATION LOOP)
  // ==========================================
  private startAutoWalkLoop() {
    this.stopAutoWalkLoop();
    if (this.tawafMode !== 'auto') return;
    this.lastFrameTimestamp = performance.now();

    const loop = (timestamp: number) => {
      if (!this.isSectionOpen || this.tawafMode !== 'auto') return;

      const dt = Math.min((timestamp - this.lastFrameTimestamp) / 1000, 0.1); // clamp delta
      this.lastFrameTimestamp = timestamp;

      if (this.isTawafActive && this.isAutoWalkPlaying) {
        // Speed configurations (deg per second)
        let degPerSec = 0.9; // normal: ~400s full lap (realistic calm walking pace)
        if (this.autoWalkSpeed === 'raml') {
          degPerSec = 2.0; // raml (lari anak): ~180s full lap
        } else if (this.autoWalkSpeed === 'fast') {
          degPerSec = 5.0; // fast testing: ~72s full lap
        }

        this.advanceOrbit(degPerSec * dt);
      }

      this.autoWalkRafId = requestAnimationFrame(loop);
    };

    this.autoWalkRafId = requestAnimationFrame(loop);
  }

  private stopAutoWalkLoop() {
    if (this.autoWalkRafId !== null) {
      cancelAnimationFrame(this.autoWalkRafId);
      this.autoWalkRafId = null;
    }
  }

  // =======================================================
  // ORBIT MATHEMATICS & AUTOMATIC LAP COUNTING
  // =======================================================
  /**
   * Advance avatar along Track 3 (r=128) counter-clockwise.
   * Coordinate system:
   * Center: (180, 180)
   * 90 deg = Bottom corner (Hajar Aswad / Garisan Hijau)
   * Counter-clockwise: 90 -> 0 -> 270 -> 180 -> 90
   */
  public advanceOrbit(deltaDeg: number) {
    if (deltaDeg <= 0) return;

    // Moving counter-clockwise decreases the Cartesian SVG angle
    this.orbitAngle = ((this.orbitAngle - deltaDeg) % 360 + 360) % 360;

    // Cumulative degrees traveled from starting line at 90 deg:
    // (90 - orbitAngle + 360) % 360 smoothly increases 0 -> 90 -> 180 -> 270 -> 360
    const prevTraveled = this.traveledDegInLap;
    this.traveledDegInLap = ((90 - this.orbitAngle) % 360 + 360) % 360;

    if (this.traveledDegInLap > 180) {
      this.hasTraversedFar = true;
    }

    // Determine current Sector (0 to 4)
    let newSectorIdx = 0;
    if (this.traveledDegInLap < 25 || this.traveledDegInLap >= 345) {
      newSectorIdx = 0; // Hajar Aswad / Green line
    } else if (this.traveledDegInLap >= 25 && this.traveledDegInLap < 105) {
      newSectorIdx = 1; // Iraqi & Hijr Ismail
    } else if (this.traveledDegInLap >= 105 && this.traveledDegInLap < 195) {
      newSectorIdx = 2; // Outside Hijr Ismail (Pancuran Emas)
    } else if (this.traveledDegInLap >= 195 && this.traveledDegInLap < 280) {
      newSectorIdx = 3; // Menuju Yamani
    } else {
      newSectorIdx = 4; // Antara Yamani & Hajar Aswad (Rabbana Aatina)
    }

    if (newSectorIdx !== this.currentSectorIndex) {
      this.currentSectorIndex = newSectorIdx;
      this.visitedSectorsInLap.add(newSectorIdx);
      soundManager.playCheckpointSound();
      this.updateSectorTexts();
    } else {
      this.visitedSectorsInLap.add(newSectorIdx);
    }

    // Check Auto-Lap Completion:
    // When avatar has traversed the full orbit (visited all sectors) and crosses back across the green line at 90°
    const hasVisitedAllSectors =
      this.visitedSectorsInLap.has(1) &&
      this.visitedSectorsInLap.has(2) &&
      this.visitedSectorsInLap.has(3) &&
      this.visitedSectorsInLap.has(4);

    const crossedFinishLine =
      this.hasTraversedFar &&
      (this.traveledDegInLap >= 355 || (prevTraveled > 330 && this.traveledDegInLap < 20));

    if (hasVisitedAllSectors && crossedFinishLine) {
      this.onAutoLapCompleted();
      return;
    }

    this.updateMotawefVisuals();
  }

  /**
   * Automatically triggered when a full lap is completed
   * WITHOUT requiring the user to press "pusingan seterusnya"!
   */
  private onAutoLapCompleted() {
    this.hasTraversedFar = false;
    this.traveledDegInLap = 0;
    this.visitedSectorsInLap = new Set([0]);
    this.lapStepCount = 0;

    if (this.currentLap < 7) {
      this.currentLap++;
      this.selectedDuaLap = this.currentLap;
      soundManager.playIstilamTakbir();
      try {
        if ('vibrate' in navigator) navigator.vibrate([120, 60, 120]);
      } catch {}

      this.showIstilamBanner(
        `🏆 Pusingan ${this.currentLap - 1} Selesai! Bermula Pusingan ${this.currentLap} / 7 • Takbir Hajarul Aswad`
      );
      this.callbacks.onLapChanged?.(this.currentLap);
      this.updateLapDisplay();
      this.updateMotawefVisuals();
      this.updateStepCounterDisplay();
    } else {
      // All 7 Laps completed!
      this.isTawafActive = false;
      this.stopAutoWalkLoop();
      this.finishTawaf();
    }
  }

  /**
   * Action button handler: Start Tawaf in green zone
   * "masuk zone hijau player perlu tekan mula secara auto sistem lock kaabah (bawa ke bucu bawah)"
   */
  public startTawafAuto() {
    this.isTawafActive = true;
    this.orbitAngle = 90; // Ensure player is at green line (Hajar Aswad bottom corner)
    this.traveledDegInLap = 0;
    this.visitedSectorsInLap = new Set([0]);
    this.hasTraversedFar = false;
    this.lapStepCount = 0;

    // Request sensors permissions if available on mobile
    qiblaCompassService.requestPermission();
    if (typeof window !== 'undefined' && 'DeviceMotionEvent' in window) {
      const dme = (window as any).DeviceMotionEvent;
      if (dme && typeof dme.requestPermission === 'function') {
        dme.requestPermission().catch(() => {});
      }
    }

    // Istilam Takbir recitation & chime
    soundManager.playIstilamTakbir();
    try {
      if ('vibrate' in navigator) navigator.vibrate([100, 50, 100]);
    } catch {}

    this.showIstilamBanner('✋ ISTILAM HAJARUL ASWAD • "Bismillahi Allahu Akbar" • Pusingan 1 / 7 Bermula!');

    this.updateActiveActionButtons();
    this.updateMotawefVisuals();
    this.updateStepCounterDisplay();

    if (this.tawafMode === 'auto') {
      this.startAutoWalkLoop();
    }
  }

  public pauseResumeTawaf() {
    this.isAutoWalkPlaying = !this.isAutoWalkPlaying;
    this.updateActiveActionButtons();
  }

  public manualAdvanceSectorOrLap() {
    if (this.currentSectorIndex < TAWAF_SECTORS.length - 1) {
      this.currentSectorIndex++;
      this.orbitAngle = TAWAF_SECTORS[this.currentSectorIndex].angleDeg;
      this.traveledDegInLap = ((90 - this.orbitAngle) % 360 + 360) % 360;
      this.visitedSectorsInLap.add(this.currentSectorIndex);
      soundManager.playCheckpointSound();
      this.updateSectorTexts();
      this.updateMotawefVisuals();
    } else {
      // Completed full circle back at Hajar Aswad!
      this.nextLap();
    }
  }

  public nextLap() {
    if (this.currentLap < 7) {
      this.currentLap++;
      this.currentSectorIndex = 0;
      this.orbitAngle = 90;
      this.traveledDegInLap = 0;
      this.visitedSectorsInLap = new Set([0]);
      this.hasTraversedFar = false;
      this.lapStepCount = 0;
      this.selectedDuaLap = this.currentLap;
      this.showIstilamBanner(`✋ Pusingan ${this.currentLap} Bermula • Takbir Hajarul Aswad`);
      soundManager.playIstilamSound();
      try {
        if ('vibrate' in navigator) navigator.vibrate(80);
      } catch {}

      this.callbacks.onLapChanged?.(this.currentLap);
      this.updateLapDisplay();
      this.updateMotawefVisuals();
      this.updateStepCounterDisplay();
    } else {
      // 7 Laps Completed!
      this.finishTawaf();
    }
  }

  public prevLap() {
    if (this.currentLap > 1) {
      this.currentLap--;
      this.currentSectorIndex = 0;
      this.orbitAngle = 90;
      this.traveledDegInLap = 0;
      this.visitedSectorsInLap = new Set([0]);
      this.hasTraversedFar = false;
      this.lapStepCount = 0;
      this.selectedDuaLap = this.currentLap;
      this.callbacks.onLapChanged?.(this.currentLap);
      this.updateLapDisplay();
      this.updateMotawefVisuals();
      this.updateStepCounterDisplay();
    }
  }

  public resetLaps() {
    if (confirm('Adakah anda pasti ingin menetapkan semula kiraan ke Pusingan 1?')) {
      this.currentLap = 1;
      this.currentSectorIndex = 0;
      this.orbitAngle = 90;
      this.traveledDegInLap = 0;
      this.visitedSectorsInLap = new Set([0]);
      this.hasTraversedFar = false;
      this.isTawafActive = false;
      this.selectedDuaLap = 1;
      this.stepCount = 0;
      this.lapStepCount = 0;
      this.stopAutoWalkLoop();
      this.callbacks.onLapChanged?.(1);
      this.updateLapDisplay();
      this.updateActiveActionButtons();
      this.updateMotawefVisuals();
      this.updateStepCounterDisplay();
    }
  }

  private finishTawaf() {
    soundManager.playCompletionFanfare();
    confetti({
      particleCount: 140,
      spread: 85,
      origin: { y: 0.6 }
    });
    this.callbacks.onTawafFinished?.();
    this.showCompletionModal();
  }

  private showCompletionModal() {
    const existing = document.getElementById('modal-tawaf-completion');
    if (existing) existing.remove();

    const modal = document.createElement('div');
    modal.id = 'modal-tawaf-completion';
    modal.className =
      'fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md select-none font-sans overflow-hidden';
    modal.innerHTML = `
      <div class="relative w-full max-w-lg bg-white border-2 border-emerald-500 rounded-3xl shadow-2xl p-6 sm:p-7 text-stone-900 space-y-4">
        <div class="text-center space-y-2">
          <div class="w-16 h-16 rounded-3xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center text-3xl mx-auto shadow-md">
            🏆
          </div>
          <span class="text-xs uppercase font-extrabold tracking-widest text-emerald-600">ALHAMDULILLAH</span>
          <h2 class="text-2xl font-bold text-stone-900">7 Pusingan Tawaf Selesai!</h2>
          <p class="text-xs text-stone-600 leading-relaxed">
            Semoga ibadah tawaf anda diterima oleh Allah SWT sebagai amalan yang mabrur dan diampuni segala dosa.
          </p>
        </div>

        <div class="p-4 rounded-2xl bg-stone-50 border border-emerald-500/30 space-y-2.5 text-xs">
          <div class="font-bold text-emerald-800 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
            <span>✨</span>
            <span>Sunnah Seterusnya Selepas Tawaf:</span>
          </div>
          <div class="space-y-2 text-stone-700">
            <div class="flex items-start gap-2">
              <span class="text-emerald-600 font-bold shrink-0">1.</span>
              <span><strong>Tutup Semula Bahu Kanan</strong> bagi jemaah lelaki (selesai sunnah Idtiba').</span>
            </div>
            <div class="flex items-start gap-2">
              <span class="text-emerald-600 font-bold shrink-0">2.</span>
              <span><strong>Solat Sunat Tawaf 2 Rakaat</strong> di belakang Maqam Ibrahim (atau mana-mana kawasan Masjidil Haram).</span>
            </div>
            <div class="flex items-start gap-2">
              <span class="text-emerald-600 font-bold shrink-0">3.</span>
              <span><strong>Berdoa di Multazam</strong> (antara pintu Kaabah dan Hajarul Aswad).</span>
            </div>
            <div class="flex items-start gap-2">
              <span class="text-emerald-600 font-bold shrink-0">4.</span>
              <span><strong>Minum Air Zamzam</strong> dengan membaca Bismillah dan doa hajat, lalu sapukan ke wajah & kepala.</span>
            </div>
            <div class="flex items-start gap-2">
              <span class="text-emerald-600 font-bold shrink-0">5.</span>
              <span><strong>Menuju ke Bukit Safa</strong> untuk memulakan ibadah Sa'i 7 pusingan.</span>
            </div>
          </div>
        </div>

        <div class="space-y-2 pt-2">
          <button id="btn-completion-proceed-sai" class="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white font-extrabold text-sm shadow-lg shadow-emerald-900/30 active:scale-95 transition cursor-pointer text-center flex items-center justify-center gap-2">
            <span>🚶‍♂️</span>
            <span>Teruskan ke Ibadah Sa'i (Safa ➔ Marwah)</span>
          </button>
          
          <div class="flex items-center gap-2">
            <button id="btn-close-completion" class="flex-1 py-3 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs border border-stone-300 transition cursor-pointer text-center">
              Tutup & Sambung Ibadah
            </button>
            <button id="btn-completion-switch-game" class="flex-1 py-3 px-4 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 font-bold text-xs transition cursor-pointer text-center flex items-center justify-center gap-1.5">
              <span>🎮</span>
              <span>Simulasi 3D</span>
            </button>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(modal);
    modal.querySelector('#btn-completion-proceed-sai')?.addEventListener('click', () => {
      modal.remove();
      this.close();
      this.callbacks.onProceedToSai?.();
    });
    modal.querySelector('#btn-close-completion')?.addEventListener('click', () => modal.remove());
    modal.querySelector('#btn-completion-switch-game')?.addEventListener('click', () => {
      modal.remove();
      this.callbacks.onSwitchToGame?.();
    });
  }

  // ==========================================
  // RENDER MAIN SCREEN
  // ==========================================
  private render() {
    this.container.innerHTML = `
      <!-- TOP STATUS / AURA GRADIENT CONTAINER -->
      <div class="w-full flex-1 flex flex-col justify-between relative bg-gradient-to-b from-[#FDF3DE]/80 via-[#FAF8F5]/60 to-white min-h-screen">

        <!-- HEADER BAR: Back Button, Title 'Motawef', Headphone Audio Button -->
        <header class="w-full px-4 pt-4 pb-2 sm:px-6 sm:pt-6 flex items-center justify-between select-none z-30">
          <!-- Back button '<' -->
          <button id="btn-motawef-back" title="Kembali ke Simulasi 3D" class="w-10 h-10 rounded-full bg-white/95 border border-stone-200/90 shadow-sm flex items-center justify-center text-stone-800 hover:bg-stone-100 transition active:scale-95 cursor-pointer">
            <svg class="w-5 h-5 stroke-stone-800 stroke-2 fill-none" viewBox="0 0 24 24">
              <path d="M15 19l-7-7 7-7" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>

          <!-- Title: Motawef -->
          <div class="text-center">
            <h1 class="text-lg sm:text-xl font-bold text-stone-900 tracking-tight">Motawef</h1>
            <div class="text-[10px] text-stone-500 font-medium">Panduan Arah & Pusingan Kaabah</div>
          </div>

          <!-- Right Buttons: Switch to Real Sa'i & Headphone Audio -->
          <div class="flex items-center gap-1.5">
            <button id="btn-motawef-to-sai" title="Tukar ke Mod Real Sa'i (Safa ⇄ Marwah)" class="px-2.5 py-1.5 rounded-full bg-white/95 border border-stone-200/90 shadow-sm flex items-center gap-1 text-[11px] font-bold text-stone-700 hover:bg-stone-100 transition active:scale-95 cursor-pointer">
              <span>🚶‍♂️</span>
              <span>Sa'i</span>
            </button>

            <!-- Headphone / Audio Recitation Button -->
            <button id="btn-motawef-audio" title="Dengar Talbiyah & Zikir Audio" class="${
              this.isTalbiyahAudioActive
                ? 'w-10 h-10 rounded-full bg-amber-500 text-stone-950 shadow-md ring-2 ring-amber-400/70 flex items-center justify-center transition active:scale-95 cursor-pointer animate-pulse'
                : 'w-10 h-10 rounded-full bg-white/95 border border-stone-200/90 shadow-sm flex items-center justify-center text-stone-800 hover:bg-stone-100 transition active:scale-95 cursor-pointer'
            }">
              <svg class="w-5 h-5 stroke-current stroke-2 fill-none" viewBox="0 0 24 24">
                <path d="M3 18v-6a9 9 0 0 1 18 0v6M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
          </div>
        </header>

        <!-- SUB-NAVIGATION TABS (Clean pill switches) -->
        <nav class="px-4 py-1.5 flex items-center justify-center gap-1.5 overflow-x-auto scrollbar-none z-20">
          <button data-tab="compass_laps" class="nav-tab px-3 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
            this.activeTab === 'compass_laps' ? 'bg-amber-500 text-stone-950 shadow-sm' : 'bg-stone-200/80 text-stone-700 hover:bg-stone-300'
          }">
            <span>🧭</span>
            <span>Kompas Tawaf</span>
          </button>

          <button data-tab="duas" class="nav-tab px-3 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
            this.activeTab === 'duas' ? 'bg-amber-500 text-stone-950 shadow-sm' : 'bg-stone-200/80 text-stone-700 hover:bg-stone-300'
          }">
            <span>🤲</span>
            <span>Doa 7 Pusingan</span>
          </button>

          <button data-tab="rukun" class="nav-tab px-3 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
            this.activeTab === 'rukun' ? 'bg-amber-500 text-stone-950 shadow-sm' : 'bg-stone-200/80 text-stone-700 hover:bg-stone-300'
          }">
            <span>🕋</span>
            <span>4 Rukun Kaabah</span>
          </button>

          <button data-tab="fiqh" class="nav-tab px-3 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
            this.activeTab === 'fiqh' ? 'bg-amber-500 text-stone-950 shadow-sm' : 'bg-stone-200/80 text-stone-700 hover:bg-stone-300'
          }">
            <span>📜</span>
            <span>Fiqh Tawaf</span>
          </button>
        </nav>

        <!-- MAIN BODY CONTENT -->
        <main class="flex-1 w-full max-w-lg mx-auto px-4 py-2 flex flex-col justify-center">
          ${this.renderActiveTabContent()}
        </main>

        <!-- FOOTER -->
        <footer class="py-2.5 text-center text-stone-400 text-[10px]">
          Panduan Ibadah Umrah • Masjidil Haram Makkah (21.4225° N, 39.8262° E)
        </footer>
      </div>
    `;

    this.bindEvents();
    if (this.lastQiblaState) {
      this.updateCompassDisplay(this.lastQiblaState);
    }
    this.updateMotawefVisuals();
  }

  private renderActiveTabContent(): string {
    switch (this.activeTab) {
      case 'compass_laps':
        return this.renderMotawefCompassTab();
      case 'duas':
        return this.renderDuasTab();
      case 'rukun':
        return this.renderRukunTab();
      case 'fiqh':
        return this.renderFiqhTab();
      default:
        return '';
    }
  }

  // =======================================================
  // TAB 1: MOTAWEF KAABA RADAR (STATIC KAABAH & AUTO-TAWAF)
  // =======================================================
  private renderMotawefCompassTab(): string {
    const sector = TAWAF_SECTORS[this.currentSectorIndex] || TAWAF_SECTORS[0];
    const dua = TAWAF_DUAS[this.currentLap] || TAWAF_DUAS[1];

    // Compute avatar initial position along Track 3 (r=128)
    const rad = (this.orbitAngle * Math.PI) / 180;
    const avatarX = 180 + 128 * Math.cos(rad);
    const avatarY = 180 + 128 * Math.sin(rad);

    return `
      <div class="flex flex-col items-center justify-between space-y-3 py-1">
        
        <!-- TOP LOCATION & BEARING PILL -->
        <div class="flex items-center justify-between w-full px-2 text-xs">
          <div class="flex items-center gap-1.5 text-stone-600">
            <span class="text-sm">📍</span>
            <span id="qibla-location-label" class="font-semibold text-stone-800">Masjidil Haram, Makkah</span>
            <span id="qibla-distance-label" class="text-stone-500 font-mono text-[11px]">(Kiblat: 293°)</span>
          </div>

          <!-- Location Selector Dropdown & Calibrate Button -->
          <div class="flex items-center gap-1">
            <button id="btn-calibrate-shoulder" title="Tetapkan arah hadapan semasa sebagai rujukan dengan Kaabah tepat di bahu kiri" class="bg-amber-100 hover:bg-amber-200 text-amber-950 border border-amber-300 rounded-full px-2 py-0.5 text-[10px] font-bold cursor-pointer transition active:scale-95">
              🎯 Kunci Bahu Kiri
            </button>
            <select id="select-qibla-location" class="bg-white border border-stone-200 rounded-full px-2 py-0.5 text-[11px] text-stone-700 shadow-sm cursor-pointer focus:outline-none">
              <option value="makkah">🕋 Masjidil Haram</option>
              <option value="gps">📍 GPS Semasa</option>
              ${PRESET_LOCATIONS.filter((p) => p.id !== 'makkah').map((p) => `<option value="${p.id}">${p.name}</option>`).join('')}
            </select>
          </div>
        </div>

        <!-- ALIGNMENT STATUS PILL (TAWAF BAHU KIRI COMPASS) -->
        <div id="qibla-align-banner" class="w-full text-center py-2 px-3 rounded-2xl bg-stone-100/90 border border-stone-200/80 text-xs font-semibold text-stone-700 transition-all flex flex-col items-center justify-center gap-0.5">
          <span id="qibla-align-text">Pegang telefon tegak menghadap arah berjalan • Kaabah hendaklah sentiasa di sebelah bahu kiri anda</span>
        </div>

        <!-- LOCK KAABAH & STATIC SYSTEM STATUS PILL -->
        <div class="w-full flex items-center justify-between px-3 py-1.5 rounded-xl bg-emerald-50/90 border border-emerald-300 text-[11px] text-emerald-950 font-semibold shadow-xs">
          <div class="flex items-center gap-1.5">
            <span class="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Kaabah Statik di Pusat • Bahu Kiri Jemaah Menghadap Kaabah</span>
          </div>
          <span class="text-emerald-800 text-[10px] font-mono font-extrabold bg-white px-2 py-0.5 rounded-full border border-emerald-200">90° ke Kiri</span>
        </div>

        <!-- ======================================================== -->
        <!-- THE MOTAWEF KAABA RADAR (KAABAH COMPLETELY STATIC)        -->
        <!-- ======================================================== -->
        <div class="relative w-[310px] h-[310px] sm:w-[350px] sm:h-[350px] flex items-center justify-center my-1 select-none">
          
          <svg id="motawef-compass-svg" viewBox="0 0 360 360" class="w-full h-full overflow-visible">
            <defs>
              <!-- Soft realistic drop shadow for the Kaaba -->
              <filter id="motawef-kaaba-shadow" x="-50%" y="-50%" width="200%" height="200%">
                <feDropShadow dx="-8" dy="14" stdDeviation="14" flood-color="#000000" flood-opacity="0.30" />
              </filter>

              <!-- Vision Beam radial gradient for the yellow avatar -->
              <radialGradient id="motawef-vision-beam" cx="50%" cy="0%" r="100%" fx="50%" fy="0%">
                <stop offset="0%" stop-color="#FACC15" stop-opacity="0.55" />
                <stop offset="45%" stop-color="#FACC15" stop-opacity="0.25" />
                <stop offset="100%" stop-color="#FACC15" stop-opacity="0" />
              </radialGradient>

              <!-- Green Glow Filter for Hajar Aswad Line -->
              <filter id="green-glow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3.5" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            <!-- 4 CONCENTRIC DASHED CIRCLES (Mataf Tracks) -->
            <!-- Track 4 (Outer) -->
            <circle cx="180" cy="180" r="156" fill="none" stroke="#E5E7EB" stroke-width="1.5" stroke-dasharray="4 6" />
            <!-- Track 3 (Pilgrim Track, r=128) -->
            <circle cx="180" cy="180" r="128" fill="none" stroke="#D1D5DB" stroke-width="1.8" stroke-dasharray="4 6" />
            <!-- Track 2 -->
            <circle cx="180" cy="180" r="98" fill="none" stroke="#E5E7EB" stroke-width="1.5" stroke-dasharray="4 6" />
            <!-- Track 1 (Inner) -->
            <circle cx="180" cy="180" r="68" fill="none" stroke="#E5E7EB" stroke-width="1.5" stroke-dasharray="4 6" />

            <!-- AMBER PROGRESS ARC (Progression along left side) -->
            <path id="amber-reference-arc" d="M 82 248 A 128 128 0 0 1 82 112" fill="none" stroke="#F59E0B" stroke-width="2.2" stroke-linecap="round" stroke-dasharray="3 3" opacity="0.6" />

            <!-- DYNAMIC ACTIVE TAWAF TRAIL ARC (Traces user progress from green line CCW) -->
            <path id="tawaf-trail-arc" d="" fill="none" stroke="#10B981" stroke-width="3.5" stroke-linecap="round" opacity="0.9" />

            <!-- GREEN DASHED STARTING SEGMENT (Garisan Lampu Hijau Hajar Aswad at bottom: angle 70° to 110°) -->
            <g id="green-zone-group">
              <!-- Glow underlayer -->
              <path id="track-green-glow" d="M 136 304 A 128 128 0 0 0 224 304" fill="none" stroke="#10B981" stroke-width="7" stroke-linecap="round" opacity="0.4" filter="url(#green-glow)" />
              <!-- Green Line -->
              <path id="track-green-segment" d="M 136 304 A 128 128 0 0 0 224 304" fill="none" stroke="#10B981" stroke-width="3.5" stroke-dasharray="5 4" stroke-linecap="round" />
              <!-- Label -->
              <text x="180" y="325" text-anchor="middle" font-size="8.5" font-weight="extrabold" fill="#047857" letter-spacing="0.5">GARISAN HAJAR ASWAD (MULA)</text>
            </g>

            <!-- ======================================================== -->
            <!-- THE HOLY KAABA (PERMANENTLY STATIC & LOCKED AT 45 DEG)    -->
            <!-- Bucu Hajarul Aswad is permanently at Bottom Corner (180, 238) -->
            <!-- ======================================================== -->
            <g id="motawef-kaaba-group">
              <!-- Rotated Black Cube / Kaaba Body with soft drop shadow -->
              <rect x="139" y="139" width="82" height="82" rx="4" transform="rotate(45 180 180)" fill="#18181B" filter="url(#motawef-kaaba-shadow)" />

              <!-- HAJARUL ASWAD CORNER (Bottom Corner at (180, 238)): White curved corner quadrant -->
              <path d="M 166 224 L 180 238 L 194 224 A 19 19 0 0 1 166 224 Z" fill="#FFFFFF" />
              <!-- Dark Silver casing of Hajarul Aswad -->
              <ellipse cx="180" cy="233" rx="3.5" ry="4" fill="#18181B" stroke="#D1D5DB" stroke-width="1.2" />

              <!-- RUKUN YAMANI CORNER (Left Corner at (122, 180)): Amber/Orange diamond pip -->
              <rect x="127" y="176" width="8" height="8" transform="rotate(45 131 180)" fill="#F59E0B" rx="1" />

              <!-- GOLDEN DOOR OF KAABAH (Bab al-Ka'bah) - East face between Hajar Aswad and Iraqi corner -->
              <rect x="187" y="196" width="5.5" height="12" fill="#F59E0B" rx="1" transform="rotate(45 189 202)" stroke="#B45309" stroke-width="0.8" />

              <!-- HIJR ISMAIL / HATEEM (Top-Right Crescent Wall with 3 golden dots) -->
              <!-- Base crescent wall (white with subtle light grey border) -->
              <path d="M 194 135 A 28 28 0 0 1 226 167" fill="none" stroke="#E5E7EB" stroke-width="11" stroke-linecap="round" />
              <path d="M 194 135 A 28 28 0 0 1 226 167" fill="none" stroke="#FFFFFF" stroke-width="8" stroke-linecap="round" />
              
              <!-- 3 Golden/Amber Dots (Lanterns/Pillars on Hijr Ismail) -->
              <circle cx="198" cy="131" r="3" fill="#F59E0B" />
              <circle cx="218" cy="136" r="3.2" fill="#F59E0B" />
              <circle cx="231" cy="156" r="3" fill="#F59E0B" />

              <!-- MAQAM IBRAHIM KIOSK (Facing Kaabah Door) -->
              <circle cx="216" cy="216" r="4" fill="#F59E0B" stroke="#78350F" stroke-width="1" />
              <text x="225" y="220" font-size="7" font-weight="bold" fill="#78350F">Maqam Ibrahim</text>
            </g>

            <!-- SUBTLE OUTER RIM COMPASS NEEDLE (Points to North / Utara - Kaabah stays static at center!) -->
            <g id="outer-rim-needle" transform="rotate(0 180 180)" class="transition-transform duration-150 ease-out" opacity="0.85">
              <polygon points="180,10 174,24 186,24" fill="#DC2626" />
              <text x="180" y="34" text-anchor="middle" font-size="8" font-weight="extrabold" fill="#DC2626">U</text>
            </g>

            <!-- ======================================================= -->
            <!-- PILGRIM AVATAR (YELLOW CIRCLE WITH PERSON ICON & BEAM)  -->
            <!-- ======================================================= -->
            <g id="motawef-avatar-group" transform="translate(${avatarX.toFixed(1)}, ${avatarY.toFixed(1)})" class="transition-all duration-100 ease-out">
              
              <!-- Forward Flashlight Vision Cone (Points tangent forward along CCW Tawaf path) -->
              <g id="avatar-vision-cone" transform="rotate(${(this.orbitAngle - 90).toFixed(1)})">
                <!-- Forward vision beam along +X axis (tangent forward) -->
                <path d="M 0 0 L 52 -22 A 55 55 0 0 1 52 22 Z" fill="url(#motawef-vision-beam)" />
                <!-- Walking arrow along +X -->
                <path d="M 18 0 L 32 0 M 26 -4 L 32 0 L 26 4" stroke="#854D0E" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                <!-- Left shoulder line & arrow pointing inwards to Kaabah at center (-Y) -->
                <line x1="0" y1="-8" x2="0" y2="-28" stroke="#10B981" stroke-width="2" stroke-dasharray="2 2" />
                <polygon points="0,-32 -3,-26 3,-26" fill="#10B981" />
                <circle cx="0" cy="-10" r="3.2" fill="#10B981" stroke="#064E3B" stroke-width="0.8" />
                <text x="0" y="-35" text-anchor="middle" font-size="6.5" font-weight="extrabold" fill="#047857">BAHU KIRI</text>
              </g>

              <!-- Solid Yellow Avatar Badge Circle -->
              <circle cx="0" cy="0" r="16" fill="#FACC15" stroke="#EAB308" stroke-width="2" class="shadow-lg" />

              <!-- Person Icon inside Yellow Circle (Head & Shoulders Outline) -->
              <circle cx="0" cy="-4" r="3.8" fill="none" stroke="#18181B" stroke-width="1.8" />
              <path d="M -7 7 A 7 7 0 0 1 7 7" fill="none" stroke="#18181B" stroke-width="1.8" stroke-linecap="round" />
            </g>

          </svg>
        </div>

        <!-- ======================================================== -->
        <!-- LOWER TEXT & DYNAMIC ACTION CONTROLS                     -->
        <!-- ======================================================== -->
        <div class="flex flex-col items-center text-center space-y-2.5 w-full px-2">
          
          <!-- Heading Text (e.g. "Zon Garisan Hijau (Hajar Aswad)") -->
          <h2 id="motawef-heading-text" class="text-lg sm:text-xl font-bold text-stone-900 leading-snug max-w-sm">
            ${sector.title}
          </h2>

          <!-- Subtitle Text -->
          <p id="motawef-subtitle-text" class="text-stone-600 text-xs sm:text-sm font-medium max-w-sm">
            ${sector.subtitle}
          </p>

          <!-- DYNAMIC ACTION AREA -->
          <div id="motawef-action-container" class="w-full flex flex-col items-center justify-center my-1">
            ${this.renderActionButtons()}
          </div>
        </div>

        <!-- ======================================================== -->
        <!-- COMPACT TAWAF 7-LAP TRACKER & QUICK ACTIONS              -->
        <!-- ======================================================== -->
        <div class="w-full bg-white rounded-3xl p-4 sm:p-5 border border-stone-200/90 shadow-sm space-y-3 mt-1">
          
          <!-- Top Row: Mode switch & Lap counter -->
          <div class="flex flex-col sm:flex-row sm:items-center justify-between pb-2 border-b border-stone-100 gap-2">
            <!-- Mode Switch Pills -->
            <div class="flex items-center gap-1 bg-stone-100 p-1 rounded-full text-xs">
              <button id="btn-mode-pedometer" class="px-2.5 py-1 rounded-full font-bold transition cursor-pointer ${
                this.tawafMode === 'pedometer'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }">
                <span>👟 Langkah</span>
              </button>
              <button id="btn-mode-auto" class="px-2.5 py-1 rounded-full font-bold transition cursor-pointer ${
                this.tawafMode === 'auto'
                  ? 'bg-amber-500 text-stone-950 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }">
                <span>⚡ Simulasi</span>
              </button>
              <button id="btn-mode-manual" class="px-2.5 py-1 rounded-full font-bold transition cursor-pointer ${
                this.tawafMode === 'manual'
                  ? 'bg-stone-800 text-white shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }">
                <span>👆 Manual</span>
              </button>
            </div>

            <!-- Steps & Istilam Button -->
            <div class="flex items-center gap-1.5 justify-end">
              <div id="motawef-step-badge" class="text-[11px] font-semibold text-stone-600 bg-stone-50 px-2.5 py-1 rounded-full border border-stone-200">
                <span id="motawef-step-count">${
                  this.tawafMode === 'pedometer'
                    ? `${this.lapStepCount} / ${this.STEPS_PER_LAP} langkah (P.${this.currentLap})`
                    : `${this.stepCount} langkah`
                }</span>
              </div>
              <button id="btn-istilam-action" class="px-3 py-1 rounded-full bg-amber-500/20 hover:bg-amber-500/30 text-amber-900 border border-amber-500/40 text-xs font-bold transition active:scale-95 cursor-pointer flex items-center gap-1">
                <span>✋</span>
                <span>Istilam</span>
              </button>
            </div>
          </div>

          <!-- Lap Title Header -->
          <div class="flex items-center justify-between pt-0.5">
            <span class="text-xs uppercase font-extrabold tracking-wider text-amber-600">Pusingan Tawaf</span>
            <span id="motawef-lap-counter-text" class="text-base font-bold text-stone-900">Pusingan ${this.currentLap} / 7</span>
          </div>

          <!-- 7-Lap Step Dots -->
          <div id="motawef-lap-dots" class="grid grid-cols-7 gap-1.5">
            ${[1, 2, 3, 4, 5, 6, 7]
              .map((lap) => {
                const isDone = lap < this.currentLap;
                const isCurrent = lap === this.currentLap;
                return `
                  <button data-select-lap="${lap}" class="btn-lap-dot flex flex-col items-center justify-center p-2 rounded-xl border transition cursor-pointer ${
                    isDone
                      ? 'bg-emerald-50 border-emerald-500 text-emerald-700'
                      : isCurrent
                      ? 'bg-amber-500 text-stone-950 font-extrabold border-amber-600 shadow-sm scale-105'
                      : 'bg-stone-50 border-stone-200 text-stone-400 hover:border-stone-300'
                  }">
                    <span class="text-xs font-bold">${isDone ? '✓' : lap}</span>
                  </button>
                `;
              })
              .join('')}
          </div>

          <!-- Quick Dua Preview for active lap -->
          <div id="motawef-dua-preview-box" class="p-3 rounded-2xl bg-amber-50/60 border border-amber-200/70 text-xs space-y-1">
            <div class="flex items-center justify-between text-[11px] font-bold text-amber-900">
              <span id="motawef-dua-label">🤲 Doa Pusingan ${this.currentLap}:</span>
              <button class="btn-listen-dua text-amber-700 hover:text-amber-900 font-semibold cursor-pointer flex items-center gap-1" data-arabic="${encodeURIComponent(dua.arabic)}">
                <span class="speech-icon">🔊</span>
                <span class="speech-label">Dengar</span>
              </button>
            </div>
            <p id="motawef-dua-arabic" class="font-arabic text-sm text-stone-900 leading-relaxed text-right" dir="rtl">${dua.arabic}</p>
            <p id="motawef-dua-translit" class="text-[11px] text-stone-600 italic truncate font-sans">"${dua.transliteration}"</p>
          </div>

          <!-- Speed Controls for Auto Mode -->
          ${
            this.tawafMode === 'auto'
              ? `
              <div class="pt-1 flex items-center justify-between text-xs text-stone-600">
                <span class="text-[11px] font-bold text-stone-500">Kelajuan Auto:</span>
                <div class="flex items-center gap-1">
                  <button data-speed="normal" class="btn-speed-select px-2.5 py-1 rounded-lg text-[11px] font-bold transition cursor-pointer ${
                    this.autoWalkSpeed === 'normal'
                      ? 'bg-amber-500 text-stone-950 shadow-xs'
                      : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                  }">
                    🚶 Santai
                  </button>
                  <button data-speed="raml" class="btn-speed-select px-2.5 py-1 rounded-lg text-[11px] font-bold transition cursor-pointer ${
                    this.autoWalkSpeed === 'raml'
                      ? 'bg-amber-500 text-stone-950 shadow-xs'
                      : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                  }">
                    🏃 Raml
                  </button>
                  <button data-speed="fast" class="btn-speed-select px-2.5 py-1 rounded-lg text-[11px] font-bold transition cursor-pointer ${
                    this.autoWalkSpeed === 'fast'
                      ? 'bg-amber-500 text-stone-950 shadow-xs'
                      : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                  }">
                    ⚡ Pantas
                  </button>
                </div>
              </div>
            `
              : ''
          }

          <!-- Next Lap, Prev Lap & Reset Buttons -->
          <div class="grid grid-cols-3 gap-2 pt-1 text-xs font-bold">
            <button id="btn-prev-lap" class="py-2.5 px-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 border border-stone-200 transition cursor-pointer flex items-center justify-center gap-1">
              <span>↩️</span>
              <span>Undur</span>
            </button>
            <button id="btn-reset-laps" class="py-2.5 px-2 rounded-xl bg-stone-100 hover:bg-rose-50 text-stone-500 hover:text-rose-600 border border-stone-200 transition cursor-pointer flex items-center justify-center gap-1">
              <span>🔄</span>
              <span>Set Semula</span>
            </button>
            <button id="btn-next-lap" class="py-2.5 px-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-white transition cursor-pointer flex items-center justify-center gap-1 shadow-sm">
              <span>✓</span>
              <span>${this.currentLap < 7 ? `P.${this.currentLap} Selesai` : 'Tamat 🏆'}</span>
            </button>
          </div>

          <!-- Manual / Testing Heading Slider (for desktop testing) -->
          <div class="pt-2 border-t border-stone-100 text-[11px] text-stone-400 space-y-1">
            <div class="flex items-center justify-between">
              <span>🎛️ Putar Arah Manual:</span>
              <span id="manual-heading-label">0°</span>
            </div>
            <div class="flex items-center gap-2">
              <button id="btn-rot-left-15" class="px-2 py-1 rounded bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold">↺ -15°</button>
              <input id="slider-manual-heading" type="range" min="0" max="360" value="0" class="flex-1 accent-amber-500 h-1.5 bg-stone-200 rounded cursor-pointer" />
              <button id="btn-rot-right-15" class="px-2 py-1 rounded bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold">↻ +15°</button>
            </div>
          </div>

        </div>

      </div>
    `;
  }

  /**
   * Render dynamic action buttons depending on whether Tawaf has started,
   * whether player is in green zone, and whether auto or manual mode is active.
   */
  private renderActionButtons(): string {
    if (!this.isTawafActive) {
      const modeLabel =
        this.tawafMode === 'pedometer'
          ? 'LANGKAH SEBENAR'
          : this.tawafMode === 'auto'
          ? 'SIMULASI AUTO'
          : 'MANUAL';
      return `
        <div class="flex flex-col items-center space-y-2 w-full max-w-sm">
          <button id="btn-start-auto-tawaf" class="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white font-extrabold text-sm shadow-xl shadow-emerald-800/25 active:scale-95 transition cursor-pointer flex items-center justify-center gap-2 animate-pulse">
            <span>▶️</span>
            <span>MULA TAWAF (${modeLabel})</span>
          </button>
          <p class="text-[11px] text-stone-500 text-center">
            ${
              this.tawafMode === 'pedometer'
                ? 'Kaabah di bahu kiri • Bergerak mengikut langkah kaki sebenar anda'
                : this.tawafMode === 'auto'
                ? 'Tekan untuk demonstrasi simulasi Tawaf secara automatik'
                : 'Kawal pusingan secara manual mengikut sektor'
            }
          </p>
        </div>
      `;
    }

    if (this.tawafMode === 'pedometer') {
      return `
        <div class="flex flex-col items-center space-y-2 w-full max-w-sm">
          <div class="flex items-center gap-2 w-full justify-center">
            <!-- +1 Step -->
            <button id="btn-step-walk-1" class="flex-1 py-2.5 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs shadow-sm active:scale-95 transition cursor-pointer flex items-center justify-center gap-1">
              <span>👣</span>
              <span>+1 Langkah</span>
            </button>
            <!-- +10 Steps -->
            <button id="btn-step-walk-10" class="py-2.5 px-3 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-xs border border-stone-300 active:scale-95 transition cursor-pointer flex items-center justify-center gap-1">
              <span>⚡</span>
              <span>+10</span>
            </button>
            <!-- Pedometer Status Indicator -->
            <div class="px-3 py-2 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-300 text-xs font-bold flex items-center gap-1.5 shrink-0">
              <span class="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
              <span>Pedometer Aktif</span>
            </div>
          </div>
          <div class="text-[10px] text-stone-500 flex items-center gap-1">
            <span>💡</span>
            <span>Sensor mengesan hayunan langkah kaki. Setiap ~260 langkah = 1 pusingan.</span>
          </div>
        </div>
      `;
    } else if (this.tawafMode === 'auto') {
      return `
        <div class="flex items-center gap-2.5">
          <!-- Play / Pause auto walk -->
          <button id="btn-toggle-walk" class="py-2.5 px-4 rounded-xl border border-stone-300 bg-white shadow-sm hover:bg-stone-50 active:scale-95 transition cursor-pointer flex items-center gap-1.5 text-xs font-bold text-stone-800">
            <span>${this.isAutoWalkPlaying ? '⏸️ Jeda' : '▶️ Sambung'}</span>
          </button>

          <!-- Single Step button -->
          <button id="btn-step-walk-1" class="py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 shadow-md active:scale-95 transition cursor-pointer flex items-center gap-1.5 text-xs font-extrabold">
            <span>👣</span>
            <span>+1 Langkah</span>
          </button>

          <!-- Status Indicator -->
          <div class="px-3 py-2 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-300 text-xs font-bold flex items-center gap-1">
            <span class="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
            <span>Simulasi Auto</span>
          </div>
        </div>
      `;
    } else {
      // Manual Mode
      return `
        <div class="flex flex-col items-center space-y-1">
          <button id="btn-motawef-action" title="Bergerak ke sektor seterusnya / Teruskan Tawaf" class="w-14 h-14 rounded-full border-2 border-stone-900 bg-white shadow-md flex items-center justify-center hover:bg-stone-50 active:scale-95 transition cursor-pointer group">
            <svg viewBox="0 0 24 24" class="w-6 h-6 stroke-stone-900 stroke-[2.5] fill-none group-hover:scale-110 transition-transform">
              <path d="M7 17L17 7M17 7H8M17 7V16" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
          <span class="text-[10px] text-stone-500 font-semibold">Tekan untuk mara ke sektor seterusnya</span>
        </div>
      `;
    }
  }

  private updateActiveActionButtons() {
    const actionContainer = this.container.querySelector('#motawef-action-container');
    if (actionContainer) {
      actionContainer.innerHTML = this.renderActionButtons();
      this.bindActionEvents();
    }
  }

  // ==========================================
  // UPDATE VISUALS (SVG AVATAR, TRAIL, SECTORS)
  // ==========================================
  private updateMotawefVisuals() {
    if (!this.isSectionOpen || this.activeTab !== 'compass_laps') return;

    // 1. Calculate avatar position along Track 3 (r = 128)
    const rad = (this.orbitAngle * Math.PI) / 180;
    const avatarX = 180 + 128 * Math.cos(rad);
    const avatarY = 180 + 128 * Math.sin(rad);

    const avatarGroup = this.container.querySelector('#motawef-avatar-group') as SVGGraphicsElement;
    const visionCone = this.container.querySelector('#avatar-vision-cone') as SVGGraphicsElement;

    if (avatarGroup) {
      avatarGroup.setAttribute('transform', `translate(${avatarX.toFixed(1)}, ${avatarY.toFixed(1)})`);
    }

    if (visionCone) {
      visionCone.setAttribute('transform', `rotate(${(this.orbitAngle - 90).toFixed(1)})`);
    }

    // 2. Draw dynamic Tawaf progress trail arc along Track 3 from 90 deg (bottom) to avatar position
    const trailArc = this.container.querySelector('#tawaf-trail-arc') as SVGPathElement;
    if (trailArc) {
      if (this.traveledDegInLap > 1) {
        const startX = 180;
        const startY = 308; // 180 + 128 = 308 (bottom start line)
        const largeArcFlag = this.traveledDegInLap > 180 ? 1 : 0;
        // sweepFlag = 0 for counter-clockwise in SVG coordinates
        trailArc.setAttribute(
          'd',
          `M ${startX} ${startY} A 128 128 0 ${largeArcFlag} 0 ${avatarX.toFixed(1)} ${avatarY.toFixed(1)}`
        );
      } else {
        trailArc.setAttribute('d', '');
      }
    }

    // 3. Highlight Green Zone segment when player is at bottom (Garisan Hajar Aswad)
    const greenGlow = this.container.querySelector('#track-green-glow') as SVGPathElement;
    const isAtGreenZone = this.orbitAngle >= 70 && this.orbitAngle <= 110;
    if (greenGlow) {
      greenGlow.setAttribute('opacity', isAtGreenZone ? '0.85' : '0.35');
    }
  }

  private updateSectorTexts() {
    const sector = TAWAF_SECTORS[this.currentSectorIndex] || TAWAF_SECTORS[0];

    const headingEl = this.container.querySelector('#motawef-heading-text');
    if (headingEl) headingEl.textContent = sector.title;

    const subEl = this.container.querySelector('#motawef-subtitle-text');
    if (subEl) subEl.textContent = sector.subtitle;
  }

  private updateLapDisplay() {
    // 1. Lap Counter Header
    const lapHeader = this.container.querySelector('#motawef-lap-counter-text');
    if (lapHeader) {
      lapHeader.textContent = `Pusingan ${this.currentLap} / 7`;
    }

    // 2. 7-Lap Dots
    const dotsContainer = this.container.querySelector('#motawef-lap-dots');
    if (dotsContainer) {
      dotsContainer.innerHTML = [1, 2, 3, 4, 5, 6, 7]
        .map((lap) => {
          const isDone = lap < this.currentLap;
          const isCurrent = lap === this.currentLap;
          return `
            <button data-select-lap="${lap}" class="btn-lap-dot flex flex-col items-center justify-center p-2 rounded-xl border transition cursor-pointer ${
              isDone
                ? 'bg-emerald-50 border-emerald-500 text-emerald-700'
                : isCurrent
                ? 'bg-amber-500 text-stone-950 font-extrabold border-amber-600 shadow-sm scale-105'
                : 'bg-stone-50 border-stone-200 text-stone-400 hover:border-stone-300'
            }">
              <span class="text-xs font-bold">${isDone ? '✓' : lap}</span>
            </button>
          `;
        })
        .join('');

      // re-bind dot clicks
      dotsContainer.querySelectorAll('.btn-lap-dot').forEach((btn) => {
        btn.addEventListener('click', () => {
          const l = parseInt((btn as HTMLElement).dataset.selectLap || '1', 10);
          this.setLap(l);
        });
      });
    }

    // 3. Dua preview box
    const dua = TAWAF_DUAS[this.currentLap] || TAWAF_DUAS[1];
    const duaLabel = this.container.querySelector('#motawef-dua-label');
    if (duaLabel) duaLabel.textContent = `🤲 Doa Pusingan ${this.currentLap}:`;

    const duaArabic = this.container.querySelector('#motawef-dua-arabic');
    if (duaArabic) duaArabic.textContent = dua.arabic;

    const duaTranslit = this.container.querySelector('#motawef-dua-translit');
    if (duaTranslit) duaTranslit.textContent = `"${dua.transliteration}"`;

    const nextBtn = this.container.querySelector('#btn-next-lap');
    if (nextBtn) {
      const span = nextBtn.querySelector('span:last-child');
      if (span) {
        span.textContent = this.currentLap < 7 ? `P.${this.currentLap} Selesai` : 'Tamat 🏆';
      }
    }
  }

  // ==========================================
  // TAB 2: DUAS
  // ==========================================
  private renderDuasTab(): string {
    const dua = TAWAF_DUAS[this.selectedDuaLap] || TAWAF_DUAS[1];

    return `
      <div class="space-y-4 py-2">
        <div class="text-center space-y-1">
          <h2 class="text-lg sm:text-xl font-bold text-stone-900">Senarai Doa 7 Pusingan Tawaf</h2>
          <p class="text-xs text-stone-500">Pilih pusingan di bawah untuk melihat teks Arab, rumi, dan terjemahan penuh.</p>
        </div>

        <!-- Lap Pill Selector -->
        <div class="flex items-center justify-center gap-1.5 flex-wrap">
          ${[1, 2, 3, 4, 5, 6, 7]
            .map(
              (lap) => `
              <button data-dua-lap="${lap}" class="btn-dua-lap-pill px-3 py-1.5 rounded-full text-xs font-bold transition cursor-pointer ${
                this.selectedDuaLap === lap
                  ? 'bg-amber-500 text-stone-950 shadow-sm font-extrabold'
                  : 'bg-white border border-stone-200 text-stone-700 hover:bg-stone-50'
              }">
                Pusingan ${lap}
              </button>
            `
            )
            .join('')}
        </div>

        <!-- Selected Dua Detail Card -->
        <div class="bg-white rounded-3xl p-5 sm:p-6 border border-stone-200/90 shadow-sm space-y-4">
          <div class="flex items-center justify-between pb-3 border-b border-stone-100">
            <div>
              <span class="text-[10px] uppercase font-bold text-amber-600">PUSINGAN KE-${this.selectedDuaLap}</span>
              <h3 class="text-base sm:text-lg font-bold text-stone-900">${dua.title}</h3>
            </div>
            <button class="btn-listen-dua px-3.5 py-1.5 rounded-full bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold text-xs flex items-center gap-1.5 border border-amber-300 transition cursor-pointer" data-arabic="${encodeURIComponent(dua.arabic)}">
              <span class="speech-icon">🔊</span>
              <span class="speech-label">Dengar</span>
            </button>
          </div>

          <!-- Arabic -->
          <div class="bg-amber-50/40 p-5 rounded-2xl border border-amber-200/60 text-right">
            <p class="font-arabic text-2xl sm:text-3xl text-stone-900 leading-loose" dir="rtl">
              ${dua.arabic}
            </p>
          </div>

          <!-- Transliteration -->
          <div class="p-3.5 rounded-2xl bg-stone-50 border border-stone-200/70 text-xs">
            <div class="text-[10px] uppercase font-bold text-emerald-700 mb-1">Sebutan Rumi:</div>
            <p class="italic text-stone-700 leading-relaxed font-sans">${dua.transliteration}</p>
          </div>

          <!-- Translation -->
          <div class="p-3.5 rounded-2xl bg-stone-50 border border-stone-200/70 text-xs">
            <div class="text-[10px] uppercase font-bold text-amber-700 mb-1">Terjemahan Bahasa Melayu:</div>
            <p class="text-stone-800 leading-relaxed">${dua.translation}</p>
          </div>

          <!-- Sunnah & Fiqh Note -->
          <div class="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200 text-xs text-amber-900 flex items-start gap-2">
            <span class="text-base shrink-0">💡</span>
            <div class="leading-relaxed">
              <strong>Nota Sunnah:</strong> ${dua.sunnahNote || 'Kekalkan Kaabah di sebelah kiri bahu anda.'}
            </div>
          </div>
        </div>
      </div>
    `;
  }

  // ==========================================
  // TAB 3: 4 RUKUN KAABAH
  // ==========================================
  private renderRukunTab(): string {
    const RUKUN_LIST = [
      {
        id: 0,
        title: 'Hajarul Aswad (Garisan Mula & Tamat)',
        badge: 'Rukun 1',
        icon: '🕋',
        color: 'border-emerald-500',
        subtitle: 'Bucu timur Kaabah, permulaan & pengakhiran setiap pusingan.',
        fadhilat: 'Batu dari syurga. Disunatkan Istilam (mengangkat tangan kanan sambil melafazkan Bismillahi Allahu Akbar).',
        arabicDua: 'بِسْمِ اللَّهِ، اللَّهُ أَكْبَرُ، اللَّهُمَّ إِيمَانًا بِكَ، وَتَصْدِيقًا بِكِتَابِكَ، وَوَفَاءً بِعَهْدِكَ، وَاتِّبَاعًا لِسُنَّةِ نَبِيِّكَ مُحَمَّدٍ ﷺ',
        transliteration: "Bismillahi Allahu Akbar, Allahumma iimaanam bika, wa tashdiiqam bikitaabika, wa wafaa-am bi'ahdika, wattibaa'al lisunnati Nabiyyika Muhammadin SAW.",
        translation: 'Dengan nama Allah, Allah Maha Besar. Ya Allah, kerana beriman kepada-Mu, membenarkan kitab-Mu, menepati janji-Mu, dan mengikut sunnah Nabi-Mu Muhammad ﷺ.',
        sunnahTips: [
          'Angkat tangan kanan menghadap Hajarul Aswad tanpa menolak orang lain.',
          'Tidak disunatkan mencium tapak tangan selepas istilam dari jauh.',
          "Lelaki disunatkan Idtiba' (bahu kanan terbuka) dan Raml (lari anak) pada 3 pusingan pertama."
        ]
      },
      {
        id: 1,
        title: 'Rukun Iraqi & Hijr Ismail (Pancuran Emas)',
        badge: 'Rukun 2',
        icon: '🌧️',
        color: 'border-amber-500',
        subtitle: 'Bucu utara Kaabah menghadap Iraq dan dinding separa bulatan Hateem.',
        fadhilat: 'Pancuran Emas (Mizabur Rahmah) terletak di atas Hijr Ismail. Wajib tawaf di LUAR dinding Hijr Ismail.',
        arabicDua: 'اللَّهُمَّ إِنَّ هَذَا الْبَيْتَ بَيْتُكَ، وَالْحَرَمَ حَرَمُكَ، وَالأَمْنَ أَمْنُكَ، وَالْعَبْدَ عَبْدُكَ، وَهَذَا مَقَامُ الْعَائِذِ بِكَ مِنَ النَّارِ',
        transliteration: "Allahumma inna haadzal-baita baituka, wal-harama haramuka, wal-amna amnuka, wal-'abda 'abduka, wa haadza maqaamul-'a-idzi bika minan-naar.",
        translation: 'Ya Allah, sesungguhnya Baitullah ini rumah-Mu, tanah haram ini tanah haram-Mu, keamanan ini keamanan-Mu, dan aku hamba-Mu yang memohon perlindungan dari api neraka.',
        sunnahTips: [
          'SYARAT SAH WAJIB: Jangan sekali-kali masuk ke dalam kawasan Hijr Ismail semasa tawaf kerana ia sebahagian Kaabah.',
          'Jika masuk ke dalam dinding Hijr Ismail, pusingan tersebut terbatal dan mesti diulang dari luar.',
          'Disunatkan berdoa memohon keampunan di bawah pancuran emas.'
        ]
      },
      {
        id: 2,
        title: 'Rukun Syami (Bucu Barat)',
        badge: 'Rukun 3',
        icon: '🛡️',
        color: 'border-blue-500',
        subtitle: 'Bucu barat Kaabah menghadap arah negeri Syam (Jordan, Syria, Palestin).',
        fadhilat: 'Peringatan keteguhan iman dan memohon perlindungan daripada syirik, keraguan, dan akhlak buruk.',
        arabicDua: 'اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الشَّكِّ وَالشِّرْكِ، وَالشِّقَاقِ وَالنِّفَاقِ، وَسُوءِ الأَخْلاَقِ، وَسُوءِ الْمُنْقَلَبِ فِي الْمَالِ وَالأَهْلِ وَالْوَلَدِ',
        transliteration: "Allahumma inni a'uudzu bika minasy-syakki wasy-syirki, wasy-syiqaaqi wan-nifaaqi, wa suu-il akhlaaq, wa suu-il munqalabi fil-maali wal-ahli wal-walad.",
        translation: 'Ya Allah, hamba berlindung kepada-Mu daripada keraguan, syirik, perpecahan, nifaq, akhlak buruk, dan musibah harta serta keluarga.',
        sunnahTips: [
          'Rukun Syami tidak disunatkan untuk diusap atau dicium (tiada nas sahih).',
          'Kekalkan langkah tertib dan teruskan berzikir dengan tenang menuju Rukun Yamani.'
        ]
      },
      {
        id: 3,
        title: 'Rukun Yamani (Bucu Selatan)',
        badge: 'Rukun 4',
        icon: '🤲',
        color: 'border-emerald-500',
        subtitle: 'Bucu selatan menghadap Yaman. Tempat permulaan doa agung Rabbana Aatina.',
        fadhilat: 'Batu asas binaan Nabi Ibrahim a.s. Sunnah mengusap bucu ini dengan tangan kanan (jika dekat) atau berisyarat dari jauh.',
        arabicDua: 'رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ، وَأَدْخِلْنَا الْجَنَّةَ مَعَ الأَبْرَارِ، يَا عَزِيزُ يَا غَفَّارُ',
        transliteration: "Rabbana aatina fid-dunya hasanah, wa fil-aakhirati hasanah, wa qinaa 'adzaaban-naar, wa adkhilnal-jannata ma'al-abraar, ya 'Aziizu ya Ghaffaar.",
        translation: 'Wahai Tuhan kami, kurniakanlah kami kebaikan di dunia dan kebaikan di akhirat, peliharalah kami daripada azab neraka, dan masukkanlah kami ke syurga bersama orang-orang soleh.',
        sunnahTips: [
          'Sunnah mengusap Rukun Yamani dengan tangan kanan tanpa mencium tangan.',
          'Dari Rukun Yamani hingga Hajarul Aswad, bacalah doa Rabbana Aatina secara berterusan.',
          'Malaikat mengaminkan doa jemaah di antara Rukun Yamani dan Hajarul Aswad.'
        ]
      }
    ];

    const currentRukun = RUKUN_LIST[this.selectedRukunIndex] || RUKUN_LIST[0];

    return `
      <div class="space-y-4 py-2">
        <div class="text-center space-y-1">
          <h2 class="text-lg sm:text-xl font-bold text-stone-900">4 Rukun (Bucu) Kaabah & Fadhilatnya</h2>
          <p class="text-xs text-stone-500">Kaabah mempunyai 4 penjuru mengikut arah mata angin. Pilih rukun di bawah:</p>
        </div>

        <div class="grid grid-cols-2 sm:grid-cols-4 gap-2">
          ${RUKUN_LIST.map(
            (r) => `
            <button data-rukun-idx="${r.id}" class="btn-rukun-select p-3 rounded-2xl border text-left transition cursor-pointer ${
              this.selectedRukunIndex === r.id
                ? 'bg-amber-500 text-stone-950 font-extrabold border-amber-600 shadow-sm'
                : 'bg-white border-stone-200 text-stone-700 hover:bg-stone-50'
            }">
              <div class="flex items-center gap-1.5 mb-1">
                <span class="text-base">${r.icon}</span>
                <span class="text-[10px] font-mono uppercase">${r.badge}</span>
              </div>
              <div class="text-xs font-bold truncate">${r.title.split('(')[0]}</div>
            </button>
          `
          ).join('')}
        </div>

        <div class="bg-white rounded-3xl p-5 sm:p-6 border ${currentRukun.color} shadow-sm space-y-4">
          <div class="flex items-center justify-between pb-3 border-b border-stone-100">
            <div>
              <span class="text-[10px] uppercase font-bold text-amber-600">${currentRukun.badge}</span>
              <h3 class="text-base sm:text-lg font-bold text-stone-900">${currentRukun.title}</h3>
              <p class="text-xs text-stone-500 mt-0.5">${currentRukun.subtitle}</p>
            </div>
            <button class="btn-listen-dua px-3.5 py-1.5 rounded-full bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold text-xs flex items-center gap-1.5 border border-amber-300 transition cursor-pointer" data-arabic="${encodeURIComponent(currentRukun.arabicDua)}">
              <span class="speech-icon">🔊</span>
              <span class="speech-label">Dengar</span>
            </button>
          </div>

          <div class="bg-amber-50/40 p-5 rounded-2xl border border-amber-200/60 text-right">
            <p class="font-arabic text-2xl sm:text-3xl text-stone-900 leading-loose" dir="rtl">
              ${currentRukun.arabicDua}
            </p>
          </div>

          <div class="space-y-2 text-xs">
            <div class="p-3 rounded-xl bg-stone-50 border border-stone-200/70">
              <div class="text-[10px] uppercase font-bold text-emerald-700 mb-0.5">Sebutan Rumi:</div>
              <p class="italic text-stone-700 leading-relaxed">${currentRukun.transliteration}</p>
            </div>
            <div class="p-3 rounded-xl bg-stone-50 border border-stone-200/70">
              <div class="text-[10px] uppercase font-bold text-amber-700 mb-0.5">Terjemahan Maksud:</div>
              <p class="text-stone-800 leading-relaxed">${currentRukun.translation}</p>
            </div>
          </div>

          <div class="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-300 space-y-2 text-xs">
            <div class="font-bold text-emerald-800 flex items-center gap-1.5">
              <span>📌</span>
              <span>Panduan Sunnah & Hukum Fiqh:</span>
            </div>
            <ul class="space-y-1.5 text-stone-700 list-disc list-inside">
              ${currentRukun.sunnahTips.map((tip) => `<li>${tip}</li>`).join('')}
            </ul>
          </div>
        </div>
      </div>
    `;
  }

  // ==========================================
  // TAB 4: FIQH
  // ==========================================
  private renderFiqhTab(): string {
    return `
      <div class="space-y-4 py-2">
        <div class="text-center space-y-1">
          <h2 class="text-lg sm:text-xl font-bold text-stone-900">Syarat Sah, Rukun & Fiqh Tawaf</h2>
          <p class="text-xs text-stone-500">Garis panduan mengikut mazhab Syafi'i untuk memastikan tawaf anda sah dan sempurna.</p>
        </div>

        <div class="bg-white rounded-3xl p-5 border border-stone-200/90 shadow-sm space-y-3">
          <div class="flex items-center gap-2 border-b border-stone-100 pb-2">
            <span class="text-xl">📜</span>
            <h3 class="font-bold text-stone-900 text-sm sm:text-base">7 Syarat Sah Tawaf (Wajib Dipenuhi)</h3>
          </div>

          <div class="space-y-2 text-xs text-stone-700">
            <div class="p-2.5 rounded-xl bg-stone-50 border border-stone-200/60 flex items-start gap-2.5">
              <span class="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 font-bold flex items-center justify-center shrink-0">1</span>
              <div><strong>Suci Daripada Hadas:</strong> Wajib suci daripada hadas kecil (mempunyai wuduk) dan hadas besar. Jika batal wuduk, wajib ambil wuduk semula dan sambung dari pusingan terbatal.</div>
            </div>
            <div class="p-2.5 rounded-xl bg-stone-50 border border-stone-200/60 flex items-start gap-2.5">
              <span class="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 font-bold flex items-center justify-center shrink-0">2</span>
              <div><strong>Suci Daripada Najis:</strong> Badan, pakaian ihram, dan tempat berjalan mestilah bersih daripada sebarang najis.</div>
            </div>
            <div class="p-2.5 rounded-xl bg-stone-50 border border-stone-200/60 flex items-start gap-2.5">
              <span class="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 font-bold flex items-center justify-center shrink-0">3</span>
              <div><strong>Menutup Aurat:</strong> Menutup aurat seperti dalam solat (lelaki dari pusat ke lutut, wanita seluruh badan kecuali muka dan tapak tangan).</div>
            </div>
            <div class="p-2.5 rounded-xl bg-stone-50 border border-stone-200/60 flex items-start gap-2.5">
              <span class="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 font-bold flex items-center justify-center shrink-0">4</span>
              <div><strong>Bermula Dari Hajarul Aswad:</strong> Wajib memulakan tawaf bertentangan dengan garisan Hajarul Aswad dan mengakhirinya di garisan yang sama.</div>
            </div>
            <div class="p-2.5 rounded-xl bg-stone-50 border border-stone-200/60 flex items-start gap-2.5">
              <span class="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 font-bold flex items-center justify-center shrink-0">5</span>
              <div><strong>Kaabah Sentiasa di Sebelah Kiri:</strong> Bahu kiri mestilah sentiasa menghadap Kaabah sepanjang perjalanan tawaf. Dilarang memalingkan dada ke arah Kaabah semasa berjalan.</div>
            </div>
            <div class="p-2.5 rounded-xl bg-stone-50 border border-stone-200/60 flex items-start gap-2.5">
              <span class="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 font-bold flex items-center justify-center shrink-0">6</span>
              <div><strong>Di Luar Kaabah & Hijr Ismail:</strong> Wajib tawaf di luar binaan Kaabah, Syazarwan (kaki dinding Kaabah), dan di luar dinding Hijr Ismail (Hateem).</div>
            </div>
            <div class="p-2.5 rounded-xl bg-stone-50 border border-stone-200/60 flex items-start gap-2.5">
              <span class="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 font-bold flex items-center justify-center shrink-0">7</span>
              <div><strong>Cukup 7 Pusingan dengan Yakin:</strong> Menyempurnakan tepat 7 keliling tanpa ragu-ragu. Jika ragu bilangan pusingan, ambillah bilangan yang lebih sedikit dan tambah.</div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  // ==========================================
  // EVENT BINDINGS
  // ==========================================
  private bindEvents() {
    // Back button '<' (returns to 3D simulation)
    const btnBack = this.container.querySelector('#btn-motawef-back');
    btnBack?.addEventListener('click', () => {
      this.close();
      this.callbacks.onSwitchToGame?.();
    });

    // Switch to Real Sa'i button
    const btnToSai = this.container.querySelector('#btn-motawef-to-sai');
    btnToSai?.addEventListener('click', () => {
      this.close();
      this.callbacks.onSwitchToSai?.();
    });

    // Audio Headphone button
    const btnAudio = this.container.querySelector('#btn-motawef-audio');
    btnAudio?.addEventListener('click', () => {
      this.toggleTalbiyahAudio();
    });

    // Navigation Tab Buttons
    const navTabs = this.container.querySelectorAll('.nav-tab');
    navTabs.forEach((btn) => {
      btn.addEventListener('click', () => {
        const tab = (btn as HTMLElement).dataset.tab as RealTawafTab;
        if (tab) {
          this.activeTab = tab;
          this.render();
        }
      });
    });

    // Mode Toggle (Pedometer vs Auto vs Manual)
    const btnModePedometer = this.container.querySelector('#btn-mode-pedometer');
    const btnModeAuto = this.container.querySelector('#btn-mode-auto');
    const btnModeManual = this.container.querySelector('#btn-mode-manual');

    btnModePedometer?.addEventListener('click', () => {
      this.tawafMode = 'pedometer';
      this.stopAutoWalkLoop();
      this.render();
    });

    btnModeAuto?.addEventListener('click', () => {
      this.tawafMode = 'auto';
      if (this.isTawafActive) this.startAutoWalkLoop();
      this.render();
    });

    btnModeManual?.addEventListener('click', () => {
      this.tawafMode = 'manual';
      this.stopAutoWalkLoop();
      this.render();
    });

    // Calibrate Left Shoulder button
    const btnCalibrate = this.container.querySelector('#btn-calibrate-shoulder');
    btnCalibrate?.addEventListener('click', () => {
      qiblaCompassService.calibrateLeftShoulderToCurrentHeading();
      try {
        if ('vibrate' in navigator) navigator.vibrate([50, 50]);
      } catch {}
      this.showIstilamBanner('🎯 Bahu Kiri Dikalibrasi! Arah hadapan anda kini dikunci dengan Kaabah tepat di bahu kiri.');
    });

    // Speed Selector Buttons (Auto mode)
    const speedBtns = this.container.querySelectorAll('.btn-speed-select');
    speedBtns.forEach((b) => {
      b.addEventListener('click', () => {
        const sp = (b as HTMLElement).dataset.speed as 'normal' | 'raml' | 'fast';
        if (sp) {
          this.autoWalkSpeed = sp;
          this.render();
        }
      });
    });

    // Next Lap button
    const btnNextLap = this.container.querySelector('#btn-next-lap');
    btnNextLap?.addEventListener('click', () => this.nextLap());

    // Prev Lap button
    const btnPrevLap = this.container.querySelector('#btn-prev-lap');
    btnPrevLap?.addEventListener('click', () => this.prevLap());

    // Reset Laps button
    const btnResetLaps = this.container.querySelector('#btn-reset-laps');
    btnResetLaps?.addEventListener('click', () => this.resetLaps());

    // Istilam button
    const btnIstilam = this.container.querySelector('#btn-istilam-action');
    btnIstilam?.addEventListener('click', () => {
      soundManager.playIstilamTakbir();
      try {
        if ('vibrate' in navigator) navigator.vibrate(60);
      } catch {}
      this.showIstilamBanner('✋ ISTILAM HAJARUL ASWAD • "Bismillahi Allahu Akbar"');
    });

    // Lap Dot Selection
    const lapDots = this.container.querySelectorAll('.btn-lap-dot');
    lapDots.forEach((btn) => {
      btn.addEventListener('click', () => {
        const lap = parseInt((btn as HTMLElement).dataset.selectLap || '1', 10);
        this.setLap(lap);
      });
    });

    // Dua Tab: Lap Pills
    const duaPills = this.container.querySelectorAll('.btn-dua-lap-pill');
    duaPills.forEach((btn) => {
      btn.addEventListener('click', () => {
        const lap = parseInt((btn as HTMLElement).dataset.duaLap || '1', 10);
        this.selectedDuaLap = lap;
        this.render();
      });
    });

    // Rukun Tab: Corner selectors
    const rukunBtns = this.container.querySelectorAll('.btn-rukun-select');
    rukunBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        const idx = parseInt((btn as HTMLElement).dataset.rukunIdx || '0', 10);
        this.selectedRukunIndex = idx;
        this.render();
      });
    });

    // Speech synthesis buttons
    const listenBtns = this.container.querySelectorAll('.btn-listen-dua');
    listenBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        const arabic = decodeURIComponent((btn as HTMLElement).dataset.arabic || '');
        if (this.isSpeaking) {
          this.stopAudio();
          this.updateSpeechButtonStates();
        } else if (arabic) {
          this.speakText(arabic);
        }
      });
    });

    // Location selector
    const locationSelect = this.container.querySelector('#select-qibla-location') as HTMLSelectElement;
    locationSelect?.addEventListener('change', () => {
      const val = locationSelect.value;
      if (val === 'gps') {
        qiblaCompassService.startGeolocation();
      } else {
        qiblaCompassService.setLocation(val);
      }
    });

    // Manual Heading Slider & Rotate Buttons (for testing without magnetometer)
    const sliderManual = this.container.querySelector('#slider-manual-heading') as HTMLInputElement;
    const manualHeadingLabel = this.container.querySelector('#manual-heading-label');
    sliderManual?.addEventListener('input', () => {
      const deg = parseFloat(sliderManual.value);
      if (manualHeadingLabel) manualHeadingLabel.textContent = `${deg}°`;
      qiblaCompassService.setManualHeading(deg);
    });

    const btnRotLeft = this.container.querySelector('#btn-rot-left-15');
    btnRotLeft?.addEventListener('click', () => {
      qiblaCompassService.rotateManualHeading(-15);
    });

    const btnRotRight = this.container.querySelector('#btn-rot-right-15');
    btnRotRight?.addEventListener('click', () => {
      qiblaCompassService.rotateManualHeading(15);
    });

    this.bindActionEvents();
  }

  private bindActionEvents() {
    // Start Tawaf button
    const btnStartAuto = this.container.querySelector('#btn-start-auto-tawaf');
    btnStartAuto?.addEventListener('click', () => {
      this.startTawafAuto();
    });

    // Toggle Auto Walk (Pause / Resume)
    const btnToggleWalk = this.container.querySelector('#btn-toggle-walk');
    btnToggleWalk?.addEventListener('click', () => {
      this.pauseResumeTawaf();
    });

    // Step buttons (+1 and +10)
    const btnStep1 = this.container.querySelector('#btn-step-walk-1');
    btnStep1?.addEventListener('click', () => {
      this.registerStep(1);
    });

    const btnStep10 = this.container.querySelector('#btn-step-walk-10');
    btnStep10?.addEventListener('click', () => {
      this.registerStep(10);
    });

    // Manual Mode Action Button (↗)
    const btnMotawefAction = this.container.querySelector('#btn-motawef-action');
    btnMotawefAction?.addEventListener('click', () => {
      this.manualAdvanceSectorOrLap();
    });
  }

  private showIstilamBanner(customMessage?: string) {
    const existing = document.getElementById('istilam-temporary-banner');
    if (existing) existing.remove();

    const banner = document.createElement('div');
    banner.id = 'istilam-temporary-banner';
    banner.className =
      'fixed bottom-6 left-1/2 -translate-x-1/2 z-50 max-w-sm w-[90%] p-4 rounded-3xl bg-white border-2 border-emerald-500 shadow-2xl text-center space-y-2 animate-bounce';
    banner.innerHTML = `
      <div class="flex items-center justify-center gap-1.5 text-emerald-700 font-extrabold text-xs uppercase tracking-wider">
        <span>✋</span>
        <span>${customMessage ? 'TAWAF UPDATE' : 'ISTILAM HAJARUL ASWAD'}</span>
      </div>
      <p class="font-arabic text-2xl text-stone-900 leading-normal" dir="rtl">
        بِسْمِ اللَّهِ، اللَّهُ أَكْبَرُ
      </p>
      <p class="text-xs text-stone-600 font-medium">
        ${customMessage || 'Angkat tangan kanan ke arah Hajarul Aswad sambil berzikir: <strong>"Bismillahi Allahu Akbar"</strong>.'}
      </p>
      <button id="btn-close-istilam-banner" class="mt-1 px-4 py-1.5 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold cursor-pointer">
        Teruskan Tawaf
      </button>
    `;

    document.body.appendChild(banner);
    banner.querySelector('#btn-close-istilam-banner')?.addEventListener('click', () => banner.remove());
    setTimeout(() => {
      if (banner.parentElement) banner.remove();
    }, 4500);
  }

  /**
   * Real-time Compass UI updater (called on orientation / location tick)
   * NOTE: The Kaabah is strictly STATIC at center.
   * Compares device orientation against Tawaf Fiqh posture: Kaabah MUST be at the LEFT SHOULDER (270° relative).
   */
  private updateCompassDisplay(state: QiblaState) {
    if (!this.isSectionOpen || this.activeTab !== 'compass_laps') return;

    // Location Label & Distance
    const locLabel = this.container.querySelector('#qibla-location-label');
    if (locLabel) {
      locLabel.textContent = state.locationName;
    }

    const distLabel = this.container.querySelector('#qibla-distance-label');
    if (distLabel) {
      distLabel.textContent = `(Kiblat: ${state.qiblaBearing}°)`;
    }

    // Alignment Banner: Evaluates Left Shoulder alignment (270° relative)
    const banner = this.container.querySelector('#qibla-align-banner') as HTMLElement;
    const bannerText = this.container.querySelector('#qibla-align-text') as HTMLElement;

    if (banner && bannerText) {
      const rel = state.relativeQibla;
      const leftShoulderDiff = state.leftShoulderDiff; // (relativeQibla - 270) unwrapped to [-180, 180]
      const isLeftShoulderAligned = state.isKaabahOnLeftShoulder; // within ±25°
      const isFacingWithChest = rel <= 35 || rel >= 325;
      const isKaabahOnRightShoulder = rel >= 65 && rel <= 115;

      if (isLeftShoulderAligned) {
        banner.className =
          'w-full text-center py-2 px-3 rounded-2xl bg-emerald-600 text-white border-2 border-emerald-400 text-xs font-bold transition-all shadow-md flex flex-col items-center justify-center gap-0.5 animate-pulse';
        bannerText.innerHTML = `
          <div class="flex items-center gap-1.5 text-xs sm:text-sm font-extrabold tracking-wide">
            <span>✨</span>
            <span>TEPAT: KAABAH DI BAHU KIRI (SAH)</span>
            <span>✨</span>
          </div>
          <div class="text-[10.5px] font-medium text-emerald-100">
            Bahu kiri selari dengan Kaabah (270°) • Teruskan melangkah mengikut arah tawaf
          </div>
        `;
      } else if (isFacingWithChest) {
        banner.className =
          'w-full text-center py-2 px-3 rounded-2xl bg-amber-500 text-stone-950 border-2 border-amber-600 text-xs font-bold transition-all shadow-md flex flex-col items-center justify-center gap-0.5';
        bannerText.innerHTML = `
          <div class="flex items-center gap-1.5 text-xs font-extrabold">
            <span>⚠️</span>
            <span>DADA MENGHADAP KAABAH!</span>
          </div>
          <div class="text-[10.5px] font-medium text-stone-900">
            Pusing badan 90° ke kanan agar Kaabah berada di sebelah bahu kiri anda
          </div>
        `;
      } else if (isKaabahOnRightShoulder) {
        banner.className =
          'w-full text-center py-2 px-3 rounded-2xl bg-rose-600 text-white border-2 border-rose-400 text-xs font-bold transition-all shadow-md flex flex-col items-center justify-center gap-0.5';
        bannerText.innerHTML = `
          <div class="flex items-center gap-1.5 text-xs font-extrabold">
            <span>❌</span>
            <span>ARAH SONGSANG (KAABAH DI BAHU KANAN)!</span>
          </div>
          <div class="text-[10.5px] font-normal text-rose-100">
            Pusingkan badan 180° — Tawaf wajib pusingan lawan arah jam (Kaabah di kiri)
          </div>
        `;
      } else {
        banner.className =
          'w-full text-center py-2 px-3 rounded-2xl bg-stone-100/95 border border-stone-300 text-xs font-semibold text-stone-800 transition-all flex flex-col items-center justify-center gap-0.5';
        const turnDir = leftShoulderDiff > 0 ? 'kanan' : 'kiri';
        const degToTurn = Math.round(Math.abs(leftShoulderDiff));
        bannerText.innerHTML = `
          <div class="flex items-center gap-1 text-xs font-bold text-stone-900">
            <span>🧭</span>
            <span>Pusing badan ke <strong>${turnDir} (${degToTurn}°)</strong></span>
          </div>
          <div class="text-[10.5px] text-stone-600">
            Sasaran Fiqh: Kaabah hendaklah tepat di sebelah bahu kiri anda (bukan di hadapan dada)
          </div>
        `;
      }
    }

    // Outer Rim Needle: Points to NORTH (Utara / U) like a true magnetic compass
    const outerNeedle = this.container.querySelector('#outer-rim-needle') as SVGGraphicsElement;
    if (outerNeedle) {
      outerNeedle.setAttribute('transform', `rotate(${-state.heading} 180 180)`);
    }

    // Update Manual Slider
    const slider = this.container.querySelector('#slider-manual-heading') as HTMLInputElement;
    const manualHeadingLabel = this.container.querySelector('#manual-heading-label');
    if (slider && document.activeElement !== slider) {
      slider.value = String(state.heading);
      if (manualHeadingLabel) manualHeadingLabel.textContent = `${state.heading}°`;
    }
  }
}
