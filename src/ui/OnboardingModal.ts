import { Gender, PlayerRole } from '../types';

export interface OnboardingData {
  name: string;
  gender: Gender;
  role: PlayerRole;
  groupId: string;
  groupName: string;
  groupColor: string;
}

export class OnboardingModal {
  private container: HTMLElement;
  private onCompleteCallback: (data: OnboardingData) => void;

  constructor(onComplete: (data: OnboardingData) => void) {
    this.onCompleteCallback = onComplete;
    this.container = document.createElement('div');
    this.container.id = 'onboarding-modal-overlay';
    this.container.className = 'interactive-ui fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 overflow-y-auto';
    this.render();
  }

  private render() {
    // Check if previously saved
    const savedName = localStorage.getItem('umrah_player_name') || 'Ahmad';
    const savedGender = (localStorage.getItem('umrah_gender') as Gender) || 'male';
    const savedGroupName = localStorage.getItem('umrah_group_name') || 'Kumpulan Safwa';
    const savedGroupColor = localStorage.getItem('umrah_group_color') || '#10B981';
    const savedRole = (localStorage.getItem('umrah_role') as PlayerRole) || 'mutawwif';

    this.container.innerHTML = `
      <div class="relative w-full max-w-lg bg-slate-900 border border-emerald-500/40 rounded-2xl shadow-2xl p-6 sm:p-8 text-white my-8">
        
        <!-- Header -->
        <div class="text-center mb-6">
          <div class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 mb-3 shadow-inner">
            <span class="text-3xl">🕋</span>
          </div>
          <h2 class="text-2xl font-bold tracking-tight text-emerald-300">Simulasi Ibadah Umrah 3D</h2>
          <p class="text-xs sm:text-sm text-slate-400 mt-1">Dunia Awam Terbuka & Sistem Rombongan (Groups)</p>
        </div>

        <form id="onboarding-form" class="space-y-5">
          <!-- 1. Nama Pemain -->
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

          <!-- 2. Pilihan Avatar & Jantina -->
          <div>
            <label class="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">Pilihan Avatar & Pakaian Ihram</label>
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
                <span class="text-[11px] text-slate-400 text-center mt-0.5">Ihram lengkap & tudung labuh</span>
                <div class="gender-indicator absolute inset-0 rounded-xl border-2 pointer-events-none transition ${savedGender === 'female' ? 'border-emerald-500 bg-emerald-500/10' : 'border-transparent'}"></div>
              </label>
            </div>
          </div>

          <!-- 3. Mod Penyertaan: Solo vs Kumpulan -->
          <div>
            <label class="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">Penyertaan Dunia Simulasi</label>
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
          <div id="group-details-container" class="p-4 rounded-xl bg-slate-800/60 border border-slate-700/80 space-y-3.5">
            <div>
              <label class="block text-xs font-medium text-slate-300 mb-1" id="group-name-label">Nama Kumpulan / Rombongan</label>
              <input 
                type="text" 
                id="group-name-input" 
                value="${savedGroupName}"
                placeholder="cth: Rombongan Safwa" 
                class="w-full px-3.5 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-emerald-500"
              />
            </div>

            <!-- Group Color Selection -->
            <div>
              <label class="block text-xs font-medium text-slate-300 mb-1.5">Warna Tema Kumpulan (Penanda Ahli & Ring)</label>
              <div class="flex items-center gap-2.5 flex-wrap" id="color-palette">
                ${['#10B981', '#3B82F6', '#F59E0B', '#EC4899', '#8B5CF6', '#EF4444', '#14B8A6'].map(col => `
                  <button type="button" data-color="${col}" class="color-btn w-7 h-7 rounded-full border-2 transition ${col === savedGroupColor ? 'border-white scale-110 shadow-lg' : 'border-transparent'}" style="background-color: ${col};"></button>
                `).join('')}
              </div>
            </div>

            <!-- Peranan: Mutawwif (Ketua) vs Jemaah -->
            <div id="role-selector-row">
              <label class="block text-xs font-medium text-slate-300 mb-1.5">Peranan Anda Dalam Kumpulan</label>
              <div class="flex gap-2">
                <label class="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg border border-slate-700 bg-slate-900 cursor-pointer text-xs">
                  <input type="radio" name="role" value="mutawwif" ${savedRole === 'mutawwif' ? 'checked' : ''} />
                  <span>🚩 Ketua (Mutawwif)</span>
                </label>
                <label class="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg border border-slate-700 bg-slate-900 cursor-pointer text-xs">
                  <input type="radio" name="role" value="jemaah" ${savedRole === 'jemaah' ? 'checked' : ''} />
                  <span>Jemaah Biasa</span>
                </label>
              </div>
            </div>
          </div>

          <!-- Submit Button -->
          <button 
            type="submit" 
            class="w-full py-3.5 px-6 rounded-xl font-bold text-sm tracking-wide bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 shadow-lg shadow-emerald-500/25 transition duration-200 flex items-center justify-center gap-2 mt-2"
          >
            <span>🚀 Masuk Ke Dunia Simulasi Umrah</span>
          </button>
        </form>

        <p class="text-[11px] text-slate-500 text-center mt-3">
          Kawalan: WASD/Panah di Desktop • Virtual Joystick di Skrin Sentuh Telefon
        </p>
      </div>
    `;

    document.body.appendChild(this.container);
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
        groupColor
      });
    });
  }

  public destroy() {
    this.container.remove();
  }
}
