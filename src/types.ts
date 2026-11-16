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
  lastUpdated?: number;
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
  saiLap: number;
  zamzamDone: boolean;
  solatSunatDone: boolean;
  tahallulDone: boolean;
  completedAt?: string;
}
