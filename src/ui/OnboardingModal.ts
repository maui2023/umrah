import { Gender, PlayerRole, SavedUmrahState } from '../types';
import { ZIARAH_SPOTS } from '../data/ziarahData';
import { UmrahWorkflow } from '../simulation/UmrahWorkflow';

export interface OnboardingData {
  name: string;
  gender: Gender;
  role: PlayerRole;
  groupId: string;
  groupName: string;
  groupColor: string;
  startLocation: 'madinah' | 'makkah';
  isResume?: boolean;
}

export class OnboardingModal {
  private container: HTMLElement;
  private onCompleteCallback: (data: OnboardingData) => void;

  constructor(onComplete: (data: OnboardingData) => void) {
    this.onCompleteCallback = onComplete;
    this.container = document.createElement('div');
    this.container.id = 'onboarding-modal-overlay';
    this.container.className = 'interactive-ui fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-4 overflow-y-auto';
    document.body.appendChild(this.container);
    this.render();
  }

  private render() {
    const savedState = UmrahWorkflow.getSavedState();
    if (savedState && savedState.stage) {
      this.renderResumeView(savedState);
    } else {
      this.renderNewGameForm(false);
    }
  }

  private getProgressDescription(state: SavedUmrahState): { title: string; subtitle: string; icon: string } {
    if (state.stage === 'tawaf') {
      return {
        icon: '🕋',
        title: 'Tawaf di Masjidil Haram',
        subtitle: `Pusingan ke-${state.tawafLap || 1} dari 7 (Dataran Kaabah)`
      };
    } else if (state.stage === 'solat_zamzam') {
      return {
        icon: '💧',
        title: 'Solat Sunat Tawaf & Air Zamzam',
        subtitle: state.solatSunatDone ? 'Minum Air Zamzam' : 'Solat Sunat 2 Rakaat di Belakang Maqam Ibrahim'
      };
    } else if (state.stage === 'sai') {
      const target = ((state.saiLap || 1) % 2 === 1) ? 'Marwah' : 'Safa';
      return {
        icon: '🏃',
        title: "Sa'i antara Safa & Marwah",
        subtitle: `Pusingan ke-${state.saiLap || 1} dari 7 (Menuju Bukit ${target})`
      };
    } else if (state.stage === 'tahallul') {
      return {
        icon: '✂️',
        title: 'Tahallul',
        subtitle: 'Bercukur atau Bergunting Rambut (Tamat Ihram)'
      };
    } else if (state.stage === 'completed') {
      return {
        icon: '🎉',
        title: 'Umrah Selesai',
        subtitle: 'Alhamdulillah, Umrah Mabrur Sempurna'
      };
    } else if (state.stage === 'miqat_bir_ali') {
      return {
        icon: '🕌',
        title: 'Miqat Masjid Bir Ali (Zulhulaifah)',
        subtitle: 'Solat Sunat Ihram & Lafaz Niat Umrah'
      };
    } else if (state.stage === 'perjalanan_makkah' || state.stage === 'niat') {
      return {
        icon: '🚌',
        title: 'Perjalanan Bas Menuju Makkah',
        subtitle: 'Bertalbiyah dalam pakaian Ihram'
      };
    } else {
      const spot = ZIARAH_SPOTS[state.ziarahSpotIndex || 0] || ZIARAH_SPOTS[0];
      return {
        icon: '📍',
        title: spot.title,
        subtitle: `${spot.categoryLabel} (Lokasi ${(state.ziarahSpotIndex || 0) + 1}/${ZIARAH_SPOTS.length})`
      };
    }
  }

  /**
   * View to resume existing saved journey
   */
  private renderResumeView(savedState: SavedUmrahState) {
    const progress = this.getProgressDescription(savedState);
    let timeFormatted = '';
    if (savedState.lastSavedAt) {
      try {
        const d = new Date(savedState.lastSavedAt);
        timeFormatted = d.toLocaleTimeString('ms-MY', { hour: '2-digit', minute: '2-digit' }) + ', ' + d.toLocaleDateString('ms-MY', { day: 'numeric', month: 'short' });
      } catch {
        timeFormatted = '';
      }
    }

    this.container.innerHTML = `
      <div class="relative w-full max-w-lg bg-slate-900 border-2 border-emerald-500/60 rounded-3xl shadow-2xl p-6 sm:p-8 text-white my-8 animate-fadeIn">
        
        <!-- Header -->
        <div class="text-center mb-5">
          <div class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-500/15 border border-emerald-500/40 text-emerald-400 mb-2.5 shadow-inner">
            <span class="text-3xl">${progress.icon}</span>
          </div>
          <h2 class="text-2xl font-bold tracking-tight text-emerald-300">Selamat Kembali, ${savedState.playerName}!</h2>
          <p class="text-xs sm:text-sm text-slate-300 mt-1">Sesi ibadah anda yang lalu ditemui & tersimpan dengan rapi.</p>
        </div>

        <!-- Saved Session Card -->
        <div class="p-4 rounded-2xl bg-slate-800/90 border border-emerald-500/40 space-y-3 mb-5">
          <div class="flex items-center justify-between pb-3 border-b border-slate-700/80">
            <div class="flex items-center gap-3">
              <span class="text-3xl">${savedState.gender === 'female' ? '🧕' : '👳‍♂️'}</span>
              <div>
                <div class="font-bold text-sm sm:text-base text-white flex items-center gap-1.5">
                  <span>${savedState.playerName}</span>
                  <span class="text-[10px] px-2 py-0.5 rounded-full font-semibold ${savedState.role === 'mutawwif' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-slate-700 text-slate-300'}">
                    ${savedState.role === 'mutawwif' ? '🚩 Mutawwif' : 'Jemaah'}
                  </span>
                </div>
                <div class="text-xs text-slate-300 mt-0.5 flex items-center gap-1.5">
                  <span class="w-2.5 h-2.5 rounded-full inline-block" style="background-color: ${savedState.groupColor}"></span>
                  <span>${savedState.groupName}</span>
                </div>
              </div>
            </div>
            <div class="text-right">
              <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                <span>💾</span>
                <span>Tersimpan</span>
              </span>
            </div>
          </div>

          <!-- Current Location / Stage Details -->
          <div class="p-3 rounded-xl bg-slate-900/90 border border-slate-700/70">
            <div class="text-[10px] uppercase font-bold tracking-wider text-emerald-400 mb-1">
              📍 Kemajuan & Lokasi Terakhir
            </div>
            <div class="font-bold text-sm text-emerald-200 flex items-center gap-1.5">
              <span>${progress.title}</span>
            </div>
            <div class="text-xs text-slate-300 mt-0.5">
              ${progress.subtitle}
            </div>
            ${timeFormatted ? `
              <div class="text-[10px] text-slate-500 mt-2 pt-1.5 border-t border-slate-800 flex items-center gap-1">
                <span>🕒</span>
                <span>Simpanan terakhir: ${timeFormatted}</span>
              </div>
            ` : ''}
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="space-y-3">
          <button 
            type="button" 
            id="btn-continue-session" 
            class="w-full py-4 px-6 rounded-2xl font-bold text-sm tracking-wide bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 shadow-xl shadow-emerald-500/25 transition duration-200 flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
          >
            <span class="text-base">▶️</span>
            <span>Sambung Perjalanan (Teruskan Sesi)</span>
          </button>

          <button 
            type="button" 
            id="btn-show-new-game-form" 
            class="w-full py-3 px-4 rounded-xl font-semibold text-xs text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-800 border border-slate-700 transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>🔄</span>
            <span>Mula Semula Dari Awal / Tukar Watak</span>
          </button>
        </div>

        <p class="text-[11px] text-slate-500 text-center mt-4">
          Petua: Setiap langkah & pusingan anda disimpan secara automatik dalam pelayar ini.
        </p>
      </div>
    `;

    const continueBtn = this.container.querySelector('#btn-continue-session') as HTMLButtonElement;
    const newGameBtn = this.container.querySelector('#btn-show-new-game-form') as HTMLButtonElement;

    continueBtn.addEventListener('click', () => {
      this.destroy();
      const isMakkahStage = (
        savedState.stage === 'tawaf' || 
        savedState.stage === 'solat_zamzam' || 
        savedState.stage === 'sai' || 
        savedState.stage === 'tahallul' || 
        savedState.stage === 'completed'
      );

      this.onCompleteCallback({
        name: savedState.playerName,
        gender: savedState.gender,
        role: savedState.role,
        groupId: savedState.groupId,
        groupName: savedState.groupName,
        groupColor: savedState.groupColor,
        startLocation: isMakkahStage ? 'makkah' : 'madinah',
        isResume: true
      });
    });

    newGameBtn.addEventListener('click', () => {
      this.renderNewGameForm(true);
    });
  }

  /**
   * View to start a new game or register a new avatar
   */
  private renderNewGameForm(canCancel: boolean = false) {
    const savedName = localStorage.getItem('umrah_player_name') || 'Ahmad';
    const savedGender = (localStorage.getItem('umrah_gender') as Gender) || 'male';
    const savedGroupName = localStorage.getItem('umrah_group_name') || 'Kumpulan Safwa';
    const savedGroupColor = localStorage.getItem('umrah_group_color') || '#10B981';
    const savedRole = (localStorage.getItem('umrah_role') as PlayerRole) || 'mutawwif';

    this.container.innerHTML = `
      <div class="relative w-full max-w-lg bg-slate-900 border-2 border-emerald-500/50 rounded-3xl shadow-2xl p-6 sm:p-8 text-white my-8">
        
        ${canCancel ? `
          <button type="button" id="btn-back-to-resume" class="absolute top-5 left-5 text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1 cursor-pointer">
            <span>↩️</span>
            <span>Kembali ke Sesi Tersimpan</span>
          </button>
        ` : ''}

        <!-- Header -->
        <div class="text-center mb-5 ${canCancel ? 'mt-4' : ''}">
          <div class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-500/15 border border-emerald-500/40 text-emerald-400 mb-2.5 shadow-inner">
            <span class="text-3xl">🕋</span>
          </div>
          <h2 class="text-2xl font-bold tracking-tight text-emerald-300">
            ${canCancel ? 'Mula Semula Simulasi Umrah' : 'Simulasi Ibadah Umrah 3D'}
          </h2>
          <p class="text-xs sm:text-sm text-slate-300 mt-1">Perjalanan Lengkap: Madinah ➔ Bas Ziarah ➔ Miqat Bir Ali ➔ Makkah</p>
        </div>

        <form id="onboarding-form" class="space-y-4">
          
          <!-- 1. Pilihan Titik Permulaan (Starting Point) -->
          <div class="p-3.5 rounded-2xl bg-slate-800/90 border border-emerald-500/40 space-y-2">
            <label class="block text-xs font-bold uppercase tracking-wider text-emerald-400">
              📍 Titik Permulaan Simulasi (Alur Perjalanan)
            </label>
            <div class="space-y-2">
              <label class="relative flex items-start gap-3 p-2.5 rounded-xl border border-emerald-500/70 bg-emerald-500/10 cursor-pointer hover:bg-emerald-500/15 transition select-none">
                <input type="radio" name="start_point" value="madinah" checked class="mt-1 accent-emerald-500" />
                <div class="flex-1">
                  <div class="flex items-center gap-1.5 font-bold text-xs text-emerald-300">
                    <span>🚌 Bermula Dari Awal: Madinah & Bas Ziarah</span>
                    <span class="text-[10px] px-2 py-0.2 rounded-full bg-emerald-500 text-slate-950 font-bold">Disyorkan</span>
                  </div>
                  <p class="text-[11px] text-slate-300 mt-0.5 leading-snug">
                    Ziarah Dalam & Luar Madinah, menaiki bas rombongan, persediaan ihram, solat & niat di Miqat Bir Ali, sehingga tiba di Makkah.
                  </p>
                </div>
              </label>

              <label class="relative flex items-start gap-3 p-2.5 rounded-xl border border-slate-700 bg-slate-900/60 cursor-pointer hover:border-slate-500 transition select-none">
                <input type="radio" name="start_point" value="makkah" class="mt-1 accent-emerald-500" />
                <div class="flex-1">
                  <div class="font-bold text-xs text-slate-200">
                    <span>🕋 Terus ke Makkah (Tawaf Masjidil Haram)</span>
                  </div>
                  <p class="text-[11px] text-slate-400 mt-0.5 leading-snug">
                    Mulakan terus dari Dataran Kaabah untuk Tawaf, Solat, Zamzam, Sa'i dan Tahallul.
                  </p>
                </div>
              </label>
            </div>
          </div>

          <!-- 2. Nama Pemain -->
          <div>
            <label class="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">Nama Jemaah</label>
            <input 
              type="text" 
              id="player-name" 
              required
              maxlength="20"
              value="${savedName}"
              placeholder="Masukkan nama anda (cth: Ahmad / Siti)" 
              class="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-sm transition"
            />
          </div>

          <!-- 3. Pilihan Avatar & Jantina -->
          <div>
            <label class="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">Pilihan Avatar</label>
            <div class="grid grid-cols-2 gap-3">
              <label class="relative flex flex-col items-center p-3 rounded-xl border border-slate-700 bg-slate-800/80 cursor-pointer hover:border-emerald-500 transition select-none">
                <input type="radio" name="gender" value="male" class="sr-only" ${savedGender === 'male' ? 'checked' : ''} />
                <span class="text-2xl mb-1">👳‍♂️</span>
                <span class="text-sm font-medium text-slate-200">Lelaki</span>
                <span class="text-[11px] text-slate-400 text-center mt-0.5">Ihram 2 helai kain putih</span>
                <div class="gender-indicator absolute inset-0 rounded-xl border-2 pointer-events-none transition ${savedGender === 'male' ? 'border-emerald-500 bg-emerald-500/10' : 'border-transparent'}"></div>
              </label>

              <label class="relative flex flex-col items-center p-3 rounded-xl border border-slate-700 bg-slate-800/80 cursor-pointer hover:border-emerald-500 transition select-none">
                <input type="radio" name="gender" value="female" class="sr-only" ${savedGender === 'female' ? 'checked' : ''} />
                <span class="text-2xl mb-1">🧕</span>
                <span class="text-sm font-medium text-slate-200">Wanita</span>
                <span class="text-[11px] text-slate-400 text-center mt-0.5">Pakaian ihram sopan & tudung</span>
                <div class="gender-indicator absolute inset-0 rounded-xl border-2 pointer-events-none transition ${savedGender === 'female' ? 'border-emerald-500 bg-emerald-500/10' : 'border-transparent'}"></div>
              </label>
            </div>
          </div>

          <!-- 4. Mod Penyertaan: Solo vs Kumpulan -->
          <div>
            <label class="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">Penyertaan Rombongan</label>
            <div class="grid grid-cols-3 gap-2">
              <button type="button" id="tab-solo" class="px-2.5 py-2 text-xs font-semibold rounded-lg border transition">
                Masuk Solo
              </button>
              <button type="button" id="tab-join" class="px-2.5 py-2 text-xs font-semibold rounded-lg border transition">
                Sertai Kumpulan
              </button>
              <button type="button" id="tab-create" class="px-2.5 py-2 text-xs font-semibold rounded-lg border transition">
                Cipta Kumpulan
              </button>
            </div>
          </div>

          <!-- Group Details Form Section -->
          <div id="group-details-container" class="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/80 space-y-3">
            <div>
              <label class="block text-xs font-medium text-slate-300 mb-1" id="group-name-label">Nama Kumpulan / Rombongan</label>
              <input 
                type="text" 
                id="group-name-input" 
                value="${savedGroupName}"
                placeholder="cth: Kumpulan Safwa 1" 
                class="w-full px-3.5 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-emerald-500"
              />
            </div>

            <!-- Group Color Selection -->
            <div>
              <label class="block text-xs font-medium text-slate-300 mb-1.5">Warna Tema Rombongan</label>
              <div class="flex items-center gap-2.5 flex-wrap" id="color-palette">
                ${['#10B981', '#3B82F6', '#F59E0B', '#EC4899', '#8B5CF6', '#EF4444', '#14B8A6'].map(col => `
                  <button type="button" data-color="${col}" class="color-btn w-7 h-7 rounded-full border-2 transition ${col === savedGroupColor ? 'border-white scale-110 shadow-lg' : 'border-transparent'}" style="background-color: ${col};"></button>
                `).join('')}
              </div>
            </div>

            <!-- Role Selector -->
            <div id="role-selector-row">
              <label class="block text-xs font-medium text-slate-300 mb-1">Peranan Anda</label>
              <div class="flex gap-2">
                <label class="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg border border-slate-700 bg-slate-900 cursor-pointer text-xs">
                  <input type="radio" name="role" value="mutawwif" ${savedRole === 'mutawwif' ? 'checked' : ''} />
                  <span>🚩 Ketua (Mutawwif)</span>
                </label>
                <label class="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg border border-slate-700 bg-slate-900 cursor-pointer text-xs">
                  <input type="radio" name="role" value="jemaah" ${savedRole === 'jemaah' ? 'checked' : ''} />
                  <span>Jemaah Biasa</span>
                </label>
              </div>
            </div>
          </div>

          <!-- Submit Button -->
          <button 
            type="submit" 
            class="w-full py-3.5 px-6 rounded-xl font-bold text-sm tracking-wide bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 shadow-lg shadow-emerald-500/25 transition duration-200 flex items-center justify-center gap-2 mt-2 cursor-pointer"
          >
            <span>🚀 ${canCancel ? 'Sahkan & Mula Semula Dari Awal' : 'Mulakan Simulasi Umrah'}</span>
          </button>
        </form>

        <p class="text-[11px] text-slate-500 text-center mt-3">
          Kawalan: WASD/Panah di Komputer • Virtual Joystick di Skrin Sentuh Telefon
        </p>
      </div>
    `;

    if (canCancel) {
      const backBtn = this.container.querySelector('#btn-back-to-resume');
      backBtn?.addEventListener('click', () => {
        const saved = UmrahWorkflow.getSavedState();
        if (saved) {
          this.renderResumeView(saved);
        }
      });
    }

    this.attachEventListeners();
  }

  private attachEventListeners() {
    let currentMode: 'solo' | 'join' | 'create' = 'create';
    let selectedColor = localStorage.getItem('umrah_group_color') || '#10B981';

    const tabSolo = this.container.querySelector('#tab-solo') as HTMLButtonElement;
    const tabJoin = this.container.querySelector('#tab-join') as HTMLButtonElement;
    const tabCreate = this.container.querySelector('#tab-create') as HTMLButtonElement;
    const groupContainer = this.container.querySelector('#group-details-container') as HTMLElement;
    const groupNameInput = this.container.querySelector('#group-name-input') as HTMLInputElement;
    const groupNameLabel = this.container.querySelector('#group-name-label') as HTMLLabelElement;
    const roleSelectorRow = this.container.querySelector('#role-selector-row') as HTMLElement;

    const setMode = (mode: 'solo' | 'join' | 'create') => {
      currentMode = mode;
      [tabSolo, tabJoin, tabCreate].forEach(btn => {
        btn.className = 'px-2.5 py-2 text-xs font-semibold rounded-lg border transition border-slate-700 bg-slate-800 text-slate-400';
      });

      if (mode === 'solo') {
        tabSolo.className = 'px-2.5 py-2 text-xs font-semibold rounded-lg border transition border-emerald-500 bg-emerald-500/20 text-emerald-300';
        groupContainer.style.display = 'none';
      } else if (mode === 'join') {
        tabJoin.className = 'px-2.5 py-2 text-xs font-semibold rounded-lg border transition border-emerald-500 bg-emerald-500/20 text-emerald-300';
        groupContainer.style.display = 'block';
        groupNameLabel.innerText = 'Kod Kumpulan (cth: SAFWA-1 / ANDALUSIA)';
        groupNameInput.placeholder = 'Masukkan Kod Kumpulan';
        roleSelectorRow.style.display = 'none';
      } else {
        tabCreate.className = 'px-2.5 py-2 text-xs font-semibold rounded-lg border transition border-emerald-500 bg-emerald-500/20 text-emerald-300';
        groupContainer.style.display = 'block';
        groupNameLabel.innerText = 'Nama Kumpulan / Rombongan Baharu';
        groupNameInput.placeholder = 'cth: Kumpulan Safwa 1';
        roleSelectorRow.style.display = 'block';
      }
    };

    tabSolo.addEventListener('click', () => setMode('solo'));
    tabJoin.addEventListener('click', () => setMode('join'));
    tabCreate.addEventListener('click', () => setMode('create'));
    setMode('create');

    // Color buttons
    const colorBtns = this.container.querySelectorAll('.color-btn');
    colorBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        colorBtns.forEach(b => {
          b.classList.remove('border-white', 'scale-110');
          b.classList.add('border-transparent');
        });
        btn.classList.add('border-white', 'scale-110');
        btn.classList.remove('border-transparent');
        selectedColor = (btn as HTMLElement).dataset.color || '#10B981';
      });
    });

    // Gender radio selection visually
    const genderRadios = this.container.querySelectorAll('input[name="gender"]');
    genderRadios.forEach(radio => {
      radio.addEventListener('change', () => {
        this.container.querySelectorAll('.gender-indicator').forEach(el => {
          el.className = 'gender-indicator absolute inset-0 rounded-xl border-2 pointer-events-none transition border-transparent';
        });
        const parentLabel = radio.closest('label');
        const indicator = parentLabel?.querySelector('.gender-indicator');
        if (indicator) {
          indicator.className = 'gender-indicator absolute inset-0 rounded-xl border-2 pointer-events-none transition border-emerald-500 bg-emerald-500/10';
        }
      });
    });

    // Form submit
    const form = this.container.querySelector('#onboarding-form') as HTMLFormElement;
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const name = (this.container.querySelector('#player-name') as HTMLInputElement).value.trim() || 'Jemaah';
      const gender = ((this.container.querySelector('input[name="gender"]:checked') as HTMLInputElement)?.value as Gender) || 'male';
      const startLocation = ((this.container.querySelector('input[name="start_point"]:checked') as HTMLInputElement)?.value as 'madinah' | 'makkah') || 'madinah';

      let groupId = 'SOLO';
      let groupName = 'Solo';
      let groupColor = '#94A3B8';
      let role: PlayerRole = 'jemaah';

      if (currentMode === 'create') {
        const rawGroupName = groupNameInput.value.trim() || 'Kumpulan Jemaah';
        groupName = rawGroupName;
        groupId = 'GRP_' + rawGroupName.toUpperCase().replace(/\s+/g, '_').substring(0, 12);
        groupColor = selectedColor;
        const selectedRoleRadio = this.container.querySelector('input[name="role"]:checked') as HTMLInputElement;
        role = (selectedRoleRadio?.value as PlayerRole) || 'mutawwif';
      } else if (currentMode === 'join') {
        const code = groupNameInput.value.trim().toUpperCase() || 'GRP-ANDALUSIA';
        groupId = code;
        groupName = 'Kumpulan ' + code;
        groupColor = selectedColor;
        role = 'jemaah';
      }

      // Save preferences to LocalStorage
      localStorage.setItem('umrah_player_name', name);
      localStorage.setItem('umrah_gender', gender);
      localStorage.setItem('umrah_role', role);
      localStorage.setItem('umrah_group_id', groupId);
      localStorage.setItem('umrah_group_name', groupName);
      localStorage.setItem('umrah_group_color', groupColor);

      this.destroy();
      this.onCompleteCallback({
        name,
        gender,
        role,
        groupId,
        groupName,
        groupColor,
        startLocation,
        isResume: false
      });
    });
  }

  public destroy() {
    this.container.remove();
  }
}
