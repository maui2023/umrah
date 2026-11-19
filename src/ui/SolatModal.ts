import { MosqueLocation, SOLAT_STEPS, SolatMode, SolatStep } from '../data/solatData';
import { AvatarModel } from '../characters/AvatarModel';
import { soundManager } from '../audio/SoundManager';
import confetti from 'canvas-confetti';

export interface SolatModalOptions {
  mosque: MosqueLocation;
  localAvatar: AvatarModel;
  onComplete: (points: number, isJemaah: boolean, mosque: MosqueLocation) => void;
  onPoseChange?: (pose: SolatStep['avatarPose']) => void;
  onModeChange?: (mode: SolatMode) => void;
  onClose?: () => void;
  initialMode?: SolatMode;
}

export class SolatModal {
  private container: HTMLElement;
  private options: SolatModalOptions;
  private currentStepIndex: number = 0;
  private currentMode: SolatMode;
  private isCompleted: boolean = false;

  constructor(options: SolatModalOptions) {
    this.options = options;
    this.currentMode = options.initialMode || 'solo';
    this.container = document.createElement('div');
    this.container.id = 'solat-modal-overlay';
    this.container.className = 'interactive-ui fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-3 sm:p-4 overflow-y-auto select-none';
    document.body.appendChild(this.container);

    this.render();
    this.updateAvatarPose();

    if (this.options.onModeChange) {
      this.options.onModeChange(this.currentMode);
    }
  }

  private getStep(): SolatStep {
    return SOLAT_STEPS[this.currentStepIndex] || SOLAT_STEPS[0];
  }

  private updateAvatarPose() {
    const step = this.getStep();
    if (this.options.localAvatar) {
      this.options.localAvatar.setPrayerPose(step.avatarPose);
    }
    this.options.onPoseChange?.(step.avatarPose);
  }

  private setMode(mode: SolatMode) {
    this.currentMode = mode;
    this.options.onModeChange?.(mode);
    this.render();
  }

  private nextStep() {
    if (this.currentStepIndex < SOLAT_STEPS.length - 1) {
      this.currentStepIndex++;
      const step = this.getStep();

      // Play audio cues
      if (step.audioCue === 'takbir') {
        soundManager.playTakbirSound();
      } else if (step.audioCue === 'salam') {
        soundManager.playSalamSound();
      } else if (step.audioCue === 'reward') {
        soundManager.playPahalaRewardSound(this.currentMode === 'jemaah');
      } else {
        soundManager.playSolatChime();
      }

      this.updateAvatarPose();
      this.render();

      // If last step (completion)
      if (this.currentStepIndex === SOLAT_STEPS.length - 1 && !this.isCompleted) {
        this.isCompleted = true;
        const points = this.currentMode === 'jemaah' ? 27 : 1;
        this.triggerCelebration(points);
        this.options.onComplete(points, this.currentMode === 'jemaah', this.options.mosque);
      }
    } else {
      // Finished, close modal
      this.close();
    }
  }

  private prevStep() {
    if (this.currentStepIndex > 0) {
      this.currentStepIndex--;
      soundManager.playSolatChime();
      this.updateAvatarPose();
      this.render();
    }
  }

  private triggerCelebration(points: number) {
    soundManager.playPahalaRewardSound(this.currentMode === 'jemaah');

    // Confetti burst
    confetti({
      particleCount: points === 27 ? 120 : 50,
      spread: points === 27 ? 90 : 60,
      origin: { y: 0.6 },
      colors: points === 27 ? ['#F59E0B', '#10B981', '#3B82F6', '#EC4899', '#FBBF24'] : ['#F59E0B', '#FBBF24', '#ffffff']
    });
  }

  public close() {
    if (this.options.localAvatar) {
      this.options.localAvatar.setPrayerPose('berdiri');
    }
    this.options.onPoseChange?.('berdiri');
    this.options.onClose?.();
    this.container.remove();
  }

  private render() {
    const step = this.getStep();
    const isLast = this.currentStepIndex === SOLAT_STEPS.length - 1;
    const isSolo = this.currentMode === 'solo';
    const points = isSolo ? 1 : 27;

    this.container.innerHTML = `
      <div class="relative w-full max-w-2xl bg-white/95 backdrop-blur-xl border border-stone-200/90 rounded-3xl shadow-2xl p-5 sm:p-6 flex flex-col gap-4 text-stone-900 transition-all overflow-hidden my-auto">
        
        <!-- Top decorative Islamic arch pattern bar -->
        <div class="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-amber-500 via-emerald-600 to-amber-500"></div>

        <!-- Header: Mosque Badge & Close Button -->
        <div class="flex items-start justify-between gap-3 pt-1">
          <div class="flex flex-col">
            <div class="flex items-center gap-2">
              <span class="text-xl sm:text-2xl">🕌</span>
              <div>
                <h2 class="font-serif text-lg sm:text-xl font-bold text-stone-900 leading-tight">
                  ${this.options.mosque.name}
                </h2>
                <div class="text-[11px] sm:text-xs text-stone-500 font-medium">
                  ${this.options.mosque.arabicName} • ${this.options.mosque.city}
                </div>
              </div>
            </div>
            <div class="text-[11px] text-emerald-800 bg-emerald-50 border border-emerald-200/70 px-2.5 py-1 rounded-xl mt-2 font-medium">
              ✨ <b>Fadhilat:</b> ${this.options.mosque.fadhilat}
            </div>
          </div>

          <button id="btn-close-solat-modal" title="Tutup" class="interactive-ui p-1.5 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 text-sm transition cursor-pointer shrink-0">
            ✕
          </button>
        </div>

        <!-- MODE SELECTOR (Solo vs Berjemaah) -->
        <div class="flex flex-col gap-1.5 bg-stone-50 p-2.5 rounded-2xl border border-stone-200/80">
          <div class="flex items-center justify-between text-xs font-semibold text-stone-600 px-1">
            <span>Pilih Mod Solat:</span>
            <span class="text-[11px] text-amber-700 font-bold">
              ${isSolo ? '👤 Solat Solo = 1 Pahala' : '👥 Solat Berjemaah = 27 Pahala (+27x Darjat)'}
            </span>
          </div>
          <div class="grid grid-cols-2 gap-2">
            <button id="btn-mode-solo" class="interactive-ui flex items-center justify-center gap-2 py-2 px-3 rounded-xl border text-xs font-bold transition cursor-pointer ${
              isSolo
                ? 'bg-stone-900 text-white border-stone-900 shadow-sm'
                : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-100'
            }">
              <span>👤</span>
              <div class="flex flex-col text-left">
                <span class="leading-none">Solat Solo</span>
                <span class="text-[9px] font-normal ${isSolo ? 'text-amber-300' : 'text-stone-500'}">1 Pahala</span>
              </div>
            </button>

            <button id="btn-mode-jemaah" class="interactive-ui flex items-center justify-center gap-2 py-2 px-3 rounded-xl border text-xs font-bold transition cursor-pointer ${
              !isSolo
                ? 'bg-gradient-to-r from-emerald-700 to-teal-800 text-white border-emerald-800 shadow-md ring-2 ring-emerald-500/30'
                : 'bg-white text-emerald-800 border-emerald-200 hover:bg-emerald-50'
            }">
              <span>👥</span>
              <div class="flex flex-col text-left">
                <span class="leading-none">Solat Berjemaah</span>
                <span class="text-[9px] font-normal ${!isSolo ? 'text-emerald-200 font-bold' : 'text-emerald-700'}">★ 27 Pahala</span>
              </div>
            </button>
          </div>
        </div>

        <!-- STEPPER PROGRESS BAR (12 Steps) -->
        <div class="flex flex-col gap-1">
          <div class="flex items-center justify-between text-xs">
            <span class="font-bold text-stone-800 flex items-center gap-1.5">
              <span class="w-5 h-5 rounded-full bg-[#C5A880] text-stone-900 flex items-center justify-center text-[10px] font-bold">
                ${step.stepNumber}
              </span>
              <span>Langkah ${step.stepNumber} dari ${SOLAT_STEPS.length}</span>
            </span>
            <span class="px-2 py-0.5 rounded-full text-[10px] font-semibold ${
              step.rukunType.startsWith('Rukun') ? 'bg-amber-100 text-amber-800 border border-amber-300' : 'bg-blue-50 text-blue-700 border border-blue-200'
            }">
              ${step.rukunType}
            </span>
          </div>

          <!-- 12-segment bar -->
          <div class="flex items-center gap-1 w-full mt-1">
            ${SOLAT_STEPS.map((_, idx) => `
              <div class="h-1.5 flex-1 rounded-full transition-all duration-300 ${
                idx < this.currentStepIndex
                  ? 'bg-emerald-600'
                  : idx === this.currentStepIndex
                  ? 'bg-amber-500 ring-2 ring-amber-300'
                  : 'bg-stone-200'
              }"></div>
            `).join('')}
          </div>
        </div>

        <!-- MAIN STEP CONTENT CARD -->
        <div class="bg-gradient-to-b from-stone-50 to-white rounded-2xl border border-stone-200/90 p-4 sm:p-5 flex flex-col gap-3 shadow-sm">
          
          <!-- Step Title -->
          <div class="border-b border-stone-200/80 pb-2">
            <h3 class="text-base sm:text-lg font-bold text-stone-900 leading-snug">
              ${step.title}
            </h3>
            <div class="text-xs text-stone-500 font-medium">
              ${step.arabicTitle}
            </div>
          </div>

          <!-- Arabic Calligraphy Box -->
          <div class="bg-emerald-950/5 border border-emerald-800/20 rounded-2xl p-4 text-center">
            <div class="font-serif text-xl sm:text-2xl font-bold text-emerald-950 leading-loose tracking-wide dir-rtl select-text" style="font-family: 'Amiri', 'Traditional Arabic', serif;">
              ${step.arabic}
            </div>
          </div>

          <!-- Transliteration & Translation -->
          <div class="flex flex-col gap-1.5 text-xs sm:text-[13px]">
            <div class="font-medium text-stone-800 italic leading-relaxed">
              <span class="font-semibold text-amber-800 not-italic">Rumi:</span> "${step.transliteration}"
            </div>
            <div class="text-stone-600 leading-relaxed">
              <span class="font-semibold text-stone-800">Maksud:</span> ${step.translation}
            </div>
          </div>

          <!-- Step Guide & Sunnah Tips -->
          <div class="bg-white rounded-xl p-3 border border-stone-200/80 text-xs flex flex-col gap-1.5">
            <div class="text-stone-800 font-medium leading-relaxed">
              💡 <b>Panduan:</b> ${step.explanation}
            </div>
            ${
              step.sunnahTips.length > 0
                ? `<div class="text-stone-500 text-[11px] flex flex-col gap-0.5 mt-1 border-t border-stone-100 pt-1.5">
                    ${step.sunnahTips.map(tip => `<div>• ${tip}</div>`).join('')}
                  </div>`
                : ''
            }
          </div>
        </div>

        <!-- CELEBRATION BOX ON STEP 12 -->
        ${
          isLast
            ? `
          <div class="bg-gradient-to-r from-amber-500/10 via-emerald-500/15 to-amber-500/10 border-2 border-amber-400 rounded-2xl p-4 text-center flex flex-col items-center gap-2 animate-pulse">
            <span class="text-3xl">🌟</span>
            <div class="font-bold text-base text-stone-900">
              Alhamdulillah! Solat Telah Sempurna Ditunaikan.
            </div>
            <div class="text-sm font-black text-amber-700 bg-amber-100/80 px-4 py-1 rounded-full border border-amber-300">
              Ganjaran: +${points} PAHALA ${!isSolo ? 'BERJEMAAH (27x DARJAT) ✨' : 'SOLO ⭐'}
            </div>
            <p class="text-xs text-stone-600 max-w-md">
              Sabda Rasulullah ﷺ: "Solat berjemaah itu lebih afdhal daripada solat bersendirian sebanyak 27 darjat." (HR Bukhari & Muslim)
            </p>
          </div>
          `
            : ''
        }

        <!-- BOTTOM CONTROLS & ACTIONS -->
        <div class="flex items-center justify-between gap-2 pt-1 border-t border-stone-200/80">
          
          <!-- Audio Recitation Button -->
          <button id="btn-audio-solat-step" title="Dengar Sebutan & Bacaan" class="interactive-ui flex items-center gap-1.5 px-3 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold text-xs transition cursor-pointer active:scale-95">
            <span>🗣️</span>
            <span>Dengar Bacaan</span>
          </button>

          <!-- Navigation Buttons -->
          <div class="flex items-center gap-2">
            ${
              this.currentStepIndex > 0
                ? `
              <button id="btn-prev-solat-step" class="interactive-ui px-3.5 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold text-xs transition cursor-pointer active:scale-95">
                ◀ Sebelum
              </button>
            `
                : ''
            }

            <button id="btn-next-solat-step" class="interactive-ui px-5 py-2.5 rounded-xl ${
              isLast
                ? 'bg-emerald-600 hover:bg-emerald-500'
                : 'bg-stone-900 hover:bg-stone-800'
            } active:scale-95 text-white font-bold text-xs sm:text-sm shadow-md transition flex items-center gap-1.5 cursor-pointer">
              <span>${isLast ? '✨' : '➔'}</span>
              <span>${step.buttonText}</span>
            </button>
          </div>
        </div>

      </div>
    `;

    this.attachEventListeners();
  }

  private attachEventListeners() {
    this.container.querySelector('#btn-close-solat-modal')?.addEventListener('click', () => {
      this.close();
    });

    this.container.querySelector('#btn-mode-solo')?.addEventListener('click', () => {
      this.setMode('solo');
    });

    this.container.querySelector('#btn-mode-jemaah')?.addEventListener('click', () => {
      this.setMode('jemaah');
    });

    this.container.querySelector('#btn-next-solat-step')?.addEventListener('click', () => {
      this.nextStep();
    });

    this.container.querySelector('#btn-prev-solat-step')?.addEventListener('click', () => {
      this.prevStep();
    });

    this.container.querySelector('#btn-audio-solat-step')?.addEventListener('click', () => {
      const step = this.getStep();
      soundManager.speakSolatStep(step.title, step.transliteration);
    });
  }
}
