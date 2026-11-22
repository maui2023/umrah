import { soundManager } from '../audio/SoundManager';
import {
  SAI_LAPS,
  GREEN_LIGHT_INFO,
  AYAT_LAZIM_SAI,
  SURAH_LAZIM_SAI,
  ZIKIR_LAZIM_SAI,
  SAI_FIQH_GUIDE,
  SaiLapInfo
} from '../data/saiData';
import confetti from 'canvas-confetti';

export interface RealSaiSectionCallbacks {
  onSwitchToGame?: () => void;
  onLapChanged?: (lap: number) => void;
  onSaiFinished?: () => void;
  onSwitchToTawaf?: () => void;
}

export type RealSaiTab = 'timeline' | 'ayat_lazim' | 'fiqh';

export class RealSaiSection {
  private container: HTMLElement;
  private currentLap: number = 1;
  private activeTab: RealSaiTab = 'timeline';
  private isSpeaking: boolean = false;
  private isSectionOpen: boolean = false;
  private callbacks: RealSaiSectionCallbacks = {};

  public isOpen(): boolean {
    return this.isSectionOpen;
  }

  constructor(callbacks?: RealSaiSectionCallbacks) {
    if (callbacks) {
      this.callbacks = callbacks;
    }

    this.container = document.createElement('div');
    this.container.id = 'real-sai-section';
    this.container.className =
      'fixed inset-0 z-50 overflow-y-auto bg-[#FAF8F5] text-stone-900 flex flex-col font-sans select-none transition-opacity duration-300';
    this.container.style.display = 'none';

    document.body.appendChild(this.container);
  }

  public open(initialLap: number = 1) {
    this.currentLap = Math.max(1, Math.min(7, initialLap));
    this.isSectionOpen = true;
    this.container.style.display = 'flex';
    this.render();
  }

  public close() {
    this.isSectionOpen = false;
    this.container.style.display = 'none';
    this.stopAudio();
  }

  public setLap(lap: number) {
    this.currentLap = Math.max(1, Math.min(7, lap));
    this.callbacks.onLapChanged?.(this.currentLap);
    this.render();
  }

  public nextLap() {
    if (this.currentLap < 7) {
      soundManager.playCheckpointSound();
      this.setLap(this.currentLap + 1);
      this.scrollToTop();
    } else {
      this.completeSai();
    }
  }

  public prevLap() {
    if (this.currentLap > 1) {
      soundManager.playCheckpointSound();
      this.setLap(this.currentLap - 1);
      this.scrollToTop();
    }
  }

  private scrollToTop() {
    const mainEl = this.container.querySelector('main');
    if (mainEl) {
      mainEl.scrollTo({ top: 0, behavior: 'smooth' });
    }
    this.container.scrollTo({ top: 0, behavior: 'smooth' });
  }

  private completeSai() {
    soundManager.playCompletionFanfare();

    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
      setTimeout(() => {
        confetti({
          particleCount: 50,
          angle: 60,
          spread: 55,
          origin: { x: 0 }
        });
        confetti({
          particleCount: 50,
          angle: 120,
          spread: 55,
          origin: { x: 1 }
        });
      }, 350);
    } catch (e) {
      console.warn('Confetti error:', e);
    }

    this.showCompletionModal();
  }

  private showCompletionModal() {
    const modal = document.createElement('div');
    modal.className =
      'fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in select-none';
    modal.innerHTML = `
      <div class="relative w-full max-w-md bg-white rounded-3xl p-6 sm:p-7 shadow-2xl border border-amber-200 text-stone-900 space-y-4">
        <div class="text-center space-y-2">
          <div class="w-16 h-16 mx-auto rounded-full bg-emerald-100 text-emerald-800 border-2 border-emerald-400 flex items-center justify-center text-3xl shadow-md">
            🏆
          </div>
          <div class="text-xs uppercase font-extrabold tracking-widest text-emerald-700">MABRUK & TAHNIAH</div>
          <h2 class="text-2xl font-serif font-bold text-stone-900">7 Pusingan Sa'i Selesai!</h2>
          <p class="text-xs text-stone-600 leading-relaxed">
            Alhamdulillah! Ibadah Sa'i anda antara Bukit Safa dan Bukit Marwah telah disempurnakan mengikut sunnah Rasulullah ﷺ.
          </p>
        </div>

        <div class="p-4 rounded-2xl bg-amber-50/80 border border-amber-200 text-xs space-y-2 text-stone-700">
          <div class="font-bold text-amber-900 flex items-center gap-1.5">
            <span>✂️</span>
            <span>Langkah Seterusnya: Tahallul</span>
          </div>
          <p class="leading-relaxed">
            <strong>Jemaah Lelaki:</strong> Lebih afdal bercukur licin (Halq) atau memotong sekurang-kurangnya 3 helai rambut (Taqshir).<br/>
            <strong>Jemaah Wanita:</strong> Memotong hujung rambut sepanjang satu ruas jari (sekitar 2 cm).
          </p>
          <div class="text-[11px] text-stone-500 italic pt-1 border-t border-amber-200/60">
            Setelah bertahallul, terlepaslah segala larangan ihram dan Umrah anda telah selesai dengan sempurna.
          </div>
        </div>

        <div class="space-y-2 pt-2">
          <button id="btn-sai-complete-close" class="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white font-extrabold text-sm shadow-lg shadow-emerald-900/30 active:scale-95 transition cursor-pointer text-center flex items-center justify-center gap-2">
            <span>✨</span>
            <span>Selesai Ibadah Sa'i & Teruskan Tahallul</span>
          </button>
          
          <button id="btn-sai-complete-game" class="w-full py-3 px-4 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs border border-stone-300 transition cursor-pointer text-center flex items-center justify-center gap-1.5">
            <span>🎮</span>
            <span>Kembali ke Mod Simulasi 3D</span>
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    modal.querySelector('#btn-sai-complete-close')?.addEventListener('click', () => {
      modal.remove();
      this.callbacks.onSaiFinished?.();
    });

    modal.querySelector('#btn-sai-complete-game')?.addEventListener('click', () => {
      modal.remove();
      this.close();
      this.callbacks.onSwitchToGame?.();
    });
  }

  private stopAudio() {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    this.isSpeaking = false;
    this.updateSpeechButtonStates();
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
    const btns = this.container.querySelectorAll('.btn-listen-arabic');
    btns.forEach((b) => {
      const icon = b.querySelector('.speech-icon');
      const label = b.querySelector('.speech-label');
      if (this.isSpeaking) {
        if (icon) icon.textContent = '⏹️';
        if (label) label.textContent = 'Berhenti';
      } else {
        if (icon) icon.textContent = '🔊';
        if (label) label.textContent = 'Dengar Sebutan';
      }
    });
  }

  private render() {
    const lapInfo: SaiLapInfo = SAI_LAPS[this.currentLap] || SAI_LAPS[1];
    const isOdd = this.currentLap % 2 === 1;
    const fromLabel = isOdd ? 'Safa' : 'Marwah';
    const toLabel = isOdd ? 'Marwah' : 'Safa';

    this.container.innerHTML = `
      <div class="w-full flex-1 flex flex-col justify-between relative bg-[#FAF8F5] min-h-screen text-stone-900">

        <!-- TOP BAR: Controls & Fast Switch -->
        <header class="w-full max-w-lg mx-auto px-4 pt-3 pb-1 flex items-center justify-between select-none z-30">
          <!-- Back button '<' to 3D game -->
          <button id="btn-realsai-back" title="Kembali ke Mod Simulasi 3D" class="w-9 h-9 rounded-full bg-white border border-stone-200/90 shadow-sm flex items-center justify-center text-stone-800 hover:bg-stone-100 transition active:scale-95 cursor-pointer">
            <svg class="w-5 h-5 stroke-stone-800 stroke-2 fill-none" viewBox="0 0 24 24">
              <path d="M15 19l-7-7 7-7" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>

          <!-- Middle Title / Mode Label -->
          <div class="text-center">
            <div class="flex items-center justify-center gap-1.5">
              <span class="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <h1 class="text-sm sm:text-base font-bold text-stone-800 tracking-tight">Mod Real Sa'i</h1>
            </div>
            <div class="text-[10px] text-stone-500 font-medium">Panduan Ibadah Nyata (Safa ⇄ Marwah)</div>
          </div>

          <!-- Switch to Real Tawaf Button -->
          <button id="btn-realsai-to-tawaf" title="Tukar ke Mod Real Tawaf" class="px-2.5 py-1.5 rounded-full bg-white border border-stone-200/90 shadow-sm flex items-center gap-1 text-[11px] font-bold text-stone-700 hover:bg-stone-100 transition active:scale-95 cursor-pointer">
            <span>🕋</span>
            <span>Tawaf</span>
          </button>
        </header>

        <!-- SUB-NAV TABS: Timeline, Ayat Lazim, Fiqh -->
        <nav class="max-w-lg mx-auto w-full px-4 py-1.5 flex items-center justify-center gap-1.5 z-20">
          <button data-tab="timeline" class="sai-tab-btn px-3 py-1 rounded-full text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
            this.activeTab === 'timeline' ? 'bg-[#154636] text-white shadow-sm ring-1 ring-[#154636]' : 'bg-stone-200/80 text-stone-700 hover:bg-stone-300'
          }">
            <span>🚶‍♂️</span>
            <span>Aliran Pusingan</span>
          </button>

          <button data-tab="ayat_lazim" class="sai-tab-btn px-3 py-1 rounded-full text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
            this.activeTab === 'ayat_lazim' ? 'bg-[#154636] text-white shadow-sm ring-1 ring-[#154636]' : 'bg-stone-200/80 text-stone-700 hover:bg-stone-300'
          }">
            <span>📖</span>
            <span>Ayat & Surah Lazim</span>
          </button>

          <button data-tab="fiqh" class="sai-tab-btn px-3 py-1 rounded-full text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
            this.activeTab === 'fiqh' ? 'bg-[#154636] text-white shadow-sm ring-1 ring-[#154636]' : 'bg-stone-200/80 text-stone-700 hover:bg-stone-300'
          }">
            <span>📜</span>
            <span>Fiqh & Syarat</span>
          </button>
        </nav>

        <!-- MAIN SCROLLABLE CONTENT (Padded at bottom for sticky navigation) -->
        <main class="flex-1 w-full max-w-lg mx-auto px-4 pt-2 pb-28 sm:pb-32 overflow-y-auto">
          ${this.activeTab === 'timeline' ? this.renderTimelineTab(lapInfo, fromLabel, toLabel) : ''}
          ${this.activeTab === 'ayat_lazim' ? this.renderAyatLazimTab() : ''}
          ${this.activeTab === 'fiqh' ? this.renderFiqhTab() : ''}
        </main>

        <!-- STICKY BOTTOM BAR (EASY ACTION BUTTONS AS REQUESTED "mudah") -->
        <div class="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-stone-200/90 shadow-[0_-8px_24px_rgba(0,0,0,0.08)] max-w-lg mx-auto px-4 py-2.5 sm:py-3 space-y-2 rounded-t-2xl">
          <!-- Primary Big Step Advance Button -->
          <button id="btn-realsai-main-action" class="w-full py-3 sm:py-3.5 px-4 rounded-xl bg-gradient-to-r from-[#17523f] via-[#1a5b46] to-[#17523f] hover:from-[#134434] hover:to-[#134434] text-white font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/30 active:scale-[0.98] transition cursor-pointer">
            ${
              this.currentLap < 7
                ? `<span>✅ Tekan: Tiba di ${toLabel} (Selesai P.${this.currentLap} ➔ Lanjut P.${this.currentLap + 1})</span>`
                : `<span>🏆 Tekan: Selesai Sa'i 7 Pusingan (Lanjut ke Tahallul)</span>`
            }
          </button>

          <!-- Secondary Row: Previous Lap, Lap Pills, Next Lap -->
          <div class="flex items-center justify-between gap-1.5 text-xs">
            <button id="btn-realsai-prev-lap" ${this.currentLap <= 1 ? 'disabled' : ''} class="px-2.5 py-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 disabled:opacity-35 disabled:hover:bg-stone-100 text-stone-700 font-bold transition flex items-center gap-1 cursor-pointer disabled:cursor-not-allowed">
              <span>⬅</span>
              <span class="hidden sm:inline">P.Sebelum</span>
            </button>

            <!-- 1 to 7 Lap Jump Pills -->
            <div class="flex items-center gap-1 overflow-x-auto py-0.5">
              ${[1, 2, 3, 4, 5, 6, 7]
                .map(
                  (l) => `
                <button data-lap-target="${l}" class="btn-jump-lap w-7 h-7 sm:w-8 sm:h-8 rounded-full text-xs font-bold transition flex items-center justify-center cursor-pointer ${
                    this.currentLap === l
                      ? 'bg-[#154636] text-white ring-2 ring-emerald-500 shadow-sm font-extrabold scale-105'
                      : l < this.currentLap
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                  }">
                  ${l}
                </button>
              `
                )
                .join('')}
            </div>

            <button id="btn-realsai-next-lap" ${this.currentLap >= 7 ? 'disabled' : ''} class="px-2.5 py-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 disabled:opacity-35 disabled:hover:bg-stone-100 text-stone-700 font-bold transition flex items-center gap-1 cursor-pointer disabled:cursor-not-allowed">
              <span class="hidden sm:inline">P.Seterusnya</span>
              <span>➔</span>
            </button>
          </div>
        </div>

      </div>
    `;

    this.bindEvents();
  }

  /**
   * Render the main Timeline Tab matching the user's screenshot!
   */
  private renderTimelineTab(lapInfo: SaiLapInfo, fromLabel: string, toLabel: string): string {
    const isOdd = this.currentLap % 2 === 1;

    return `
      <!-- ISLAMIC TOP STAR ORNAMENT (Exactly as in screenshot) -->
      <div class="flex justify-center pt-1 pb-1.5 text-[#C4A45A]">
        <svg class="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2l1.6 3.6 3.9-.8-1.5 3.7 3.4 2.1-3.4 2.1 1.5 3.7-3.9-.8L12 21l-1.6-3.6-3.9.8 1.5-3.7-3.4-2.1 3.4-2.1-1.5-3.7 3.9.8L12 2z" opacity="0.85"/>
          <circle cx="12" cy="12" r="2.5" fill="#FAF8F5"/>
        </svg>
      </div>

      <!-- GREEN CARD HEADER (Exact layout & colors from screenshot) -->
      <div class="relative bg-gradient-to-r from-[#123e2f] via-[#184f3c] to-[#123e2f] border border-[#a38035]/40 rounded-2xl p-4 sm:p-5 shadow-lg flex items-center justify-between gap-3 text-white mb-6">
        
        <!-- Left: Gold Circle with Lap Number -->
        <div class="w-13 h-13 sm:w-14 sm:h-14 rounded-full border-2 border-[#D4AF37] bg-[#E9D9B6] text-stone-900 flex items-center justify-center text-xl sm:text-2xl font-bold font-serif shadow-inner shrink-0">
          ${this.currentLap}
        </div>

        <!-- Middle: Title "Perjalanan X Daripada 7" and "Safa → Marwah" -->
        <div class="flex-1 min-w-0 pr-1">
          <div class="leading-tight">
            <span class="text-base sm:text-lg font-bold text-white tracking-wide">Perjalanan ${this.currentLap}</span>
            <span class="text-xs sm:text-sm text-emerald-100/70 font-normal ml-1">Daripada 7</span>
          </div>
          <div class="text-xs sm:text-sm text-white/95 font-medium mt-0.5">
            ${fromLabel} → ${toLabel}
          </div>
        </div>

        <!-- Right: 7 Progress Indicator Dots -->
        <div class="flex items-center gap-1 sm:gap-1.5 shrink-0">
          ${[1, 2, 3, 4, 5, 6, 7]
            .map(
              (dot) => `
            <div class="${
              dot <= this.currentLap
                ? 'w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-[#5eead4] ring-2 ring-[#2dd4bf]/40 shadow-[0_0_8px_#2dd4bf]'
                : 'w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-[#0a231b] border border-emerald-700/60'
            }"></div>
          `
            )
            .join('')}
        </div>

        <!-- Subtle bottom gold decorative trim line -->
        <div class="absolute bottom-0 left-6 right-6 h-[2px] bg-gradient-to-r from-transparent via-[#d4af37]/60 to-transparent"></div>
      </div>

      <!-- TIMELINE CONTAINER WITH LEFT DASHED LINE (Exact styling from screenshot) -->
      <div class="relative pl-6 sm:pl-7 space-y-7 before:absolute before:left-2 sm:before:left-2.5 before:top-2 before:bottom-3 before:w-0.5 before:border-l-2 before:border-dashed before:border-[#c5a467]">

        <!-- ========================================== -->
        <!-- TIMELINE STEP 1: DI SAFA / DI MARWAH -->
        <!-- ========================================== -->
        <div class="relative space-y-3">
          <!-- Step circle node marker (Gold ring, white fill) -->
          <div class="absolute -left-[21px] sm:-left-[23px] top-1 w-3.5 h-3.5 rounded-full border-2 border-[#b88e38] bg-white ring-2 ring-[#FAF8F5]"></div>

          <!-- Step Title -->
          <div class="flex items-center justify-between">
            <h3 class="text-base sm:text-lg font-bold text-[#144837] tracking-tight">
              Di ${fromLabel}
            </h3>
            <span class="px-2 py-0.5 rounded-full bg-[#f4ecd8] text-[#8c6721] text-[10px] font-bold border border-[#e2d2aa]">
              Puncak ${fromLabel}
            </span>
          </div>

          <!-- Instruction Text (From user's screenshot) -->
          <p class="text-xs sm:text-sm text-stone-700 leading-relaxed font-normal">
            ${
              isOdd
                ? 'Naik sedikit ke kawasan bukit Safa dan hadap Kaabah. Angkat kedua-dua tangan seperti berdoa. Baca:'
                : 'Naik sedikit ke kawasan bukit Marwah dan hadap Kaabah. Angkat kedua-dua tangan seperti berdoa. Baca:'
            }
          </p>

          ${
            this.currentLap === 1
              ? `
            <!-- Special: Permulaan Sa'i di Safa (Ayat 158 Al-Baqarah) -->
            <div class="bg-[#FAF5EA] border border-[#EADBBD] rounded-2xl p-4 sm:p-5 shadow-sm space-y-3">
              <div class="flex items-center justify-between">
                <span class="inline-block text-[10px] font-extrabold tracking-widest text-[#8a6829] uppercase">
                  SUNNAH PERMULAAN (HANYA KALI PERTAMA DI SAFA)
                </span>
                <button class="btn-listen-arabic px-2 py-1 rounded-lg bg-white/80 hover:bg-white text-stone-700 border border-stone-200 text-[10px] font-bold flex items-center gap-1 cursor-pointer transition" data-speak="۞ إِنَّ الصَّفَا وَالْمَرْوَةَ مِن شَعَائِرِ اللَّهِ ۖ فَمَنْ حَجَّ الْبَيْتَ أَوِ اعْتَمَرَ فَلَا جُنَاحَ عَلَيْهِ أَن يَطَّوَّفَ بِهِمَا ۚ وَمَن تَطَوَّعَ خَيْرًا فَإِنَّ اللَّهَ شَاكِرٌ عَلِيمٌ. نَبْدَأُ بِمَا بَدَأَ اللَّهُ بِهِ">
                  <span class="speech-icon">🔊</span>
                  <span class="speech-label">Dengar</span>
                </button>
              </div>

              <div class="font-arabic text-right text-lg sm:text-xl text-stone-900 leading-loose py-1" dir="rtl">
                ۞ إِنَّ الصَّفَا وَالْمَرْوَةَ مِن شَعَائِرِ اللَّهِ ۖ فَمَنْ حَجَّ الْبَيْتَ أَوِ اعْتَمَرَ فَلَا جُنَاحَ عَلَيْهِ أَن يَطَّوَّفَ بِهِمَا ۚ وَمَن تَطَوَّعَ خَيْرًا فَإِنَّ اللَّهَ شَاكِرٌ عَلِيمٌ
              </div>
              <div class="font-arabic text-right text-base sm:text-lg text-emerald-900 font-bold" dir="rtl">
                نَبْدَأُ بِمَا بَدَأَ اللَّهُ بِهِ
              </div>

              <div class="border-l-2 border-[#19957e] pl-3.5 py-1">
                <div class="italic text-stone-700 text-xs sm:text-sm leading-relaxed">
                  Innash-shafaa wal-marwata min sya'aa-irillah. Faman hajjal-baita awi'tamara falaa junaaha 'alaihi ay-yaththawwafa bihimaa, wa man tathawwa'a khairan fa-innallaha Syaakirun 'Aliim.<br/>
                  <strong>Nabda'u bimaa bada-Allahu bih.</strong>
                </div>
                <div class="text-[11px] text-stone-600 mt-1">
                  (Kami memulakan dengan apa yang dimulakan oleh Allah). Dibaca sekali sahaja semasa mendaki Safa sebelum Pusingan 1.
                </div>
              </div>
            </div>
          `
              : ''
          }

          <!-- PRAYER CARD 1: SUSUNAN ULAMA (Exact card from screenshot) -->
          <div class="bg-[#FAF5EA] border border-[#EADBBD] rounded-2xl p-4 sm:p-5 shadow-sm space-y-3">
            <div class="flex items-center justify-between">
              <span class="inline-block text-[10px] font-extrabold tracking-widest text-[#8a6829] uppercase">
                SUSUNAN ULAMA
              </span>
              <button class="btn-listen-arabic px-2 py-1 rounded-lg bg-white/80 hover:bg-white text-stone-700 border border-stone-200 text-[10px] font-bold flex items-center gap-1 cursor-pointer transition" data-speak="اللهُ أَكْبَرُ، اللهُ أَكْبَرُ، اللهُ أَكْبَرُ، وَلِلَّهِ الْحَمْدُ">
                <span class="speech-icon">🔊</span>
                <span class="speech-label">Dengar</span>
              </button>
            </div>

            <!-- Arabic Text -->
            <div class="font-arabic text-right text-2xl sm:text-3xl text-stone-900 leading-loose py-1" dir="rtl">
              اللَّهُ أَكْبَرُ، اللَّهُ أَكْبَرُ، اللَّهُ أَكْبَرُ، وَلِلَّهِ الْحَمْدُ
            </div>

            <!-- Transliteration with teal accent bar -->
            <div class="border-l-2 border-[#19957e] pl-3.5 py-1">
              <div class="italic text-stone-700 text-sm sm:text-base leading-relaxed">
                Allaahu akbar, Allaahu akbar, Allaahu akbar, wa lillaahil-hamd.
              </div>
              <div class="text-xs text-stone-600 mt-1">
                Allah Maha Besar, Allah Maha Besar, Allah Maha Besar, dan bagi Allah segala puji.
              </div>
            </div>
          </div>

          <!-- PRAYER CARD 2: SAHIH (Exact card from screenshot) -->
          <div class="bg-[#FAF5EA] border border-[#EADBBD] rounded-2xl p-4 sm:p-5 shadow-sm space-y-3">
            <div class="flex items-center justify-between">
              <span class="inline-block text-[10px] font-extrabold tracking-wider text-emerald-800 bg-emerald-100/90 px-2.5 py-0.5 rounded uppercase">
                SAHIH
              </span>
              <button class="btn-listen-arabic px-2 py-1 rounded-lg bg-white/80 hover:bg-white text-stone-700 border border-stone-200 text-[10px] font-bold flex items-center gap-1 cursor-pointer transition" data-speak="لَا إِلَهَ إِلَّا اللهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ، وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ، لَا إِلَهَ إِلَّا اللهُ وَحْدَهُ، أَنْجَزَ وَعْدَهُ، وَنَصَرَ عَبْدَهُ، وَهَزَمَ الْأَحْزَابَ وَحْدَهُ">
                <span class="speech-icon">🔊</span>
                <span class="speech-label">Dengar</span>
              </button>
            </div>

            <!-- Arabic Text -->
            <div class="font-arabic text-right text-xl sm:text-2xl text-stone-900 leading-loose py-1" dir="rtl">
              لَا إِلَهَ إِلَّا اللهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ، وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ، لَا إِلَهَ إِلَّا اللهُ وَحْدَهُ، أَنْجَزَ وَعْدَهُ، وَنَصَرَ عَبْدَهُ، وَهَزَمَ الْأَحْزَابَ وَحْدَهُ
            </div>

            <!-- Transliteration with teal accent bar -->
            <div class="border-l-2 border-[#19957e] pl-3.5 py-1">
              <div class="italic text-stone-700 text-xs sm:text-sm leading-relaxed">
                Laa ilaaha illallaahu wahdahu laa shareeka lah, lahul-mulku wa lahul-hamdu, wa huwa 'alaa kulli syai-in qadiir, laa ilaaha illallaahu wahdah, anjaza wa'dah, wa nashara 'abdah, wa hazamal-ahzaaba wahdah.
              </div>
              <div class="text-xs text-stone-600 mt-1 leading-relaxed">
                Tiada tuhan melainkan Allah Yang Maha Esa, tiada sekutu bagi-Nya, milik-Nya kerajaan dan segala pujian, dan Dia Maha Kuasa atas segala sesuatu. Tiada tuhan melainkan Allah Yang Maha Esa, yang menepati janji-Nya, menolong hamba-Nya dan menewaskan tentera bersekutu dengan keesaan-Nya.
              </div>
            </div>

            <div class="p-2.5 rounded-xl bg-amber-50/90 border border-amber-200/80 text-[11px] text-amber-900 flex items-start gap-1.5">
              <span class="shrink-0 text-sm">💡</span>
              <span><strong>Sunnah:</strong> Ulangi zikir ini sebanyak <strong>3 kali</strong> dan berdoalah dengan apa-apa hajat yang anda inginkan di antara setiap ulangan.</span>
            </div>
          </div>
        </div>

        <!-- ========================================== -->
        <!-- TIMELINE STEP 2: SEMASA BERJALAN DI LALUAN MAS'A -->
        <!-- ========================================== -->
        <div class="relative space-y-3 pt-2">
          <!-- Step circle node marker (Emerald ring) -->
          <div class="absolute -left-[21px] sm:-left-[23px] top-1 w-3.5 h-3.5 rounded-full border-2 border-emerald-600 bg-white ring-2 ring-[#FAF8F5]"></div>

          <div class="flex items-center justify-between">
            <h3 class="text-base sm:text-lg font-bold text-[#144837] tracking-tight">
              Semasa Berjalan (Laluan Mas'a)
            </h3>
            <span class="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold border border-emerald-300">
              ${fromLabel} ➔ ${toLabel}
            </span>
          </div>

          <p class="text-xs sm:text-sm text-stone-700 leading-relaxed font-normal">
            Melangkah dengan tenang menuju ke ${toLabel}. Anda bebas membaca doa hajat sendiri, berzikir, atau membaca doa pilihan bagi Pusingan ke-${this.currentLap}:
          </p>

          <!-- PRAYER CARD: DOA KHUSUS PUSINGAN INI -->
          <div class="bg-[#FAF5EA] border border-[#EADBBD] rounded-2xl p-4 sm:p-5 shadow-sm space-y-3">
            <div class="flex items-center justify-between">
              <div>
                <span class="inline-block text-[10px] font-extrabold tracking-wider text-emerald-800 bg-emerald-100/90 px-2.5 py-0.5 rounded uppercase">
                  DOA PUSINGAN ${this.currentLap}
                </span>
                <span class="text-xs font-bold text-amber-800 ml-1.5">${lapInfo.theme}</span>
              </div>
              <button class="btn-listen-arabic px-2 py-1 rounded-lg bg-white/80 hover:bg-white text-stone-700 border border-stone-200 text-[10px] font-bold flex items-center gap-1 cursor-pointer transition" data-speak="${lapInfo.arabic}">
                <span class="speech-icon">🔊</span>
                <span class="speech-label">Dengar</span>
              </button>
            </div>

            <!-- Arabic Text -->
            <div class="font-arabic text-right text-xl sm:text-2xl text-stone-900 leading-loose py-1" dir="rtl">
              ${lapInfo.arabic}
            </div>

            <!-- Transliteration with teal accent bar -->
            <div class="border-l-2 border-[#19957e] pl-3.5 py-1">
              <div class="italic text-stone-700 text-xs sm:text-sm leading-relaxed">
                ${lapInfo.transliteration}
              </div>
              <div class="text-xs text-stone-600 mt-1 leading-relaxed">
                ${lapInfo.translation}
              </div>
            </div>

            <div class="text-[11px] text-stone-500 italic pt-1 border-t border-[#EADBBD]/70">
              📌 ${lapInfo.sunnahNote}
            </div>
          </div>
        </div>

        <!-- ========================================== -->
        <!-- TIMELINE STEP 3: ZON LAMPU HIJAU -->
        <!-- ========================================== -->
        <div class="relative space-y-3 pt-2">
          <!-- Step circle node marker (Green glowing circle) -->
          <div class="absolute -left-[21px] sm:-left-[23px] top-1 w-3.5 h-3.5 rounded-full border-2 border-emerald-500 bg-emerald-500 shadow-[0_0_8px_#10b981]"></div>

          <div class="flex items-center justify-between">
            <div class="flex items-center gap-1.5">
              <span class="text-lg">🟢</span>
              <h3 class="text-base sm:text-lg font-bold text-emerald-900 tracking-tight">
                Zon Lampu Hijau (Batn al-Wadi)
              </h3>
            </div>
            <span class="px-2 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-bold">
              Sunnah Harwalah
            </span>
          </div>

          <p class="text-xs sm:text-sm text-stone-700 leading-relaxed font-normal">
            ${GREEN_LIGHT_INFO.hukum}
          </p>

          <!-- PRAYER CARD: DOA LAMPU HIJAU -->
          <div class="bg-[#F0FDF4] border border-emerald-300 rounded-2xl p-4 sm:p-5 shadow-sm space-y-3">
            <div class="flex items-center justify-between">
              <span class="inline-block text-[10px] font-extrabold tracking-wider text-emerald-900 bg-emerald-200/80 px-2.5 py-0.5 rounded uppercase">
                DOA DI ZON LAMPU HIJAU
              </span>
              <button class="btn-listen-arabic px-2 py-1 rounded-lg bg-white hover:bg-emerald-50 text-emerald-900 border border-emerald-300 text-[10px] font-bold flex items-center gap-1 cursor-pointer transition" data-speak="${GREEN_LIGHT_INFO.arabic}">
                <span class="speech-icon">🔊</span>
                <span class="speech-label">Dengar</span>
              </button>
            </div>

            <!-- Arabic Text -->
            <div class="font-arabic text-right text-xl sm:text-2xl text-stone-900 leading-loose py-1" dir="rtl">
              ${GREEN_LIGHT_INFO.arabic}
            </div>

            <!-- Transliteration with teal accent bar -->
            <div class="border-l-2 border-emerald-600 pl-3.5 py-1">
              <div class="italic text-stone-700 text-xs sm:text-sm leading-relaxed">
                ${GREEN_LIGHT_INFO.transliteration}
              </div>
              <div class="text-xs text-stone-600 mt-1 leading-relaxed">
                ${GREEN_LIGHT_INFO.translation}
              </div>
            </div>
          </div>
        </div>

        <!-- ========================================== -->
        <!-- TIMELINE STEP 4: TIBA DI BUKIT DESTINASI -->
        <!-- ========================================== -->
        <div class="relative space-y-3 pt-2">
          <!-- Step circle node marker (Gold marker) -->
          <div class="absolute -left-[21px] sm:-left-[23px] top-1 w-3.5 h-3.5 rounded-full border-2 border-amber-600 bg-amber-500 shadow-sm"></div>

          <div class="flex items-center justify-between">
            <h3 class="text-base sm:text-lg font-bold text-[#144837] tracking-tight">
              Tiba di ${toLabel}
            </h3>
            <span class="px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[10px] font-bold border border-amber-300">
              Selesai Pusingan ${this.currentLap}
            </span>
          </div>

          ${
            this.currentLap < 7
              ? `
            <div class="p-3.5 rounded-xl bg-[#FAF5EA] border border-[#EADBBD] text-xs text-stone-700 space-y-1.5 leading-relaxed">
              <div class="font-bold text-stone-900">
                Alhamdulillah! Pusingan ke-${this.currentLap} selesai sebaik sahaja anda tiba di ${toLabel}.
              </div>
              <p>
                Sila tekan butang hijau di bawah untuk mengesahkan ketibaan dan memulakan <strong>Pusingan ke-${this.currentLap + 1} (${toLabel} ➔ ${this.currentLap + 1 % 2 === 1 ? 'Marwah' : 'Safa'})</strong>.
              </p>
            </div>
          `
              : `
            <div class="p-4 rounded-2xl bg-gradient-to-r from-amber-50 to-emerald-50 border border-amber-300 text-stone-800 space-y-2">
              <div class="font-bold text-amber-900 text-sm flex items-center gap-1.5">
                <span>🏆</span>
                <span>Alhamdulillah! 7 Pusingan Sa'i Selesai di Bukit Marwah</span>
              </div>
              <p class="text-xs text-stone-700 leading-relaxed">
                Ibadah Sa'i anda telah lengkap dengan sempurna. Langkah seterusnya adalah <strong>Tahallul</strong> (bercukur / bergunting). Tekan butang di bawah untuk menyempurnakan ibadah.
              </p>
            </div>
          `
          }
        </div>

      </div>
    `;
  }

  /**
   * Render Ayat & Surah Lazim Tab
   */
  private renderAyatLazimTab(): string {
    return `
      <div class="space-y-4">
        <div class="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-stone-700">
          <div class="font-bold text-amber-900 mb-0.5 flex items-center gap-1">
            <span>📖</span>
            <span>Ayat Lazim & Surah Semasa Sa'i</span>
          </div>
          <p class="leading-relaxed">
            Semasa berjalan antara Safa dan Marwah, jemaah amat digalakkan membaca ayat-ayat Al-Quran, zikir dan doa di bawah untuk ketenangan jiwa dan kelapangan rezeki.
          </p>
        </div>

        <!-- Ayat-ayat Al-Quran -->
        <div class="space-y-3">
          <h3 class="text-xs font-bold text-stone-500 uppercase tracking-wider px-1">Ayat-Ayat Pilihan</h3>
          ${AYAT_LAZIM_SAI.map((item) => this.renderDuaCard(item)).join('')}
        </div>

        <!-- Surah-surah Lazim -->
        <div class="space-y-3 pt-2">
          <h3 class="text-xs font-bold text-stone-500 uppercase tracking-wider px-1">Surah-Surah Lazim</h3>
          ${SURAH_LAZIM_SAI.map((item) => this.renderDuaCard(item)).join('')}
        </div>

        <!-- Zikir-zikir Ma'tsur -->
        <div class="space-y-3 pt-2">
          <h3 class="text-xs font-bold text-stone-500 uppercase tracking-wider px-1">Zikir & Kalimah Thayyibah</h3>
          ${ZIKIR_LAZIM_SAI.map((item) => this.renderDuaCard(item)).join('')}
        </div>
      </div>
    `;
  }

  /**
   * Render Fiqh & Syarat Tab
   */
  private renderFiqhTab(): string {
    return `
      <div class="space-y-4">
        <!-- Syarat Sah Sa'i -->
        <div class="p-4 rounded-2xl bg-[#FAF5EA] border border-[#EADBBD] space-y-3">
          <div class="flex items-center gap-2">
            <span class="text-xl">📜</span>
            <h3 class="text-sm font-bold text-[#144837]">Syarat-Syarat Sah Sa'i (Mazhab Syafi'i)</h3>
          </div>
          <div class="space-y-2.5">
            ${SAI_FIQH_GUIDE.syaratSah
              .map(
                (item, idx) => `
              <div class="p-3 rounded-xl bg-white/90 border border-[#EADBBD] text-xs">
                <div class="font-bold text-emerald-800 flex items-center gap-1.5 mb-1">
                  <span class="w-5 h-5 rounded-full bg-emerald-100 text-emerald-900 flex items-center justify-center text-[10px] font-bold">${
                    idx + 1
                  }</span>
                  <span>${item.title}</span>
                </div>
                <p class="text-stone-600 leading-relaxed pl-6.5">${item.desc}</p>
              </div>
            `
              )
              .join('')}
          </div>
        </div>

        <!-- Sunnah-Sunnah Sa'i -->
        <div class="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200 space-y-2.5">
          <div class="flex items-center gap-2">
            <span class="text-xl">✨</span>
            <h3 class="text-sm font-bold text-emerald-900">Sunnah-Sunnah Ibadah Sa'i</h3>
          </div>
          <ul class="space-y-2 text-xs text-stone-700 leading-relaxed">
            ${SAI_FIQH_GUIDE.sunnah
              .map(
                (s: { title: string; desc: string }) => `
              <li class="flex items-start gap-2">
                <span class="text-emerald-600 font-bold shrink-0">✔</span>
                <div>
                  <strong>${s.title}:</strong> ${s.desc}
                </div>
              </li>
            `
              )
              .join('')}
          </ul>
        </div>
      </div>
    `;
  }

  private renderDuaCard(item: any): string {
    return `
      <div class="bg-[#FAF5EA] border border-[#EADBBD] rounded-2xl p-4 sm:p-5 shadow-sm space-y-3">
        <div class="flex items-center justify-between">
          <div>
            <span class="inline-block text-[10px] font-extrabold tracking-wider text-emerald-800 bg-emerald-100/90 px-2 py-0.5 rounded uppercase">
              ${item.surahOrSource || 'DOA MA\'TSUR'}
            </span>
            <div class="text-xs font-bold text-stone-800 mt-1">${item.title}</div>
          </div>
          <button class="btn-listen-arabic px-2 py-1 rounded-lg bg-white/80 hover:bg-white text-stone-700 border border-stone-200 text-[10px] font-bold flex items-center gap-1 cursor-pointer transition shrink-0" data-speak="${item.arabic}">
            <span class="speech-icon">🔊</span>
            <span class="speech-label">Dengar</span>
          </button>
        </div>

        <!-- Arabic Text -->
        <div class="font-arabic text-right text-xl sm:text-2xl text-stone-900 leading-loose py-1" dir="rtl">
          ${item.arabic}
        </div>

        <!-- Transliteration with teal accent bar -->
        <div class="border-l-2 border-[#19957e] pl-3.5 py-1">
          <div class="italic text-stone-700 text-xs sm:text-sm leading-relaxed">
            ${item.transliteration}
          </div>
          <div class="text-xs text-stone-600 mt-1 leading-relaxed">
            ${item.translation}
          </div>
        </div>

        ${
          item.fadhilat
            ? `
          <div class="text-[11px] text-amber-900 bg-amber-50/80 p-2 rounded-lg border border-amber-200/60 leading-relaxed">
            💡 <strong>Kelebihan:</strong> ${item.fadhilat}
          </div>
        `
            : ''
        }
      </div>
    `;
  }

  private bindEvents() {
    // Back button
    this.container.querySelector('#btn-realsai-back')?.addEventListener('click', () => {
      this.close();
      this.callbacks.onSwitchToGame?.();
    });

    // Switch to Real Tawaf
    this.container.querySelector('#btn-realsai-to-tawaf')?.addEventListener('click', () => {
      this.close();
      this.callbacks.onSwitchToTawaf?.();
    });

    // Sub-nav tab clicks
    this.container.querySelectorAll('.sai-tab-btn').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const tab = (e.currentTarget as HTMLElement).getAttribute('data-tab') as RealSaiTab;
        if (tab && tab !== this.activeTab) {
          this.activeTab = tab;
          this.render();
        }
      });
    });

    // Main Advance Action Button
    this.container.querySelector('#btn-realsai-main-action')?.addEventListener('click', () => {
      this.nextLap();
    });

    // Prev Lap Button
    this.container.querySelector('#btn-realsai-prev-lap')?.addEventListener('click', () => {
      this.prevLap();
    });

    // Next Lap Button
    this.container.querySelector('#btn-realsai-next-lap')?.addEventListener('click', () => {
      this.nextLap();
    });

    // Lap Jump Pills
    this.container.querySelectorAll('.btn-jump-lap').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const lapStr = (e.currentTarget as HTMLElement).getAttribute('data-lap-target');
        if (lapStr) {
          const targetLap = parseInt(lapStr, 10);
          if (targetLap >= 1 && targetLap <= 7) {
            soundManager.playCheckpointSound();
            this.setLap(targetLap);
            this.scrollToTop();
          }
        }
      });
    });

    // Speech audio buttons
    this.container.querySelectorAll('.btn-listen-arabic').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const text = (e.currentTarget as HTMLElement).getAttribute('data-speak');
        if (text) {
          if (this.isSpeaking) {
            this.stopAudio();
          } else {
            this.speakText(text);
          }
        }
      });
    });
  }
}
