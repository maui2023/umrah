export type Gender = 'male' | 'female';
export type PlayerRole = 'mutawwif' | 'jemaah';

export type UmrahStage = 
  | 'ziarah_dalam'
  | 'ziarah_luar_bus'
  | 'ziarah_wida_hotel'
  | 'miqat_bir_ali'
  | 'perjalanan_makkah'
  | 'niat' 
  | 'tawaf' 
  | 'solat_zamzam' 
  | 'sai' 
  | 'tahallul' 
  | 'completed';

export interface PlayerData {
  id: string;
  name: string;
  gender: Gender;
  role: PlayerRole;
  groupId: string;
  groupName: string;
  groupColor: string;
  x: number;
  y: number;
  z: number;
  rotation: number;
  isMoving: boolean;
  currentLap: number;
  stage: UmrahStage;
  isInBus?: boolean;
  lastUpdated?: number;
  isBot?: boolean;
}

export interface GroupInfo {
  id: string;
  code: string;
  name: string;
  color: string;
  leaderId: string;
  leaderName: string;
  memberCount: number;
}

export interface DuaItem {
  id: string;
  stage: UmrahStage;
  lap?: number;
  title: string;
  location: string;
  arabic: string;
  transliteration: string;
  translation: string;
  sunnahNote?: string;
  waktuUmrah?: {
    mula: string;
    tamat: string;
  };
  waktuHaji?: {
    mula: string;
    tamat: string;
  };
  hukumDanKetentuan?: {
    hukum: string;
    caraMelafazkan: string;
  };
  audioUrl?: string;
}

export type ZiarahCategory = 
  | 'dalam_madinah' 
  | 'luar_madinah_melintas' 
  | 'luar_madinah_turun' 
  | 'ziarah_pilihan' 
  | 'ziarah_wida_hotel' 
  | 'miqat_bir_ali'
  | 'perjalanan_makkah';

export interface ZiarahSpot {
  id: string;
  number: number;
  title: string;
  arabicTitle?: string;
  category: ZiarahCategory;
  categoryLabel: string;
  transportType: 'walk' | 'bus_pass' | 'bus_stop' | 'hotel' | 'miqat' | 'bus_travel';
  transportBadge: string;
  shortDesc: string;
  historicalStory: string;
  sunnahOrAdab: string;
  dua?: DuaItem;
  actionText: string;
  actionIcon: string;
  coordinates?: { x: number; z: number };
}

export interface CheckpointZone {
  name: string;
  type: 
    | 'hajar_aswad' 
    | 'rukun_yamani' 
    | 'multazam' 
    | 'hijr_ismail' 
    | 'maqam_ibrahim' 
    | 'zamzam' 
    | 'safa' 
    | 'marwah' 
    | 'green_lights'
    | 'madinah_bus'
    | 'masjid_quba'
    | 'jabal_uhud'
    | 'ladang_kurma'
    | 'miqat_bir_ali';
  x: number;
  z: number;
  radius: number;
  description: string;
}

export type TawafMode = 'real' | 'guided';

export type TawafSectorId = 1 | 2 | 3 | 4;

export interface TawafSectorInfo {
  id: TawafSectorId;
  name: string;
  shortName: string;
  cornerName: string;
  startDeg: number;
  endDeg: number;
  duaTitle: string;
  sunnahNote: string;
  arabicSnippet: string;
}

export interface TawafProgress {
  lap: number; // 1 to 7
  totalLaps: number; // 7
  radius: number; // Distance in meters from Kaabah center
  angleDeg: number; // 0 to 360 degrees (0 at Hajarul Aswad, increasing counter-clockwise)
  sector: TawafSectorId;
  sectorInfo: TawafSectorInfo;
  lapPercentage: number; // 0% to 100% of current lap
  isInsideHijrIsmail: boolean;
  isOutsideMataf: boolean;
  isWrongDirection: boolean;
  isNearHajarAswad: boolean;
  isNearYamani: boolean;
  isIstilamAvailable: boolean;
  tawafMode: TawafMode;
  isRamlActive?: boolean;
}

export interface SavedUmrahState {
  playerId: string;
  playerName: string;
  gender: Gender;
  role: PlayerRole;
  groupId: string;
  groupName: string;
  groupColor: string;
  stage: UmrahStage;
  ziarahSpotIndex?: number;
  tawafLap: number;
  tawafMode?: TawafMode;
  saiLap: number;
  zamzamDone: boolean;
  solatSunatDone: boolean;
  tahallulDone: boolean;
  qubaSolatDone?: boolean;
  ihramWorn?: boolean;
  miqatNiatDone?: boolean;
  totalPahala?: number;
  soloSolatCount?: number;
  jemaahSolatCount?: number;
  visitedMosques?: string[];
  lastPosition?: {
    x: number;
    y: number;
    z: number;
    rotation: number;
    isInBus?: boolean;
  };
  lastSavedAt?: string;
  completedAt?: string;
}

export interface SaiProgress {
  lap: number; // 1..7
  from: 'safa' | 'marwah';
  to: 'marwah' | 'safa';
  fromLabel: string;
  toLabel: string;
  inGreenLightsZone: boolean;
  isRamlActive?: boolean;
}

export interface AyatLazimItem {
  id: string;
  category: 'ayat' | 'surah' | 'zikir';
  title: string;
  surahOrSource: string;
  arabic: string;
  transliteration: string;
  translation: string;
  fadhilat?: string;
}

