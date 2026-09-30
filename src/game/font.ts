// Fuente bitmap 5x7 (solo mayúsculas) con tildes, ñ y signos de apertura.
// Cada glifo se dibuja píxel a píxel y se cachea como canvas.

type Glyph = { rows: string[]; accent?: string[] };

const G: Record<string, string[]> = {
  A: ['.###.', '#...#', '#...#', '#####', '#...#', '#...#', '#...#'],
  B: ['####.', '#...#', '#...#', '####.', '#...#', '#...#', '####.'],
  C: ['.###.', '#...#', '#....', '#....', '#....', '#...#', '.###.'],
  D: ['####.', '#...#', '#...#', '#...#', '#...#', '#...#', '####.'],
  E: ['#####', '#....', '#....', '####.', '#....', '#....', '#####'],
  F: ['#####', '#....', '#....', '####.', '#....', '#....', '#....'],
  G: ['.###.', '#...#', '#....', '#.###', '#...#', '#...#', '.###.'],
  H: ['#...#', '#...#', '#...#', '#####', '#...#', '#...#', '#...#'],
  I: ['###', '.#.', '.#.', '.#.', '.#.', '.#.', '###'],
  J: ['..###', '...#.', '...#.', '...#.', '#..#.', '#..#.', '.##..'],
  K: ['#...#', '#..#.', '#.#..', '##...', '#.#..', '#..#.', '#...#'],
  L: ['#....', '#....', '#....', '#....', '#....', '#....', '#####'],
  M: ['#...#', '##.##', '#.#.#', '#.#.#', '#...#', '#...#', '#...#'],
  N: ['#...#', '#...#', '##..#', '#.#.#', '#..##', '#...#', '#...#'],
  O: ['.###.', '#...#', '#...#', '#...#', '#...#', '#...#', '.###.'],
  P: ['####.', '#...#', '#...#', '####.', '#....', '#....', '#....'],
  Q: ['.###.', '#...#', '#...#', '#...#', '#.#.#', '#..#.', '.##.#'],
  R: ['####.', '#...#', '#...#', '####.', '#.#..', '#..#.', '#...#'],
  S: ['.####', '#....', '#....', '.###.', '....#', '....#', '####.'],
  T: ['#####', '..#..', '..#..', '..#..', '..#..', '..#..', '..#..'],
  U: ['#...#', '#...#', '#...#', '#...#', '#...#', '#...#', '.###.'],
  V: ['#...#', '#...#', '#...#', '#...#', '#...#', '.#.#.', '..#..'],
  W: ['#...#', '#...#', '#...#', '#.#.#', '#.#.#', '#.#.#', '.#.#.'],
  X: ['#...#', '#...#', '.#.#.', '..#..', '.#.#.', '#...#', '#...#'],
  Y: ['#...#', '#...#', '.#.#.', '..#..', '..#..', '..#..', '..#..'],
  Z: ['#####', '....#', '...#.', '..#..', '.#...', '#....', '#####'],
  '0': ['.###.', '#...#', '#..##', '#.#.#', '##..#', '#...#', '.###.'],
  '1': ['.#.', '##.', '.#.', '.#.', '.#.', '.#.', '###'],
  '2': ['.###.', '#...#', '....#', '...#.', '..#..', '.#...', '#####'],
  '3': ['####.', '....#', '....#', '.###.', '....#', '....#', '####.'],
  '4': ['...#.', '..##.', '.#.#.', '#..#.', '#####', '...#.', '...#.'],
  '5': ['#####', '#....', '####.', '....#', '....#', '#...#', '.###.'],
  '6': ['.###.', '#....', '#....', '####.', '#...#', '#...#', '.###.'],
  '7': ['#####', '....#', '...#.', '..#..', '.#...', '.#...', '.#...'],
  '8': ['.###.', '#...#', '#...#', '.###.', '#...#', '#...#', '.###.'],
  '9': ['.###.', '#...#', '#...#', '.####', '....#', '....#', '.###.'],
  ' ': ['..', '..', '..', '..', '..', '..', '..'],
  '.': ['.', '.', '.', '.', '.', '.', '#'],
  ',': ['..', '..', '..', '..', '..', '.#', '#.'],
  ':': ['.', '.', '#', '.', '.', '#', '.'],
  ';': ['..', '..', '.#', '..', '..', '.#', '#.'],
  '!': ['#', '#', '#', '#', '#', '.', '#'],
  '¡': ['#', '.', '#', '#', '#', '#', '#'],
  '?': ['.###.', '#...#', '....#', '...#.', '..#..', '.....', '..#..'],
  '¿': ['..#..', '.....', '..#..', '.#...', '#....', '#...#', '.###.'],
  '-': ['...', '...', '...', '###', '...', '...', '...'],
  '+': ['.....', '..#..', '..#..', '#####', '..#..', '..#..', '.....'],
  '/': ['....#', '...#.', '...#.', '..#..', '.#...', '.#...', '#....'],
  '(': ['.#', '#.', '#.', '#.', '#.', '#.', '.#'],
  ')': ['#.', '.#', '.#', '.#', '.#', '.#', '#.'],
  "'": ['#', '#', '.', '.', '.', '.', '.'],
  '"': ['#.#', '#.#', '...', '...', '...', '...', '...'],
  '%': ['##..#', '##..#', '...#.', '..#..', '.#...', '#..##', '#..##'],
  '·': ['.', '.', '.', '#', '.', '.', '.'],
  '[': ['##', '#.', '#.', '#.', '#.', '#.', '##'],
  ']': ['##', '.#', '.#', '.#', '.#', '.#', '##'],
  '<': ['...#', '..#.', '.#..', '#...', '.#..', '..#.', '...#'],
  '>': ['#...', '.#..', '..#.', '...#', '..#.', '.#..', '#...'],
  '=': ['....', '....', '####', '....', '####', '....', '....'],
  '#': ['.#.#.', '#####', '.#.#.', '.#.#.', '.#.#.', '#####', '.#.#.'],
};

const ACUTE_5 = ['...#.', '..#..'];
const ACUTE_3 = ['..#', '.#.'];
const TILDE = ['.##.#', '#..#.'];
const UMLAUT = ['.....', '.#.#.'];

const COMPOSED: Record<string, { base: string; accent: string[] }> = {
  'Á': { base: 'A', accent: ACUTE_5 },
  'É': { base: 'E', accent: ACUTE_5 },
  'Í': { base: 'I', accent: ACUTE_3 },
  'Ó': { base: 'O', accent: ACUTE_5 },
  'Ú': { base: 'U', accent: ACUTE_5 },
  'Ñ': { base: 'N', accent: TILDE },
  'Ü': { base: 'U', accent: UMLAUT },
};

function glyph(ch: string): Glyph {
  const composed = COMPOSED[ch];
  if (composed) return { rows: G[composed.base], accent: composed.accent };
  return { rows: G[ch] ?? G['?'] };
}

/** Alto total de una línea (2 filas para tildes + 7 de letra + 1 de separación). */
export const LINE_H = 10;

export function textWidth(text: string): number {
  const up = text.toUpperCase();
  let w = 0;
  let n = 0;
  for (const ch of up) {
    w += glyph(ch).rows[0].length;
    n++;
  }
  return n > 0 ? w + (n - 1) : 0;
}

const cache = new Map<string, HTMLCanvasElement>();

/** Devuelve un canvas con el texto dibujado (fila 0-1 = tildes; la letra empieza en y=2). */
export function renderText(text: string, color: string, outline?: string): HTMLCanvasElement {
  const key = `${text}|${color}|${outline ?? ''}`;
  const hit = cache.get(key);
  if (hit) return hit;

  const up = text.toUpperCase();
  const pad = outline ? 1 : 0;
  const c = document.createElement('canvas');
  c.width = Math.max(1, textWidth(up) + pad * 2);
  c.height = 9 + pad * 2;
  const ctx = c.getContext('2d')!;

  const pts: number[] = [];
  let x = 0;
  for (const ch of up) {
    const g = glyph(ch);
    g.rows.forEach((row, ry) => {
      for (let rx = 0; rx < row.length; rx++) if (row[rx] === '#') pts.push(x + rx, ry + 2);
    });
    g.accent?.forEach((row, ry) => {
      for (let rx = 0; rx < row.length; rx++) if (row[rx] === '#') pts.push(x + rx, ry);
    });
    x += g.rows[0].length + 1;
  }

  if (outline) {
    ctx.fillStyle = outline;
    for (let i = 0; i < pts.length; i += 2) {
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) ctx.fillRect(pts[i] + pad + dx, pts[i + 1] + pad + dy, 1, 1);
      }
    }
  }
  ctx.fillStyle = color;
  for (let i = 0; i < pts.length; i += 2) ctx.fillRect(pts[i] + pad, pts[i + 1] + pad, 1, 1);

  if (cache.size > 400) cache.clear();
  cache.set(key, c);
  return c;
}

/**
 * Dibuja texto con la fuente bitmap. `y` es la parte superior de las mayúsculas.
 */
export function drawText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  color: string,
  opts: { align?: 'left' | 'center' | 'right'; outline?: string } = {},
) {
  const c = renderText(text, color, opts.outline);
  const pad = opts.outline ? 1 : 0;
  let dx = Math.round(x) - pad;
  if (opts.align === 'center') dx = Math.round(x - (c.width - pad * 2) / 2) - pad;
  else if (opts.align === 'right') dx = Math.round(x - (c.width - pad * 2)) - pad;
  ctx.drawImage(c, dx, Math.round(y) - 2 - pad);
}
