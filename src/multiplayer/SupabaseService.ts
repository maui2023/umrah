import { createClient, RealtimeChannel, SupabaseClient } from '@supabase/supabase-js';
import { PlayerData } from '../types';

export class SupabaseService {
  private client: SupabaseClient | null = null;
  private channel: RealtimeChannel | null = null;
  private isConnected: boolean = false;
  private localPlayerId: string = '';
  private remotePlayers: Map<string, PlayerData> = new Map();
  private mockPilgrims: Map<string, PlayerData> = new Map();
  private onPlayersUpdatedCallback: ((players: PlayerData[]) => void) | null = null;
  private lastBroadcastTime: number = 0;
  private broadcastIntervalMs: number = 90; // ~11Hz
  private lastPosition = { x: 0, y: 0, z: 0, rotation: 0 };
  private isUsingMock: boolean = true;
  private mockIntervalTimer: number | null = null;

  constructor() {
    this.initSupabase();
  }

  private initSupabase() {
    // Read from environment variables if set
    const url = import.meta.env.VITE_SUPABASE_URL || localStorage.getItem('umrah_supabase_url');
    const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || localStorage.getItem('umrah_supabase_key');

    if (url && anonKey && url.startsWith('http')) {
      try {
        this.client = createClient(url, anonKey, {
          realtime: {
            params: {
              eventsPerSecond: 15
            }
          }
        });
        this.isUsingMock = false;
      } catch (err) {
        console.warn('Supabase initialization failed, falling back to simulated pilgrims:', err);
        this.isUsingMock = true;
      }
    } else {
      this.isUsingMock = true;
    }
  }

  public connect(localPlayer: PlayerData, onPlayersUpdated: (players: PlayerData[]) => void) {
    this.localPlayerId = localPlayer.id;
    this.onPlayersUpdatedCallback = onPlayersUpdated;

    if (this.client && !this.isUsingMock) {
      this.connectRealtime(localPlayer);
    } else {
      this.startSimulatedWorld(localPlayer);
    }
  }

  private connectRealtime(localPlayer: PlayerData) {
    if (!this.client) return;

    // Join public world channel
    this.channel = this.client.channel('public-mataf-world', {
      config: {
        broadcast: { ack: false, self: false },
        presence: { key: localPlayer.id }
      }
    });

    // Listen to broadcast position updates from other players
    this.channel.on('broadcast', { event: 'player_pos' }, (payload) => {
      const data = payload.payload as PlayerData;
      if (data && data.id && data.id !== this.localPlayerId) {
        data.lastUpdated = Date.now();
        this.remotePlayers.set(data.id, data);
        this.triggerUpdate();
      }
    });

    // Listen to presence events (join/leave)
    this.channel.on('presence', { event: 'sync' }, () => {
      if (!this.channel) return;
      const state = this.channel.presenceState<PlayerData>();
      const activeIds = new Set<string>();

      for (const key in state) {
        const presences = state[key];
        if (presences && presences.length > 0) {
          const p = presences[0];
          if (p.id !== this.localPlayerId) {
            activeIds.add(p.id);
            if (!this.remotePlayers.has(p.id)) {
              p.lastUpdated = Date.now();
              this.remotePlayers.set(p.id, p);
            }
          }
        }
      }

      // Clean up players no longer in presence
      for (const id of this.remotePlayers.keys()) {
        if (!activeIds.has(id)) {
          this.remotePlayers.delete(id);
        }
      }
      this.triggerUpdate();
    });

    this.channel.on('presence', { event: 'leave' }, ({ leftPresences }) => {
      for (const p of leftPresences) {
        if (p.id) {
          this.remotePlayers.delete(p.id);
        }
      }
      this.triggerUpdate();
    });

    // Subscribe to channel
    this.channel.subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        this.isConnected = true;
        await this.channel?.track({
          id: localPlayer.id,
          name: localPlayer.name,
          gender: localPlayer.gender,
          role: localPlayer.role,
          groupId: localPlayer.groupId,
          groupName: localPlayer.groupName,
          groupColor: localPlayer.groupColor,
          currentLap: localPlayer.currentLap,
          stage: localPlayer.stage
        });
      } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
        console.warn('Supabase realtime failed, using simulated pilgrims');
        this.startSimulatedWorld(localPlayer);
      }
    });
  }

  /**
   * Broadcast local player position and status (Throttled at 10-12Hz)
   */
  public broadcastPosition(player: PlayerData) {
    const now = Date.now();
    if (now - this.lastBroadcastTime < this.broadcastIntervalMs) return;

    // Only broadcast if moved noticeably
    const distSq = (player.x - this.lastPosition.x) ** 2 + (player.z - this.lastPosition.z) ** 2;
    const rotDelta = Math.abs(player.rotation - this.lastPosition.rotation);

    if (distSq < 0.002 && rotDelta < 0.03 && !player.isMoving) {
      return;
    }

    this.lastBroadcastTime = now;
    this.lastPosition = { x: player.x, y: player.y, z: player.z, rotation: player.rotation };

    if (this.channel && this.isConnected) {
      this.channel.send({
        type: 'broadcast',
        event: 'player_pos',
        payload: {
          id: player.id,
          name: player.name,
          gender: player.gender,
          role: player.role,
          groupId: player.groupId,
          groupName: player.groupName,
          groupColor: player.groupColor,
          x: Number(player.x.toFixed(2)),
          y: Number(player.y.toFixed(2)),
          z: Number(player.z.toFixed(2)),
          rotation: Number(player.rotation.toFixed(2)),
          isMoving: player.isMoving,
          currentLap: player.currentLap,
          stage: player.stage
        }
      });
    }
  }

  /**
   * Simulated World: Populates the world with 2 or more active groups
   * (e.g. Group "Safwa", Group "Al-Haramain", and Solo pilgrims)
   * performing Tawaf and Sa'i synchronously so the simulation is always vibrant!
   */
  private startSimulatedWorld(localPlayer: PlayerData) {
    if (this.mockIntervalTimer) clearInterval(this.mockIntervalTimer);

    // Create fellow companions in user's group + rival groups + solo pilgrims
    const mockPilgrimConfigs: Array<{
      id: string;
      name: string;
      gender: 'male' | 'female';
      role: 'mutawwif' | 'jemaah';
      groupId: string;
      groupName: string;
      groupColor: string;
      radius: number;
      speed: number;
      angle: number;
      stage: 'tawaf' | 'sai';
    }> = [
      // Companions in user's group (if user created or joined a group)
      {
        id: 'bot_companion_1',
        name: 'Ustaz Hilmi (Mutawwif)',
        gender: 'male',
        role: localPlayer.role === 'mutawwif' ? 'jemaah' : 'mutawwif',
        groupId: localPlayer.groupId,
        groupName: localPlayer.groupName,
        groupColor: localPlayer.groupColor,
        radius: 17,
        speed: 0.015,
        angle: 0.3,
        stage: 'tawaf'
      },
      {
        id: 'bot_companion_2',
        name: 'Haji Fauzi',
        gender: 'male',
        role: 'jemaah',
        groupId: localPlayer.groupId,
        groupName: localPlayer.groupName,
        groupColor: localPlayer.groupColor,
        radius: 19,
        speed: 0.014,
        angle: 0.45,
        stage: 'tawaf'
      },
      {
        id: 'bot_companion_3',
        name: 'Hajjah Aminah',
        gender: 'female',
        role: 'jemaah',
        groupId: localPlayer.groupId,
        groupName: localPlayer.groupName,
        groupColor: localPlayer.groupColor,
        radius: 18,
        speed: 0.013,
        angle: 0.55,
        stage: 'tawaf'
      },
      // Group 2: Rombongan Andalusia (Emerald Green / Cyan)
      {
        id: 'bot_grp2_leader',
        name: 'Ustaz Firdaus',
        gender: 'male',
        role: 'mutawwif',
        groupId: 'GRP-ANDALUSIA',
        groupName: 'Kumpulan Andalusia',
        groupColor: '#10B981',
        radius: 22,
        speed: 0.012,
        angle: 2.1,
        stage: 'tawaf'
      },
      {
        id: 'bot_grp2_member1',
        name: 'Haji Razak',
        gender: 'male',
        role: 'jemaah',
        groupId: 'GRP-ANDALUSIA',
        groupName: 'Kumpulan Andalusia',
        groupColor: '#10B981',
        radius: 23,
        speed: 0.012,
        angle: 2.25,
        stage: 'tawaf'
      },
      {
        id: 'bot_grp2_member2',
        name: 'Puan Halimah',
        gender: 'female',
        role: 'jemaah',
        groupId: 'GRP-ANDALUSIA',
        groupName: 'Kumpulan Andalusia',
        groupColor: '#10B981',
        radius: 24,
        speed: 0.011,
        angle: 2.4,
        stage: 'tawaf'
      },
      // Group 3: Rombongan Tabung Haji (Golden Amber)
      {
        id: 'bot_grp3_leader',
        name: 'Ustaz Syakir',
        gender: 'male',
        role: 'mutawwif',
        groupId: 'GRP-TABUNGHAJI',
        groupName: 'Kumpulan Rayhar',
        groupColor: '#F59E0B',
        radius: 26,
        speed: 0.011,
        angle: 4.2,
        stage: 'tawaf'
      },
      {
        id: 'bot_grp3_member',
        name: 'Haji Sulaiman',
        gender: 'male',
        role: 'jemaah',
        groupId: 'GRP-TABUNGHAJI',
        groupName: 'Kumpulan Rayhar',
        groupColor: '#F59E0B',
        radius: 27,
        speed: 0.010,
        angle: 4.35,
        stage: 'tawaf'
      },
      // Solo Pilgrims
      {
        id: 'bot_solo_1',
        name: 'Tariq Al-Madani',
        gender: 'male',
        role: 'jemaah',
        groupId: 'SOLO',
        groupName: 'Solo',
        groupColor: '#94A3B8',
        radius: 14,
        speed: 0.016,
        angle: 5.4,
        stage: 'tawaf'
      },
      {
        id: 'bot_solo_2',
        name: 'Zahra Al-Quds',
        gender: 'female',
        role: 'jemaah',
        groupId: 'SOLO',
        groupName: 'Solo',
        groupColor: '#94A3B8',
        radius: 15,
        speed: 0.015,
        angle: 1.2,
        stage: 'tawaf'
      }
    ];

    // Initialize positions
    mockPilgrimConfigs.forEach((cfg) => {
      const x = Math.cos(cfg.angle) * cfg.radius;
      const z = Math.sin(cfg.angle) * cfg.radius;
      const rotation = cfg.angle + Math.PI / 2; // facing tangent (counter-clockwise)

      this.mockPilgrims.set(cfg.id, {
        id: cfg.id,
        name: cfg.name,
        gender: cfg.gender,
        role: cfg.role,
        groupId: cfg.groupId,
        groupName: cfg.groupName,
        groupColor: cfg.groupColor,
        x,
        y: 0,
        z,
        rotation,
        isMoving: true,
        currentLap: Math.floor(Math.random() * 5) + 1,
        stage: cfg.stage,
        lastUpdated: Date.now()
      });
    });

    // Update mock pilgrims on a smooth animation loop
    this.mockIntervalTimer = window.setInterval(() => {
      mockPilgrimConfigs.forEach((cfg) => {
        cfg.angle += cfg.speed;
        if (cfg.angle > Math.PI * 2) {
          cfg.angle -= Math.PI * 2;
        }

        const p = this.mockPilgrims.get(cfg.id);
        if (p) {
          p.x = Math.cos(cfg.angle) * cfg.radius;
          p.z = Math.sin(cfg.angle) * cfg.radius;
          // Facing tangent counter-clockwise
          p.rotation = cfg.angle + Math.PI / 2;
          p.isMoving = true;
          p.lastUpdated = Date.now();
        }
      });

      this.triggerUpdate();
    }, 80);
  }

  private triggerUpdate() {
    if (!this.onPlayersUpdatedCallback) return;

    // Combine real remote players and mock pilgrims
    const combined: PlayerData[] = [];
    const now = Date.now();

    for (const p of this.remotePlayers.values()) {
      // Discard stale players (no update for 12 seconds)
      if (p.lastUpdated && now - p.lastUpdated < 12000) {
        combined.push(p);
      }
    }

    for (const p of this.mockPilgrims.values()) {
      combined.push(p);
    }

    this.onPlayersUpdatedCallback(combined);
  }

  public disconnect() {
    if (this.mockIntervalTimer) {
      clearInterval(this.mockIntervalTimer);
      this.mockIntervalTimer = null;
    }
    if (this.channel) {
      this.channel.unsubscribe();
      this.channel = null;
    }
    this.remotePlayers.clear();
    this.mockPilgrims.clear();
    this.isConnected = false;
  }
}
