// Motor del juego: bucle de tiempo fijo, física, cámara, entidades y renderizado por capas.
import { Input } from './input';
import { audio } from './audio';
import { getSprites, type SpriteSet } from './sprites';
import { drawText, textWidth } from './font';
import {
  ANIMALS,
  INTERACTABLES,
  NPCS,
  PAGES,
  PLATFORMS,
  WORLD_W,
  Y_BOTTOM,
  Y_TOP,
  surfaceY,
  zoneAt,
  type AnimalDef,
  type Interactable,
  type NpcDef,
  type ZoneId,
} from './world';
import { renderTerrain } from './art/terrain';
import { drawProps } from './art/props';
import { buildTrees, buildTufts, drawCanopy, drawCrops, drawTrunk, drawTufts, type TreeArt } from './art/nature';
import {
  buildClouds,
  buildLayers,
  buildSky,
  drawSun,
  LAKE,
  SKY_BOTTOM,
  SKY_HORIZON_COLOR,
  SKY_TOP,
  SKY_TOP_COLOR,
  type Cloud,
  type Layer,
} from './art/sky';
import { hash, makeCanvas, px, rect } from './art/draw';
import { tr } from '../i18n';

export interface GameEvents {
  interact?(target: Interactable): void;
  zone?(id: ZoneId): void;
  page?(id: string): void;
  nearby?(target: Interactable | null): void;
  pause?(): void;
  save?(x: number, facing: 1 | -1): void;
  moved?(): void;
  frame?(x: number): void;
  ready?(): void;
}

export type GameMode = 'attract' | 'play';

const STEP = 1 / 60;
const GRAVITY = 900;
const JUMP_V = 292;
const WALK = 62;
const RUN = 118;
const ACC = 720;
const AIR_ACC = 480;
const FRICTION = 900;
const MAX_FALL = 420;
const MAX_STEP = 4;
const STEP_DOWN = 5;
const HALF_W = 4;
const X_MIN = 52;
const X_MAX = WORLD_W - 56;

type ParticleKind = 'dust' | 'mote' | 'smoke' | 'spark' | 'leaf' | 'pollen' | 'burst' | 'mist' | 'streak' | 'chaff';

interface Particle {
  kind: ParticleKind;
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  max: number;
  size: number;
  color: string;
  seed: number;
}

interface FloatText {
  text: string;
  x: number;
  y: number;
  t: number;
  color: string;
}

interface NpcState {
  def: NpcDef;
  sprite: SpriteSet;
  face: 1 | -1;
  ground: number;
  phase: number;
  group: { sprite: SpriteSet; x: number; ground: number; face: 1 | -1; phase: number }[];
}

interface AnimalState {
  def: AnimalDef;
  sprite: SpriteSet;
  x: number;
  y: number;
  target: number;
  dir: 1 | -1;
  wait: number;
  walkT: number;
  flying: number;
}

const SMOKE_SOURCES: [number, number, number][] = [
  [1000, -52, 0.9],
  [1110, -18, 0.5],
  [3474, -100, 1.1],
  [4263, -46, 1.3],
];

export class Game {
  readonly input: Input;
  private canvas: HTMLCanvasElement;
  private events: { current: GameEvents };
  private ctx: CanvasRenderingContext2D;
  private raf = 0;
  private last = 0;
  private acc = 0;
  private t = 0;
  private mode: GameMode = 'attract';
  private paused = false;
  private destroyed = false;
  private readyFired = false;

  viewW = 400;
  viewH = 225;
  private groundRatio = 0.8;
  private portrait = false;

  private camX = 700;
  private camY = -180;
  private lookahead = 0;
  private attractDir = 1;

  private player = {
    x: 1030,
    y: 0,
    vx: 0,
    vy: 0,
    facing: 1 as 1 | -1,
    onGround: true,
    coyote: 0,
    jumpBuffer: 0,
    dropTimer: 0,
    animT: 0,
    running: false,
    stepT: 0,
  };

  private terrain: HTMLCanvasElement | null = null;
  private sky: HTMLCanvasElement | null = null;
  private layers: Layer[] = [];
  private clouds: Cloud[] = [];
  private trees: TreeArt[] = [];
  private tufts: ReturnType<typeof buildTufts> = [];
  private vignette: HTMLCanvasElement | null = null;
  private sprites = getSprites();

  private npcs: NpcState[] = [];
  private animals: AnimalState[] = [];
  private particles: Particle[] = [];
  private floats: FloatText[] = [];

  private collected = new Set<string>();
  private talked = new Set<string>();
  private answered = new Set<string>();
  private done = new Set<string>();
  private objective: Interactable | null = null;

  private zone: ZoneId | null = null;
  private nearby: Interactable | null = null;
  private interactCooldown = 0;
  private saveTimer = 0;
  private lastSavedX = -1;
  private talking: string | null = null;
  private touchMode = false;
  private reduced = false;
  private wind = 0;
  private gustTimer = 6;
  private gust = 0;
  private movedFired = false;
  private ambientTimer = 0;

  constructor(canvas: HTMLCanvasElement, events: { current: GameEvents }) {
    this.canvas = canvas;
    this.events = events;
    this.ctx = canvas.getContext('2d')!;
    this.input = new Input();
    this.input.onPause = () => this.events.current.pause?.();
    this.buildWorld();
    this.resize();
    window.addEventListener('resize', this.resize);
    window.visualViewport?.addEventListener('resize', this.resize);
    this.player.y = surfaceY(this.player.x);
    this.snapCamera();
  }

  // ── Construcción ───────────────────────────────────────────────────────
  /** Terreno + decorado (los letreros dependen del idioma, por eso se puede regenerar). */
  rebuildTerrain() {
    const terrain = renderTerrain();
    const tctx = terrain.getContext('2d')!;
    tctx.imageSmoothingEnabled = false;
    for (const t of this.trees) drawTrunk(tctx, t.def);
    drawProps(tctx);
    this.terrain = terrain;
  }

  private buildWorld() {
    this.trees = buildTrees();
    this.rebuildTerrain();
    this.sky = buildSky();
    this.layers = buildLayers();
    this.clouds = buildClouds();
    this.tufts = buildTufts();

    this.npcs = NPCS.map((def, i) => ({
      def,
      sprite: this.sprites[def.sprite].idle,
      face: def.face,
      ground: surfaceY(def.x),
      phase: i * 0.37,
      group: (def.group ?? []).map((g, k) => ({
        sprite: this.sprites[g.sprite].idle,
        x: def.x + g.dx,
        ground: surfaceY(def.x + g.dx),
        face: g.face,
        phase: k * 0.5 + 0.2,
      })),
    }));

    this.animals = ANIMALS.map((def, i) => ({
      def,
      sprite: this.sprites[def.sprite].idle,
      x: def.x,
      y: surfaceY(def.x),
      target: def.x,
      dir: (i % 2 ? 1 : -1) as 1 | -1,
      wait: 1 + (i % 3),
      walkT: 0,
      flying: 0,
    }));
  }

  private resize = () => {
    const dpr = window.devicePixelRatio || 1;
    const cw = window.innerWidth;
    const ch = window.innerHeight;
    const devW = cw * dpr;
    const devH = ch * dpr;
    const portrait = ch > cw * 1.1;
    const minW = portrait ? 220 : 330;
    const minH = portrait ? 320 : 196;
    const scale = Math.max(1, Math.floor(Math.min(devW / minW, devH / minH)));
    this.viewW = Math.min(Math.ceil(devW / scale), 720);
    this.viewH = Math.min(Math.ceil(devH / scale), 640);
    this.portrait = portrait;
    this.updateGroundRatio();
    this.canvas.width = this.viewW;
    this.canvas.height = this.viewH;
    this.canvas.style.width = `${(this.viewW * scale) / dpr}px`;
    this.canvas.style.height = `${(this.viewH * scale) / dpr}px`;
    this.ctx.imageSmoothingEnabled = false;
    this.buildVignette();
    this.snapCamera();
  };

  /** Altura de la línea del suelo en pantalla: deja sitio a los controles táctiles. */
  private updateGroundRatio() {
    this.groundRatio = this.portrait ? 0.6 : this.touchMode ? 0.72 : 0.8;
  }

  private buildVignette() {
    const [c, ctx] = makeCanvas(this.viewW, this.viewH);
    const w = this.viewW;
    const h = this.viewH;
    const g = ctx.createRadialGradient(w / 2, h * 0.55, Math.min(w, h) * 0.35, w / 2, h * 0.55, Math.max(w, h) * 0.78);
    g.addColorStop(0, 'rgba(12,9,4,0)');
    g.addColorStop(1, 'rgba(12,9,4,0.55)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
    const top = ctx.createLinearGradient(0, 0, 0, 34);
    top.addColorStop(0, 'rgba(12,9,4,0.5)');
    top.addColorStop(1, 'rgba(12,9,4,0)');
    ctx.fillStyle = top;
    ctx.fillRect(0, 0, w, 34);
    this.vignette = c;
  }

  // ── API pública ────────────────────────────────────────────────────────
  start() {
    this.last = performance.now();
    const loop = (now: number) => {
      if (this.destroyed) return;
      this.raf = requestAnimationFrame(loop);
      const dt = Math.min(0.1, (now - this.last) / 1000);
      this.last = now;
      if (!this.paused) {
        this.acc += dt;
        let steps = 0;
        while (this.acc >= STEP && steps < 5) {
          this.update(STEP);
          this.acc -= STEP;
          steps++;
        }
        if (steps === 5) this.acc = 0;
      }
      this.render();
      if (!this.readyFired) {
        this.readyFired = true;
        this.events.current.ready?.();
      }
    };
    this.raf = requestAnimationFrame(loop);
  }

  destroy() {
    this.destroyed = true;
    cancelAnimationFrame(this.raf);
    window.removeEventListener('resize', this.resize);
    window.visualViewport?.removeEventListener('resize', this.resize);
    this.input.dispose();
  }

  setMode(mode: GameMode) {
    if (this.mode === mode) return;
    this.mode = mode;
    this.zone = null;
    this.setNearby(null);
    if (mode === 'play') this.snapCamera();
  }

  setPaused(p: boolean) {
    this.paused = p;
    if (!p) this.last = performance.now();
  }

  setInputEnabled(on: boolean) {
    this.input.setEnabled(on);
    if (on) this.interactCooldown = 0.25;
  }

  setTouchMode(on: boolean) {
    if (this.touchMode === on) return;
    this.touchMode = on;
    this.updateGroundRatio();
    this.snapCamera();
  }

  setReducedMotion(on: boolean) {
    this.reduced = on;
  }

  setProgress(p: { pages: string[]; talked: string[]; answered: string[]; done: string[] }) {
    this.collected = new Set(p.pages);
    this.talked = new Set(p.talked);
    this.answered = new Set(p.answered);
    this.done = new Set(p.done);
  }

  setObjective(target: Interactable | null) {
    this.objective = target;
  }

  setTalking(npcId: string | null) {
    this.talking = npcId;
  }

  /** Coloca al jugador en x (sobre el suelo) y centra la cámara. */
  teleport(x: number, facing: 1 | -1 = this.player.facing) {
    const p = this.player;
    p.x = Math.max(X_MIN, Math.min(X_MAX, x));
    p.y = surfaceY(p.x);
    p.vx = 0;
    p.vy = 0;
    p.facing = facing;
    p.onGround = true;
    this.zone = null;
    this.lastSavedX = p.x;
    this.snapCamera();
  }

  getPlayerX() {
    return this.player.x;
  }

  getFacing() {
    return this.player.facing;
  }

  floatText(text: string, color = '#e8c84a') {
    this.floats.push({ text, x: this.player.x, y: this.player.y - 30, t: 0, color });
  }

  /** Estallido de partículas doradas sobre el jugador (celebraciones). */
  celebrate() {
    for (let i = 0; i < 26; i++) {
      const a = (i / 26) * Math.PI * 2;
      this.spawn('burst', this.player.x, this.player.y - 14, Math.cos(a) * (40 + Math.random() * 40), Math.sin(a) * (40 + Math.random() * 40) - 20, 0.8, 1, i % 3 ? '#e8c84a' : '#f2ead8');
    }
  }

  // ── Actualización ──────────────────────────────────────────────────────
  private update(dt: number) {
    this.t += dt;
    this.updateWind(dt);
    if (this.mode === 'play') {
      this.updatePlayer(dt);
      this.updateZone();
      this.updateNearby();
      this.updatePages();
      this.updateSave(dt);
      if (this.interactCooldown > 0) this.interactCooldown -= dt;
      if (this.nearby && this.interactCooldown <= 0 && this.input.consume('interact')) {
        this.interactCooldown = 0.35;
        this.events.current.interact?.(this.nearby);
      }
    }
    this.updateNpcs();
    this.updateAnimals(dt);
    this.updateParticles(dt);
    this.updateCamera(dt);
    for (const f of this.floats) f.t += dt;
    this.floats = this.floats.filter(f => f.t < 1.4);
    this.input.endFrame();
  }

  private updateWind(dt: number) {
    this.gustTimer -= dt;
    if (this.gustTimer <= 0) {
      this.gust = 1;
      this.gustTimer = 8 + Math.random() * 10;
    }
    this.gust = Math.max(0, this.gust - dt * 0.35);
    const zoneBoost = zoneAt(this.camX + this.viewW / 2).id === 'montanas' ? 0.35 : 0;
    this.wind = 0.15 + zoneBoost + this.gust * 0.8;
  }

  private groundUnder(x: number) {
    let best = Infinity;
    for (let dx = -HALF_W + 1; dx <= HALF_W - 1; dx++) best = Math.min(best, surfaceY(x + dx));
    return best;
  }

  private updatePlayer(dt: number) {
    const p = this.player;
    const inp = this.input;
    const dir = (inp.down('right') ? 1 : 0) - (inp.down('left') ? 1 : 0);
    p.running = inp.down('run');
    const max = p.running ? RUN : WALK;
    if (dir !== 0) {
      p.facing = dir as 1 | -1;
      const a = p.onGround ? ACC : AIR_ACC;
      const target = dir * max;
      p.vx = p.vx < target ? Math.min(target, p.vx + a * dt) : Math.max(target, p.vx - a * dt);
      if (!this.movedFired) {
        this.movedFired = true;
        this.events.current.moved?.();
      }
    } else {
      const f = (p.onGround ? FRICTION : AIR_ACC * 0.5) * dt;
      p.vx = Math.abs(p.vx) <= f ? 0 : p.vx - Math.sign(p.vx) * f;
    }

    if (inp.consume('jump')) p.jumpBuffer = 0.13;
    else p.jumpBuffer = Math.max(0, p.jumpBuffer - dt);
    p.coyote = p.onGround ? 0.1 : Math.max(0, p.coyote - dt);
    if (p.jumpBuffer > 0 && p.coyote > 0) {
      p.vy = -JUMP_V;
      p.onGround = false;
      p.coyote = 0;
      p.jumpBuffer = 0;
      audio.play('jump');
      for (let i = 0; i < 5; i++) this.spawn('dust', p.x + (Math.random() - 0.5) * 8, p.y - 1, (Math.random() - 0.5) * 30, -Math.random() * 20, 0.4, 1, '#b89a70');
    }
    if (!inp.down('jump') && p.vy < -JUMP_V * 0.45) p.vy = -JUMP_V * 0.45;
    if (inp.consume('down') && p.onGround && p.y < surfaceY(p.x) - 2) {
      p.dropTimer = 0.22;
      p.onGround = false;
    }
    p.dropTimer = Math.max(0, p.dropTimer - dt);

    // horizontal con muros del terreno
    let nx = Math.max(X_MIN, Math.min(X_MAX, p.x + p.vx * dt));
    if (p.vx !== 0) {
      const lead = Math.round(nx + Math.sign(p.vx) * HALF_W);
      if (surfaceY(lead) < p.y - MAX_STEP) {
        nx = p.x;
        p.vx = 0;
      }
    }
    p.x = nx;

    // vertical
    const wasGround = p.onGround;
    const prevY = p.y;
    p.vy = Math.min(MAX_FALL, p.vy + GRAVITY * dt);
    let ny = p.y + p.vy * dt;
    const ground = this.groundUnder(p.x);
    let land = Infinity;
    if (p.vy >= 0 && p.dropTimer <= 0) {
      for (const pl of PLATFORMS) {
        if (p.x + HALF_W - 1 < pl.x0 || p.x - HALF_W + 1 > pl.x1) continue;
        if (prevY <= pl.y + 0.01 && ny >= pl.y && pl.y < land) land = pl.y;
      }
    }
    if (ny >= ground && ground <= land) land = ground;
    if (land === Infinity && wasGround && p.vy >= 0 && p.dropTimer <= 0 && ground - p.y <= STEP_DOWN && ground >= p.y) land = ground;

    if (land !== Infinity) {
      if (!wasGround && p.vy > 160) {
        audio.play('land');
        for (let i = 0; i < 6; i++) this.spawn('dust', p.x + (Math.random() - 0.5) * 10, land - 1, (Math.random() - 0.5) * 40, -Math.random() * 18, 0.45, 1, '#b89a70');
      }
      p.y = land;
      p.vy = 0;
      p.onGround = true;
    } else {
      p.y = ny;
      p.onGround = false;
    }

    // animación y polvo al correr
    p.animT += dt * (Math.abs(p.vx) > 5 ? (p.running ? 1.7 : 1) : 1);
    if (p.onGround && Math.abs(p.vx) > 80) {
      p.stepT -= dt;
      if (p.stepT <= 0) {
        p.stepT = 0.16;
        this.spawn('dust', p.x - p.facing * 3, p.y - 1, -p.facing * 12, -8, 0.35, 1, '#c8aa7a');
      }
    }
  }

  private updateZone() {
    const z = zoneAt(this.player.x).id;
    if (z !== this.zone) {
      this.zone = z;
      this.events.current.zone?.(z);
    }
  }

  private setNearby(t: Interactable | null) {
    if (t === this.nearby) return;
    this.nearby = t;
    this.events.current.nearby?.(t);
  }

  private updateNearby() {
    const p = this.player;
    let best: Interactable | null = null;
    let bestD = Infinity;
    for (const it of INTERACTABLES) {
      const dx = Math.abs(it.x - p.x);
      if (dx > (it.range ?? 16)) continue;
      if (Math.abs(p.y - surfaceY(it.x)) > 16) continue;
      if (dx < bestD) {
        best = it;
        bestD = dx;
      }
    }
    this.setNearby(best);
  }

  private updatePages() {
    const p = this.player;
    for (const pg of PAGES) {
      if (this.collected.has(pg.id)) continue;
      const dx = pg.x - p.x;
      const dy = pg.y - (p.y - 12);
      if (dx * dx + dy * dy < 12 * 12) {
        this.collected.add(pg.id);
        audio.play('page');
        for (let i = 0; i < 18; i++) {
          const a = (i / 18) * Math.PI * 2;
          this.spawn('burst', pg.x, pg.y, Math.cos(a) * 50, Math.sin(a) * 50, 0.6, 1, i % 2 ? '#e8c84a' : '#f2ead8');
        }
        this.events.current.page?.(pg.id);
      }
    }
  }

  private updateSave(dt: number) {
    this.saveTimer += dt;
    if (this.saveTimer >= 3) {
      this.saveTimer = 0;
      if (Math.abs(this.player.x - this.lastSavedX) > 4) {
        this.lastSavedX = this.player.x;
        this.events.current.save?.(Math.round(this.player.x), this.player.facing);
      }
    }
  }

  private updateNpcs() {
    const px0 = this.player.x;
    for (const n of this.npcs) {
      if (this.mode === 'play' && Math.abs(px0 - n.def.x) < 70) n.face = px0 < n.def.x ? -1 : 1;
      else n.face = n.def.face;
    }
  }

  private updateAnimals(dt: number) {
    const p = this.player;
    for (const a of this.animals) {
      if (a.flying > 0) {
        a.flying += dt;
        a.x += a.dir * 60 * dt;
        a.y -= 50 * dt;
        if (a.flying > 3) {
          a.flying = 0;
          a.x = a.def.x;
          a.y = surfaceY(a.x);
          a.target = a.x;
          a.wait = 4;
        }
        continue;
      }
      if (a.def.sprite === 'pigeon' && this.mode === 'play' && Math.abs(p.x - a.x) < 22 && Math.abs(p.y - a.y) < 20) {
        a.flying = 0.001;
        a.dir = p.x < a.x ? 1 : -1;
        continue;
      }
      if (a.wait > 0) {
        a.wait -= dt;
        if (a.wait <= 0) {
          const [r0, r1] = a.def.range;
          a.target = r0 + Math.random() * (r1 - r0);
          a.dir = a.target > a.x ? 1 : -1;
        }
        continue;
      }
      const step = a.def.speed * dt;
      if (Math.abs(a.target - a.x) <= step) {
        a.x = a.target;
        a.wait = 1.5 + Math.random() * 4;
      } else {
        a.x += a.dir * step;
        a.walkT += dt;
      }
      a.y = surfaceY(a.x);
    }
  }

  private spawn(kind: ParticleKind, x: number, y: number, vx: number, vy: number, life: number, size: number, color: string) {
    if (this.particles.length > (this.reduced ? 70 : 220)) return;
    this.particles.push({ kind, x, y, vx, vy, life, max: life, size, color, seed: Math.random() * 1000 });
  }

  private updateParticles(dt: number) {
    const cx = this.camX + this.viewW / 2;
    const zone = zoneAt(cx);
    const rate = this.reduced ? 0.4 : 1;
    this.ambientTimer -= dt;
    if (this.ambientTimer <= 0) {
      this.ambientTimer = 0.12 / rate;
      const x = this.camX + Math.random() * this.viewW;
      const y = this.camY + Math.random() * this.viewH * 0.85;
      switch (zone.ambient) {
        case 'mist':
          if (Math.random() < 0.18) this.spawn('mist', this.camX - 40 + Math.random() * (this.viewW + 80), -60 - Math.random() * 90, 6 + Math.random() * 6, 0, 9, 18 + Math.random() * 20, '#e4e6e0');
          if (Math.random() < 0.35) this.spawn('chaff', x, y, 20 + this.wind * 40, 4, 3, 1, '#d4b860');
          break;
        case 'smoke':
        case 'dust':
          if (Math.random() < 0.5) this.spawn('dust', x, y, 6 + this.wind * 20, -2, 4, 1, '#d8c8a0');
          break;
        case 'motes':
          this.spawn('mote', x, y + 30, (Math.random() - 0.5) * 6, -6 - Math.random() * 6, 3.5, 1, Math.random() < 0.5 ? '#e8c84a' : '#f3dc8a');
          break;
        case 'pollen':
          this.spawn('pollen', x, y, 8 + this.wind * 20, (Math.random() - 0.5) * 6, 4, 1, Math.random() < 0.5 ? '#f3dc8a' : '#ffffff');
          if (Math.random() < 0.3) this.spawn('chaff', x, y, 18 + this.wind * 30, 2, 3, 1, '#c8a64a');
          break;
      }
      if (this.gust > 0.5 && Math.random() < 0.6) this.spawn('streak', this.camX - 10, this.camY + Math.random() * this.viewH * 0.7, 160 + Math.random() * 60, 0, 1.2, 4 + Math.random() * 5, '#f2ead8');
      if (this.gust > 0.3 && Math.random() < 0.4) this.spawn('leaf', this.camX + Math.random() * this.viewW * 0.3, this.camY + Math.random() * this.viewH * 0.5, 50 + Math.random() * 40, 10, 4, 1, Math.random() < 0.5 ? '#5e8a3a' : '#9a7a30');
    }
    // humo de chimeneas y chispas del fogón
    for (const [sx, sy, every] of SMOKE_SOURCES) {
      if (sx < this.camX - 40 || sx > this.camX + this.viewW + 40) continue;
      if (hash(Math.floor(this.t * 60), sx, 3) < dt / (every * 0.5)) {
        this.spawn('smoke', sx + (Math.random() - 0.5) * 2, sy, 3 + this.wind * 14, -10 - Math.random() * 5, 3.2, 2, '#b9b3a8');
      }
    }
    if (Math.abs(1110 - cx) < this.viewW && Math.random() < 0.25) this.spawn('spark', 1110 + (Math.random() - 0.5) * 6, -5, (Math.random() - 0.5) * 10, -30 - Math.random() * 20, 0.7, 1, Math.random() < 0.5 ? '#f3dc8a' : '#e8902a');
    // destellos en actividades no completadas
    for (const it of INTERACTABLES) {
      if (it.kind !== 'activity' || !it.activity || this.done.has(it.activity)) continue;
      if (it.x < this.camX - 20 || it.x > this.camX + this.viewW + 20) continue;
      if (Math.random() < 0.05) {
        const gy = surfaceY(it.x);
        this.spawn('mote', it.x + (Math.random() - 0.5) * 18, gy - Math.random() * it.top, (Math.random() - 0.5) * 4, -10, 1.6, 1, '#f3dc8a');
      }
    }

    const ps = this.particles;
    for (let i = ps.length - 1; i >= 0; i--) {
      const q = ps[i];
      q.life -= dt;
      if (q.life <= 0) {
        ps[i] = ps[ps.length - 1];
        ps.pop();
        continue;
      }
      switch (q.kind) {
        case 'dust':
        case 'spark':
          q.vy += 30 * dt;
          break;
        case 'burst':
          q.vx *= 0.94;
          q.vy = q.vy * 0.94 + 40 * dt;
          break;
        case 'smoke':
          q.vx += this.wind * 6 * dt;
          q.size = 2 + (1 - q.life / q.max) * 4;
          break;
        case 'leaf':
        case 'chaff':
          q.vy = Math.sin(this.t * 3 + q.seed) * 12;
          break;
        case 'pollen':
          q.vy = Math.sin(this.t * 1.5 + q.seed) * 4;
          break;
      }
      q.x += q.vx * dt;
      q.y += q.vy * dt;
    }
  }

  private snapCamera() {
    const p = this.player;
    if (this.mode === 'play') {
      this.camX = Math.max(0, Math.min(WORLD_W - this.viewW, p.x - this.viewW / 2));
      this.camY = this.targetCamY();
    } else {
      this.camY = this.baseCamY();
    }
  }

  private baseCamY() {
    return -Math.round(this.viewH * this.groundRatio);
  }

  private targetCamY() {
    return Math.min(this.baseCamY(), this.player.y - this.viewH * 0.55);
  }

  private updateCamera(dt: number) {
    if (this.mode === 'attract') {
      this.camX += this.attractDir * 16 * dt;
      const lo = 360;
      const hi = WORLD_W - this.viewW - 80;
      if (this.camX > hi) this.attractDir = -1;
      if (this.camX < lo) this.attractDir = 1;
      this.camY += (this.baseCamY() - this.camY) * Math.min(1, dt * 4);
      return;
    }
    const p = this.player;
    const la = p.facing * this.viewW * 0.1 * (Math.abs(p.vx) > 5 ? 1 : 0.5);
    this.lookahead += (la - this.lookahead) * Math.min(1, dt * 2.5);
    const tx = Math.max(0, Math.min(WORLD_W - this.viewW, p.x - this.viewW / 2 + this.lookahead));
    this.camX += (tx - this.camX) * Math.min(1, dt * (this.reduced ? 12 : 7));
    this.camY += (this.targetCamY() - this.camY) * Math.min(1, dt * 5);
  }

  // ── Renderizado ────────────────────────────────────────────────────────
  private render() {
    const ctx = this.ctx;
    const W = this.viewW;
    const H = this.viewH;
    const camX = Math.round(this.camX);
    const camY = Math.round(this.camY);
    ctx.imageSmoothingEnabled = false;
    ctx.globalAlpha = 1;

    this.drawSky(camX, camY);
    this.drawLayers(camX, camY);
    this.drawWorld(camX, camY);

    for (const tree of this.trees) {
      const sx = tree.def.x - camX;
      if (sx < -40 || sx > W + 40) continue;
      drawCanopy(ctx, tree, sx, surfaceY(tree.def.x) - camY, this.t, this.wind);
    }
    drawTufts(ctx, this.tufts, camX, camY, W, this.t, this.wind, false);
    drawCrops(ctx, camX, camY, W, this.t, this.wind);
    this.drawFireAndWater(camX, camY);
    this.drawPages(camX, camY);
    this.drawAnimals(camX, camY);
    this.drawNpcs(camX, camY);
    if (this.mode === 'play') this.drawPlayer(camX, camY);
    drawTufts(ctx, this.tufts, camX, camY, W, this.t, this.wind, true);
    this.drawParticles(camX, camY);
    if (this.mode === 'play') {
      this.drawObjective(camX, camY);
      this.drawPrompt(camX, camY);
      this.drawFloats(camX, camY);
    }
    if (this.vignette) ctx.drawImage(this.vignette, 0, 0);
    if (this.mode === 'play') this.events.current.frame?.(this.player.x);
    void H;
  }

  private drawSky(camX: number, camY: number) {
    const ctx = this.ctx;
    const camY0 = this.baseCamY();
    const eff = camY0 + (camY - camY0) * 0.04;
    const top = Math.round(SKY_TOP - eff);
    const bottom = Math.round(SKY_BOTTOM - eff);
    if (top > 0) rect(ctx, 0, 0, this.viewW, top, SKY_TOP_COLOR);
    if (this.sky) for (let x = 0; x < this.viewW; x += this.sky.width) ctx.drawImage(this.sky, x, top);
    if (bottom < this.viewH) rect(ctx, 0, bottom, this.viewW, this.viewH - bottom, SKY_HORIZON_COLOR);
    drawSun(ctx, Math.round(this.viewW * 0.72 - camX * 0.012), Math.round(-150 - eff), this.t);
    // nubes altas
    for (const cl of this.clouds) if (!cl.low) this.drawCloud(cl, camX, eff);
  }

  private drawCloud(cl: Cloud, camX: number, eff: number) {
    const span = 1400 + this.viewW;
    const raw = cl.x + this.t * cl.speed - camX * cl.fx;
    const sx = (((raw % span) + span) % span) - cl.sprite.width;
    this.ctx.drawImage(cl.sprite, Math.round(sx), Math.round(cl.y - eff));
  }

  private drawLayers(camX: number, camY: number) {
    const ctx = this.ctx;
    const camY0 = this.baseCamY();
    this.layers.forEach((L, i) => {
      const eff = camY0 + (camY - camY0) * L.fx;
      const sx = -Math.round(camX * L.fx);
      const sy = Math.round(L.baseY - L.canvas.height - eff);
      ctx.drawImage(L.canvas, sx, sy);
      if (i === 0) {
        // nubes bajas entre los volcanes y las colinas
        const effC = camY0 + (camY - camY0) * 0.04;
        for (const cl of this.clouds) if (cl.low) this.drawCloud(cl, camX, effC);
      }
      if (i === 2) {
        // destellos sobre la laguna
        const surface = sy + L.canvas.height - LAKE.level;
        for (let k = 0; k < 10; k++) {
          const lx = LAKE.x0 + 6 + hash(k, Math.floor(this.t * 1.5 + k * 0.3), 5) * (LAKE.x1 - LAKE.x0 - 12);
          const ly = surface + 2 + Math.floor(hash(k, 7, 5) * 10);
          const on = hash(k, Math.floor(this.t * 4 + k), 9) < 0.5;
          if (on) rect(ctx, sx + lx, ly, 3, 1, '#e8f0f0');
        }
      }
    });
  }

  private drawWorld(camX: number, camY: number) {
    const ctx = this.ctx;
    const t = this.terrain;
    if (!t) return;
    let srcY = camY - Y_TOP;
    let dy = 0;
    let h = this.viewH;
    if (srcY < 0) {
      dy = -srcY;
      h -= dy;
      srcY = 0;
    }
    if (srcY + h > t.height) h = t.height - srcY;
    const w = Math.min(this.viewW, t.width - camX);
    if (h > 0 && w > 0) ctx.drawImage(t, camX, srcY, w, h, 0, dy, w, h);
    const bottom = Y_BOTTOM - camY;
    if (bottom < this.viewH) rect(ctx, 0, bottom, this.viewW, this.viewH - bottom, '#281a0f');
  }

  private drawFireAndWater(camX: number, camY: number) {
    const ctx = this.ctx;
    // fuego del fogón
    const fx = 1110 - camX;
    if (fx > -20 && fx < this.viewW + 20) {
      const fy = surfaceY(1110) - camY;
      const frame = Math.floor(this.t * 12);
      for (let i = -4; i <= 4; i++) {
        const hgt = 2 + Math.floor(hash(i, frame, 11) * (5 - Math.abs(i) * 0.6));
        for (let k = 0; k < hgt; k++) {
          const col = k === 0 ? '#f3dc8a' : k < hgt - 1 ? '#e8902a' : '#b8402a';
          px(ctx, fx + i, fy - 2 - k, col);
        }
      }
    }
    // agua de la pila
    const wx = 3960 - camX;
    if (wx > -20 && wx < this.viewW + 20) {
      const wy = surfaceY(3960) - camY;
      for (let k = 0; k < 6; k++) {
        const ph = (this.t * 1.6 + k / 6) % 1;
        const side = k % 2 ? 1 : -1;
        const dx = side * (3 + ph * 5);
        const dy = -21 + ph * ph * 14;
        px(ctx, wx + dx, wy + dy, k % 3 ? '#9fb7c4' : '#d2e0e4');
      }
      if (hash(Math.floor(this.t * 5), 2, 3) < 0.6) px(ctx, wx - 8 + Math.floor(hash(Math.floor(this.t * 5), 3, 3) * 16), wy - 6, '#e8f0f0');
    }
  }

  private drawPages(camX: number, camY: number) {
    const spr = this.sprites.page.idle.right[0];
    for (const pg of PAGES) {
      if (this.collected.has(pg.id)) continue;
      const sx = pg.x - camX;
      if (sx < -10 || sx > this.viewW + 10) continue;
      const bob = Math.round(Math.sin(this.t * 2.4 + pg.x) * 2);
      const sy = pg.y - camY + bob;
      const glint = (this.t * 0.6 + pg.x * 0.01) % 2 < 0.15;
      // halo dorado suave (rombo escalonado)
      const pulse = 0.18 + Math.sin(this.t * 3 + pg.x) * 0.06;
      this.ctx.globalAlpha = pulse;
      for (let r = -8; r <= 8; r++) {
        const w = (9 - Math.abs(r)) * 2;
        rect(this.ctx, sx - w / 2, sy + r, w, 1, '#f3dc8a');
      }
      this.ctx.globalAlpha = 1;
      this.ctx.drawImage(spr, Math.round(sx - 3), Math.round(sy - 4));
      if (glint) {
        px(this.ctx, sx + 3, sy - 6, '#ffffff');
        px(this.ctx, sx + 4, sy - 7, '#ffffff');
      }
    }
  }

  private drawSprite(set: SpriteSet, frame: number, face: 1 | -1, x: number, feetY: number, camX: number, camY: number) {
    const frames = face === 1 ? set.right : set.left;
    const c = frames[frame % frames.length];
    this.ctx.drawImage(c, Math.round(x - camX - c.width / 2), Math.round(feetY - camY - c.height + 1));
  }

  private drawAnimals(camX: number, camY: number) {
    for (const a of this.animals) {
      if (a.x < camX - 30 || a.x > camX + this.viewW + 30) continue;
      let frame = 0;
      if (a.flying > 0) frame = Math.floor(this.t * 10) % 2;
      else if (a.wait <= 0) frame = Math.floor(a.walkT * 4) % 2;
      else if (a.def.sprite === 'hen' || a.def.sprite === 'pigeon') frame = hash(Math.floor(this.t * 2), a.def.x, 1) < 0.3 ? 1 : 0;
      this.drawSprite(a.sprite, frame, a.dir, a.x, a.y, camX, camY);
    }
    // cóndor planeando sobre las montañas
    const cx = 360 + Math.cos(this.t * 0.11) * 250;
    const cy = -150 + Math.sin(this.t * 0.22) * 18;
    if (cx - camX > -40 && cx - camX < this.viewW + 40) {
      const flap = Math.floor(this.t * 0.8) % 7 === 0 ? Math.floor(this.t * 8) % 2 : 0;
      this.drawSprite(this.sprites.condor.idle, flap, Math.sin(this.t * 0.11) > 0 ? -1 : 1, cx, cy, camX, camY);
    }
    // bandada de pájaros cruzando el cielo
    const cycle = (this.t % 40) / 40;
    const bx = -40 + cycle * (this.viewW + 80);
    for (let i = 0; i < 4; i++) {
      const fr = Math.floor(this.t * 6 + i) % 2;
      const c = this.sprites.bird.idle.right[fr];
      this.ctx.drawImage(c, Math.round(bx - i * 9), Math.round(28 + (i % 2) * 5 + Math.sin(this.t + i) * 2));
    }
    // mariposas
    for (let i = 0; i < 5; i++) {
      const baseX = [860, 1240, 2600, 2860, 2060][i];
      const x = baseX + Math.sin(this.t * 0.7 + i * 2) * 30;
      const y = surfaceY(baseX) - 14 + Math.sin(this.t * 2.3 + i) * 6;
      if (x - camX < -10 || x - camX > this.viewW + 10) continue;
      const c = this.sprites.butterfly.idle.right[Math.floor(this.t * 9 + i) % 2];
      this.ctx.drawImage(c, Math.round(x - camX), Math.round(y - camY));
    }
  }

  private drawNpcs(camX: number, camY: number) {
    const ctx = this.ctx;
    for (const n of this.npcs) {
      if (n.def.x < camX - 60 || n.def.x > camX + this.viewW + 60) continue;
      for (const g of n.group) {
        const fr = Math.floor(this.t * 1.6 + g.phase) % 2;
        this.drawSprite(g.sprite, fr, g.face, g.x, g.ground, camX, camY);
      }
      const talking = this.talking === n.def.id;
      const fr = Math.floor(this.t * 1.2 + n.phase) % 2;
      const bob = talking && Math.floor(this.t * 7) % 2 ? -1 : 0;
      this.drawSprite(n.sprite, fr, n.face, n.def.x, n.ground + bob, camX, camY);
      if (this.mode !== 'play' || talking) continue;
      const cid = n.def.characterId;
      if (this.nearby?.characterId === cid && this.input.isEnabled()) continue;
      const mark = !this.talked.has(cid) ? this.sprites.markExcl.idle : !this.answered.has(cid) ? this.sprites.markQuest.idle : null;
      if (mark) {
        const my = n.ground - 32 + Math.round(Math.sin(this.t * 4 + n.phase) * 1.5);
        const c = mark.right[0];
        ctx.drawImage(c, Math.round(n.def.x - camX - c.width / 2), Math.round(my - camY - c.height));
      }
    }
    // la choza de Andrés también tiene marcador
    const nearHome = this.nearby?.characterId === 'andres' && this.input.isEnabled();
    if (this.mode === 'play' && !nearHome && (!this.talked.has('andres') || !this.answered.has('andres'))) {
      const c = (!this.talked.has('andres') ? this.sprites.markExcl : this.sprites.markQuest).idle.right[0];
      const my = surfaceY(1008) - 56 + Math.round(Math.sin(this.t * 4) * 1.5);
      ctx.drawImage(c, Math.round(1008 - camX - c.width / 2), Math.round(my - camY - c.height));
    }
  }

  private drawPlayer(camX: number, camY: number) {
    const p = this.player;
    const s = this.sprites.andres;
    let set = s.idle;
    let frame = Math.floor(p.animT * 1.4) % 2;
    if (!p.onGround) {
      set = p.vy < 0 ? s.jump! : s.fall!;
      frame = 0;
    } else if (Math.abs(p.vx) > 5) {
      set = s.walk!;
      frame = Math.floor(p.animT * (p.running ? 8 : 7));
    }
    // sombra
    const g = this.groundUnder(p.x);
    const dist = g - p.y;
    const sw = Math.max(4, 10 - Math.floor(dist / 8));
    this.ctx.globalAlpha = 0.35;
    rect(this.ctx, Math.round(p.x - camX - sw / 2), g - camY, sw, 1, '#0c0904');
    this.ctx.globalAlpha = 1;
    this.drawSprite(set, frame, p.facing, p.x, p.y, camX, camY);
  }

  private drawParticles(camX: number, camY: number) {
    const ctx = this.ctx;
    for (const q of this.particles) {
      const sx = q.x - camX;
      const sy = q.y - camY;
      if (sx < -40 || sx > this.viewW + 40 || sy < -40 || sy > this.viewH + 40) continue;
      const k = q.life / q.max;
      switch (q.kind) {
        case 'mist': {
          const a = Math.sin(Math.PI * (1 - k)) * 0.16;
          ctx.globalAlpha = a;
          ctx.fillStyle = q.color;
          const r = q.size;
          for (let y = -Math.floor(r / 3); y <= Math.floor(r / 3); y++) {
            const half = r * Math.sqrt(Math.max(0, 1 - (y * y) / ((r / 3) * (r / 3))));
            ctx.fillRect(Math.round(sx - half), Math.round(sy + y), Math.round(half * 2), 1);
          }
          break;
        }
        case 'smoke':
          ctx.globalAlpha = 0.45 * k;
          rect(ctx, sx - q.size / 2, sy - q.size / 2, q.size, q.size, q.color);
          break;
        case 'streak':
          ctx.globalAlpha = 0.35 * k;
          rect(ctx, sx, sy, q.size, 1, q.color);
          break;
        case 'mote':
          ctx.globalAlpha = Math.min(1, k * 2) * (0.6 + 0.4 * Math.sin(this.t * 8 + q.seed));
          px(ctx, sx, sy, q.color);
          break;
        default:
          ctx.globalAlpha = Math.min(1, k * 2.5);
          px(ctx, sx, sy, q.color);
      }
    }
    ctx.globalAlpha = 1;
  }

  private drawPrompt(camX: number, camY: number) {
    const it = this.nearby;
    // mientras flota un "+XP" no se muestra el aviso para que no se encimen
    if (!it || !this.input.isEnabled() || this.floats.length > 0) return;
    const ctx = this.ctx;
    const label = tr(it.label);
    const tw = textWidth(label);
    const keyW = this.touchMode ? 0 : 10;
    const w = tw + keyW + 8;
    const h = 13;
    const gy = surfaceY(it.x);
    const bob = Math.round(Math.sin(this.t * 5) * 1);
    const x = Math.round(it.x - camX - w / 2);
    const y = Math.round(gy - it.top - camY - h - 6 + bob);
    rect(ctx, x - 1, y - 1, w + 2, h + 2, '#0c0904');
    rect(ctx, x, y, w, h, '#c9a227');
    rect(ctx, x + 1, y + 1, w - 2, h - 2, '#17100a');
    let tx = x + 4;
    if (!this.touchMode) {
      rect(ctx, tx - 1, y + 2, 9, 9, '#e8c84a');
      rect(ctx, tx - 1, y + 10, 9, 1, '#7a6118');
      drawText(ctx, 'E', tx + 1, y + 3, '#17100a');
      tx += keyW + 1;
    }
    drawText(ctx, label, tx, y + 3, '#e8d5b0');
    rect(ctx, x + w / 2 - 1, y + h, 3, 1, '#c9a227');
    px(ctx, x + w / 2, y + h + 1, '#c9a227');
  }

  private drawObjective(camX: number, camY: number) {
    const o = this.objective;
    if (!o) return;
    const ctx = this.ctx;
    const sx = o.x - camX;
    const gy = surfaceY(o.x) - camY;
    if (sx > 6 && sx < this.viewW - 6) {
      if (this.nearby === o) return;
      const y = gy - o.top - 14 + Math.round(Math.sin(this.t * 4) * 2);
      const col = '#e8c84a';
      rect(ctx, sx - 3, y - 4, 7, 1, '#0c0904');
      for (let i = 0; i < 4; i++) {
        rect(ctx, sx - 3 + i, y - 3 + i, 7 - i * 2, 1, col);
        px(ctx, sx - 4 + i, y - 3 + i, '#0c0904');
        px(ctx, sx + 4 - i, y - 3 + i, '#0c0904');
      }
      return;
    }
    const left = sx <= 6;
    const ex = left ? 4 : this.viewW - 5;
    const ey = Math.round(this.viewH * 0.45 + Math.sin(this.t * 4) * 2);
    const dir = left ? -1 : 1;
    for (let i = 0; i < 5; i++) rect(ctx, ex - dir * i, ey - 4 + i, 1, 9 - i * 2, i === 0 ? '#e8c84a' : '#c9a227');
    const m = Math.round(Math.abs(o.x - this.player.x) / 8);
    drawText(ctx, `${m} M`, left ? ex + 3 : ex - 3, ey + 7, '#e8d5b0', { align: left ? 'left' : 'right', outline: '#0c0904' });
  }

  private drawFloats(camX: number, camY: number) {
    for (const f of this.floats) {
      const k = f.t / 1.4;
      this.ctx.globalAlpha = k < 0.7 ? 1 : 1 - (k - 0.7) / 0.3;
      drawText(this.ctx, f.text, f.x - camX, f.y - camY - k * 16, f.color, { align: 'center', outline: '#0c0904' });
    }
    this.ctx.globalAlpha = 1;
  }
}
