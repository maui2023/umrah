import { qiblaCompassService, QiblaState, PRESET_LOCATIONS } from '../simulation/QiblaCompassService';
import { soundManager } from '../audio/SoundManager';
import { TAWAF_DUAS } from '../data/duas';
import confetti from 'canvas-confetti';

export interface RealTawafSectionCallbacks {
  onSwitchToGame?: () => void;
  onLapChanged?: (lap: number) => void;
  onTawafFinished?: () => void;
}

export type RealTawafTab = 'compass_laps' | 'duas' | 'rukun' | 'fiqh';

export class RealTawafSection {
  private container: HTMLElement;
  private currentLap: number = 1;
  private activeTab: RealTawafTab = 'compass_laps';
  private selectedDuaLap: number = 1;
  private selectedRukunIndex: number = 0; // 0: Hajarul Aswad, 1: Iraqi, 2: Syami, 3: Yamani
  private isSpeaking: boolean = false;
  private isSectionOpen: boolean = false;
  private unsubscribeCompass?: () => void;
  private callbacks: RealTawafSectionCallbacks = {};
  private lastQiblaState: QiblaState | null = null;

  constructor(callbacks?: RealTawafSectionCallbacks) {
    if (callbacks) {
      this.callbacks = callbacks;
    }

    this.container = document.createElement('div');
    this.container.id = 'real-tawaf-section';
    this.container.className = 'fixed inset-0 z-50 overflow-y-auto bg-stone-950 text-stone-100 flex flex-col font-sans select-none transition-opacity duration-300';
    this.container.style.display = 'none';

    document.body.appendChild(this.container);
  }

  public open(initialLap: number = 1) {
    this.currentLap = Math.max(1, Math.min(7, initialLap));
    this.selectedDuaLap = this.currentLap;
    this.isSectionOpen = true;
    this.container.style.display = 'flex';

    // Start Compass Service
    qiblaCompassService.start();
    this.unsubscribeCompass = qiblaCompassService.subscribe((state) => {
      this.lastQiblaState = state;
      this.updateCompassDisplay(state);
    });

    this.render();
  }

  public close() {
    this.isSectionOpen = false;
    this.container.style.display = 'none';
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
    this.callbacks.onLapChanged?.(this.currentLap);
    this.render();
  }

  private stopAudio() {
    soundManager.stopTalbiyahAudio();
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    this.isSpeaking = false;
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
        if (label) label.textContent = 'Berhenti Suara';
      } else {
        if (icon) icon.textContent = '🔊';
        if (label) label.textContent = 'Dengar Sebutan';
      }
    });
  }

  private nextLap() {
    if (this.currentLap < 7) {
      this.currentLap++;
      this.selectedDuaLap = this.currentLap;
      this.showIstilamBanner();
      soundManager.playIstilamSound();
      try {
        if ('vibrate' in navigator) navigator.vibrate(80);
      } catch {}

      this.callbacks.onLapChanged?.(this.currentLap);
      this.render();
    } else {
      // 7 Laps Completed!
      this.finishTawaf();
    }
  }

  private prevLap() {
    if (this.currentLap > 1) {
      this.currentLap--;
      this.selectedDuaLap = this.currentLap;
      this.callbacks.onLapChanged?.(this.currentLap);
      this.render();
    }
  }

  private resetLaps() {
    if (confirm('Adakah anda pasti ingin menetapkan semula kiraan ke Pusingan 1?')) {
      this.currentLap = 1;
      this.selectedDuaLap = 1;
      this.callbacks.onLapChanged?.(1);
      this.render();
    }
  }

  private finishTawaf() {
    soundManager.playCompletionFanfare();
    confetti({
      particleCount: 100,
      spread: 70,
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
    modal.className = 'fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md select-none font-sans overflow-hidden animate-fade-in';
    modal.innerHTML = `
      <div class="relative w-full max-w-lg bg-stone-900 border-2 border-emerald-500/60 rounded-3xl shadow-2xl p-6 sm:p-7 text-stone-100 space-y-4">
        <div class="text-center space-y-2">
          <div class="w-16 h-16 rounded-3xl bg-gradient-to-br from-emerald-400 to-teal-600 text-stone-950 flex items-center justify-center text-3xl mx-auto shadow-lg shadow-emerald-500/30">
            🏆
          </div>
          <span class="text-xs uppercase font-extrabold tracking-widest text-emerald-400">ALHAMDULILLAH</span>
          <h2 class="text-2xl font-bold text-white">7 Pusingan Tawaf Selesai!</h2>
          <p class="text-xs text-stone-300 leading-relaxed">
            Semoga tawaf anda diterima oleh Allah SWT sebagai amalan yang mabrur dan diampuni segala dosa.
          </p>
        </div>

        <!-- Checklist of Sunnah After Tawaf -->
        <div class="p-4 rounded-2xl bg-stone-950/80 border border-emerald-500/30 space-y-2.5 text-xs">
          <div class="font-bold text-emerald-300 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
            <span>✨</span>
            <span>Sunnah Seterusnya Selepas Tawaf:</span>
          </div>
          <div class="space-y-2 text-stone-300">
            <div class="flex items-start gap-2">
              <span class="text-emerald-400 font-bold shrink-0">1.</span>
              <span><strong>Tutup Semula Bahu Kanan</strong> bagi lelaki (tamatkan sunnah Idtiba').</span>
            </div>
            <div class="flex items-start gap-2">
              <span class="text-emerald-400 font-bold shrink-0">2.</span>
              <span><strong>Solat Sunat Tawaf 2 Rakaat</strong> di belakang Maqam Ibrahim (atau di mana-mana ruang dalam Masjidil Haram).</span>
            </div>
            <div class="flex items-start gap-2">
              <span class="text-emerald-400 font-bold shrink-0">3.</span>
              <span><strong>Berdoa di Multazam</strong> (antara Hajarul Aswad dan pintu Kaabah jika ada ruang).</span>
            </div>
            <div class="flex items-start gap-2">
              <span class="text-emerald-400 font-bold shrink-0">4.</span>
              <span><strong>Minum Air Zamzam</strong> dengan membaca Bismillah dan doa hajat, lalu sapu ke wajah.</span>
            </div>
            <div class="flex items-start gap-2">
              <span class="text-emerald-400 font-bold shrink-0">5.</span>
              <span><strong>Menuju ke Bukit Safa</strong> untuk memulakan ibadah Sa'i 7 pusingan.</span>
            </div>
          </div>
        </div>

        <div class="flex items-center gap-2 pt-2">
          <button id="btn-close-completion" class="flex-1 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg active:scale-95 transition cursor-pointer text-center">
            Tutup & Teruskan Ibadah
          </button>
          <button id="btn-completion-switch-game" class="py-3 px-4 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 font-bold text-xs transition cursor-pointer text-center flex items-center gap-1.5">
            <span>🎮</span>
            <span>Simulasi 3D</span>
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);
    modal.querySelector('#btn-close-completion')?.addEventListener('click', () => modal.remove());
    modal.querySelector('#btn-completion-switch-game')?.addEventListener('click', () => {
      modal.remove();
      this.callbacks.onSwitchToGame?.();
    });
  }

  private render() {
    this.container.innerHTML = `
      <!-- Sticky Header -->
      <header class="sticky top-0 z-40 bg-stone-900/95 backdrop-blur-md border-b border-amber-600/30 px-3 sm:px-6 py-2.5 flex items-center justify-between shadow-xl">
        <div class="flex items-center gap-2.5 min-w-0">
          <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-700 text-stone-950 flex items-center justify-center text-xl font-bold shrink-0 shadow-md shadow-amber-500/20">
            🕋
          </div>
          <div class="min-w-0">
            <div class="flex items-center gap-1.5">
              <span class="text-[10px] uppercase font-extrabold tracking-widest text-amber-400">MOD REAL TAWAF</span>
              <span class="px-1.5 py-0.2 rounded text-[9px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">Ibadah Nyata</span>
            </div>
            <h1 class="text-sm sm:text-base font-bold text-white truncate">Kompas Kiblat, Pusingan & Doa</h1>
          </div>
        </div>

        <!-- Top Right Actions -->
        <div class="flex items-center gap-2 shrink-0">
          <button id="btn-switch-to-game" title="Buka semula simulasi visual 3D" class="px-3 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 border border-stone-600/80 active:scale-95 text-xs font-bold text-amber-300 flex items-center gap-1.5 transition cursor-pointer shadow-md">
            <span>🎮</span>
            <span class="hidden sm:inline">Simulasi 3D</span>
            <span class="sm:hidden">3D</span>
          </button>
        </div>
      </header>

      <!-- Navigation Tabs -->
      <nav class="bg-stone-950/90 border-b border-stone-800/80 px-2 py-2 flex items-center justify-center gap-1.5 overflow-x-auto scrollbar-none sticky top-[57px] z-30">
        <button data-tab="compass_laps" class="nav-tab px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
          this.activeTab === 'compass_laps' ? 'bg-amber-500 text-stone-950 shadow-md font-extrabold' : 'bg-stone-900 text-stone-300 hover:bg-stone-800'
        }">
          <span>🧭</span>
          <span>Kompas & Pusingan</span>
        </button>

        <button data-tab="duas" class="nav-tab px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
          this.activeTab === 'duas' ? 'bg-amber-500 text-stone-950 shadow-md font-extrabold' : 'bg-stone-900 text-stone-300 hover:bg-stone-800'
        }">
          <span>🤲</span>
          <span>Doa 7 Pusingan</span>
        </button>

        <button data-tab="rukun" class="nav-tab px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
          this.activeTab === 'rukun' ? 'bg-amber-500 text-stone-950 shadow-md font-extrabold' : 'bg-stone-900 text-stone-300 hover:bg-stone-800'
        }">
          <span>🕋</span>
          <span>4 Rukun Kaabah</span>
        </button>

        <button data-tab="fiqh" class="nav-tab px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
          this.activeTab === 'fiqh' ? 'bg-amber-500 text-stone-950 shadow-md font-extrabold' : 'bg-stone-900 text-stone-300 hover:bg-stone-800'
        }">
          <span>📜</span>
          <span>Syarat Sah & Fiqh</span>
        </button>
      </nav>

      <!-- Main Body Container -->
      <main class="flex-1 w-full max-w-4xl mx-auto p-3 sm:p-5 space-y-4">
        ${this.renderActiveTabContent()}
      </main>

      <!-- Footer Info -->
      <footer class="py-4 text-center text-stone-500 text-[11px] border-t border-stone-900">
        Simulasi & Aplikasi Ibadah Umrah • Menghadap Kaabah di Masjidil Haram (21.4225° N, 39.8262° E)
      </footer>
    `;

    this.bindEvents();
    if (this.lastQiblaState) {
      this.updateCompassDisplay(this.lastQiblaState);
    }
  }

  private renderActiveTabContent(): string {
    switch (this.activeTab) {
      case 'compass_laps':
        return this.renderCompassAndLapsTab();
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

  /**
   * TAB 1: Real Qibla Compass + 7-Lap Tracker + Quick Current Lap Dua
   */
  private renderCompassAndLapsTab(): string {
    const dua = TAWAF_DUAS[this.currentLap] || TAWAF_DUAS[1];
    const isFirstThreeLaps = this.currentLap <= 3;

    return `
      <div class="space-y-4">
        
        <!-- COMPASS SECTION -->
        <div class="bg-gradient-to-b from-stone-900 to-stone-900/90 rounded-3xl p-4 sm:p-6 border border-amber-600/30 shadow-2xl relative overflow-hidden">
          
          <!-- Section Title & Location Bar -->
          <div class="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-stone-800/80">
            <div class="flex items-center gap-2">
              <span class="text-lg">🧭</span>
              <div>
                <h2 class="text-sm sm:text-base font-bold text-white">Kompas Arah Kiblat (Kaabah)</h2>
                <div class="text-[11px] text-stone-400 flex items-center gap-1.5">
                  <span id="qibla-location-label">📍 Mengesan Lokasi...</span>
                  <span id="qibla-distance-label" class="text-amber-400 font-medium"></span>
                </div>
              </div>
            </div>

            <!-- Location Preset Selector -->
            <div class="flex items-center gap-1.5">
              <select id="select-qibla-location" class="bg-stone-950 border border-stone-700 rounded-xl px-2.5 py-1 text-xs text-stone-200 focus:outline-none focus:border-amber-500 cursor-pointer">
                <option value="gps">📍 GPS Semasa (Automatik)</option>
                ${PRESET_LOCATIONS.map((p) => `<option value="${p.id}">${p.name}</option>`).join('')}
              </select>
            </div>
          </div>

          <!-- Compass Alignment Alert Banner -->
          <div id="qibla-align-banner" class="mt-3 p-2.5 rounded-2xl bg-stone-950/80 border border-stone-800 text-center transition-all">
            <span id="qibla-align-text" class="text-xs font-bold text-stone-300">
              Pusingkan peranti anda untuk mencari arah Kaabah...
            </span>
          </div>

          <!-- Central Rotating Compass Dial -->
          <div class="relative flex items-center justify-center my-5 sm:my-6">
            <div class="relative w-[240px] h-[240px] sm:w-[280px] sm:h-[280px] flex items-center justify-center">
              
              <!-- Compass Outer Ring -->
              <div id="compass-rose" class="absolute inset-0 rounded-full border-4 border-stone-800/80 bg-stone-950/70 shadow-[0_0_30px_rgba(0,0,0,0.8)] flex items-center justify-center transition-transform duration-100 ease-out">
                
                <!-- Cardinal Points -->
                <span class="absolute top-2 font-mono font-extrabold text-rose-500 text-sm">U (N)</span>
                <span class="absolute right-3 font-mono font-bold text-stone-400 text-xs">T (E)</span>
                <span class="absolute bottom-2 font-mono font-bold text-stone-400 text-xs">S (S)</span>
                <span class="absolute left-3 font-mono font-bold text-stone-400 text-xs">B (W)</span>

                <!-- Degree Tick Rings (SVG) -->
                <svg viewBox="0 0 200 200" class="w-full h-full opacity-40">
                  <circle cx="100" cy="100" r="90" fill="none" stroke="#78716c" stroke-width="1.5" stroke-dasharray="2, 6" />
                  <circle cx="100" cy="100" r="80" fill="none" stroke="#44403c" stroke-width="1" />
                </svg>

                <!-- Qibla Target Marker on Rose (Points towards Kaabah on the compass bezel) -->
                <div id="compass-qibla-marker" class="absolute w-full h-full pointer-events-none transition-transform duration-100" style="transform: rotate(0deg);">
                  <div class="absolute top-1 left-1/2 -translate-x-1/2 flex flex-col items-center">
                    <span class="text-base filter drop-shadow-[0_0_6px_#f59e0b]">🕋</span>
                    <span class="text-[8px] font-bold text-amber-400 bg-stone-900/90 px-1 rounded border border-amber-500/40">KIBLAT</span>
                  </div>
                </div>

              </div>

              <!-- Center Dial (Static Heading & Degree Readout) -->
              <div class="relative z-10 w-28 h-28 sm:w-32 sm:h-32 rounded-full bg-stone-900/95 border-2 border-amber-500/40 shadow-inner flex flex-col items-center justify-center text-center p-2">
                <span id="compass-needle-kaabah" class="text-2xl animate-pulse">🕋</span>
                <span id="compass-heading-text" class="text-base sm:text-lg font-mono font-bold text-white leading-none mt-1">0°</span>
                <span id="compass-direction-cardinal" class="text-[10px] font-semibold text-amber-300 uppercase mt-0.5">Utara</span>
                <span id="compass-qibla-bearing" class="text-[9px] text-stone-400">Kiblat: 293°</span>
              </div>

              <!-- Real Dynamic Needle Pointing Towards Qibla -->
              <div id="compass-needle-wrapper" class="absolute inset-0 pointer-events-none flex items-center justify-center transition-transform duration-100 ease-out" style="transform: rotate(0deg);">
                <!-- Arrow Tip Pointing to Qibla -->
                <div class="absolute top-3 left-1/2 -translate-x-1/2 flex flex-col items-center">
                  <div class="w-0 h-0 border-l-[9px] border-l-transparent border-r-[9px] border-r-transparent border-b-[24px] border-b-emerald-400 drop-shadow-[0_0_8px_#10b981]"></div>
                </div>
              </div>

            </div>
          </div>

          <!-- iOS Permission Button (if needed) -->
          <div id="ios-permission-box" class="text-center my-2" style="display: none;">
            <button id="btn-request-ios-permission" class="px-4 py-2 rounded-xl bg-amber-500 text-stone-950 font-bold text-xs shadow-md active:scale-95 transition cursor-pointer">
              📲 Aktifkan Sensor Kompas Telefon (iOS)
            </button>
          </div>

          <!-- Desktop / Manual Rotation Controls (Ensures it ALWAYS works even without magnetometer) -->
          <div class="pt-3 border-t border-stone-800/80 space-y-2">
            <div class="flex items-center justify-between text-xs text-stone-400">
              <span class="flex items-center gap-1">
                <span>🎛️</span>
                <span>Kawalan Arah / Seret Kompas Manual:</span>
              </span>
              <button id="btn-quick-align-qibla" class="text-[11px] font-bold text-emerald-400 hover:text-emerald-300 underline cursor-pointer">
                Tepat Menghadap Kiblat
              </button>
            </div>
            
            <div class="flex items-center gap-3">
              <button id="btn-rot-left-15" class="px-2.5 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-xs font-bold transition">↺ -15°</button>
              <input id="slider-manual-heading" type="range" min="0" max="360" value="0" class="flex-1 accent-amber-500 h-2 bg-stone-800 rounded-lg cursor-pointer" />
              <button id="btn-rot-right-15" class="px-2.5 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-xs font-bold transition">↻ +15°</button>
            </div>
          </div>

        </div>

        <!-- LAP COUNTER SECTION -->
        <div class="bg-gradient-to-b from-stone-900 to-stone-900/90 rounded-3xl p-4 sm:p-6 border border-emerald-600/30 shadow-2xl space-y-4">
          
          <!-- Header Lap Status -->
          <div class="flex items-center justify-between pb-3 border-b border-stone-800/80">
            <div>
              <span class="text-[10px] uppercase font-extrabold tracking-widest text-emerald-400">KIRAAN PUSINGAN TAWAF</span>
              <h2 class="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
                <span>Pusingan Ke-${this.currentLap}</span>
                <span class="text-stone-400 font-normal text-sm">/ 7 Pusingan</span>
              </h2>
            </div>

            <!-- Sunnah Badge -->
            <div class="text-right">
              <span class="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${
                isFirstThreeLaps ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
              }">
                <span>${isFirstThreeLaps ? '🏃 Raml & Idtiba\'' : '🚶 Berjalan Biasa'}</span>
              </span>
            </div>
          </div>

          <!-- 7-Lap Visual Step Dots -->
          <div class="grid grid-cols-7 gap-1.5 sm:gap-2">
            ${[1, 2, 3, 4, 5, 6, 7]
              .map((lap) => {
                const isDone = lap < this.currentLap;
                const isCurrent = lap === this.currentLap;
                return `
                  <button data-select-lap="${lap}" class="btn-lap-dot flex flex-col items-center justify-center p-2 rounded-2xl border transition-all cursor-pointer ${
                    isDone
                      ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300'
                      : isCurrent
                      ? 'bg-amber-500 text-stone-950 font-extrabold border-amber-400 ring-2 ring-amber-400/50 shadow-lg scale-105'
                      : 'bg-stone-950/60 border-stone-800 text-stone-500 hover:border-stone-700'
                  }">
                    <span class="text-[10px] sm:text-xs">${isDone ? '✓' : isCurrent ? '🕋' : lap}</span>
                    <span class="text-[9px] mt-0.5 hidden sm:inline">P.${lap}</span>
                  </button>
                `;
              })
              .join('')}
          </div>

          <!-- Sunnah Guideline for Active Lap -->
          <div class="p-3 rounded-2xl bg-stone-950/60 border border-stone-800 text-xs text-stone-300 flex items-start gap-2.5">
            <span class="text-lg shrink-0">${isFirstThreeLaps ? '🏃' : '🚶'}</span>
            <div class="space-y-0.5 leading-relaxed">
              <strong class="text-white">Panduan Sunnah Pusingan Ke-${this.currentLap}:</strong>
              <div>${dua.sunnahNote || 'Kekalkan Kaabah sentiasa di sebelah kiri bahu anda.'}</div>
            </div>
          </div>

          <!-- PRIMARY ACTION BUTTON: Next Lap (Huge, Touch-Friendly) -->
          <div class="pt-2">
            <button id="btn-next-lap" class="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 active:scale-[0.98] text-white font-bold text-base sm:text-lg shadow-xl shadow-emerald-950/50 border border-emerald-400/40 flex items-center justify-center gap-3 transition cursor-pointer">
              <span>✓</span>
              <span>${
                this.currentLap < 7
                  ? `Selesai Pusingan ${this.currentLap} ➔ Ke Pusingan ${this.currentLap + 1}`
                  : 'Selesai Pusingan 7 (Tamat Tawaf) 🏆'
              }</span>
            </button>
          </div>

          <!-- SECONDARY ACTIONS (Istilam, Undo, Reset) -->
          <div class="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
            <button id="btn-istilam-action" class="py-2.5 px-3 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 font-bold flex items-center justify-center gap-1.5 active:scale-95 transition cursor-pointer">
              <span>✋</span>
              <span>Lafaz Istilam</span>
            </button>
            <button id="btn-prev-lap" class="py-2.5 px-3 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 font-semibold flex items-center justify-center gap-1.5 active:scale-95 transition cursor-pointer">
              <span>↩️</span>
              <span>Undur Pusingan</span>
            </button>
            <button id="btn-reset-laps" class="col-span-2 sm:col-span-1 py-2.5 px-3 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-400 hover:text-rose-400 font-semibold flex items-center justify-center gap-1.5 active:scale-95 transition cursor-pointer">
              <span>🔄</span>
              <span>Set Semula</span>
            </button>
          </div>

        </div>

        <!-- QUICK CURRENT DUA CARD -->
        <div class="bg-gradient-to-b from-stone-900 to-stone-900/90 rounded-3xl p-4 sm:p-6 border border-amber-600/30 shadow-2xl space-y-3">
          <div class="flex items-center justify-between pb-2 border-b border-stone-800">
            <div class="flex items-center gap-2">
              <span class="text-base">🤲</span>
              <div>
                <span class="text-[10px] uppercase font-bold text-amber-400">BACAAN SEMASA</span>
                <h3 class="text-sm font-bold text-white">${dua.title}</h3>
              </div>
            </div>
            <button data-switch-tab="duas" class="text-xs text-amber-400 hover:text-amber-300 underline font-semibold cursor-pointer">
              Buka Semua Doa ➔
            </button>
          </div>

          <!-- Arabic Text -->
          <div class="bg-stone-950/80 p-4 rounded-2xl border border-stone-800/80 text-right">
            <p class="font-arabic text-xl sm:text-2xl text-amber-200 leading-loose" dir="rtl">
              ${dua.arabic}
            </p>
          </div>

          <!-- Transliteration & Meaning -->
          <div class="space-y-1.5 text-xs text-stone-300">
            <p class="italic text-stone-400">"${dua.transliteration}"</p>
            <p class="text-stone-200 leading-relaxed"><strong class="text-amber-400">Maksud:</strong> ${dua.translation}</p>
          </div>

          <!-- Speech audio button -->
          <div class="pt-2 flex items-center justify-end">
            <button class="btn-listen-dua px-3 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-xs font-bold text-stone-200 flex items-center gap-1.5 transition cursor-pointer" data-arabic="${encodeURIComponent(dua.arabic)}">
              <span class="speech-icon">🔊</span>
              <span class="speech-label">Dengar Sebutan</span>
            </button>
          </div>
        </div>

      </div>
    `;
  }

  /**
   * TAB 2: Full 7-Lap Duas
   */
  private renderDuasTab(): string {
    return `
      <div class="space-y-4">
        <div class="text-center space-y-1">
          <h2 class="text-lg sm:text-xl font-bold text-white">Senarai Bacaan & Doa 7 Pusingan Tawaf</h2>
          <p class="text-xs text-stone-400">Pilih pusingan di bawah untuk melihat teks Arab, rumi, dan terjemahan penuh.</p>
        </div>

        <!-- Lap Pill Selector -->
        <div class="flex items-center justify-center gap-1.5 flex-wrap">
          ${[1, 2, 3, 4, 5, 6, 7]
            .map((lap) => `
              <button data-dua-lap="${lap}" class="btn-dua-lap-pill px-3 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                this.selectedDuaLap === lap
                  ? 'bg-amber-500 text-stone-950 shadow-md font-extrabold'
                  : 'bg-stone-900 border border-stone-800 text-stone-300 hover:bg-stone-800'
              }">
                Pusingan ${lap}
              </button>
            `)
            .join('')}
        </div>

        <!-- Selected Dua Detail Card -->
        ${(() => {
          const dua = TAWAF_DUAS[this.selectedDuaLap] || TAWAF_DUAS[1];
          return `
            <div class="bg-stone-900 rounded-3xl p-5 sm:p-6 border border-amber-600/30 shadow-2xl space-y-4">
              <div class="flex items-center justify-between pb-3 border-b border-stone-800">
                <div>
                  <span class="text-[10px] uppercase font-bold text-amber-400">PUSINGAN KE-${this.selectedDuaLap}</span>
                  <h3 class="text-base sm:text-lg font-bold text-white">${dua.title}</h3>
                </div>
                <button class="btn-listen-dua px-3.5 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-bold text-xs flex items-center gap-1.5 border border-amber-500/30 transition cursor-pointer" data-arabic="${encodeURIComponent(dua.arabic)}">
                  <span class="speech-icon">🔊</span>
                  <span class="speech-label">Dengar Sebutan</span>
                </button>
              </div>

              <!-- Arabic -->
              <div class="bg-stone-950/80 p-5 rounded-2xl border border-stone-800 text-right">
                <p class="font-arabic text-2xl sm:text-3xl text-amber-200 leading-loose" dir="rtl">
                  ${dua.arabic}
                </p>
              </div>

              <!-- Transliteration -->
              <div class="p-3.5 rounded-2xl bg-stone-950/50 border border-stone-800/80 text-xs">
                <div class="text-[10px] uppercase font-bold text-emerald-400 mb-1">Sebutan Rumi:</div>
                <p class="italic text-stone-300 leading-relaxed font-sans">${dua.transliteration}</p>
              </div>

              <!-- Translation -->
              <div class="p-3.5 rounded-2xl bg-stone-950/50 border border-stone-800/80 text-xs">
                <div class="text-[10px] uppercase font-bold text-amber-400 mb-1">Terjemahan Bahasa Melayu:</div>
                <p class="text-stone-200 leading-relaxed">${dua.translation}</p>
              </div>

              <!-- Sunnah & Fiqh Note -->
              <div class="p-3 rounded-2xl bg-amber-950/30 border border-amber-700/40 text-xs text-amber-200 flex items-start gap-2">
                <span class="text-base shrink-0">💡</span>
                <div class="leading-relaxed">
                  <strong>Nota Sunnah:</strong> ${dua.sunnahNote || 'Kekalkan Kaabah di sebelah kiri bahu.'}
                </div>
              </div>
            </div>
          `;
        })()}

      </div>
    `;
  }

  /**
   * TAB 3: 4 Rukun Kaabah (Penjuru Kaabah)
   */
  private renderRukunTab(): string {
    const RUKUN_LIST = [
      {
        id: 0,
        title: 'Hajarul Aswad (Garisan Mula & Tamat)',
        badge: 'Rukun 1',
        icon: '🕋',
        color: 'border-emerald-500/50',
        subtitle: 'Bucu timur Kaabah, permulaan & pengakhiran setiap pusingan.',
        fadhilat: 'Batu dari syurga. Disunatkan Istilam (mengangkat tangan kanan sambil melafazkan Bismillahi Allahu Akbar).',
        arabicDua: 'بِسْمِ اللَّهِ، اللَّهُ أَكْبَرُ، اللَّهُمَّ إِيمَانًا بِكَ، وَتَصْدِيقًا بِكِتَابِكَ، وَوَفَاءً بِعَهْدِكَ، وَاتِّبَاعًا لِسُنَّةِ نَبِيِّكَ مُحَمَّدٍ ﷺ',
        transliteration: 'Bismillahi Allahu Akbar, Allahumma iimaanam bika, wa tashdiiqam bikitaabika, wa wafaa-am bi\'ahdika, wattibaa\'al lisunnati Nabiyyika Muhammadin SAW.',
        translation: 'Dengan nama Allah, Allah Maha Besar. Ya Allah, kerana beriman kepada-Mu, membenarkan kitab-Mu, menepati janji-Mu, dan mengikut sunnah Nabi-Mu Muhammad ﷺ.',
        sunnahTips: [
          'Angkat tangan kanan menghadap Hajarul Aswad tanpa menolak orang lain.',
          'Tidak disunatkan mencium tapak tangan selepas istilam dari jauh.',
          'Lelaki disunatkan Idtiba\' (bahu kanan terbuka) dan Raml (lari anak) pada 3 pusingan pertama.'
        ]
      },
      {
        id: 1,
        title: 'Rukun Iraqi & Hijr Ismail (Pancuran Emas)',
        badge: 'Rukun 2',
        icon: '🌧️',
        color: 'border-amber-500/50',
        subtitle: 'Bucu utara Kaabah menghadap Iraq dan dinding separa bulatan Hateem.',
        fadhilat: 'Pancuran Emas (Mizabur Rahmah) terletak di atas Hijr Ismail. Wajib tawaf di LUAR dinding Hijr Ismail.',
        arabicDua: 'اللَّهُمَّ إِنَّ هَذَا الْبَيْتَ بَيْتُكَ، وَالْحَرَمَ حَرَمُكَ، وَالأَمْنَ أَمْنُكَ، وَالْعَبْدَ عَبْدُكَ، وَهَذَا مَقَامُ الْعَائِذِ بِكَ مِنَ النَّارِ',
        transliteration: 'Allahumma inna haadzal-baita baituka, wal-harama haramuka, wal-amna amnuka, wal-\'abda \'abduka, wa haadza maqaamul-\'a-idzi bika minan-naar.',
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
        color: 'border-blue-500/50',
        subtitle: 'Bucu barat Kaabah menghadap arah negeri Syam (Jordan, Syria, Palestin).',
        fadhilat: 'Peringatan keteguhan iman dan memohon perlindungan daripada syirik, keraguan, dan akhlak buruk.',
        arabicDua: 'اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الشَّكِّ وَالشِّرْكِ، وَالشِّقَاقِ وَالنِّفَاقِ، وَسُوءِ الأَخْلاَقِ، وَسُوءِ الْمُنْقَلَبِ فِي الْمَالِ وَالأَهْلِ وَالْوَلَدِ',
        transliteration: 'Allahumma inni a\'uudzu bika minasy-syakki wasy-syirki, wasy-syiqaaqi wan-nifaaqi, wa suu-il akhlaaq, wa suu-il munqalabi fil-maali wal-ahli wal-walad.',
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
        color: 'border-emerald-500/50',
        subtitle: 'Bucu selatan menghadap Yaman. Tempat permulaan doa agung Rabbana Aatina.',
        fadhilat: 'Batu asas binaan Nabi Ibrahim a.s. Sunnah mengusap bucu ini dengan tangan kanan (jika dekat) atau berisyarat dari jauh.',
        arabicDua: 'رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ، وَأَدْخِلْنَا الْجَنَّةَ مَعَ الأَبْرَارِ، يَا عَزِيزُ يَا غَفَّارُ',
        transliteration: 'Rabbana aatina fid-dunya hasanah, wa fil-aakhirati hasanah, wa qinaa \'adzaaban-naar, wa adkhilnal-jannata ma\'al-abraar, ya \'Aziizu ya Ghaffaar.',
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
      <div class="space-y-4">
        <div class="text-center space-y-1">
          <h2 class="text-lg sm:text-xl font-bold text-white">4 Rukun (Bucu) Kaabah & Fadhilatnya</h2>
          <p class="text-xs text-stone-400">Kaabah mempunyai 4 rukun mengikut arah mata angin. Pilih rukun di bawah untuk mendalami sunnah & doanya:</p>
        </div>

        <!-- 4 Rukun Selector Grid -->
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-2">
          ${RUKUN_LIST.map(
            (r) => `
            <button data-rukun-idx="${r.id}" class="btn-rukun-select p-3 rounded-2xl border text-left transition cursor-pointer ${
              this.selectedRukunIndex === r.id
                ? 'bg-amber-500 text-stone-950 font-extrabold border-amber-400 ring-2 ring-amber-400/50 shadow-lg'
                : 'bg-stone-900 border-stone-800 text-stone-300 hover:bg-stone-800'
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

        <!-- Active Rukun Detail Card -->
        <div class="bg-stone-900 rounded-3xl p-5 sm:p-6 border ${currentRukun.color} shadow-2xl space-y-4">
          <div class="flex items-center justify-between pb-3 border-b border-stone-800">
            <div>
              <span class="text-[10px] uppercase font-bold text-amber-400">${currentRukun.badge}</span>
              <h3 class="text-base sm:text-lg font-bold text-white">${currentRukun.title}</h3>
              <p class="text-xs text-stone-400 mt-0.5">${currentRukun.subtitle}</p>
            </div>
            <button class="btn-listen-dua px-3.5 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-bold text-xs flex items-center gap-1.5 border border-amber-500/30 transition cursor-pointer" data-arabic="${encodeURIComponent(currentRukun.arabicDua)}">
              <span class="speech-icon">🔊</span>
              <span class="speech-label">Dengar Sebutan</span>
            </button>
          </div>

          <!-- Arabic Dua -->
          <div class="bg-stone-950/80 p-5 rounded-2xl border border-stone-800 text-right">
            <p class="font-arabic text-2xl sm:text-3xl text-amber-200 leading-loose" dir="rtl">
              ${currentRukun.arabicDua}
            </p>
          </div>

          <!-- Transliteration & Meaning -->
          <div class="space-y-2 text-xs">
            <div class="p-3 rounded-xl bg-stone-950/50 border border-stone-800">
              <div class="text-[10px] uppercase font-bold text-emerald-400 mb-0.5">Sebutan Rumi:</div>
              <p class="italic text-stone-300 leading-relaxed">${currentRukun.transliteration}</p>
            </div>
            <div class="p-3 rounded-xl bg-stone-950/50 border border-stone-800">
              <div class="text-[10px] uppercase font-bold text-amber-400 mb-0.5">Terjemahan Maksud:</div>
              <p class="text-stone-200 leading-relaxed">${currentRukun.translation}</p>
            </div>
          </div>

          <!-- Sunnah Points -->
          <div class="p-4 rounded-2xl bg-stone-950/80 border border-emerald-500/30 space-y-2 text-xs">
            <div class="font-bold text-emerald-300 flex items-center gap-1.5">
              <span>📌</span>
              <span>Panduan Sunnah & Hukum Fiqh Penting:</span>
            </div>
            <ul class="space-y-1.5 text-stone-300 list-disc list-inside">
              ${currentRukun.sunnahTips.map((tip) => `<li>${tip}</li>`).join('')}
            </ul>
          </div>
        </div>

      </div>
    `;
  }

  /**
   * TAB 4: Fiqh, Syarat Sah & Larangan Tawaf
   */
  private renderFiqhTab(): string {
    return `
      <div class="space-y-4">
        <div class="text-center space-y-1">
          <h2 class="text-lg sm:text-xl font-bold text-white">Syarat Sah, Rukun & Fiqh Tawaf</h2>
          <p class="text-xs text-stone-400">Garis panduan mengikut mazhab Syafi'i untuk memastikan tawaf anda sah dan sempurna.</p>
        </div>

        <!-- 7 Syarat Sah Tawaf -->
        <div class="bg-stone-900 rounded-3xl p-5 border border-amber-600/30 space-y-3">
          <div class="flex items-center gap-2 border-b border-stone-800 pb-2">
            <span class="text-xl">📜</span>
            <h3 class="font-bold text-white text-sm sm:text-base">7 Syarat Sah Tawaf (Wajib Dipenuhi)</h3>
          </div>

          <div class="space-y-2 text-xs text-stone-300">
            <div class="p-2.5 rounded-xl bg-stone-950/60 border border-stone-800 flex items-start gap-2.5">
              <span class="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center shrink-0">1</span>
              <div><strong>Suci Daripada Hadas:</strong> Wajib suci daripada hadas kecil (mempunyai wuduk) dan hadas besar. Jika batal wuduk, wajib ambil wuduk semula dan sambung dari pusingan terbatal.</div>
            </div>
            <div class="p-2.5 rounded-xl bg-stone-950/60 border border-stone-800 flex items-start gap-2.5">
              <span class="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center shrink-0">2</span>
              <div><strong>Suci Daripada Najis:</strong> Badan, pakaian ihram, dan tempat berjalan mestilah bersih daripada sebarang najis.</div>
            </div>
            <div class="p-2.5 rounded-xl bg-stone-950/60 border border-stone-800 flex items-start gap-2.5">
              <span class="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center shrink-0">3</span>
              <div><strong>Menutup Aurat:</strong> Menutup aurat seperti dalam solat (lelaki dari pusat ke lutut, wanita seluruh badan kecuali muka dan tapak tangan).</div>
            </div>
            <div class="p-2.5 rounded-xl bg-stone-950/60 border border-stone-800 flex items-start gap-2.5">
              <span class="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center shrink-0">4</span>
              <div><strong>Bermula Dari Hajarul Aswad:</strong> Wajib memulakan tawaf bertentangan dengan garisan Hajarul Aswad dan mengakhirinya di garisan yang sama.</div>
            </div>
            <div class="p-2.5 rounded-xl bg-stone-950/60 border border-stone-800 flex items-start gap-2.5">
              <span class="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center shrink-0">5</span>
              <div><strong>Kaabah Sentiasa di Sebelah Kiri:</strong> Bahu kiri mestilah sentiasa menghadap Kaabah sepanjang perjalanan tawaf. Dilarang memalingkan dada ke arah Kaabah semasa berjalan.</div>
            </div>
            <div class="p-2.5 rounded-xl bg-stone-950/60 border border-stone-800 flex items-start gap-2.5">
              <span class="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center shrink-0">6</span>
              <div><strong>Di Luar Kaabah & Hijr Ismail:</strong> Wajib tawaf di luar binaan Kaabah, Syazarwan (kaki dinding Kaabah), dan di luar dinding Hijr Ismail (Hateem).</div>
            </div>
            <div class="p-2.5 rounded-xl bg-stone-950/60 border border-stone-800 flex items-start gap-2.5">
              <span class="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center shrink-0">7</span>
              <div><strong>Cukup 7 Pusingan dengan Yakin:</strong> Menyempurnakan tepat 7 keliling tanpa ragu-ragu. Jika ragu bilangan pusingan, ambillah bilangan yang lebih sedikit dan tambah.</div>
            </div>
          </div>
        </div>

        <!-- Sunnah-Sunnah Tawaf -->
        <div class="bg-stone-900 rounded-3xl p-5 border border-emerald-600/30 space-y-3">
          <div class="flex items-center gap-2 border-b border-stone-800 pb-2">
            <span class="text-xl">🌟</span>
            <h3 class="font-bold text-white text-sm sm:text-base">Perkara Sunnah Semasa Tawaf</h3>
          </div>
          <ul class="space-y-2 text-xs text-stone-300 list-disc list-inside">
            <li><strong>Idtiba' (Lelaki):</strong> Meletakkan bahagian tengah kain ihram di bawah ketiak kanan dan kedua-dua hujungnya di atas bahu kiri sepanjang 7 pusingan tawaf.</li>
            <li><strong>Raml (Lari Anak Lelaki):</strong> Berlari-lari anak dengan langkah pendek pada 3 pusingan pertama (jika ruang tidak sesak). Pusingan ke-4 hingga ke-7 berjalan biasa.</li>
            <li><strong>Istilam:</strong> Mengangkat tangan kanan ke arah Hajarul Aswad sambil melafazkan <em>"Bismillahi Allahu Akbar"</em> pada setiap permulaan pusingan.</li>
            <li><strong>Mengusap Rukun Yamani:</strong> Mengusap dengan tangan kanan tanpa menciumnya, atau memberi isyarat tangan jika jauh.</li>
            <li><strong>Muwalat (Berturut-turut):</strong> Melakukan 7 pusingan secara berterusan tanpa putus waktu lama kecuali jika masuk waktu solat fardhu.</li>
            <li><strong>Solat Sunat Tawaf:</strong> Melakukan solat sunat 2 rakaat di belakang Maqam Ibrahim selepas selesai pusingan ke-7.</li>
          </ul>
        </div>

        <!-- Larangan Semasa Tawaf -->
        <div class="bg-stone-900 rounded-3xl p-5 border border-rose-600/30 space-y-3">
          <div class="flex items-center gap-2 border-b border-stone-800 pb-2">
            <span class="text-xl">⚠️</span>
            <h3 class="font-bold text-rose-300 text-sm sm:text-base">Kesilapan Lazim & Perkara Yang Mesti Dielakkan</h3>
          </div>
          <ul class="space-y-1.5 text-xs text-stone-300 list-disc list-inside">
            <li>Tawaf di dalam kawasan dinding Hijr Ismail (membatalkan pusingan tersebut).</li>
            <li>Memalingkan dada atau bahu menghadap Kaabah semasa berjalan ke hadapan.</li>
            <li>Menolak, menyiku, atau menyakiti jemaah lain semata-mata ingin mendekati Kaabah atau Hajarul Aswad.</li>
            <li>Berbual kosong atau sibuk mengambil video/swafoto berlebihan yang merosakkan kekhusyukan ibadah.</li>
            <li>Ragu-ragu terhadap kiraan pusingan kerana tidak memberi tumpuan.</li>
          </ul>
        </div>

      </div>
    `;
  }

  /**
   * Bind DOM Events
   */
  private bindEvents() {
    // Switch to Game mode button
    const btnSwitchGame = this.container.querySelector('#btn-switch-to-game');
    btnSwitchGame?.addEventListener('click', () => {
      this.close();
      this.callbacks.onSwitchToGame?.();
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

    // In-page tab switch buttons (e.g. "Buka Semua Doa")
    const switchTabBtns = this.container.querySelectorAll('[data-switch-tab]');
    switchTabBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        const tab = (btn as HTMLElement).dataset.switchTab as RealTawafTab;
        if (tab) {
          this.activeTab = tab;
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

    // Reset laps button
    const btnResetLaps = this.container.querySelector('#btn-reset-laps');
    btnResetLaps?.addEventListener('click', () => this.resetLaps());

    // Istilam button
    const btnIstilam = this.container.querySelector('#btn-istilam-action');
    btnIstilam?.addEventListener('click', () => {
      soundManager.playIstilamTakbir();
      try {
        if ('vibrate' in navigator) navigator.vibrate(60);
      } catch {}
      this.showIstilamBanner();
    });

    // Lap Dot Selection in Lap Tracker
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

    // Listen Dua (Speech synthesis)
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

    // iOS Permission Request
    const btnIosPerm = this.container.querySelector('#btn-request-ios-permission');
    btnIosPerm?.addEventListener('click', async () => {
      const granted = await qiblaCompassService.requestPermission();
      if (granted) {
        const box = this.container.querySelector('#ios-permission-box') as HTMLElement;
        if (box) box.style.display = 'none';
      }
    });

    // Manual Heading Slider & Rotate Buttons
    const sliderManual = this.container.querySelector('#slider-manual-heading') as HTMLInputElement;
    sliderManual?.addEventListener('input', () => {
      const deg = parseFloat(sliderManual.value);
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

    const btnQuickAlign = this.container.querySelector('#btn-quick-align-qibla');
    btnQuickAlign?.addEventListener('click', () => {
      qiblaCompassService.alignHeadingToQibla();
    });
  }

  private showIstilamBanner() {
    const existing = document.getElementById('istilam-temporary-banner');
    if (existing) existing.remove();

    const banner = document.createElement('div');
    banner.id = 'istilam-temporary-banner';
    banner.className = 'fixed bottom-6 left-1/2 -translate-x-1/2 z-50 max-w-sm w-[90%] p-4 rounded-2xl bg-stone-900 border-2 border-emerald-500 shadow-2xl text-center space-y-2 animate-bounce-short';
    banner.innerHTML = `
      <div class="flex items-center justify-center gap-1.5 text-emerald-400 font-extrabold text-xs uppercase tracking-wider">
        <span>✋</span>
        <span>ISTILAM HAJARUL ASWAD</span>
      </div>
      <p class="font-arabic text-xl text-amber-200 leading-normal" dir="rtl">
        بِسْمِ اللَّهِ، اللَّهُ أَكْبَرُ
      </p>
      <p class="text-xs text-stone-200">
        Angkat tangan kanan ke arah Hajarul Aswad sambil berzikir: <strong>"Bismillahi Allahu Akbar"</strong>.
      </p>
      <button id="btn-close-istilam-banner" class="mt-1 px-3 py-1 rounded-lg bg-emerald-600 text-white text-[11px] font-bold">
        Selesai Istilam
      </button>
    `;

    document.body.appendChild(banner);
    banner.querySelector('#btn-close-istilam-banner')?.addEventListener('click', () => banner.remove());
    setTimeout(() => {
      if (banner.parentElement) banner.remove();
    }, 4000);
  }

  /**
   * Real-time Compass UI updater (called on orientation / location tick)
   */
  private updateCompassDisplay(state: QiblaState) {
    if (!this.isSectionOpen || this.activeTab !== 'compass_laps') return;

    // Location Label & Distance
    const locLabel = this.container.querySelector('#qibla-location-label');
    if (locLabel) {
      locLabel.textContent = `📍 ${state.locationName}`;
    }

    const distLabel = this.container.querySelector('#qibla-distance-label');
    if (distLabel) {
      distLabel.textContent = `${state.distanceKm.toLocaleString()} km ke Kaabah`;
    }

    // Heading Readout
    const headingText = this.container.querySelector('#compass-heading-text');
    if (headingText) {
      headingText.textContent = `${state.heading}°`;
    }

    // Direction Cardinal
    const dirCard = this.container.querySelector('#compass-direction-cardinal');
    if (dirCard) {
      dirCard.textContent = this.getCardinalName(state.heading);
    }

    // Qibla Bearing Readout
    const qiblaBearing = this.container.querySelector('#compass-qibla-bearing');
    if (qiblaBearing) {
      qiblaBearing.textContent = `Kiblat: ${state.qiblaBearing}°`;
    }

    // Rotate Compass Rose (-heading so North stays on true North)
    const roseEl = this.container.querySelector('#compass-rose') as HTMLElement;
    if (roseEl) {
      roseEl.style.transform = `rotate(${-state.heading}deg)`;
    }

    // Rotate Needle Pointing to Kaabah (relative to device heading: state.relativeQibla)
    const needleWrapper = this.container.querySelector('#compass-needle-wrapper') as HTMLElement;
    if (needleWrapper) {
      needleWrapper.style.transform = `rotate(${state.relativeQibla}deg)`;
    }

    // Qibla Target Marker on Rose (fixed at state.qiblaBearing on the rose dial)
    const markerEl = this.container.querySelector('#compass-qibla-marker') as HTMLElement;
    if (markerEl) {
      markerEl.style.transform = `rotate(${state.qiblaBearing}deg)`;
    }

    // Update Manual Slider position if changed externally
    const slider = this.container.querySelector('#slider-manual-heading') as HTMLInputElement;
    if (slider && document.activeElement !== slider) {
      slider.value = String(state.heading);
    }

    // iOS Permission Box visibility
    const iosBox = this.container.querySelector('#ios-permission-box') as HTMLElement;
    if (iosBox) {
      iosBox.style.display = state.needsPermission ? 'block' : 'none';
    }

    // Alignment Banner & Glow
    const banner = this.container.querySelector('#qibla-align-banner') as HTMLElement;
    const bannerText = this.container.querySelector('#qibla-align-text') as HTMLElement;
    const needleKaabah = this.container.querySelector('#compass-needle-kaabah') as HTMLElement;

    if (banner && bannerText) {
      if (state.isFacingQibla) {
        banner.className =
          'mt-3 p-2.5 rounded-2xl bg-emerald-950/90 border-2 border-emerald-400 text-center shadow-[0_0_20px_rgba(16,185,129,0.35)] transition-all';
        bannerText.innerHTML =
          '<span class="text-emerald-300 font-extrabold flex items-center justify-center gap-1.5"><span>✨</span><span>TEPAT MENGHADAP KIBLAT (KAABAH)!</span><span>✨</span></span>';
        if (needleKaabah) {
          needleKaabah.className = 'text-2xl filter drop-shadow-[0_0_10px_#10b981] scale-110 transition-transform';
        }
      } else {
        banner.className = 'mt-3 p-2.5 rounded-2xl bg-stone-950/80 border border-stone-800 text-center transition-all';
        let diff = state.relativeQibla;
        let turnDirection = 'kanan';
        let angleToTurn = diff;
        if (diff > 180) {
          turnDirection = 'kiri';
          angleToTurn = 360 - diff;
        }

        bannerText.innerHTML = `Pusingkan telefon ke <strong>${turnDirection} (${angleToTurn}°)</strong> ke arah ikon Kaabah 🕋`;
        if (needleKaabah) {
          needleKaabah.className = 'text-2xl filter none scale-100 transition-transform';
        }
      }
    }
  }

  private getCardinalName(deg: number): string {
    const cardinals = [
      'Utara (N)',
      'Timur Laut (NE)',
      'Timur (E)',
      'Tenggara (SE)',
      'Selatan (S)',
      'Barat Daya (SW)',
      'Barat (W)',
      'Barat Laut (NW)'
    ];
    const index = Math.round(((deg % 360) / 45)) % 8;
    return cardinals[index];
  }
}
