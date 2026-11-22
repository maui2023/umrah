import { DuaItem, PlayerData, PlayerRole, TawafMode, TawafProgress, UmrahStage, ZiarahSpot } from '../types';
import { soundManager } from '../audio/SoundManager';
import { TALBIYAH_DUA } from '../data/duas';
import { ZIARAH_SPOTS } from '../data/ziarahData';
import { MosqueLocation, MOSQUE_LOCATIONS } from '../data/solatData';
import { TawafModal, TawafTabKey } from './TawafModal';

export class HUD {
  private container: HTMLElement;
  private currentStage: UmrahStage = 'ziarah_dalam';
  public currentLap: number = 0;
  private currentDua: DuaItem | null = null;
  private currentZiarahSpot: ZiarahSpot | null = null;
  private currentZiarahIndex: number = 0;

  // Real Tawaf State & Compass Widget
  public currentTawafProgress: TawafProgress | null = null;
  public onPerformIstilamCallback: (() => void) | null = null;
  public onToggleTawafModeCallback: ((mode: TawafMode) => void) | null = null;
  public onToggleRamlCallback: ((active: boolean) => void) | null = null;
  public onOpenTawafModalCallback: (() => void) | null = null;
  public onOpenRealTawafSectionCallback: (() => void) | null = null;
  public isTawafWidgetMinimized: boolean = false;

  // Auto-hide Card Timers & State (3 seconds auto-hide)
  private titleCardTimer: number | null = null;
  private descCardTimer: number | null = null;
  public isTitleCardHidden: boolean = false;
  public isDescCardHidden: boolean = false;

  private titleCardEl!: HTMLElement;
  private titleMiniPillEl!: HTMLElement;
  private descCardEl!: HTMLElement;
  private descDockedTabEl!: HTMLElement;

  public groupMembers: PlayerData[] = [];
  public mutawwifPlayer: PlayerData | null = null;
  public isLocalMutawwif: boolean = false;
  public localPlayerPos = { x: 0, z: 0, rotation: 0 };
  public localPlayerRole: PlayerRole = 'jemaah';
  public localPlayerName: string = '';
  public localGroupName: string = '';
  public localGroupColor: string = '#C5A880';
  public isRosterModalOpen: boolean = false;

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
  public isAutoWalking: boolean = false;

  // Mosque & Pahala State
  public currentNearMosque: MosqueLocation | null = null;
  public currentInsideMosque: MosqueLocation | null = null;
  public currentPahala: number = 0;
  public soloSolatCount: number = 0;
  public jemaahSolatCount: number = 0;
  public visitedMosques: string[] = [];
  public onEnterMosqueDoorCallback: ((mosque: MosqueLocation) => void) | null = null;
  public onStartSolatCallback: ((mosque: MosqueLocation) => void) | null = null;

  // Supabase & Realtime Players State
  public isSupabaseConnected: boolean = false;
  public realOnlineCount: number = 1;
  public allPlayersList: PlayerData[] = [];
  public activeRosterTab: 'online' | 'group' | 'bots' | 'settings' = 'online';
  public onTeleportToCoordsCallback: ((x: number, z: number) => void) | null = null;
  public onReconnectSupabaseCallback: (() => void) | null = null;
  public onSaveSupabaseConfigCallback: ((url: string, key: string) => void) | null = null;

  constructor() {
    this.container = document.createElement('div');
    this.container.id = 'umrah-hud-overlay';
    this.container.className = 'pointer-events-none fixed inset-0 z-40 flex flex-col justify-between select-none font-sans overflow-hidden';
    document.body.appendChild(this.container);
    this.render();
    this.setupJoystick();

    // Cache card element references after render
    this.titleCardEl = this.container.querySelector('#hud-title-card') as HTMLElement;
    this.titleMiniPillEl = this.container.querySelector('#hud-title-mini-pill') as HTMLElement;
    this.descCardEl = this.container.querySelector('#hud-desc-card') as HTMLElement;
    this.descDockedTabEl = this.container.querySelector('#hud-desc-docked-tab') as HTMLElement;

    // Start 3-second auto-hide timers for both cards on initial load
    this.startTitleCardTimer(3);
    this.startDescCardTimer(3);
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
    onEnterMosqueDoor?: (mosque: MosqueLocation) => void;
    onStartSolat?: (mosque: MosqueLocation) => void;
    onTeleportToCoords?: (x: number, z: number) => void;
    onReconnectSupabase?: () => void;
    onSaveSupabaseConfig?: (url: string, key: string) => void;
    onPerformIstilam?: () => void;
    onToggleTawafMode?: (mode: TawafMode) => void;
    onToggleRaml?: (active: boolean) => void;
    onOpenTawafModal?: () => void;
    onOpenRealTawafSection?: () => void;
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
    this.onEnterMosqueDoorCallback = options.onEnterMosqueDoor || null;
    this.onStartSolatCallback = options.onStartSolat || null;
    this.onTeleportToCoordsCallback = options.onTeleportToCoords || null;
    this.onReconnectSupabaseCallback = options.onReconnectSupabase || null;
    this.onSaveSupabaseConfigCallback = options.onSaveSupabaseConfig || null;
    this.onPerformIstilamCallback = options.onPerformIstilam || null;
    this.onToggleTawafModeCallback = options.onToggleTawafMode || null;
    this.onToggleRamlCallback = options.onToggleRaml || null;
    this.onOpenTawafModalCallback = options.onOpenTawafModal || null;
    this.onOpenRealTawafSectionCallback = options.onOpenRealTawafSection || null;
  }

  public setSupabaseStatus(connected: boolean, realPlayerCount: number) {
    this.isSupabaseConnected = connected;
    this.realOnlineCount = Math.max(1, realPlayerCount);

    const badge = this.container.querySelector('#top-roster-badge') as HTMLElement;
    if (badge) {
      if (connected) {
        badge.className = 'w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0 ml-1 shadow-[0_0_8px_rgba(16,185,129,0.8)]';
        badge.title = `Supabase Realtime: Bersambung (${this.realOnlineCount} pemain online)`;
      } else {
        badge.className = 'w-2.5 h-2.5 rounded-full bg-amber-400 shrink-0 ml-1';
        badge.title = 'Mod Simulasi / Luar Talian';
      }
    }

    const rosterStatusText = this.container.querySelector('#top-roster-status-text') as HTMLElement;
    if (rosterStatusText && connected && this.realOnlineCount > 1) {
      rosterStatusText.innerText = `🟢 ${this.realOnlineCount} Online`;
    }

    if (this.isRosterModalOpen) {
      this.refreshRosterModalContent();
    }
  }

  public toggleRosterHide(_force?: boolean) {}
  public toggleDuaHide(_force?: boolean) {}

  public startTitleCardTimer(seconds: number = 3) {
    this.clearTitleCardTimer();

    const bar = this.container.querySelector('#hud-title-countdown-bar') as HTMLElement;
    if (bar) {
      bar.style.transition = 'none';
      bar.style.width = '100%';
      void bar.offsetWidth;
      bar.style.transition = `width ${seconds}s linear`;
      bar.style.width = '0%';
    }

    this.titleCardTimer = window.setTimeout(() => {
      this.hideTitleCard();
    }, seconds * 1000);
  }

  public clearTitleCardTimer() {
    if (this.titleCardTimer !== null) {
      window.clearTimeout(this.titleCardTimer);
      this.titleCardTimer = null;
    }
    const bar = this.container.querySelector('#hud-title-countdown-bar') as HTMLElement;
    if (bar) {
      const computed = window.getComputedStyle(bar).width;
      bar.style.transition = 'none';
      bar.style.width = computed;
    }
  }

  public hideTitleCard() {
    this.isTitleCardHidden = true;
    this.clearTitleCardTimer();

    if (this.titleCardEl) {
      this.titleCardEl.classList.add('is-hidden-up');
    }

    const locationTitleEl = this.container.querySelector('#hud-location-title');
    const miniTitleEl = this.container.querySelector('#hud-mini-location-title');
    if (locationTitleEl && miniTitleEl) {
      miniTitleEl.textContent = locationTitleEl.textContent;
    }

    if (this.titleMiniPillEl) {
      this.titleMiniPillEl.style.display = 'flex';
    }

    this.updateDockedTabPosition();
  }

  public showTitleCard(autoHideSeconds: number = 3) {
    this.isTitleCardHidden = false;
    this.clearTitleCardTimer();

    if (this.titleCardEl) {
      this.titleCardEl.classList.remove('is-hidden-up');
    }

    if (this.titleMiniPillEl) {
      this.titleMiniPillEl.style.display = 'none';
    }

    this.updateDockedTabPosition();

    if (autoHideSeconds > 0) {
      this.startTitleCardTimer(autoHideSeconds);
    }
  }

  public toggleTitleCard() {
    if (this.isTitleCardHidden) {
      this.showTitleCard(3);
    } else {
      this.hideTitleCard();
    }
  }

  public startDescCardTimer(seconds: number = 3) {
    this.clearDescCardTimer();

    const bar = this.container.querySelector('#hud-desc-countdown-bar') as HTMLElement;
    const badge = this.container.querySelector('#hud-desc-timer-badge') as HTMLElement;
    if (bar) {
      bar.style.transition = 'none';
      bar.style.width = '100%';
      void bar.offsetWidth;
      bar.style.transition = `width ${seconds}s linear`;
      bar.style.width = '0%';
    }
    if (badge) {
      badge.textContent = `${seconds}s`;
    }

    this.descCardTimer = window.setTimeout(() => {
      this.hideDescCard();
    }, seconds * 1000);
  }

  public clearDescCardTimer() {
    if (this.descCardTimer !== null) {
      window.clearTimeout(this.descCardTimer);
      this.descCardTimer = null;
    }
    const bar = this.container.querySelector('#hud-desc-countdown-bar') as HTMLElement;
    const badge = this.container.querySelector('#hud-desc-timer-badge') as HTMLElement;
    if (bar) {
      const computed = window.getComputedStyle(bar).width;
      bar.style.transition = 'none';
      bar.style.width = computed;
    }
    if (badge) {
      badge.textContent = 'jeda';
    }
  }

  public hideDescCard() {
    this.isDescCardHidden = true;
    this.clearDescCardTimer();

    if (this.descCardEl) {
      this.descCardEl.classList.add('is-hidden-side');
    }
    if (this.descDockedTabEl) {
      this.descDockedTabEl.style.display = 'flex';
      this.updateDockedTabPosition();
    }
  }

  public showDescCard(autoHideSeconds: number = 3) {
    this.isDescCardHidden = false;
    this.clearDescCardTimer();

    if (this.descCardEl) {
      this.descCardEl.classList.remove('is-hidden-side');
    }
    if (this.descDockedTabEl) {
      this.descDockedTabEl.style.display = 'none';
    }

    this.updateDockedTabPosition();

    if (autoHideSeconds > 0) {
      this.startDescCardTimer(autoHideSeconds);
    }
  }

  public toggleDescCard() {
    if (this.isDescCardHidden) {
      this.showDescCard(3);
    } else {
      this.hideDescCard();
    }
  }

  public updateDockedTabPosition() {
    if (!this.descDockedTabEl) return;
    
    // Read the safe-area-inset-top if available or default to 10px padding
    const safeTop = 10;

    if (this.isTitleCardHidden) {
      if (this.titleMiniPillEl && this.titleMiniPillEl.style.display !== 'none') {
        // When mini pill is shown, dock tab is aligned just below or beside the mini pill
        const pillRect = this.titleMiniPillEl.getBoundingClientRect();
        this.descDockedTabEl.style.top = Math.max(safeTop, Math.round(pillRect.bottom + 8)) + 'px';
      } else {
        this.descDockedTabEl.style.top = `${safeTop}px`;
      }
    } else if (this.titleCardEl && !this.titleCardEl.classList.contains('is-hidden-up')) {
      // When title card is visible, dock tab is positioned right below it
      const titleRect = this.titleCardEl.getBoundingClientRect();
      this.descDockedTabEl.style.top = Math.max(safeTop, Math.round(titleRect.bottom + 8)) + 'px';
    } else {
      this.descDockedTabEl.style.top = `${safeTop}px`;
    }
  }

  public toggleAllUI() {
    const shouldHide = !this.isTitleCardHidden || !this.isDescCardHidden;
    if (shouldHide) {
      this.hideTitleCard();
      this.hideDescCard();
    } else {
      this.showTitleCard(3);
      this.showDescCard(3);
    }
  }

  private render() {
    this.container.innerHTML = `
      <!-- DOCKED TAB: Appears docked on the left edge when Card 2 (Info) is auto/manually hidden to the side -->
      <button id="hud-desc-docked-tab" style="display: none;" title="Papar Info & Panduan" class="hud-docked-tab-anim interactive-ui pointer-events-auto fixed left-0 top-[10px] z-40 flex items-center gap-1.5 px-3 py-2 rounded-r-2xl bg-white/95 backdrop-blur-md shadow-[2px_6px_20px_rgba(0,0,0,0.12)] border-y border-r border-stone-200/80 text-stone-800 text-xs font-semibold hover:bg-stone-50 active:scale-95 transition-all cursor-pointer">
        <span class="text-sm">📖</span>
        <span class="font-medium text-stone-800">Info & Panduan</span>
        <span class="text-stone-400 text-[10px]">▶</span>
      </button>

      <!-- TOP LAYER: FULL WIDTH HEADER & INFO CARDS (Purple & Blue Cards - Full Size) -->
      <div class="w-full flex flex-col pointer-events-none gap-2 z-30">
        <div class="pointer-events-auto flex flex-col gap-2 w-full max-w-full">
          
          <!-- Mini Pill for Title Card (Shown when Card 1 is auto-hidden upwards) -->
          <button id="hud-title-mini-pill" style="display: none;" title="Papar Info Umrah Simulator" class="hud-mini-pill-anim interactive-ui self-start flex items-center gap-1.5 sm:gap-2 px-3 py-1.5 rounded-full bg-white/95 backdrop-blur-md shadow-[0_4px_16px_rgba(0,0,0,0.08)] border border-stone-200/80 text-stone-800 text-xs font-medium hover:bg-stone-50 active:scale-95 transition cursor-pointer max-w-full">
            <span class="inline-block w-2.5 h-[2px] bg-[#C5A880] rounded-full shrink-0"></span>
            <span id="hud-mini-location-title" class="font-serif font-medium text-stone-900 truncate max-w-[120px] sm:max-w-[220px]">Saqifah Bani Saedah</span>
            <span class="text-stone-300 shrink-0">•</span>
            <span id="hud-mini-lap-pill" class="text-[10px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded-md shrink-0">Pusingan 1</span>
            <span class="text-stone-300 shrink-0">•</span>
            <span id="hud-mini-mutawwif-pill" class="text-[10px] font-semibold text-emerald-700 shrink-0">🧭 0m</span>
            <span class="text-stone-300 shrink-0">•</span>
            <span id="hud-mini-pahala-pill" class="text-[10px] font-bold text-amber-800 bg-amber-100 px-1.5 py-0.5 rounded-md shrink-0">✨ <span id="hud-mini-pahala-val">0</span></span>
            <span class="text-stone-400 text-[10px] ml-0.5 shrink-0">▼</span>
          </button>

          <!-- Card 1: Main Simulator & Location Title & Progress Indicator (PURPLE - FULL SIZE) -->
          <div id="hud-title-card" class="hud-title-card-anim bg-white/95 backdrop-blur-md rounded-2xl p-4 sm:p-5 shadow-[0_8px_30px_rgba(0,0,0,0.06)] border border-stone-200/60 text-stone-900 transition-all relative overflow-hidden w-full">
            <!-- 3s Auto-hide Countdown Line -->
            <div class="absolute top-0 left-0 right-0 h-[2px] bg-stone-100 overflow-hidden">
              <div id="hud-title-countdown-bar" class="h-full bg-gradient-to-r from-[#C5A880] to-amber-500 w-full origin-left transition-all duration-[3000ms] ease-linear"></div>
            </div>

            <!-- Header row with amber bar & quick hide up button -->
            <div class="flex items-center justify-between mb-1.5 pt-0.5">
              <div class="flex items-center gap-2">
                <span class="inline-block w-4 h-[2px] bg-[#C5A880] rounded-full"></span>
                <span id="hud-category-label" class="text-[10px] sm:text-[11px] font-bold tracking-[0.22em] text-[#78716C] uppercase">
                  UMRAH SIMULATOR
                </span>
              </div>
              <button id="btn-hide-title-card" title="Sembunyi ke atas sekarang" class="interactive-ui p-1 -mr-1 rounded-md text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition cursor-pointer text-xs flex items-center gap-1">
                <span class="text-[9px] text-stone-400 hidden sm:inline">3s</span>
                <span>▲</span>
              </button>
            </div>

            <!-- Big Serif Location Heading -->
            <h1 id="hud-location-title" class="font-serif text-2xl sm:text-3xl font-medium text-stone-900 tracking-tight my-1">
              Saqifah Bani Saedah
            </h1>

            <!-- Live Player, Mutawwif & Lap Info Line -->
            <div id="hud-player-status-line" class="flex flex-wrap items-center gap-1.5 text-[11px] sm:text-xs font-medium text-stone-600 mt-0.5">
              <span id="hud-status-player-badge" class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-stone-100 border border-stone-200/80 text-stone-800 font-semibold">
                <span>👤</span>
                <span id="hud-player-display-name">Jemaah</span>
              </span>
              <span id="hud-status-lap-badge" class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 border border-amber-200/80 text-amber-800 font-bold">
                <span>🔄</span>
                <span id="hud-lap-indicator-text">Lokasi 1/20</span>
              </span>
              <span id="hud-status-mutawwif-badge" class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-800 font-medium">
                <span id="hud-mutawwif-icon">🧭</span>
                <span id="hud-mutawwif-dist-text">Mencari Mutawwif...</span>
              </span>
              <button id="hud-status-pahala-badge" title="Buku Amalan & Rekod Pahala (Klik untuk lihat butiran)" class="interactive-ui inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-gradient-to-r from-amber-500/15 via-yellow-500/20 to-amber-500/15 border border-amber-300/80 text-amber-900 font-bold hover:scale-105 active:scale-95 transition cursor-pointer">
                <span class="animate-pulse">✨</span>
                <span id="hud-pahala-counter">0</span>
                <span>Pahala</span>
              </button>
            </div>

            <!-- Segmented Progress Indicator Bar -->
            <div id="hud-segment-bar" class="flex items-center gap-1.5 w-full mt-3.5">
              ${[1, 2, 3, 4, 5, 6, 7, 8].map((i) => `
                <div class="hud-segment-pill h-1.5 rounded-full flex-1 transition-all duration-300 ${i === 1 ? 'bg-[#C5A880]' : 'bg-stone-200/90'}" data-segment="${i}"></div>
              `).join('')}
            </div>
          </div>

          <!-- Card 2: Clean Description Subcard (BLUE - FULL SIZE) -->
          <div id="hud-desc-card" class="hud-desc-card-anim bg-white/95 backdrop-blur-md rounded-2xl p-3.5 sm:p-4 shadow-[0_6px_20px_rgba(0,0,0,0.04)] border border-stone-200/60 text-[13px] sm:text-[14px] leading-relaxed text-stone-700 transition-all relative overflow-hidden w-full">
            <!-- 3s Auto-hide Countdown Line -->
            <div class="absolute top-0 left-0 right-0 h-[2.5px] bg-stone-100 overflow-hidden">
              <div id="hud-desc-countdown-bar" class="h-full bg-gradient-to-r from-[#C5A880] to-amber-500 w-full origin-left transition-all duration-[3000ms] ease-linear"></div>
            </div>

            <!-- Header with Title, 3s Auto-Hide Indicator & Hide button -->
            <div class="flex items-center justify-between pb-1.5 mb-1.5 border-b border-stone-100 pt-0.5">
              <div class="flex items-center gap-1.5">
                <span class="text-[10px] font-bold tracking-wider text-stone-500 uppercase flex items-center gap-1.5">
                  <span>📖</span>
                  <span>INFO & PANDUAN</span>
                </span>
                <span id="hud-desc-timer-badge" title="Auto-hide dalam 3 saat" class="text-[9px] px-1.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200/60 font-mono font-medium">3s</span>
              </div>
              <button id="btn-hide-desc-card" title="Sembunyi info ke tepi sekarang" class="interactive-ui flex items-center gap-1 text-[11px] font-medium text-stone-500 hover:text-stone-900 bg-stone-100 hover:bg-stone-200 px-2 py-0.5 rounded-lg transition cursor-pointer active:scale-95">
                <span>◀</span>
                <span>Sembunyi</span>
              </button>
            </div>

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
                <!-- Talbiyah Arabic Audio Quick Button -->
                <button id="btn-talbiyah-quick-audio" title="Dengar Bunyi Sebutan Arab Talbiyah" style="display: none;" class="interactive-ui flex items-center gap-1 text-amber-900 bg-amber-100 hover:bg-amber-200 px-2 py-0.5 rounded-lg border border-amber-300 text-xs font-bold transition cursor-pointer">
                  <span id="talbiyah-quick-icon">🔊</span>
                  <span id="talbiyah-quick-label" class="text-[11px]">Bunyi Arab</span>
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
      </div>

      <!-- FLOATING ACTION MENU / DROPDOWN (TURQUOISE - COLLAPSED TO SINGLE ICON) -->
      <div id="hud-action-dropdown-container" class="pointer-events-auto fixed right-3 sm:right-4 top-[290px] z-40 flex flex-col items-end gap-2">
        <!-- Single Toggle Icon Button (TURQUOISE - Closed by default) -->
        <button id="btn-action-dropdown-toggle" title="Menu Tindakan & Pilihan" class="interactive-ui w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-white/95 backdrop-blur-md shadow-[0_4px_16px_rgba(0,0,0,0.1)] border border-stone-200/80 flex items-center justify-center text-stone-700 hover:bg-stone-50 active:scale-95 transition cursor-pointer">
          <svg id="action-dropdown-toggle-icon" class="w-5 h-5 text-stone-700 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        <!-- Dropdown Menu List (Initially hidden - closed to single icon) -->
        <div id="hud-action-dropdown-menu" style="display: none;" class="hud-dropdown-anim flex flex-col gap-1.5 items-end pt-1 origin-top-right transition-all duration-200">
          <!-- 1. Jadual Ziarah & Peta (Book Icon) -->
          <button id="btn-top-itinerary" title="Jadual & Laluan Ziarah Lengkap" class="interactive-ui flex items-center gap-2 px-3 py-2 rounded-2xl bg-white/95 backdrop-blur-md shadow-[0_4px_16px_rgba(0,0,0,0.08)] border border-stone-200/80 text-stone-800 hover:bg-stone-50 active:scale-95 transition cursor-pointer text-xs font-semibold whitespace-nowrap">
            <svg class="w-4 h-4 text-stone-700 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            <span>Jadual Ziarah</span>
          </button>

          <!-- 1b. 13 Pantang Larang Ihram & Nota Khas -->
          <button id="btn-top-larangan" title="13 Pantang Larang Ihram & Nota Fiqh Khas (Cawat & Wangian Wanita)" class="interactive-ui flex items-center gap-2 px-3 py-2 rounded-2xl bg-amber-50/95 backdrop-blur-md shadow-[0_4px_16px_rgba(0,0,0,0.08)] border border-amber-200/90 text-amber-900 hover:bg-amber-100 active:scale-95 transition cursor-pointer text-xs font-bold whitespace-nowrap">
            <span class="w-4 h-4 flex items-center justify-center text-xs">⚠️</span>
            <span>Larangan Ihram</span>
          </button>

          <!-- 1c. Panduan & Waktu Talbiyah -->
          <button id="btn-top-talbiyah" title="Waktu Membaca Talbiyah & Bunyi Arab" class="interactive-ui flex items-center gap-2 px-3 py-2 rounded-2xl bg-amber-50/95 backdrop-blur-md shadow-[0_4px_16px_rgba(0,0,0,0.08)] border border-amber-300/80 text-amber-950 hover:bg-amber-100 active:scale-95 transition cursor-pointer text-xs font-bold whitespace-nowrap">
            <span class="w-4 h-4 flex items-center justify-center text-xs">📿</span>
            <span>Panduan Talbiyah</span>
          </button>

          <!-- 1d. Mod Real Tawaf (Kompas Kiblat, Pusingan & Doa) -->
          <button id="btn-top-tawaf" title="Buka Mod Real Tawaf (Kompas Kiblat, Pusingan & Doa)" class="interactive-ui flex items-center gap-2 px-3 py-2 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white active:scale-95 transition cursor-pointer text-xs font-bold whitespace-nowrap shadow-md shadow-emerald-950/40 border border-emerald-400/50">
            <span class="w-4 h-4 flex items-center justify-center text-xs">🧭</span>
            <span>Mod Real Tawaf</span>
          </button>

          <!-- 2. Bantuan & Panduan (?) -->
          <button id="btn-top-help" title="Panduan Ibadah & Kawalan" class="interactive-ui flex items-center gap-2 px-3 py-2 rounded-2xl bg-white/95 backdrop-blur-md shadow-[0_4px_16px_rgba(0,0,0,0.08)] border border-stone-200/80 text-stone-800 hover:bg-stone-50 active:scale-95 transition cursor-pointer text-xs font-semibold whitespace-nowrap">
            <span class="w-4 h-4 flex items-center justify-center font-serif font-bold text-sm text-stone-700">?</span>
            <span>Panduan</span>
          </button>

          <!-- 3. Rekod Pahala & Solat -->
          <button id="btn-top-pahala" title="Buku Amalan & Rekod Pahala Solat" class="interactive-ui flex items-center gap-2 px-3 py-2 rounded-2xl bg-white/95 backdrop-blur-md shadow-[0_4px_16px_rgba(0,0,0,0.08)] border border-stone-200/80 text-stone-800 hover:bg-stone-50 active:scale-95 transition cursor-pointer text-xs font-semibold whitespace-nowrap">
            <span class="w-4 h-4 flex items-center justify-center text-xs">🌟</span>
            <span>Rekod Pahala</span>
          </button>

          <!-- 4. Audio & Mute (Speaker Icon) -->
          <button id="btn-top-audio" title="Kawal Bunyi & Suara" class="interactive-ui flex items-center gap-2 px-3 py-2 rounded-2xl bg-white/95 backdrop-blur-md shadow-[0_4px_16px_rgba(0,0,0,0.08)] border border-stone-200/80 text-stone-800 hover:bg-stone-50 active:scale-95 transition cursor-pointer text-xs font-semibold whitespace-nowrap">
            <span id="top-audio-icon" class="w-4 h-4 flex items-center justify-center text-xs font-semibold">🔈x</span>
            <span>Audio</span>
          </button>

          <!-- 4. Exit / Sesi & Simpanan -->
          <button id="btn-top-exit" title="Keluar / Simpan Sesi / Mula Semula" class="interactive-ui flex items-center gap-2 px-3 py-2 rounded-2xl bg-white/95 backdrop-blur-md shadow-[0_4px_16px_rgba(0,0,0,0.08)] border border-stone-200/80 text-stone-800 hover:bg-stone-50 active:scale-95 transition cursor-pointer text-xs font-bold whitespace-nowrap">
            <span class="w-4 h-4 flex items-center justify-center text-xs">🚪</span>
            <span>Exit / Simpan</span>
          </button>
        </div>
      </div>

      <!-- BOTTOM LAYER: JOYSTICK (Left) & ROSTER + RUN BUTTON (Right) -->
      <div class="w-full flex items-end justify-between pointer-events-none pb-2 sm:pb-3">
        
        <!-- JOYSTICK CONTAINER (Left, with Auto-Walk / Kunci Gerak Pill) -->
        <div class="pointer-events-auto flex flex-col items-center gap-1.5 select-none">
          <!-- Auto-Walk / Kunci Jalan Pill Button -->
          <button id="btn-auto-walk" title="Kunci Jalan / Auto-Walk (Terus berjalan ke hadapan mengikut arah pandangan)" class="interactive-ui px-3 py-1 rounded-full bg-[#FAF7F2]/95 backdrop-blur-md border border-stone-200/80 shadow-[0_4px_12px_rgba(0,0,0,0.06)] flex items-center gap-1.5 text-[10px] font-bold text-stone-700 active:scale-95 transition cursor-pointer select-none touch-none">
            <span id="auto-walk-icon">🚶‍♂️</span>
            <span id="auto-walk-label">Auto-Jalan</span>
          </button>

          <!-- JOYSTICK -->
          <div id="touch-joystick-zone" class="interactive-ui relative w-28 h-28 sm:w-32 sm:h-32 rounded-full bg-[#FAF7F2]/90 backdrop-blur-md border border-stone-200/80 shadow-[0_12px_32px_rgba(0,0,0,0.08)] flex items-center justify-center touch-none select-none cursor-grab active:cursor-grabbing">
            <!-- Inner Dashed Outline Ring -->
            <div class="w-[82%] h-[82%] rounded-full border border-dashed border-stone-400/50 absolute pointer-events-none"></div>
            <!-- Center Navy Blue Control Knob -->
            <div id="touch-joystick-thumb" class="w-12 h-12 rounded-full bg-[#1E293B] shadow-lg pointer-events-none transform transition-transform"></div>
          </div>
        </div>

        <!-- RIGHT BOTTOM: ROSTER BADGE (YELLOW - MOVED DOWN) + RUN BUTTON -->
        <div class="pointer-events-auto flex flex-col items-end gap-2.5">
          <!-- Info Rombongan & Mutawwif Button (KUNING - Diturunkan ke bawah mengikut lakaran) -->
          <button id="btn-top-roster" title="Info Jemaah & Jarak Mutawwif" class="interactive-ui min-h-[42px] px-3.5 sm:px-4 py-1.5 rounded-2xl bg-white/95 backdrop-blur-md shadow-[0_4px_16px_rgba(0,0,0,0.08)] border border-stone-200/80 flex items-center gap-2 text-stone-700 hover:bg-stone-50 active:scale-95 transition cursor-pointer w-auto max-w-[210px] sm:max-w-[250px] shrink-0">
            <span class="text-base sm:text-lg shrink-0">👥</span>
            <div class="flex flex-col text-left leading-tight pr-0.5 min-w-0">
              <span id="top-roster-group-label" class="text-[9px] font-bold text-stone-400 uppercase tracking-wider whitespace-nowrap">ROMBONGAN</span>
              <span id="top-roster-status-text" class="text-[11px] font-bold text-stone-800 whitespace-nowrap">1 Ahli</span>
            </div>
            <span id="top-roster-badge" class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0 ml-1"></span>
          </button>

          <!-- RUN BUTTON (Matches screenshot: round cream button with >> and RUN text) -->
          <button id="btn-mobile-sprint" title="Lari / Pecut (Shift / Run)" class="interactive-ui w-[72px] h-[72px] sm:w-[78px] sm:h-[78px] rounded-full bg-[#FAF7F2]/95 backdrop-blur-md border border-stone-200/80 shadow-[0_12px_32px_rgba(0,0,0,0.08)] flex flex-col items-center justify-center active:scale-95 transition cursor-pointer select-none touch-none">
            <span class="text-stone-900 font-black text-sm tracking-tighter leading-none mb-1">»</span>
            <span class="text-stone-900 font-bold text-[10px] tracking-widest leading-none">RUN</span>
          </button>
        </div>
      </div>

      <!-- FLOATING BUS DOOR PROMPT (Appears when near bus entrance) -->
      <div id="bus-door-prompt" style="display: none;" class="interactive-ui pointer-events-auto fixed bottom-36 sm:bottom-28 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-5 py-3 rounded-2xl bg-white/95 backdrop-blur-md border-2 border-[#C5A880] shadow-2xl text-stone-900 cursor-pointer animate-bounce">
        <span class="text-2xl">🚌</span>
        <div>
          <div class="font-bold text-sm text-stone-900">Tekan [E] atau Klik untuk Naik Bas</div>
          <div class="text-[11px] text-stone-600">Pintu Masuk Bas Ziarah Rombongan</div>
        </div>
        <button id="btn-prompt-board-bus" class="px-3.5 py-1.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs shadow-md transition cursor-pointer">
          Naik Bas ➔
        </button>
      </div>

      <!-- FLOATING BUS EXIT PROMPT (Appears when inside bus and stopped at destination) -->
      <div id="bus-exit-prompt" style="display: none;" class="interactive-ui pointer-events-auto fixed bottom-36 sm:bottom-28 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-5 py-3 rounded-2xl bg-white/95 backdrop-blur-md border-2 border-rose-500 shadow-2xl text-stone-900 cursor-pointer animate-bounce max-w-[94%] sm:max-w-md">
        <span class="text-2xl shrink-0">🚪</span>
        <div class="min-w-0">
          <div id="bus-exit-prompt-title" class="font-bold text-sm text-stone-900 truncate">Bas Telah Tiba di Destinasi!</div>
          <div id="bus-exit-prompt-subtitle" class="text-[11px] text-stone-600 truncate">Tekan [E] atau Klik untuk Turun Bas</div>
        </div>
        <button id="btn-prompt-exit-bus" class="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 active:scale-95 text-white font-bold text-xs shadow-md transition cursor-pointer flex items-center gap-1 shrink-0">
          <span>Turun Bas</span>
          <span>➔</span>
        </button>
      </div>

      <!-- FLOATING MOSQUE DOOR PROMPT (Appears when near any mosque entrance) -->
      <div id="mosque-door-prompt" style="display: none;" class="interactive-ui pointer-events-auto fixed bottom-36 sm:bottom-28 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-5 py-3 rounded-2xl bg-white/95 backdrop-blur-md border-2 border-emerald-600 shadow-2xl text-stone-900 cursor-pointer animate-bounce max-w-[94%] sm:max-w-md">
        <span class="text-2xl shrink-0">🚪</span>
        <div class="min-w-0">
          <div id="mosque-door-title" class="font-bold text-sm text-stone-900 truncate">Pintu Masuk Masjid</div>
          <div id="mosque-door-subtitle" class="text-[11px] text-emerald-800 font-medium truncate">Tekan [E] atau Klik untuk Masuk & Solat</div>
        </div>
        <button id="btn-prompt-enter-mosque" class="px-3.5 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-600 active:scale-95 text-white font-bold text-xs shadow-md transition cursor-pointer flex items-center gap-1 shrink-0">
          <span>Masuk</span>
          <span>➔</span>
        </button>
      </div>

      <!-- INSIDE MOSQUE PRAYER CARD (Appears when inside prayer hall) -->
      <div id="mosque-prayer-card" style="display: none;" class="interactive-ui pointer-events-auto fixed bottom-36 sm:bottom-28 left-1/2 -translate-x-1/2 z-50 flex items-center justify-between gap-3 px-5 py-3 rounded-2xl bg-white/95 backdrop-blur-md border-2 border-amber-500 shadow-2xl text-stone-900 transition-all w-[92%] max-w-lg">
        <div class="flex items-center gap-3 min-w-0">
          <span class="text-3xl shrink-0 animate-pulse">🕌</span>
          <div class="min-w-0">
            <div id="mosque-prayer-name" class="font-bold text-sm text-stone-900 truncate">Ruang Solat Masjid</div>
            <div id="mosque-prayer-desc" class="text-[11px] text-stone-600 truncate">Solo: 1 Pahala • Berjemaah: 27 Pahala (+27x)</div>
          </div>
        </div>
        <button id="btn-prompt-start-solat" class="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-700 to-teal-800 hover:from-emerald-600 hover:to-teal-700 active:scale-95 text-white font-bold text-xs sm:text-sm shadow-lg transition cursor-pointer flex items-center gap-1.5 shrink-0">
          <span>🕌</span>
          <span>Mula Solat</span>
        </button>
      </div>

      <!-- FLOATING PAHALA NOTIFICATION BANNER -->
      <div id="pahala-notification-banner" style="display: none;" class="pointer-events-none fixed top-24 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-stone-950 font-black text-sm sm:text-base shadow-2xl border-2 border-white animate-bounce">
        <span class="text-xl">🌟</span>
        <span id="pahala-notification-text">+27 Pahala Berjemaah Diperolehi!</span>
      </div>

      <!-- BUS DRIVING DASHBOARD (When riding or driving inside the bus - Positioned at bottom to avoid covering top guide/location info) -->
      <div id="bus-dashboard-card" style="display: none;" class="interactive-ui pointer-events-auto fixed bottom-[136px] sm:bottom-6 left-1/2 -translate-x-1/2 z-40 w-[92%] max-w-[460px] sm:w-auto sm:min-w-[420px] bg-white/95 backdrop-blur-md border border-stone-200/80 rounded-2xl p-3.5 sm:p-4 shadow-2xl text-stone-900 transition-all">
        <div class="flex items-center justify-between gap-3 pb-2.5 mb-2.5 border-b border-stone-200/70">
          <div class="flex items-center gap-2.5 min-w-0">
            <span class="text-2xl animate-pulse shrink-0">🚌</span>
            <div class="min-w-0">
              <div id="bus-dashboard-status" class="font-bold text-sm text-stone-900 truncate">Bas Ziarah Sedang Beroperasi</div>
              <div id="bus-dashboard-dest" class="text-xs text-stone-600 font-medium truncate">Destinasi: Masjid Quba</div>
            </div>
          </div>
          <div class="flex items-center gap-2 shrink-0">
            <div class="px-3 py-1 rounded-xl bg-stone-100 border border-stone-200 text-stone-900 font-mono font-bold text-xs sm:text-sm">
              <span id="bus-speedometer">0</span> <span class="text-[10px] sm:text-xs font-normal text-stone-600">km/j</span>
            </div>
            <button id="btn-exit-bus" title="Turun Dari Bas" class="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 active:scale-95 text-white font-bold text-xs transition flex items-center gap-1 shadow cursor-pointer">
              <span>🚪</span>
              <span>Turun Bas</span>
            </button>
          </div>
        </div>

        <div class="flex flex-wrap items-center justify-between gap-2 text-xs">
          <div class="text-stone-500 text-[11px] flex items-center gap-1">
            <span>🕹️ Kawalan: <b>WASD / Joystick</b> untuk memandu bas</span>
          </div>
          <button id="btn-auto-cruise" class="px-3 py-1.5 rounded-xl bg-stone-900 hover:bg-stone-800 active:scale-95 text-white font-bold text-xs shadow transition flex items-center gap-1 cursor-pointer">
            <span>▶️</span>
            <span id="btn-auto-cruise-text">Pandu Automatik</span>
          </button>
        </div>
      </div>

      <!-- DEDICATED REAL TAWAF COMPASS & POLAR TRACKER WIDGET -->
      <div id="hud-tawaf-compass-widget" style="display: none;" class="pointer-events-auto fixed right-3 top-[68px] sm:top-[74px] z-30 flex flex-col gap-2 w-[275px] sm:w-[315px] bg-stone-950/92 backdrop-blur-md rounded-2xl p-3 sm:p-3.5 border border-amber-500/40 shadow-2xl text-stone-100 transition-all select-none">
        
        <!-- Header: Mode Badge, Lap Counter & Minimize -->
        <div class="flex items-center justify-between pb-2 border-b border-stone-800/80">
          <div class="flex items-center gap-1.5 min-w-0">
            <span class="text-sm shrink-0">🕋</span>
            <div class="min-w-0">
              <span class="text-[9px] uppercase font-extrabold tracking-widest text-amber-400 block truncate">MOD REAL TAWAF</span>
              <div id="tawaf-widget-lap-text" class="text-xs font-bold text-white truncate">Pusingan 1 / 7</div>
            </div>
          </div>
          
          <div class="flex items-center gap-1 shrink-0">
            <button id="btn-toggle-tawaf-mode" title="Tukar Mod: Real Tawaf / Panduan Jemaah" class="interactive-ui px-2 py-0.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-[10px] font-bold text-stone-300 border border-stone-700 transition">
              Mod: <span id="tawaf-mode-label" class="text-amber-400">Real</span>
            </button>
            <button id="btn-open-tawaf-guide-modal" title="Buka Senarai Doa Penuh" class="interactive-ui p-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 transition text-xs">
              📖
            </button>
            <button id="btn-tawaf-minimize" title="Kecilkan Widget" class="interactive-ui p-1 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 text-xs transition">
              ─
            </button>
          </div>
        </div>

        <!-- Central Compass Dial (Azimuth & Radius) -->
        <div class="flex items-center gap-2.5 py-0.5">
          <!-- Circular Compass SVG -->
          <div class="relative w-[78px] h-[78px] sm:w-[84px] sm:h-[84px] shrink-0 flex items-center justify-center">
            <svg id="tawaf-compass-svg" viewBox="0 0 100 100" class="w-full h-full transform -rotate-90">
              <!-- Background Ring Track -->
              <circle cx="50" cy="50" r="38" fill="none" stroke="#292524" stroke-width="7" />
              <!-- Dynamic Counter-Clockwise Progress Arc (Circumference ~238.76) -->
              <circle id="tawaf-compass-arc" cx="50" cy="50" r="38" fill="none" stroke="#F59E0B" stroke-width="7" stroke-dasharray="239" stroke-dashoffset="239" stroke-linecap="round" class="transition-all duration-150" />
              <!-- 4 Corner Tick Markers -->
              <!-- 0 deg: Hajarul Aswad (Top in normal view, Right in -90 rot) -->
              <circle cx="88" cy="50" r="4" fill="#10B981" />
              <!-- 90 deg: Iraqi (Bottom in -90 rot) -->
              <circle cx="50" cy="88" r="3" fill="#F59E0B" />
              <!-- 180 deg: Syami (Left in -90 rot) -->
              <circle cx="12" cy="50" r="3" fill="#A8A29E" />
              <!-- 270 deg: Yamani (Top in -90 rot) -->
              <circle cx="50" cy="12" r="3.5" fill="#10B981" />
            </svg>
            
            <!-- Kaabah Center Icon & Text -->
            <div class="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span class="text-xs select-none leading-none">🕋</span>
              <span id="tawaf-compass-deg" class="text-[10px] font-mono font-bold text-amber-300 leading-none mt-0.5">0°</span>
              <span id="tawaf-compass-radius" class="text-[8px] font-mono text-stone-400 leading-none">18m</span>
            </div>

            <!-- Rotating Needle Indicator -->
            <div id="tawaf-compass-needle" class="absolute w-full h-full pointer-events-none transition-transform duration-100" style="transform: rotate(0deg);">
              <div class="absolute top-[2px] left-1/2 -translate-x-1/2 w-2.5 h-2.5 rounded-full bg-white shadow-[0_0_8px_#ffffff] border border-stone-900"></div>
            </div>
          </div>

          <!-- Right Column: Sector & Lap Progress Info -->
          <div class="flex-1 min-w-0 space-y-1">
            <div class="flex items-center gap-1">
              <span id="tawaf-sector-badge" class="px-1.5 py-0.5 rounded text-[9px] font-extrabold bg-emerald-950/80 text-emerald-300 border border-emerald-600/50 truncate block">
                Sektor 1: HA ➔ Iraqi
              </span>
            </div>
            <div id="tawaf-sector-desc" class="text-[11px] font-medium text-stone-200 line-clamp-2 leading-tight">
              Lafazkan zikir permulaan pusingan.
            </div>
            <div class="flex items-center gap-2 pt-0.5 text-[10px]">
              <span class="text-stone-400">Pusingan:</span>
              <span id="tawaf-lap-percent" class="font-bold text-amber-400">0%</span>
              <span id="tawaf-boundary-status" class="text-emerald-400 font-semibold">• Sah</span>
            </div>
          </div>
        </div>

        <!-- 7 Lap Indicator Dots -->
        <div class="flex items-center justify-between gap-1 px-1.5 py-1 bg-stone-950/60 rounded-xl border border-stone-800/80">
          ${[1, 2, 3, 4, 5, 6, 7].map(l => `
            <div class="flex-1 flex flex-col items-center">
              <div id="tawaf-dot-lap-${l}" class="w-full h-1.5 rounded-full bg-stone-800 transition-all ${l === 1 ? 'bg-amber-400 shadow-[0_0_6px_#f59e0b]' : ''}"></div>
              <span class="text-[8px] font-mono text-stone-500 mt-0.5">${l}</span>
            </div>
          `).join('')}
        </div>

        <!-- Interactive Buttons (Istilam, Read Dua, Raml) -->
        <div class="grid grid-cols-2 gap-1.5 pt-0.5">
          <!-- Istilam Button: Flashing/Pulsing when in Istilam zone -->
          <button id="btn-tawaf-istilam" class="interactive-ui col-span-2 py-2 px-3 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-stone-950 font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-900/30 active:scale-95 transition cursor-pointer">
            <span class="text-sm">✋</span>
            <span id="btn-tawaf-istilam-label">Lakukan Istilam</span>
          </button>

          <!-- Speak Dua of Current Sector -->
          <button id="btn-tawaf-speak-dua" title="Dengar sebutan zikir/doa sektor semasa" class="interactive-ui py-1.5 px-2 rounded-xl bg-stone-800 hover:bg-stone-700 border border-stone-700 text-stone-200 font-bold text-[11px] flex items-center justify-center gap-1 active:scale-95 transition cursor-pointer">
            <span id="tawaf-speak-icon">🔊</span>
            <span id="tawaf-speak-label">Dua Sektor</span>
          </button>

          <!-- Raml Jogging Toggle (Laps 1-3) -->
          <button id="btn-tawaf-toggle-raml" title="Lari-lari anak (Raml) bagi jemaah lelaki pusingan 1-3" class="interactive-ui py-1.5 px-2 rounded-xl bg-stone-800 hover:bg-stone-700 border border-stone-700 text-stone-200 font-bold text-[11px] flex items-center justify-center gap-1 active:scale-95 transition cursor-pointer">
            <span>🏃</span>
            <span id="tawaf-raml-label">Raml: Mati</span>
          </button>
        </div>

      </div>

      <!-- MINIMIZED TAWAF PILL (When user collapses the compass widget) -->
      <button id="hud-tawaf-mini-pill" style="display: none;" title="Buka Semula Kompas Tawaf" class="interactive-ui pointer-events-auto fixed right-3 top-[68px] sm:top-[74px] z-30 flex items-center gap-2 px-3 py-1.5 rounded-full bg-stone-900/95 backdrop-blur-md border border-amber-500/50 shadow-xl text-stone-100 text-xs font-bold hover:bg-stone-800 active:scale-95 transition cursor-pointer">
        <span>🕋</span>
        <span id="tawaf-mini-pill-lap" class="text-amber-400">Tawaf 1/7</span>
        <span class="text-stone-500">•</span>
        <span id="tawaf-mini-pill-deg" class="text-emerald-400 font-mono">0°</span>
        <span class="text-stone-400 text-[10px]">▼</span>
      </button>
    `;

    this.attachEventListeners();
  }

  private attachEventListeners() {
    // === AUTO-HIDE & CLICK-TO-SHOW LISTENERS ===

    // Title Card: manual hide button (▲)
    const hideTitleBtn = this.container.querySelector('#btn-hide-title-card') as HTMLButtonElement;
    hideTitleBtn?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.hideTitleCard();
    });

    // Title Card: click anywhere on card pauses/restarts auto-hide timer
    const titleCard = this.container.querySelector('#hud-title-card') as HTMLElement;
    titleCard?.addEventListener('click', () => {
      // If timer is running, pause it; otherwise restart
      if (this.titleCardTimer !== null) {
        this.clearTitleCardTimer();
      } else if (!this.isTitleCardHidden) {
        this.startTitleCardTimer(3);
      }
    });

    // Mini Pill: click to show title card again (with 3s auto-hide)
    const titleMiniPill = this.container.querySelector('#hud-title-mini-pill') as HTMLButtonElement;
    titleMiniPill?.addEventListener('click', () => {
      this.showTitleCard(3);
    });

    // Desc Card: manual hide button (◀ Sembunyi)
    const hideDescBtn = this.container.querySelector('#btn-hide-desc-card') as HTMLButtonElement;
    hideDescBtn?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.hideDescCard();
    });

    // Desc Card: click anywhere on card pauses/restarts auto-hide timer
    const descCard = this.container.querySelector('#hud-desc-card') as HTMLElement;
    descCard?.addEventListener('click', () => {
      // If timer is running, pause it; otherwise restart
      if (this.descCardTimer !== null) {
        this.clearDescCardTimer();
      } else if (!this.isDescCardHidden) {
        this.startDescCardTimer(3);
      }
    });

    // Docked Tab: click to show desc card again (with 3s auto-hide)
    const descDockedTab = this.container.querySelector('#hud-desc-docked-tab') as HTMLButtonElement;
    descDockedTab?.addEventListener('click', () => {
      this.showDescCard(3);
    });

    // === END AUTO-HIDE LISTENERS ===

    // Turquoise Action Dropdown Toggle (Collapse to Single Icon)
    const dropdownToggleBtn = this.container.querySelector('#btn-action-dropdown-toggle') as HTMLButtonElement;
    const dropdownMenu = this.container.querySelector('#hud-action-dropdown-menu') as HTMLElement;
    const dropdownIconSvg = this.container.querySelector('#action-dropdown-toggle-icon') as SVGElement;

    let isDropdownOpen = false;
    const setDropdownState = (open: boolean) => {
      isDropdownOpen = open;
      if (dropdownMenu) {
        dropdownMenu.style.display = open ? 'flex' : 'none';
      }
      if (dropdownIconSvg) {
        dropdownIconSvg.innerHTML = open
          ? '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />'
          : '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />';
      }
    };

    dropdownToggleBtn?.addEventListener('click', (e) => {
      e.stopPropagation();
      setDropdownState(!isDropdownOpen);
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
      if (isDropdownOpen) {
        const target = e.target as HTMLElement;
        if (!target.closest('#hud-action-dropdown-container')) {
          setDropdownState(false);
        }
      }
    });

    // 0. Top Roster Button (Rombongan & Mutawwif Info Modal)
    const rosterBtn = this.container.querySelector('#btn-top-roster') as HTMLButtonElement;
    rosterBtn?.addEventListener('click', () => {
      this.showRosterModal();
    });

    // 1. Top Itinerary Button (Book Icon)
    const itineraryBtn = this.container.querySelector('#btn-top-itinerary') as HTMLButtonElement;
    itineraryBtn?.addEventListener('click', () => {
      setDropdownState(false);
      this.showItineraryModal();
    });

    // 1b. Top Larangan Ihram Button
    const laranganBtn = this.container.querySelector('#btn-top-larangan') as HTMLButtonElement;
    laranganBtn?.addEventListener('click', () => {
      setDropdownState(false);
      this.showLaranganIhramModal();
    });

    // 1c. Top Talbiyah Button
    const talbiyahTopBtn = this.container.querySelector('#btn-top-talbiyah') as HTMLButtonElement;
    talbiyahTopBtn?.addEventListener('click', () => {
      setDropdownState(false);
      this.showTalbiyahModal();
    });

    // 1d. Top Tawaf Guide & Real Mode Button
    const tawafTopBtn = this.container.querySelector('#btn-top-tawaf') as HTMLButtonElement;
    tawafTopBtn?.addEventListener('click', () => {
      setDropdownState(false);
      this.onOpenRealTawafSectionCallback?.();
    });

    // === TAWAF COMPASS & POLAR TRACKER LISTENERS ===
    const tawafWidget = this.container.querySelector('#hud-tawaf-compass-widget') as HTMLElement;
    const tawafMiniPill = this.container.querySelector('#hud-tawaf-mini-pill') as HTMLElement;
    const btnTawafMinimize = this.container.querySelector('#btn-tawaf-minimize') as HTMLButtonElement;
    const btnToggleTawafMode = this.container.querySelector('#btn-toggle-tawaf-mode') as HTMLButtonElement;
    const btnOpenTawafGuide = this.container.querySelector('#btn-open-tawaf-guide-modal') as HTMLButtonElement;
    const btnTawafIstilam = this.container.querySelector('#btn-tawaf-istilam') as HTMLButtonElement;
    const btnTawafSpeakDua = this.container.querySelector('#btn-tawaf-speak-dua') as HTMLButtonElement;
    const btnTawafToggleRaml = this.container.querySelector('#btn-tawaf-toggle-raml') as HTMLButtonElement;

    btnTawafMinimize?.addEventListener('click', () => {
      this.isTawafWidgetMinimized = true;
      if (tawafWidget) tawafWidget.style.display = 'none';
      if (tawafMiniPill) tawafMiniPill.style.display = 'flex';
    });

    tawafMiniPill?.addEventListener('click', () => {
      this.isTawafWidgetMinimized = false;
      if (tawafWidget) tawafWidget.style.display = 'flex';
      if (tawafMiniPill) tawafMiniPill.style.display = 'none';
    });

    btnToggleTawafMode?.addEventListener('click', () => {
      this.onOpenRealTawafSectionCallback?.();
    });

    btnOpenTawafGuide?.addEventListener('click', () => {
      this.showTawafGuideModal(this.currentStage === 'tawaf' && this.currentLap >= 1 && this.currentLap <= 7 ? (`lap${this.currentLap}` as TawafTabKey) : 'lap1');
    });

    btnTawafIstilam?.addEventListener('click', () => {
      this.onPerformIstilamCallback?.();
    });

    btnTawafSpeakDua?.addEventListener('click', () => {
      const snippet = this.currentTawafProgress?.sectorInfo.arabicSnippet;
      if (snippet) {
        soundManager.speakArabic(snippet);
      }
    });

    btnTawafToggleRaml?.addEventListener('click', () => {
      const nextRaml = !this.currentTawafProgress?.isRamlActive;
      this.onToggleRamlCallback?.(nextRaml);
    });

    // 2. Top Help Button (?)
    const helpBtn = this.container.querySelector('#btn-top-help') as HTMLButtonElement;
    helpBtn?.addEventListener('click', () => {
      setDropdownState(false);
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
      setDropdownState(false);
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

    const talbiyahQuickBtn = this.container.querySelector('#btn-talbiyah-quick-audio') as HTMLButtonElement;
    const talbiyahQuickIcon = this.container.querySelector('#talbiyah-quick-icon') as HTMLElement;
    const talbiyahQuickLabel = this.container.querySelector('#talbiyah-quick-label') as HTMLElement;
    talbiyahQuickBtn?.addEventListener('click', () => {
      if (soundManager.isTalbiyahAudioPlaying()) {
        soundManager.stopTalbiyahAudio();
        if (talbiyahQuickIcon) talbiyahQuickIcon.innerText = '🔊';
        if (talbiyahQuickLabel) talbiyahQuickLabel.innerText = 'Bunyi Arab';
      } else {
        if (talbiyahQuickIcon) talbiyahQuickIcon.innerText = '⏸️';
        if (talbiyahQuickLabel) talbiyahQuickLabel.innerText = 'Henti';
        soundManager.playTalbiyahAudio(
          () => {
            if (talbiyahQuickIcon) talbiyahQuickIcon.innerText = '🔊';
            if (talbiyahQuickLabel) talbiyahQuickLabel.innerText = 'Bunyi Arab';
          },
          () => {
            if (talbiyahQuickIcon) talbiyahQuickIcon.innerText = '🔊';
            if (talbiyahQuickLabel) talbiyahQuickLabel.innerText = 'Bunyi Arab';
          }
        );
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

    const busExitPrompt = this.container.querySelector('#bus-exit-prompt') as HTMLElement;
    busExitPrompt?.addEventListener('click', () => {
      this.onExitBusCallback?.();
    });

    const promptExitBtn = this.container.querySelector('#btn-prompt-exit-bus') as HTMLButtonElement;
    promptExitBtn?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.onExitBusCallback?.();
    });

    const exitBusBtn = this.container.querySelector('#btn-exit-bus') as HTMLButtonElement;
    exitBusBtn?.addEventListener('click', () => {
      this.onExitBusCallback?.();
    });

    const autoCruiseBtn = this.container.querySelector('#btn-auto-cruise') as HTMLButtonElement;
    autoCruiseBtn?.addEventListener('click', () => {
      this.onAutoCruiseCallback?.();
    });

    // Pahala Badge & Records
    const pahalaBadgeBtn = this.container.querySelector('#hud-status-pahala-badge') as HTMLButtonElement;
    pahalaBadgeBtn?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.showPahalaRecordModal();
    });

    const topPahalaBtn = this.container.querySelector('#btn-top-pahala') as HTMLButtonElement;
    topPahalaBtn?.addEventListener('click', () => {
      this.showPahalaRecordModal();
    });

    // Mosque Entrance Prompt Handlers
    const enterMosqueBtn = this.container.querySelector('#btn-prompt-enter-mosque') as HTMLButtonElement;
    enterMosqueBtn?.addEventListener('click', (e) => {
      e.stopPropagation();
      if (this.currentNearMosque) {
        this.onEnterMosqueDoorCallback?.(this.currentNearMosque);
      }
    });

    const mosqueDoorPrompt = this.container.querySelector('#mosque-door-prompt') as HTMLElement;
    mosqueDoorPrompt?.addEventListener('click', () => {
      if (this.currentNearMosque) {
        this.onEnterMosqueDoorCallback?.(this.currentNearMosque);
      }
    });

    // Inside Mosque Start Solat Button
    const startSolatBtn = this.container.querySelector('#btn-prompt-start-solat') as HTMLButtonElement;
    startSolatBtn?.addEventListener('click', () => {
      if (this.currentInsideMosque) {
        this.onStartSolatCallback?.(this.currentInsideMosque);
      }
    });
  }

  private setupJoystick() {
    const zone = this.container.querySelector('#touch-joystick-zone') as HTMLElement;
    const thumb = this.container.querySelector('#touch-joystick-thumb') as HTMLElement;
    const autoWalkBtn = this.container.querySelector('#btn-auto-walk') as HTMLButtonElement;
    const autoWalkIcon = this.container.querySelector('#auto-walk-icon') as HTMLElement;
    const autoWalkLabel = this.container.querySelector('#auto-walk-label') as HTMLElement;
    if (!zone || !thumb) return;

    let touchId: number | null = null;
    let isMouseDown = false;
    let center = { x: 0, y: 0 };
    const maxRadius = 42;
    let lastTapTime = 0;

    const setAutoWalkState = (state: boolean) => {
      this.isAutoWalking = state;
      if (autoWalkBtn) {
        if (state) {
          autoWalkBtn.classList.add('bg-emerald-100', 'border-emerald-500', 'text-emerald-800');
          autoWalkBtn.classList.remove('bg-[#FAF7F2]/95', 'border-stone-200/80', 'text-stone-700');
          if (autoWalkIcon) autoWalkIcon.textContent = '🟢';
          if (autoWalkLabel) autoWalkLabel.textContent = 'Auto: Bergerak';
          thumb.style.transform = 'translate(0px, -28px)';
          this.onJoystickMoveCallback?.(0, -1);
        } else {
          autoWalkBtn.classList.remove('bg-emerald-100', 'border-emerald-500', 'text-emerald-800');
          autoWalkBtn.classList.add('bg-[#FAF7F2]/95', 'border-stone-200/80', 'text-stone-700');
          if (autoWalkIcon) autoWalkIcon.textContent = '🚶‍♂️';
          if (autoWalkLabel) autoWalkLabel.textContent = 'Auto-Jalan';
          thumb.style.transform = 'translate(0px, 0px)';
          this.onJoystickMoveCallback?.(0, 0);
        }
      }
    };

    autoWalkBtn?.addEventListener('click', (e) => {
      e.stopPropagation();
      setAutoWalkState(!this.isAutoWalking);
    });

    // Mobile Touch
    zone.addEventListener('touchstart', (e) => {
      e.preventDefault();
      e.stopPropagation();

      // Double tap zone to toggle Auto-Walk
      const now = Date.now();
      if (now - lastTapTime < 320) {
        setAutoWalkState(!this.isAutoWalking);
        lastTapTime = 0;
        return;
      }
      lastTapTime = now;

      // Cancel auto-walk if manual touch starts
      if (this.isAutoWalking) {
        setAutoWalkState(false);
      }

      if (touchId !== null) return;
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

    const handleTouchEnd = (e: TouchEvent) => {
      if (touchId === null) return;
      let matchingEnded = false;
      for (let i = 0; i < e.changedTouches.length; i++) {
        if (e.changedTouches[i].identifier === touchId) {
          matchingEnded = true;
          break;
        }
      }

      // CRITICAL FIX: Only reset the joystick if the finger touching the joystick was lifted,
      // or if all touches on screen are gone. Releasing another finger (e.g. from camera look-around / ubah pandang)
      // will NOT reset or interrupt joystick movement!
      if (matchingEnded || e.touches.length === 0) {
        touchId = null;
        if (!this.isAutoWalking) {
          thumb.style.transform = 'translate(0px, 0px)';
          this.onJoystickMoveCallback?.(0, 0);
        }
      }
    };

    window.addEventListener('touchend', handleTouchEnd, { passive: true });
    window.addEventListener('touchcancel', handleTouchEnd, { passive: true });

    // Desktop Mouse Drag Support
    zone.addEventListener('mousedown', (e) => {
      e.preventDefault();
      e.stopPropagation();

      const now = Date.now();
      if (now - lastTapTime < 320) {
        setAutoWalkState(!this.isAutoWalking);
        lastTapTime = 0;
        return;
      }
      lastTapTime = now;

      if (this.isAutoWalking) {
        setAutoWalkState(false);
      }

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
        isMouseDown = false;
        if (!this.isAutoWalking) {
          thumb.style.transform = 'translate(0px, 0px)';
          this.onJoystickMoveCallback?.(0, 0);
        }
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
    const lapIndicatorEl = this.container.querySelector('#hud-lap-indicator-text') as HTMLElement;
    const miniLapEl = this.container.querySelector('#hud-mini-lap-pill') as HTMLElement;

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

    if (lapIndicatorEl) {
      lapIndicatorEl.innerText = `Lokasi ${index + 1}/${total}`;
    }
    if (miniLapEl) {
      miniLapEl.innerText = `Lokasi ${index + 1}/${total}`;
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

    // Re-show both cards with 3s auto-hide when navigating to a new spot
    this.showTitleCard(3);
    this.showDescCard(3);
    this.updateTalbiyahQuickButton();
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
      if (descText) descText.innerText = 'Mulakan pusingan di garisan Hajarul Aswad. Pusingan LAWAN ARAH JAM (Kaabah sentiasa berada di sebelah kiri anda).';
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

    // Re-show both cards with 3s auto-hide when stage changes
    this.showTitleCard(3);
    this.showDescCard(3);
    this.updateTalbiyahQuickButton();

    // Toggle Tawaf Compass Widget
    const tawafWidget = this.container.querySelector('#hud-tawaf-compass-widget') as HTMLElement;
    const tawafMiniPill = this.container.querySelector('#hud-tawaf-mini-pill') as HTMLElement;
    if (stage === 'tawaf') {
      if (this.isTawafWidgetMinimized) {
        if (tawafWidget) tawafWidget.style.display = 'none';
        if (tawafMiniPill) tawafMiniPill.style.display = 'flex';
      } else {
        if (tawafWidget) tawafWidget.style.display = 'flex';
        if (tawafMiniPill) tawafMiniPill.style.display = 'none';
      }
    } else {
      if (tawafWidget) tawafWidget.style.display = 'none';
      if (tawafMiniPill) tawafMiniPill.style.display = 'none';
    }
  }

  public updateTawafProgress(progress: TawafProgress) {
    this.currentTawafProgress = progress;
    this.currentLap = progress.lap;

    const tawafWidget = this.container.querySelector('#hud-tawaf-compass-widget') as HTMLElement;
    const tawafMiniPill = this.container.querySelector('#hud-tawaf-mini-pill') as HTMLElement;

    if (this.currentStage === 'tawaf') {
      if (this.isTawafWidgetMinimized) {
        if (tawafWidget) tawafWidget.style.display = 'none';
        if (tawafMiniPill) tawafMiniPill.style.display = 'flex';
      } else {
        if (tawafWidget) tawafWidget.style.display = 'flex';
        if (tawafMiniPill) tawafMiniPill.style.display = 'none';
      }
    }

    // Mini Pill updates
    const miniLap = this.container.querySelector('#tawaf-mini-pill-lap') as HTMLElement;
    const miniDeg = this.container.querySelector('#tawaf-mini-pill-deg') as HTMLElement;
    if (miniLap) miniLap.innerText = `Tawaf ${progress.lap}/7`;
    if (miniDeg) miniDeg.innerText = `${Math.round(progress.angleDeg)}°`;

    // Lap text
    const lapText = this.container.querySelector('#tawaf-widget-lap-text') as HTMLElement;
    if (lapText) lapText.innerText = `Pusingan ${progress.lap} / 7`;

    // Mode label
    const modeLabel = this.container.querySelector('#tawaf-mode-label') as HTMLElement;
    if (modeLabel) modeLabel.innerText = progress.tawafMode === 'real' ? 'Real' : 'Jemaah';

    // Compass degree & radius
    const degEl = this.container.querySelector('#tawaf-compass-deg') as HTMLElement;
    if (degEl) degEl.innerText = `${Math.round(progress.angleDeg)}°`;

    const radEl = this.container.querySelector('#tawaf-compass-radius') as HTMLElement;
    if (radEl) radEl.innerText = `${progress.radius}m`;

    // Compass Needle
    const needleEl = this.container.querySelector('#tawaf-compass-needle') as HTMLElement;
    if (needleEl) {
      needleEl.style.transform = `rotate(${progress.angleDeg}deg)`;
    }

    // Compass Arc (Circumference ~ 239)
    const arcEl = this.container.querySelector('#tawaf-compass-arc') as SVGPathElement;
    if (arcEl) {
      const circumference = 239;
      const offset = circumference - (circumference * (progress.lapPercentage / 100));
      arcEl.style.strokeDashoffset = String(Math.max(0, offset));
    }

    // Sector badge & description
    const sectorBadge = this.container.querySelector('#tawaf-sector-badge') as HTMLElement;
    if (sectorBadge) {
      sectorBadge.innerText = `Sektor ${progress.sector}: ${progress.sectorInfo.shortName}`;
    }

    const sectorDesc = this.container.querySelector('#tawaf-sector-desc') as HTMLElement;
    if (sectorDesc) {
      sectorDesc.innerText = progress.sectorInfo.duaTitle;
    }

    // Lap percentage
    const lapPercent = this.container.querySelector('#tawaf-lap-percent') as HTMLElement;
    if (lapPercent) {
      lapPercent.innerText = `${progress.lapPercentage}%`;
    }

    // Boundary status
    const boundaryStatus = this.container.querySelector('#tawaf-boundary-status') as HTMLElement;
    if (boundaryStatus) {
      if (progress.isInsideHijrIsmail) {
        boundaryStatus.innerHTML = `<span class="text-rose-400 font-bold">⚠️ Dalam Hijr Ismail!</span>`;
      } else if (progress.isWrongDirection) {
        boundaryStatus.innerHTML = `<span class="text-rose-400 font-bold">⚠️ Arah Salah!</span>`;
      } else if (progress.isOutsideMataf) {
        boundaryStatus.innerHTML = `<span class="text-amber-400 font-bold">⚠️ Luar Mataf</span>`;
      } else {
        boundaryStatus.innerHTML = `<span class="text-emerald-400 font-semibold">• Sah</span>`;
      }
    }

    // 7 Lap Dots
    for (let l = 1; l <= 7; l++) {
      const dot = this.container.querySelector(`#tawaf-dot-lap-${l}`) as HTMLElement;
      if (dot) {
        if (l < progress.lap) {
          dot.className = 'w-full h-1.5 rounded-full bg-emerald-500 shadow-[0_0_6px_#10b981]';
        } else if (l === progress.lap) {
          dot.className = 'w-full h-1.5 rounded-full bg-amber-400 shadow-[0_0_6px_#f59e0b]';
        } else {
          dot.className = 'w-full h-1.5 rounded-full bg-stone-800';
        }
      }
    }

    // Istilam Button (Pulses if available)
    const btnIstilam = this.container.querySelector('#btn-tawaf-istilam') as HTMLButtonElement;
    const btnIstilamLabel = this.container.querySelector('#btn-tawaf-istilam-label') as HTMLElement;
    if (btnIstilam && btnIstilamLabel) {
      if (progress.isIstilamAvailable) {
        btnIstilam.className = 'interactive-ui col-span-2 py-2 px-3 rounded-xl bg-gradient-to-r from-emerald-500 via-emerald-400 to-emerald-500 text-stone-950 font-black text-xs flex items-center justify-center gap-1.5 shadow-[0_0_20px_rgba(16,185,129,0.8)] border-2 border-white animate-bounce active:scale-95 transition cursor-pointer';
        btnIstilamLabel.innerText = '✋ [E] TEKAN UNTUK ISTILAM!';
      } else {
        btnIstilam.className = 'interactive-ui col-span-2 py-2 px-3 rounded-xl bg-stone-800 hover:bg-stone-700 border border-stone-700 text-stone-300 font-semibold text-xs flex items-center justify-center gap-1.5 active:scale-95 transition cursor-pointer';
        btnIstilamLabel.innerText = '✋ Istilam (Garisan Mula)';
      }
    }

    // Raml Button
    const btnRaml = this.container.querySelector('#btn-tawaf-toggle-raml') as HTMLButtonElement;
    const labelRaml = this.container.querySelector('#tawaf-raml-label') as HTMLElement;
    if (btnRaml && labelRaml) {
      if (progress.isRamlActive) {
        btnRaml.className = 'interactive-ui py-1.5 px-2 rounded-xl bg-amber-500 text-stone-950 font-bold text-[11px] flex items-center justify-center gap-1 active:scale-95 transition cursor-pointer shadow-md shadow-amber-900/40';
        labelRaml.innerText = 'Raml: Aktif 🏃';
      } else {
        btnRaml.className = 'interactive-ui py-1.5 px-2 rounded-xl bg-stone-800 hover:bg-stone-700 border border-stone-700 text-stone-200 font-bold text-[11px] flex items-center justify-center gap-1 active:scale-95 transition cursor-pointer';
        labelRaml.innerText = 'Raml: Mati';
      }
    }
  }

  public showTawafModeDialog(currentMode: TawafMode, onSelect: (mode: TawafMode) => void) {
    const existing = document.getElementById('modal-tawaf-mode-dialog');
    if (existing) existing.remove();

    const modal = document.createElement('div');
    modal.id = 'modal-tawaf-mode-dialog';
    modal.className = 'fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md select-none font-sans overflow-hidden animate-fade-in';

    modal.innerHTML = `
      <div class="relative w-full max-w-lg bg-stone-900 border border-amber-500/40 rounded-2xl shadow-2xl p-5 sm:p-6 text-stone-100 space-y-5">
        
        <div class="text-center space-y-1.5">
          <div class="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-700 text-stone-950 flex items-center justify-center text-2xl mx-auto shadow-lg shadow-amber-500/20">
            🕋
          </div>
          <span class="text-xs uppercase font-extrabold tracking-widest text-amber-400">DATARAN MATAF KAABAH</span>
          <h2 class="text-xl sm:text-2xl font-bold text-white">Pilih Mod Pengalaman Tawaf</h2>
          <p class="text-xs text-stone-400">
            Anda telah tiba di hadapan Kaabah. Sila pilih kaedah pelaksanaan Tawaf anda:
          </p>
        </div>

        <div class="space-y-3">
          <!-- Option 1: Mod Real Tawaf (Recommended) -->
          <button id="btn-select-real-tawaf" class="w-full p-4 rounded-xl text-left bg-gradient-to-r from-emerald-950/70 to-stone-800 border-2 ${currentMode === 'real' ? 'border-emerald-400 ring-2 ring-emerald-400/30' : 'border-stone-700'} hover:border-emerald-400 active:scale-[0.99] transition cursor-pointer group">
            <div class="flex items-start gap-3">
              <span class="text-2xl p-2 rounded-lg bg-emerald-900/60 text-emerald-300 border border-emerald-500/30 shrink-0">🧭</span>
              <div>
                <div class="flex items-center gap-2">
                  <span class="font-bold text-white text-sm sm:text-base group-hover:text-emerald-300 transition">Mod Real Tawaf (Ibadah Nyata)</span>
                  <span class="px-2 py-0.5 rounded text-[10px] font-extrabold bg-emerald-500 text-stone-950">Disyorkan</span>
                </div>
                <p class="text-xs text-stone-300 mt-1 leading-relaxed">
                  Buka bahagian khas <strong>tanpa antaramuka game (game interface)</strong> yang hanya mengandungi Kompas Kiblat sebenar, kiraan 7 pusingan, doa mengikut pusingan, dan panduan 4 Rukun Kaabah.
                </p>
              </div>
            </div>
          </button>

          <!-- Option 2: Mod Panduan Jemaah -->
          <button id="btn-select-guided-tawaf" class="w-full p-4 rounded-xl text-left bg-stone-800/80 border-2 ${currentMode === 'guided' ? 'border-amber-400 ring-2 ring-amber-400/30' : 'border-stone-700'} hover:border-amber-400 active:scale-[0.99] transition cursor-pointer group">
            <div class="flex items-start gap-3">
              <span class="text-2xl p-2 rounded-lg bg-amber-900/40 text-amber-300 border border-amber-500/30 shrink-0">👥</span>
              <div>
                <span class="font-bold text-white text-sm sm:text-base group-hover:text-amber-300 transition">Mod Panduan Jemaah (Santai)</span>
                <p class="text-xs text-stone-300 mt-1 leading-relaxed">
                  Mengikuti rombongan secara santai bersama jemaah dan mutawwif sambil membaca doa pusingan secara santai.
                </p>
              </div>
            </div>
          </button>
        </div>

        <div class="flex items-center justify-between pt-2 border-t border-stone-800 text-xs">
          <span class="text-stone-400">Boleh ditukar pada bila-bila masa di menu atas.</span>
          <button id="btn-close-tawaf-mode-dialog" class="px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 font-bold transition">
            Tutup
          </button>
        </div>

      </div>
    `;

    document.body.appendChild(modal);

    const btnReal = modal.querySelector('#btn-select-real-tawaf') as HTMLButtonElement;
    const btnGuided = modal.querySelector('#btn-select-guided-tawaf') as HTMLButtonElement;
    const btnClose = modal.querySelector('#btn-close-tawaf-mode-dialog') as HTMLButtonElement;

    btnReal?.addEventListener('click', () => {
      onSelect('real');
      modal.remove();
      this.onOpenRealTawafSectionCallback?.();
    });

    btnGuided?.addEventListener('click', () => {
      onSelect('guided');
      modal.remove();
    });

    btnClose?.addEventListener('click', () => {
      modal.remove();
    });

    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.remove();
    });
  }

  public showTawafGuideModal(initialTab: TawafTabKey = 'lap1') {
    new TawafModal({
      initialTab,
      onSelectDua: (_duaId) => {
        // Selected dua
      }
    });
  }

  public setNearBusDoor(isNear: boolean) {
    const prompt = this.container.querySelector('#bus-door-prompt') as HTMLElement;
    if (prompt) {
      prompt.style.display = isNear && !this.isBusBoarded ? 'flex' : 'none';
    }
  }

  public setBusBoarded(inBus: boolean) {
    this.isBusBoarded = inBus;
    const doorPrompt = this.container.querySelector('#bus-door-prompt') as HTMLElement;
    if (doorPrompt && inBus) doorPrompt.style.display = 'none';

    const exitPrompt = this.container.querySelector('#bus-exit-prompt') as HTMLElement;
    if (exitPrompt && !inBus) exitPrompt.style.display = 'none';

    const dashboard = this.container.querySelector('#bus-dashboard-card') as HTMLElement;
    if (dashboard) {
      dashboard.style.display = inBus ? 'block' : 'none';
    }
  }

  public updateBusDrivingHUD(speedKmh: number, isCruising: boolean, destName?: string) {
    const speedometer = this.container.querySelector('#bus-speedometer') as HTMLElement;
    const cruiseText = this.container.querySelector('#btn-auto-cruise-text') as HTMLElement;
    const destEl = this.container.querySelector('#bus-dashboard-dest') as HTMLElement;
    const statusEl = this.container.querySelector('#bus-dashboard-status') as HTMLElement;
    const exitPrompt = this.container.querySelector('#bus-exit-prompt') as HTMLElement;
    const exitPromptTitle = this.container.querySelector('#bus-exit-prompt-title') as HTMLElement;
    const exitPromptSub = this.container.querySelector('#bus-exit-prompt-subtitle') as HTMLElement;

    if (speedometer) speedometer.innerText = speedKmh.toString();
    if (cruiseText) {
      cruiseText.innerText = isCruising ? 'Hentikan Autopilot' : 'Pandu Automatik';
    }
    if (destName && destEl) {
      destEl.innerText = `Destinasi: ${destName}`;
    }

    if (statusEl) {
      if (speedKmh === 0 && !isCruising) {
        statusEl.innerText = '✅ Bas Telah Sampai di Destinasi';
      } else {
        statusEl.innerText = isCruising ? '🚌 Autopilot Sedang Memandu...' : 'Bas Ziarah Sedang Beroperasi';
      }
    }

    if (exitPrompt) {
      if (this.isBusBoarded && speedKmh === 0 && !isCruising) {
        if (destName && exitPromptTitle) {
          exitPromptTitle.innerText = `Bas Telah Sampai di ${destName}!`;
        }
        if (exitPromptSub) {
          exitPromptSub.innerText = 'Tekan [E] atau Klik untuk Turun Bas';
        }
        exitPrompt.style.display = 'flex';
      } else {
        exitPrompt.style.display = 'none';
      }
    }
  }

  public setNearMosqueDoor(mosque: MosqueLocation | null) {
    this.currentNearMosque = mosque;
    const prompt = this.container.querySelector('#mosque-door-prompt') as HTMLElement;
    const titleEl = this.container.querySelector('#mosque-door-title') as HTMLElement;
    const subtitleEl = this.container.querySelector('#mosque-door-subtitle') as HTMLElement;

    if (prompt) {
      if (mosque && !this.isBusBoarded) {
        if (titleEl) titleEl.innerText = mosque.entranceName;
        if (subtitleEl) subtitleEl.innerText = `Masuk ${mosque.name} • Tekan [E] atau Klik untuk Masuk & Solat`;
        prompt.style.display = 'flex';
      } else {
        prompt.style.display = 'none';
      }
    }
  }

  public setInsideMosque(mosque: MosqueLocation | null) {
    this.currentInsideMosque = mosque;
    const card = this.container.querySelector('#mosque-prayer-card') as HTMLElement;
    const nameEl = this.container.querySelector('#mosque-prayer-name') as HTMLElement;
    const descEl = this.container.querySelector('#mosque-prayer-desc') as HTMLElement;

    if (card) {
      if (mosque && !this.isBusBoarded) {
        if (nameEl) nameEl.innerText = `Ruang Solat ${mosque.name}`;
        if (descEl) descEl.innerText = `${mosque.fadhilat}`;
        card.style.display = 'flex';
      } else {
        card.style.display = 'none';
      }
    }
  }

  public updatePahala(total: number, added?: number, isJemaah?: boolean, mosqueName?: string) {
    this.currentPahala = total;
    const counter = this.container.querySelector('#hud-pahala-counter') as HTMLElement;
    const miniPahala = this.container.querySelector('#hud-mini-pahala-val') as HTMLElement;

    if (counter) counter.innerText = total.toString();
    if (miniPahala) miniPahala.innerText = total.toString();

    if (added && typeof isJemaah === 'boolean') {
      this.showPahalaNotification(added, isJemaah, mosqueName || '');
    }
  }

  public showPahalaNotification(added: number, isJemaah: boolean, mosqueName: string) {
    const banner = this.container.querySelector('#pahala-notification-banner') as HTMLElement;
    const textEl = this.container.querySelector('#pahala-notification-text') as HTMLElement;
    if (!banner || !textEl) return;

    const mosqueDesc = mosqueName ? ` di ${mosqueName}` : '';
    textEl.innerText = isJemaah
      ? `+${added} PAHALA BERJEMAAH DIPEROLEHI! (27x DARJAT)${mosqueDesc} 🌟`
      : `+${added} PAHALA SOLO DIPEROLEHI!${mosqueDesc} ⭐`;

    banner.style.display = 'flex';
    banner.classList.remove('opacity-0');
    banner.classList.add('opacity-100');

    setTimeout(() => {
      banner.style.display = 'none';
    }, 4500);
  }

  public showPahalaRecordModal() {
    const existing = document.getElementById('pahala-record-modal-overlay');
    if (existing) existing.remove();

    const overlay = document.createElement('div');
    overlay.id = 'pahala-record-modal-overlay';
    overlay.className = 'interactive-ui fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-3 sm:p-4 overflow-y-auto select-none';

    overlay.innerHTML = `
      <div class="relative w-full max-w-xl bg-white/95 backdrop-blur-xl border border-stone-200/90 rounded-3xl shadow-2xl p-5 sm:p-6 flex flex-col gap-4 text-stone-900 transition-all overflow-hidden my-auto">
        <!-- Top decorative bar -->
        <div class="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-amber-500 via-yellow-400 to-emerald-600"></div>

        <!-- Header -->
        <div class="flex items-center justify-between pb-2 border-b border-stone-200/80 pt-1">
          <div class="flex items-center gap-2">
            <span class="text-2xl">📖</span>
            <div>
              <h2 class="font-serif text-lg sm:text-xl font-bold text-stone-900 leading-tight">
                Buku Amalan & Rekod Pahala Solat
              </h2>
              <div class="text-[11px] text-stone-500 font-medium">
                Ganjaran Ibadah Solat di Tanah Suci Makkah & Madinah
              </div>
            </div>
          </div>
          <button id="btn-close-pahala-modal" class="p-1.5 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 text-sm transition cursor-pointer">
            ✕
          </button>
        </div>

        <!-- Total Pahala Hero Card -->
        <div class="bg-gradient-to-br from-amber-500/15 via-yellow-500/10 to-emerald-500/15 border-2 border-amber-400/80 rounded-2xl p-4 text-center flex flex-col items-center justify-center shadow-sm">
          <span class="text-xs font-bold text-amber-800 uppercase tracking-widest">JUMLAH PAHALA TERKUMPUL</span>
          <div class="font-serif text-4xl sm:text-5xl font-black text-amber-900 my-1 flex items-center gap-2">
            <span class="animate-pulse">✨</span>
            <span>${this.currentPahala}</span>
            <span class="text-2xl font-bold text-amber-700">Pahala</span>
          </div>
          <div class="text-[11px] text-stone-600">
            Setiap Solat Solo = <b>1 Pahala</b> • Solat Berjemaah = <b>27 Pahala</b> (27 Darjat Keutamaan)
          </div>
        </div>

        <!-- Statistics Grid -->
        <div class="grid grid-cols-2 gap-2.5">
          <div class="bg-stone-50 border border-stone-200 rounded-xl p-3 flex flex-col">
            <span class="text-[10px] font-bold text-stone-500 uppercase">👥 Solat Berjemaah</span>
            <span class="text-xl font-bold text-emerald-800">${this.jemaahSolatCount} kali</span>
            <span class="text-[11px] text-emerald-600 font-semibold">+${this.jemaahSolatCount * 27} Pahala (x27)</span>
          </div>
          <div class="bg-stone-50 border border-stone-200 rounded-xl p-3 flex flex-col">
            <span class="text-[10px] font-bold text-stone-500 uppercase">👤 Solat Solo</span>
            <span class="text-xl font-bold text-stone-800">${this.soloSolatCount} kali</span>
            <span class="text-[11px] text-stone-600 font-semibold">+${this.soloSolatCount * 1} Pahala (x1)</span>
          </div>
        </div>

        <!-- List of Mosques Status -->
        <div class="flex flex-col gap-2">
          <span class="text-xs font-bold text-stone-700 flex items-center gap-1.5">
            <span>🕌</span>
            <span>Status Solat di Setiap Masjid:</span>
          </span>
          <div class="flex flex-col gap-1.5 max-h-56 overflow-y-auto pr-1">
            ${MOSQUE_LOCATIONS.map(m => {
              const hasPrayed = this.visitedMosques.includes(m.id);
              return `
                <div class="flex items-center justify-between p-2.5 rounded-xl border ${hasPrayed ? 'bg-emerald-50/70 border-emerald-200' : 'bg-stone-50 border-stone-200'} text-xs">
                  <div class="flex items-center gap-2 min-w-0">
                    <span class="text-base">${hasPrayed ? '✅' : '🕌'}</span>
                    <div class="min-w-0">
                      <div class="font-bold text-stone-900 truncate">${m.name}</div>
                      <div class="text-[10px] text-stone-500 truncate">${m.city} • ${m.entranceName}</div>
                    </div>
                  </div>
                  <button class="btn-teleport-mosque shrink-0 px-2.5 py-1 rounded-lg ${hasPrayed ? 'bg-emerald-600 text-white' : 'bg-stone-900 text-white'} text-[10px] font-bold hover:opacity-90 transition active:scale-95 cursor-pointer" data-id="${m.id}" data-x="${m.entranceCoord.x}" data-z="${m.entranceCoord.z}">
                    Pergi ➔
                  </button>
                </div>
              `;
            }).join('')}
          </div>
        </div>

        <!-- Hadith Note -->
        <div class="bg-amber-50/80 border border-amber-200 rounded-xl p-2.5 text-[11px] text-amber-900 leading-relaxed text-center">
          📜 Sabda Rasulullah ﷺ: <i>"Solat berjemaah itu lebih afdhal daripada solat bersendirian sebanyak 27 darjat."</i> (Hadis Sahih Bukhari & Muslim)
        </div>

        <div class="flex justify-end pt-1">
          <button id="btn-close-pahala-bottom" class="px-5 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs shadow transition cursor-pointer">
            Tutup
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);

    overlay.querySelector('#btn-close-pahala-modal')?.addEventListener('click', () => overlay.remove());
    overlay.querySelector('#btn-close-pahala-bottom')?.addEventListener('click', () => overlay.remove());

    overlay.querySelectorAll('.btn-teleport-mosque').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const target = e.currentTarget as HTMLElement;
        const x = parseFloat(target.dataset.x || '0');
        const z = parseFloat(target.dataset.z || '0');
        overlay.remove();
        this.onTeleportCallback?.(`mosque_coord_${x}_${z}`);
      });
    });
  }

  public updateSolatZamzamStatus(_solatSunatDone: boolean, _zamzamDone: boolean) {}

  public updateLap(stage: 'tawaf' | 'sai', lap: number) {
    this.currentLap = lap;
    const titleEl = this.container.querySelector('#hud-location-title') as HTMLElement;
    const descText = this.container.querySelector('#hud-desc-text') as HTMLElement;
    const lapIndicatorEl = this.container.querySelector('#hud-lap-indicator-text') as HTMLElement;
    const miniLapEl = this.container.querySelector('#hud-mini-lap-pill') as HTMLElement;

    const lapStr = stage === 'tawaf' ? `Tawaf ${lap}/7` : `Sa'i ${lap}/7`;
    if (lapIndicatorEl) {
      lapIndicatorEl.innerText = lapStr;
    }
    if (miniLapEl) {
      miniLapEl.innerText = lapStr;
    }

    if (stage === 'tawaf') {
      if (titleEl) titleEl.innerText = `Tawaf Pusingan ke-${lap} / 7`;
      if (descText) descText.innerText = `Sedang mengelilingi Kaabah pusingan ke-${lap}. Pusingan LAWAN ARAH JAM (Kaabah sentiasa di sebelah kiri). Lafazkan doa dan lakukan istilam di penjuru Rukun Yamani dan Hajarul Aswad.`;
    } else {
      const fromHill = lap % 2 === 1 ? 'Safa ke Marwah' : 'Marwah ke Safa';
      if (titleEl) titleEl.innerText = `Sa'i Pusingan ke-${lap} (${fromHill})`;
      if (descText) descText.innerText = `Pusingan ke-${lap} daripada 7 pusingan Sa'i (${fromHill}). Berjalan atau berlari anak di zon lampu hijau.`;
    }

    this.updateSegmentPills(lap, 7);
  }

  public displayDua(dua: DuaItem, alertMessage?: string) {
    this.currentDua = dua;
    const descText = this.container.querySelector('#hud-desc-text') as HTMLElement;
    if (descText) {
      descText.innerText = alertMessage ? `${alertMessage} — ${dua.translation}` : `${dua.title}: ${dua.translation}`;
    }
    this.updateTalbiyahQuickButton();
  }

  private updateTalbiyahQuickButton() {
    const isTalbiyah = 
      this.currentZiarahSpot?.id === 'perjalanan_bas_talbiyah_makkah' ||
      this.currentZiarahSpot?.dua?.id === 'talbiyah_perjalanan' ||
      this.currentDua?.id === 'talbiyah' ||
      this.currentDua?.id === 'talbiyah_perjalanan' ||
      this.currentStage === 'perjalanan_makkah';

    const btn = this.container.querySelector('#btn-talbiyah-quick-audio') as HTMLElement;
    if (btn) {
      btn.style.display = isTalbiyah ? 'inline-flex' : 'none';
    }
  }

  public updateGroupRoster(
    groupName: string,
    groupColor: string,
    localPlayerPos: { x: number; z: number; rotation: number },
    allPlayers: PlayerData[],
    localRole: PlayerRole = 'jemaah',
    playerName?: string,
    isSupabaseConnected?: boolean
  ) {
    this.localPlayerPos = localPlayerPos;
    this.isLocalMutawwif = localRole === 'mutawwif';
    this.localPlayerRole = localRole;
    this.localGroupName = groupName || 'Solo';
    this.localGroupColor = groupColor || '#C5A880';
    if (typeof isSupabaseConnected === 'boolean') {
      this.isSupabaseConnected = isSupabaseConnected;
    }
    if (playerName) {
      this.localPlayerName = playerName;
    } else if (!this.localPlayerName) {
      this.localPlayerName = localStorage.getItem('umrah_player_name') || 'Jemaah';
    }

    this.allPlayersList = allPlayers;
    this.groupMembers = allPlayers.filter(p => p.groupName === groupName);
    this.mutawwifPlayer = this.groupMembers.find(p => p.role === 'mutawwif') || null;

    // Count real human players (excluding bots)
    const realOtherPlayers = allPlayers.filter(p => !p.isBot);
    this.realOnlineCount = Math.max(1, realOtherPlayers.length + 1);

    // Update Top-Right Action Button Info
    const rosterStatusText = this.container.querySelector('#top-roster-status-text') as HTMLElement;
    const rosterGroupLabel = this.container.querySelector('#top-roster-group-label') as HTMLElement;
    const playerDisplayName = this.container.querySelector('#hud-player-display-name') as HTMLElement;
    const badge = this.container.querySelector('#top-roster-badge') as HTMLElement;

    if (badge) {
      if (this.isSupabaseConnected) {
        badge.className = 'w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0 ml-1 shadow-[0_0_8px_rgba(16,185,129,0.8)]';
        badge.title = `Supabase Realtime: Bersambung (${this.realOnlineCount} pemain online)`;
      } else {
        badge.className = 'w-2 h-2 rounded-full bg-amber-400 shrink-0 ml-1';
        badge.title = 'Mod Simulasi / Luar Talian';
      }
    }

    if (rosterGroupLabel) {
      if (this.isSupabaseConnected && this.realOnlineCount > 1) {
        rosterGroupLabel.innerText = `ONLINE (${this.realOnlineCount})`;
      } else {
        rosterGroupLabel.innerText = this.localGroupName.replace(/^Kumpulan\s+/i, '');
      }
    }

    if (playerDisplayName) {
      const roleIcon = this.isLocalMutawwif ? '🚩 ' : '👤 ';
      playerDisplayName.innerText = `${roleIcon}${this.localPlayerName} (${this.isLocalMutawwif ? 'Mutawwif' : 'Jemaah'})`;
    }

    // Mutawwif distance calculation
    const mutawwifDistBadge = this.container.querySelector('#hud-mutawwif-dist-text') as HTMLElement;
    const miniMutawwifPill = this.container.querySelector('#hud-mini-mutawwif-pill') as HTMLElement;
    const mutawwifIcon = this.container.querySelector('#hud-mutawwif-icon') as HTMLElement;

    let distStr = '';
    let miniDistStr = '';

    if (this.isLocalMutawwif) {
      const followerCount = this.groupMembers.length;
      distStr = `Ketua Mutawwif (${followerCount} jemaah)`;
      miniDistStr = `🚩 Ketua (${followerCount})`;
      if (mutawwifIcon) mutawwifIcon.innerText = '🚩';
      if (rosterStatusText) {
        rosterStatusText.innerText = this.isSupabaseConnected && this.realOnlineCount > 1
          ? `🟢 ${this.realOnlineCount} Online`
          : `Ketua (${followerCount})`;
      }
    } else if (this.mutawwifPlayer) {
      const dx = this.mutawwifPlayer.x - this.localPlayerPos.x;
      const dz = this.mutawwifPlayer.z - this.localPlayerPos.z;
      const dist = Math.sqrt(dx * dx + dz * dz);
      distStr = `Mutawwif: ${dist.toFixed(1)}m`;
      miniDistStr = `🧭 ${dist.toFixed(0)}m`;
      if (mutawwifIcon) mutawwifIcon.innerText = '🧭';
      if (rosterStatusText) {
        rosterStatusText.innerText = this.isSupabaseConnected && this.realOnlineCount > 1
          ? `🟢 ${this.realOnlineCount} Online`
          : `${dist.toFixed(0)}m Mutawwif`;
      }
    } else {
      distStr = 'Tiada Mutawwif berdekatan';
      miniDistStr = '👥 Solo';
      if (mutawwifIcon) mutawwifIcon.innerText = '👥';
      if (rosterStatusText) {
        rosterStatusText.innerText = this.isSupabaseConnected && this.realOnlineCount > 1
          ? `🟢 ${this.realOnlineCount} Online`
          : `${this.groupMembers.length + 1} Ahli`;
      }
    }

    if (mutawwifDistBadge) mutawwifDistBadge.innerText = distStr;
    if (miniMutawwifPill) miniMutawwifPill.innerText = miniDistStr;

    // Refresh Roster Modal if it is currently open
    if (this.isRosterModalOpen) {
      this.refreshRosterModalContent();
    }
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

    const isTalbiyah = 
      dua?.id === 'talbiyah' || 
      dua?.id === 'talbiyah_perjalanan' || 
      spot?.id === 'perjalanan_bas_talbiyah_makkah' ||
      !!dua?.waktuUmrah;

    const talbiyahDetailsHtml = isTalbiyah ? `
      <!-- Waktu Membaca Talbiyah Umrah vs Haji -->
      <div class="space-y-2.5 pt-1">
        <h4 class="font-bold text-stone-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
          <span>⏰</span> Waktu Membaca Talbiyah Mengikut Ibadah:
        </h4>

        <!-- Umrah -->
        <div class="p-3 bg-emerald-50 rounded-2xl border border-emerald-200/90 space-y-1">
          <div class="flex items-center gap-1.5 font-bold text-emerald-950 text-xs">
            <span>🕋</span> <span>1. Waktu Membaca Talbiyah untuk Umrah</span>
          </div>
          <ul class="text-[11px] sm:text-xs text-emerald-900 space-y-1 pl-1">
            <li class="flex items-start gap-1.5">
              <span class="text-emerald-700 font-bold shrink-0">• Mula:</span>
              <span>Ketika seseorang telah <b>berniat ihram di miqat</b>.</span>
            </li>
            <li class="flex items-start gap-1.5">
              <span class="text-rose-700 font-bold shrink-0">• Tamat:</span>
              <span>Ketika <b>mulai memasuki ibadah Tawaf</b> (sebelum menyentuh/mengucap salam pada Hajar Aswad atau memulai putaran pertama tawaf).</span>
            </li>
          </ul>
        </div>

        <!-- Haji -->
        <div class="p-3 bg-sky-50 rounded-2xl border border-sky-200/90 space-y-1">
          <div class="flex items-center gap-1.5 font-bold text-sky-950 text-xs">
            <span>⛺</span> <span>2. Waktu Membaca Talbiyah untuk Haji</span>
          </div>
          <ul class="text-[11px] sm:text-xs text-sky-900 space-y-1 pl-1">
            <li class="flex items-start gap-1.5">
              <span class="text-sky-700 font-bold shrink-0">• Mula:</span>
              <span>Ketika seseorang telah <b>berniat ihram haji di miqat</b>.</span>
            </li>
            <li class="flex items-start gap-1.5">
              <span class="text-rose-700 font-bold shrink-0">• Tamat:</span>
              <span>Berakhir ketika <b>mulai melempar Jumrah al-Kubra (Jumrah Aqabah)</b> pada tanggal <b>10 Zulhijah (Hari Raya Aidiladha)</b>, atau saat mulai tawaf atau bercukur mengikut mana yang didahulukan.</span>
            </li>
          </ul>
        </div>

        <!-- Hukum & Cara Melafazkan -->
        <div class="p-3 bg-amber-50 rounded-2xl border border-amber-200/90 space-y-1.5 text-xs text-amber-950 leading-relaxed">
          <div class="flex items-center gap-1.5 font-bold text-amber-950 text-xs">
            <span>⚖️</span> <span>Hukum dan Ketentuan Penting</span>
          </div>
          <p>
            • <b>Hukum:</b> Membaca talbiyah adalah <b>sunat muakkad (mustahab)</b>. Jika terlupa atau tertinggal, ia <b>tidak membatalkan</b> ibadah haji atau umrah.
          </p>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-0.5">
            <div class="p-2 bg-white rounded-xl border border-amber-200/60">
              <span class="font-bold text-stone-900">🧔 Jemaah Lelaki:</span>
              <p class="text-[11px] text-stone-600 mt-0.5">Disunatkan dengan <b>suara yang nyaring</b>.</p>
            </div>
            <div class="p-2 bg-white rounded-xl border border-amber-200/60">
              <span class="font-bold text-stone-900">🧕 Jemaah Wanita:</span>
              <p class="text-[11px] text-stone-600 mt-0.5">Dibaca dengan <b>suara perlahan</b> yang hanya didengari sendiri.</p>
            </div>
          </div>
        </div>
      </div>
    ` : `
      <!-- Story / Explanation -->
      <div class="text-xs text-stone-600 leading-relaxed pt-1">
        <b class="text-stone-800">Kisah & Sejarah:</b> ${story}
      </div>
    `;

    modal.innerHTML = `
      <div class="relative w-full max-w-lg bg-white rounded-3xl p-6 sm:p-7 text-stone-900 shadow-2xl space-y-4 border border-stone-200 max-h-[90vh] overflow-y-auto">
        
        <div class="flex items-center justify-between pb-3 border-b border-stone-100">
          <div>
            <span class="text-[10px] font-bold tracking-widest text-[#B45309] uppercase">BACAAN DOA & SIRAH</span>
            <h3 class="font-serif text-xl sm:text-2xl font-medium text-stone-900 mt-0.5">${title}</h3>
          </div>
          <button id="btn-close-dua-modal" class="p-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-600 transition cursor-pointer">✕</button>
        </div>

        <!-- Arabic Text -->
        <div class="text-right text-xl sm:text-2xl font-serif leading-loose text-stone-900 py-2 tracking-wide bg-amber-50/50 p-4 rounded-2xl border border-amber-200/60" dir="rtl">
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

        ${talbiyahDetailsHtml}

        <div class="flex flex-wrap items-center gap-2 pt-2 border-t border-stone-100">
          ${isTalbiyah ? `
            <button id="btn-modal-speak-arabic" class="flex-1 min-w-[140px] py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer active:scale-95">
              <span id="btn-modal-arabic-icon">🔊</span>
              <span id="btn-modal-arabic-text">Dengar Bunyi Arab</span>
            </button>
          ` : ''}
          <button id="btn-modal-speak" class="flex-1 min-w-[140px] py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer active:scale-95">
            <span>🗣️</span>
            <span>${isTalbiyah ? 'Dengar Terjemahan' : 'Dengar Bacaan'}</span>
          </button>
          <button id="btn-modal-done" class="flex-1 min-w-[110px] py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold transition cursor-pointer active:scale-95">
            Faham & Tutup
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    const close = () => {
      soundManager.stopTalbiyahAudio();
      modal.remove();
    };

    modal.querySelector('#btn-close-dua-modal')?.addEventListener('click', close);
    modal.querySelector('#btn-modal-done')?.addEventListener('click', close);
    modal.querySelector('#btn-modal-speak')?.addEventListener('click', () => {
      soundManager.stopTalbiyahAudio();
      soundManager.speakDua(arabic + '. ' + translation);
    });

    if (isTalbiyah) {
      const arabicBtn = modal.querySelector('#btn-modal-speak-arabic') as HTMLButtonElement;
      const arabicIcon = modal.querySelector('#btn-modal-arabic-icon') as HTMLElement;
      const arabicText = modal.querySelector('#btn-modal-arabic-text') as HTMLElement;
      arabicBtn?.addEventListener('click', () => {
        if (soundManager.isTalbiyahAudioPlaying()) {
          soundManager.stopTalbiyahAudio();
          if (arabicIcon) arabicIcon.innerText = '🔊';
          if (arabicText) arabicText.innerText = 'Dengar Bunyi Arab';
        } else {
          if (arabicIcon) arabicIcon.innerText = '⏸️';
          if (arabicText) arabicText.innerText = 'Hentikan Bunyi Arab';
          soundManager.playTalbiyahAudio(
            () => {
              if (arabicIcon) arabicIcon.innerText = '🔊';
              if (arabicText) arabicText.innerText = 'Dengar Bunyi Arab';
            },
            () => {
              if (arabicIcon) arabicIcon.innerText = '🔊';
              if (arabicText) arabicText.innerText = 'Dengar Bunyi Arab';
            }
          );
        }
      });
    }
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

          <!-- Peringatan Pantang Larang Ihram & Nota Khas -->
          <div class="p-3 bg-amber-50 rounded-2xl border border-amber-200/80 space-y-1.5">
            <h4 class="font-bold text-amber-900 text-xs flex items-center gap-1.5">
              <span>⚠️</span> 13 Pantang Larang Ihram & Nota Fiqh:
            </h4>
            <p>• <b>13 Perkara Dilarang:</b> Selepas niat ihram di Bir Ali, berkuat kuasa 13 larangan (pakaian berjahit, tutup kepala lelaki, tutup muka wanita, wangi-wangian, potong kuku/rambut, dll.).</p>
            <p>• <b>Nota Cawat:</b> Jika pakai cawat/pelapik, <b>TIDAK BOLEH diikat mati</b>; mesti disimpul mudah buka (<b>butterfly knot</b>).</p>
            <p>• <b>Wangian Wanita:</b> Jika pakaian ihram wanita berwangian sebelum niat, <b>tidak boleh dibuka selepas niat</b>. Jika dibuka, tidak boleh dipakai semula dan <b>perlu tukar baju baharu</b> yang tidak berwangian.</p>
            <button id="guide-open-larangan-btn" class="mt-1 px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-[11px] transition cursor-pointer flex items-center gap-1">
              <span>⚠️</span> Papar 13 Pantang Larang Lengkap ➔
            </button>
          </div>

          <!-- Panduan Waktu Membaca Talbiyah & Bunyi Arab -->
          <div class="p-3 bg-emerald-50 rounded-2xl border border-emerald-200/80 space-y-1.5">
            <h4 class="font-bold text-emerald-900 text-xs flex items-center gap-1.5">
              <span>📿</span> Waktu Membaca Talbiyah & Bunyi Arab:
            </h4>
            <p>• <b>Umrah:</b> Mula selepas berniat ihram di miqat sehingga mula masuk ibadah Tawaf.</p>
            <p>• <b>Haji:</b> Mula selepas niat ihram haji di miqat sehingga mula melempar Jumrah Aqabah (10 Zulhijah).</p>
            <p>• <b>Hukum & Cara Melafazkan:</b> Sunat muakkad. Disunatkan suara nyaring bagi jemaah lelaki dan suara perlahan bagi jemaah wanita.</p>
            <button id="guide-open-talbiyah-btn" class="mt-1 px-3 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-[11px] transition cursor-pointer flex items-center gap-1">
              <span>📿</span> Buka Panduan & Bunyi Arab Talbiyah ➔
            </button>
          </div>

          <h4 class="font-bold text-[#B45309] text-sm pt-1">Alur Lengkap Ibadah Dari Madinah ke Makkah:</h4>
          <ol class="list-decimal pl-5 space-y-1">
            <li><b>Ziarah Dalam Madinah:</b> Berjalan kaki menelusuri sejarah Rasulullah ﷺ & sahabat (Bas tidak masuk kawasan pejalan kaki).</li>
            <li><b>Ziarah Luar Madinah:</b> Menaiki bas ke Masjid Quba, Uhud, Ladang Kurma, Khandak, Qiblatain.</li>
            <li><b>Miqat di Masjid Bir Ali:</b> Mandi & pakai ihram, solat sunat dan lafazkan Niat Umrah.</li>
            <li><b>Perjalanan Bas ke Makkah:</b> Bertalbiyah sepanjang perjalanan lebuh raya (450km) dari miqat hingga mula tawaf.</li>
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
    modal.querySelector('#guide-open-larangan-btn')?.addEventListener('click', () => {
      close();
      this.showLaranganIhramModal();
    });
    modal.querySelector('#guide-open-talbiyah-btn')?.addEventListener('click', () => {
      close();
      this.showTalbiyahModal();
    });
  }

  /**
   * 13 Pantang Larang Ihram & Nota Fiqh Khas (Cawat & Wangian Wanita)
   */
  public showLaranganIhramModal() {
    const modal = document.createElement('div');
    modal.className = 'interactive-ui fixed inset-0 z-50 flex items-center justify-center bg-stone-900/65 backdrop-blur-md p-4 overflow-y-auto';
    modal.innerHTML = `
      <div class="relative w-full max-w-xl max-h-[90vh] bg-white border border-stone-200 rounded-3xl p-5 sm:p-7 text-stone-900 shadow-2xl flex flex-col space-y-4 overflow-hidden">
        
        <!-- Header -->
        <div class="flex items-center justify-between pb-3 border-b border-stone-100 shrink-0">
          <div class="flex items-center gap-2.5">
            <span class="text-2xl p-2 rounded-2xl bg-amber-100 text-amber-800">⚠️</span>
            <div>
              <h3 class="font-serif text-lg sm:text-xl font-bold text-stone-900">13 Pantang Larang Ihram</h3>
              <p class="text-[11px] text-stone-500">Berkuat kuasa sejurus selepas berniat di Miqat sehingga Tahallul</p>
            </div>
          </div>
          <button id="close-larangan-btn" class="p-2 rounded-xl bg-stone-100 text-stone-600 hover:bg-stone-200 transition cursor-pointer">✕</button>
        </div>

        <!-- Scrollable Content -->
        <div class="space-y-4 overflow-y-auto pr-1 text-xs leading-relaxed text-stone-700">
          
          <!-- KOTAK NOTA KHAS / PANDUAN UTAMA FIQH (YANG DIWAJIBKAN) -->
          <div class="p-3.5 sm:p-4 bg-gradient-to-br from-amber-50 to-orange-50/60 rounded-2xl border-2 border-amber-300/80 shadow-sm space-y-3">
            <div class="flex items-center gap-2 text-[#B45309] font-bold text-xs uppercase tracking-wider">
              <span>📌</span> NOTA KHAS & PANDUAN PENTING FIQH
            </div>

            <!-- 1. HUKUM CAWAT -->
            <div class="p-3 bg-white/95 rounded-xl border border-amber-200/80 shadow-sm space-y-1.5">
              <div class="font-bold text-xs text-stone-900 flex items-center gap-1.5">
                <span class="text-base">🩲</span> 1. Hukum Memakai Cawat / Pelapik Ihram (Bagi yang Ada Keuzuran)
              </div>
              <p class="text-[11.5px] text-stone-600">
                Bagi jemaah (khususnya kaum lelaki yang mempunyai keuzuran seperti kerap terkencing, kencing tidak lawas, buasir, luka dsb.) yang perlu memakai kain cawat / lampin / pelapik:
              </p>
              <div class="pl-2.5 border-l-3 border-rose-500 py-1 space-y-1 bg-rose-50/50 rounded-r-lg">
                <p class="text-[12px] font-bold text-rose-700">❌ TIDAK BOLEH DIIKAT MATI (simpul mati / 'uqdah muhkamah).</p>
                <p class="text-[12px] font-bold text-emerald-800">✅ WAJIB / PERLU dibuat simpul mudah buka (seperti ikatan rama-rama / butterfly knot) atau disematkan pin tanpa ikatan mati.</p>
              </div>
              <p class="text-[10.5px] text-stone-500 italic pt-0.5">
                *Penjelasan Mazhab Syafi'i & Fatwa Haji: Ikatan mati menjadikannya dihukumkan sama seperti pakaian berjahit/bercantum yang dilarang bagi lelaki dalam ihram. Simpul mudah buka (butterfly) dibenarkan dan dimaafkan kerana tiada jahitan mahupun simpulan kekal.
              </p>
            </div>

            <!-- 2. HUKUM WANGIAN WANITA -->
            <div class="p-3 bg-white/95 rounded-xl border border-amber-200/80 shadow-sm space-y-1.5">
              <div class="font-bold text-xs text-stone-900 flex items-center gap-1.5">
                <span class="text-base">🌸</span> 2. Hukum Wangi-wangian pada Pakaian Ihram Wanita
              </div>
              <p class="text-[11.5px] text-stone-600">
                Bagi jemaah wanita yang mengenakan wangi-wangian pada baju/kain ihramnya sebelum berniat ihram: Bauan yang berkekalan dimaafkan selagi pakaian tersebut terus dipakai pada badan.
              </p>
              <div class="pl-2.5 border-l-3 border-rose-500 py-1 space-y-1 bg-rose-50/50 rounded-r-lg">
                <p class="text-[12px] font-bold text-rose-700">❌ TIDAK BOLEH dibuka atau ditanggalkan pakaian tersebut selepas berniat ihram jika berhasrat memakainya semula.</p>
                <p class="text-[12px] font-semibold text-amber-800">⚠️ Sekiranya dibuka/ditanggalkan (contohnya ke tandas atau mandi), pakaian berwangian itu TIDAK BOLEH dipakai semula sama sekali.</p>
                <p class="text-[12px] font-bold text-emerald-800">✅ Justeru, jika dibuka, jemaah wanita PERLU MENUKAR KEPADA BAJU BAHARU yang bersih dan tidak berbau wangi!</p>
              </div>
              <p class="text-[10.5px] text-stone-500 italic pt-0.5">
                *Penjelasan Fiqh: Memakai semula pakaian yang berbau wangi dikira sebagai memulakan pemakaian wangi-wangian baharu (ibtida' al-isti'mal) semasa dalam keadaan berihram, yang mewajibkan pembayaran Dam (denda).
              </p>
            </div>
          </div>

          <!-- SENARAI LENGKAP 13 PANTANG LARANG IHRAM -->
          <div class="space-y-3 pt-1">
            <h4 class="font-bold text-stone-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
              <span>📋</span> Senarai Lengkap 13 Pantang Larang Ihram
            </h4>

            <!-- Kategori 1: Pakaian -->
            <div class="p-3 bg-stone-50 rounded-2xl border border-stone-200/70 space-y-1.5">
              <span class="text-[11px] font-bold text-[#B45309] uppercase tracking-wider">A. Larangan Pakaian (3 Perkara)</span>
              <ul class="space-y-1 pl-1">
                <li><b>1.</b> Memakai pakaian berjahit, bercantum atau bersarung bagi <b>lelaki</b> (seperti kemeja, seluar, seluar dalam, stoking).</li>
                <li><b>2.</b> Menutup kepala atau sebahagian daripadanya dengan sesuatu yang melekat (seperti kopiah, songkok, topi, kain serban) bagi <b>lelaki</b>. <i>(Memayungi kepala dengan payung dibolehkan)</i>.</li>
                <li><b>3.</b> Menutup muka (seperti memakai purdah atau niqab) bagi <b>wanita</b>. <i>(Pelitup muka perubatan hanya dimaafkan jika ada keperluan kesihatan mendesak dengan syarat tertentu)</i>.</li>
              </ul>
            </div>

            <!-- Kategori 2: Tubuh Badan & Kecantikan -->
            <div class="p-3 bg-stone-50 rounded-2xl border border-stone-200/70 space-y-1.5">
              <span class="text-[11px] font-bold text-[#B45309] uppercase tracking-wider">B. Larangan Kecantikan & Tubuh Badan (5 Perkara)</span>
              <ul class="space-y-1 pl-1">
                <li><b>4.</b> Memakai sarung tangan pada kedua-dua belah tangan bagi <b>lelaki dan wanita</b>.</li>
                <li><b>5.</b> Memakai bau-bauan/wangi-wangian sama ada pada badan, pakaian, makanan, minuman, atau sengaja menghidunya.</li>
                <li><b>6.</b> Memakai minyak pada kepala atau janggut atau mana-mana bulu muka.</li>
                <li><b>7.</b> Menanggalkan, mencabut, menggunting rambut atau bulu daripada mana-mana anggota badan.</li>
                <li><b>8.</b> Memotong, mengerat atau membuang kuku pada tangan atau kaki.</li>
              </ul>
            </div>

            <!-- Kategori 3: Alam Sekitar & Haiwan -->
            <div class="p-3 bg-stone-50 rounded-2xl border border-stone-200/70 space-y-1.5">
              <span class="text-[11px] font-bold text-[#B45309] uppercase tracking-wider">C. Larangan Alam & Haiwan (2 Perkara)</span>
              <ul class="space-y-1 pl-1">
                <li><b>9.</b> Menebang, memotong, mencantas, mematah atau mencabut pokok/tumbuhan di Tanah Haram yang tumbuh sendiri.</li>
                <li><b>10.</b> Memburu, membunuh, mencederakan atau mengganggu binatang buruan darat yang halal dimakan di mana sahaja.</li>
              </ul>
            </div>

            <!-- Kategori 4: Perkahwinan & Syahwat -->
            <div class="p-3 bg-stone-50 rounded-2xl border border-stone-200/70 space-y-1.5">
              <span class="text-[11px] font-bold text-[#B45309] uppercase tracking-wider">D. Larangan Hubungan Suami Isteri (3 Perkara)</span>
              <ul class="space-y-1 pl-1">
                <li><b>11.</b> Berkahwin, mengahwinkan orang lain, atau menerima wakil kahwin (akad nikah tidak sah dan berdosa).</li>
                <li><b>12.</b> Melakukan mukadimah persetubuhan (seperti bercumbu, berkucupan, sentuhan berahi).</li>
                <li><b>13.</b> Melakukan persetubuhan (jimak) suami isteri. <i>(Membatalkan Umrah jika dilakukan sebelum Tahallul dan wajib membayar Dam serta mengqada' umrah)</i>.</li>
              </ul>
            </div>

            <!-- Ringkasan Dam -->
            <div class="p-3 bg-emerald-50 rounded-2xl border border-emerald-200/80 text-[11px] text-emerald-900 space-y-1">
              <span class="font-bold text-emerald-950 uppercase tracking-wide">💡 Jenis-jenis Dam Jika Melanggar Pantang Larang:</span>
              <p>• <b>Dam Takhyir & Taqdir:</b> (Pilihan: Menyembelih seekor kambing ATAU memberi makan 6 orang fakir miskin 1/2 gantang setiap seorang ATAU berpuasa 3 hari) — bagi kesalahan pakaian, wangian, potong kuku/rambut.</p>
              <p>• <b>Dam Tertib & Ta'dil:</b> Bagi kesalahan jimak yang merosakkan ibadah umrah.</p>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="pt-3 border-t border-stone-100 flex justify-end shrink-0">
          <button id="larangan-ok-btn" class="px-5 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs transition cursor-pointer">
            Faham & Patuhi Pantang Larang
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    const close = () => modal.remove();
    modal.querySelector('#close-larangan-btn')?.addEventListener('click', close);
    modal.querySelector('#larangan-ok-btn')?.addEventListener('click', close);
  }

  /**
   * Dedicated Comprehensive Modal for Talbiyah Recitation, Audio ("Bunyi Arab"), Timing & Fiqh Ruling
   */
  public showTalbiyahModal() {
    const modal = document.createElement('div');
    modal.className = 'interactive-ui fixed inset-0 z-50 flex items-center justify-center bg-stone-900/65 backdrop-blur-md p-3 sm:p-5 overflow-y-auto';

    modal.innerHTML = `
      <div class="relative w-full max-w-xl bg-white border border-stone-200 rounded-3xl p-5 sm:p-7 text-stone-900 shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto">
        
        <!-- Header -->
        <div class="flex items-center justify-between pb-3 border-b border-stone-100">
          <div>
            <span class="text-[10px] font-bold tracking-widest text-[#B45309] uppercase bg-amber-100/70 text-amber-900 px-2 py-0.5 rounded-md">BACAAN AGUNG IHRAM</span>
            <h3 class="font-serif text-xl sm:text-2xl font-bold text-stone-900 mt-1">Panduan Bacaan & Waktu Talbiyah</h3>
          </div>
          <button id="close-talbiyah-btn" class="p-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-600 transition cursor-pointer">✕</button>
        </div>

        <!-- Arabic Text Banner -->
        <div class="bg-gradient-to-br from-amber-50 to-orange-50/40 p-4 sm:p-5 rounded-2xl border border-amber-200/80 shadow-sm space-y-2">
          <div class="text-right text-xl sm:text-2xl font-serif leading-loose text-stone-900 tracking-wide" dir="rtl">
            لَبَّيْكَ اللَّهُمَّ لَبَّيْكَ، لَبَّيْكَ لاَ شَرِيكَ لَكَ لَبَّيْكَ، إِنَّ الْحَمْدَ وَالنِّعْمَةَ لَكَ وَالْمُلْكَ، لاَ شَرِيكَ لَكَ
          </div>
          <div class="text-xs sm:text-sm text-amber-950 font-medium italic pt-2 border-t border-amber-200/60">
            <b>Sebutan Rumi:</b> Labbaik Allahumma labbaik, labbaika laa syariika laka labbaik. Innal-hamda wan-ni'mata laka wal-mulk, laa syariika lak.
          </div>
        </div>

        <!-- Translation -->
        <div class="text-xs sm:text-sm text-stone-700 leading-relaxed bg-[#FAF7F2] p-3.5 rounded-xl border border-stone-200/80">
          <b class="text-stone-900">Maksud:</b> "Hamba-Mu datang menyahut panggilan-Mu ya Allah, hamba-Mu datang. Tiada sekutu bagi-Mu, hamba-Mu datang. Sesungguhnya segala puji, nikmat dan kerajaan adalah milik-Mu semata-mata, tiada sekutu bagi-Mu."
        </div>

        <!-- Audio Player Section ("Bunyi Arab") -->
        <div class="p-3.5 bg-gradient-to-r from-amber-500/10 via-amber-600/10 to-amber-700/10 rounded-2xl border border-amber-300/80 space-y-2.5">
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold text-amber-950 flex items-center gap-1.5">
              <span>🎧</span> Bunyi Sebutan Bahasa Arab & Terjemahan:
            </span>
            <span id="talbiyah-audio-status-badge" class="text-[10px] font-semibold text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded-full">Sedia Dimainkan</span>
          </div>
          <div class="flex flex-wrap items-center gap-2">
            <button id="btn-talbiyah-modal-play-arabic" class="flex-1 min-w-[170px] py-2.5 px-3 rounded-xl bg-amber-600 hover:bg-amber-500 active:scale-95 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition cursor-pointer">
              <span id="talbiyah-modal-arabic-icon">🔊</span>
              <span id="talbiyah-modal-arabic-text">Mainkan Bunyi Arab</span>
            </button>
            <button id="btn-talbiyah-modal-play-malay" class="flex-1 min-w-[150px] py-2.5 px-3 rounded-xl bg-stone-100 hover:bg-stone-200 active:scale-95 text-stone-800 text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer">
              <span>🗣️</span>
              <span>Dengar Terjemahan</span>
            </button>
          </div>
        </div>

        <!-- Waktu Membaca Talbiyah: Umrah vs Haji -->
        <div class="space-y-3 pt-1">
          <h4 class="font-bold text-stone-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
            <span>⏰</span> Waktu Membaca Talbiyah Mengikut Ibadah:
          </h4>

          <!-- 1. Waktu Membaca Talbiyah untuk Umrah -->
          <div class="p-3.5 bg-emerald-50/80 rounded-2xl border border-emerald-200/90 space-y-1.5">
            <div class="flex items-center gap-2">
              <span class="text-base">🕋</span>
              <h5 class="font-bold text-emerald-950 text-xs sm:text-sm">1. Waktu Membaca Talbiyah untuk Umrah</h5>
            </div>
            <ul class="text-xs text-emerald-900 space-y-1 pl-1">
              <li class="flex items-start gap-1.5">
                <span class="text-emerald-700 font-bold shrink-0">• Mula:</span>
                <span>Ketika seseorang telah <b>berniat ihram di miqat</b>.</span>
              </li>
              <li class="flex items-start gap-1.5">
                <span class="text-rose-700 font-bold shrink-0">• Tamat:</span>
                <span>Ketika <b>mulai memasuki ibadah Tawaf</b> (sebelum menyentuh/mengucap salam pada Hajar Aswad atau memulai putaran pertama tawaf).</span>
              </li>
            </ul>
          </div>

          <!-- 2. Waktu Membaca Talbiyah untuk Haji -->
          <div class="p-3.5 bg-sky-50/80 rounded-2xl border border-sky-200/90 space-y-1.5">
            <div class="flex items-center gap-2">
              <span class="text-base">⛺</span>
              <h5 class="font-bold text-sky-950 text-xs sm:text-sm">2. Waktu Membaca Talbiyah untuk Haji</h5>
            </div>
            <ul class="text-xs text-sky-900 space-y-1 pl-1">
              <li class="flex items-start gap-1.5">
                <span class="text-sky-700 font-bold shrink-0">• Mula:</span>
                <span>Ketika seseorang telah <b>berniat ihram haji di miqat</b>.</span>
              </li>
              <li class="flex items-start gap-1.5">
                <span class="text-rose-700 font-bold shrink-0">• Tamat:</span>
                <span>Berakhir ketika <b>mulai melempar Jumrah al-Kubra (Jumrah Aqabah)</b> pada tanggal <b>10 Zulhijah (Hari Raya Aidiladha)</b>, atau saat mulai tawaf atau bercukur mengikut mana yang didahulukan.</span>
              </li>
            </ul>
          </div>
        </div>

        <!-- Hukum dan Ketentuan Penting -->
        <div class="p-4 bg-amber-50/90 rounded-2xl border border-amber-200/90 space-y-2">
          <div class="flex items-center gap-2">
            <span class="text-base">⚖️</span>
            <h5 class="font-bold text-amber-950 text-xs sm:text-sm">Hukum dan Ketentuan Penting</h5>
          </div>
          <div class="text-xs text-amber-950 space-y-2 leading-relaxed">
            <p>
              • <b>Hukum:</b> Membaca talbiyah adalah <b>sunat muakkad (mustahab)</b>. Jika terlupa atau tertinggal, ia <b>tidak membatalkan</b> ibadah haji atau umrah.
            </p>
            <div>
              • <b>Cara Melafazkan:</b>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1.5">
                <div class="p-2.5 bg-white rounded-xl border border-amber-200/70 shadow-sm">
                  <div class="flex items-center gap-1 font-bold text-stone-900">
                    <span>🧔</span> <span>Jemaah Lelaki:</span>
                  </div>
                  <p class="text-[11px] text-stone-600 mt-1">Disunatkan mengerjakannya dengan <b>suara yang nyaring</b>.</p>
                </div>
                <div class="p-2.5 bg-white rounded-xl border border-amber-200/70 shadow-sm">
                  <div class="flex items-center gap-1 font-bold text-stone-900">
                    <span>🧕</span> <span>Jemaah Wanita:</span>
                  </div>
                  <p class="text-[11px] text-stone-600 mt-1">Dibaca dengan <b>suara perlahan</b> yang hanya didengari oleh diri sendiri.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Footer / Action Buttons -->
        <div class="pt-2 border-t border-stone-100 flex items-center gap-2">
          <button id="btn-talbiyah-modal-done" class="w-full py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs transition cursor-pointer">
            Faham & Tutup
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    const close = () => {
      soundManager.stopTalbiyahAudio();
      modal.remove();
    };

    modal.querySelector('#close-talbiyah-btn')?.addEventListener('click', close);
    modal.querySelector('#btn-talbiyah-modal-done')?.addEventListener('click', close);

    const arabicPlayBtn = modal.querySelector('#btn-talbiyah-modal-play-arabic') as HTMLButtonElement;
    const arabicIcon = modal.querySelector('#talbiyah-modal-arabic-icon') as HTMLElement;
    const arabicText = modal.querySelector('#talbiyah-modal-arabic-text') as HTMLElement;
    const statusBadge = modal.querySelector('#talbiyah-audio-status-badge') as HTMLElement;

    arabicPlayBtn?.addEventListener('click', () => {
      if (soundManager.isTalbiyahAudioPlaying()) {
        soundManager.stopTalbiyahAudio();
        if (arabicIcon) arabicIcon.innerText = '🔊';
        if (arabicText) arabicText.innerText = 'Mainkan Bunyi Arab';
        if (statusBadge) {
          statusBadge.innerText = 'Dijeda / Berhenti';
          statusBadge.className = 'text-[10px] font-semibold text-stone-600 bg-stone-100 px-2.5 py-0.5 rounded-full';
        }
      } else {
        if (arabicIcon) arabicIcon.innerText = '⏸️';
        if (arabicText) arabicText.innerText = 'Hentikan Bunyi Arab';
        if (statusBadge) {
          statusBadge.innerText = 'Sedang Mengalunkan Talbiyah 🎵';
          statusBadge.className = 'text-[10px] font-semibold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full animate-pulse';
        }
        soundManager.playTalbiyahAudio(
          () => {
            if (arabicIcon) arabicIcon.innerText = '🔊';
            if (arabicText) arabicText.innerText = 'Mainkan Bunyi Arab';
            if (statusBadge) {
              statusBadge.innerText = 'Selesai Dimainkan';
              statusBadge.className = 'text-[10px] font-semibold text-stone-600 bg-stone-100 px-2.5 py-0.5 rounded-full';
            }
          },
          () => {
            if (arabicIcon) arabicIcon.innerText = '🔊';
            if (arabicText) arabicText.innerText = 'Mainkan Bunyi Arab';
            if (statusBadge) {
              statusBadge.innerText = 'Sedia Dimainkan';
              statusBadge.className = 'text-[10px] font-semibold text-stone-600 bg-stone-100 px-2.5 py-0.5 rounded-full';
            }
          }
        );
      }
    });

    modal.querySelector('#btn-talbiyah-modal-play-malay')?.addEventListener('click', () => {
      soundManager.stopTalbiyahAudio();
      if (arabicIcon) arabicIcon.innerText = '🔊';
      if (arabicText) arabicText.innerText = 'Mainkan Bunyi Arab';
      if (statusBadge) {
        statusBadge.innerText = 'Membaca Terjemahan...';
        statusBadge.className = 'text-[10px] font-semibold text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded-full';
      }
      soundManager.speakDua(
        'Lafaz Talbiyah. Labbaik Allahumma labbaik, labbaika laa syariika laka labbaik. Innal-hamda wan-ni\'mata laka wal-mulk, laa syariika lak. ' +
        'Maksudnya: Hamba-Mu datang menyahut panggilan-Mu ya Allah, hamba-Mu datang. Tiada sekutu bagi-Mu, hamba-Mu datang. ' +
        'Sesungguhnya segala puji, nikmat dan kerajaan adalah milik-Mu semata-mata, tiada sekutu bagi-Mu.'
      );
    });
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

  public showNotification(message: string) {
    this.showSaveToast(message);
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

  /**
   * Popup Modal to view Rombongan / Group Members & Live Online Players
   */
  public showRosterModal() {
    const existing = document.getElementById('roster-detail-modal');
    if (existing) {
      existing.remove();
      this.isRosterModalOpen = false;
      return;
    }

    this.isRosterModalOpen = true;
    const modal = document.createElement('div');
    modal.id = 'roster-detail-modal';
    modal.className = 'interactive-ui fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 backdrop-blur-md p-4 overflow-y-auto';

    modal.innerHTML = `
      <div class="relative w-full max-w-lg bg-white border border-stone-200 rounded-3xl p-5 sm:p-6 text-stone-900 shadow-2xl space-y-3.5 max-h-[90vh] flex flex-col">
        
        <!-- Header -->
        <div class="flex items-center justify-between pb-2 border-b border-stone-100 shrink-0">
          <div class="flex items-center gap-2.5">
            <span class="w-3.5 h-3.5 rounded-full border border-stone-300 shrink-0" style="background-color: ${this.localGroupColor};"></span>
            <div>
              <h3 class="font-serif text-lg font-bold text-stone-900 leading-tight">Jemaah & Pelayan Realtime</h3>
              <p class="text-[11px] text-stone-500 font-sans">Kumpulan: <b>${this.localGroupName}</b> • Dunia Bersama (Multiplayer)</p>
            </div>
          </div>
          <button id="close-roster-btn" class="p-2 rounded-xl bg-stone-100 text-stone-600 hover:bg-stone-200 transition cursor-pointer">✕</button>
        </div>

        <!-- Realtime Server Status Banner -->
        <div id="roster-supabase-status-banner" class="shrink-0 p-3 rounded-2xl ${this.isSupabaseConnected ? 'bg-emerald-50 border border-emerald-200' : 'bg-amber-50 border border-amber-200'} flex items-center justify-between gap-2">
          <div class="flex items-center gap-2.5 min-w-0">
            <span class="w-2.5 h-2.5 rounded-full ${this.isSupabaseConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'} shrink-0 shadow-sm"></span>
            <div class="truncate">
              <div class="font-bold text-xs ${this.isSupabaseConnected ? 'text-emerald-950' : 'text-amber-950'} truncate">
                ${this.isSupabaseConnected ? 'Pelayan Supabase Realtime: Bersambung' : 'Mod Simulasi Luar Talian'}
              </div>
              <div class="text-[10px] ${this.isSupabaseConnected ? 'text-emerald-700' : 'text-amber-700'} truncate">
                ${this.isSupabaseConnected ? `Saluran: public-mataf-world • ${this.realOnlineCount} pemain dikesan` : 'Supabase belum aktif atau menggunakan jemaah simulasi'}
              </div>
            </div>
          </div>
          <button id="roster-reconnect-quick-btn" class="px-2.5 py-1 rounded-xl ${this.isSupabaseConnected ? 'bg-emerald-100 hover:bg-emerald-200 text-emerald-800' : 'bg-amber-600 hover:bg-amber-700 text-white'} text-[10px] font-bold shrink-0 cursor-pointer transition">
            ${this.isSupabaseConnected ? 'Segar Semula' : 'Sambung'}
          </button>
        </div>

        <!-- Navigation Tabs -->
        <div class="shrink-0 flex items-center gap-1 p-1 bg-stone-100 rounded-2xl text-xs font-bold">
          <button id="tab-btn-online" class="flex-1 py-1.5 px-2 rounded-xl transition cursor-pointer text-center ${this.activeRosterTab === 'online' ? 'bg-white shadow-sm text-stone-900 font-extrabold' : 'text-stone-500 hover:text-stone-700'}">
            🌐 Online (<span id="tab-count-online">${this.realOnlineCount}</span>)
          </button>
          <button id="tab-btn-group" class="flex-1 py-1.5 px-2 rounded-xl transition cursor-pointer text-center ${this.activeRosterTab === 'group' ? 'bg-white shadow-sm text-stone-900 font-extrabold' : 'text-stone-500 hover:text-stone-700'}">
            👥 Rombongan (<span id="tab-count-group">${this.groupMembers.length + 1}</span>)
          </button>
          <button id="tab-btn-bots" class="py-1.5 px-2.5 rounded-xl transition cursor-pointer text-center ${this.activeRosterTab === 'bots' ? 'bg-white shadow-sm text-stone-900 font-extrabold' : 'text-stone-500 hover:text-stone-700'}">
            🤖 Simulasi
          </button>
          <button id="tab-btn-settings" class="py-1.5 px-2.5 rounded-xl transition cursor-pointer text-center ${this.activeRosterTab === 'settings' ? 'bg-white shadow-sm text-stone-900 font-extrabold' : 'text-stone-500 hover:text-stone-700'}">
            ⚙️ Info
          </button>
        </div>

        <!-- Tab Content (Scrollable Container) -->
        <div id="roster-tab-content-container" class="flex-1 overflow-y-auto pr-1 space-y-3 min-h-[200px]">
          <!-- Injected dynamically in refreshRosterModalContent() -->
        </div>

        <!-- Footer Close Button -->
        <button id="roster-ok-btn" class="shrink-0 w-full py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs cursor-pointer shadow-sm">
          Faham & Tutup
        </button>
      </div>
    `;

    document.body.appendChild(modal);

    const close = () => {
      modal.remove();
      this.isRosterModalOpen = false;
    };
    modal.querySelector('#close-roster-btn')?.addEventListener('click', close);
    modal.querySelector('#roster-ok-btn')?.addEventListener('click', close);

    // Reconnect quick button
    modal.querySelector('#roster-reconnect-quick-btn')?.addEventListener('click', () => {
      this.onReconnectSupabaseCallback?.();
    });

    // Tab buttons
    modal.querySelector('#tab-btn-online')?.addEventListener('click', () => {
      this.activeRosterTab = 'online';
      this.refreshRosterModalContent();
    });
    modal.querySelector('#tab-btn-group')?.addEventListener('click', () => {
      this.activeRosterTab = 'group';
      this.refreshRosterModalContent();
    });
    modal.querySelector('#tab-btn-bots')?.addEventListener('click', () => {
      this.activeRosterTab = 'bots';
      this.refreshRosterModalContent();
    });
    modal.querySelector('#tab-btn-settings')?.addEventListener('click', () => {
      this.activeRosterTab = 'settings';
      this.refreshRosterModalContent();
    });

    this.refreshRosterModalContent();
  }

  private refreshRosterModalContent() {
    const modal = document.getElementById('roster-detail-modal');
    if (!modal) return;

    // 1. Update tab button states & counters
    const tabOnline = modal.querySelector('#tab-btn-online') as HTMLElement;
    const tabGroup = modal.querySelector('#tab-btn-group') as HTMLElement;
    const tabBots = modal.querySelector('#tab-btn-bots') as HTMLElement;
    const tabSettings = modal.querySelector('#tab-btn-settings') as HTMLElement;

    const countOnlineEl = modal.querySelector('#tab-count-online') as HTMLElement;
    const countGroupEl = modal.querySelector('#tab-count-group') as HTMLElement;

    if (countOnlineEl) countOnlineEl.innerText = `${this.realOnlineCount}`;
    if (countGroupEl) countGroupEl.innerText = `${this.groupMembers.length + 1}`;

    const updateTabStyle = (el: HTMLElement | null, isActive: boolean) => {
      if (!el) return;
      if (isActive) {
        el.className = 'flex-1 py-1.5 px-2 rounded-xl transition cursor-pointer text-center bg-white shadow-sm text-stone-900 font-extrabold';
      } else {
        el.className = 'flex-1 py-1.5 px-2 rounded-xl transition cursor-pointer text-center text-stone-500 hover:text-stone-700';
      }
    };

    updateTabStyle(tabOnline, this.activeRosterTab === 'online');
    updateTabStyle(tabGroup, this.activeRosterTab === 'group');
    updateTabStyle(tabBots, this.activeRosterTab === 'bots');
    updateTabStyle(tabSettings, this.activeRosterTab === 'settings');

    // 2. Render Tab Content
    const contentEl = modal.querySelector('#roster-tab-content-container') as HTMLElement;
    if (!contentEl) return;

    const realOtherPlayers = this.allPlayersList.filter(p => !p.isBot);
    const bots = this.allPlayersList.filter(p => p.isBot);

    const getZoneLabel = (x: number, _z: number, stage?: string) => {
      if (x < -50) return '📍 Madinah (Masjid Nabawi / Ziarah)';
      if (stage === 'sai') return '📍 Makkah (Mas\'a Safa-Marwah)';
      if (stage === 'solat_zamzam') return '📍 Makkah (Makam Ibrahim / Zamzam)';
      return '📍 Makkah (Mataf Kaabah)';
    };

    let html = '';

    if (this.activeRosterTab === 'online') {
      html += `
        <div class="space-y-2">
          <div class="p-2.5 rounded-2xl bg-stone-50 border border-stone-200 text-stone-600 text-[11px] leading-relaxed flex items-start gap-2">
            <span class="text-base shrink-0">🌐</span>
            <div>
              <b>Semua Pemain Sebenar:</b> Senarai jemaah manusia yang sedang aktif serentak di pelayan. Jika anda berada di Madinah dan rakan di Makkah, klik <b>Pergi ke Jemaah</b> untuk teleport ke kedudukan mereka!
            </div>
          </div>

          <!-- Local Player Card -->
          <div class="flex items-center justify-between p-3 rounded-2xl bg-amber-50/80 border border-amber-200">
            <div class="flex items-center gap-2.5 truncate">
              <span class="text-lg">${this.isLocalMutawwif ? '🚩' : (this.localPlayerRole === 'mutawwif' ? '🚩' : '👤')}</span>
              <div class="truncate">
                <div class="font-bold text-xs text-stone-900 truncate flex items-center gap-1.5">
                  <span>${this.localPlayerName || 'Anda'}</span>
                  <span class="px-1.5 py-0.2 rounded bg-amber-200 text-amber-900 text-[9px] font-bold">ANDA</span>
                  <span class="px-1.5 py-0.2 rounded text-[9px] font-bold text-white" style="background-color: ${this.localGroupColor};">${this.localGroupName}</span>
                </div>
                <div class="text-[10px] text-stone-500 mt-0.5">
                  ${this.isLocalMutawwif ? 'Ketua Mutawwif' : 'Jemaah'} • ${getZoneLabel(this.localPlayerPos.x, this.localPlayerPos.z)}
                </div>
              </div>
            </div>
            <div class="text-right shrink-0">
              <span class="px-2 py-0.5 rounded-full bg-emerald-100 text-[10px] font-bold text-emerald-800">
                Di Sini
              </span>
            </div>
          </div>
      `;

      if (realOtherPlayers.length === 0) {
        html += `
          <div class="p-4 rounded-2xl bg-stone-50 border border-stone-200 text-center space-y-1.5 my-2">
            <div class="text-2xl">👥</div>
            <div class="text-xs font-bold text-stone-800">Hanya Anda Sedang Dalam Talian</div>
            <div class="text-[11px] text-stone-500 leading-relaxed max-w-sm mx-auto">
              Buka pautan web ini di telefon atau peranti rakan lain untuk melihat mereka muncul di sini dalam masa nyata (Realtime)!
            </div>
          </div>
        `;
      } else {
        html += `<div class="space-y-2 mt-2">`;
        realOtherPlayers.forEach((p) => {
          const dx = p.x - this.localPlayerPos.x;
          const dz = p.z - this.localPlayerPos.z;
          const dist = Math.sqrt(dx * dx + dz * dz);
          const isLeader = p.role === 'mutawwif';
          const zoneText = getZoneLabel(p.x, p.z, p.stage);

          html += `
            <div class="flex items-center justify-between p-3 rounded-2xl bg-white border border-stone-200 shadow-sm gap-2">
              <div class="flex items-center gap-2.5 truncate min-w-0">
                <span class="text-lg shrink-0">${isLeader ? '🚩' : (p.gender === 'male' ? '👳‍♂️' : '🧕')}</span>
                <div class="truncate">
                  <div class="font-bold text-xs text-stone-900 truncate flex items-center gap-1.5">
                    <span class="truncate">${p.name}</span>
                    <span class="px-1.5 py-0.2 rounded text-[9px] font-bold text-white shrink-0" style="background-color: ${p.groupColor || '#3B82F6'};">${p.groupName || 'Solo'}</span>
                  </div>
                  <div class="text-[10px] text-stone-500 font-medium truncate mt-0.5">
                    ${isLeader ? 'Ketua Mutawwif' : 'Jemaah'} • ${zoneText}
                  </div>
                </div>
              </div>
              <div class="flex items-center gap-2 shrink-0">
                <span class="px-2 py-0.5 rounded-full bg-stone-100 text-[10px] font-bold text-stone-700">
                  ${dist.toFixed(0)}m
                </span>
                <button data-tx="${p.x}" data-tz="${p.z}" class="btn-tp-player px-2.5 py-1 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-[10px] font-bold transition cursor-pointer shadow-sm">
                  📍 Pergi
                </button>
              </div>
            </div>
          `;
        });
        html += `</div>`;
      }

      html += `</div>`;
    } else if (this.activeRosterTab === 'group') {
      // 1. Compass Card
      const dx = this.mutawwifPlayer ? this.mutawwifPlayer.x - this.localPlayerPos.x : 0;
      const dz = this.mutawwifPlayer ? this.mutawwifPlayer.z - this.localPlayerPos.z : 0;
      const dist = Math.sqrt(dx * dx + dz * dz);

      html += `
        <div class="p-3.5 rounded-2xl bg-[#FAF7F2] border border-[#C5A880]/40 flex items-center gap-3">
          <div class="w-10 h-10 rounded-2xl bg-white shadow-sm border border-stone-200/80 flex items-center justify-center text-xl shrink-0">
            ${this.isLocalMutawwif ? '🚩' : (this.mutawwifPlayer ? '🧭' : '👥')}
          </div>
          <div class="flex-1 min-w-0">
            <div class="font-bold text-xs text-stone-900 truncate">
              ${this.isLocalMutawwif 
                ? 'Anda Adalah Mutawwif (Ketua)' 
                : (this.mutawwifPlayer ? `Arah Mutawwif: ${this.mutawwifPlayer.name}` : 'Tiada Mutawwif Berdekatan')}
            </div>
            <div class="text-[11px] text-stone-600 truncate mt-0.5">
              ${this.isLocalMutawwif
                ? `${this.groupMembers.length} jemaah sedang mengikuti langkah anda`
                : (this.mutawwifPlayer ? `Jarak Semasa: ${dist.toFixed(1)}m dari anda` : 'Anda sedang bergerak secara santai dalam rombongan ini.')}
            </div>
          </div>
        </div>

        <div class="space-y-2 mt-2">
          <div class="text-xs font-semibold text-stone-700 px-1">
            Ahli Kumpulan ${this.localGroupName} (${this.groupMembers.length + 1} Ahli)
          </div>

          <!-- Local player entry -->
          <div class="flex items-center justify-between p-2.5 rounded-xl bg-amber-50/70 border border-amber-200/70">
            <div class="flex items-center gap-2 truncate">
              <span class="text-base">${this.isLocalMutawwif ? '🚩' : '👤'}</span>
              <div class="truncate">
                <div class="font-bold text-xs text-stone-900 truncate flex items-center gap-1.5">
                  <span>${this.localPlayerName || 'Anda'}</span>
                  <span class="px-1.5 py-0.2 rounded bg-amber-200 text-amber-900 text-[9px] font-bold">ANDA</span>
                </div>
                <div class="text-[10px] text-stone-500">${this.isLocalMutawwif ? 'Ketua Mutawwif' : 'Jemaah'}</div>
              </div>
            </div>
            <div class="text-right text-[10px] font-medium text-stone-600 shrink-0">
              Kedudukan Semasa
            </div>
          </div>
      `;

      if (this.groupMembers.length === 0) {
        html += `
          <div class="text-center py-4 text-stone-400 text-xs italic">
            Tiada jemaah lain dalam talian dalam kumpulan ini buat masa ini.
          </div>
        `;
      } else {
        this.groupMembers.forEach((p) => {
          const mdx = p.x - this.localPlayerPos.x;
          const mdz = p.z - this.localPlayerPos.z;
          const mdist = Math.sqrt(mdx * mdx + mdz * mdz);
          const isLeader = p.role === 'mutawwif';

          html += `
            <div class="flex items-center justify-between p-2.5 rounded-xl bg-stone-50 border border-stone-200/80">
              <div class="flex items-center gap-2 truncate">
                <span class="text-base">${isLeader ? '🚩' : (p.gender === 'male' ? '👳‍♂️' : '🧕')}</span>
                <div class="truncate">
                  <div class="font-semibold text-xs text-stone-900 truncate">
                    ${p.name}
                  </div>
                  <div class="text-[10px] text-stone-500 font-medium">
                    ${isLeader ? 'Mutawwif Rombongan' : 'Jemaah'} • ${p.stage || 'Madinah'}
                  </div>
                </div>
              </div>
              <div class="text-right shrink-0">
                <span class="px-2 py-0.5 rounded-full bg-stone-200/80 text-[10px] font-bold text-stone-800">
                  ${mdist.toFixed(0)}m
                </span>
              </div>
            </div>
          `;
        });
      }

      html += `</div>`;
    } else if (this.activeRosterTab === 'bots') {
      html += `
        <div class="space-y-2">
          <div class="p-2.5 rounded-2xl bg-sky-50 border border-sky-200 text-sky-950 text-[11px] leading-relaxed">
            <b>Jemaah Simulasi (AI Pilgrims):</b> Kumpulan simulasi (cth: Kumpulan Andalusia, Kumpulan Rayhar & jemaah solo) disediakan agar Masjidil Haram sentiasa makmur dan penuh dengan tawaf & sa'i yang hidup.
          </div>
          <div class="space-y-1.5 max-h-64 overflow-y-auto pr-1">
      `;

      bots.forEach((b) => {
        const dx = b.x - this.localPlayerPos.x;
        const dz = b.z - this.localPlayerPos.z;
        const dist = Math.sqrt(dx * dx + dz * dz);

        html += `
          <div class="flex items-center justify-between p-2.5 rounded-xl bg-stone-50 border border-stone-200/80 text-xs">
            <div class="flex items-center gap-2 truncate">
              <span class="text-base">${b.role === 'mutawwif' ? '🚩' : (b.gender === 'male' ? '👳‍♂️' : '🧕')}</span>
              <div class="truncate">
                <div class="font-semibold text-stone-900 truncate">${b.name}</div>
                <div class="text-[10px] text-stone-500">${b.groupName} • ${b.stage === 'sai' ? 'Sa\'i Pusingan ' + b.currentLap : 'Tawaf Pusingan ' + b.currentLap}</div>
              </div>
            </div>
            <div class="text-right shrink-0">
              <span class="px-2 py-0.5 rounded-full bg-stone-200 text-[10px] font-bold text-stone-700">
                ${dist.toFixed(0)}m
              </span>
            </div>
          </div>
        `;
      });

      html += `</div></div>`;
    } else if (this.activeRosterTab === 'settings') {
      const activeUrl = localStorage.getItem('umrah_supabase_url') || import.meta.env.VITE_SUPABASE_URL || 'https://ppjkleynojihjdzydbsg.supabase.co';
      const activeKey = localStorage.getItem('umrah_supabase_key') || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_PP8n19wce5_OtTeXYYktrw_pKImhAT9';

      html += `
        <div class="space-y-3 text-xs">
          <div class="p-3 rounded-2xl bg-stone-50 border border-stone-200 space-y-2">
            <div class="font-bold text-stone-900 text-xs">📊 Status Pelayan Semasa</div>
            <div class="grid grid-cols-2 gap-2 text-[11px]">
              <div>
                <span class="text-stone-500">Status:</span>
                <span class="font-bold ${this.isSupabaseConnected ? 'text-emerald-700' : 'text-amber-700'}">
                  ${this.isSupabaseConnected ? '🟢 Bersambung' : '🟠 Mod Simulasi'}
                </span>
              </div>
              <div>
                <span class="text-stone-500">Saluran:</span>
                <span class="font-bold text-stone-800">public-mataf-world</span>
              </div>
              <div class="col-span-2">
                <span class="text-stone-500">URL Projek:</span>
                <div class="font-mono text-[10px] text-stone-700 truncate bg-white p-1 rounded border border-stone-200 mt-0.5">${activeUrl}</div>
              </div>
            </div>
          </div>

          <form id="form-supabase-config" class="space-y-2.5 p-3 rounded-2xl bg-white border border-stone-200">
            <div class="font-bold text-stone-900 text-xs flex items-center justify-between">
              <span>⚙️ Konfigurasi Supabase Kustom</span>
            </div>
            <div class="text-[11px] text-stone-500">
              Jika anda mempunyai projek Supabase sendiri, anda boleh masukkan maklumat di bawah:
            </div>
            <div class="space-y-1">
              <label class="text-[10px] font-bold text-stone-700">SUPABASE URL:</label>
              <input id="input-supabase-url" type="text" value="${activeUrl}" placeholder="https://xyz.supabase.co" class="w-full px-2.5 py-1.5 rounded-xl border border-stone-300 text-xs font-mono focus:border-amber-600 focus:outline-none" />
            </div>
            <div class="space-y-1">
              <label class="text-[10px] font-bold text-stone-700">ANON / PUBLISHABLE KEY:</label>
              <input id="input-supabase-key" type="password" value="${activeKey}" placeholder="sb_publishable_... atau eyJhbGci..." class="w-full px-2.5 py-1.5 rounded-xl border border-stone-300 text-xs font-mono focus:border-amber-600 focus:outline-none" />
            </div>
            <div class="flex items-center gap-2 pt-1">
              <button type="submit" class="flex-1 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs cursor-pointer shadow-sm">
                💾 Simpan & Sambung Semula
              </button>
              <button type="button" id="btn-reset-supabase-default" class="py-2 px-3 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs cursor-pointer">
                Reset Default
              </button>
            </div>
          </form>
        </div>
      `;
    }

    contentEl.innerHTML = html;

    // Attach click listeners for teleport buttons
    contentEl.querySelectorAll('.btn-tp-player').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const target = e.currentTarget as HTMLElement;
        const tx = parseFloat(target.getAttribute('data-tx') || '0');
        const tz = parseFloat(target.getAttribute('data-tz') || '0');
        if (!isNaN(tx) && !isNaN(tz)) {
          this.onTeleportToCoordsCallback?.(tx + 1.2, tz + 1.2);
          const modalToClose = document.getElementById('roster-detail-modal');
          modalToClose?.remove();
          this.isRosterModalOpen = false;
        }
      });
    });

    // Attach listener for custom supabase form
    const configForm = contentEl.querySelector('#form-supabase-config');
    configForm?.addEventListener('submit', (e) => {
      e.preventDefault();
      const urlInput = contentEl.querySelector('#input-supabase-url') as HTMLInputElement;
      const keyInput = contentEl.querySelector('#input-supabase-key') as HTMLInputElement;
      if (urlInput && keyInput) {
        this.onSaveSupabaseConfigCallback?.(urlInput.value.trim(), keyInput.value.trim());
      }
    });

    contentEl.querySelector('#btn-reset-supabase-default')?.addEventListener('click', () => {
      localStorage.removeItem('umrah_supabase_url');
      localStorage.removeItem('umrah_supabase_key');
      this.onSaveSupabaseConfigCallback?.(
        'https://ppjkleynojihjdzydbsg.supabase.co',
        'sb_publishable_PP8n19wce5_OtTeXYYktrw_pKImhAT9'
      );
    });
  }
}
