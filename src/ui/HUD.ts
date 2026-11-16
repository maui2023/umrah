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

  private groupMembers: PlayerData[] = [];
  private mutawwifPlayer: PlayerData | null = null;
  private isLocalMutawwif: boolean = false;
  private localPlayerPos = { x: 0, z: 0, rotation: 0 };

  // Collapsible UI states
  private isRosterHidden: boolean = false;
  private isDuaHidden: boolean = false;

  // Callbacks
  private onTeleportCallback: ((location: string) => void) | null = null;
  private onActionButtonCallback: ((action: string) => void) | null = null;
  private onPrevZiarahCallback: (() => void) | null = null;
  private onNextZiarahCallback: (() => void) | null = null;
  private onSelectZiarahIndexCallback: ((index: number) => void) | null = null;
  private onJoystickMoveCallback: ((x: number, y: number) => void) | null = null;
  private onSprintToggleCallback: ((sprinting: boolean) => void) | null = null;

  constructor() {
    this.container = document.createElement('div');
    this.container.id = 'umrah-hud-overlay';
    this.container.className = 'pointer-events-none fixed inset-0 z-40 flex flex-col justify-between p-2.5 sm:p-5 select-none font-sans overflow-hidden';
    document.body.appendChild(this.container);
    this.render();
    this.setupJoystick();
  }

  public toggleRosterHide(force?: boolean) {
    this.isRosterHidden = force !== undefined ? force : !this.isRosterHidden;
    const rosterCard = this.container.querySelector('#group-roster-card') as HTMLElement;
    const edgeTab = this.container.querySelector('#btn-roster-edge-tab') as HTMLElement;

    if (this.isRosterHidden) {
      rosterCard?.classList.add('-translate-x-[115%]', 'opacity-0', 'pointer-events-none');
      edgeTab?.classList.remove('hidden');
    } else {
      rosterCard?.classList.remove('-translate-x-[115%]', 'opacity-0', 'pointer-events-none');
      edgeTab?.classList.add('hidden');
    }
  }

  public toggleDuaHide(force?: boolean) {
    this.isDuaHidden = force !== undefined ? force : !this.isDuaHidden;
    const duaCard = this.container.querySelector('#dua-card') as HTMLElement;
    const collapsedBar = this.container.querySelector('#dua-collapsed-bar') as HTMLElement;

    if (this.isDuaHidden) {
      duaCard?.classList.add('hidden');
      collapsedBar?.classList.remove('hidden');
    } else {
      duaCard?.classList.remove('hidden');
      collapsedBar?.classList.add('hidden');
    }
  }

  public toggleAllUI() {
    if (!this.isRosterHidden || !this.isDuaHidden) {
      this.toggleRosterHide(true);
      this.toggleDuaHide(true);
    } else {
      this.toggleRosterHide(false);
      this.toggleDuaHide(false);
    }
    const icon = this.container.querySelector('#view-mode-icon') as HTMLElement;
    if (icon) {
      icon.innerText = (this.isRosterHidden && this.isDuaHidden) ? '👁️‍🗨️' : '👁️';
    }
  }

  public registerCallbacks(options: {
    onTeleport: (loc: string) => void;
    onActionButton: (action: string) => void;
    onPrevZiarah?: () => void;
    onNextZiarah?: () => void;
    onSelectZiarahIndex?: (index: number) => void;
    onJoystickMove: (x: number, y: number) => void;
    onSprintToggle: (sprinting: boolean) => void;
  }) {
    this.onTeleportCallback = options.onTeleport;
    this.onActionButtonCallback = options.onActionButton;
    this.onPrevZiarahCallback = options.onPrevZiarah || null;
    this.onNextZiarahCallback = options.onNextZiarah || null;
    this.onSelectZiarahIndexCallback = options.onSelectZiarahIndex || null;
    this.onJoystickMoveCallback = options.onJoystickMove;
    this.onSprintToggleCallback = options.onSprintToggle;
  }

  private render() {
    this.container.innerHTML = `
      <!-- TOP BAR -->
      <div class="pointer-events-auto flex flex-wrap items-center justify-between gap-2.5 w-full bg-slate-900/90 backdrop-blur-md border border-slate-700/80 px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-2xl shadow-xl text-white">
        
        <!-- Left: Stage & Progress -->
        <div class="flex items-center gap-2.5 sm:gap-3">
          <div class="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 font-bold text-xs sm:text-sm">
            <span id="hud-stage-icon">🚶</span>
            <span id="hud-stage-name">Ziarah Dalam Madinah</span>
          </div>

          <div id="hud-lap-container" class="flex items-center gap-2">
            <span id="hud-lap-text" class="text-xs font-semibold text-slate-300">Lokasi 1/20: Saqifah Bani Saedah</span>
            <div id="hud-lap-dots" class="hidden sm:flex items-center gap-1">
              ${[1, 2, 3, 4, 5, 6, 7].map(i => `
                <div class="lap-dot w-2 h-2 rounded-full bg-slate-700 transition" data-lap="${i}"></div>
              `).join('')}
            </div>
          </div>
        </div>

        <!-- Center / Right: Quick Teleport, Itinerary, Audio & Guide -->
        <div class="flex items-center gap-1.5 sm:gap-2">
          <!-- Toggle View Mode / Sembunyi Semua Menu -->
          <button id="btn-toggle-view-mode" title="Mod Paparan Bebas (Sembunyi / Papar UI)" class="interactive-ui p-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs text-slate-300 hover:text-white transition cursor-pointer">
            <span id="view-mode-icon">👁️</span>
          </button>

          <!-- Teleport Dropdown -->
          <div class="relative">
            <select id="teleport-select" class="interactive-ui bg-slate-800 border border-slate-700 text-slate-200 text-xs rounded-xl px-2.5 py-1.5 focus:outline-none focus:border-emerald-500 cursor-pointer max-w-[140px] sm:max-w-none truncate">
              <option value="">🧭 Panduan Pantas / Lompat</option>
              <optgroup label="📍 Ziarah Madinah & Bas">
                <option value="madinah_bus">🚌 Bas Ziarah Madinah</option>
                <option value="saqifah">🏛️ Saqifah Bani Saedah</option>
                <option value="muwajahah">💚 Maqam Rasulullah ﷺ</option>
                <option value="raudhah">🌿 Raudhah Syarifah</option>
                <option value="baqi">🤍 Perkuburan Baqi'</option>
                <option value="masjid_quba">🕌 Masjid Quba (Solat)</option>
                <option value="jabal_uhud">🏔️ Jabal Uhud & Shuhada</option>
                <option value="ladang_kurma">🌴 Ladang Kurma</option>
                <option value="miqat_bir_ali">🕌 Miqat Masjid Bir Ali (Niat)</option>
              </optgroup>
              <optgroup label="🕋 Masjidil Haram (Makkah)">
                <option value="hajar_aswad">Garisan Hajarul Aswad (Tawaf)</option>
                <option value="maqam_ibrahim">Maqam Ibrahim (Solat Sunat)</option>
                <option value="zamzam">Stesen Zamzam</option>
                <option value="safa">Bukit Safa (Sa'i)</option>
                <option value="marwah">Bukit Marwah</option>
              </optgroup>
            </select>
          </div>

          <!-- Jadual Ziarah Button (Matches user screenshot) -->
          <button id="btn-itinerary-modal" title="Jadual & Laluan Ziarah" class="interactive-ui px-2.5 sm:px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 text-xs font-semibold transition flex items-center gap-1">
            <span>🗺️</span>
            <span class="hidden sm:inline">Jadual Ziarah</span>
          </button>

          <!-- Talbiyah Audio Button -->
          <button id="btn-talbiyah" title="Alunkan Talbiyah" class="interactive-ui flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-medium text-emerald-400 transition">
            <span>🔊</span>
            <span class="hidden md:inline">Talbiyah</span>
          </button>

          <!-- Audio Mute Button -->
          <button id="btn-sound-toggle" title="Kawal Bunyi" class="interactive-ui p-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs text-slate-300 transition">
            <span id="sound-icon">🔈</span>
          </button>

          <!-- Panduan Rukun Modal Button -->
          <button id="btn-guide-modal" title="Panduan & Syarat Umrah" class="interactive-ui px-2.5 sm:px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 text-xs font-bold transition flex items-center gap-1">
            <span>📖</span>
            <span class="hidden sm:inline">Panduan Umrah</span>
          </button>
        </div>
      </div>

      <!-- MIDDLE LAYER: GROUP ROSTER & COMPASS (Left) -->
      <div class="flex-1 flex items-start justify-between py-2 sm:py-3 pointer-events-none relative">
        
        <!-- Floating Edge Tab (Visible when Roster is hidden to the side) -->
        <button id="btn-roster-edge-tab" title="Papar Senarai Ahli & Kompas" class="interactive-ui pointer-events-auto hidden fixed left-0 top-24 sm:top-28 z-40 flex items-center gap-1.5 px-3 py-2 rounded-r-2xl bg-slate-900/95 hover:bg-slate-800 backdrop-blur-md border-y border-r border-emerald-500/50 text-emerald-300 shadow-2xl text-xs font-semibold transition-all duration-300 active:scale-95 cursor-pointer">
          <span class="text-base">👥</span>
          <span id="hud-edge-member-text" class="text-[11px] font-medium text-slate-200">1 Ahli</span>
          <span class="text-[10px] text-emerald-400">▶</span>
        </button>

        <!-- Group Roster Widget -->
        <div id="group-roster-card" class="pointer-events-auto bg-slate-900/90 backdrop-blur-md border border-slate-700/80 rounded-2xl p-2.5 sm:p-3 shadow-2xl max-w-xs w-60 sm:w-64 text-white text-xs transition-all duration-300 ease-out origin-left">
          <div class="flex items-center justify-between pb-2 mb-2 border-b border-slate-700/60">
            <div class="flex items-center gap-1.5 font-bold truncate">
              <span id="hud-group-color-dot" class="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0"></span>
              <span id="hud-group-name" class="truncate">Kumpulan Safwa</span>
            </div>
            <div class="flex items-center gap-1 shrink-0">
              <span id="hud-member-count" class="px-1.5 py-0.5 rounded-full bg-slate-800 text-[10px] text-slate-300">1 Ahli</span>
              <button id="btn-toggle-roster-hide" title="Sembunyi ke tepi" class="interactive-ui flex items-center gap-1 px-1.5 py-0.5 rounded-lg bg-slate-800/90 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-[10px] transition cursor-pointer">
                <span>◀</span>
                <span class="font-medium">Sembunyi</span>
              </button>
            </div>
          </div>

          <!-- Compass to Mutawwif -->
          <div id="mutawwif-compass-box" class="p-2 mb-2 rounded-xl bg-slate-800/80 border border-slate-700 flex items-center gap-2.5">
            <div id="compass-needle" class="w-7 h-7 rounded-full bg-emerald-500/20 border border-emerald-500 flex items-center justify-center text-sm transform transition duration-150">
              🧭
            </div>
            <div class="flex-1 min-w-0">
              <div class="font-semibold text-[11px] text-emerald-400 truncate" id="compass-label">Arah Mutawwif</div>
              <div class="text-[10px] text-slate-400" id="compass-distance">Jarak: 0m</div>
            </div>
          </div>

          <!-- Roster Member List -->
          <div id="roster-list" class="space-y-1.5 max-h-32 sm:max-h-36 overflow-y-auto pr-1">
            <div class="text-slate-400 text-[11px]">Memuatkan ahli rombongan...</div>
          </div>
        </div>

        <div></div>
      </div>

      <!-- BOTTOM LAYER: INTERACTIVE DUA & GUIDELINE CARD & TOUCH CONTROLS -->
      <div class="pointer-events-none flex flex-col items-center gap-2 sm:gap-3 w-full">
        
        <!-- Floating Dua & Guideline Card -->
        <div id="dua-card" class="pointer-events-auto w-full max-w-2xl bg-slate-900/95 backdrop-blur-lg border border-emerald-500/40 rounded-2xl p-3 sm:p-5 shadow-2xl text-white transition-all duration-300 transform">
          
          <div class="flex items-center justify-between gap-2 mb-2">
            <div class="flex items-center gap-1.5 sm:gap-2 flex-wrap min-w-0">
              <span class="px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-[11px] font-bold shrink-0" id="dua-location-badge">
                🚶 Ziarah Dalam Madinah
              </span>
              <span class="text-xs text-slate-300 font-semibold truncate max-w-[140px] sm:max-w-xs" id="dua-title">Saqifah Bani Saedah</span>
            </div>

            <!-- Voice TTS & Hide Buttons -->
            <div class="flex items-center gap-1.5 shrink-0">
              <button id="btn-read-dua" class="interactive-ui flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-emerald-300 transition shrink-0 border border-slate-700 cursor-pointer">
                <span>🗣️</span>
                <span class="text-[11px]">Dengar</span>
              </button>
              <button id="btn-toggle-dua-hide" title="Sembunyi Doa ke Bawah" class="interactive-ui flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800/90 hover:bg-slate-700 text-xs text-amber-300 hover:text-amber-200 transition shrink-0 border border-amber-500/30 cursor-pointer">
                <span>▼</span>
                <span class="text-[11px] font-semibold">Sembunyi</span>
              </button>
            </div>
          </div>

          <!-- Mutawwif Story / Historical Explanation Box (Visible in Ziarah mode) -->
          <div id="ziarah-story-box" class="p-2.5 mb-2.5 rounded-xl bg-slate-800/80 border border-slate-700/70 text-xs text-slate-300 leading-relaxed max-h-24 sm:max-h-28 overflow-y-auto">
            <span class="font-bold text-amber-300">Kisah Sejarah Mutawwif:</span>
            <p id="ziarah-story-text" class="mt-1 text-slate-200">
              Penerangan sejarah daripada mutawwif tentang tempat bersejarah ini...
            </p>
          </div>

          <!-- Arabic Text -->
          <div id="dua-arabic" class="text-right text-lg sm:text-2xl font-serif leading-relaxed text-amber-200 py-1 tracking-wide" dir="rtl">
            بِسْمِ اللَّهِ وَاللَّهُ أَكْبَرُ
          </div>

          <!-- Transliteration -->
          <div id="dua-translit" class="text-xs sm:text-sm text-slate-300 italic mb-1">
            Bismillahi Allahu Akbar
          </div>

          <!-- Translation -->
          <div id="dua-translation" class="text-xs text-slate-400 line-clamp-2 sm:line-clamp-none mb-2.5">
            Dengan nama Allah dan Allah Maha Besar.
          </div>

          <!-- Action Button Row with Step Stepper -->
          <div class="flex items-center justify-between pt-2 border-t border-slate-800 gap-2">
            <span id="dua-sunnah-note" class="text-[11px] text-emerald-400/90 italic truncate max-w-[180px] sm:max-w-xs">
              Mengingati perjuangan para sahabat.
            </span>

            <div class="flex items-center gap-1.5 shrink-0">
              <!-- Prev Step Button (for Ziarah) -->
              <button id="btn-ziarah-prev" title="Lokasi Sebelumnya" class="interactive-ui p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 border border-slate-700 transition cursor-pointer">
                <span>◀</span>
              </button>

              <!-- Main Stage Action Button -->
              <button id="btn-dua-action" class="interactive-ui px-3.5 sm:px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs shadow-md transition flex items-center gap-1.5 cursor-pointer">
                <span id="dua-action-icon">🚶</span>
                <span id="dua-action-text">Dengar & Teruskan</span>
              </button>

              <!-- Next Step Button (for Ziarah) -->
              <button id="btn-ziarah-next" title="Lokasi Seterusnya" class="interactive-ui p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 border border-slate-700 transition cursor-pointer">
                <span>▶</span>
              </button>
            </div>
          </div>
        </div>

        <!-- Slim Floating Collapsed Doa Bar (Visible when Doa card is hidden) -->
        <div id="dua-collapsed-bar" class="interactive-ui hidden pointer-events-auto w-full max-w-xl bg-slate-900/95 backdrop-blur-md border border-emerald-500/50 rounded-2xl p-2 sm:px-4 sm:py-2.5 shadow-2xl text-white transition-all duration-300 flex items-center justify-between gap-2">
          
          <!-- Left: Location Info & Mini Description -->
          <div class="flex items-center gap-2 min-w-0 cursor-pointer flex-1" id="btn-collapsed-expand-area" title="Klik untuk papar doa & kisah penuh">
            <div class="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-sm shrink-0">
              <span id="collapsed-mini-icon">🏛️</span>
            </div>
            <div class="min-w-0 flex-1">
              <div class="flex items-center gap-1.5">
                <span id="collapsed-title" class="text-xs font-bold text-emerald-300 truncate">Saqifah Bani Saedah</span>
                <span class="hidden sm:inline-block px-1.5 py-0.2 rounded bg-slate-800 text-[10px] text-slate-400 border border-slate-700">Papar Doa</span>
              </div>
              <p id="collapsed-subtitle" class="text-[10px] text-slate-400 truncate">Doa Memohon Perpaduan & Keikhlasan Hati</p>
            </div>
          </div>

          <!-- Right: Action, Stepper & Expand Buttons -->
          <div class="flex items-center gap-1.5 shrink-0">
            <!-- Audio TTS Mini Button -->
            <button id="btn-collapsed-tts" title="Dengar Audio Doa" class="interactive-ui p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-emerald-300 border border-slate-700 transition cursor-pointer">
              <span>🗣️</span>
            </button>

            <!-- Prev Button -->
            <button id="btn-collapsed-prev" title="Lokasi Sebelumnya" class="interactive-ui p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 border border-slate-700 transition cursor-pointer">
              <span>◀</span>
            </button>

            <!-- Main Action Button -->
            <button id="btn-collapsed-action" class="interactive-ui px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-[11px] shadow transition flex items-center gap-1 cursor-pointer">
              <span id="collapsed-action-icon">🚶</span>
              <span id="collapsed-action-text" class="hidden xs:inline">Teruskan</span>
            </button>

            <!-- Next Button -->
            <button id="btn-collapsed-next" title="Lokasi Seterusnya" class="interactive-ui p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 border border-slate-700 transition cursor-pointer">
              <span>▶</span>
            </button>

            <!-- Expand Button -->
            <button id="btn-expand-dua" title="Papar Doa Penuh" class="interactive-ui flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-semibold transition cursor-pointer">
              <span>▲</span>
              <span class="text-[11px]">Papar</span>
            </button>
          </div>
        </div>

        <!-- Mobile Touch Joystick & Sprint (Visible on mobile/tablet) -->
        <div class="w-full flex items-center justify-between px-2 sm:hidden pointer-events-none pb-1">
          <div id="touch-joystick-zone" class="pointer-events-auto relative w-24 h-24 rounded-full bg-slate-900/60 border-2 border-slate-700/80 backdrop-blur-sm flex items-center justify-center">
            <div id="touch-joystick-thumb" class="w-10 h-10 rounded-full bg-emerald-500/80 shadow-md transform transition-transform pointer-events-none"></div>
          </div>

          <div class="pointer-events-auto flex flex-col gap-2">
            <button id="btn-mobile-sprint" class="w-14 h-14 rounded-full bg-emerald-600/90 active:bg-emerald-500 text-slate-950 font-bold text-xs flex flex-col items-center justify-center shadow-lg border-2 border-emerald-400">
              <span class="text-base">⚡</span>
              <span class="text-[9px]">Lari</span>
            </button>
          </div>
        </div>
      </div>
    `;

    this.attachEventListeners();
  }

  private attachEventListeners() {
    // Toggle View Mode / Sembunyi Semua Menu
    const viewModeBtn = this.container.querySelector('#btn-toggle-view-mode') as HTMLButtonElement;
    viewModeBtn?.addEventListener('click', () => {
      this.toggleAllUI();
    });

    // Roster hide button (sembunyi ke tepi)
    const toggleRosterHideBtn = this.container.querySelector('#btn-toggle-roster-hide') as HTMLButtonElement;
    toggleRosterHideBtn?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.toggleRosterHide(true);
    });

    // Roster edge tab button (papar semula dari tepi)
    const rosterEdgeTabBtn = this.container.querySelector('#btn-roster-edge-tab') as HTMLButtonElement;
    rosterEdgeTabBtn?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.toggleRosterHide(false);
    });

    // Dua hide button (sembunyi ke bawah)
    const toggleDuaHideBtn = this.container.querySelector('#btn-toggle-dua-hide') as HTMLButtonElement;
    toggleDuaHideBtn?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.toggleDuaHide(true);
    });

    // Dua expand button & collapsed bar expand area
    const expandDuaBtn = this.container.querySelector('#btn-expand-dua') as HTMLButtonElement;
    expandDuaBtn?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.toggleDuaHide(false);
    });

    const collapsedExpandArea = this.container.querySelector('#btn-collapsed-expand-area') as HTMLElement;
    collapsedExpandArea?.addEventListener('click', () => {
      this.toggleDuaHide(false);
    });

    // Collapsed bar action button
    const collapsedActionBtn = this.container.querySelector('#btn-collapsed-action') as HTMLButtonElement;
    collapsedActionBtn?.addEventListener('click', (e) => {
      e.stopPropagation();
      if (this.onActionButtonCallback) {
        this.onActionButtonCallback(this.currentStage);
      }
    });

    // Collapsed bar prev & next buttons
    const collapsedPrevBtn = this.container.querySelector('#btn-collapsed-prev') as HTMLButtonElement;
    collapsedPrevBtn?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.onPrevZiarahCallback?.();
    });

    const collapsedNextBtn = this.container.querySelector('#btn-collapsed-next') as HTMLButtonElement;
    collapsedNextBtn?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.onNextZiarahCallback?.();
    });

    // Collapsed bar TTS button
    const collapsedTtsBtn = this.container.querySelector('#btn-collapsed-tts') as HTMLButtonElement;
    collapsedTtsBtn?.addEventListener('click', (e) => {
      e.stopPropagation();
      if (this.currentZiarahSpot && (this.currentStage.startsWith('ziarah') || this.currentStage === 'miqat_bir_ali' || this.currentStage === 'perjalanan_makkah')) {
        const textToRead = `${this.currentZiarahSpot.title}. ${this.currentZiarahSpot.historicalStory}. ` + 
          (this.currentZiarahSpot.dua ? `${this.currentZiarahSpot.dua.arabic}. ${this.currentZiarahSpot.dua.translation}` : '');
        soundManager.speakDua(textToRead);
      } else if (this.currentDua) {
        soundManager.speakDua(this.currentDua.arabic + '. ' + this.currentDua.translation);
      }
    });

    // Teleport select
    const teleportSelect = this.container.querySelector('#teleport-select') as HTMLSelectElement;
    teleportSelect.addEventListener('change', () => {
      const val = teleportSelect.value;
      if (val && this.onTeleportCallback) {
        this.onTeleportCallback(val);
      }
      teleportSelect.value = '';
    });

    // Sound toggle
    const soundBtn = this.container.querySelector('#btn-sound-toggle') as HTMLButtonElement;
    const soundIcon = this.container.querySelector('#sound-icon') as HTMLElement;
    soundBtn.addEventListener('click', () => {
      const isMuted = soundManager.getMuted();
      soundManager.setMuted(!isMuted);
      soundIcon.innerText = !isMuted ? '🔇' : '🔈';
      if (isMuted) {
        soundManager.startCourtyardAmbience();
      }
    });

    // Talbiyah audio button
    const talbiyahBtn = this.container.querySelector('#btn-talbiyah') as HTMLButtonElement;
    talbiyahBtn.addEventListener('click', () => {
      soundManager.startCourtyardAmbience();
      soundManager.speakDua(TALBIYAH_DUA.arabic + '. ' + TALBIYAH_DUA.translation);
    });

    // TTS speaker button
    const readDuaBtn = this.container.querySelector('#btn-read-dua') as HTMLButtonElement;
    readDuaBtn.addEventListener('click', () => {
      if (this.currentZiarahSpot && (this.currentStage.startsWith('ziarah') || this.currentStage === 'miqat_bir_ali' || this.currentStage === 'perjalanan_makkah')) {
        const textToRead = `${this.currentZiarahSpot.title}. ${this.currentZiarahSpot.historicalStory}. ` + 
          (this.currentZiarahSpot.dua ? `${this.currentZiarahSpot.dua.arabic}. ${this.currentZiarahSpot.dua.translation}` : '');
        soundManager.speakDua(textToRead);
      } else if (this.currentDua) {
        soundManager.speakDua(this.currentDua.arabic + '. ' + this.currentDua.translation);
      }
    });

    // Main Dua / Stage Action button
    const actionBtn = this.container.querySelector('#btn-dua-action') as HTMLButtonElement;
    actionBtn.addEventListener('click', () => {
      if (this.onActionButtonCallback) {
        this.onActionButtonCallback(this.currentStage);
      }
    });

    // Previous Ziarah button
    const prevBtn = this.container.querySelector('#btn-ziarah-prev') as HTMLButtonElement;
    prevBtn.addEventListener('click', () => {
      this.onPrevZiarahCallback?.();
    });

    // Next Ziarah button
    const nextBtn = this.container.querySelector('#btn-ziarah-next') as HTMLButtonElement;
    nextBtn.addEventListener('click', () => {
      this.onNextZiarahCallback?.();
    });

    // Itinerary Modal Button (matching the user's uploaded image!)
    const itineraryBtn = this.container.querySelector('#btn-itinerary-modal') as HTMLButtonElement;
    itineraryBtn.addEventListener('click', () => {
      this.showItineraryModal();
    });

    // Guide Modal
    const guideBtn = this.container.querySelector('#btn-guide-modal') as HTMLButtonElement;
    guideBtn.addEventListener('click', () => {
      this.showGuideModal();
    });

    // Mobile Sprint
    const sprintBtn = this.container.querySelector('#btn-mobile-sprint') as HTMLButtonElement;
    let sprinting = false;
    const toggleSprint = (state: boolean) => {
      sprinting = state;
      if (this.onSprintToggleCallback) {
        this.onSprintToggleCallback(sprinting);
      }
    };
    sprintBtn.addEventListener('touchstart', (e) => {
      e.preventDefault();
      toggleSprint(true);
    });
    sprintBtn.addEventListener('touchend', (e) => {
      e.preventDefault();
      toggleSprint(false);
    });
  }

  private setupJoystick() {
    const zone = this.container.querySelector('#touch-joystick-zone') as HTMLElement;
    const thumb = this.container.querySelector('#touch-joystick-thumb') as HTMLElement;
    if (!zone || !thumb) return;

    let touchId: number | null = null;
    let center = { x: 0, y: 0 };
    const maxRadius = 38;

    zone.addEventListener('touchstart', (e) => {
      e.preventDefault();
      const touch = e.changedTouches[0];
      touchId = touch.identifier;
      const rect = zone.getBoundingClientRect();
      center = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
    });

    window.addEventListener('touchmove', (e) => {
      if (touchId === null) return;
      for (let i = 0; i < e.changedTouches.length; i++) {
        const touch = e.changedTouches[i];
        if (touch.identifier === touchId) {
          const dx = touch.clientX - center.x;
          const dy = touch.clientY - center.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const clampedDist = Math.min(dist, maxRadius);
          const angle = Math.atan2(dy, dx);

          const nx = Math.cos(angle) * clampedDist;
          const ny = Math.sin(angle) * clampedDist;

          thumb.style.transform = `translate(${nx}px, ${ny}px)`;

          if (this.onJoystickMoveCallback) {
            this.onJoystickMoveCallback(nx / maxRadius, ny / maxRadius);
          }
          break;
        }
      }
    });

    const resetJoystick = () => {
      touchId = null;
      thumb.style.transform = 'translate(0px, 0px)';
      if (this.onJoystickMoveCallback) {
        this.onJoystickMoveCallback(0, 0);
      }
    };

    window.addEventListener('touchend', resetJoystick);
    window.addEventListener('touchcancel', resetJoystick);
  }

  /**
   * Update Ziarah Spot Information in the Floating Card & HUD
   */
  public updateZiarahSpot(spot: ZiarahSpot, index: number, total: number) {
    this.currentZiarahSpot = spot;
    this.currentZiarahIndex = index;

    const stageNameEl = this.container.querySelector('#hud-stage-name') as HTMLElement;
    const stageIconEl = this.container.querySelector('#hud-stage-icon') as HTMLElement;
    const lapContainer = this.container.querySelector('#hud-lap-container') as HTMLElement;
    const lapTextEl = this.container.querySelector('#hud-lap-text') as HTMLElement;
    const dotsEl = this.container.querySelector('#hud-lap-dots') as HTMLElement;

    const locEl = this.container.querySelector('#dua-location-badge') as HTMLElement;
    const titleEl = this.container.querySelector('#dua-title') as HTMLElement;
    const storyBox = this.container.querySelector('#ziarah-story-box') as HTMLElement;
    const storyText = this.container.querySelector('#ziarah-story-text') as HTMLElement;
    const arabicEl = this.container.querySelector('#dua-arabic') as HTMLElement;
    const translitEl = this.container.querySelector('#dua-translit') as HTMLElement;
    const translationEl = this.container.querySelector('#dua-translation') as HTMLElement;
    const sunnahNoteEl = this.container.querySelector('#dua-sunnah-note') as HTMLElement;
    const actionText = this.container.querySelector('#dua-action-text') as HTMLElement;
    const actionIcon = this.container.querySelector('#dua-action-icon') as HTMLElement;

    if (storyBox) storyBox.style.display = 'block';
    if (storyText) storyText.innerText = spot.historicalStory;

    if (locEl) locEl.innerText = `${spot.transportBadge} • ${spot.categoryLabel}`;
    if (titleEl) titleEl.innerText = spot.title;

    if (spot.dua) {
      if (arabicEl) arabicEl.innerText = spot.dua.arabic;
      if (translitEl) translitEl.innerText = spot.dua.transliteration;
      if (translationEl) translationEl.innerText = spot.dua.translation;
      if (sunnahNoteEl) sunnahNoteEl.innerText = spot.sunnahOrAdab || spot.dua.sunnahNote || '';
    }

    if (actionText) actionText.innerText = spot.actionText;
    if (actionIcon) actionIcon.innerText = spot.actionIcon;

    if (lapContainer) lapContainer.style.display = 'flex';
    if (dotsEl) dotsEl.style.display = 'none';
    if (lapTextEl) {
      lapTextEl.innerText = `Lokasi ${index + 1}/${total}: ${spot.title}`;
    }

    // Set top stage banner based on spot category
    if (spot.category === 'dalam_madinah') {
      stageNameEl.innerText = 'Ziarah Dalam Madinah';
      stageIconEl.innerText = '🚶';
    } else if (spot.category === 'luar_madinah_melintas' || spot.category === 'luar_madinah_turun' || spot.category === 'ziarah_pilihan') {
      stageNameEl.innerText = 'Ziarah Luar Madinah (Bas)';
      stageIconEl.innerText = '🚌';
    } else if (spot.category === 'ziarah_wida_hotel') {
      stageNameEl.innerText = 'Ziarah Wida\' & Hotel Ihram';
      stageIconEl.innerText = '🧕';
    } else if (spot.category === 'miqat_bir_ali') {
      stageNameEl.innerText = 'Miqat Masjid Bir Ali (Niat)';
      stageIconEl.innerText = '🕌';
    } else if (spot.category === 'perjalanan_makkah') {
      stageNameEl.innerText = 'Bas Bertalbiyah ke Makkah';
      stageIconEl.innerText = '🚌';
    }

    // Update collapsed bar elements
    const colTitle = this.container.querySelector('#collapsed-title') as HTMLElement;
    const colSubtitle = this.container.querySelector('#collapsed-subtitle') as HTMLElement;
    const colMiniIcon = this.container.querySelector('#collapsed-mini-icon') as HTMLElement;
    const colActionText = this.container.querySelector('#collapsed-action-text') as HTMLElement;
    const colActionIcon = this.container.querySelector('#collapsed-action-icon') as HTMLElement;

    if (colTitle) colTitle.innerText = spot.title;
    if (colSubtitle) colSubtitle.innerText = spot.dua ? spot.dua.title : `${spot.transportBadge} • ${spot.categoryLabel}`;
    if (colMiniIcon) colMiniIcon.innerText = spot.actionIcon || '🏛️';
    if (colActionText) colActionText.innerText = spot.actionText;
    if (colActionIcon) colActionIcon.innerText = spot.actionIcon;
  }

  public updateStage(stage: UmrahStage) {
    this.currentStage = stage;
    const stageNameEl = this.container.querySelector('#hud-stage-name') as HTMLElement;
    const stageIconEl = this.container.querySelector('#hud-stage-icon') as HTMLElement;
    const lapContainer = this.container.querySelector('#hud-lap-container') as HTMLElement;
    const dotsEl = this.container.querySelector('#hud-lap-dots') as HTMLElement;
    const storyBox = this.container.querySelector('#ziarah-story-box') as HTMLElement;
    const actionText = this.container.querySelector('#dua-action-text') as HTMLElement;
    const actionIcon = this.container.querySelector('#dua-action-icon') as HTMLElement;

    if (stage === 'ziarah_dalam') {
      stageNameEl.innerText = 'Ziarah Dalam Madinah';
      stageIconEl.innerText = '🚶';
      if (dotsEl) dotsEl.style.display = 'none';
      if (storyBox) storyBox.style.display = 'block';
    } else if (stage === 'ziarah_luar_bus') {
      stageNameEl.innerText = 'Ziarah Luar Madinah (Bas)';
      stageIconEl.innerText = '🚌';
      if (dotsEl) dotsEl.style.display = 'none';
      if (storyBox) storyBox.style.display = 'block';
    } else if (stage === 'ziarah_wida_hotel') {
      stageNameEl.innerText = 'Ziarah Wida\' & Hotel Ihram';
      stageIconEl.innerText = '🧕';
      if (dotsEl) dotsEl.style.display = 'none';
      if (storyBox) storyBox.style.display = 'block';
    } else if (stage === 'miqat_bir_ali') {
      stageNameEl.innerText = 'Miqat Bir Ali (Niat Umrah)';
      stageIconEl.innerText = '🕌';
      if (dotsEl) dotsEl.style.display = 'none';
      if (storyBox) storyBox.style.display = 'block';
      actionText.innerText = 'Lafaz Niat Umrah di Bir Ali';
      actionIcon.innerText = '🤲';
    } else if (stage === 'perjalanan_makkah') {
      stageNameEl.innerText = 'Bas ke Makkah (Talbiyah)';
      stageIconEl.innerText = '🚌';
      if (dotsEl) dotsEl.style.display = 'none';
      if (storyBox) storyBox.style.display = 'block';
      actionText.innerText = 'Tiba di Makkah (Mula Tawaf)';
      actionIcon.innerText = '🕋';
    } else if (stage === 'niat') {
      stageNameEl.innerText = 'Niat & Ihram di Miqat';
      stageIconEl.innerText = '🕊️';
      if (dotsEl) dotsEl.style.display = 'none';
      if (storyBox) storyBox.style.display = 'none';
      actionText.innerText = 'Lafaz Niat Umrah';
      actionIcon.innerText = '🤲';
    } else if (stage === 'tawaf') {
      stageNameEl.innerText = 'Tawaf di Kaabah';
      stageIconEl.innerText = '🕋';
      lapContainer.style.display = 'flex';
      if (dotsEl) dotsEl.style.display = 'flex';
      if (storyBox) storyBox.style.display = 'none';
      actionText.innerText = 'Lakukan Istilam';
      actionIcon.innerText = '✋';
    } else if (stage === 'solat_zamzam') {
      stageNameEl.innerText = 'Solat Sunat & Zamzam';
      stageIconEl.innerText = '💧';
      lapContainer.style.display = 'none';
      if (storyBox) storyBox.style.display = 'none';
      actionText.innerText = 'Tunaikan Solat / Zamzam';
      actionIcon.innerText = '🕌';
    } else if (stage === 'sai') {
      stageNameEl.innerText = 'Sa\'i Safa & Marwah';
      stageIconEl.innerText = '🏃‍♂️';
      lapContainer.style.display = 'flex';
      if (dotsEl) dotsEl.style.display = 'flex';
      if (storyBox) storyBox.style.display = 'none';
      actionText.innerText = 'Takbir & Doa Sa\'i';
      actionIcon.innerText = '✨';
    } else if (stage === 'tahallul') {
      stageNameEl.innerText = 'Tahallul (Gunting Rambut)';
      stageIconEl.innerText = '✂️';
      lapContainer.style.display = 'none';
      if (storyBox) storyBox.style.display = 'none';
      actionText.innerText = 'Lakukan Tahallul';
      actionIcon.innerText = '✂️';
    } else if (stage === 'completed') {
      stageNameEl.innerText = 'Umrah Selesai (Mabrur)';
      stageIconEl.innerText = '🏆';
      lapContainer.style.display = 'none';
      if (storyBox) storyBox.style.display = 'none';
      actionText.innerText = 'Lihat Sijil Umrah';
      actionIcon.innerText = '📜';
    }

    // Update collapsed bar state
    const colActionText = this.container.querySelector('#collapsed-action-text') as HTMLElement;
    const colActionIcon = this.container.querySelector('#collapsed-action-icon') as HTMLElement;
    const colTitle = this.container.querySelector('#collapsed-title') as HTMLElement;
    if (colActionText && actionText) colActionText.innerText = actionText.innerText;
    if (colActionIcon && actionIcon) colActionIcon.innerText = actionIcon.innerText;
    if (colTitle && stageNameEl) colTitle.innerText = stageNameEl.innerText;
  }

  public updateSolatZamzamStatus(solatSunatDone: boolean, zamzamDone: boolean) {
    const actionText = this.container.querySelector('#dua-action-text') as HTMLElement;
    const actionIcon = this.container.querySelector('#dua-action-icon') as HTMLElement;
    if (!actionText || !actionIcon) return;

    if (!solatSunatDone) {
      actionText.innerText = 'Solat Sunat Tawaf (Maqam Ibrahim)';
      actionIcon.innerText = '🕌';
    } else if (!zamzamDone) {
      actionText.innerText = 'Minum Air Zamzam';
      actionIcon.innerText = '💧';
    } else {
      actionText.innerText = 'Menuju ke Safa untuk Sa\'i';
      actionIcon.innerText = '🏃‍♂️';
    }

    const colActionText = this.container.querySelector('#collapsed-action-text') as HTMLElement;
    const colActionIcon = this.container.querySelector('#collapsed-action-icon') as HTMLElement;
    if (colActionText) colActionText.innerText = actionText.innerText;
    if (colActionIcon) colActionIcon.innerText = actionIcon.innerText;
  }

  public updateLap(stage: 'tawaf' | 'sai', lap: number) {
    this.currentLap = lap;
    const lapTextEl = this.container.querySelector('#hud-lap-text') as HTMLElement;
    const dotsEl = this.container.querySelector('#hud-lap-dots') as HTMLElement;
    if (dotsEl) dotsEl.style.display = 'flex';

    if (lapTextEl) {
      lapTextEl.innerText = `${stage === 'tawaf' ? 'Tawaf' : 'Sa\'i'}: Pusingan ${lap}/7`;
    }

    const dots = this.container.querySelectorAll('.lap-dot');
    dots.forEach((dot) => {
      const dLap = parseInt((dot as HTMLElement).dataset.lap || '1');
      if (dLap < lap) {
        dot.className = 'lap-dot w-2 h-2 rounded-full bg-emerald-400 shadow';
      } else if (dLap === lap) {
        dot.className = 'lap-dot w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse';
      } else {
        dot.className = 'lap-dot w-2 h-2 rounded-full bg-slate-700';
      }
    });
  }

  public displayDua(dua: DuaItem, alertMessage?: string) {
    this.currentDua = dua;
    const titleEl = this.container.querySelector('#dua-title') as HTMLElement;
    const locEl = this.container.querySelector('#dua-location-badge') as HTMLElement;
    const arabicEl = this.container.querySelector('#dua-arabic') as HTMLElement;
    const translitEl = this.container.querySelector('#dua-translit') as HTMLElement;
    const translationEl = this.container.querySelector('#dua-translation') as HTMLElement;
    const sunnahNoteEl = this.container.querySelector('#dua-sunnah-note') as HTMLElement;

    if (titleEl) titleEl.innerText = dua.title;
    if (locEl) locEl.innerText = dua.location;
    if (arabicEl) arabicEl.innerText = dua.arabic;
    if (translitEl) translitEl.innerText = dua.transliteration;
    if (translationEl) translationEl.innerText = dua.translation;
    if (sunnahNoteEl) sunnahNoteEl.innerText = alertMessage || dua.sunnahNote || '';

    const colTitle = this.container.querySelector('#collapsed-title') as HTMLElement;
    const colSubtitle = this.container.querySelector('#collapsed-subtitle') as HTMLElement;
    if (colTitle) colTitle.innerText = dua.title;
    if (colSubtitle) colSubtitle.innerText = dua.location;
  }

  public updateGroupRoster(
    groupName: string,
    groupColor: string,
    localPlayerPos: { x: number; z: number; rotation: number },
    allPlayers: PlayerData[],
    localRole: PlayerRole = 'jemaah'
  ) {
    this.localPlayerPos = localPlayerPos;
    this.isLocalMutawwif = localRole === 'mutawwif';

    const groupNameEl = this.container.querySelector('#hud-group-name') as HTMLElement;
    const colorDot = this.container.querySelector('#hud-group-color-dot') as HTMLElement;
    const memberCountEl = this.container.querySelector('#hud-member-count') as HTMLElement;
    const edgeMemberText = this.container.querySelector('#hud-edge-member-text') as HTMLElement;
    const rosterList = this.container.querySelector('#roster-list') as HTMLElement;

    if (groupNameEl) groupNameEl.innerText = groupName;
    if (colorDot) colorDot.style.backgroundColor = groupColor;

    this.groupMembers = allPlayers.filter(p => p.groupName === groupName);
    const memberText = `${this.groupMembers.length + 1} Ahli`;
    if (memberCountEl) memberCountEl.innerText = memberText;
    if (edgeMemberText) edgeMemberText.innerText = memberText;

    this.mutawwifPlayer = this.groupMembers.find(p => p.role === 'mutawwif') || null;

    if (rosterList) {
      if (this.groupMembers.length === 0) {
        rosterList.innerHTML = `<div class="text-slate-400 text-[11px] italic">Tiada jemaah lain dalam rombongan ini buat masa ini.</div>`;
      } else {
        rosterList.innerHTML = this.groupMembers.map(p => {
          const dist = Math.sqrt((p.x - this.localPlayerPos.x) ** 2 + (p.z - this.localPlayerPos.z) ** 2);
          const isLeader = p.role === 'mutawwif';
          return `
            <div class="flex items-center justify-between p-1.5 rounded-lg bg-slate-800/60 border border-slate-700/50">
              <div class="flex items-center gap-1.5 truncate">
                <span>${isLeader ? '🚩' : (p.gender === 'male' ? '👳‍♂️' : '🧕')}</span>
                <span class="font-medium ${isLeader ? 'text-amber-300' : 'text-slate-200'} truncate">${p.name}</span>
              </div>
              <div class="text-[10px] text-slate-400 shrink-0">
                ${dist.toFixed(0)}m • ${p.stage}
              </div>
            </div>
          `;
        }).join('');
      }
    }

    this.updateCompass();
  }

  private updateCompass() {
    const needle = this.container.querySelector('#compass-needle') as HTMLElement;
    const distEl = this.container.querySelector('#compass-distance') as HTMLElement;
    const labelEl = this.container.querySelector('#compass-label') as HTMLElement;
    const compassBox = this.container.querySelector('#mutawwif-compass-box') as HTMLElement;

    if (!compassBox) return;

    if (this.isLocalMutawwif) {
      compassBox.style.display = 'flex';
      if (needle) {
        needle.innerHTML = '🚩';
        needle.style.transform = 'none';
      }
      if (labelEl) labelEl.innerText = 'Peranan: Mutawwif (Ketua)';
      if (distEl) distEl.innerText = `${this.groupMembers.length} Jemaah mengikuti anda`;
      return;
    }

    if (!this.mutawwifPlayer) {
      compassBox.style.display = 'flex';
      if (needle) {
        needle.innerHTML = '🧭';
        needle.style.transform = 'none';
      }
      if (labelEl) labelEl.innerText = 'Kompas Rombongan';
      if (distEl) distEl.innerText = 'Tiada Mutawwif dikesan';
      return;
    }

    compassBox.style.display = 'flex';
    if (needle) needle.innerHTML = '🧭';

    const dx = this.mutawwifPlayer.x - this.localPlayerPos.x;
    const dz = this.mutawwifPlayer.z - this.localPlayerPos.z;
    const dist = Math.sqrt(dx * dx + dz * dz);

    if (distEl) distEl.innerText = `Jarak: ${dist.toFixed(1)}m`;
    if (labelEl) labelEl.innerText = `Arah: ${this.mutawwifPlayer.name}`;

    const targetAngle = Math.atan2(dx, dz);
    const relAngle = targetAngle - this.localPlayerPos.rotation;
    const deg = (relAngle * 180) / Math.PI;

    if (needle) {
      needle.style.transform = `rotate(${deg}deg)`;
    }
  }

  /**
   * Modal displaying the complete Itinerary matching user screenshot exactly!
   */
  public showItineraryModal() {
    const modal = document.createElement('div');
    modal.className = 'interactive-ui fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-3 sm:p-5 overflow-y-auto';
    
    // Group spots by category sections
    const ziarahDalam = ZIARAH_SPOTS.filter(s => s.category === 'dalam_madinah');
    const ziarahLuarMelintas = ZIARAH_SPOTS.filter(s => s.category === 'luar_madinah_melintas');
    const ziarahLuarTurun = ZIARAH_SPOTS.filter(s => s.category === 'luar_madinah_turun');
    const ziarahPilihan = ZIARAH_SPOTS.filter(s => s.category === 'ziarah_pilihan');
    const miqatDanMakkah = ZIARAH_SPOTS.filter(s => s.category === 'ziarah_wida_hotel' || s.category === 'miqat_bir_ali' || s.category === 'perjalanan_makkah');

    modal.innerHTML = `
      <div class="relative w-full max-w-3xl bg-slate-900 border-2 border-emerald-500/50 rounded-3xl p-5 sm:p-7 text-white max-h-[90vh] overflow-y-auto shadow-2xl space-y-5">
        
        <!-- Header -->
        <div class="flex items-center justify-between pb-3.5 border-b border-slate-700">
          <div>
            <div class="flex items-center gap-2">
              <span class="text-2xl">🗺️</span>
              <h2 class="text-xl sm:text-2xl font-bold text-emerald-400">Jadual Lengkap Ziarah & Umrah</h2>
            </div>
            <p class="text-xs text-slate-400 mt-0.5">Dari Madinah, menaiki bas, ziarah tempat bersejarah, sehingga berniat di Miqat Bir Ali & tiba di Makkah</p>
          </div>
          <button id="close-itinerary-btn" class="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition">✕</button>
        </div>

        <!-- Section 1: ZIARAH DALAM MADINAH -->
        <div class="space-y-2.5">
          <div class="flex items-center justify-between">
            <h3 class="text-sm font-bold text-amber-300 flex items-center gap-1.5">
              <span>➤</span> ZIARAH DALAM MADINAH
            </h3>
            <span class="text-[11px] text-red-400 font-semibold italic">** berjalan kaki sambil mutawwif bercerita sejarah **</span>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
            ${ziarahDalam.map((spot) => {
              const idx = ZIARAH_SPOTS.indexOf(spot);
              const isActive = idx === this.currentZiarahIndex;
              const isPast = idx < this.currentZiarahIndex;
              return `
                <div class="p-3 rounded-xl border transition cursor-pointer hover:border-emerald-400 ${
                  isActive 
                    ? 'bg-emerald-500/15 border-emerald-400 ring-1 ring-emerald-400' 
                    : isPast 
                      ? 'bg-slate-800/40 border-slate-700 text-slate-300' 
                      : 'bg-slate-800/80 border-slate-700/80 text-white'
                }" data-index="${idx}">
                  <div class="flex items-center justify-between mb-1">
                    <span class="font-bold text-xs ${isActive ? 'text-emerald-300' : 'text-slate-200'}">
                      ${spot.number}) ${spot.title}
                    </span>
                    <span class="text-[10px] px-1.5 py-0.5 rounded-full ${isActive ? 'bg-emerald-500 text-slate-950 font-bold' : isPast ? 'bg-slate-700 text-slate-300' : 'bg-slate-700/60 text-slate-400'}">
                      ${isActive ? 'Sedang Dilawati' : isPast ? '✓ Selesai' : 'Belum'}
                    </span>
                  </div>
                  <p class="text-[11px] text-slate-400 line-clamp-2">${spot.shortDesc}</p>
                </div>
              `;
            }).join('')}
          </div>
        </div>

        <!-- Section 2: ZIARAH LUAR MADINAH -->
        <div class="space-y-3 pt-2 border-t border-slate-800">
          <h3 class="text-sm font-bold text-amber-300 flex items-center gap-1.5">
            <span>➤</span> ZIARAH LUAR MADINAH
          </h3>

          <!-- Sub A: Melintasi dalam bas -->
          <div>
            <div class="text-[11px] text-red-400 font-semibold italic mb-2">
              ** melintasi dan memandang dari dalam bas **
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
              ${ziarahLuarMelintas.map((spot) => {
                const idx = ZIARAH_SPOTS.indexOf(spot);
                const isActive = idx === this.currentZiarahIndex;
                const isPast = idx < this.currentZiarahIndex;
                return `
                  <div class="p-3 rounded-xl border transition cursor-pointer hover:border-emerald-400 ${
                    isActive 
                      ? 'bg-emerald-500/15 border-emerald-400 ring-1 ring-emerald-400' 
                      : isPast 
                        ? 'bg-slate-800/40 border-slate-700 text-slate-300' 
                        : 'bg-slate-800/80 border-slate-700/80 text-white'
                  }" data-index="${idx}">
                    <div class="flex items-center justify-between mb-1">
                      <span class="font-bold text-xs ${isActive ? 'text-emerald-300' : 'text-slate-200'}">
                        ${spot.number}) ${spot.title}
                      </span>
                      <span class="text-[10px] px-1.5 py-0.5 rounded-full ${isActive ? 'bg-emerald-500 text-slate-950 font-bold' : isPast ? 'bg-slate-700 text-slate-300' : 'bg-slate-700/60 text-slate-400'}">
                        ${isActive ? 'Sedang Dilawati' : isPast ? '✓ Selesai' : 'Belum'}
                      </span>
                    </div>
                    <p class="text-[11px] text-slate-400 line-clamp-2">${spot.shortDesc}</p>
                  </div>
                `;
              }).join('')}
            </div>
          </div>

          <!-- Sub B: Turun & bergambar / solat -->
          <div>
            <div class="text-[11px] text-red-400 font-semibold italic mb-2">
              ** turun & bergambar, bergantung pada masa **
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
              ${ziarahLuarTurun.map((spot) => {
                const idx = ZIARAH_SPOTS.indexOf(spot);
                const isActive = idx === this.currentZiarahIndex;
                const isPast = idx < this.currentZiarahIndex;
                return `
                  <div class="p-3 rounded-xl border transition cursor-pointer hover:border-emerald-400 ${
                    isActive 
                      ? 'bg-emerald-500/15 border-emerald-400 ring-1 ring-emerald-400' 
                      : isPast 
                        ? 'bg-slate-800/40 border-slate-700 text-slate-300' 
                        : 'bg-slate-800/80 border-slate-700/80 text-white'
                  }" data-index="${idx}">
                    <div class="flex items-center justify-between mb-1">
                      <span class="font-bold text-xs ${isActive ? 'text-emerald-300' : 'text-slate-200'}">
                        ${spot.number}) ${spot.title}
                      </span>
                      <span class="text-[10px] px-1.5 py-0.5 rounded-full ${isActive ? 'bg-emerald-500 text-slate-950 font-bold' : isPast ? 'bg-slate-700 text-slate-300' : 'bg-slate-700/60 text-slate-400'}">
                        ${isActive ? 'Sedang Dilawati' : isPast ? '✓ Selesai' : 'Belum'}
                      </span>
                    </div>
                    <p class="text-[11px] text-slate-400 line-clamp-2">${spot.shortDesc}</p>
                  </div>
                `;
              }).join('')}
            </div>
          </div>
        </div>

        <!-- Section 3: ZIARAH PILIHAN MADINAH -->
        <div class="space-y-2 pt-2 border-t border-slate-800">
          <div class="flex items-center justify-between">
            <h3 class="text-sm font-bold text-amber-300 flex items-center gap-1.5">
              <span>➤</span> ZIARAH PILIHAN MADINAH
            </h3>
            <span class="text-[11px] text-red-400 font-semibold italic">(dengan bayaran tambahan)</span>
          </div>
          <div class="grid grid-cols-1 gap-2">
            ${ziarahPilihan.map((spot) => {
              const idx = ZIARAH_SPOTS.indexOf(spot);
              const isActive = idx === this.currentZiarahIndex;
              return `
                <div class="p-3 rounded-xl border transition cursor-pointer hover:border-emerald-400 ${
                  isActive ? 'bg-emerald-500/15 border-emerald-400' : 'bg-slate-800/80 border-slate-700'
                }" data-index="${idx}">
                  <div class="flex items-center justify-between">
                    <span class="font-bold text-xs text-amber-200">1) ${spot.title}</span>
                    <span class="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold">SR 60</span>
                  </div>
                  <p class="text-[11px] text-slate-400 mt-1">${spot.shortDesc}</p>
                </div>
              `;
            }).join('')}
          </div>
        </div>

        <!-- Section 4: PERSIAPAN, MIQAT & KE MAKKAH -->
        <div class="space-y-2 pt-2 border-t-2 border-slate-700">
          <h3 class="text-sm font-bold text-emerald-400 flex items-center gap-1.5">
            <span>🕋</span> PERSIAPAN, MIQAT BIR ALI & BERTOLAK KE MAKKAH
          </h3>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
            ${miqatDanMakkah.map((spot) => {
              const idx = ZIARAH_SPOTS.indexOf(spot);
              const isActive = idx === this.currentZiarahIndex;
              const isPast = idx < this.currentZiarahIndex;
              return `
                <div class="p-3 rounded-xl border transition cursor-pointer hover:border-emerald-400 ${
                  isActive 
                    ? 'bg-emerald-500/20 border-emerald-400 ring-2 ring-emerald-400' 
                    : isPast 
                      ? 'bg-slate-800/40 border-slate-700 text-slate-300' 
                      : 'bg-slate-800/90 border-slate-700/80 text-white'
                }" data-index="${idx}">
                  <div class="flex items-center justify-between mb-1">
                    <span class="font-bold text-xs ${isActive ? 'text-emerald-300' : 'text-slate-100'}">
                      ${spot.title}
                    </span>
                    <span class="text-[10px] px-1.5 py-0.5 rounded-full ${isActive ? 'bg-emerald-500 text-slate-950 font-bold' : isPast ? 'bg-slate-700 text-slate-300' : 'bg-slate-700 text-slate-400'}">
                      ${isActive ? 'Lokasi Semasa' : isPast ? '✓ Selesai' : 'Akan Datang'}
                    </span>
                  </div>
                  <p class="text-[11px] text-slate-400 line-clamp-2">${spot.shortDesc}</p>
                </div>
              `;
            }).join('')}
          </div>
        </div>

        <div class="pt-3 border-t border-slate-800 flex justify-end">
          <button id="itinerary-ok-btn" class="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition">
            Tutup Jadual
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    const close = () => modal.remove();
    modal.querySelector('#close-itinerary-btn')?.addEventListener('click', close);
    modal.querySelector('#itinerary-ok-btn')?.addEventListener('click', close);

    // Clicking any card navigates to that spot
    modal.querySelectorAll('[data-index]').forEach((el) => {
      el.addEventListener('click', () => {
        const idx = parseInt((el as HTMLElement).dataset.index || '0');
        this.onSelectZiarahIndexCallback?.(idx);
        close();
      });
    });
  }

  public showGuideModal() {
    const modal = document.createElement('div');
    modal.className = 'interactive-ui fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 overflow-y-auto';
    modal.innerHTML = `
      <div class="relative w-full max-w-xl bg-slate-900 border border-emerald-500/40 rounded-2xl p-6 text-white max-h-[85vh] overflow-y-auto shadow-2xl space-y-4">
        
        <div class="flex items-center justify-between pb-3 border-b border-slate-700">
          <div class="flex items-center gap-2">
            <span class="text-2xl">📖</span>
            <h3 class="text-lg font-bold text-emerald-400">Panduan Ibadah Umrah Lengkap</h3>
          </div>
          <button id="close-guide-btn" class="p-1 rounded-lg bg-slate-800 text-slate-400 hover:text-white">✕</button>
        </div>

        <div class="space-y-3 text-xs leading-relaxed text-slate-300">
          <h4 class="font-bold text-amber-300 text-sm">Alur Lengkap Ibadah Dari Madinah ke Makkah:</h4>
          <ol class="list-decimal pl-5 space-y-1.5">
            <li><b class="text-white">Ziarah Dalam Madinah:</b> Saqifah Bani Saedah, Masjid Alghamamah, Maqam Rasulullah ﷺ, Raudhah & Baqi'.</li>
            <li><b class="text-white">Ziarah Luar Madinah (Menaiki Bas):</b> Melintasi Masjid Ijabah, Bilal, Jumaah, Qiblatain; Melawat Masjid Quba (solat), Ladang Kurma, Khandak & Uhud.</li>
            <li><b class="text-white">Persiapan di Hotel:</b> Ziarah Wida', mandi sunat ihram & menyarungkan pakaian ihram.</li>
            <li><b class="text-white">MIQAT di Masjid Bir Ali:</b> Solat sunat ihram 2 rakaat & melafazkan Niat Umrah.</li>
            <li><b class="text-white">Bertolak ke Makkah:</b> Bertalbiyah sepanjang perjalanan bas (450km).</li>
            <li><b class="text-white">Tawaf Kaabah 7 Pusingan:</b> Bermula di Hajarul Aswad.</li>
            <li><b class="text-white">Solat Sunat & Zamzam:</b> Di belakang Maqam Ibrahim.</li>
            <li><b class="text-white">Sa'i Safa-Marwah 7 Pusingan:</b> Berlari anak di zon lampu hijau.</li>
            <li><b class="text-white">Tahallul:</b> Bercukur / bergunting menandakan selesainya umrah.</li>
          </ol>

          <h4 class="font-bold text-amber-300 text-sm pt-2">13 Pantang Larang Ihram (Selepas Berniat di Miqat):</h4>
          <ul class="list-disc pl-5 space-y-1 text-slate-400">
            <li>Memakai pakaian berjahit atau bersarung bagi lelaki.</li>
            <li>Menutup kepala bagi lelaki.</li>
            <li>Menutup muka atau memakai sarung tangan bagi wanita.</li>
            <li>Menggunakan wangi-wangian pada badan atau pakaian.</li>
            <li>Memakai minyak pada rambut atau janggut.</li>
            <li>Memotong kuku tangan atau kaki.</li>
            <li>Mencukur, mencabut atau menggunting rambut/bulu badan.</li>
            <li>Memotong atau mencabut tumbuhan di Tanah Haram.</li>
            <li>Memburu atau membunuh binatang buruan darat.</li>
            <li>Berkahwin, mengahwinkan atau menjadi wakil nikah.</li>
            <li>Melakukan mukaddimah persetubuhan (bercumbu-cumbuan).</li>
            <li>Melakukan persetubuhan.</li>
            <li>Melakukan perkara fasik atau berbantah-bantahan.</li>
          </ul>
        </div>

        <button id="guide-ok-btn" class="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs mt-3">
          Faham & Teruskan
        </button>
      </div>
    `;

    document.body.appendChild(modal);

    const close = () => modal.remove();
    modal.querySelector('#close-guide-btn')?.addEventListener('click', close);
    modal.querySelector('#guide-ok-btn')?.addEventListener('click', close);
  }

  public showCertificateModal(data: { name: string; groupName: string; date: string }) {
    const modal = document.createElement('div');
    modal.className = 'interactive-ui fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-4 overflow-y-auto';
    modal.innerHTML = `
      <div class="relative w-full max-w-lg bg-gradient-to-b from-slate-900 to-emerald-950 border-2 border-amber-400/80 rounded-3xl p-6 sm:p-8 text-white shadow-2xl text-center space-y-4">
        
        <div class="w-20 h-20 mx-auto rounded-full bg-amber-400/20 border-2 border-amber-400 flex items-center justify-center text-4xl shadow-inner">
          🏆
        </div>

        <div>
          <h2 class="text-2xl font-bold tracking-wide text-amber-300 font-serif">SIJIL PENYELESAIAN UMRAH</h2>
          <p class="text-xs text-slate-300 mt-1">Simulasi Ibadah Umrah Lengkap Madinah ➔ Miqat Bir Ali ➔ Makkah</p>
        </div>

        <div class="py-4 border-y border-amber-400/30 space-y-2">
          <p class="text-xs text-slate-400">Dengan izin Allah SWT, diperakui bahawa:</p>
          <div class="text-xl sm:text-2xl font-bold text-white tracking-wider font-serif">${data.name}</div>
          <p class="text-xs text-slate-300">
            bersama <b class="text-emerald-400">${data.groupName}</b> telah menyempurnakan kesemua Ziarah Madinah, Miqat Bir Ali, serta Rukun Umrah di Masjidil Haram dengan jayanya pada tarikh:
          </p>
          <div class="text-xs font-semibold text-amber-200">${data.date}</div>
        </div>

        <p class="text-xs text-emerald-300 italic">
          "Semoga Allah mengurniakan Umrah yang Mabrur, ibadah yang diterima, dan dosa yang diampuni."
        </p>

        <div class="flex gap-3 pt-2">
          <button id="btn-cert-print" class="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-white">
            🖨️ Cetak / Simpan
          </button>
          <button id="btn-cert-close" class="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-bold text-xs shadow-lg">
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
