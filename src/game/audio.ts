// Efectos de sonido y música ambiental sintetizados con WebAudio (sin archivos).
// El audio solo arranca tras una interacción del usuario (unlock).

export type Sfx =
  | 'jump'
  | 'land'
  | 'page'
  | 'xp'
  | 'mission'
  | 'level'
  | 'achievement'
  | 'select'
  | 'confirm'
  | 'back'
  | 'blip'
  | 'correct'
  | 'wrong'
  | 'open'
  | 'close'
  | 'door'
  | 'zone';

const midi = (n: number) => 440 * Math.pow(2, (n - 69) / 12);

// Melodía pentatónica en La menor, compás de 2/4 (aire de sanjuanito lento).
// [nota MIDI, duración en tiempos]
const MELODY: [number, number][] = [
  [76, 1], [74, 0.5], [72, 0.5], [69, 1.5], [67, 0.5], [69, 1], [72, 1], [74, 2],
  [76, 1], [79, 0.5], [76, 0.5], [74, 1], [72, 1], [69, 1], [67, 0.5], [64, 0.5], [69, 2],
  [72, 0.5], [74, 0.5], [76, 1], [76, 0.5], [74, 0.5], [72, 1], [74, 0.5], [72, 0.5], [69, 1], [67, 2],
  [69, 0.5], [72, 0.5], [74, 1], [76, 1], [74, 0.5], [72, 0.5], [69, 1], [67, 1], [69, 2],
];

// Acorde por compás (2 tiempos): [bajo 1, bajo 2, notas del rasgueo]
const AM: [number, number, number[]] = [45, 40, [69, 72, 76]];
const CM: [number, number, number[]] = [48, 43, [72, 76, 79]];
const GM: [number, number, number[]] = [43, 50, [67, 71, 74]];
const EM: [number, number, number[]] = [40, 47, [64, 67, 71]];
const CHORDS = [AM, AM, CM, GM, CM, GM, AM, AM, CM, AM, GM, EM, AM, CM, GM, AM];

const BPM = 74;

class AudioEngine {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private sfxBus: GainNode | null = null;
  private musicBus: GainNode | null = null;
  private noiseBuf: AudioBuffer | null = null;
  private sfxOn = true;
  private musicOn = false;
  private musicWanted = false;
  private timer: number | null = null;
  private loopStart = 0;
  private events: { t: number; fn: (time: number) => void }[] = [];
  private evIndex = 0;
  private loopLen = 0;

  private onVisibility = () => {
    if (!this.ctx) return;
    if (document.hidden) this.ctx.suspend().catch(() => {});
    else this.ctx.resume().catch(() => {});
  };

  /** Crea o reanuda el AudioContext. Debe llamarse desde un gesto del usuario. */
  unlock() {
    if (!this.ctx) {
      const AC: typeof AudioContext | undefined =
        window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AC) return;
      const ctx = new AC();
      this.ctx = ctx;
      this.master = ctx.createGain();
      this.master.gain.value = 0.9;
      this.master.connect(ctx.destination);
      this.sfxBus = ctx.createGain();
      this.sfxBus.gain.value = 0.55;
      this.sfxBus.connect(this.master);
      this.musicBus = ctx.createGain();
      this.musicBus.gain.value = 0;
      this.musicBus.connect(this.master);
      const len = ctx.sampleRate;
      this.noiseBuf = ctx.createBuffer(1, len, ctx.sampleRate);
      const data = this.noiseBuf.getChannelData(0);
      for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
      document.addEventListener('visibilitychange', this.onVisibility);
      this.buildSong();
    }
    if (this.ctx.state === 'suspended') this.ctx.resume().catch(() => {});
    if (this.musicWanted && this.musicOn) this.startMusic();
  }

  setSfx(on: boolean) {
    this.sfxOn = on;
  }

  setMusic(on: boolean) {
    this.musicOn = on;
    if (on && this.musicWanted) this.startMusic();
    else this.stopMusic();
  }

  /** Indica si el juego quiere música (p. ej. en partida); respeta la preferencia. */
  wantMusic(want: boolean) {
    this.musicWanted = want;
    if (want && this.musicOn) this.startMusic();
    else this.stopMusic();
  }

  // ── Síntesis ──────────────────────────────────────────────────────────
  private tone(
    freq: number,
    dur: number,
    o: { type?: OscillatorType; vol?: number; attack?: number; slide?: number; delay?: number; bus?: GainNode | null; at?: number } = {},
  ) {
    const ctx = this.ctx;
    const bus = o.bus ?? this.sfxBus;
    if (!ctx || !bus) return;
    const t0 = o.at ?? ctx.currentTime + (o.delay ?? 0);
    const osc = ctx.createOscillator();
    osc.type = o.type ?? 'square';
    osc.frequency.setValueAtTime(freq, t0);
    if (o.slide) osc.frequency.exponentialRampToValueAtTime(o.slide, t0 + dur);
    const g = ctx.createGain();
    const vol = o.vol ?? 0.1;
    const a = o.attack ?? 0.005;
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(vol, t0 + a);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(g).connect(bus);
    osc.start(t0);
    osc.stop(t0 + dur + 0.05);
  }

  private noise(
    dur: number,
    o: { vol?: number; freq?: number; type?: BiquadFilterType; delay?: number; bus?: GainNode | null; at?: number } = {},
  ) {
    const ctx = this.ctx;
    const bus = o.bus ?? this.sfxBus;
    if (!ctx || !bus || !this.noiseBuf) return;
    const t0 = o.at ?? ctx.currentTime + (o.delay ?? 0);
    const src = ctx.createBufferSource();
    src.buffer = this.noiseBuf;
    const f = ctx.createBiquadFilter();
    f.type = o.type ?? 'lowpass';
    f.frequency.value = o.freq ?? 1000;
    const g = ctx.createGain();
    g.gain.setValueAtTime(o.vol ?? 0.05, t0);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    src.connect(f).connect(g).connect(bus);
    src.start(t0, Math.random() * 0.5);
    src.stop(t0 + dur + 0.05);
  }

  play(s: Sfx, pitch = 1) {
    if (!this.sfxOn || !this.ctx || this.ctx.state !== 'running') return;
    switch (s) {
      case 'jump':
        this.tone(300 * pitch, 0.13, { vol: 0.05, slide: 620 * pitch });
        break;
      case 'land':
        this.noise(0.07, { vol: 0.09, freq: 420 });
        break;
      case 'page':
        [880, 1175, 1568, 2093].forEach((f, i) => this.tone(f, 0.16, { type: 'triangle', vol: 0.07, delay: i * 0.06 }));
        break;
      case 'xp':
        this.tone(988, 0.07, { vol: 0.035 });
        this.tone(1319, 0.14, { vol: 0.035, delay: 0.07 });
        break;
      case 'mission': {
        [523, 659, 784, 1047].forEach((f, i) => this.tone(f, 0.18, { type: 'square', vol: 0.04, delay: i * 0.1 }));
        [523, 659, 784].forEach(f => this.tone(f, 0.9, { type: 'triangle', vol: 0.06, delay: 0.45, attack: 0.02 }));
        this.tone(1047, 0.9, { type: 'triangle', vol: 0.05, delay: 0.45, attack: 0.02 });
        break;
      }
      case 'level':
        [440, 523, 659, 880, 1047, 1319].forEach((f, i) => this.tone(f, 0.14, { type: 'square', vol: 0.035, delay: i * 0.07 }));
        this.tone(1760, 0.6, { type: 'triangle', vol: 0.05, delay: 0.45 });
        break;
      case 'achievement':
        this.tone(1319, 0.5, { type: 'sine', vol: 0.08 });
        this.tone(1760, 0.6, { type: 'sine', vol: 0.06, delay: 0.09 });
        this.tone(2637, 0.45, { type: 'sine', vol: 0.03, delay: 0.18 });
        break;
      case 'select':
        this.tone(660, 0.04, { vol: 0.025 });
        break;
      case 'confirm':
        this.tone(880, 0.08, { vol: 0.035, slide: 1320 });
        break;
      case 'back':
        this.tone(520, 0.09, { vol: 0.03, slide: 330 });
        break;
      case 'blip':
        this.tone(420 * pitch, 0.03, { vol: 0.018 });
        break;
      case 'correct':
        this.tone(659, 0.12, { type: 'triangle', vol: 0.08 });
        this.tone(880, 0.22, { type: 'triangle', vol: 0.08, delay: 0.11 });
        break;
      case 'wrong':
        this.tone(196, 0.26, { type: 'sawtooth', vol: 0.035, slide: 147 });
        break;
      case 'open':
        this.noise(0.16, { vol: 0.035, freq: 1800, type: 'bandpass' });
        this.tone(440, 0.12, { type: 'triangle', vol: 0.04, slide: 660 });
        break;
      case 'close':
        this.tone(660, 0.1, { type: 'triangle', vol: 0.035, slide: 440 });
        break;
      case 'door':
        this.noise(0.14, { vol: 0.08, freq: 300 });
        this.tone(147, 0.18, { type: 'sine', vol: 0.08 });
        break;
      case 'zone':
        this.tone(392, 0.35, { type: 'triangle', vol: 0.05 });
        this.tone(587, 0.5, { type: 'triangle', vol: 0.04, delay: 0.14 });
        break;
    }
  }

  // ── Música ────────────────────────────────────────────────────────────
  private buildSong() {
    const beat = 60 / BPM;
    const ev: { t: number; fn: (time: number) => void }[] = [];
    let t = 0;
    for (const [note, len] of MELODY) {
      const n = note;
      const d = len * beat;
      ev.push({ t, fn: time => this.flute(midi(n), d * 0.95, time) });
      t += d;
    }
    CHORDS.forEach(([b1, b2, chord], bar) => {
      const t0 = bar * 2 * beat;
      ev.push({ t: t0, fn: time => this.bass(midi(b1), beat * 0.9, time) });
      ev.push({ t: t0, fn: time => this.bombo(time) });
      ev.push({ t: t0 + beat, fn: time => this.bass(midi(b2), beat * 0.8, time) });
      [0.5, 1, 1.5].forEach(off =>
        ev.push({ t: t0 + off * beat, fn: time => this.strum(chord.map(midi), time, off === 1 ? 0.018 : 0.012) }),
      );
      for (let i = 0; i < 4; i++) ev.push({ t: t0 + i * beat * 0.5, fn: time => this.shaker(time, i % 2 === 0 ? 0.012 : 0.007) });
    });
    ev.sort((a, b) => a.t - b.t);
    this.events = ev;
    this.loopLen = CHORDS.length * 2 * beat;
  }

  private flute(freq: number, dur: number, at: number) {
    const ctx = this.ctx;
    if (!ctx || !this.musicBus) return;
    const osc = ctx.createOscillator();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, at);
    const lfo = ctx.createOscillator();
    lfo.frequency.value = 5.2;
    const lfoGain = ctx.createGain();
    lfoGain.gain.setValueAtTime(0, at);
    lfoGain.gain.linearRampToValueAtTime(freq * 0.012, at + Math.min(0.25, dur));
    lfo.connect(lfoGain).connect(osc.frequency);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, at);
    g.gain.exponentialRampToValueAtTime(0.09, at + 0.06);
    g.gain.setValueAtTime(0.09, at + Math.max(0.07, dur - 0.1));
    g.gain.exponentialRampToValueAtTime(0.0001, at + dur + 0.08);
    const f = ctx.createBiquadFilter();
    f.type = 'lowpass';
    f.frequency.value = 2400;
    osc.connect(f).connect(g).connect(this.musicBus);
    osc.start(at);
    lfo.start(at);
    osc.stop(at + dur + 0.12);
    lfo.stop(at + dur + 0.12);
    this.noise(0.08, { vol: 0.008, freq: 2600, type: 'bandpass', bus: this.musicBus, at });
  }

  private bass(freq: number, dur: number, at: number) {
    this.tone(freq, dur, { type: 'triangle', vol: 0.11, attack: 0.01, bus: this.musicBus, at });
  }

  private strum(freqs: number[], at: number, vol: number) {
    freqs.forEach((f, i) => this.tone(f * 2, 0.28, { type: 'triangle', vol, attack: 0.004, bus: this.musicBus, at: at + i * 0.018 }));
  }

  private bombo(at: number) {
    this.tone(95, 0.2, { type: 'sine', vol: 0.12, slide: 42, attack: 0.004, bus: this.musicBus, at });
  }

  private shaker(at: number, vol: number) {
    this.noise(0.045, { vol, freq: 6500, type: 'highpass', bus: this.musicBus, at });
  }

  private startMusic() {
    const ctx = this.ctx;
    if (!ctx || !this.musicBus || this.timer !== null) return;
    this.musicBus.gain.cancelScheduledValues(ctx.currentTime);
    this.musicBus.gain.setValueAtTime(this.musicBus.gain.value, ctx.currentTime);
    this.musicBus.gain.linearRampToValueAtTime(0.32, ctx.currentTime + 1.5);
    this.loopStart = ctx.currentTime + 0.1;
    this.evIndex = 0;
    this.timer = window.setInterval(() => this.schedule(), 60);
    this.schedule();
  }

  private stopMusic() {
    const ctx = this.ctx;
    if (this.timer !== null) {
      clearInterval(this.timer);
      this.timer = null;
    }
    if (ctx && this.musicBus) {
      this.musicBus.gain.cancelScheduledValues(ctx.currentTime);
      this.musicBus.gain.setValueAtTime(this.musicBus.gain.value, ctx.currentTime);
      this.musicBus.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.4);
    }
  }

  private schedule() {
    const ctx = this.ctx;
    if (!ctx || this.events.length === 0) return;
    const horizon = ctx.currentTime + 0.25;
    for (let guard = 0; guard < 200; guard++) {
      const ev = this.events[this.evIndex];
      const time = this.loopStart + ev.t;
      if (time > horizon) break;
      if (time >= ctx.currentTime - 0.05) ev.fn(time);
      this.evIndex++;
      if (this.evIndex >= this.events.length) {
        this.evIndex = 0;
        this.loopStart += this.loopLen;
      }
    }
  }
}

export const audio = new AudioEngine();
