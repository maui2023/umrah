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
    title: 'Pergi ke permulaan Tawaf berdekatan Hajar Aswad',
    subtitle: 'Bergerak mengikut arah Tawaf',
    tip: 'Luruskan bahu kiri ke arah Kaabah dan mulakan dengan lafaz Istilam "Bismillahi Allahu Akbar".',
    duaSnippet: 'بِسْمِ اللَّهِ، اللَّهُ أَكْبَرُ'
  },
  {
    id: 1,
    angleDeg: 15, // Heading to Iraqi & Hijr Ismail
    title: 'Bergerak ke arah Rukun Iraqi & Hijr Ismail',
    subtitle: 'Kekalkan Kaabah sentiasa di sebelah bahu kiri',
    tip: 'Lelaki disunatkan Raml (berlari anak dengan langkah pendek) pada 3 pusingan pertama jika tidak sesak.',
    duaSnippet: 'سُبْحَانَ اللَّهِ وَالْحَمْدُ لِلَّهِ وَلاَ إِلَهَ إِلاَّ اللَّهُ وَاللَّهُ أَكْبَرُ'
  },
  {
    id: 2,
    angleDeg: 300, // Top - Outside Hijr Ismail
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
    angleDeg: 135, // Between Yamani & Hajar Aswad
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
    this.currentSectorIndex = 0;
    this.callbacks.onLapChanged?.(this.currentLap);
    this.render();
  }

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
        if (label) label.textContent = 'Berhenti Suara';
      } else {
        if (icon) icon.textContent = '🔊';
        if (label) label.textContent = 'Dengar Sebutan';
      }
    });
  }

  /**
   * Advance along Tawaf sectors counter-clockwise
   */
  private advanceSectorOrLap() {
    if (this.currentSectorIndex < TAWAF_SECTORS.length - 1) {
      this.currentSectorIndex++;
      soundManager.playCheckpointSound();
      this.updateMotawefVisuals();
    } else {
      // Completed full circle back at Hajar Aswad!
      this.nextLap();
    }
  }

  private nextLap() {
    if (this.currentLap < 7) {
      this.currentLap++;
      this.currentSectorIndex = 0;
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
      this.currentSectorIndex = 0;
      this.selectedDuaLap = this.currentLap;
      this.callbacks.onLapChanged?.(this.currentLap);
      this.render();
    }
  }

  private resetLaps() {
    if (confirm('Adakah anda pasti ingin menetapkan semula kiraan ke Pusingan 1?')) {
      this.currentLap = 1;
      this.currentSectorIndex = 0;
      this.selectedDuaLap = 1;
      this.callbacks.onLapChanged?.(1);
      this.render();
    }
  }

  private finishTawaf() {
    soundManager.playCompletionFanfare();
    confetti({
      particleCount: 120,
      spread: 80,
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

        <div class="flex items-center gap-2 pt-2">
          <button id="btn-close-completion" class="flex-1 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md active:scale-95 transition cursor-pointer text-center">
            Tutup & Teruskan Ibadah
          </button>
          <button id="btn-completion-switch-game" class="py-3.5 px-4 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-xs border border-stone-300 transition cursor-pointer text-center flex items-center gap-1.5">
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

  /**
   * TAB 1: EXACT MOTAWEF KAABA COMPASS SCREEN AS SHOWN IN USER SCREENSHOT
   */
  private renderMotawefCompassTab(): string {
    const sector = TAWAF_SECTORS[this.currentSectorIndex] || TAWAF_SECTORS[0];
    const dua = TAWAF_DUAS[this.currentLap] || TAWAF_DUAS[1];

    // Calculate avatar position along Track 3 (r = 128)
    const rad = (sector.angleDeg * Math.PI) / 180;
    const avatarX = 180 + 128 * Math.cos(rad);
    const avatarY = 180 + 128 * Math.sin(rad);

    return `
      <div class="flex flex-col items-center justify-between space-y-4 py-1">
        
        <!-- TOP LOCATION & BEARING PILL -->
        <div class="flex items-center justify-between w-full px-2 text-xs">
          <div class="flex items-center gap-1.5 text-stone-600">
            <span class="text-sm">📍</span>
            <span id="qibla-location-label" class="font-semibold text-stone-800">Masjidil Haram, Makkah</span>
            <span id="qibla-distance-label" class="text-stone-500 font-mono text-[11px]">(Kiblat: 293°)</span>
          </div>

          <!-- Location Selector Dropdown -->
          <select id="select-qibla-location" class="bg-white border border-stone-200 rounded-full px-2.5 py-0.5 text-[11px] text-stone-700 shadow-sm cursor-pointer focus:outline-none">
            <option value="makkah">🕋 Masjidil Haram</option>
            <option value="gps">📍 GPS Semasa</option>
            ${PRESET_LOCATIONS.filter((p) => p.id !== 'makkah').map((p) => `<option value="${p.id}">${p.name}</option>`).join('')}
          </select>
        </div>

        <!-- ALIGNMENT STATUS PILL -->
        <div id="qibla-align-banner" class="w-full text-center py-1.5 px-3 rounded-full bg-stone-100/90 border border-stone-200/80 text-xs font-semibold text-stone-700 transition-all">
          <span id="qibla-align-text">Pusingkan peranti anda mengikut arah Kaabah</span>
        </div>

        <!-- ======================================================== -->
        <!-- THE MOTAWEF KAABA RADAR / COMPASS (SVG PIXEL-PERFECT)     -->
        <!-- ======================================================== -->
        <div class="relative w-[310px] h-[310px] sm:w-[350px] sm:h-[350px] flex items-center justify-center my-1 select-none">
          
          <!-- Outer Compass Dial Wrapper (Rotates with device heading if sensor active) -->
          <div id="motawef-radar-rose" class="relative w-full h-full flex items-center justify-center transition-transform duration-100 ease-out">
            
            <svg id="motawef-compass-svg" viewBox="0 0 360 360" class="w-full h-full overflow-visible">
              <defs>
                <!-- Soft realistic drop shadow for the rotated Kaaba -->
                <filter id="motawef-kaaba-shadow" x="-50%" y="-50%" width="200%" height="200%">
                  <feDropShadow dx="-10" dy="16" stdDeviation="15" flood-color="#000000" flood-opacity="0.32" />
                </filter>

                <!-- Vision Beam radial gradient for the yellow avatar -->
                <radialGradient id="motawef-vision-beam" cx="50%" cy="0%" r="100%" fx="50%" fy="0%">
                  <stop offset="0%" stop-color="#FACC15" stop-opacity="0.55" />
                  <stop offset="45%" stop-color="#FACC15" stop-opacity="0.25" />
                  <stop offset="100%" stop-color="#FACC15" stop-opacity="0" />
                </radialGradient>
              </defs>

              <!-- 4 CONCENTRIC DASHED CIRCLES (Mataf Tracks) -->
              <!-- Track 4 (Outer) -->
              <circle cx="180" cy="180" r="156" fill="none" stroke="#D1D5DB" stroke-width="1.5" stroke-dasharray="4 6" />
              <!-- Track 3 (Pilgrim Track) -->
              <circle cx="180" cy="180" r="128" fill="none" stroke="#D1D5DB" stroke-width="1.5" stroke-dasharray="4 6" />
              <!-- Track 2 -->
              <circle cx="180" cy="180" r="98" fill="none" stroke="#D1D5DB" stroke-width="1.5" stroke-dasharray="4 6" />
              <!-- Track 1 (Inner) -->
              <circle cx="180" cy="180" r="68" fill="none" stroke="#D1D5DB" stroke-width="1.5" stroke-dasharray="4 6" />

              <!-- AMBER HIGHLIGHTED ARC (Left Track progression) -->
              <path d="M 82 248 A 128 128 0 0 1 82 112" fill="none" stroke="#F59E0B" stroke-width="2.5" stroke-linecap="round" />

              <!-- GREEN DASHED HIGHLIGHT SEGMENT (Near user track / Hajar Aswad starting line) -->
              <path id="track-green-segment" d="M 135 304 A 128 128 0 0 0 225 304" fill="none" stroke="#10B981" stroke-width="3" stroke-dasharray="5 5" stroke-linecap="round" />

              <!-- ============================================== -->
              <!-- THE HOLY KAABA (CENTER ROTATED AT 45 DEGREES)  -->
              <!-- ============================================== -->
              <g id="motawef-kaaba-group">
                <!-- Rotated Black Cube / Kaaba Body with soft drop shadow -->
                <rect x="139" y="139" width="82" height="82" rx="4" transform="rotate(45 180 180)" fill="#18181B" filter="url(#motawef-kaaba-shadow)" />

                <!-- HAJARUL ASWAD CORNER (Bottom Corner at (180, 238)): White curved corner quadrant -->
                <path d="M 166 224 L 180 238 L 194 224 A 19 19 0 0 1 166 224 Z" fill="#FFFFFF" />

                <!-- RUKUN YAMANI CORNER (Left Corner at (122, 180)): Amber/Orange diamond pip -->
                <rect x="127" y="176" width="8" height="8" transform="rotate(45 131 180)" fill="#F59E0B" rx="1" />

                <!-- HIJR ISMAIL / HATEEM (Top-Right Crescent Wall with 3 golden dots) -->
                <!-- Base crescent wall (white with subtle light grey border) -->
                <path d="M 194 135 A 28 28 0 0 1 226 167" fill="none" stroke="#E5E7EB" stroke-width="11" stroke-linecap="round" />
                <path d="M 194 135 A 28 28 0 0 1 226 167" fill="none" stroke="#FFFFFF" stroke-width="8" stroke-linecap="round" />
                
                <!-- 3 Golden/Amber Dots (Lanterns/Pillars on Hijr Ismail) -->
                <circle cx="198" cy="131" r="3" fill="#F59E0B" />
                <circle cx="218" cy="136" r="3.2" fill="#F59E0B" />
                <circle cx="231" cy="156" r="3" fill="#F59E0B" />
              </g>

              <!-- ======================================================= -->
              <!-- PILGRIM AVATAR (YELLOW CIRCLE WITH PERSON ICON & BEAM)  -->
              <!-- ======================================================= -->
              <g id="motawef-avatar-group" transform="translate(${avatarX}, ${avatarY})" class="transition-all duration-300 ease-out">
                
                <!-- Forward Flashlight Vision Cone (Beam of light) -->
                <g id="avatar-vision-cone" transform="rotate(${sector.angleDeg - 90})">
                  <path d="M 0 0 L -28 50 A 55 55 0 0 0 28 50 Z" fill="url(#motawef-vision-beam)" />
                </g>

                <!-- Solid Yellow Avatar Badge Circle -->
                <circle cx="0" cy="0" r="16" fill="#FACC15" stroke="#EAB308" stroke-width="1.5" class="shadow-md" />

                <!-- Person Icon inside Yellow Circle (Head & Shoulders Outline) -->
                <circle cx="0" cy="-4" r="3.8" fill="none" stroke="#18181B" stroke-width="1.8" />
                <path d="M -7 7 A 7 7 0 0 1 7 7" fill="none" stroke="#18181B" stroke-width="1.8" stroke-linecap="round" />
              </g>

            </svg>
          </div>
        </div>

        <!-- ======================================================== -->
        <!-- LOWER TEXT & ACTION BUTTON (EXACTLY AS IN SCREENSHOT)     -->
        <!-- ======================================================== -->
        <div class="flex flex-col items-center text-center space-y-3 w-full px-2">
          
          <!-- Heading Text (e.g. "Pergi ke permulaan Tawaf berdekatan Hajar Aswad") -->
          <h2 id="motawef-heading-text" class="text-xl sm:text-2xl font-bold text-stone-900 leading-snug max-w-sm">
            ${sector.title}
          </h2>

          <!-- Circular Arrow Button (White circle, black border, ↗ arrow) -->
          <button id="btn-motawef-action" title="Bergerak ke sektor seterusnya / Teruskan Tawaf" class="w-14 h-14 rounded-full border-2 border-stone-900 bg-white shadow-md flex items-center justify-center hover:bg-stone-50 active:scale-95 transition cursor-pointer my-1 group">
            <svg viewBox="0 0 24 24" class="w-6 h-6 stroke-stone-900 stroke-[2.5] fill-none group-hover:scale-110 transition-transform">
              <path d="M7 17L17 7M17 7H8M17 7V16" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>

          <!-- Subtitle Text (e.g. "Bergerak mengikut arah Tawaf") -->
          <p id="motawef-subtitle-text" class="text-stone-700 text-sm sm:text-base font-medium max-w-sm">
            ${sector.subtitle}
          </p>
        </div>

        <!-- ======================================================== -->
        <!-- COMPACT TAWAF 7-LAP TRACKER & QUICK ACTIONS              -->
        <!-- ======================================================== -->
        <div class="w-full bg-white rounded-3xl p-4 sm:p-5 border border-stone-200/90 shadow-sm space-y-3 mt-2">
          
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <span class="text-xs uppercase font-extrabold tracking-wider text-amber-600">Pusingan Tawaf</span>
              <span class="text-base font-bold text-stone-900">Pusingan ${this.currentLap} / 7</span>
            </div>
            
            <div class="flex items-center gap-1.5">
              <button id="btn-istilam-action" class="px-3 py-1 rounded-full bg-amber-500/20 hover:bg-amber-500/30 text-amber-800 border border-amber-500/40 text-xs font-bold transition active:scale-95 cursor-pointer flex items-center gap-1">
                <span>✋</span>
                <span>Istilam</span>
              </button>
            </div>
          </div>

          <!-- 7-Lap Step Dots -->
          <div class="grid grid-cols-7 gap-1.5">
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
          <div class="p-3 rounded-2xl bg-amber-50/60 border border-amber-200/70 text-xs space-y-1">
            <div class="flex items-center justify-between text-[11px] font-bold text-amber-900">
              <span>🤲 Doa Pusingan ${this.currentLap}:</span>
              <button class="btn-listen-dua text-amber-700 hover:text-amber-900 font-semibold cursor-pointer flex items-center gap-1" data-arabic="${encodeURIComponent(dua.arabic)}">
                <span class="speech-icon">🔊</span>
                <span class="speech-label">Dengar</span>
              </button>
            </div>
            <p class="font-arabic text-sm text-stone-900 leading-relaxed text-right" dir="rtl">${dua.arabic}</p>
            <p class="text-[11px] text-stone-600 italic truncate font-sans">"${dua.transliteration}"</p>
          </div>

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
              <span>🎛️ Putar Kompas Manual:</span>
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
   * Update visual elements on Motawef compass based on current sector
   */
  private updateMotawefVisuals() {
    const sector = TAWAF_SECTORS[this.currentSectorIndex] || TAWAF_SECTORS[0];

    // Heading & Subtitle
    const headingEl = this.container.querySelector('#motawef-heading-text');
    if (headingEl) headingEl.textContent = sector.title;

    const subEl = this.container.querySelector('#motawef-subtitle-text');
    if (subEl) subEl.textContent = sector.subtitle;

    // Avatar Position & Vision Cone
    const avatarGroup = this.container.querySelector('#motawef-avatar-group') as SVGGraphicsElement;
    const visionCone = this.container.querySelector('#avatar-vision-cone') as SVGGraphicsElement;
    const greenSegment = this.container.querySelector('#track-green-segment') as SVGPathElement;

    const rad = (sector.angleDeg * Math.PI) / 180;
    const avatarX = 180 + 128 * Math.cos(rad);
    const avatarY = 180 + 128 * Math.sin(rad);

    if (avatarGroup) {
      avatarGroup.setAttribute('transform', `translate(${avatarX.toFixed(1)}, ${avatarY.toFixed(1)})`);
    }

    if (visionCone) {
      visionCone.setAttribute('transform', `rotate(${sector.angleDeg - 90})`);
    }

    // Dynamic green track highlight segment under avatar
    if (greenSegment) {
      const a1 = ((sector.angleDeg - 24) * Math.PI) / 180;
      const a2 = ((sector.angleDeg + 24) * Math.PI) / 180;
      const x1 = 180 + 128 * Math.cos(a1);
      const y1 = 180 + 128 * Math.sin(a1);
      const x2 = 180 + 128 * Math.cos(a2);
      const y2 = 180 + 128 * Math.sin(a2);
      greenSegment.setAttribute('d', `M ${x1.toFixed(1)} ${y1.toFixed(1)} A 128 128 0 0 1 ${x2.toFixed(1)} ${y2.toFixed(1)}`);
    }
  }

  /**
   * TAB 2: Full 7-Lap Duas with speech audio
   */
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
              <span class="speech-label">Dengar Sebutan</span>
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

  /**
   * TAB 4: Fiqh, Syarat Sah & Larangan Tawaf
   */
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

  /**
   * Bind DOM Events
   */
  private bindEvents() {
    // Back button '<' (returns to 3D simulation)
    const btnBack = this.container.querySelector('#btn-motawef-back');
    btnBack?.addEventListener('click', () => {
      this.close();
      this.callbacks.onSwitchToGame?.();
    });

    // Audio Headphone button
    const btnAudio = this.container.querySelector('#btn-motawef-audio');
    btnAudio?.addEventListener('click', () => {
      this.toggleTalbiyahAudio();
    });

    // Main Motawef Circular Action Button '↗'
    const btnMotawefAction = this.container.querySelector('#btn-motawef-action');
    btnMotawefAction?.addEventListener('click', () => {
      this.advanceSectorOrLap();
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
      this.showIstilamBanner();
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
  }

  private showIstilamBanner() {
    const existing = document.getElementById('istilam-temporary-banner');
    if (existing) existing.remove();

    const banner = document.createElement('div');
    banner.id = 'istilam-temporary-banner';
    banner.className =
      'fixed bottom-6 left-1/2 -translate-x-1/2 z-50 max-w-sm w-[90%] p-4 rounded-3xl bg-white border-2 border-emerald-500 shadow-2xl text-center space-y-2';
    banner.innerHTML = `
      <div class="flex items-center justify-center gap-1.5 text-emerald-700 font-extrabold text-xs uppercase tracking-wider">
        <span>✋</span>
        <span>ISTILAM HAJARUL ASWAD</span>
      </div>
      <p class="font-arabic text-2xl text-stone-900 leading-normal" dir="rtl">
        بِسْمِ اللَّهِ، اللَّهُ أَكْبَرُ
      </p>
      <p class="text-xs text-stone-600">
        Angkat tangan kanan ke arah Hajarul Aswad sambil berzikir: <strong>"Bismillahi Allahu Akbar"</strong>.
      </p>
      <button id="btn-close-istilam-banner" class="mt-1 px-4 py-1.5 rounded-full bg-emerald-600 text-white text-xs font-bold cursor-pointer">
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
      locLabel.textContent = state.locationName;
    }

    const distLabel = this.container.querySelector('#qibla-distance-label');
    if (distLabel) {
      distLabel.textContent = `(Kiblat: ${state.qiblaBearing}°)`;
    }

    // Alignment Banner & Glow
    const banner = this.container.querySelector('#qibla-align-banner') as HTMLElement;
    const bannerText = this.container.querySelector('#qibla-align-text') as HTMLElement;

    if (banner && bannerText) {
      if (state.isFacingQibla) {
        banner.className =
          'w-full text-center py-1.5 px-3 rounded-full bg-emerald-50 border border-emerald-400 text-xs font-bold text-emerald-800 transition-all shadow-sm';
        bannerText.innerHTML = '✨ TEPAT MENGHADAP KAABAH! ✨';
      } else {
        banner.className =
          'w-full text-center py-1.5 px-3 rounded-full bg-stone-100/90 border border-stone-200/80 text-xs font-semibold text-stone-700 transition-all';
        let diff = state.relativeQibla;
        let turnDirection = 'kanan';
        let angleToTurn = diff;
        if (diff > 180) {
          turnDirection = 'kiri';
          angleToTurn = 360 - diff;
        }
        bannerText.innerHTML = `Pusingkan telefon ke <strong>${turnDirection} (${angleToTurn}°)</strong> untuk menghadap Kaabah`;
      }
    }

    // Rotate Radar Rose according to relative bearing if desired or keep upright
    const radarRose = this.container.querySelector('#motawef-radar-rose') as HTMLElement;
    if (radarRose && state.isSensorActive) {
      // Smoothly orient towards Kaabah relative to device heading
      radarRose.style.transform = `rotate(${-state.relativeQibla}deg)`;
    }

    // Update Slider
    const slider = this.container.querySelector('#slider-manual-heading') as HTMLInputElement;
    const manualHeadingLabel = this.container.querySelector('#manual-heading-label');
    if (slider && document.activeElement !== slider) {
      slider.value = String(state.heading);
      if (manualHeadingLabel) manualHeadingLabel.textContent = `${state.heading}°`;
    }
  }
}
