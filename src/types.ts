export type Gender = 'male' | 'female';
export type PlayerRole = 'mutawwif' | 'jemaah';

export type UmrahStage = 
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

export interface CheckpointZone {
  name: string;
  type: 'hajar_aswad' | 'rukun_yamani' | 'multazam' | 'hijr_ismail' | 'maqam_ibrahim' | 'zamzam' | 'safa' | 'marwah' | 'green_lights';
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
  tawafLap: number;
  saiLap: number;
  zamzamDone: boolean;
  solatSunatDone: boolean;
  tahallulDone: boolean;
  completedAt?: string;
}
