import { soundManager } from '../audio/SoundManager';
import {
  SAI_LAPS,
  GREEN_LIGHT_INFO,
  AYAT_LAZIM_SAI,
  SURAH_LAZIM_SAI,
  ZIKIR_LAZIM_SAI,
  SAI_FIQH_GUIDE
} from '../data/saiData';

export type SaiTabKey =
  | 'fiqh'
  | 'green_lights'
  | 'lap1'
  | 'lap2'
  | 'lap3'
  | 'lap4'
  | 'lap5'
  | 'lap6'
  | 'lap7'
  | 'ayat_lazim'
  | 'surah_lazim'
  | 'zikir_lazim';

export class SaiModal {
  private container: HTMLElement;
  private currentTab: SaiTabKey = 'lap1';
  private onCloseCallback?: () => void;
  private onSelectLapCallback?: (lap: number) => void;
  private isSpeaking: boolean = false;

  constructor(options?: {
    initialTab?: SaiTabKey;
    onClose?: () => void;
    onSelectLap?: (lap: number) => void;
  }) {
    if (options?.initialTab) {
      this.currentTab = options.initialTab;
    }
    this.onCloseCallback = options?.onClose;
    this.onSelectLapCallback = options?.onSelectLap;

    this.container = document.createElement('div');
    this.container.id = 'modal-sai-guide';
    this.container.className =
      'fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md select-none font-sans overflow-hidden animate-fade-in';

    document.body.appendChild(this.container);
    this.render();
  }

  public setTab(tab: SaiTabKey) {
    this.currentTab = tab;
    this.render();
  }

  public close() {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    this.container.remove();
    this.onCloseCallback?.();
  }

  private render() {
    this.container.innerHTML = `
      <div class="relative w-full max-w-4xl max-h-[92vh] bg-stone-900 border border-emerald-500/40 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-stone-100">
        
        <!-- Top Emerald/Gold Islamic Header -->
        <div class="relative bg-gradient-to-r from-emerald-950 via-stone-900 to-amber-950 p-4 sm:p-5 border-b border-emerald-500/30 flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-800 text-stone-950 flex items-center justify-center text-2xl font-bold shadow-lg shadow-emerald-500/20">
              🚶‍♂️
            </div>
            <div>
              <div class="flex items-center gap-2">
                <span class="text-xs uppercase font-extrabold tracking-widest text-emerald-400">PANDUAN & BACAAN SA'I</span>
                <span class="px-2 py-0.5 rounded-full text-[10px] bg-amber-500/30 text-amber-300 font-semibold border border-amber-500/30">7 Pusingan Safa ⇄ Marwah</span>
              </div>
              <h2 class="text-xl sm:text-2xl font-bold text-white tracking-wide">Doa 7 Pusingan & Ayat Lazim Sa'i</h2>
            </div>
          </div>

          <button id="btn-close-sai-modal" class="w-9 h-9 rounded-full bg-stone-800/80 hover:bg-stone-700 border border-stone-600/60 text-stone-300 hover:text-white flex items-center justify-center transition-all cursor-pointer">
            ✕
          </button>
        </div>

        <!-- Horizontal Scrollable Tabs -->
        <div class="bg-stone-950/85 border-b border-stone-800/80 px-2 py-2 overflow-x-auto flex items-center gap-1.5 scrollbar-thin scrollbar-thumb-stone-700">
          <button data-tab="fiqh" class="tab-btn px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
            this.currentTab === 'fiqh' ? 'bg-amber-500 text-stone-950 shadow-md font-extrabold' : 'bg-stone-800/70 text-stone-300 hover:bg-stone-700'
          }">
            📜 Fiqh & Syarat
          </button>
          
          <button data-tab="green_lights" class="tab-btn px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
            this.currentTab === 'green_lights' ? 'bg-emerald-500 text-stone-950 shadow-md font-extrabold ring-2 ring-emerald-300' : 'bg-emerald-950/60 text-emerald-300 hover:bg-emerald-900 border border-emerald-600/40'
          }">
            🟢 Lampu Hijau (Lari Anak)
          </button>

          <div class="h-4 w-px bg-stone-700 mx-1"></div>

          ${[1, 2, 3, 4, 5, 6, 7]
            .map(
              (lap) => `
            <button data-tab="lap${lap}" class="tab-btn px-2.5 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                this.currentTab === `lap${lap}`
                  ? 'bg-amber-500 text-stone-950 shadow-md ring-2 ring-amber-400 font-extrabold'
                  : 'bg-stone-800/70 text-stone-300 hover:bg-stone-700'
              }">
              P.${lap} ${lap % 2 === 1 ? 'Safa➔Marwah' : 'Marwah➔Safa'}
            </button>
          `
            )
            .join('')}

          <div class="h-4 w-px bg-stone-700 mx-1"></div>

          <button data-tab="ayat_lazim" class="tab-btn px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
            this.currentTab === 'ayat_lazim' ? 'bg-amber-500 text-stone-950 shadow-md font-extrabold' : 'bg-stone-800/70 text-stone-300 hover:bg-stone-700'
          }">
            📖 Ayat Lazim Al-Quran
          </button>

          <button data-tab="surah_lazim" class="tab-btn px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
            this.currentTab === 'surah_lazim' ? 'bg-amber-500 text-stone-950 shadow-md font-extrabold' : 'bg-stone-800/70 text-stone-300 hover:bg-stone-700'
          }">
            📜 Surah Lazim
          </button>

          <button data-tab="zikir_lazim" class="tab-btn px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
            this.currentTab === 'zikir_lazim' ? 'bg-amber-500 text-stone-950 shadow-md font-extrabold' : 'bg-stone-800/70 text-stone-300 hover:bg-stone-700'
          }">
            📿 Zikir & Selawat
          </button>
        </div>

        <!-- Main Body Content (Dynamic based on selected tab) -->
        <div class="flex-1 p-4 sm:p-6 overflow-y-auto space-y-5 bg-gradient-to-b from-stone-900 to-stone-950">
          ${this.renderTabContent()}
        </div>

        <!-- Footer Bar with Quick Actions -->
        <div class="bg-stone-950 p-3 sm:p-4 border-t border-stone-800/80 flex flex-wrap items-center justify-between gap-3 text-xs text-stone-400">
          <div class="flex items-center gap-2">
            <span class="inline-block w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Arah Sa'i: <strong>Safa ➔ Marwah (1, 3, 5, 7)</strong> & <strong>Marwah ➔ Safa (2, 4, 6)</strong></span>
          </div>
          
          <div class="flex items-center gap-2">
            <button id="btn-modal-close" class="px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 font-bold transition-all cursor-pointer">
              Tutup Panduan
            </button>
          </div>
        </div>

      </div>
    `;

    this.bindEvents();
  }

  private renderTabContent(): string {
    switch (this.currentTab) {
      case 'fiqh':
        return `
          <div class="space-y-4">
            <div class="p-4 rounded-xl bg-stone-800/60 border border-stone-700 space-y-3">
              <h3 class="text-base font-bold text-amber-400 flex items-center gap-2">
                <span>📜</span>
                <span>Syarat-Syarat Sah Sa'i (Mazhab Syafi'i)</span>
              </h3>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                ${SAI_FIQH_GUIDE.syaratSah
                  .map(
                    (item, idx) => `
                  <div class="p-3 rounded-lg bg-stone-900/80 border border-stone-800">
                    <div class="text-xs font-bold text-emerald-400 mb-1 flex items-center gap-1.5">
                      <span class="w-5 h-5 rounded-full bg-emerald-950 border border-emerald-600/50 flex items-center justify-center text-[10px] text-emerald-300 font-bold">${
                        idx + 1
                      }</span>
                      <span>${item.title}</span>
                    </div>
                    <p class="text-xs text-stone-300 leading-relaxed">${item.desc}</p>
                  </div>
                `
                  )
                  .join('')}
              </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div class="p-4 rounded-xl bg-emerald-950/40 border border-emerald-600/30">
                <h4 class="text-sm font-bold text-emerald-400 mb-2 flex items-center gap-1.5">
                  <span>✨</span>
                  <span>Sunnah-Sunnah Ibadah Sa'i</span>
                </h4>
                <ul class="space-y-2 text-stone-300 text-xs leading-relaxed">
                  ${SAI_FIQH_GUIDE.sunnah
                    .map(
                      (item) => `
                    <li class="p-2 rounded-lg bg-emerald-950/30 border border-emerald-700/20">
                      <strong class="text-emerald-300 block mb-0.5">• ${item.title}</strong>
                      <span class="text-stone-300">${item.desc}</span>
                    </li>
                  `
                    )
                    .join('')}
                </ul>
              </div>

              <div class="p-4 rounded-xl bg-amber-950/40 border border-amber-600/30 space-y-3">
                <h4 class="text-sm font-bold text-amber-400 flex items-center gap-1.5">
                  <span>🏜️</span>
                  <span>Sejarah & Ibrah Sayyidatina Hajar</span>
                </h4>
                <p class="text-xs text-stone-300 leading-relaxed">
                  Ibadah Sa'i memperingati peristiwa Sayyidatina Hajar bersama puteranya Nabi Ismail a.s. yang masih menyusu, ditinggalkan di lembah Makkah yang gersang atas perintah Allah.
                </p>
                <p class="text-xs text-stone-300 leading-relaxed">
                  Apabila bekalan air habis dan Nabi Ismail menangis kehausan, Sayyidatina Hajar berlari berulang-alik antara Bukit Safa dan Bukit Marwah sebanyak 7 kali mencari air atau kelibat kafilah pedagang.
                </p>
                <div class="p-2.5 rounded-lg bg-amber-950/60 border border-amber-500/40 text-[11px] text-amber-200 leading-relaxed">
                  <strong>Pengajaran Agung:</strong> Pertolongan Allah (pancutan air Zamzam) hadir bukan dari puncak bukit yang dicari, tetapi di bawah kaki Nabi Ismail a.s., membuktikan bahawa manusia wajib berikhtiar bersungguh-sungguh manakala rezeki hak mutlak kurniaan Allah semata-mata.
                </div>
              </div>
            </div>
          </div>
        `;

      case 'green_lights':
        return `
          <div class="space-y-4">
            <div class="p-5 rounded-2xl bg-gradient-to-r from-emerald-950 via-stone-900 to-emerald-950 border-2 border-emerald-500/60 shadow-xl space-y-4">
              <div class="flex items-center justify-between flex-wrap gap-2">
                <div class="flex items-center gap-2">
                  <span class="w-3.5 h-3.5 rounded-full bg-emerald-400 animate-ping"></span>
                  <span class="text-xs uppercase font-extrabold tracking-widest text-emerald-400">${GREEN_LIGHT_INFO.title}</span>
                </div>
                <span class="px-2.5 py-1 rounded-full text-[11px] bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/40">
                  Lelaki Berlari-Lari Anak (Harwalah)
                </span>
              </div>

              <!-- Important Hukum Banner -->
              <div class="p-3.5 rounded-xl bg-emerald-900/30 border border-emerald-500/30 flex items-start gap-2.5 text-xs text-emerald-200 leading-relaxed">
                <span class="text-xl">🏃</span>
                <div>
                  <strong class="text-white block font-bold mb-0.5">Ketetapan Hukum Syarak:</strong>
                  ${GREEN_LIGHT_INFO.hukum}
                </div>
              </div>

              <!-- Main Green Light Dua -->
              <div class="p-5 rounded-2xl bg-stone-950/90 border border-emerald-500/40 space-y-3">
                <div class="flex items-center justify-between">
                  <span class="text-xs font-bold text-emerald-400">Doa Ma'tsur di Antara Dua Lampu Hijau:</span>
                  <button data-speak-arabic="${encodeURIComponent(GREEN_LIGHT_INFO.arabic)}" class="btn-speak-dua px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-stone-950 text-xs font-bold transition flex items-center gap-1 cursor-pointer">
                    <span>🔊</span>
                    <span>Dengar Arab</span>
                  </button>
                </div>

                <div class="text-center py-3">
                  <p class="font-serif text-2xl sm:text-3xl text-emerald-200 leading-loose tracking-wide">
                    ${GREEN_LIGHT_INFO.arabic}
                  </p>
                </div>

                <div class="p-3 rounded-xl bg-stone-900/90 border border-stone-800 space-y-1 text-xs">
                  <div class="font-semibold text-emerald-300 font-mono text-[11px]">${GREEN_LIGHT_INFO.transliteration}</div>
                  <div class="text-stone-300 italic pt-1 leading-relaxed">"${GREEN_LIGHT_INFO.translation}"</div>
                </div>
              </div>

              <div class="p-3.5 rounded-xl bg-stone-900/80 border border-stone-800 text-xs text-stone-400 leading-relaxed">
                <strong class="text-stone-200">Keterangan Sejarah Batn al-Wadi:</strong> ${GREEN_LIGHT_INFO.sejarah}
              </div>
            </div>
          </div>
        `;

      case 'lap1':
      case 'lap2':
      case 'lap3':
      case 'lap4':
      case 'lap5':
      case 'lap6':
      case 'lap7': {
        const lapNum = parseInt(this.currentTab.replace('lap', ''), 10);
        const lapData = SAI_LAPS[lapNum];
        return this.renderLapContent(lapData);
      }

      case 'ayat_lazim':
        return this.renderAyatCollection('Ayat-Ayat Lazim Al-Quran Untuk Sa\'i', AYAT_LAZIM_SAI);

      case 'surah_lazim':
        return this.renderAyatCollection('Surah-Surah Lazim Untuk Sa\'i', SURAH_LAZIM_SAI);

      case 'zikir_lazim':
        return this.renderAyatCollection('Zikir, Tasbih, Istighfar & Selawat Lazim', ZIKIR_LAZIM_SAI);

      default:
        return '';
    }
  }

  private renderLapContent(lap: typeof SAI_LAPS[1]): string {
    const isOdd = lap.lap % 2 === 1;
    return `
      <div class="space-y-4">
        
        <!-- Header Info Card -->
        <div class="p-4 rounded-2xl bg-gradient-to-r ${isOdd ? 'from-emerald-950 via-stone-900 to-stone-950 border-emerald-500/40' : 'from-amber-950 via-stone-900 to-stone-950 border-amber-500/40'} border space-y-2">
          <div class="flex items-center justify-between flex-wrap gap-2">
            <div class="flex items-center gap-2">
              <span class="px-2.5 py-1 rounded-full text-xs font-black ${isOdd ? 'bg-emerald-500 text-stone-950' : 'bg-amber-500 text-stone-950'}">
                PUSINGAN KE-${lap.lap} / 7
              </span>
              <span class="text-xs uppercase font-extrabold tracking-widest ${isOdd ? 'text-emerald-400' : 'text-amber-400'}">
                ${lap.fromLabel} ➔ ${lap.toLabel}
              </span>
            </div>

            <div class="flex items-center gap-1.5">
              <button data-select-lap="${lap.lap}" class="btn-set-lap px-3 py-1 rounded-lg bg-stone-800 hover:bg-stone-700 text-[11px] font-bold text-stone-200 border border-stone-700 transition cursor-pointer">
                🎯 Set Pusingan Ini
              </button>
              <button data-speak-arabic="${encodeURIComponent(lap.arabic)}" class="btn-speak-dua px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-stone-950 text-[11px] font-extrabold transition flex items-center gap-1 cursor-pointer">
                <span>🔊</span>
                <span>Dengar Bacaan</span>
              </button>
            </div>
          </div>

          <h3 class="text-base sm:text-lg font-bold text-white tracking-wide">
            ${lap.title}
          </h3>
          <p class="text-xs text-stone-400">
            Fokus & Tema: <strong class="text-stone-200">${lap.theme}</strong>
          </p>
        </div>

        <!-- Arabic Prayer Box -->
        <div class="p-5 sm:p-6 rounded-2xl bg-stone-950 border border-stone-800 space-y-4 text-center">
          <p class="font-serif text-2xl sm:text-3xl text-amber-200 leading-loose tracking-wide">
            ${lap.arabic}
          </p>

          <div class="p-3.5 rounded-xl bg-stone-900/90 border border-stone-800 text-left space-y-1.5">
            <div class="text-xs font-bold text-amber-400 uppercase tracking-wider font-mono">Transliterasi Rumi:</div>
            <p class="text-xs sm:text-sm font-medium text-stone-200 leading-relaxed font-sans">${lap.transliteration}</p>
          </div>

          <div class="p-3.5 rounded-xl bg-stone-900/90 border border-stone-800 text-left space-y-1.5">
            <div class="text-xs font-bold text-emerald-400 uppercase tracking-wider">Terjemahan Bahasa Melayu:</div>
            <p class="text-xs sm:text-sm text-stone-300 leading-relaxed italic">"${lap.translation}"</p>
          </div>
        </div>

        <!-- Green Light Reminder Card inside every lap -->
        <div class="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-600/30 flex items-start gap-3 text-xs">
          <span class="text-xl">🟢</span>
          <div class="space-y-1">
            <strong class="text-emerald-300 font-bold block">Peringatan Zon Lampu Hijau:</strong>
            <p class="text-stone-300 leading-relaxed">
              Di pertengahan laluan antara Safa dan Marwah, terdapat penanda lampu hijau di siling dan garisan lantai. <strong>Jemaah lelaki disunatkan berlari-lari anak (Harwalah / Raml)</strong> sambil membaca doa:
              <span class="block font-mono text-emerald-300 text-[11px] mt-0.5">"Rabbighfir warham, wa'fu wa takarram, wa tajaawaz 'ammaa ta'lam..."</span>
            </p>
          </div>
        </div>

        <!-- Sunnah Note -->
        <div class="p-3 rounded-xl bg-stone-900/70 border border-stone-800 text-xs text-stone-400">
          <strong class="text-stone-300">Panduan Praktikal:</strong> ${lap.sunnahNote}
        </div>

      </div>
    `;
  }

  private renderAyatCollection(sectionTitle: string, items: typeof AYAT_LAZIM_SAI): string {
    return `
      <div class="space-y-4">
        <div class="p-3.5 rounded-xl bg-gradient-to-r from-stone-900 to-stone-950 border border-stone-800 flex items-center justify-between">
          <div>
            <h3 class="text-sm sm:text-base font-bold text-white">${sectionTitle}</h3>
            <p class="text-xs text-stone-400">Susunan bacaan yang afdhal dan berkat dibaca semasa berjalan di Mas'a.</p>
          </div>
          <span class="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
            ${items.length} Susunan Bacaan
          </span>
        </div>

        <div class="space-y-4">
          ${items
            .map(
              (item, idx) => `
            <div class="p-4 sm:p-5 rounded-2xl bg-stone-950 border border-stone-800 space-y-3 shadow-lg">
              <div class="flex items-center justify-between flex-wrap gap-2 pb-2 border-b border-stone-800/80">
                <div class="flex items-center gap-2">
                  <span class="w-6 h-6 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center justify-center text-xs font-bold">
                    ${idx + 1}
                  </span>
                  <div>
                    <h4 class="text-sm font-bold text-white">${item.title}</h4>
                    <span class="text-[10px] text-stone-400 font-mono">${item.surahOrSource}</span>
                  </div>
                </div>

                <button data-speak-arabic="${encodeURIComponent(item.arabic)}" class="btn-speak-dua px-3 py-1 rounded-lg bg-stone-800 hover:bg-stone-700 text-emerald-400 hover:text-emerald-300 text-xs font-bold border border-stone-700 transition flex items-center gap-1 cursor-pointer">
                  <span>🔊</span>
                  <span>Dengar Arab</span>
                </button>
              </div>

              <!-- Arabic -->
              <div class="py-2 text-center">
                <p class="font-serif text-xl sm:text-2xl text-amber-100 leading-loose tracking-wide">
                  ${item.arabic}
                </p>
              </div>

              <!-- Transliteration -->
              <div class="p-2.5 rounded-xl bg-stone-900/80 border border-stone-800 text-xs font-mono text-emerald-300 leading-relaxed">
                ${item.transliteration}
              </div>

              <!-- Translation -->
              <div class="text-xs text-stone-300 leading-relaxed italic">
                "${item.translation}"
              </div>

              ${
                item.fadhilat
                  ? `
                <div class="p-2.5 rounded-lg bg-emerald-950/30 border border-emerald-600/30 text-[11px] text-emerald-200">
                  <strong>Fadhilat:</strong> ${item.fadhilat}
                </div>
              `
                  : ''
              }
            </div>
          `
            )
            .join('')}
        </div>
      </div>
    `;
  }

  private bindEvents() {
    // Close button
    this.container.querySelector('#btn-close-sai-modal')?.addEventListener('click', () => this.close());
    this.container.querySelector('#btn-modal-close')?.addEventListener('click', () => this.close());

    // Tab buttons
    this.container.querySelectorAll('.tab-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const tab = (btn as HTMLElement).dataset.tab as SaiTabKey;
        if (tab) {
          this.setTab(tab);
        }
      });
    });

    // Select Lap button
    this.container.querySelectorAll('.btn-set-lap').forEach((btn) => {
      btn.addEventListener('click', () => {
        const lap = parseInt((btn as HTMLElement).dataset.selectLap || '1', 10);
        this.onSelectLapCallback?.(lap);
        soundManager.playCheckpointSound();
      });
    });

    // Speak Arabic button
    this.container.querySelectorAll('.btn-speak-dua').forEach((btn) => {
      btn.addEventListener('click', () => {
        const arabicText = decodeURIComponent((btn as HTMLElement).dataset.speakArabic || '');
        if (!arabicText) return;

        if (this.isSpeaking) {
          if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
          }
          this.isSpeaking = false;
          (btn as HTMLElement).classList.remove('bg-amber-500', 'text-stone-950');
          return;
        }

        this.isSpeaking = true;
        (btn as HTMLElement).classList.add('bg-amber-500', 'text-stone-950');

        soundManager.speakArabic(arabicText, () => {
          this.isSpeaking = false;
          (btn as HTMLElement).classList.remove('bg-amber-500', 'text-stone-950');
        });
      });
    });
  }
}
