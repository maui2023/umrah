import { soundManager } from '../audio/SoundManager';
import {
  ISTILAM_DUA,
  MAQAM_IBRAHIM_DUA,
  NIAT_UMRAH,
  RUKUN_YAMANI_DUA,
  TAWAF_DUAS,
  ZAMZAM_DUA
} from '../data/duas';

export type TawafTabKey = 
  | 'niat' 
  | 'istilam' 
  | 'lap1' 
  | 'lap2' 
  | 'lap3' 
  | 'lap4' 
  | 'lap5' 
  | 'lap6' 
  | 'lap7' 
  | 'yamani' 
  | 'maqam_zamzam'
  | 'fiqh';

export class TawafModal {
  private container: HTMLElement;
  private currentTab: TawafTabKey = 'lap1';
  private onCloseCallback?: () => void;
  private onSelectDuaCallback?: (duaId: string) => void;
  private isSpeaking: boolean = false;

  constructor(options?: {
    initialTab?: TawafTabKey;
    onClose?: () => void;
    onSelectDua?: (duaId: string) => void;
  }) {
    if (options?.initialTab) {
      this.currentTab = options.initialTab;
    }
    this.onCloseCallback = options?.onClose;
    this.onSelectDuaCallback = options?.onSelectDua;

    this.container = document.createElement('div');
    this.container.id = 'modal-tawaf-guide';
    this.container.className = 'fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/75 backdrop-blur-md select-none font-sans overflow-hidden animate-fade-in';

    document.body.appendChild(this.container);
    this.render();
    this.bindEvents();
  }

  public setTab(tab: TawafTabKey) {
    this.currentTab = tab;
    this.onSelectDuaCallback?.(tab);
    this.render();
  }

  public close() {
    soundManager.stopTalbiyahAudio();
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    this.container.remove();
    this.onCloseCallback?.();
  }

  private render() {
    this.container.innerHTML = `
      <div class="relative w-full max-w-4xl max-h-[92vh] bg-stone-900 border border-amber-600/40 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-stone-100">
        
        <!-- Top Emerald/Gold Islamic Header -->
        <div class="relative bg-gradient-to-r from-emerald-950 via-stone-900 to-amber-950 p-4 sm:p-5 border-b border-amber-500/30 flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-400 to-amber-700 text-stone-950 flex items-center justify-center text-2xl font-bold shadow-lg shadow-amber-500/20">
              🕋
            </div>
            <div>
              <div class="flex items-center gap-2">
                <span class="text-xs uppercase font-extrabold tracking-widest text-amber-400">PANDUAN & SENARAI DOA</span>
                <span class="px-2 py-0.5 rounded-full text-[10px] bg-emerald-600/40 text-emerald-300 font-semibold border border-emerald-500/30">7 Pusingan Tawaf Kaabah</span>
              </div>
              <h2 class="text-xl sm:text-2xl font-bold text-white tracking-wide">Panduan Fiqh & Senarai Bacaan Tawaf</h2>
            </div>
          </div>

          <button id="btn-close-tawaf-modal" class="w-9 h-9 rounded-full bg-stone-800/80 hover:bg-stone-700 border border-stone-600/60 text-stone-300 hover:text-white flex items-center justify-center transition-all">
            ✕
          </button>
        </div>

        <!-- Horizontal Scrollable Tabs -->
        <div class="bg-stone-950/80 border-b border-stone-800/80 px-2 py-2 overflow-x-auto flex items-center gap-1.5 scrollbar-thin scrollbar-thumb-stone-700">
          <button data-tab="fiqh" class="tab-btn px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${this.currentTab === 'fiqh' ? 'bg-amber-500 text-stone-950 shadow-md' : 'bg-stone-800/70 text-stone-300 hover:bg-stone-700'}">
            📜 Fiqh & Syarat
          </button>
          <button data-tab="niat" class="tab-btn px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${this.currentTab === 'niat' ? 'bg-amber-500 text-stone-950 shadow-md' : 'bg-stone-800/70 text-stone-300 hover:bg-stone-700'}">
            🤲 Niat Tawaf
          </button>
          <button data-tab="istilam" class="tab-btn px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${this.currentTab === 'istilam' ? 'bg-emerald-500 text-stone-950 shadow-md' : 'bg-stone-800/70 text-stone-300 hover:bg-stone-700'}">
            ✋ Istilam
          </button>
          
          <div class="h-4 w-px bg-stone-700 mx-1"></div>

          ${[1, 2, 3, 4, 5, 6, 7].map(lap => `
            <button data-tab="lap${lap}" class="tab-btn px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${this.currentTab === `lap${lap}` ? 'bg-amber-500 text-stone-950 shadow-md ring-2 ring-amber-400' : 'bg-stone-800/70 text-stone-300 hover:bg-stone-700'}">
              ${lap === 1 ? '1️⃣ Pusingan 1' : lap === 2 ? '2️⃣ Pusingan 2' : lap === 3 ? '3️⃣ Pusingan 3' : lap === 4 ? '4️⃣ Pusingan 4' : lap === 5 ? '5️⃣ Pusingan 5' : lap === 6 ? '6️⃣ Pusingan 6' : '7️⃣ Pusingan 7'}
            </button>
          `).join('')}

          <div class="h-4 w-px bg-stone-700 mx-1"></div>

          <button data-tab="yamani" class="tab-btn px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${this.currentTab === 'yamani' ? 'bg-emerald-500 text-stone-950 shadow-md' : 'bg-stone-800/70 text-stone-300 hover:bg-stone-700'}">
            ✨ Rukun Yamani
          </button>
          <button data-tab="maqam_zamzam" class="tab-btn px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${this.currentTab === 'maqam_zamzam' ? 'bg-amber-500 text-stone-950 shadow-md' : 'bg-stone-800/70 text-stone-300 hover:bg-stone-700'}">
            🕌 Maqam & Zamzam
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
            <span>Arah Tawaf: <strong>Lawan Arah Jam</strong> (Kaabah sentiasa di sebelah kiri anda).</span>
          </div>
          
          <div class="flex items-center gap-2">
            <button id="btn-modal-close" class="px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 font-bold transition-all">
              Tutup Panduan
            </button>
          </div>
        </div>

      </div>
    `;

    this.bindDynamicEvents();
  }

  private renderTabContent(): string {
    switch (this.currentTab) {
      case 'fiqh':
        return `
          <div class="space-y-4">
            <div class="p-4 rounded-xl bg-stone-800/60 border border-stone-700">
              <h3 class="text-base font-bold text-amber-400 mb-2">📜 Syarat-Syarat Sah Tawaf (Mazhab Syafi'i)</h3>
              <ol class="list-decimal list-inside space-y-2 text-stone-300 text-sm leading-relaxed">
                <li><strong class="text-white">Suci daripada hadas kecil dan besar:</strong> Wajib berwuduk dan suci badan, pakaian serta tempat tawaf daripada najis.</li>
                <li><strong class="text-white">Menutup aurat:</strong> Bagi lelaki (antara pusat dan lutut, kain ihram tidak berjahit) dan wanita (seluruh tubuh kecuali muka dan dua pergelangan tangan).</li>
                <li><strong class="text-white">7 Pusingan yang sempurna:</strong> Memulakan dan mengakhiri setiap pusingan tepat di garisan Hajarul Aswad.</li>
                <li><strong class="text-white">Lawan Arah Jam:</strong> Kaabah hendaklah sentiasa berada tepat di sebelah kiri bahu jemaah sepanjang tawaf.</li>
                <li><strong class="text-white">Di luar Kaabah & Hijr Ismail:</strong> Wajib tawaf di luar dinding Hijr Ismail (Hateem) dan asas Shadharwan Kaabah. Jika masuk ke dalam Hijr Ismail, pusingan itu terbatal dan perlu diulang.</li>
                <li><strong class="text-white">Di dalam kawasan Masjidil Haram:</strong> Boleh di aras dataran Mataf mahupun aras bumbung/tingkat atas.</li>
              </ol>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div class="p-4 rounded-xl bg-emerald-950/40 border border-emerald-600/30">
                <h4 class="text-sm font-bold text-emerald-400 mb-2">✨ Sunnah-Sunnah Tawaf</h4>
                <ul class="list-disc list-inside space-y-1.5 text-stone-300 text-xs leading-relaxed">
                  <li><strong>Idtiba' (Buka bahu kanan):</strong> Bagi jemaah lelaki sepanjang 7 pusingan Tawaf Umrah.</li>
                  <li><strong>Raml (Lari-lari anak):</strong> Bagi jemaah lelaki pada 3 pusingan pertama. Pusingan 4 hingga 7 berjalan seperti biasa.</li>
                  <li><strong>Istilam Hajarul Aswad:</strong> Mengangkat tangan kanan dan bertakbir pada permulaan setiap pusingan.</li>
                  <li><strong>Mengusap Rukun Yamani:</strong> Tanpa mengucup tangan.</li>
                  <li><strong>Membaca Doa Rabbana Aatina:</strong> Antara Rukun Yamani dan Hajarul Aswad.</li>
                  <li><strong>Solat Sunat Tawaf 2 Rakaat:</strong> Di belakang Maqam Ibrahim selepas selesai pusingan ke-7.</li>
                </ul>
              </div>

              <div class="p-4 rounded-xl bg-rose-950/40 border border-rose-600/30">
                <h4 class="text-sm font-bold text-rose-400 mb-2">⚠️ Larangan & Perhatian Semasa Tawaf</h4>
                <ul class="list-disc list-inside space-y-1.5 text-stone-300 text-xs leading-relaxed">
                  <li><strong>Membelakangkan Kaabah:</strong> Dada tidak boleh menghadap atau membelakangkan Kaabah semasa berjalan.</li>
                  <li><strong>Masuk ke Hijr Ismail:</strong> Pusingan melalui dalam lengkungan Hijr Ismail tidak sah!</li>
                  <li><strong>Menyentuh Dinding Kaabah semasa berjalan:</strong> Badan tidak boleh menyentuh Kiswah atau Shadharwan.</li>
                  <li><strong>Berpatah balik mengikut arah jam:</strong> Membatalkan kesinambungan pusingan.</li>
                </ul>
              </div>
            </div>
          </div>
        `;

      case 'niat':
        return this.renderPrayerCard({
          title: NIAT_UMRAH.title,
          badge: 'NIAT RUKUN UMRAH',
          badgeColor: 'amber',
          location: 'Miqat atau Sebelum Melintasi Garisan Hajarul Aswad',
          arabic: NIAT_UMRAH.arabic,
          transliteration: NIAT_UMRAH.transliteration,
          translation: NIAT_UMRAH.translation,
          sunnahNote: NIAT_UMRAH.sunnahNote || 'Berniat ikhlas kerana Allah Ta\'ala. Boleh dilafazkan secara lisan dan disematkan di dalam hati.',
          extraText: 'Bagi Tawaf Sunat di luar ibadah Umrah: "نَوَيْتُ التَّطَوُّفَ بِهَذَا الْبَيْتِ سَبْعَةَ أَشْوَاطٍ لِلَّهِ تَعَالَى" (Sahaja aku tawaf di Baitullah ini 7 pusingan kerana Allah Ta\'ala).'
        });

      case 'istilam':
        return this.renderPrayerCard({
          title: ISTILAM_DUA.title,
          badge: 'ISTILAM SETIAP PUSINGAN',
          badgeColor: 'emerald',
          location: 'Garisan Lampu Hijau / Hajarul Aswad',
          arabic: ISTILAM_DUA.arabic,
          transliteration: ISTILAM_DUA.transliteration,
          translation: ISTILAM_DUA.translation,
          sunnahNote: ISTILAM_DUA.sunnahNote || 'Dilakukan pada permulaan setiap pusingan (1 hingga 7) dengan mengangkat tangan kanan ke arah Hajarul Aswad sambil bertakbir.',
          extraText: 'Jika sesak dan jauh dari Hajarul Aswad, memadai dengan isyarat tapak tangan kanan dari garisan lampu hijau sambil mengucapkan: "Bismillahi Allahu Akbar", tanpa perlu menolak jemaah lain.'
        });

      case 'lap1':
      case 'lap2':
      case 'lap3':
      case 'lap4':
      case 'lap5':
      case 'lap6':
      case 'lap7': {
        const lapNum = parseInt(this.currentTab.replace('lap', ''), 10);
        const dua = TAWAF_DUAS[lapNum];
        return this.renderPrayerCard({
          title: dua.title,
          badge: `PUSINGAN ${lapNum} DARI 7`,
          badgeColor: 'amber',
          location: `Dataran Mataf Kaabah (Pusingan ke-${lapNum})`,
          arabic: dua.arabic,
          transliteration: dua.transliteration,
          translation: dua.translation,
          sunnahNote: dua.sunnahNote || 'Kekalkan Kaabah di sebelah kiri bahu anda.',
          extraText: lapNum <= 3 
            ? '🏃 Sunnah Raml (berlari-lari anak) dan Idtiba\' (bahu kanan terbuka) bagi lelaki pada pusingan ini.' 
            : '🚶 Pusingan 4 hingga 7 berjalan dengan tenang dan tertib (tanpa berlari anak).'
        });
      }

      case 'yamani':
        return this.renderPrayerCard({
          title: RUKUN_YAMANI_DUA.title,
          badge: 'DOA MUSTAJAB RUKUN YAMANI',
          badgeColor: 'emerald',
          location: 'Dari Penjuru Rukun Yamani hingga Hajarul Aswad',
          arabic: RUKUN_YAMANI_DUA.arabic,
          transliteration: RUKUN_YAMANI_DUA.transliteration,
          translation: RUKUN_YAMANI_DUA.translation,
          sunnahNote: RUKUN_YAMANI_DUA.sunnahNote || 'Sunnah dibaca berulang-ulang di antara Rukun Yamani dan Hajarul Aswad pada setiap pusingan.',
          extraText: 'Rasulullah ﷺ sentiasa melazimi doa ini di antara dua rukun ini kerana ia menghimpunkan segala kebaikan dunia dan akhirat.'
        });

      case 'maqam_zamzam':
        return `
          <div class="space-y-5">
            <!-- Maqam Ibrahim Card -->
            ${this.renderPrayerCard({
              title: MAQAM_IBRAHIM_DUA.title,
              badge: 'SELEPAS SELESAI PUSINGAN KE-7',
              badgeColor: 'amber',
              location: 'Belakang Maqam Ibrahim',
              arabic: MAQAM_IBRAHIM_DUA.arabic,
              transliteration: MAQAM_IBRAHIM_DUA.transliteration,
              translation: MAQAM_IBRAHIM_DUA.translation,
              sunnahNote: MAQAM_IBRAHIM_DUA.sunnahNote || 'Lakukan solat sunat 2 rakaat: Rakaat 1 baca Surah Al-Kafirun, Rakaat 2 baca Surah Al-Ikhlas.'
            })}

            <!-- Zamzam Card -->
            ${this.renderPrayerCard({
              title: ZAMZAM_DUA.title,
              badge: 'MINUM AIR ZAMZAM',
              badgeColor: 'emerald',
              location: 'Stesen Air Zamzam Mataf / Koridor Masjid',
              arabic: ZAMZAM_DUA.arabic,
              transliteration: ZAMZAM_DUA.transliteration,
              translation: ZAMZAM_DUA.translation,
              sunnahNote: ZAMZAM_DUA.sunnahNote || 'Minum dalam keadaan menghadap kiblat dengan membaca Bismillah dan berniat kebaikan (doa dimakbulkan).'
            })}
          </div>
        `;

      default:
        return '';
    }
  }

  private renderPrayerCard(data: {
    title: string;
    badge: string;
    badgeColor: 'amber' | 'emerald';
    location: string;
    arabic: string;
    transliteration: string;
    translation: string;
    sunnahNote?: string;
    extraText?: string;
  }): string {
    const isAmber = data.badgeColor === 'amber';
    return `
      <div class="p-5 rounded-2xl bg-stone-800/80 border ${isAmber ? 'border-amber-500/30 shadow-amber-950/30' : 'border-emerald-500/30 shadow-emerald-950/30'} shadow-xl space-y-4">
        
        <div class="flex flex-wrap items-center justify-between gap-2 border-b border-stone-700/60 pb-3">
          <div>
            <span class="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold tracking-wider ${isAmber ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'}">
              ${data.badge}
            </span>
            <h3 class="text-lg font-bold text-white mt-1">${data.title}</h3>
            <p class="text-xs text-stone-400">📍 ${data.location}</p>
          </div>

          <div class="flex items-center gap-2">
            <button class="btn-play-arabic-audio px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-stone-950 font-bold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-900/40 transition-all" data-arabic="${encodeURIComponent(data.arabic)}">
              <span>🔊</span>
              <span>Dengar Sebutan Arab</span>
            </button>
          </div>
        </div>

        <!-- Large Arabic Calligraphy -->
        <div class="p-4 rounded-xl bg-stone-950/70 border border-stone-800 text-right">
          <p class="font-serif text-2xl sm:text-3xl text-amber-100 leading-loose sm:leading-loose tracking-wide dir-rtl" dir="rtl">
            ${data.arabic}
          </p>
        </div>

        <!-- Transliteration (Rumi) -->
        <div class="space-y-1">
          <span class="text-[11px] font-bold uppercase tracking-wider text-amber-400">Sebutan Rumi:</span>
          <p class="text-sm font-medium text-stone-200 italic leading-relaxed bg-stone-900/50 p-3 rounded-lg border border-stone-800">
            "${data.transliteration}"
          </p>
        </div>

        <!-- Translation (Maksud) -->
        <div class="space-y-1">
          <span class="text-[11px] font-bold uppercase tracking-wider text-emerald-400">Terjemahan Maksud:</span>
          <p class="text-sm text-stone-300 leading-relaxed bg-stone-900/50 p-3 rounded-lg border border-stone-800">
            ${data.translation}
          </p>
        </div>

        <!-- Sunnah Note & Extra Tips -->
        ${data.sunnahNote ? `
          <div class="p-3 rounded-lg bg-emerald-950/30 border border-emerald-500/30 flex items-start gap-2.5 text-xs text-emerald-200">
            <span class="text-base shrink-0">💡</span>
            <div>
              <strong class="text-emerald-300">Panduan Sunnah:</strong> ${data.sunnahNote}
            </div>
          </div>
        ` : ''}

        ${data.extraText ? `
          <div class="p-3 rounded-lg bg-stone-900/70 border border-stone-700/50 text-xs text-stone-300">
            ℹ️ ${data.extraText}
          </div>
        ` : ''}

      </div>
    `;
  }

  private bindEvents() {
    this.container.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      if (target.id === 'modal-tawaf-guide') {
        this.close();
      }
    });

    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        window.removeEventListener('keydown', handleEsc);
        this.close();
      }
    };
    window.addEventListener('keydown', handleEsc);
  }

  private bindDynamicEvents() {
    // Close buttons
    const btnClose = this.container.querySelector('#btn-close-tawaf-modal') as HTMLElement;
    const btnCloseFooter = this.container.querySelector('#btn-modal-close') as HTMLElement;
    btnClose?.addEventListener('click', () => this.close());
    btnCloseFooter?.addEventListener('click', () => this.close());

    // Tab buttons
    const tabBtns = this.container.querySelectorAll('.tab-btn');
    tabBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        const tab = btn.getAttribute('data-tab') as TawafTabKey;
        if (tab) {
          this.setTab(tab);
        }
      });
    });

    // Audio Play Buttons
    const audioBtns = this.container.querySelectorAll('.btn-play-arabic-audio');
    audioBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        const rawArabic = btn.getAttribute('data-arabic');
        if (!rawArabic) return;
        const arabicText = decodeURIComponent(rawArabic);

        if (this.isSpeaking) {
          soundManager.stopTalbiyahAudio();
          this.isSpeaking = false;
          btn.innerHTML = `<span>🔊</span><span>Dengar Sebutan Arab</span>`;
          return;
        }

        this.isSpeaking = true;
        btn.innerHTML = `<span class="animate-spin">🔄</span><span>Sedang Mengalunkan...</span>`;

        soundManager.speakArabic(arabicText, () => {
          this.isSpeaking = false;
          btn.innerHTML = `<span>🔊</span><span>Dengar Sebutan Arab</span>`;
        });
      });
    });
  }
}
