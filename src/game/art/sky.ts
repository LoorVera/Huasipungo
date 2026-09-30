// Cielo, sol, nubes y capas de fondo con parallax (volcanes, chacras, laguna).
import { WORLD_W } from '../world';
import { type Ctx, makeCanvas, rect, px, hash, mulberry32, noise1, u32, mix } from './draw';

// ── Cielo ─────────────────────────────────────────────────────────────────
const SKY_BANDS = ['#22384f', '#2a435c', '#334f69', '#3e5b75', '#4d6a80', '#607b8b', '#768c94', '#8e9c98', '#a9aa98', '#c3b996', '#d9c796', '#e6d29e'];
/** El lienzo del cielo abarca de SKY_TOP a SKY_BOTTOM (coordenadas del mundo). */
export const SKY_TOP = -330;
export const SKY_BOTTOM = -6;

export function buildSky(): HTMLCanvasElement {
  const h = SKY_BOTTOM - SKY_TOP;
  const w = 64;
  const [c, ctx] = makeCanvas(w, h);
  const bandH = h / SKY_BANDS.length;
  for (let y = 0; y < h; y++) {
    const f = y / bandH;
    const i = Math.min(SKY_BANDS.length - 1, Math.floor(f));
    const frac = f - i;
    for (let x = 0; x < w; x++) {
      let col = SKY_BANDS[i];
      // tramado en la transición entre bandas
      if (i < SKY_BANDS.length - 1 && frac > 0.72 && (x + y) % 2 === 0) col = SKY_BANDS[i + 1];
      else if (i < SKY_BANDS.length - 1 && frac > 0.9) col = SKY_BANDS[i + 1];
      px(ctx, x, y, col);
    }
  }
  return c;
}

export const SKY_TOP_COLOR = SKY_BANDS[0];
export const SKY_HORIZON_COLOR = SKY_BANDS[SKY_BANDS.length - 1];

export function drawSun(ctx: Ctx, sx: number, sy: number, t: number) {
  const glow: [number, string, number][] = [
    [34, '#f7e3a8', 0.07],
    [24, '#f7e3a8', 0.12],
    [16, '#fbeec4', 0.22],
  ];
  const pulse = 1 + Math.sin(t * 0.6) * 0.04;
  for (const [r, col, a] of glow) {
    ctx.globalAlpha = a;
    const rr = r * pulse;
    ctx.fillStyle = col;
    for (let y = -Math.floor(rr); y <= Math.floor(rr); y++) {
      const half = Math.sqrt(Math.max(0, rr * rr - y * y));
      ctx.fillRect(Math.round(sx - half), Math.round(sy + y), Math.round(half * 2), 1);
    }
  }
  ctx.globalAlpha = 1;
  for (let y = -8; y <= 8; y++) {
    const half = Math.sqrt(64 - y * y);
    rect(ctx, sx - half, sy + y, half * 2, 1, y < -3 ? '#fff6d6' : '#fdeab4');
  }
}

// ── Nubes ─────────────────────────────────────────────────────────────────
export interface Cloud {
  sprite: HTMLCanvasElement;
  x: number;
  y: number;
  speed: number;
  fx: number;
  low: boolean;
}

function makeCloud(seed: number, wide: boolean): HTMLCanvasElement {
  const rnd = mulberry32(seed);
  const w = Math.round((wide ? 90 : 46) + rnd() * (wide ? 50 : 30));
  const h = Math.round((wide ? 30 : 16) + rnd() * (wide ? 14 : 8));
  const [c, ctx] = makeCanvas(w, h);
  const n = 5 + Math.floor(rnd() * 4);
  const circles: [number, number, number][] = [];
  const maxR = (h - 3) / 2;
  for (let i = 0; i < n; i++) {
    const t = i / (n - 1);
    // cúmulos: bolas más grandes en el centro, apoyadas sobre una base plana
    const r = Math.min(maxR, maxR * (0.42 + 0.58 * Math.sin(Math.PI * t)) * (0.85 + rnd() * 0.2));
    const cx = w * (0.12 + 0.76 * t) + (rnd() - 0.5) * 6;
    const cy = h - 2 - r * 0.92;
    circles.push([cx, cy, r]);
  }
  const inside = (x: number, y: number) => {
    if (y > h - 2) return false;
    for (const [cx, cy, r] of circles) if ((x - cx) ** 2 + (y - cy) ** 2 <= r * r) return true;
    return false;
  };
  for (let x = 0; x < w; x++) {
    let depth = 0;
    for (let y = 0; y < h; y++) {
      if (!inside(x + 0.5, y + 0.5)) {
        depth = 0;
        continue;
      }
      depth++;
      const n2 = hash(x, y, seed);
      const yr = y / h;
      let col: string;
      if (depth <= 1) col = x < w * 0.55 ? '#fbeec8' : '#f3ecdc';
      else if (depth <= 2 && n2 < 0.6) col = '#f1eadb';
      else if (yr > 0.78) col = n2 < 0.5 ? '#8f96a0' : '#9ea4ac';
      else if (yr > 0.6) col = n2 < 0.3 ? '#b4b7b8' : '#c2c3c0';
      else col = n2 < 0.25 ? '#d9d5ca' : '#e6e1d4';
      px(ctx, x, y, col);
    }
  }
  return c;
}

export function buildClouds(): Cloud[] {
  const rnd = mulberry32(2024);
  const clouds: Cloud[] = [];
  for (let i = 0; i < 9; i++) {
    const low = i >= 6;
    clouds.push({
      sprite: makeCloud(100 + i * 37, !low && i % 3 !== 2),
      x: rnd() * 1400,
      y: low ? -78 - rnd() * 20 : -130 - rnd() * 150,
      speed: 1.5 + rnd() * 3,
      fx: low ? 0.12 : 0.03 + rnd() * 0.04,
      low,
    });
  }
  return clouds;
}

// ── Capas de fondo ───────────────────────────────────────────────────────
export interface Layer {
  canvas: HTMLCanvasElement;
  fx: number;
  /** Coordenada y del mundo donde queda el borde inferior del lienzo. */
  baseY: number;
}

/** Pinta una silueta: profile(x) = altura desde abajo. color(x, y, top) = entero ABGR o 0. */
function paintLayer(w: number, h: number, profile: (x: number) => number, color: (x: number, y: number, top: number) => number) {
  const [c, ctx] = makeCanvas(w, h);
  const img = ctx.createImageData(w, h);
  const out = new Uint32Array(img.data.buffer);
  for (let x = 0; x < w; x++) {
    const top = Math.round(h - profile(x));
    for (let y = Math.max(0, top); y < h; y++) {
      const v = color(x, y, top);
      if (v) out[y * w + x] = v;
    }
  }
  ctx.putImageData(img, 0, 0);
  return c;
}

const HAZE = '#b8b49e';

function farLayer(): Layer {
  const w = Math.ceil(WORLD_W * 0.08 + 620);
  const h = 190;
  const volcanoes = [
    { cx: 150, H: 172, R: 118, snow: 0.62, jag: 0.15 },
    { cx: 470, H: 138, R: 92, snow: 0.8, jag: 0.5 },
    { cx: 760, H: 160, R: 110, snow: 0.66, jag: 0.2 },
    { cx: 960, H: 120, R: 80, snow: 0.82, jag: 0.4 },
  ];
  const ridge = (x: number) => 64 + noise1(x / 38, 3) * 26 + noise1(x / 11, 4) * 8;
  const vHeight = (x: number) => {
    let best = 0;
    for (const v of volcanoes) {
      const d = Math.abs(x - v.cx) / v.R;
      if (d >= 1) continue;
      let hh = v.H * Math.pow(1 - d, 0.95);
      hh += (noise1(x / 5, v.cx) - 0.5) * 10 * v.jag * (1 - d);
      if (hh > v.H - 4) hh = v.H - 4 + (hh - (v.H - 4)) * 0.3;
      best = Math.max(best, hh);
    }
    return best;
  };
  const colVol: ((typeof volcanoes)[number] | null)[] = [];
  const colH: number[] = [];
  for (let x = 0; x < w; x++) {
    const vh = vHeight(x);
    const rh = ridge(x);
    colH.push(Math.max(vh, rh));
    let vol: (typeof volcanoes)[number] | null = null;
    if (vh >= rh) for (const v of volcanoes) if (Math.abs(x - v.cx) < v.R) vol = v;
    colVol.push(vol);
  }
  const profile = (x: number) => colH[x];
  const canvas = paintLayer(w, h, profile, (x, y, top) => {
    const hFromBottom = h - y;
    const n = hash(x, y, 31);
    const vol = colVol[x];
    const lit = vol ? x < vol.cx : noise1(x / 9, 5) > 0.5;
    if (vol) {
      const snowLine = vol.H * vol.snow + (noise1(x / 3, vol.cx + 1) - 0.5) * 14;
      if (hFromBottom > snowLine) {
        if (y - top < 1) return u32('#ffffff');
        return u32(lit ? (n < 0.12 ? '#dfe7ea' : '#f2f5f4') : n < 0.2 ? '#aebcc6' : '#c3cfd6');
      }
    }
    if (y - top === 0) return u32(lit ? '#8a9aa8' : '#6d7d8c');
    const haze = Math.min(1, Math.max(0, (hFromBottom < 60 ? (60 - hFromBottom) / 60 : 0) * 0.85));
    let base = lit ? '#6d7f91' : '#5a6b7d';
    if (hash(x >> 1, y >> 2, 8) < 0.07) base = '#4f5f70';
    if (n < 0.06) base = lit ? '#7a8b9c' : '#667689';
    return u32(mix(base, HAZE, haze * 0.8));
  });
  return { canvas, fx: 0.08, baseY: 26 };
}

const FIELD_COLS = ['#6f8a4a', '#86994f', '#9aa35a', '#b3a55c', '#7c8f52', '#5f7a45', '#a8a060', '#8a9a55'];

function midLayer(): Layer {
  const w = Math.ceil(WORLD_W * 0.22 + 620);
  const h = 130;
  const profile = (x: number) => 46 + Math.sin(x / 61) * 16 + Math.sin(x / 23 + 1.3) * 7 + noise1(x / 17, 9) * 12;
  const canvas = paintLayer(w, h, profile, (x, y, top) => {
    const d = y - top;
    const fx = Math.floor((x + noise1(y / 6, 2) * 10) / (16 + Math.floor(hash(Math.floor(y / 9), 3, 3) * 10)));
    const fy = Math.floor((d + noise1(x / 20, 4) * 5) / 8);
    const nx = Math.floor((x + 1 + noise1(y / 6, 2) * 10) / (16 + Math.floor(hash(Math.floor(y / 9), 3, 3) * 10)));
    const ny = Math.floor((d + 1 + noise1(x / 20, 4) * 5) / 8);
    if (d === 0) return u32('#8c9a62');
    if (nx !== fx || ny !== fy) return u32(mix('#56663e', HAZE, 0.25));
    let col = FIELD_COLS[Math.floor(hash(fx, fy, 5) * FIELD_COLS.length)];
    if (hash(x, y, 6) < 0.1) col = mix(col, '#3f5030', 0.3);
    return u32(mix(col, HAZE, 0.3));
  });
  return { canvas, fx: 0.22, baseY: 22 };
}

/** Laguna andina en la capa cercana (visible detrás de la Zona de Aprendizaje). */
export const LAKE = { x0: 760, x1: 1070, level: 30 };

function nearLayer(): Layer {
  const w = Math.ceil(WORLD_W * 0.45 + 620);
  const h = 110;
  const { x0: lk0, x1: lk1, level } = LAKE;
  const hills = (x: number) => 30 + Math.sin(x / 47) * 12 + noise1(x / 13, 21) * 10;
  const profile = (x: number) => {
    const p = hills(x);
    if (x <= lk0 - 50 || x >= lk1 + 50) return p;
    // orillas: el relieve baja suavemente hasta el nivel del agua
    const dist = x < lk0 ? lk0 - x : x > lk1 ? x - lk1 : 0;
    const k = 1 - Math.min(1, dist / 50);
    return p * (1 - k) + (level - 1) * k;
  };
  const canvas = paintLayer(w, h, profile, (x, y, top) => {
    const d = y - top;
    const n = hash(x, y, 71);
    const hFromBottom = h - y;
    if (x > lk0 - 30 && x < lk1 + 30 && hFromBottom <= level) {
      // agua: reflejos horizontales y orilla más oscura
      const depth = level - hFromBottom;
      if (depth === 0) return u32('#c9d8dc');
      if (depth <= 2) return u32(n < 0.5 ? '#7f9cac' : '#6f8796');
      if ((y + (x >> 4)) % 5 === 0 && n < 0.45) return u32('#a9c0c8');
      return u32(n < 0.12 ? '#7f9cac' : '#5f7f94');
    }
    if (d === 0) return u32('#6a8a4e');
    if (d === 1 && n < 0.5) return u32('#5e7e46');
    const band = Math.floor((d + noise1(x / 15, 3) * 6) / 12);
    const cols = ['#4f6f42', '#48673c', '#557548', '#43603a'];
    let col = cols[(band + Math.floor(x / 60)) % cols.length];
    if (n < 0.08) col = '#3c5634';
    return u32(mix(col, HAZE, 0.12));
  });
  const ctx = canvas.getContext('2d')!;
  const rnd = mulberry32(55);
  const topAt = (x: number) => Math.round(h - profile(x));
  // hileras de eucaliptos
  for (let x = 20; x < w - 20; x += 7 + Math.floor(rnd() * 16)) {
    if (x > lk0 - 40 && x < lk1 + 36) continue;
    const th = 10 + Math.floor(rnd() * 20);
    const ty = topAt(x) + 2;
    for (let i = 0; i < th; i++) {
      const wv = i > th * 0.3 ? 3 : 1;
      rect(ctx, x - Math.floor(wv / 2), ty - i, wv, 1, i > th * 0.3 ? (hash(x, i, 3) < 0.3 ? '#3a5838' : '#2e4a32') : '#3e3a30');
    }
  }
  // casitas blancas con techo rojo y una capilla
  const houseAt = (x: number, chapel = false) => {
    const ty = topAt(x) + 3;
    if (chapel) {
      rect(ctx, x, ty - 9, 9, 9, '#e0d8c4');
      rect(ctx, x - 1, ty - 11, 11, 2, '#9a3a2a');
      rect(ctx, x - 4, ty - 15, 4, 15, '#e8e0cc');
      rect(ctx, x - 4, ty - 17, 4, 2, '#9a3a2a');
      px(ctx, x - 2, ty - 19, '#c9a227');
      rect(ctx, x + 3, ty - 5, 2, 4, '#5a3a22');
      rect(ctx, x, ty - 2, 9, 1, '#9a3a2a');
      return;
    }
    rect(ctx, x, ty - 4, 6, 4, '#d8d0bc');
    rect(ctx, x - 1, ty - 6, 8, 2, '#8a3a2a');
    px(ctx, x + 2, ty - 2, '#5a3a22');
  };
  for (let i = 0; i < 26; i++) {
    const hx = 20 + Math.floor(rnd() * (w - 40));
    if (hx > lk0 - 34 && hx < lk1 + 30) continue;
    houseAt(hx);
  }
  // capilla blanca a orillas de la laguna (como en la imagen de referencia)
  houseAt(lk1 + 44, true);
  houseAt(lk1 + 60);
  houseAt(lk0 - 52);
  return { canvas, fx: 0.45, baseY: 16 };
}

export function buildLayers(): Layer[] {
  return [farLayer(), midLayer(), nearLayer()];
}
