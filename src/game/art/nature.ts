// Vegetación animada: árboles (eucalipto, capulí, yagual), cultivos y matas de hierba/paja.
import { CROPS, TREES, WORLD_W, surfaceKind, surfaceY, Y_TOP, type TreeDef } from '../world';
import { type Ctx, makeCanvas, rect, px, ellipse, line, hash, mulberry32 } from './draw';

// ── Árboles ───────────────────────────────────────────────────────────────
export interface TreeArt {
  def: TreeDef;
  canopy: HTMLCanvasElement;
  /** Posición del lienzo de copa relativa a la base del árbol. */
  ox: number;
  oy: number;
}

type Palette = { out: string; dark: string; mid: string; light: string; hi: string };

const EUCA: Palette = { out: '#26382e', dark: '#3a5446', mid: '#557563', light: '#739482', hi: '#94b09c' };
const CAPULI: Palette = { out: '#1c3019', dark: '#2c4d2a', mid: '#3f6e38', light: '#5a8f47', hi: '#78a85a' };
const YAGUAL: Palette = { out: '#223220', dark: '#34502f', mid: '#4a6a3e', light: '#62824e', hi: '#7e9a62' };

/** Dibuja un grupo de hojas con sombreado (luz desde arriba a la izquierda). */
function clump(ctx: Ctx, cx: number, cy: number, rx: number, ry: number, pal: Palette, seed: number) {
  ellipse(ctx, cx, cy, rx + 1, ry + 1, pal.out);
  for (let y = -Math.floor(ry); y <= Math.floor(ry); y++) {
    const t = 1 - (y * y) / (ry * ry);
    if (t < 0) continue;
    const half = rx * Math.sqrt(t);
    for (let x = Math.round(-half); x < Math.round(half); x++) {
      const n = hash(Math.round(cx + x), Math.round(cy + y), seed);
      const shade = (-x / rx) * 0.6 + (-y / ry) * 0.8 + (n - 0.5) * 0.9;
      const col = shade > 0.75 ? pal.hi : shade > 0.2 ? pal.light : shade > -0.45 ? pal.mid : pal.dark;
      px(ctx, cx + x, cy + y, col);
    }
  }
}

function buildEucalipto(def: TreeDef): TreeArt {
  const rnd = mulberry32(def.seed * 977);
  const w = 46;
  const h = Math.round(def.h * 0.78);
  const [c, ctx] = makeCanvas(w, h);
  const cx = w / 2;
  const n = 7;
  for (let i = 0; i < n; i++) {
    const t = i / (n - 1);
    const x = cx + (rnd() - 0.5) * 26 * (0.6 + t * 0.4);
    const y = 6 + (1 - t) * (h - 18) + rnd() * 6;
    const rx = 5 + rnd() * 5;
    const ry = 3 + rnd() * 3.5;
    clump(ctx, x, y, rx, ry, EUCA, def.seed + i);
    // hojas colgantes
    for (let k = 0; k < 4; k++) {
      const lx = Math.round(x + (rnd() - 0.5) * rx * 1.6);
      const len = 1 + Math.floor(rnd() * 3);
      rect(ctx, lx, Math.round(y + ry - 1), 1, len, EUCA.dark);
    }
  }
  return { def, canopy: c, ox: -Math.round(cx), oy: -Math.round(def.h * 0.98) };
}

function buildCapuli(def: TreeDef): TreeArt {
  const rnd = mulberry32(def.seed * 613);
  const w = 40;
  const h = Math.round(def.h * 0.75);
  const [c, ctx] = makeCanvas(w, h);
  const cx = w / 2;
  const blobs: [number, number, number, number][] = [
    [cx - 7, h * 0.55, 9, 7],
    [cx + 7, h * 0.55, 9, 7],
    [cx, h * 0.38, 11, 8],
    [cx + (rnd() - 0.5) * 4, h * 0.62, 12, 7],
  ];
  blobs.forEach(([x, y, rx, ry], i) => clump(ctx, x, y, rx, ry, CAPULI, def.seed * 10 + i));
  for (let i = 0; i < 14; i++) {
    const [bx0, by0, rx, ry] = blobs[i % blobs.length];
    const a = rnd() * Math.PI * 2;
    const r = Math.sqrt(rnd()) * 0.8;
    px(ctx, bx0 + Math.cos(a) * rx * r, by0 + Math.sin(a) * ry * r, rnd() < 0.5 ? '#7a1e22' : '#3a0e10');
  }
  return { def, canopy: c, ox: -Math.round(cx), oy: -Math.round(def.h) };
}

function buildYagual(def: TreeDef): TreeArt {
  const rnd = mulberry32(def.seed * 431);
  const w = 34;
  const h = Math.round(def.h * 0.7);
  const [c, ctx] = makeCanvas(w, h);
  const cx = w / 2;
  for (let i = 0; i < 5; i++) {
    const x = cx + (rnd() - 0.5) * 20;
    const y = 5 + rnd() * (h - 12);
    clump(ctx, x, y, 4 + rnd() * 3, 2.5 + rnd() * 2, YAGUAL, def.seed * 7 + i);
  }
  return { def, canopy: c, ox: -Math.round(cx), oy: -Math.round(def.h) };
}

export function buildTrees(): TreeArt[] {
  return TREES.map(def =>
    def.kind === 'eucalipto' ? buildEucalipto(def) : def.kind === 'capuli' ? buildCapuli(def) : buildYagual(def),
  );
}

/** Tronco estático (se dibuja una vez en el lienzo del terreno). */
export function drawTrunk(ctx: Ctx, def: TreeDef) {
  const gy = surfaceY(def.x) - Y_TOP;
  const x = def.x;
  if (def.kind === 'eucalipto') {
    const th = Math.round(def.h * 0.86);
    for (let i = 0; i < th; i++) {
      const t = i / th;
      const wv = t < 0.25 ? 4 : t < 0.7 ? 3 : 2;
      const ox = Math.round(Math.sin(t * 3 + def.seed) * 1.5);
      const y = gy - i;
      rect(ctx, x - Math.floor(wv / 2) + ox - 1, y, wv + 2, 1, '#4e4436');
      rect(ctx, x - Math.floor(wv / 2) + ox, y, wv, 1, hash(x, y, def.seed) < 0.18 ? '#9a8e78' : '#c9bda4');
      if (wv > 2) px(ctx, x + Math.ceil(wv / 2) + ox - 1, y, '#a89c84');
    }
    const rnd = mulberry32(def.seed * 31);
    for (let b = 0; b < 3; b++) {
      const by = gy - Math.round(th * (0.5 + b * 0.14));
      const dir = b % 2 ? 1 : -1;
      line(ctx, x, by, x + dir * (5 + Math.round(rnd() * 5)), by - 6 - Math.round(rnd() * 4), '#8e8270');
    }
    ellipse(ctx, x, gy, 5, 1, '#3a4a2a');
  } else if (def.kind === 'capuli') {
    const th = Math.round(def.h * 0.55);
    for (let i = 0; i < th; i++) {
      const y = gy - i;
      rect(ctx, x - 2, y, 5, 1, '#1f140c');
      rect(ctx, x - 1, y, 3, 1, i % 5 === 0 ? '#3a2010' : '#5a3620');
    }
    line(ctx, x, gy - th + 2, x - 6, gy - th - 5, '#4a2a18');
    line(ctx, x, gy - th + 2, x + 6, gy - th - 4, '#4a2a18');
    ellipse(ctx, x, gy, 6, 1, '#2f4a24');
  } else {
    const th = Math.round(def.h * 0.6);
    const rnd = mulberry32(def.seed * 17);
    for (const lean of [-1, 1]) {
      let cx = x;
      for (let i = 0; i < th; i++) {
        if (i % 4 === 0) cx += Math.round((rnd() - 0.5) * 2 + lean * 0.6);
        const y = gy - i;
        rect(ctx, cx - 1, y, 3, 1, '#4a2a18');
        px(ctx, cx, y, hash(cx, y, 5) < 0.3 ? '#d8a078' : '#a8643f');
      }
    }
  }
}

/** Dibuja la copa de un árbol mecida por el viento (franjas horizontales desplazadas). */
export function drawCanopy(ctx: Ctx, art: TreeArt, sx: number, sy: number, t: number, wind: number) {
  const c = art.canopy;
  const x0 = Math.round(sx + art.ox);
  const y0 = Math.round(sy + art.oy);
  const amp = 0.6 + wind * 1.8;
  const phase = art.def.seed * 1.7;
  for (let y = 0; y < c.height; y += 2) {
    const k = 1 - y / c.height;
    const off = Math.round(Math.sin(t * 1.3 + phase + y * 0.05) * amp * k * k);
    ctx.drawImage(c, 0, y, c.width, 2, x0 + off, y0 + y, c.width, 2);
  }
}

// ── Matas de hierba y paja (sprites cacheados por inclinación) ────────────
interface TuftDef {
  x: number;
  kind: 'grass' | 'paramo';
  size: number;
  fg: boolean;
}

const tuftCache = new Map<string, HTMLCanvasElement>();

function tuftSprite(kind: 'grass' | 'paramo', size: number, lean: number): HTMLCanvasElement {
  const key = `${kind}${size}${lean}`;
  const hit = tuftCache.get(key);
  if (hit) return hit;
  const w = 15;
  const h = 12;
  const [c, ctx] = makeCanvas(w, h);
  const base = h - 1;
  const cx = 7;
  const blades = kind === 'paramo' ? 6 : 4;
  const height = kind === 'paramo' ? 6 + size * 2 : 3 + size;
  const cols = kind === 'paramo' ? ['#9a7a30', '#c8a64a', '#e0c46a', '#b89a48'] : ['#3f6a2e', '#5e8a3a', '#7aa04a', '#8db552'];
  for (let b = 0; b < blades; b++) {
    const spread = (b - (blades - 1) / 2) * (kind === 'paramo' ? 1.6 : 1.3);
    const bh = height - Math.abs(spread) * 0.5;
    line(ctx, cx + Math.round(spread * 0.3), base, cx + Math.round(spread + lean), base - Math.round(bh), cols[b % cols.length]);
  }
  tuftCache.set(key, c);
  return c;
}

export function buildTufts(): TuftDef[] {
  const out: TuftDef[] = [];
  for (let x = 244; x < WORLD_W - 60; x += 5) {
    const kind = surfaceKind(x);
    const n = hash(x, 1, 77);
    if (kind === 'paramo' && n < 0.5) out.push({ x, kind: 'paramo', size: Math.floor(hash(x, 2, 77) * 3), fg: hash(x, 3, 77) < 0.18 });
    else if (kind === 'grass' && n < 0.3) out.push({ x, kind: 'grass', size: Math.floor(hash(x, 2, 77) * 3), fg: hash(x, 3, 77) < 0.15 });
  }
  return out;
}

export function drawTufts(ctx: Ctx, tufts: TuftDef[], camX: number, camY: number, viewW: number, t: number, wind: number, fg: boolean) {
  for (const tf of tufts) {
    if (tf.fg !== fg) continue;
    const sx = tf.x - camX;
    if (sx < -16 || sx > viewW + 16) continue;
    const s = Math.sin(t * 2.1 + tf.x * 0.09) * (0.6 + wind * 1.6);
    const lean = Math.max(-2, Math.min(2, Math.round(s)));
    const spr = tuftSprite(tf.kind, tf.size, lean);
    ctx.drawImage(spr, Math.round(sx - 7), Math.round(surfaceY(tf.x) - camY - spr.height + 2));
  }
}

// ── Cultivos ──────────────────────────────────────────────────────────────
function drawMaize(ctx: Ctx, sx: number, sy: number, seed: number, t: number, wind: number) {
  const h = 15 + Math.floor(hash(seed, 1, 5) * 7);
  const sway = Math.sin(t * 1.5 + seed * 0.13) * (0.7 + wind * 1.4);
  const off = (i: number) => Math.round(sway * (i / h) * (i / h) * 2.4);
  for (let i = 0; i < h; i++) {
    px(ctx, sx + off(i), sy - i, i < 3 ? '#4a6a2a' : '#6a8a3a');
  }
  const leafRows = [Math.floor(h * 0.3), Math.floor(h * 0.5), Math.floor(h * 0.72)];
  leafRows.forEach((i, k) => {
    const side = (k % 2 ? 1 : -1) * (hash(seed, k, 2) < 0.5 ? 1 : -1);
    const o = off(i);
    px(ctx, sx + o + side, sy - i, '#5e8a3a');
    px(ctx, sx + o + side * 2, sy - i + 1, '#7aa04a');
    px(ctx, sx + o + side * 3, sy - i + 2, '#5e8a3a');
    px(ctx, sx + o + side * 4, sy - i + 3, '#4a7c3a');
  });
  const ci = Math.floor(h * 0.42);
  const co = off(ci);
  rect(ctx, sx + co + 1, sy - ci - 2, 1, 3, '#e0c46a');
  px(ctx, sx + co + 1, sy - ci - 3, '#9aa860');
  const to = off(h);
  px(ctx, sx + to, sy - h, '#e0cc80');
  px(ctx, sx + to - 1, sy - h + 1, '#c8a64a');
  px(ctx, sx + to + 1, sy - h + 1, '#c8a64a');
}

function drawWheat(ctx: Ctx, sx: number, sy: number, seed: number, t: number, wind: number) {
  const h = 8 + Math.floor(hash(seed, 2, 6) * 5);
  const sway = Math.sin(t * 2 + seed * 0.21) * (0.6 + wind * 1.5);
  const o = Math.round(sway * 1.6);
  rect(ctx, sx, sy - h + 4, 1, h - 4, hash(seed, 3, 6) < 0.5 ? '#b89a48' : '#c8a64a');
  px(ctx, sx + Math.round(o / 2), sy - h + 3, '#c8a64a');
  rect(ctx, sx + o, sy - h, 1, 3, hash(seed, 4, 6) < 0.5 ? '#e0c46a' : '#d4b860');
}

export function drawCrops(ctx: Ctx, camX: number, camY: number, viewW: number, t: number, wind: number) {
  for (const r of CROPS) {
    if (r.x1 < camX - 8 || r.x0 > camX + viewW + 8) continue;
    const step = r.kind === 'maize' ? 6 : 2;
    for (let x = r.x0; x <= r.x1; x += step) {
      const sx = x - camX;
      if (sx < -8 || sx > viewW + 8) continue;
      const sy = surfaceY(x) - camY;
      if (r.kind === 'maize') drawMaize(ctx, sx, sy, x, t, wind);
      else drawWheat(ctx, sx, sy, x, t, wind);
    }
  }
}
