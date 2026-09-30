// Terreno pre-renderizado píxel a píxel (ImageData): superficie por zona y estratos de suelo.
import { WORLD_W, Y_TOP, Y_BOTTOM, getHeightmap, surfaceKind, type SurfaceKind } from '../world';
import { hash, u32 } from './draw';

const K = {
  grassHi: u32('#8db552'),
  grassLight: u32('#7aa04a'),
  grass: u32('#5e8a3a'),
  grassDark: u32('#3f6a2e'),
  strawHi: u32('#e6cc78'),
  strawLight: u32('#d4b860'),
  straw: u32('#b89a48'),
  strawDark: u32('#8e7434'),
  dirtLight: u32('#9a7a54'),
  dirt: u32('#86663f'),
  dirtDark: u32('#6e5232'),
  field: u32('#5a3e24'),
  fieldRidge: u32('#71502f'),
  fieldDark: u32('#4a3220'),
  sprout: u32('#6f9a3e'),
  patioLight: u32('#b8ab92'),
  patio: u32('#a0937a'),
  patioLine: u32('#6e6452'),
  roadLight: u32('#a8885e'),
  road: u32('#927250'),
  roadRut: u32('#735838'),
  cobbleLight: u32('#a39a8a'),
  cobble: u32('#878070'),
  cobbleLine: u32('#57504a'),
  soilTop: u32('#6b4a2e'),
  soil: u32('#664529'),
  soilSpeckL: u32('#7d5834'),
  soilSpeckD: u32('#523722'),
  soilDark: u32('#523722'),
  soilDeep: u32('#3d2918'),
  soilDeepest: u32('#281a0f'),
  root: u32('#5e4128'),
  stoneLight: u32('#9c9280'),
  stone: u32('#7d7466'),
  stoneDark: u32('#5a534a'),
  rockHi: u32('#a39a88'),
  rock1: u32('#7d7566'),
  rock2: u32('#6e675a'),
  rock3: u32('#5f594e'),
  rockCrack: u32('#3e3931'),
  moss: u32('#6f7f4a'),
  mossLight: u32('#8a9a5a'),
};

/** Piedra incrustada en el subsuelo (celdas con elipses). */
function stoneAt(x: number, y: number): number {
  const cw = 11;
  const ch = 8;
  const gx = Math.floor(x / cw);
  const gy = Math.floor(y / ch);
  for (let oy = -1; oy <= 0; oy++) {
    for (let ox = -1; ox <= 0; ox++) {
      const cx0 = gx + ox;
      const cy0 = gy + oy;
      if (hash(cx0, cy0, 7) > 0.3) continue;
      const cx = cx0 * cw + 3 + hash(cx0, cy0, 8) * (cw - 2);
      const cy = cy0 * ch + 2 + hash(cx0, cy0, 9) * (ch - 2);
      const rx = 1.6 + hash(cx0, cy0, 10) * 2.6;
      const ry = 1.1 + hash(cx0, cy0, 11) * 1.6;
      const dx = (x + 0.5 - cx) / rx;
      const dy = (y + 0.5 - cy) / ry;
      const d = dx * dx + dy * dy;
      if (d <= 1) {
        if (dy > 0.45) return K.stoneDark;
        if (dx < -0.1 && dy < -0.1) return K.stoneLight;
        return K.stone;
      }
    }
  }
  return 0;
}

/** Ruido celular: bloques de roca irregulares (distancias al punto más cercano y al segundo). */
function worley(x: number, y: number) {
  const cw = 13;
  const ch = 9;
  const gx = Math.floor(x / cw);
  const gy = Math.floor(y / ch);
  let f1 = 1e9;
  let f2 = 1e9;
  let id = 0;
  let py1 = 0;
  for (let oy = -1; oy <= 1; oy++) {
    for (let ox = -1; ox <= 1; ox++) {
      const cx = gx + ox;
      const cy = gy + oy;
      const px = (cx + 0.15 + hash(cx, cy, 31) * 0.7) * cw;
      const py = (cy + 0.15 + hash(cx, cy, 32) * 0.7) * ch;
      const dx = x - px;
      const dy = (y - py) * 1.35;
      const dd = dx * dx + dy * dy;
      if (dd < f1) {
        f2 = f1;
        f1 = dd;
        id = cx * 7919 + cy * 104729;
        py1 = py;
      } else if (dd < f2) f2 = dd;
    }
  }
  return { edge: Math.sqrt(f2) - Math.sqrt(f1), id, above: y < py1 };
}

function rockColor(x: number, y: number, d: number): number {
  const n = hash(x, y, 3);
  if (d === 0) return n < 0.45 ? K.mossLight : K.moss;
  if (d === 1) return n < 0.5 ? K.moss : K.rockHi;
  if (d === 2 && n < 0.35) return K.moss;
  const w = worley(x, y);
  if (w.edge < 1.1) return K.rockCrack;
  if (w.edge < 2.3 && w.above) return K.rockHi;
  if (w.edge < 2.3) return K.rock3;
  if (n < 0.05) return K.rockHi;
  if (n > 0.96) return K.rockCrack;
  const tone = hash(w.id, 0, 33);
  return tone < 0.35 ? K.rock1 : tone < 0.72 ? K.rock2 : K.rock3;
}

function surfaceColor(kind: SurfaceKind, x: number, y: number, d: number): number {
  const n = hash(x, y, 1);
  switch (kind) {
    case 'grass':
      if (d === 0) return n < 0.12 ? K.grassHi : n < 0.5 ? K.grassLight : K.grass;
      if (d === 1) return n < 0.2 ? K.grassLight : K.grass;
      if (d === 2) return n < 0.55 ? K.grassDark : K.grass;
      if (d === 3) return n < 0.5 ? K.grassDark : K.soilTop;
      return 0;
    case 'paramo':
      if (d === 0) return n < 0.3 ? K.strawHi : K.strawLight;
      if (d === 1) return n < 0.4 ? K.straw : K.strawLight;
      if (d === 2) return n < 0.5 ? K.strawDark : K.straw;
      if (d === 3) return n < 0.5 ? K.strawDark : K.soilTop;
      return 0;
    case 'dirt':
      if (d === 0) return n < 0.3 ? K.dirtLight : K.dirt;
      if (d <= 2) return n < 0.15 ? K.dirtLight : n < 0.35 ? K.dirtDark : K.dirt;
      if (d === 3) return n < 0.5 ? K.dirtDark : K.soilTop;
      return 0;
    case 'field':
      if (d === 0) {
        if (hash(x, 0, 2) < 0.07) return K.sprout;
        return (x >> 2) & 1 ? K.fieldRidge : K.field;
      }
      if (d <= 3) return n < 0.25 ? K.fieldRidge : K.fieldDark;
      return 0;
    case 'patio': {
      if (d > 5) return 0;
      if (d === 5 || x % 9 === 0) return K.patioLine;
      return d === 0 || (d === 1 && n < 0.3) ? K.patioLight : K.patio;
    }
    case 'road':
      if (d === 0) return n < 0.35 ? K.roadLight : K.road;
      if (d <= 3) return x % 29 < 3 ? K.roadRut : n < 0.2 ? K.roadLight : K.road;
      return 0;
    case 'cobble': {
      if (d > 6) return 0;
      const row = Math.floor(d / 3);
      const off = row % 2 ? 3 : 0;
      const cx = (x + off) % 6;
      const cy = d % 3;
      if (cx === 0 || cy === 2) return K.cobbleLine;
      return cy === 0 && cx < 3 ? K.cobbleLight : K.cobble;
    }
    default:
      return 0;
  }
}

/** Genera el lienzo del terreno completo (ancho del mundo). */
export function renderTerrain(): HTMLCanvasElement {
  const W = WORLD_W;
  const H = Y_BOTTOM - Y_TOP;
  const c = document.createElement('canvas');
  c.width = W;
  c.height = H;
  const ctx = c.getContext('2d')!;
  const img = ctx.createImageData(W, H);
  const out = new Uint32Array(img.data.buffer);
  const hm = getHeightmap();

  for (let x = 0; x < W; x++) {
    const top = hm[x];
    const kind = surfaceKind(x);
    const wav = Math.floor(hash(x >> 3, 99, 2) * 3);
    const start = Math.max(top, Y_TOP);
    for (let y = start; y < Y_BOTTOM; y++) {
      const d = y - top;
      let col: number;
      if (kind === 'rock') {
        col = rockColor(x, y, d);
      } else {
        col = surfaceColor(kind, x, y, d);
        if (!col) {
          const n = hash(x, y, 12);
          if (d < 12 + wav) {
            col = n < 0.06 ? K.soilSpeckL : n < 0.12 ? K.soilSpeckD : K.soil;
          } else if (d < 44 + wav * 2) {
            col = stoneAt(x, y) || (n < 0.07 ? K.soil : K.soilDark);
          } else if (d < 110) {
            const root = hash(x, y >> 1, 13) < 0.012;
            col = root ? K.root : stoneAt(x + 500, y) ? K.stoneDark : n < 0.05 ? K.soilDark : K.soilDeep;
          } else {
            col = n < 0.04 ? K.soilDeep : K.soilDeepest;
          }
        }
      }
      out[(y - Y_TOP) * W + x] = col;
    }
  }
  ctx.putImageData(img, 0, 0);
  return c;
}
