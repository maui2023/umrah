import { DuaItem, PlayerData, PlayerRole, UmrahStage, ZiarahSpot } from '../types';
import { soundManager } from '../audio/SoundManager';
import { TALBIYAH_DUA } from '../data/duas';
import { ZIARAH_SPOTS } from '../data/ziarahData';

export class HUD {
  private container: HTMLElement;
  private currentStage: UmrahStage = 'ziarah_dalam';
  public currentLap: number = 0;
  private currentDua: DuaItem | null = null;
  private currentZiarahSpot: ZiarahSpot | null = null;
  private currentZiarahIndex: number = 0;

  public groupMembers: PlayerData[] = [];
  public mutawwifPlayer: PlayerData | null = null;
  public isLocalMutawwif: boolean = false;
  public localPlayerPos = { x: 0, z: 0, rotation: 0 };

  // Callbacks
  public onTeleportCallback: ((location: string) => void) | null = null;
  private onActionButtonCallback: ((action: string) => void) | null = null;
  private onPrevZiarahCallback: (() => void) | null = null;
  private onNextZiarahCallback: (() => void) | null = null;
  private onSelectZiarahIndexCallback: ((index: number) => void) | null = null;
  private onJoystickMoveCallback: ((x: number, y: number) => void) | null = null;
  private onSprintToggleCallback: ((sprinting: boolean) => void) | null = null;
  private onBoardBusCallback: (() => void) | null = null;
  private onExitBusCallback: (() => void) | null = null;
  private onAutoCruiseCallback: (() => void) | null = null;
  private onResetProgressCallback: (() => void) | null = null;
  private onManualSaveCallback: (() => void) | null = null;
  public isBusBoarded: boolean = false;

  constructor() {
    this.container = document.createElement('div');
    this.container.id = 'umrah-hud-overlay';
    this.container.className = 'pointer-events-none fixed inset-0 z-40 flex flex-col justify-between p-3 sm:p-6 select-none font-sans overflow-hidden';
    document.body.appendChild(this.container);
    this.render();
    this.setupJoystick();
  }

  public registerCallbacks(options: {
    onTeleport: (loc: string) => void;
    onActionButton: (action: string) => void;
    onPrevZiarah?: () => void;
    onNextZiarah?: () => void;
    onSelectZiarahIndex?: (index: number) => void;
    onJoystickMove: (x: number, y: number) => void;
    onSprintToggle: (sprinting: boolean) => void;
    onBoardBus?: () => void;
    onExitBus?: () => void;
    onAutoCruise?: () => void;
    onResetProgress?: () => void;
    onManualSave?: () => void;
  }) {
    this.onTeleportCallback = options.onTeleport;
    this.onActionButtonCallback = options.onActionButton;
    this.onPrevZiarahCallback = options.onPrevZiarah || null;
    this.onNextZiarahCallback = options.onNextZiarah || null;
    this.onSelectZiarahIndexCallback = options.onSelectZiarahIndex || null;
    this.onJoystickMoveCallback = options.onJoystickMove;
    this.onSprintToggleCallback = options.onSprintToggle;
    this.onBoardBusCallback = options.onBoardBus || null;
    this.onExitBusCallback = options.onExitBus || null;
    this.onAutoCruiseCallback = options.onAutoCruise || null;
    this.onResetProgressCallback = options.onResetProgress || null;
    this.onManualSaveCallback = options.onManualSave || null;
  }

  public toggleRosterHide(_force?: boolean) {}
  public toggleDuaHide(_force?: boolean) {}
  public toggleAllUI() {}

  private render() {
    this.container.innerHTML = `
      <!-- TOP LAYER: HEADER CARD (Left) & ACTION BUTTON STACK (Right) -->
      <div class="w-full flex items-start justify-between pointer-events-none">
        
        <!-- TOP-LEFT: MINIMALIST MODERN LOCATION & PROGRESS CARD (Exactly matches screenshot) -->
        <div class="pointer-events-auto flex flex-col gap-2 max-w-[320px] sm:max-w-[370px] w-[90vw]">
          
          <!-- Card 1: Main Simulator & Location Title & Progress Indicator -->
          <div class="bg-white/95 backdrop-blur-md rounded-2xl p-4 sm:p-5 shadow-[0_8px_30px_rgba(0,0,0,0.06)] border border-stone-200/60 text-stone-900 transition-all">
            <!-- Subtitle with amber bar -->
            <div class="flex items-center gap-2 mb-1.5">
              <span class="inline-block w-4 h-[2px] bg-[#C5A880] rounded-full"></span>
              <span id="hud-category-label" class="text-[10px] sm:text-[11px] font-bold tracking-[0.22em] text-[#78716C] uppercase">
                UMRAH SIMULATOR
              </span>
            </div>

            <!-- Big Serif Location Heading -->
            <h1 id="hud-location-title" class="font-serif text-2xl sm:text-3xl font-medium text-stone-900 tracking-tight my-1">
              Saqifah Bani Saedah
            </h1>

            <!-- Segmented Progress Indicator Bar -->
            <div id="hud-segment-bar" class="flex items-center gap-1.5 w-full mt-3.5">
              ${[1, 2, 3, 4, 5, 6, 7, 8].map((i) => `
                <div class="hud-segment-pill h-1.5 rounded-full flex-1 transition-all duration-300 ${i === 1 ? 'bg-[#C5A880]' : 'bg-stone-200/90'}" data-segment="${i}"></div>
              `).join('')}
            </div>
          </div>

          <!-- Card 2: Clean Description Subcard -->
          <div id="hud-desc-card" class="bg-white/95 backdrop-blur-md rounded-2xl p-3.5 sm:p-4 shadow-[0_6px_20px_rgba(0,0,0,0.04)] border border-stone-200/60 text-[13px] sm:text-[14px] leading-relaxed text-stone-700 transition-all">
            <p id="hud-desc-text" class="text-stone-700 font-normal">
              Selamat datang ke Madinah Munawwarah. Sila ikuti mutawwif untuk memulakan ziarah tempat bersejarah sebelum ke Miqat Bir Ali.
            </p>

            <!-- Subtle action bar inside subcard -->
            <div class="flex items-center justify-between mt-2.5 pt-2.5 border-t border-stone-100 gap-2">
              <div class="flex items-center gap-2">
                <!-- TTS Audio Button -->
                <button id="btn-read-tts" title="Dengar Penerangan / Doa" class="interactive-ui flex items-center gap-1 text-stone-600 hover:text-stone-900 text-xs font-medium transition cursor-pointer">
                  <span>🗣️</span>
                  <span class="text-[11px]">Dengar</span>
                </button>
                <!-- Full Dua / History Modal Button -->
                <button id="btn-open-dua-detail" title="Papar Doa & Kisah Penuh" class="interactive-ui text-[11px] font-semibold text-[#B45309] hover:text-[#92400E] transition cursor-pointer flex items-center gap-1">
                  <span>📖</span>
                  <span>Doa Penuh</span>
                </button>
              </div>

              <!-- Primary Next / Action Button -->
              <div class="flex items-center gap-1.5">
                <button id="btn-ziarah-prev-mini" title="Lokasi Sebelumnya" class="interactive-ui p-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-600 text-xs transition cursor-pointer">
                  ◀
                </button>
                <button id="btn-main-action" class="interactive-ui px-3.5 py-1.5 rounded-xl bg-stone-900 hover:bg-stone-800 active:scale-95 text-white font-medium text-xs shadow-sm transition flex items-center gap-1 cursor-pointer">
                  <span id="main-action-icon">🚶</span>
                  <span id="main-action-text">Teruskan</span>
                </button>
                <button id="btn-ziarah-next-mini" title="Lokasi Seterusnya" class="interactive-ui p-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-600 text-xs transition cursor-pointer">
                  ▶
                </button>
              </div>
            </div>
          </div>

        </div>

        <!-- TOP-RIGHT: 4 VERTICAL ACTION BUTTONS (Matches screenshot) -->
        <div class="pointer-events-auto flex flex-col gap-2.5 z-40">
          
          <!-- 1. Jadual Ziarah & Peta (Book Icon) -->
          <button id="btn-top-itinerary" title="Jadual & Laluan Ziarah Lengkap" class="interactive-ui w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-white/95 backdrop-blur-md shadow-[0_4px_16px_rgba(0,0,0,0.06)] border border-stone-200/80 flex items-center justify-center text-stone-700 hover:bg-stone-50 active:scale-95 transition cursor-pointer">
            <svg class="w-5 h-5 text-stone-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </button>

          <!-- 2. Bantuan & Panduan (?) -->
          <button id="btn-top-help" title="Panduan Ibadah & Kawalan" class="interactive-ui w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-white/95 backdrop-blur-md shadow-[0_4px_16px_rgba(0,0,0,0.06)] border border-stone-200/80 flex items-center justify-center text-stone-800 hover:bg-stone-50 active:scale-95 transition cursor-pointer text-lg font-bold font-serif">
            ?
          </button>

          <!-- 3. Audio & Mute (Speaker Icon) -->
          <button id="btn-top-audio" title="Kawal Bunyi & Suara" class="interactive-ui w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-white/95 backdrop-blur-md shadow-[0_4px_16px_rgba(0,0,0,0.06)] border border-stone-200/80 flex items-center justify-center text-stone-700 hover:bg-stone-50 active:scale-95 transition cursor-pointer">
            <span id="top-audio-icon" class="text-sm font-semibold">🔈x</span>
          </button>

          <!-- 4. Exit / Sesi & Simpanan -->
          <button id="btn-top-exit" title="Keluar / Simpan Sesi / Mula Semula" class="interactive-ui w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-white/95 backdrop-blur-md shadow-[0_4px_16px_rgba(0,0,0,0.06)] border border-stone-200/80 flex items-center justify-center text-stone-800 hover:bg-stone-50 active:scale-95 transition cursor-pointer text-xs font-bold">
            Exit
          </button>
        </div>
      </div>

      <!-- BOTTOM LAYER: JOYSTICK (Left) & RUN BUTTON (Right) -->
      <div class="w-full flex items-end justify-between pointer-events-none pb-2 sm:pb-3">
        
        <!-- JOYSTICK (Matches screenshot: outer cream ring with dashed inner ring and navy thumb) -->
        <div id="touch-joystick-zone" class="interactive-ui pointer-events-auto relative w-28 h-28 sm:w-32 sm:h-32 rounded-full bg-[#FAF7F2]/90 backdrop-blur-md border border-stone-200/80 shadow-[0_12px_32px_rgba(0,0,0,0.08)] flex items-center justify-center touch-none select-none cursor-grab active:cursor-grabbing">
          <!-- Inner Dashed Outline Ring (exact style from screenshot) -->
          <div class="w-[82%] h-[82%] rounded-full border border-dashed border-stone-400/50 absolute pointer-events-none"></div>
          <!-- Center Navy Blue Control Knob -->
          <div id="touch-joystick-thumb" class="w-12 h-12 rounded-full bg-[#1E293B] shadow-lg pointer-events-none transform transition-transform"></div>
        </div>

        <!-- RUN BUTTON (Matches screenshot: round cream button with >> and RUN text) -->
        <div class="pointer-events-auto">
          <button id="btn-mobile-sprint" title="Lari / Pecut (Shift / Run)" class="interactive-ui w-[72px] h-[72px] sm:w-[78px] sm:h-[78px] rounded-full bg-[#FAF7F2]/95 backdrop-blur-md border border-stone-200/80 shadow-[0_12px_32px_rgba(0,0,0,0.08)] flex flex-col items-center justify-center active:scale-95 transition cursor-pointer select-none touch-none">
            <span class="text-stone-900 font-black text-sm tracking-tighter leading-none mb-1">»</span>
            <span class="text-stone-900 font-bold text-[10px] tracking-widest leading-none">RUN</span>
          </button>
        </div>
      </div>

      <!-- FLOATING BUS DOOR PROMPT (Appears when near bus entrance) -->
      <div id="bus-door-prompt" style="display: none;" class="interactive-ui pointer-events-auto fixed bottom-32 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-5 py-3 rounded-2xl bg-white/95 backdrop-blur-md border-2 border-[#C5A880] shadow-2xl text-stone-900 cursor-pointer animate-bounce">
        <span class="text-2xl">🚌</span>
        <div>
          <div class="font-bold text-sm text-stone-900">Tekan [E] atau Klik untuk Naik Bas</div>
          <div class="text-[11px] text-stone-600">Pintu Masuk Bas Ziarah Rombongan</div>
        </div>
        <button id="btn-prompt-board-bus" class="px-3.5 py-1.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs shadow-md transition cursor-pointer">
          Naik Bas ➔
        </button>
      </div>

      <!-- BUS DRIVING DASHBOARD (When riding or driving inside the bus) -->
      <div id="bus-dashboard-card" style="display: none;" class="interactive-ui pointer-events-auto fixed top-20 left-1/2 -translate-x-1/2 z-40 w-[92%] sm:w-auto sm:min-w-[420px] bg-white/95 backdrop-blur-md border border-stone-200/80 rounded-2xl p-4 shadow-2xl text-stone-900">
        <div class="flex items-center justify-between gap-3 pb-2.5 mb-2.5 border-b border-stone-200/70">
          <div class="flex items-center gap-2.5">
            <span class="text-2xl animate-pulse">🚌</span>
            <div>
              <div class="font-bold text-sm text-stone-900">Bas Ziarah Sedang Beroperasi</div>
              <div id="bus-dashboard-dest" class="text-xs text-stone-600 font-medium">Destinasi: Masjid Quba</div>
            </div>
          </div>
          <div class="flex items-center gap-2">
            <div class="px-3 py-1 rounded-xl bg-stone-100 border border-stone-200 text-stone-900 font-mono font-bold text-xs sm:text-sm">
              <span id="bus-speedometer">0</span> km/j
            </div>
            <button id="btn-exit-bus" title="Turun Dari Bas" class="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition flex items-center gap-1 shadow cursor-pointer">
              <span>🚪</span>
              <span>Turun Bas</span>
            </button>
          </div>
        </div>

        <div class="flex flex-wrap items-center justify-between gap-2 text-xs">
          <div class="text-stone-500 text-[11px] flex items-center gap-1">
            <span>🕹️ Kawalan: <b>WASD / Joystick</b> untuk memandu bas</span>
          </div>
          <button id="btn-auto-cruise" class="px-3 py-1.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs shadow transition flex items-center gap-1 cursor-pointer">
            <span>▶️</span>
            <span id="btn-auto-cruise-text">Pandu Automatik</span>
          </button>
        </div>
      </div>
    `;

    this.attachEventListeners();
  }

  private attachEventListeners() {
    // 1. Top Itinerary Button (Book Icon)
    const itineraryBtn = this.container.querySelector('#btn-top-itinerary') as HTMLButtonElement;
    itineraryBtn?.addEventListener('click', () => {
      this.showItineraryModal();
    });

    // 2. Top Help Button (?)
    const helpBtn = this.container.querySelector('#btn-top-help') as HTMLButtonElement;
    helpBtn?.addEventListener('click', () => {
      this.showGuideModal();
    });

    // 3. Top Audio Toggle Button (Speaker Icon)
    const audioBtn = this.container.querySelector('#btn-top-audio') as HTMLButtonElement;
    const audioIcon = this.container.querySelector('#top-audio-icon') as HTMLElement;
    audioBtn?.addEventListener('click', () => {
      const isMuted = soundManager.getMuted();
      soundManager.setMuted(!isMuted);
      if (audioIcon) {
        audioIcon.innerText = !isMuted ? '🔈x' : '🔈';
      }
      if (isMuted) {
        soundManager.startCourtyardAmbience();
        soundManager.speakDua(TALBIYAH_DUA.arabic + '. ' + TALBIYAH_DUA.translation);
      }
    });

    // 4. Top Exit Button (Exit)
    const exitBtn = this.container.querySelector('#btn-top-exit') as HTMLButtonElement;
    exitBtn?.addEventListener('click', () => {
      this.showSessionModal();
    });

    // Subcard Action & TTS Buttons
    const readTtsBtn = this.container.querySelector('#btn-read-tts') as HTMLButtonElement;
    readTtsBtn?.addEventListener('click', () => {
      if (this.currentZiarahSpot) {
        const textToRead = `${this.currentZiarahSpot.title}. ${this.currentZiarahSpot.historicalStory}. ` +
          (this.currentZiarahSpot.dua ? `${this.currentZiarahSpot.dua.arabic}. ${this.currentZiarahSpot.dua.translation}` : '');
        soundManager.speakDua(textToRead);
      } else if (this.currentDua) {
        soundManager.speakDua(this.currentDua.arabic + '. ' + this.currentDua.translation);
      }
    });

    const openDuaBtn = this.container.querySelector('#btn-open-dua-detail') as HTMLButtonElement;
    openDuaBtn?.addEventListener('click', () => {
      this.showDuaDetailModal();
    });

    const mainActionBtn = this.container.querySelector('#btn-main-action') as HTMLButtonElement;
    mainActionBtn?.addEventListener('click', () => {
      this.onActionButtonCallback?.(this.currentStage);
    });

    const prevMiniBtn = this.container.querySelector('#btn-ziarah-prev-mini') as HTMLButtonElement;
    prevMiniBtn?.addEventListener('click', () => {
      this.onPrevZiarahCallback?.();
    });

    const nextMiniBtn = this.container.querySelector('#btn-ziarah-next-mini') as HTMLButtonElement;
    nextMiniBtn?.addEventListener('click', () => {
      this.onNextZiarahCallback?.();
    });

    // Sprint Button (Hold or Click)
    const sprintBtn = this.container.querySelector('#btn-mobile-sprint') as HTMLButtonElement;
    let sprinting = false;
    const toggleSprint = (state: boolean) => {
      sprinting = state;
      sprintBtn.style.transform = state ? 'scale(0.92)' : '';
      sprintBtn.style.backgroundColor = state ? '#EDE8DE' : '';
      this.onSprintToggleCallback?.(sprinting);
    };

    sprintBtn?.addEventListener('touchstart', (e) => {
      e.preventDefault();
      e.stopPropagation();
      toggleSprint(true);
    }, { passive: false });

    sprintBtn?.addEventListener('touchend', (e) => {
      e.preventDefault();
      e.stopPropagation();
      toggleSprint(false);
    }, { passive: false });

    sprintBtn?.addEventListener('mousedown', (e) => {
      e.preventDefault();
      e.stopPropagation();
      toggleSprint(true);
    });

    window.addEventListener('mouseup', () => {
      if (sprinting) toggleSprint(false);
    });

    // Bus Boarding Prompts
    const promptBoardBtn = this.container.querySelector('#btn-prompt-board-bus') as HTMLButtonElement;
    promptBoardBtn?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.onBoardBusCallback?.();
    });

    const busDoorPrompt = this.container.querySelector('#bus-door-prompt') as HTMLElement;
    busDoorPrompt?.addEventListener('click', () => {
      this.onBoardBusCallback?.();
    });

    const exitBusBtn = this.container.querySelector('#btn-exit-bus') as HTMLButtonElement;
    exitBusBtn?.addEventListener('click', () => {
      this.onExitBusCallback?.();
    });

    const autoCruiseBtn = this.container.querySelector('#btn-auto-cruise') as HTMLButtonElement;
    autoCruiseBtn?.addEventListener('click', () => {
      this.onAutoCruiseCallback?.();
    });
  }

  private setupJoystick() {
    const zone = this.container.querySelector('#touch-joystick-zone') as HTMLElement;
    const thumb = this.container.querySelector('#touch-joystick-thumb') as HTMLElement;
    if (!zone || !thumb) return;

    let touchId: number | null = null;
    let isMouseDown = false;
    let center = { x: 0, y: 0 };
    const maxRadius = 42;

    // Mobile Touch
    zone.addEventListener('touchstart', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const touch = e.changedTouches[0];
      touchId = touch.identifier;
      const rect = zone.getBoundingClientRect();
      center = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
    }, { passive: false });

    window.addEventListener('touchmove', (e) => {
      if (touchId === null) return;
      for (let i = 0; i < e.changedTouches.length; i++) {
        const touch = e.changedTouches[i];
        if (touch.identifier === touchId) {
          const dx = touch.clientX - center.x;
          const dy = touch.clientY - center.y;
          const dist = Math.hypot(dx, dy);
          const clampedDist = Math.min(dist, maxRadius);
          const angle = Math.atan2(dy, dx);

          const nx = Math.cos(angle) * clampedDist;
          const ny = Math.sin(angle) * clampedDist;

          thumb.style.transform = `translate(${nx}px, ${ny}px)`;
          this.onJoystickMoveCallback?.(nx / maxRadius, ny / maxRadius);
          break;
        }
      }
    }, { passive: true });

    const resetJoystick = () => {
      touchId = null;
      isMouseDown = false;
      thumb.style.transform = 'translate(0px, 0px)';
      this.onJoystickMoveCallback?.(0, 0);
    };

    window.addEventListener('touchend', resetJoystick, { passive: true });
    window.addEventListener('touchcancel', resetJoystick, { passive: true });

    // Desktop Mouse Drag Support
    zone.addEventListener('mousedown', (e) => {
      e.preventDefault();
      e.stopPropagation();
      isMouseDown = true;
      const rect = zone.getBoundingClientRect();
      center = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
    });

    window.addEventListener('mousemove', (e) => {
      if (!isMouseDown) return;
      const dx = e.clientX - center.x;
      const dy = e.clientY - center.y;
      const dist = Math.hypot(dx, dy);
      const clampedDist = Math.min(dist, maxRadius);
      const angle = Math.atan2(dy, dx);

      const nx = Math.cos(angle) * clampedDist;
      const ny = Math.sin(angle) * clampedDist;

      thumb.style.transform = `translate(${nx}px, ${ny}px)`;
      this.onJoystickMoveCallback?.(nx / maxRadius, ny / maxRadius);
    });

    window.addEventListener('mouseup', () => {
      if (isMouseDown) {
        resetJoystick();
      }
    });
  }

  /**
   * Update Progress Segment Bar pills
   */
  private updateSegmentPills(activeCount: number, totalSegments: number = 8) {
    const bar = this.container.querySelector('#hud-segment-bar');
    if (!bar) return;

    let html = '';
    for (let i = 1; i <= totalSegments; i++) {
      const isFilled = i <= activeCount;
      html += `
        <div class="hud-segment-pill h-1.5 rounded-full flex-1 transition-all duration-300 ${
          isFilled ? 'bg-[#C5A880]' : 'bg-stone-200/90'
        }" data-segment="${i}"></div>
      `;
    }
    bar.innerHTML = html;
  }

  /**
   * Update Ziarah Spot Information in the Minimalist Header Card
   */
  public updateZiarahSpot(spot: ZiarahSpot, index: number, total: number) {
    this.currentZiarahSpot = spot;
    this.currentZiarahIndex = index;

    const categoryLabelEl = this.container.querySelector('#hud-category-label') as HTMLElement;
    const titleEl = this.container.querySelector('#hud-location-title') as HTMLElement;
    const descText = this.container.querySelector('#hud-desc-text') as HTMLElement;
    const actionText = this.container.querySelector('#main-action-text') as HTMLElement;
    const actionIcon = this.container.querySelector('#main-action-icon') as HTMLElement;

    if (categoryLabelEl) {
      if (spot.category === 'miqat_bir_ali') {
        categoryLabelEl.innerText = 'MIQAT BIR ALI';
      } else if (spot.category.startsWith('ziarah_luar')) {
        categoryLabelEl.innerText = 'ZIARAH BAS MADINAH';
      } else if (spot.category === 'perjalanan_makkah') {
        categoryLabelEl.innerText = 'PERJALANAN KE MAKKAH';
      } else {
        categoryLabelEl.innerText = 'UMRAH SIMULATOR';
      }
    }

    if (titleEl) {
      titleEl.innerText = spot.title;
    }

    if (descText) {
      if (spot.category === 'miqat_bir_ali') {
        descText.innerText = 'This is Masjid Bir Ali. Your bus waits at the kerb beyond the palms. Masuk ke masjid untuk solat sunat dan lafazkan niat Ihram Umrah.';
      } else {
        descText.innerText = spot.shortDesc || spot.historicalStory;
      }
    }

    if (actionText) actionText.innerText = spot.actionText || 'Teruskan';
    if (actionIcon) actionIcon.innerText = spot.actionIcon || '🚶';

    // Update segmented pills
    const activeSegment = Math.max(1, Math.min(8, Math.round(((index + 1) / total) * 8)));
    this.updateSegmentPills(activeSegment, 8);
  }

  public updateStage(stage: UmrahStage) {
    this.currentStage = stage;
    const categoryLabelEl = this.container.querySelector('#hud-category-label') as HTMLElement;
    const titleEl = this.container.querySelector('#hud-location-title') as HTMLElement;
    const descText = this.container.querySelector('#hud-desc-text') as HTMLElement;
    const actionText = this.container.querySelector('#main-action-text') as HTMLElement;
    const actionIcon = this.container.querySelector('#main-action-icon') as HTMLElement;

    if (stage === 'tawaf') {
      if (categoryLabelEl) categoryLabelEl.innerText = 'RUKUN UMRAH 1/3';
      if (titleEl) titleEl.innerText = 'Tawaf Kaabah (7 Pusingan)';
      if (descText) descText.innerText = 'Mulakan pusingan di garisan Hajarul Aswad. Kaabah sentiasa berada di sebelah kiri anda.';
      if (actionText) actionText.innerText = 'Pusingan Tawaf';
      if (actionIcon) actionIcon.innerText = '🕋';
      this.updateSegmentPills(1, 7);
    } else if (stage === 'solat_zamzam') {
      if (categoryLabelEl) categoryLabelEl.innerText = 'SUNNAH SELEPAS TAWAF';
      if (titleEl) titleEl.innerText = 'Solat Sunat & Minum Zamzam';
      if (descText) descText.innerText = 'Solat Sunat 2 rakaat di belakang Maqam Ibrahim, kemudian minum air zamzam sehingga kenyang.';
      if (actionText) actionText.innerText = 'Ke Safa (Sa\'i)';
      if (actionIcon) actionIcon.innerText = '💧';
      this.updateSegmentPills(7, 7);
    } else if (stage === 'sai') {
      if (categoryLabelEl) categoryLabelEl.innerText = 'RUKUN UMRAH 2/3';
      if (titleEl) titleEl.innerText = 'Sa\'i Safa ke Marwah';
      if (descText) descText.innerText = 'Berjalan antara Bukit Safa dan Marwah sebanyak 7 pusingan. Berlari anak di zon berlampu hijau.';
      if (actionText) actionText.innerText = 'Pusingan Sa\'i';
      if (actionIcon) actionIcon.innerText = '🚶‍♂️';
      this.updateSegmentPills(1, 7);
    } else if (stage === 'tahallul') {
      if (categoryLabelEl) categoryLabelEl.innerText = 'RUKUN UMRAH 3/3';
      if (titleEl) titleEl.innerText = 'Tahallul (Bercukur)';
      if (descText) descText.innerText = 'Bercukur atau bergunting rambut sekurang-kurangnya 3 helai bagi melepaskan semua pantang larang ihram.';
      if (actionText) actionText.innerText = 'Selesai Umrah';
      if (actionIcon) actionIcon.innerText = '✂️';
      this.updateSegmentPills(7, 7);
    } else if (stage === 'completed') {
      if (categoryLabelEl) categoryLabelEl.innerText = 'UMRAH MABRUR';
      if (titleEl) titleEl.innerText = 'Alhamdulillah Selesai';
      if (descText) descText.innerText = 'Tahniah! Anda telah menyempurnakan kesemua rukun umrah dan ziarah dengan jayanya.';
      if (actionText) actionText.innerText = 'Lihat Sijil';
      if (actionIcon) actionIcon.innerText = '🏆';
      this.updateSegmentPills(7, 7);
    }
  }

  public setNearBusDoor(isNear: boolean) {
    const prompt = this.container.querySelector('#bus-door-prompt') as HTMLElement;
    if (prompt) {
      prompt.style.display = isNear && !this.isBusBoarded ? 'flex' : 'none';
    }
  }

  public setBusBoarded(inBus: boolean) {
    this.isBusBoarded = inBus;
    const prompt = this.container.querySelector('#bus-door-prompt') as HTMLElement;
    if (prompt) prompt.style.display = 'none';

    const dashboard = this.container.querySelector('#bus-dashboard-card') as HTMLElement;
    if (dashboard) {
      dashboard.style.display = inBus ? 'block' : 'none';
    }
  }

  public updateBusDrivingHUD(speedKmh: number, isCruising: boolean, destName?: string) {
    const speedometer = this.container.querySelector('#bus-speedometer') as HTMLElement;
    const cruiseText = this.container.querySelector('#btn-auto-cruise-text') as HTMLElement;
    const destEl = this.container.querySelector('#bus-dashboard-dest') as HTMLElement;

    if (speedometer) speedometer.innerText = speedKmh.toString();
    if (cruiseText) {
      cruiseText.innerText = isCruising ? 'Hentikan Autopilot' : 'Pandu Automatik';
    }
    if (destName && destEl) {
      destEl.innerText = `Destinasi: ${destName}`;
    }
  }

  public updateSolatZamzamStatus(_solatSunatDone: boolean, _zamzamDone: boolean) {}

  public updateLap(stage: 'tawaf' | 'sai', lap: number) {
    this.currentLap = lap;
    const titleEl = this.container.querySelector('#hud-location-title') as HTMLElement;
    const descText = this.container.querySelector('#hud-desc-text') as HTMLElement;

    if (stage === 'tawaf') {
      if (titleEl) titleEl.innerText = `Tawaf Pusingan ke-${lap} / 7`;
      if (descText) descText.innerText = `Sedang mengelilingi Kaabah pusingan ke-${lap}. Lafazkan doa dan istilam di penjuru Rukun Yamani dan Hajarul Aswad.`;
    } else {
      const fromHill = lap % 2 === 1 ? 'Safa ke Marwah' : 'Marwah ke Safa';
      if (titleEl) titleEl.innerText = `Sa'i Pusingan ke-${lap} (${fromHill})`;
      if (descText) descText.innerText = `Pusingan ke-${lap} daripada 7 pusingan Sa'i. Perbanyakkan zikir dan doa ketika mendaki bukit.`;
    }

    this.updateSegmentPills(lap, 7);
  }

  public displayDua(dua: DuaItem, alertMessage?: string) {
    this.currentDua = dua;
    const descText = this.container.querySelector('#hud-desc-text') as HTMLElement;
    if (descText) {
      descText.innerText = alertMessage ? `${alertMessage} — ${dua.translation}` : `${dua.title}: ${dua.translation}`;
    }
  }

  public updateGroupRoster(
    groupName: string,
    _groupColor: string,
    localPlayerPos: { x: number; z: number; rotation: number },
    allPlayers: PlayerData[],
    localRole: PlayerRole = 'jemaah'
  ) {
    this.localPlayerPos = localPlayerPos;
    this.isLocalMutawwif = localRole === 'mutawwif';
    this.groupMembers = allPlayers.filter(p => p.groupName === groupName);
    this.mutawwifPlayer = this.groupMembers.find(p => p.role === 'mutawwif') || null;
  }

  /**
   * Popup Modal to view full Arabic dua, transliteration, and explanation
   */
  public showDuaDetailModal() {
    const modal = document.createElement('div');
    modal.className = 'interactive-ui fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 backdrop-blur-md p-4 overflow-y-auto';

    const spot = this.currentZiarahSpot;
    const dua = this.currentDua || spot?.dua;

    const title = spot?.title || dua?.title || 'Doa & Zikir';
    const arabic = dua?.arabic || 'بِسْمِ اللَّهِ وَاللَّهُ أَكْبَرُ';
    const translit = dua?.transliteration || 'Bismillahi Allahu Akbar';
    const translation = dua?.translation || 'Dengan nama Allah dan Allah Maha Besar.';
    const story = spot?.historicalStory || 'Penerangan sirah dan sejarah tempat mulia ini.';

    modal.innerHTML = `
      <div class="relative w-full max-w-lg bg-white rounded-3xl p-6 sm:p-7 text-stone-900 shadow-2xl space-y-4 border border-stone-200">
        
        <div class="flex items-center justify-between pb-3 border-b border-stone-100">
          <div>
            <span class="text-[10px] font-bold tracking-widest text-[#B45309] uppercase">BACAAN DOA & SIRAH</span>
            <h3 class="font-serif text-xl sm:text-2xl font-medium text-stone-900 mt-0.5">${title}</h3>
          </div>
          <button id="btn-close-dua-modal" class="p-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-600 transition cursor-pointer">✕</button>
        </div>

        <!-- Arabic Text -->
        <div class="text-right text-xl sm:text-2xl font-serif leading-loose text-stone-900 py-2 tracking-wide bg-stone-50 p-4 rounded-2xl border border-stone-100" dir="rtl">
          ${arabic}
        </div>

        <!-- Transliteration -->
        <div class="text-xs sm:text-sm text-stone-600 italic">
          ${translit}
        </div>

        <!-- Translation -->
        <div class="text-xs sm:text-sm text-stone-800 leading-relaxed font-normal bg-amber-50/50 p-3.5 rounded-xl border border-amber-200/60">
          <b>Maksud:</b> ${translation}
        </div>

        <!-- Story / Explanation -->
        <div class="text-xs text-stone-600 leading-relaxed pt-1">
          <b class="text-stone-800">Kisah & Sejarah:</b> ${story}
        </div>

        <div class="flex items-center gap-2 pt-2 border-t border-stone-100">
          <button id="btn-modal-speak" class="flex-1 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer">
            <span>🗣️</span>
            <span>Dengar Bacaan</span>
          </button>
          <button id="btn-modal-done" class="flex-1 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold transition cursor-pointer">
            Faham & Tutup
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    const close = () => modal.remove();
    modal.querySelector('#btn-close-dua-modal')?.addEventListener('click', close);
    modal.querySelector('#btn-modal-done')?.addEventListener('click', close);
    modal.querySelector('#btn-modal-speak')?.addEventListener('click', () => {
      soundManager.speakDua(arabic + '. ' + translation);
    });
  }

  /**
   * Modal displaying the complete Itinerary matching user screenshot
   */
  public showItineraryModal() {
    const modal = document.createElement('div');
    modal.className = 'interactive-ui fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 backdrop-blur-md p-3 sm:p-5 overflow-y-auto';

    const ziarahDalam = ZIARAH_SPOTS.filter(s => s.category === 'dalam_madinah');
    const ziarahLuarMelintas = ZIARAH_SPOTS.filter(s => s.category === 'luar_madinah_melintas');
    const ziarahLuarTurun = ZIARAH_SPOTS.filter(s => s.category === 'luar_madinah_turun');
    const ziarahPilihan = ZIARAH_SPOTS.filter(s => s.category === 'ziarah_pilihan');
    const miqatDanMakkah = ZIARAH_SPOTS.filter(s => s.category === 'ziarah_wida_hotel' || s.category === 'miqat_bir_ali' || s.category === 'perjalanan_makkah');

    modal.innerHTML = `
      <div class="relative w-full max-w-3xl bg-white border border-stone-200 rounded-3xl p-5 sm:p-7 text-stone-900 max-h-[90vh] overflow-y-auto shadow-2xl space-y-5">
        
        <!-- Header -->
        <div class="flex items-center justify-between pb-3.5 border-b border-stone-100">
          <div>
            <div class="flex items-center gap-2">
              <span class="text-2xl">🗺️</span>
              <h2 class="font-serif text-xl sm:text-2xl font-bold text-stone-900">Jadual Lengkap Ziarah & Umrah</h2>
            </div>
            <p class="text-xs text-stone-500 mt-0.5">Pilih lokasi di bawah untuk melompat serta melihat penerangan dan doa</p>
          </div>
          <button id="close-itinerary-btn" class="p-2 rounded-xl bg-stone-100 text-stone-600 hover:bg-stone-200 transition cursor-pointer">✕</button>
        </div>

        <!-- Section 1: ZIARAH DALAM MADINAH -->
        <div class="space-y-2.5">
          <div class="flex items-center justify-between">
            <h3 class="text-xs font-bold tracking-wider text-[#B45309] uppercase">
              ➤ Ziarah Dalam Madinah (Berjalan Kaki)
            </h3>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
            ${ziarahDalam.map((spot) => {
              const idx = ZIARAH_SPOTS.indexOf(spot);
              const isActive = idx === this.currentZiarahIndex;
              return `
                <div class="p-3 rounded-2xl border transition cursor-pointer hover:border-stone-400 ${
                  isActive ? 'bg-[#FAF7F2] border-[#C5A880] ring-1 ring-[#C5A880]' : 'bg-stone-50/80 border-stone-200/80'
                }" data-index="${idx}">
                  <div class="flex items-center justify-between mb-1">
                    <span class="font-serif font-bold text-xs ${isActive ? 'text-[#B45309]' : 'text-stone-800'}">
                      ${spot.number}) ${spot.title}
                    </span>
                    <span class="text-[10px] px-2 py-0.5 rounded-full ${isActive ? 'bg-[#C5A880] text-white font-bold' : 'bg-stone-200 text-stone-600'}">
                      ${isActive ? 'Lokasi Semasa' : 'Pilih'}
                    </span>
                  </div>
                  <p class="text-[11px] text-stone-500 line-clamp-2">${spot.shortDesc}</p>
                </div>
              `;
            }).join('')}
          </div>
        </div>

        <!-- Section 2: ZIARAH LUAR MADINAH -->
        <div class="space-y-3 pt-3 border-t border-stone-100">
          <h3 class="text-xs font-bold tracking-wider text-[#B45309] uppercase">
            ➤ Ziarah Luar Madinah (Menaiki Bas)
          </h3>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
            ${[...ziarahLuarMelintas, ...ziarahLuarTurun].map((spot) => {
              const idx = ZIARAH_SPOTS.indexOf(spot);
              const isActive = idx === this.currentZiarahIndex;
              return `
                <div class="p-3 rounded-2xl border transition cursor-pointer hover:border-stone-400 ${
                  isActive ? 'bg-[#FAF7F2] border-[#C5A880] ring-1 ring-[#C5A880]' : 'bg-stone-50/80 border-stone-200/80'
                }" data-index="${idx}">
                  <div class="flex items-center justify-between mb-1">
                    <span class="font-serif font-bold text-xs ${isActive ? 'text-[#B45309]' : 'text-stone-800'}">
                      ${spot.number}) ${spot.title}
                    </span>
                    <span class="text-[10px] px-2 py-0.5 rounded-full ${isActive ? 'bg-[#C5A880] text-white font-bold' : 'bg-stone-200 text-stone-600'}">
                      ${isActive ? 'Lokasi Semasa' : 'Pilih'}
                    </span>
                  </div>
                  <p class="text-[11px] text-stone-500 line-clamp-2">${spot.shortDesc}</p>
                </div>
              `;
            }).join('')}
          </div>
        </div>

        <!-- Section 3: ZIARAH PILIHAN MADINAH -->
        <div class="space-y-2 pt-3 border-t border-stone-100">
          <h3 class="text-xs font-bold tracking-wider text-[#B45309] uppercase">
            ➤ Ziarah Pilihan Madinah
          </h3>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
            ${ziarahPilihan.map((spot) => {
              const idx = ZIARAH_SPOTS.indexOf(spot);
              const isActive = idx === this.currentZiarahIndex;
              return `
                <div class="p-3 rounded-2xl border transition cursor-pointer hover:border-stone-400 ${
                  isActive ? 'bg-[#FAF7F2] border-[#C5A880] ring-1 ring-[#C5A880]' : 'bg-stone-50/80 border-stone-200/80'
                }" data-index="${idx}">
                  <div class="flex items-center justify-between mb-1">
                    <span class="font-serif font-bold text-xs ${isActive ? 'text-[#B45309]' : 'text-stone-800'}">
                      ${spot.number}) ${spot.title}
                    </span>
                    <span class="text-[10px] px-2 py-0.5 rounded-full ${isActive ? 'bg-[#C5A880] text-white font-bold' : 'bg-stone-200 text-stone-600'}">
                      ${isActive ? 'Lokasi Semasa' : 'Pilih'}
                    </span>
                  </div>
                  <p class="text-[11px] text-stone-500 line-clamp-2">${spot.shortDesc}</p>
                </div>
              `;
            }).join('')}
          </div>
        </div>

        <!-- Section 4: PERSIAPAN, MIQAT & KE MAKKAH -->
        <div class="space-y-2 pt-3 border-t border-stone-100">
          <h3 class="text-xs font-bold tracking-wider text-stone-800 uppercase flex items-center gap-1.5">
            <span>🕋</span> MIQAT BIR ALI & PERJALANAN MAKKAH
          </h3>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
            ${miqatDanMakkah.map((spot) => {
              const idx = ZIARAH_SPOTS.indexOf(spot);
              const isActive = idx === this.currentZiarahIndex;
              return `
                <div class="p-3 rounded-2xl border transition cursor-pointer hover:border-stone-400 ${
                  isActive ? 'bg-[#FAF7F2] border-[#C5A880] ring-2 ring-[#C5A880]' : 'bg-stone-50/80 border-stone-200/80'
                }" data-index="${idx}">
                  <div class="flex items-center justify-between mb-1">
                    <span class="font-serif font-bold text-xs ${isActive ? 'text-[#B45309]' : 'text-stone-900'}">
                      ${spot.title}
                    </span>
                    <span class="text-[10px] px-2 py-0.5 rounded-full ${isActive ? 'bg-[#C5A880] text-white font-bold' : 'bg-stone-200 text-stone-600'}">
                      ${isActive ? 'Lokasi Semasa' : 'Pilih'}
                    </span>
                  </div>
                  <p class="text-[11px] text-stone-500 line-clamp-2">${spot.shortDesc}</p>
                </div>
              `;
            }).join('')}
          </div>
        </div>

        <div class="pt-3 border-t border-stone-100 flex justify-end">
          <button id="itinerary-ok-btn" class="px-5 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs transition cursor-pointer">
            Tutup Jadual
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    const close = () => modal.remove();
    modal.querySelector('#close-itinerary-btn')?.addEventListener('click', close);
    modal.querySelector('#itinerary-ok-btn')?.addEventListener('click', close);

    modal.querySelectorAll('[data-index]').forEach((el) => {
      el.addEventListener('click', () => {
        const idx = parseInt((el as HTMLElement).dataset.index || '0');
        const spot = ZIARAH_SPOTS[idx];
        if (spot && this.onTeleportCallback && spot.id) {
          this.onTeleportCallback(spot.id);
        }
        this.onSelectZiarahIndexCallback?.(idx);
        close();
      });
    });
  }

  /**
   * Quick Guide & Controls Modal (?)
   */
  public showGuideModal() {
    const modal = document.createElement('div');
    modal.className = 'interactive-ui fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 backdrop-blur-md p-4 overflow-y-auto';
    modal.innerHTML = `
      <div class="relative w-full max-w-lg bg-white border border-stone-200 rounded-3xl p-6 sm:p-7 text-stone-900 shadow-2xl space-y-4">
        
        <div class="flex items-center justify-between pb-3 border-b border-stone-100">
          <div class="flex items-center gap-2">
            <span class="text-2xl">📖</span>
            <h3 class="font-serif text-xl font-bold text-stone-900">Panduan Kawalan & Ibadah Umrah</h3>
          </div>
          <button id="close-guide-btn" class="p-2 rounded-xl bg-stone-100 text-stone-600 hover:bg-stone-200 transition cursor-pointer">✕</button>
        </div>

        <div class="space-y-3 text-xs leading-relaxed text-stone-700">
          <div class="p-3 bg-stone-50 rounded-2xl border border-stone-200/60 space-y-1">
            <h4 class="font-bold text-stone-900 text-xs">🕹️ Kawalan Pergerakan:</h4>
            <p>• <b>Skrin Sentuh Mobile:</b> Gunakan Joystick di kiri bawah untuk bergerak, dan Butang [RUN] di kanan bawah untuk lari. Leret skrin untuk menoleh kamera.</p>
            <p>• <b>Komputer Desktop:</b> Kekunci <b>W, A, S, D</b> atau Anak Panah untuk bergerak. Klik & heret tetikus pada pemandangan untuk pusing kamera.</p>
            <p>• <b>Menaiki Bas:</b> Dekati pintu bas dan tekan [E] atau klik prompt bas.</p>
          </div>

          <h4 class="font-bold text-[#B45309] text-sm pt-1">Alur Lengkap Ibadah Dari Madinah ke Makkah:</h4>
          <ol class="list-decimal pl-5 space-y-1">
            <li><b>Ziarah Dalam Madinah:</b> Berjalan kaki menelusuri sejarah Rasulullah ﷺ & sahabat.</li>
            <li><b>Ziarah Luar Madinah:</b> Menaiki bas ke Masjid Quba, Uhud, Ladang Kurma.</li>
            <li><b>Miqat di Masjid Bir Ali:</b> Mandi & pakai ihram, solat sunat dan lafazkan Niat Umrah.</li>
            <li><b>Perjalanan Bas ke Makkah:</b> Bertalbiyah sepanjang perjalanan lebuh raya (450km).</li>
            <li><b>Tawaf Kaabah 7 Pusingan:</b> Kaabah di sebelah kiri anda.</li>
            <li><b>Sa'i Safa-Marwah 7 Pusingan:</b> Berjalan/berlari anak di zon hijau.</li>
            <li><b>Tahallul:</b> Bergunting rambut tanda selesainya umrah secara sah.</li>
          </ol>
        </div>

        <button id="guide-ok-btn" class="w-full py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs mt-3 cursor-pointer">
          Faham & Teruskan
        </button>
      </div>
    `;

    document.body.appendChild(modal);

    const close = () => modal.remove();
    modal.querySelector('#close-guide-btn')?.addEventListener('click', close);
    modal.querySelector('#guide-ok-btn')?.addEventListener('click', close);
  }

  /**
   * Session Management & Exit Modal (Exit)
   */
  public showSessionModal() {
    const raw = localStorage.getItem('umrah_save_state');
    let savedState: any = null;
    if (raw) {
      try {
        savedState = JSON.parse(raw);
      } catch {
        savedState = null;
      }
    }

    let timeFormatted = 'Terkini';
    if (savedState?.lastSavedAt) {
      try {
        const d = new Date(savedState.lastSavedAt);
        timeFormatted = d.toLocaleTimeString('ms-MY', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ', ' + d.toLocaleDateString('ms-MY', { day: 'numeric', month: 'short' });
      } catch {
        timeFormatted = 'Terkini';
      }
    }

    const modal = document.createElement('div');
    modal.className = 'interactive-ui fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 backdrop-blur-md p-4 overflow-y-auto';
    modal.innerHTML = `
      <div class="relative w-full max-w-md bg-white border border-stone-200 rounded-3xl p-6 text-stone-900 shadow-2xl space-y-4">
        
        <div class="flex items-center justify-between pb-3 border-b border-stone-100">
          <div class="flex items-center gap-2">
            <span class="text-2xl">💾</span>
            <h3 class="font-serif text-lg font-bold text-stone-900">Pengurusan Sesi & Simpanan</h3>
          </div>
          <button id="close-session-btn" class="p-2 rounded-xl bg-stone-100 text-stone-600 hover:bg-stone-200 transition cursor-pointer">✕</button>
        </div>

        <div class="p-3.5 rounded-2xl bg-stone-50 border border-stone-200/80 space-y-2 text-xs">
          <div class="flex items-center gap-2 text-emerald-700 font-semibold">
            <span>✅</span>
            <span>Simpanan Automatik Aktif</span>
          </div>
          <p class="text-stone-600 text-[11px] leading-relaxed">
            Semua lokasi, pusingan Tawaf/Sa'i, dan kemajuan anda disimpan secara berterusan dalam pelayar peranti ini.
          </p>
          <div class="text-[10px] text-stone-500 pt-2 border-t border-stone-200/60 flex items-center justify-between">
            <span>Simpanan Terkini:</span>
            <span class="text-stone-800 font-medium">${timeFormatted}</span>
          </div>
        </div>

        <div class="space-y-2 pt-1">
          <button id="btn-manual-save" class="w-full py-3 px-4 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer shadow-md">
            <span>💾</span>
            <span>Simpan Kemajuan Sekarang</span>
          </button>

          <button id="btn-reset-game" class="w-full py-2.5 px-4 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 font-semibold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer">
            <span>🔄</span>
            <span>Mula Semula Dari Awal (Reset)</span>
          </button>
        </div>

        <button id="session-ok-btn" class="w-full py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold text-xs transition cursor-pointer">
          Tutup
        </button>
      </div>
    `;

    document.body.appendChild(modal);

    const close = () => modal.remove();
    modal.querySelector('#close-session-btn')?.addEventListener('click', close);
    modal.querySelector('#session-ok-btn')?.addEventListener('click', close);

    modal.querySelector('#btn-manual-save')?.addEventListener('click', () => {
      this.onManualSaveCallback?.();
      this.showSaveToast('✅ Kemajuan anda telah berjaya disimpan!');
      close();
    });

    modal.querySelector('#btn-reset-game')?.addEventListener('click', () => {
      close();
      this.onResetProgressCallback?.();
    });
  }

  public showSaveToast(message: string = '💾 Kemajuan disimpan') {
    const existing = document.getElementById('save-toast-notification');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.id = 'save-toast-notification';
    toast.className = 'interactive-ui fixed bottom-24 left-1/2 -translate-x-1/2 z-50 bg-white/95 border border-stone-200 text-stone-900 px-4 py-2 rounded-2xl shadow-xl text-xs font-semibold flex items-center gap-2 transition-all duration-300 animate-bounce';
    toast.innerHTML = `<span>${message}</span>`;
    document.body.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translate(-50%, 10px)';
      setTimeout(() => toast.remove(), 400);
    }, 2200);
  }

  public showCertificateModal(data: { name: string; groupName: string; date: string }) {
    const modal = document.createElement('div');
    modal.className = 'interactive-ui fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 backdrop-blur-md p-4 overflow-y-auto';
    modal.innerHTML = `
      <div class="relative w-full max-w-lg bg-white border border-stone-200 rounded-3xl p-6 sm:p-8 text-stone-900 shadow-2xl text-center space-y-4">
        
        <div class="w-20 h-20 mx-auto rounded-full bg-[#FAF7F2] border-2 border-[#C5A880] flex items-center justify-center text-4xl shadow-inner">
          🏆
        </div>

        <div>
          <h2 class="font-serif text-2xl font-bold tracking-wide text-stone-900">SIJIL PENYELESAIAN UMRAH</h2>
          <p class="text-xs text-stone-500 mt-1">Simulasi Ibadah Umrah Lengkap Madinah ➔ Miqat Bir Ali ➔ Makkah</p>
        </div>

        <div class="py-4 border-y border-stone-100 space-y-2">
          <p class="text-xs text-stone-500">Dengan izin Allah SWT, diperakui bahawa:</p>
          <div class="text-xl sm:text-2xl font-bold text-stone-900 tracking-wider font-serif">${data.name}</div>
          <p class="text-xs text-stone-600">
            bersama <b class="text-stone-900">${data.groupName}</b> telah menyempurnakan kesemua Ziarah Madinah, Miqat Bir Ali, serta Rukun Umrah di Masjidil Haram dengan jayanya pada tarikh:
          </p>
          <div class="text-xs font-semibold text-[#B45309]">${data.date}</div>
        </div>

        <p class="text-xs text-emerald-800 italic">
          "Semoga Allah mengurniakan Umrah yang Mabrur, ibadah yang diterima, dan dosa yang diampuni."
        </p>

        <div class="flex gap-3 pt-2">
          <button id="btn-cert-print" class="flex-1 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-semibold cursor-pointer">
            🖨️ Cetak / Simpan
          </button>
          <button id="btn-cert-close" class="flex-1 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs shadow-md cursor-pointer">
            Alhamdulillah (Tutup)
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    modal.querySelector('#btn-cert-close')?.addEventListener('click', () => modal.remove());
    modal.querySelector('#btn-cert-print')?.addEventListener('click', () => {
      window.print();
    });
  }
}
