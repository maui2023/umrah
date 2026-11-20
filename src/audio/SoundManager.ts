import { TALBIYAH_AUDIO_BASE64, TALBIYAH_AUDIO_PATH } from './talbiyahAudio';

/**
 * Audio Manager using Web Audio API and Speech Synthesis
 * Fully offline-capable, zero external asset dependencies
 */

export class SoundManager {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private ambientGain: GainNode | null = null;
  private ambientSource: AudioBufferSourceNode | null = null;
  private isAmbiencePlaying: boolean = false;

  // Dedicated HTML5 Audio / Base64 fallback for authentic Arabic Talbiyah
  private talbiyahAudio: HTMLAudioElement | null = null;
  private isTalbiyahAudioActive: boolean = false;

  constructor() {
    // Initialized on first user interaction
  }

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (this.ambientGain && this.ctx) {
      this.ambientGain.gain.setValueAtTime(muted ? 0 : 0.15, this.ctx.currentTime);
    }
    if (muted) {
      this.stopTalbiyahAudio();
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    }
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  /**
   * Play istilam chime (Bismillahi Allahu Akbar sound cue)
   */
  public playIstilamSound() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(329.63, now); // E4
    osc.frequency.exponentialRampToValueAtTime(440, now + 0.15); // A4
    osc.frequency.exponentialRampToValueAtTime(659.25, now + 0.35); // E5

    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.3, now + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.85);
  }

  /**
   * Play checkpoint / lap completion chime
   */
  public playCheckpointSound() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(523.25, now); // C5
    osc.frequency.setValueAtTime(659.25, now + 0.1); // E5
    osc.frequency.setValueAtTime(783.99, now + 0.2); // G5
    osc.frequency.setValueAtTime(1046.50, now + 0.3); // C6

    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.25, now + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.9);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.95);
  }

  /**
   * Play green light alert for Sa'i harwalah
   */
  public playGreenLightAlert() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(440, now);
    osc.frequency.exponentialRampToValueAtTime(587.33, now + 0.15);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.45);
  }

  /**
   * Play celebration fanfare for Tahallul & Umrah completion
   */
  public playCompletionFanfare() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const notes = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99]; // C chord arpeggio
    const now = this.ctx.currentTime;

    notes.forEach((freq, idx) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + idx * 0.12);

      gain.gain.setValueAtTime(0, now + idx * 0.12);
      gain.gain.linearRampToValueAtTime(0.2, now + idx * 0.12 + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.12 + 0.7);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now + idx * 0.12);
      osc.stop(now + idx * 0.12 + 0.75);
    });
  }

  /**
   * Play Bus departure chime / engine rumble sound cue
   */
  public playBusDepartureSound() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    
    // Low rumble engine pitch rise
    const engineOsc = this.ctx.createOscillator();
    const engineGain = this.ctx.createGain();
    engineOsc.type = 'sawtooth';
    engineOsc.frequency.setValueAtTime(55, now);
    engineOsc.frequency.exponentialRampToValueAtTime(110, now + 0.8);
    engineGain.gain.setValueAtTime(0.08, now);
    engineGain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);
    engineOsc.connect(engineGain);
    engineGain.connect(this.ctx.destination);
    engineOsc.start(now);
    engineOsc.stop(now + 1.25);

    // Friendly 2-tone coach departure chime
    [293.66, 392.0].forEach((freq, i) => {
      if (!this.ctx) return;
      const chimeOsc = this.ctx.createOscillator();
      const chimeGain = this.ctx.createGain();
      chimeOsc.type = 'sine';
      chimeOsc.frequency.setValueAtTime(freq, now + 0.15 + i * 0.18);
      chimeGain.gain.setValueAtTime(0, now + 0.15 + i * 0.18);
      chimeGain.gain.linearRampToValueAtTime(0.2, now + 0.18 + i * 0.18);
      chimeGain.gain.exponentialRampToValueAtTime(0.001, now + 0.65 + i * 0.18);
      chimeOsc.connect(chimeGain);
      chimeGain.connect(this.ctx.destination);
      chimeOsc.start(now + 0.15 + i * 0.18);
      chimeOsc.stop(now + 0.7 + i * 0.18);
    });
  }

  /**
   * Play gentle spiritual Solat chime (Solat Sunat Quba / Bir Ali)
   */
  public playSolatChime() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const notes = [261.63, 349.23, 440.0, 523.25]; // F major soothing chime
    const now = this.ctx.currentTime;

    notes.forEach((freq, idx) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.15);

      gain.gain.setValueAtTime(0, now + idx * 0.15);
      gain.gain.linearRampToValueAtTime(0.18, now + idx * 0.15 + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.15 + 1.2);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now + idx * 0.15);
      osc.stop(now + idx * 0.15 + 1.25);
    });
  }

  /**
   * Start peaceful ambient sound of the grand courtyard
   */
  public startCourtyardAmbience() {
    if (this.isAmbiencePlaying || this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      // Generate 4 seconds of warm, soothing low-passed pink noise buffer for crowd/wind murmur
      const bufferSize = this.ctx.sampleRate * 4;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);

      let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        b3 = 0.86650 * b3 + white * 0.3104856;
        b4 = 0.55000 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.0168980;
        data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.03;
        b6 = white * 0.115926;
      }

      this.ambientSource = this.ctx.createBufferSource();
      this.ambientSource.buffer = buffer;
      this.ambientSource.loop = true;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(320, this.ctx.currentTime);

      this.ambientGain = this.ctx.createGain();
      this.ambientGain.gain.setValueAtTime(0.12, this.ctx.currentTime);

      this.ambientSource.connect(filter);
      filter.connect(this.ambientGain);
      this.ambientGain.connect(this.ctx.destination);

      this.ambientSource.start();
      this.isAmbiencePlaying = true;
    } catch {
      // Audio context might need user gesture
    }
  }

  /**
   * Speak dua text in Malay or Arabic with language detection
   */
  public speakDua(text: string) {
    if (this.isMuted) return;
    if (!('speechSynthesis' in window)) return;

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.90;
    utterance.pitch = 1.0;

    const voices = window.speechSynthesis.getVoices();
    const isArabic = /[\u0600-\u06FF]/.test(text);

    if (isArabic) {
      utterance.lang = 'ar-SA';
      const arVoice = voices.find(v => v.lang.startsWith('ar') || v.name.toLowerCase().includes('arabic'));
      if (arVoice) utterance.voice = arVoice;
    } else {
      utterance.lang = 'ms-MY';
      const preferredVoice = voices.find(v => v.lang.startsWith('ms') || v.lang.startsWith('id'));
      if (preferredVoice) utterance.voice = preferredVoice;
    }

    window.speechSynthesis.speak(utterance);
  }

  /**
   * Specifically speak Arabic text with Arabic pronunciation voice
   */
  public speakArabic(text: string, onEnd?: () => void) {
    if (this.isMuted) return;
    if (!('speechSynthesis' in window)) return;

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ar-SA';
    utterance.rate = 0.85;
    utterance.pitch = 1.0;

    const voices = window.speechSynthesis.getVoices();
    const arVoice = voices.find(v => v.lang.startsWith('ar') || v.name.toLowerCase().includes('arabic'));
    if (arVoice) {
      utterance.voice = arVoice;
    }

    if (onEnd) {
      utterance.onend = () => onEnd();
      utterance.onerror = () => onEnd();
    }

    window.speechSynthesis.speak(utterance);
  }

  /**
   * Play Authentic Arabic Talbiyah Audio ("Bunyi Arab")
   * Uses HTML5 audio asset with Base64 fallback and Arabic TTS failover
   */
  public playTalbiyahAudio(onEnded?: () => void, onError?: () => void): HTMLAudioElement | null {
    if (this.isMuted) return null;

    // Stop existing playback if any
    this.stopTalbiyahAudio();

    try {
      const audio = new Audio();
      audio.src = TALBIYAH_AUDIO_PATH;
      audio.volume = 0.95;

      audio.onended = () => {
        this.isTalbiyahAudioActive = false;
        this.talbiyahAudio = null;
        onEnded?.();
      };

      const arabicText = 'لَبَّيْكَ اللَّهُمَّ لَبَّيْكَ، لَبَّيْكَ لاَ شَرِيكَ لَكَ لَبَّيْكَ، إِنَّ الْحَمْدَ وَالنِّعْمَةَ لَكَ وَالْمُلْكَ، لاَ شَرِيكَ لَكَ';

      audio.onerror = () => {
        // Fallback to Base64 embedded audio data
        try {
          const fallbackAudio = new Audio(TALBIYAH_AUDIO_BASE64);
          fallbackAudio.volume = 0.95;
          fallbackAudio.onended = () => {
            this.isTalbiyahAudioActive = false;
            this.talbiyahAudio = null;
            onEnded?.();
          };
          fallbackAudio.onerror = () => {
            // Final fallback to Web Speech API Arabic
            this.isTalbiyahAudioActive = false;
            this.talbiyahAudio = null;
            this.speakArabic(arabicText, onEnded);
            onError?.();
          };
          this.talbiyahAudio = fallbackAudio;
          this.isTalbiyahAudioActive = true;
          fallbackAudio.play().catch(() => {
            this.speakArabic(arabicText, onEnded);
            onError?.();
          });
        } catch {
          this.speakArabic(arabicText, onEnded);
          onError?.();
        }
      };

      this.talbiyahAudio = audio;
      this.isTalbiyahAudioActive = true;
      audio.play().catch(() => {
        // Autoplay policy or format error - fallback to base64 or speech
        audio.onerror?.(new Event('error'));
      });

      return audio;
    } catch {
      this.speakArabic('لَبَّيْكَ اللَّهُمَّ لَبَّيْكَ، لَبَّيْكَ لاَ شَرِيكَ لَكَ لَبَّيْكَ، إِنَّ الْحَمْدَ وَالنِّعْمَةَ لَكَ وَالْمُلْكَ، لاَ شَرِيكَ لَكَ', onEnded);
      onError?.();
      return null;
    }
  }

  /**
   * Stop playing Talbiyah audio and cancel speech
   */
  public stopTalbiyahAudio() {
    if (this.talbiyahAudio) {
      this.talbiyahAudio.pause();
      this.talbiyahAudio.currentTime = 0;
      this.talbiyahAudio = null;
    }
    this.isTalbiyahAudioActive = false;
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }

  /**
   * Check if Talbiyah audio is currently active
   */
  public isTalbiyahAudioPlaying(): boolean {
    return this.isTalbiyahAudioActive && !!this.talbiyahAudio && !this.talbiyahAudio.paused;
  }

  /**
   * Play Takbir Sound (Allahu Akbar deep reverent chime)
   */
  public playTakbirSound() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(220, now); // A3
    osc1.frequency.exponentialRampToValueAtTime(164.81, now + 0.4); // E3

    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(440, now);
    osc2.frequency.exponentialRampToValueAtTime(329.63, now + 0.4);

    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.35, now + 0.06);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(this.ctx.destination);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 1.25);
    osc2.stop(now + 1.25);
  }

  /**
   * Play Salam Sound (peaceful two-tone resolving chime)
   */
  public playSalamSound() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(523.25, now); // C5
    osc.frequency.setValueAtTime(659.25, now + 0.25); // E5
    osc.frequency.setValueAtTime(783.99, now + 0.55); // G5

    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.25, now + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 1.4);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 1.45);
  }

  /**
   * Play Pahala Reward Sound (+1 Solo or +27 Berjemaah triumphant fanfare)
   */
  public playPahalaRewardSound(isJemaah: boolean = false) {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const notes = isJemaah 
      ? [261.63, 329.63, 392.00, 523.25, 659.25, 783.99, 1046.50] // C4 to C6 full 27-reward flourish
      : [329.63, 392.00, 523.25, 659.25]; // pleasant 1-reward chime

    notes.forEach((freq, idx) => {
      if (!this.ctx) return;
      const noteOsc = this.ctx.createOscillator();
      const noteGain = this.ctx.createGain();
      const noteTime = now + idx * 0.09;

      noteOsc.type = isJemaah ? 'triangle' : 'sine';
      noteOsc.frequency.setValueAtTime(freq, noteTime);

      noteGain.gain.setValueAtTime(0, noteTime);
      noteGain.gain.linearRampToValueAtTime(isJemaah ? 0.35 : 0.22, noteTime + 0.02);
      noteGain.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.7);

      noteOsc.connect(noteGain);
      noteGain.connect(this.ctx.destination);

      noteOsc.start(noteTime);
      noteOsc.stop(noteTime + 0.75);
    });
  }

  /**
   * Speak solat step recitation
   */
  public speakSolatStep(stepTitle: string, transliteration: string) {
    if (this.isMuted) return;
    if (!('speechSynthesis' in window)) return;

    window.speechSynthesis.cancel();
    const cleanTranslit = transliteration.replace(/[^a-zA-Z0-9\s',.-]/g, '');
    const speechText = `${stepTitle}. ${cleanTranslit}`;
    const utterance = new SpeechSynthesisUtterance(speechText);
    utterance.rate = 0.9;
    utterance.pitch = 1.0;

    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(v => v.lang.startsWith('ms') || v.lang.startsWith('id') || v.lang.startsWith('ar'));
    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    window.speechSynthesis.speak(utterance);
  }
}

export const soundManager = new SoundManager();
