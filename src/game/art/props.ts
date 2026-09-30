// Decorado estático del mundo, dibujado con primitivas pixel art sobre el lienzo del terreno.
import { C } from '../palette';
import { drawText } from '../font';
import { getSprites } from '../sprites';
import { PROPS, Y_TOP, surfaceY, type Prop } from '../world';
import { type Ctx, rect, px, box, poly, ellipse, line, hash } from './draw';

const OUT = C.outline;

// ── Utilidades de construcción ────────────────────────────────────────────

/** Tejado de teja en trapecio: borde superior [xl0, xr0] en yTop, inferior [xl1, xr1] en yBot. */
function tileRoof(ctx: Ctx, xl0: number, xr0: number, yTop: number, xl1: number, xr1: number, yBot: number) {
  const h = yBot - yTop;
  for (let y = yTop; y <= yBot; y++) {
    const t = h === 0 ? 1 : (y - yTop) / h;
    const l = Math.round(xl0 + (xl1 - xl0) * t);
    const r = Math.round(xr0 + (xr1 - xr0) * t);
    const dy = y - yTop;
    const row = Math.floor(dy / 3);
    const ry = dy % 3;
    for (let x = l; x < r; x++) {
      let col: string = C.tile;
      if (x === l || x === r - 1 || y === yTop || y === yBot) col = OUT;
      else if (ry === 2) col = C.tileDark;
      else {
        const cx = (x + (row % 2) * 2) % 4;
        if (cx === 0) col = C.tileDark;
        else if (ry === 0 && cx === 1) col = C.tileLight;
      }
      px(ctx, x, y, col);
    }
  }
}

/** Techo de paja en trapecio. */
function thatchRoof(ctx: Ctx, xl0: number, xr0: number, yTop: number, xl1: number, xr1: number, yBot: number, seed: number) {
  const h = yBot - yTop;
  for (let y = yTop; y <= yBot; y++) {
    const t = h === 0 ? 1 : (y - yTop) / h;
    const l = Math.round(xl0 + (xl1 - xl0) * t);
    const r = Math.round(xr0 + (xr1 - xr0) * t);
    const dy = y - yTop;
    for (let x = l; x < r; x++) {
      const n = hash(x, y, seed);
      let col: string = C.straw;
      if (x === l || x === r - 1 || y === yTop) col = OUT;
      else if (dy % 6 === 5 && n < 0.8) col = C.strawDeep;
      else if (dy % 6 === 4 && n < 0.3) col = C.strawDark;
      else if (hash(x, Math.floor(y / 3), seed + 1) < 0.18) col = C.strawLight;
      else if (hash(x, Math.floor(y / 2), seed + 2) < 0.14) col = C.strawDark;
      px(ctx, x, y, col);
    }
  }
  // flecos del alero
  const l = Math.round(xl1);
  const r = Math.round(xr1);
  for (let x = l; x < r; x++) {
    const len = 1 + Math.floor(hash(x, 7, seed) * 3);
    rect(ctx, x, yBot + 1, 1, len, hash(x, 9, seed) < 0.5 ? C.strawDark : C.strawDeep);
  }
}

/** Relleno con textura de adobe/bahareque. */
function adobeWall(ctx: Ctx, x: number, y: number, w: number, h: number, base: string, dark: string, light: string, seed: number) {
  box(ctx, x, y, w, h, base, OUT);
  for (let yy = y + 1; yy < y + h - 1; yy++) {
    for (let xx = x + 1; xx < x + w - 1; xx++) {
      const n = hash(xx, yy, seed);
      if (n < 0.06) px(ctx, xx, yy, dark);
      else if (n > 0.95) px(ctx, xx, yy, light);
    }
  }
}

function stoneShape(ctx: Ctx, cx: number, bottom: number, rx: number, ry: number) {
  const cy = bottom - ry * 0.75;
  ellipse(ctx, cx, cy, rx + 1, ry + 1, '#3e3931');
  ellipse(ctx, cx, cy, rx, ry, '#7d7566');
  ellipse(ctx, cx + rx * 0.2, cy + ry * 0.3, rx * 0.75, ry * 0.6, '#6e675a');
  ellipse(ctx, cx - rx * 0.3, cy - ry * 0.35, rx * 0.5, ry * 0.4, '#9c9280');
  rect(ctx, cx - rx, bottom - 1, rx * 2, 1, '#4e483f');
}

function plaque(ctx: Ctx, cx: number, top: number, text: string, bg: string = C.woodDark, fg: string = C.goldLight) {
  const w = Math.max(12, text.length * 6 + 5);
  box(ctx, cx - Math.floor(w / 2), top, w, 11, bg, OUT);
  rect(ctx, cx - Math.floor(w / 2) + 1, top + 1, w - 2, 1, C.wood);
  drawText(ctx, text, cx, top + 2, fg, { align: 'center' });
}

function windowPane(ctx: Ctx, x: number, y: number, w: number, h: number, shutter = '#3a5a33', lit = false) {
  rect(ctx, x - 3, y, 3, h, shutter);
  rect(ctx, x + w, y, 3, h, shutter);
  rect(ctx, x - 3, y, 1, h, OUT);
  rect(ctx, x + w + 2, y, 1, h, OUT);
  box(ctx, x, y, w, h, lit ? '#6a4a20' : '#2a2016', C.woodDark);
  if (lit) {
    rect(ctx, x + 1, y + 1, w - 2, h - 2, '#8a6424');
    rect(ctx, x + 2, y + 2, w - 4, h - 4, '#c9962e');
  }
  rect(ctx, x + Math.floor(w / 2), y + 1, 1, h - 2, C.woodDark);
  rect(ctx, x + 1, y + Math.floor(h / 2), w - 2, 1, C.woodDark);
}

// ── Decorados ─────────────────────────────────────────────────────────────

function sign(ctx: Ctx, x: number, gy: number) {
  rect(ctx, x - 1, gy - 16, 3, 16, OUT);
  rect(ctx, x, gy - 16, 1, 16, C.wood);
  box(ctx, x - 10, gy - 26, 21, 11, C.wood, OUT);
  rect(ctx, x - 9, gy - 25, 19, 1, '#9a6a3e');
  rect(ctx, x - 9, gy - 17, 19, 1, C.woodDark);
  rect(ctx, x - 7, gy - 23, 14, 1, C.beigeLight);
  rect(ctx, x - 7, gy - 21, 10, 1, C.beige);
  rect(ctx, x - 7, gy - 19, 12, 1, C.beige);
  px(ctx, x - 9, gy - 24, C.goldDim);
  px(ctx, x + 9, gy - 24, C.goldDim);
}

function agave(ctx: Ctx, x: number, gy: number, variant = 0) {
  if (variant === 1) {
    line(ctx, x, gy - 6, x + 3, gy - 46, '#6e6440');
    line(ctx, x + 1, gy - 6, x + 4, gy - 46, '#8a7a4a');
    for (let i = 0; i < 4; i++) {
      const by = gy - 30 - i * 4;
      const bx = x + 2 + Math.round((i * 3) / 4);
      line(ctx, bx, by, bx + (i % 2 ? 4 : -4), by - 2, '#8a7a4a');
      ellipse(ctx, bx + (i % 2 ? 5 : -5), by - 3, 2, 1.5, i % 2 ? '#c8c060' : '#9aa850');
    }
  }
  const leaves = [-78, -58, -38, -18, 0, 18, 38, 58, 78];
  const cols = ['#3e5a4c', '#5a7a6a', '#6f8f7d', '#86a594'];
  leaves.forEach((deg, i) => {
    const a = (deg * Math.PI) / 180;
    const len = 9 + (i % 3) * 3 + (Math.abs(deg) < 30 ? 3 : 0);
    const tx = x + Math.sin(a) * len;
    const ty = gy - Math.cos(a) * len - 1;
    const col = cols[(i + 1) % cols.length];
    poly(ctx, [[x - 2, gy], [x + 2, gy], [tx, ty]], '#2e4438');
    poly(ctx, [[x - 1, gy], [x + 1, gy], [tx, ty]], col);
  });
  rect(ctx, x - 4, gy - 1, 8, 1, '#2e4438');
}

function rock(ctx: Ctx, x: number, gy: number, variant = 0) {
  const sizes: [number, number][] = [[6, 4], [9, 6], [4, 3]];
  const [rx, ry] = sizes[variant % sizes.length];
  stoneShape(ctx, x, gy + 1, rx, ry);
}

function boulder(ctx: Ctx, x: number, gy: number) {
  const top = -62 - Y_TOP;
  const h = gy - top;
  stoneShape(ctx, x, gy + 2, 15, h * 0.74);
  for (let xx = x - 11; xx <= x + 11; xx++) {
    const d = Math.abs(xx - x);
    const yy = top + Math.floor((d * d) / 60);
    px(ctx, xx, yy, hash(xx, 1, 3) < 0.5 ? '#8a9a5a' : '#6f7f4a');
    if (hash(xx, 2, 3) < 0.4) px(ctx, xx, yy + 1, '#6f7f4a');
  }
}

function ledge(ctx: Ctx, x: number, w: number, lift: number) {
  const top = -lift - Y_TOP;
  const x1 = x + Math.floor(w / 2);
  const x0 = 238;
  poly(ctx, [[x0, top - 1], [x1 + 1, top - 1], [x1 + 1, top + 3], [x1 - 6, top + 7], [x1 - 18, top + 10], [x0, top + 18]], '#3e3931');
  poly(ctx, [[x0, top], [x1, top], [x1, top + 2], [x1 - 6, top + 6], [x1 - 18, top + 9], [x0, top + 17]], '#7d7566');
  for (let xx = x0; xx < x1; xx++) {
    px(ctx, xx, top, hash(xx, top, 4) < 0.5 ? '#8a9a5a' : '#6f7f4a');
    if (hash(xx, top, 5) < 0.35) px(ctx, xx, top + 1, '#6f7f4a');
    if (hash(xx, top, 6) < 0.25) px(ctx, xx, top + 3, '#9c9280');
    if (hash(xx, top, 7) < 0.12) px(ctx, xx, top + 5, '#5a534a');
  }
}

function mirador(ctx: Ctx, x: number, gy: number) {
  // Portada inca de piedra: la "Puerta del tiempo".
  rect(ctx, x - 24, gy - 3, 48, 3, '#6e675a');
  rect(ctx, x - 24, gy - 3, 48, 1, '#a89e8c');
  const b = gy - 3;
  poly(ctx, [[x - 16, b], [x + 17, b], [x + 12, b - 41], [x - 11, b - 41]], '#3e3931');
  poly(ctx, [[x - 15, b], [x + 16, b], [x + 11, b - 40], [x - 10, b - 40]], '#857c6c');
  // juntas de sillería inca
  for (let row = 0; row < 6; row++) {
    const yy = b - 6 - row * 6 - (row > 3 ? 1 : 0);
    const t = (b - yy) / 40;
    const l = Math.round(x - 15 + 5 * t);
    const r = Math.round(x + 16 - 5 * t);
    line(ctx, l, yy, r, yy + (row % 2 ? 1 : 0), '#5a534a');
    line(ctx, l + 1, yy + 1, r - 1, yy + 1 + (row % 2 ? 1 : 0), '#9c9280');
    const offs = row % 2 ? [5, 13, 22] : [9, 18, 26];
    for (const o of offs) if (l + o < r - 2) line(ctx, l + o, yy - 5, l + o + (row % 2), yy, '#5a534a');
  }
  // vano trapezoidal con luz dorada
  poly(ctx, [[x - 7, b], [x + 8, b], [x + 5, b - 27], [x - 4, b - 27]], '#1f140c');
  poly(ctx, [[x - 6, b], [x + 7, b], [x + 4, b - 26], [x - 3, b - 26]], '#6a4a18');
  poly(ctx, [[x - 4, b], [x + 5, b], [x + 3, b - 23], [x - 2, b - 23]], '#b8862a');
  poly(ctx, [[x - 2, b], [x + 3, b], [x + 2, b - 19], [x - 1, b - 19]], '#e8c84a');
  rect(ctx, x, b - 15, 1, 15, '#f3dc8a');
  // dintel
  rect(ctx, x - 9, b - 31, 19, 4, '#3e3931');
  rect(ctx, x - 8, b - 30, 17, 2, '#9c9280');
  // Inti (sol) de oro
  ellipse(ctx, x + 0.5, b - 35.5, 3.5, 3.5, '#7a6118');
  ellipse(ctx, x + 0.5, b - 35.5, 2.5, 2.5, '#e8c84a');
  px(ctx, x, b - 36, '#f3dc8a');
  for (const [dx, dy] of [[-5, 0], [6, 0], [0, -5], [-4, -4], [5, -4]] as [number, number][]) px(ctx, x + dx, b - 36 + dy, '#c9a227');
}

function cairn(ctx: Ctx, x: number, gy: number) {
  const widths = [14, 12, 10, 8, 6, 4];
  let y = gy;
  widths.forEach((w, i) => {
    const ox = Math.round((hash(i, 3, 17) - 0.5) * 3);
    box(ctx, x - w / 2 + ox, y - 3, w, 3, i % 2 ? '#8a8070' : '#9c9280', '#3e3931');
    px(ctx, x - w / 2 + ox + 1, y - 2, '#b0a690');
    y -= 3;
  });
}

function woodpile(ctx: Ctx, x: number, gy: number) {
  box(ctx, x - 15, gy - 12, 30, 12, '#5a3a22', OUT);
  for (let row = 0; row < 2; row++) {
    for (let i = 0; i < 5; i++) {
      const cx = x - 11 + i * 6 + (row % 2) * 2;
      const cy = gy - 3 - row * 5;
      if (cx > x + 12) continue;
      ellipse(ctx, cx, cy, 2.6, 2.4, OUT);
      ellipse(ctx, cx, cy, 2, 1.8, '#c8a070');
      px(ctx, cx, cy, '#9a7048');
    }
  }
  rect(ctx, x - 14, gy - 12, 28, 1, '#7a5230');
}

function choza(ctx: Ctx, x: number, gy: number) {
  const wallTop = gy - 18;
  adobeWall(ctx, x - 22, wallTop, 44, 18, C.adobe, C.adobeDark, C.adobeLight, 21);
  rect(ctx, x - 21, wallTop + 1, 42, 3, C.adobeDark);
  for (let i = 0; i < 9; i++) stoneShape(ctx, x - 20 + i * 5, gy + 1, 2.6, 1.8);
  // puerta
  rect(ctx, x + 1, gy - 15, 13, 15, OUT);
  rect(ctx, x + 2, gy - 14, 11, 14, '#140e08');
  rect(ctx, x + 1, gy - 16, 13, 2, C.woodDark);
  rect(ctx, x + 3, gy - 10, 1, 10, '#2a1c12');
  // techo de paja
  thatchRoof(ctx, x - 12, x + 13, gy - 47, x - 31, x + 32, wallTop + 2, 31);
  rect(ctx, x - 12, gy - 48, 25, 2, C.strawDeep);
  rect(ctx, x - 11, gy - 49, 23, 1, OUT);
  line(ctx, x - 2, gy - 53, x + 3, gy - 48, C.woodDark);
  line(ctx, x + 3, gy - 53, x - 2, gy - 48, C.woodDark);
}

function fogon(ctx: Ctx, x: number, gy: number) {
  ellipse(ctx, x, gy - 1, 10, 2, '#2a2018');
  for (let i = -6; i <= 6; i += 3) px(ctx, x + i, gy - 1, '#9a3a2a');
  stoneShape(ctx, x - 8, gy + 1, 3.5, 3.5);
  stoneShape(ctx, x + 8, gy + 1, 3.5, 3.5);
  stoneShape(ctx, x, gy + 1, 2.5, 2.5);
  // olla de barro (sobre la tulpa)
  ellipse(ctx, x, gy - 10, 7, 6, OUT);
  ellipse(ctx, x, gy - 10, 6, 5, '#8c4a2a');
  ellipse(ctx, x + 1, gy - 9, 4, 3.5, '#763c22');
  ellipse(ctx, x - 2, gy - 12, 2, 1.5, '#b06a42');
  rect(ctx, x - 4, gy - 17, 9, 3, OUT);
  rect(ctx, x - 3, gy - 16, 7, 1, '#9a5a34');
}

function pirca(ctx: Ctx, x: number, gy: number, w: number, variant = 0) {
  if (w === 0) {
    // muro de contención de terraza (10 px de alto)
    const x0 = variant === 1 ? x + 1 : x - 5;
    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 2; col++) {
        const bx = x0 + col * 3 - (row % 2);
        const by = gy + row * 3 + 1;
        box(ctx, bx, by, 4, 4, hash(bx, by, 2) < 0.5 ? '#8a8070' : '#7d7466', '#3e3931');
      }
    }
    return;
  }
  const x0 = x - Math.floor(w / 2);
  for (let row = 0; row < 2; row++) {
    let bx = x0 + (row % 2) * 3;
    while (bx < x0 + w) {
      const sw = 4 + Math.floor(hash(bx, row, 4) * 4);
      const cw = Math.min(sw, x0 + w - bx);
      box(ctx, bx, gy - 8 + row * 4, cw, 4, hash(bx, row, 5) < 0.5 ? '#8a8070' : '#9c9280', '#3e3931');
      bx += sw - 1;
    }
  }
}

function library(ctx: Ctx, x: number, gy: number) {
  const w = 130;
  const x0 = x - 65;
  const top = gy - 44;
  box(ctx, x0, top, w, 44, C.wall, OUT);
  rect(ctx, x0 + 1, top + 1, w - 2, 3, C.wallShade);
  rect(ctx, x0 + 1, gy - 6, w - 2, 5, '#8a5a3a');
  rect(ctx, x0 + 1, gy - 6, w - 2, 1, '#6b3f2a');
  for (let i = 0; i < 50; i++) px(ctx, x0 + 2 + Math.floor(hash(i, 1, 40) * (w - 4)), top + 5 + Math.floor(hash(i, 2, 40) * 32), C.wallShade);
  // ventanas con libros (lejos del atril, que está delante a la izquierda)
  for (const wx of [x0 + 34, x0 + 98]) {
    windowPane(ctx, wx, top + 16, 16, 14, '#6b3f2a', true);
    for (let b = 0; b < 6; b++) rect(ctx, wx + 2 + b * 2, top + 24, 1, 5, ['#9a3a2a', '#2d5a3d', '#e8c84a', '#4a6b7a', '#6b3f2a', '#d4b896'][b]);
  }
  // puerta con letrero encima
  const dx = x + 10;
  box(ctx, dx - 8, gy - 24, 17, 24, '#5a3a22', OUT);
  ellipse(ctx, dx + 0.5, gy - 24, 8.5, 4, OUT);
  ellipse(ctx, dx + 0.5, gy - 24, 7.5, 3, '#5a3a22');
  rect(ctx, dx, gy - 24, 1, 24, OUT);
  px(ctx, dx - 2, gy - 12, C.gold);
  px(ctx, dx + 2, gy - 12, C.gold);
  plaque(ctx, dx, top + 3, 'BIBLIOTECA');
  tileRoof(ctx, x0 + 4, x0 + w - 4, top - 14, x0 - 6, x0 + w + 6, top + 2);
}

function lectern(ctx: Ctx, x: number, gy: number) {
  rect(ctx, x - 5, gy - 2, 11, 2, OUT);
  rect(ctx, x - 4, gy - 2, 9, 1, C.wood);
  rect(ctx, x - 1, gy - 15, 3, 13, OUT);
  rect(ctx, x, gy - 15, 1, 13, C.wood);
  poly(ctx, [[x - 9, gy - 16], [x + 10, gy - 19], [x + 10, gy - 16], [x - 9, gy - 13]], OUT);
  // libro abierto
  poly(ctx, [[x - 9, gy - 18], [x, gy - 17], [x, gy - 22], [x - 9, gy - 23]], '#f2ead8');
  poly(ctx, [[x + 1, gy - 17], [x + 10, gy - 20], [x + 10, gy - 25], [x + 1, gy - 22]], '#e6dcc4');
  rect(ctx, x, gy - 22, 1, 5, '#9a3a2a');
  for (let i = 0; i < 3; i++) {
    line(ctx, x - 7, gy - 21 + i * 1.5, x - 2, gy - 20 + i * 1.5, '#8c7459');
    line(ctx, x + 3, gy - 21 - i * 1.3, x + 8, gy - 23 - i * 1.3, '#8c7459');
  }
  rect(ctx, x, gy - 17, 1, 4, C.goldLight);
}

function crates(ctx: Ctx, x: number, gy: number) {
  for (const cx of [x - 11, x]) {
    box(ctx, cx, gy - 14, 11, 14, '#8a6440', OUT);
    rect(ctx, cx + 1, gy - 8, 9, 1, '#5a3a22');
    line(ctx, cx + 1, gy - 13, cx + 9, gy - 2, '#6e4c2e');
    rect(ctx, cx + 1, gy - 13, 9, 1, '#a07a50');
  }
  rect(ctx, x - 9, gy - 16, 7, 2, '#9a3a2a');
  rect(ctx, x - 8, gy - 17, 5, 1, '#2d5a3d');
}

function blackboard(ctx: Ctx, x: number, gy: number) {
  line(ctx, x - 12, gy, x - 8, gy - 31, OUT);
  line(ctx, x + 12, gy, x + 8, gy - 31, OUT);
  line(ctx, x - 11, gy, x - 7, gy - 31, C.wood);
  line(ctx, x + 11, gy, x + 7, gy - 31, C.wood);
  box(ctx, x - 16, gy - 32, 33, 21, '#6b3f2a', OUT);
  rect(ctx, x - 14, gy - 30, 29, 17, '#2d4a36');
  // mentefacto dibujado con tiza
  const cx = x;
  const cy = gy - 22;
  const nodes: [number, number][] = [[-10, -5], [10, -5], [-12, 2], [12, 2], [-6, 6], [6, 6]];
  for (const [dx, dy] of nodes) line(ctx, cx, cy, cx + dx, cy + dy, '#8aa090');
  for (const [dx, dy] of nodes) {
    rect(ctx, cx + dx - 1, cy + dy - 1, 3, 3, '#e8dcc4');
    px(ctx, cx + dx, cy + dy, '#2d4a36');
  }
  rect(ctx, cx - 3, cy - 2, 7, 5, C.goldLight);
  rect(ctx, cx - 2, cy - 1, 5, 3, '#2d4a36');
  rect(ctx, x - 14, gy - 13, 29, 1, '#3e5c48');
  rect(ctx, x + 9, gy - 12, 3, 1, '#e8dcc4');
}

function bench(ctx: Ctx, x: number, gy: number) {
  rect(ctx, x - 10, gy - 7, 20, 3, OUT);
  rect(ctx, x - 9, gy - 6, 18, 1, C.wood);
  rect(ctx, x - 8, gy - 4, 2, 4, OUT);
  rect(ctx, x + 6, gy - 4, 2, 4, OUT);
}

function desk(ctx: Ctx, x: number, gy: number) {
  box(ctx, x - 12, gy - 12, 24, 3, C.wood, OUT);
  rect(ctx, x - 11, gy - 9, 2, 9, OUT);
  rect(ctx, x + 9, gy - 9, 2, 9, OUT);
  box(ctx, x + 1, gy - 9, 8, 5, '#6b4a2e', OUT);
  px(ctx, x + 4, gy - 7, C.gold);
  rect(ctx, x - 9, gy - 13, 7, 1, '#f2ead8');
  rect(ctx, x - 8, gy - 14, 6, 1, '#e6dcc4');
  rect(ctx, x + 3, gy - 14, 2, 2, '#1a1410');
  line(ctx, x + 4, gy - 14, x + 7, gy - 19, '#f2ead8');
  // cartel con signo de interrogación
  rect(ctx, x + 16, gy - 20, 2, 20, OUT);
  box(ctx, x + 10, gy - 32, 14, 13, '#3a2810', OUT);
  rect(ctx, x + 11, gy - 31, 12, 1, '#5a3a22');
  drawText(ctx, '?', x + 17, gy - 29, C.goldLight, { align: 'center' });
}

function honorboard(ctx: Ctx, x: number, gy: number) {
  rect(ctx, x - 12, gy - 14, 2, 14, OUT);
  rect(ctx, x + 10, gy - 14, 2, 14, OUT);
  box(ctx, x - 15, gy - 33, 30, 20, C.gold, OUT);
  rect(ctx, x - 13, gy - 31, 26, 16, '#3a2810');
  const medals = ['#e8c84a', '#c0c0c8', '#b87a4a'];
  medals.forEach((m, i) => {
    const yy = gy - 29 + i * 5;
    ellipse(ctx, x - 9, yy + 1, 1.8, 1.8, m);
    rect(ctx, x - 5, yy + 1, 14 - i * 3, 1, '#d4b896');
  });
  plaque(ctx, x, gy - 45, 'HONOR', '#3a2810', C.goldLight);
}

function casa(ctx: Ctx, x: number, gy: number) {
  const w = 128;
  const x0 = x - 64;
  const floor2 = gy - 36;
  const top = gy - 66;
  box(ctx, x0, top, w, 66, C.wall, OUT);
  rect(ctx, x0 + 1, top + 1, w - 2, 3, C.wallShade);
  rect(ctx, x0 + 1, gy - 6, w - 2, 5, '#9a3a2a');
  rect(ctx, x0 + 1, gy - 6, w - 2, 1, '#6e2419');
  for (let i = 0; i < 50; i++) px(ctx, x0 + 2 + Math.floor(hash(i, 3, 50) * (w - 4)), top + 5 + Math.floor(hash(i, 4, 50) * 56), C.wallShade);
  // puerta principal
  box(ctx, x - 9, gy - 26, 19, 26, '#5a3a22', OUT);
  ellipse(ctx, x + 0.5, gy - 26, 9.5, 5, OUT);
  ellipse(ctx, x + 0.5, gy - 26, 8.5, 4, '#5a3a22');
  rect(ctx, x, gy - 26, 1, 26, OUT);
  for (const yy of [gy - 20, gy - 12]) {
    rect(ctx, x - 7, yy, 5, 1, '#3a2810');
    rect(ctx, x + 3, yy, 5, 1, '#3a2810');
  }
  px(ctx, x - 2, gy - 14, C.goldLight);
  px(ctx, x + 2, gy - 14, C.goldLight);
  windowPane(ctx, x - 44, gy - 26, 12, 12, '#2d5a3d');
  windowPane(ctx, x + 32, gy - 26, 12, 12, '#2d5a3d');
  plaque(ctx, x, gy - 35, 'PERSONAJES');
  // retratos de los personajes en la fachada
  const sprites = getSprites();
  const ids = ['andres', 'cunshi', 'alfonso', 'julio', 'cura', 'comunera'];
  ids.forEach((id, i) => {
    const fx = x0 + 10 + i * 19;
    const fy = floor2 - 24;
    box(ctx, fx - 1, fy - 1, 14, 16, C.gold, OUT);
    rect(ctx, fx + 1, fy + 1, 10, 12, '#2a1c10');
    const fr = sprites[id].idle.right[0];
    ctx.drawImage(fr, 3, 1, 10, 12, fx + 1, fy + 1, 10, 12);
  });
  // balcón
  rect(ctx, x - 59, floor2, 118, 3, OUT);
  rect(ctx, x - 58, floor2, 116, 1, C.wood);
  rect(ctx, x - 59, floor2 - 11, 118, 2, OUT);
  rect(ctx, x - 58, floor2 - 11, 116, 1, C.wood);
  for (let bx = x - 58; bx <= x + 57; bx += 5) rect(ctx, bx, floor2 - 9, 1, 9, C.woodDark);
  // escalera exterior
  box(ctx, x + 58, gy - 24, 16, 24, '#6b4a2e', OUT);
  box(ctx, x + 68, gy - 12, 16, 12, '#6b4a2e', OUT);
  rect(ctx, x + 59, gy - 23, 14, 1, '#8a6440');
  rect(ctx, x + 69, gy - 11, 14, 1, '#8a6440');
  line(ctx, x + 84, gy - 12, x + 74, gy - 34, C.woodDark);
  // techo
  tileRoof(ctx, x0 + 6, x0 + w - 6, top - 14, x0 - 8, x0 + w + 8, top + 2);
}

function haystack(ctx: Ctx, x: number, gy: number, variant = 0) {
  const rx = variant === 1 ? 10 : 12;
  const ry = variant === 1 ? 13 : 16;
  for (let dy = 0; dy <= ry; dy++) {
    const half = Math.round(rx * Math.sqrt(1 - (dy * dy) / (ry * ry)));
    const y = gy - dy;
    for (let xx = x - half; xx <= x + half; xx++) {
      let col: string = C.straw;
      if (xx === x - half || xx === x + half || dy === ry) col = OUT;
      else if (dy < 3) col = C.strawDark;
      else {
        const n = hash(xx, Math.floor(y / 2), 61);
        if (n < 0.2) col = C.strawLight;
        else if (n > 0.85) col = C.strawDark;
        if (xx > x + half * 0.4 && n > 0.5) col = C.strawDark;
      }
      px(ctx, xx, y, col);
    }
  }
  rect(ctx, x, gy - ry - 5, 1, 5, C.woodDark);
}

function scarecrow(ctx: Ctx, x: number, gy: number) {
  rect(ctx, x, gy - 28, 2, 28, C.woodDark);
  rect(ctx, x - 10, gy - 19, 22, 2, C.woodDark);
  poly(ctx, [[x - 7, gy - 20], [x + 9, gy - 20], [x + 7, gy - 8], [x - 5, gy - 8]], '#6e2419');
  poly(ctx, [[x - 6, gy - 19], [x + 8, gy - 19], [x + 6, gy - 9], [x - 4, gy - 9]], '#8a4a3a');
  rect(ctx, x - 4, gy - 15, 10, 1, C.gold);
  ellipse(ctx, x + 1, gy - 24, 4, 4, OUT);
  ellipse(ctx, x + 1, gy - 24, 3, 3, '#c8a070');
  px(ctx, x, gy - 25, OUT);
  px(ctx, x + 2, gy - 25, OUT);
  rect(ctx, x - 5, gy - 28, 12, 1, C.strawDark);
  rect(ctx, x - 2, gy - 31, 6, 3, C.straw);
  px(ctx, x - 11, gy - 20, C.strawLight);
  px(ctx, x + 12, gy - 20, C.strawLight);
}

function granero(ctx: Ctx, x: number, gy: number) {
  const x0 = x - 32;
  box(ctx, x0, gy - 30, 64, 30, '#6b3f2a', OUT);
  for (let px0 = x0 + 4; px0 < x0 + 63; px0 += 4) rect(ctx, px0, gy - 29, 1, 28, '#4a2a18');
  for (let i = 0; i < 30; i++) px(ctx, x0 + 2 + Math.floor(hash(i, 5, 71) * 60), gy - 28 + Math.floor(hash(i, 6, 71) * 26), '#7d4c32');
  // hastial con techo de paja
  poly(ctx, [[x - 40, gy - 29], [x + 41, gy - 29], [x + 1, gy - 56], [x, gy - 56]], OUT);
  thatchRoof(ctx, x - 2, x + 3, gy - 55, x - 39, x + 40, gy - 30, 72);
  poly(ctx, [[x - 22, gy - 31], [x + 23, gy - 31], [x + 1, gy - 46], [x, gy - 46]], '#5a3a22');
  box(ctx, x - 5, gy - 44, 11, 8, '#2a1c10', OUT);
  rect(ctx, x - 4, gy - 38, 9, 2, C.straw);
  px(ctx, x - 2, gy - 39, C.strawLight);
  plaque(ctx, x, gy - 34, 'MEMORIA');
  // portón con cruces
  box(ctx, x - 12, gy - 22, 25, 22, '#7a4a2e', OUT);
  rect(ctx, x, gy - 22, 1, 22, OUT);
  line(ctx, x - 11, gy - 21, x - 1, gy - 1, '#4a2a18');
  line(ctx, x - 1, gy - 21, x - 11, gy - 1, '#4a2a18');
  line(ctx, x + 1, gy - 21, x + 11, gy - 1, '#4a2a18');
  line(ctx, x + 11, gy - 21, x + 1, gy - 1, '#4a2a18');
}

function gate(ctx: Ctx, x: number, gy: number, text = '') {
  for (const px0 of [x - 38, x + 32]) {
    box(ctx, px0, gy - 38, 7, 38, C.wall, OUT);
    rect(ctx, px0 + 1, gy - 6, 5, 5, '#9a3a2a');
    rect(ctx, px0 - 1, gy - 40, 9, 3, OUT);
    rect(ctx, px0, gy - 39, 7, 1, C.wallShade);
  }
  rect(ctx, x - 40, gy - 44, 81, 5, OUT);
  rect(ctx, x - 39, gy - 43, 79, 3, C.wood);
  tileRoof(ctx, x - 36, x + 37, gy - 50, x - 42, x + 43, gy - 44);
  line(ctx, x - 26, gy - 39, x - 26, gy - 36, '#3e3931');
  line(ctx, x + 26, gy - 39, x + 26, gy - 36, '#3e3931');
  if (text) plaque(ctx, x, gy - 36, text, C.woodDark, C.goldLight);
}

function corral(ctx: Ctx, x: number, gy: number, w: number) {
  const x0 = x - Math.floor(w / 2);
  rect(ctx, x0, gy - 11, w, 1, C.wood);
  rect(ctx, x0, gy - 6, w, 1, C.wood);
  rect(ctx, x0, gy - 10, w, 1, C.woodDark);
  for (let px0 = x0; px0 <= x0 + w; px0 += 12) {
    rect(ctx, px0, gy - 13, 3, 13, OUT);
    rect(ctx, px0 + 1, gy - 12, 1, 12, C.wood);
  }
}

function hacienda(ctx: Ctx, x: number, gy: number) {
  const x0 = x - 105;
  const w = 210;
  const floor2 = gy - 38;
  const top = gy - 72;
  // piso alto
  box(ctx, x0, top, w, 36, C.wall, OUT);
  rect(ctx, x0 + 1, top + 1, w - 2, 4, C.wallShade);
  for (let i = 0; i < 60; i++) px(ctx, x0 + 2 + Math.floor(hash(i, 7, 90) * (w - 4)), top + 6 + Math.floor(hash(i, 8, 90) * 28), C.wallShade);
  const winXs = [x0 + 18, x0 + 52, x0 + 136, x0 + 170];
  for (const wx of winXs) windowPane(ctx, wx, top + 10, 12, 16, '#2d5a3d');
  box(ctx, x - 8, top + 8, 17, 28, '#5a3a22', OUT);
  rect(ctx, x, top + 8, 1, 28, OUT);
  plaque(ctx, x + 50, top + 12, 'HACIENDA');
  // portal (corredor con arcos)
  rect(ctx, x0, floor2, w, 38, OUT);
  rect(ctx, x0 + 1, floor2 + 1, w - 2, 37, '#b9aa8a');
  rect(ctx, x0 + 1, floor2 + 1, w - 2, 5, '#8f8266');
  for (let i = 0; i < 70; i++) px(ctx, x0 + 2 + Math.floor(hash(i, 9, 91) * (w - 4)), floor2 + 7 + Math.floor(hash(i, 10, 91) * 28), '#a39576');
  // puertas interiores
  for (const dx of [x0 + 26, x0 + 94, x0 + 164]) {
    box(ctx, dx, gy - 22, 14, 22, '#4a2a18', OUT);
    rect(ctx, dx + 7, gy - 22, 1, 22, OUT);
  }
  // mapa del territorio en la pared
  const mx = x - 38;
  box(ctx, mx - 11, gy - 30, 23, 16, C.gold, OUT);
  rect(ctx, mx - 9, gy - 28, 19, 12, '#e6d6b0');
  line(ctx, mx - 8, gy - 20, mx - 3, gy - 26, '#6e8a5a');
  line(ctx, mx - 3, gy - 26, mx + 1, gy - 22, '#6e8a5a');
  line(ctx, mx - 8, gy - 18, mx + 9, gy - 23, '#5f7f94');
  rect(ctx, mx + 3, gy - 21, 3, 2, '#9a3a2a');
  rect(ctx, mx - 6, gy - 24, 2, 2, '#8a6a3a');
  px(ctx, mx + 7, gy - 26, '#9a3a2a');
  // columnas y arcos
  const cols = 7;
  for (let i = 0; i < cols; i++) {
    const cx = x0 + 2 + Math.round((i * (w - 6)) / (cols - 1));
    rect(ctx, cx - 1, floor2, 5, 38, OUT);
    rect(ctx, cx, floor2 + 1, 3, 37, C.wall);
    rect(ctx, cx - 2, gy - 3, 7, 3, '#8a8070');
    rect(ctx, cx - 2, floor2 + 1, 7, 2, C.wallShade);
  }
  for (let i = 0; i < cols - 1; i++) {
    const ax0 = x0 + 2 + Math.round((i * (w - 6)) / (cols - 1)) + 4;
    const ax1 = x0 + 2 + Math.round(((i + 1) * (w - 6)) / (cols - 1)) - 1;
    const acx = (ax0 + ax1) / 2;
    const half = (ax1 - ax0) / 2;
    for (let yy = 0; yy < 7; yy++) {
      const t = yy / 7;
      const inset = Math.round(half * (1 - Math.sqrt(1 - (1 - t) * (1 - t))));
      rect(ctx, ax0, floor2 + 1 + yy, inset, 1, C.wall);
      rect(ctx, ax1 - inset, floor2 + 1 + yy, inset, 1, C.wall);
      if (inset > 0) {
        px(ctx, ax0 + inset, floor2 + 1 + yy, OUT);
        px(ctx, ax1 - inset - 1, floor2 + 1 + yy, OUT);
      }
    }
    px(ctx, Math.round(acx), floor2 + 1, OUT);
  }
  // balcón corrido
  rect(ctx, x0 - 1, floor2 - 1, w + 2, 4, OUT);
  rect(ctx, x0, floor2, w, 1, C.wood);
  rect(ctx, x0 - 1, floor2 - 12, w + 2, 2, OUT);
  rect(ctx, x0, floor2 - 12, w, 1, C.wood);
  for (let bx = x0; bx < x0 + w; bx += 4) rect(ctx, bx, floor2 - 10, 1, 9, C.woodDark);
  // escalera de piedra (izquierda)
  box(ctx, x - 124, gy - 13, 17, 13, '#8a8070', '#3e3931');
  box(ctx, x - 112, gy - 26, 15, 26, '#8a8070', '#3e3931');
  rect(ctx, x - 123, gy - 12, 15, 1, '#a89e8c');
  rect(ctx, x - 111, gy - 25, 13, 1, '#a89e8c');
  for (let i = 0; i < 12; i++) px(ctx, x - 122 + Math.floor(hash(i, 1, 92) * 28), gy - 24 + Math.floor(hash(i, 2, 92) * 22), '#6e675a');
  // techo y chimenea
  box(ctx, x + 70, top - 26, 9, 16, C.wall, OUT);
  rect(ctx, x + 69, top - 27, 11, 2, OUT);
  tileRoof(ctx, x0 + 10, x0 + w - 10, top - 16, x0 - 8, x0 + w + 8, top + 2);
}

function stonepile(ctx: Ctx, x: number, gy: number) {
  // pico apoyado
  line(ctx, x + 17, gy, x + 12, gy - 16, C.woodDark);
  line(ctx, x + 18, gy, x + 13, gy - 16, C.wood);
  line(ctx, x + 9, gy - 15, x + 16, gy - 18, '#6a6256');
  px(ctx, x + 8, gy - 14, '#6a6256');
  const rows: [number, number][] = [[5, 0], [4, 5], [3, 10]];
  rows.forEach(([n, lift], ri) => {
    for (let i = 0; i < n; i++) {
      const cx = x - (n - 1) * 3 + i * 6 + (hash(i, ri, 30) - 0.5) * 2;
      stoneShape(ctx, cx, gy - lift + 1, 3.4, 3);
    }
  });
}

function logs(ctx: Ctx, x: number, gy: number) {
  const log = (lx: number, ly: number, len: number) => {
    box(ctx, lx, ly - 6, len, 6, '#6b3f2a', OUT);
    rect(ctx, lx + 1, ly - 5, len - 2, 1, '#8a5a3a');
    for (let i = 3; i < len - 3; i += 5) px(ctx, lx + i, ly - 3, '#4a2a18');
    ellipse(ctx, lx + len - 1, ly - 3, 3, 3, OUT);
    ellipse(ctx, lx + len - 1, ly - 3, 2.2, 2.2, '#c8a070');
    px(ctx, lx + len - 1, ly - 3, '#9a7048');
  };
  log(x - 16, gy, 28);
  log(x - 12, gy, 26);
  log(x - 14, gy - 6, 24);
}

function wheelbarrow(ctx: Ctx, x: number, gy: number) {
  line(ctx, x - 14, gy - 6, x - 4, gy - 8, OUT);
  line(ctx, x - 14, gy - 5, x - 4, gy - 7, C.wood);
  poly(ctx, [[x - 6, gy - 12], [x + 8, gy - 12], [x + 6, gy - 5], [x - 4, gy - 5]], OUT);
  poly(ctx, [[x - 5, gy - 11], [x + 7, gy - 11], [x + 5, gy - 6], [x - 3, gy - 6]], '#8a6440');
  rect(ctx, x - 4, gy - 11, 11, 1, '#a07a50');
  rect(ctx, x - 3, gy - 13, 6, 2, '#8a8070');
  ellipse(ctx, x + 6, gy - 3, 3, 3, OUT);
  ellipse(ctx, x + 6, gy - 3, 2, 2, '#5a3a22');
  rect(ctx, x - 3, gy - 5, 1, 5, OUT);
}

function crossStone(ctx: Ctx, x: number, gy: number) {
  box(ctx, x - 5, gy - 5, 11, 5, '#8a8070', '#3e3931');
  box(ctx, x - 1, gy - 27, 4, 23, '#9c9280', '#3e3931');
  box(ctx, x - 6, gy - 22, 14, 4, '#9c9280', '#3e3931');
  rect(ctx, x, gy - 26, 1, 21, '#b0a690');
}

function house(ctx: Ctx, x: number, gy: number, variant = 0, text = '') {
  const w = 44;
  const x0 = x - 22;
  const top = gy - 24;
  const wallCol = variant === 1 ? '#c9a47a' : C.wall;
  box(ctx, x0, top, w, 24, wallCol, OUT);
  rect(ctx, x0 + 1, top + 1, w - 2, 2, variant === 1 ? '#a8845a' : C.wallShade);
  rect(ctx, x0 + 1, gy - 5, w - 2, 4, variant === 2 ? '#4a6b7a' : '#9a3a2a');
  box(ctx, x - 13, gy - 15, 10, 15, variant === 2 ? '#3a4a5a' : '#5a3a22', OUT);
  px(ctx, x - 5, gy - 8, C.gold);
  windowPane(ctx, x + 5, gy - 16, 9, 8, variant === 2 ? '#4a6b7a' : '#2d5a3d');
  rect(ctx, x + 3, gy - 7, 13, 2, '#8c4a2a');
  for (let i = 0; i < 5; i++) px(ctx, x + 4 + i * 3, gy - 8, i % 2 ? '#c83a3a' : '#e05050');
  px(ctx, x + 5, gy - 9, '#4a7c3a');
  px(ctx, x + 11, gy - 9, '#4a7c3a');
  if (text) plaque(ctx, x - 3, top + 3, text);
  if (variant === 1) {
    box(ctx, x + 10, top - 20, 7, 12, wallCol, OUT);
    rect(ctx, x + 9, top - 21, 9, 2, OUT);
  }
  tileRoof(ctx, x0 + 5, x0 + w - 5, top - 11, x0 - 5, x0 + w + 5, top + 2);
}

function fountain(ctx: Ctx, x: number, gy: number) {
  box(ctx, x - 14, gy - 8, 28, 8, '#9c9280', '#3e3931');
  rect(ctx, x - 13, gy - 7, 26, 1, '#b8ae98');
  rect(ctx, x - 12, gy - 6, 24, 2, C.water);
  rect(ctx, x - 12, gy - 6, 24, 1, C.waterLight);
  box(ctx, x - 2, gy - 20, 5, 13, '#9c9280', '#3e3931');
  rect(ctx, x - 1, gy - 19, 1, 11, '#b8ae98');
  ellipse(ctx, x + 0.5, gy - 21, 7, 2.5, '#3e3931');
  ellipse(ctx, x + 0.5, gy - 21.5, 6, 1.5, '#9c9280');
  rect(ctx, x - 4, gy - 22, 9, 1, C.waterLight);
  rect(ctx, x, gy - 25, 1, 3, '#9c9280');
}

function bellTower(ctx: Ctx, tx: number, gy: number) {
  box(ctx, tx, gy - 82, 20, 82, C.wall, OUT);
  rect(ctx, tx + 1, gy - 6, 18, 5, '#9a3a2a');
  rect(ctx, tx + 1, gy - 81, 18, 2, C.wallShade);
  box(ctx, tx + 5, gy - 74, 10, 12, '#2a1c10', OUT);
  ellipse(ctx, tx + 10, gy - 74, 5, 3, OUT);
  ellipse(ctx, tx + 10, gy - 74, 4, 2, '#2a1c10');
  ellipse(ctx, tx + 10, gy - 67, 3, 3, '#7a6118');
  ellipse(ctx, tx + 10, gy - 67.5, 2.3, 2.5, C.goldLight);
  rect(ctx, tx + 10, gy - 72, 1, 2, C.goldDim);
  windowPane(ctx, tx + 7, gy - 34, 6, 10, '#9a3a2a');
  tileRoof(ctx, tx + 8, tx + 12, gy - 96, tx - 2, tx + 22, gy - 82);
  rect(ctx, tx + 9, gy - 104, 2, 9, C.gold);
  rect(ctx, tx + 7, gy - 101, 6, 2, C.gold);
}

function church(ctx: Ctx, x: number, gy: number) {
  const nx0 = x - 35;
  // nave con frontón (el campanario se dibuja después, delante)
  box(ctx, nx0, gy - 46, 70, 46, C.wall, OUT);
  rect(ctx, nx0 + 1, gy - 6, 68, 5, '#9a3a2a');
  rect(ctx, nx0 + 1, gy - 6, 68, 1, '#6e2419');
  poly(ctx, [[nx0 - 5, gy - 45], [nx0 + 75, gy - 45], [x + 1, gy - 70], [x, gy - 70]], OUT);
  poly(ctx, [[nx0 - 1, gy - 46], [nx0 + 71, gy - 46], [x + 1, gy - 66], [x, gy - 66]], C.wall);
  // tejas en los bordes del frontón
  for (let i = 0; i < 40; i++) {
    const t = i / 40;
    const lx = Math.round(nx0 - 4 + (x - (nx0 - 4)) * t);
    const rx = Math.round(nx0 + 74 - (nx0 + 74 - x) * t);
    const yy = Math.round(gy - 45 - 24 * t);
    rect(ctx, lx, yy - 1, 2, 3, i % 2 ? C.tile : C.tileDark);
    rect(ctx, rx - 1, yy - 1, 2, 3, i % 2 ? C.tile : C.tileDark);
  }
  rect(ctx, x - 1, gy - 78, 3, 10, C.gold);
  rect(ctx, x - 3, gy - 75, 7, 2, C.gold);
  // rosetón
  ellipse(ctx, x + 0.5, gy - 54, 5, 5, OUT);
  ellipse(ctx, x + 0.5, gy - 54, 4, 4, '#7a6118');
  ellipse(ctx, x + 0.5, gy - 54, 2.5, 2.5, '#c9a227');
  rect(ctx, x, gy - 58, 1, 8, '#9a3a2a');
  rect(ctx, x - 3, gy - 54, 8, 1, '#9a3a2a');
  // puerta en arco
  box(ctx, x - 8, gy - 22, 17, 22, '#5a3220', OUT);
  ellipse(ctx, x + 0.5, gy - 22, 8.5, 6, OUT);
  ellipse(ctx, x + 0.5, gy - 22, 7.5, 5, '#5a3220');
  rect(ctx, x, gy - 27, 1, 27, OUT);
  for (let yy = gy - 20; yy < gy - 2; yy += 4) {
    px(ctx, x - 5, yy, C.goldDim);
    px(ctx, x + 5, yy, C.goldDim);
  }
  windowPane(ctx, x - 26, gy - 36, 6, 12, '#9a3a2a');
  windowPane(ctx, x + 21, gy - 36, 6, 12, '#9a3a2a');
  bellTower(ctx, nx0 - 19, gy);
}

function flowers(ctx: Ctx, x: number, gy: number, w: number, variant = 0) {
  const pal = [
    ['#e05050', '#f2ead8', '#e8c84a'],
    ['#9a6ab8', '#f2ead8', '#c9a227'],
    ['#e8c84a', '#f3dc8a', '#d4b860'],
  ][variant % 3];
  for (let i = 0; i < w; i += 3) {
    const xx = x - Math.floor(w / 2) + i;
    if (hash(xx, 3, 44) < 0.45) continue;
    const y0 = surfaceY(xx) - Y_TOP;
    const h = 1 + Math.floor(hash(xx, 4, 44) * 3);
    rect(ctx, xx, y0 - h, 1, h, '#4a7c3a');
    px(ctx, xx, y0 - h - 1, pal[Math.floor(hash(xx, 5, 44) * 3)]);
  }
  void gy;
}

/** Dibuja todo el decorado estático sobre el lienzo del terreno. */
export function drawProps(ctx: Ctx) {
  const groundAt = (x: number) => surfaceY(x) - Y_TOP;
  for (const p of PROPS) {
    drawProp(ctx, p, groundAt(p.x) - (p.lift ?? 0));
  }
}

function drawProp(ctx: Ctx, p: Prop, gy: number) {
  switch (p.type) {
    case 'sign': return sign(ctx, p.x, gy);
    case 'agave': return agave(ctx, p.x, gy, p.variant);
    case 'rock': return rock(ctx, p.x, gy, p.variant);
    case 'boulder': return boulder(ctx, p.x, gy);
    case 'ledge': return ledge(ctx, p.x, p.w ?? 30, p.lift ?? 0);
    case 'mirador': return mirador(ctx, p.x, gy);
    case 'cairn': return cairn(ctx, p.x, gy);
    case 'woodpile': return woodpile(ctx, p.x, gy);
    case 'choza': return choza(ctx, p.x, gy);
    case 'fogon': return fogon(ctx, p.x, gy);
    case 'pirca': return pirca(ctx, p.x, gy, p.w ?? 40, p.variant);
    case 'library': return library(ctx, p.x, gy);
    case 'lectern': return lectern(ctx, p.x, gy);
    case 'crates': return crates(ctx, p.x, gy);
    case 'blackboard': return blackboard(ctx, p.x, gy);
    case 'bench': return bench(ctx, p.x, gy);
    case 'desk': return desk(ctx, p.x, gy);
    case 'honorboard': return honorboard(ctx, p.x, gy);
    case 'casa': return casa(ctx, p.x, gy);
    case 'haystack': return haystack(ctx, p.x, gy, p.variant);
    case 'scarecrow': return scarecrow(ctx, p.x, gy);
    case 'granero': return granero(ctx, p.x, gy);
    case 'gate': return gate(ctx, p.x, gy, p.text);
    case 'corral': return corral(ctx, p.x, gy, p.w ?? 90);
    case 'hacienda': return hacienda(ctx, p.x, gy);
    case 'stonepile': return stonepile(ctx, p.x, gy);
    case 'logs': return logs(ctx, p.x, gy);
    case 'wheelbarrow': return wheelbarrow(ctx, p.x, gy);
    case 'cross': return crossStone(ctx, p.x, gy);
    case 'house': return house(ctx, p.x, gy, p.variant, p.text);
    case 'fountain': return fountain(ctx, p.x, gy);
    case 'church': return church(ctx, p.x, gy);
    case 'flowers': return flowers(ctx, p.x, gy, p.w ?? 30, p.variant);
  }
}
