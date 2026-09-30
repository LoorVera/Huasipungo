// Sprites pixel art definidos como cuadrículas de texto.
// Cada carácter es un color de la paleta del sprite; '.' es transparente.

type Pal = Record<string, string>;

const BASE: Pal = {
  K: '#1f140c',
  s: '#b98056',
  S: '#8d5a3a',
  t: '#cf9466',
  e: '#0c0904',
  w: '#e8dcc4',
  W: '#b8a88c',
  f: '#4a2a18',
};

// ── Andrés Chiliquinga (jugador) ──────────────────────────────────────────
const ANDRES_PAL: Pal = {
  ...BASE,
  b: '#1a1410',
  h: '#5a3a22',
  H: '#3e2616',
  l: '#7a5230',
  G: '#c9a227',
  p: '#9a3a2a',
  P: '#6e2419',
  q: '#b8503a',
  g: '#c9a227',
  y: '#e8c84a',
};

const ANDRES_BODY = [
  '......KKKK......',
  '.....KhhhlK.....',
  '.....KhhhlK.....',
  '.....KGGGGK.....',
  '...KKhhhhhhKK...',
  '..KHHHHHHHHHHK..',
  '....KbbssssK....',
  '....KbbsssesK...',
  '....KbSsssssK...',
  '....KbSsssSK....',
  '.....KSSSSK.....',
  '....KqKssKpK....',
  '...KqppKKpppK...',
  '..KqppppppppPK..',
  '..KqpgggggggPK..',
  '..KqpyyyyyyyPK..',
  '..KqpgggggggPsK.',
  '..KqppppppppPK..',
];
const FRINGE_A = '..KgKgKgKgKgKK..';
const FRINGE_B = '..KKgKgKgKgKgK..';

const LEGS = {
  stand: ['....KwwwKwwwK...', '....KwWwKwWwK...', '....KsSK.KsSK...', '....KsSK.KsSK...', '....KffK.KffK...'],
  walk1: ['....KwwwwwwwK...', '...KWWWK.KwwWK..', '..KSSK....KsSK..', '.KSSK......KsSK.', '.KffK......KffK.'],
  walk2: ['.....KwwwwwK....', '.....KwWKWWK....', '.....KsSKSSK....', '.....KsSKSSK....', '....KffKKffK....'],
  walk3: ['....KwwwwwwwK...', '...KwwWK.KWWWK..', '..KsSK....KSSK..', '.KsSK......KSSK.', '.KffK......KffK.'],
  walk4: ['.....KwwwwwK....', '.....KWWKwWK....', '.....KSSKsSK....', '.....KSSKsSK....', '....KffKKffK....'],
  jump: ['....KwwwwwwK....', '...KwwWKwwWK....', '...KsSKKsSK.....', '..KffK.KffK.....', '................'],
  fall: ['....KwwwKwwwK...', '...KwwWK.KwwWK..', '...KsSK...KsSK..', '...KsSK...KsSK..', '..KffK.....KffK.'],
};

/** Desplaza hacia abajo las filas [0, upTo) una fila (respiración). */
function breathe(rows: string[], upTo: number): string[] {
  const out = [...rows];
  const blank = '.'.repeat(rows[0].length);
  for (let r = upTo; r > 0; r--) out[r] = rows[r - 1];
  out[0] = blank;
  return out;
}

const andres = (legs: string[], fringe = FRINGE_A) => [...ANDRES_BODY, fringe, ...legs];

// ── Cunshi ────────────────────────────────────────────────────────────────
const CUNSHI_PAL: Pal = {
  ...BASE,
  b: '#1a1410',
  B: '#3a2e24',
  n: '#4a7c59',
  m: '#2d5a3d',
  M: '#1e3a24',
  r: '#9a3a2a',
  g: '#c9a227',
  y: '#e8c84a',
  o: '#9a3a2a',
  a: '#1f1814',
  A: '#3a2e24',
};
const CUNSHI = [
  '................',
  '......KKKK......',
  '.....KbbbbK.....',
  '....KbBbbbbK....',
  '....KbbbsssK....',
  '....KbbssesK....',
  '....KbbSssssK...',
  '....KbbbSsSK....',
  '...KbbbbKSSK....',
  '..KnnKbbKggK....',
  '.KnssnKKgygK....',
  '.KnnnnKwwwwwK...',
  'KmnmnmKwrwrwK...',
  'KmmmmmKwwwwwsK..',
  'KMmmmmKwwwwwK...',
  '.KMMMKoooooooK..',
  '..KKKaaaaAaaaK..',
  '....KaaaaAaaaK..',
  '....KaaaaAaaaK..',
  '....KaaaaAaaaaK.',
  '....KaaaaAaaaaK.',
  '....KKKKKKKKKKK.',
  '.....KsSK.KsSK..',
  '....KffK..KffK..',
];

// ── Alfonso Pereira ───────────────────────────────────────────────────────
const ALFONSO_PAL: Pal = {
  ...BASE,
  b: '#2a1a10',
  k: '#1a1410',
  j: '#3a2e24',
  G: '#c9a227',
  m: '#2a1a10',
  d: '#2e2824',
  D: '#1a1612',
  x: '#48403a',
  R: '#6e2419',
  g: '#e8c84a',
  o: '#3a2810',
  O: '#5a3a22',
};
const ALFONSO = [
  '......KKKK......',
  '.....KkkkjK.....',
  '.....KkkkjK.....',
  '.....KGGGGK.....',
  '...KKkkkkkkKK...',
  '..KkkkkkkkkkkK..',
  '....KbbssssK....',
  '....KbbsssesK...',
  '....KbSsssssK...',
  '....KbSmmmmK....',
  '.....KSssSK.....',
  '....KxwwRwwK....',
  '...KxddwRwddK...',
  '..KxdddwRwdddK..',
  '..KxdddddgdDDK..',
  '..KxddddgddDsK..',
  '..KxdddddddDDK..',
  '...KddddddddK...',
  '...KdddKddddK...',
  '....KdDKdDK.....',
  '....KdDKdDK.....',
  '....KoOKoOK.....',
  '....KoOKoOK.....',
  '...KooOKooOK....',
];

// ── Julio Pereira ─────────────────────────────────────────────────────────
const JULIO_PAL: Pal = {
  ...BASE,
  b: '#c9c4b8',
  B: '#9a958a',
  d: '#4a3420',
  D: '#33230f',
  x: '#6b4a2e',
  v: '#7a5230',
  g: '#e8c84a',
  c: '#3a2810',
  C: '#c9a227',
  o: '#1a1410',
  O: '#3a2e24',
};
const JULIO = [
  '................',
  '................',
  '......KKKK......',
  '.....KBbbbK.....',
  '....KBbbbbbK....',
  '....KBbssssK....',
  '....KbbsssesK...',
  '....KbSsssssK...',
  '....KbSbbbbK....',
  '.....KSSsSK.....',
  '.....KKSSKK.....',
  '....KxwwwdK.....',
  '...KxdvwvddK....',
  '..KxddvgvddDK...',
  '..KxddvvvddDKC..',
  '..KxddddddDsKc..',
  '..KxddddddDDKc..',
  '...KddddddddKc..',
  '...KdddKddddKc..',
  '....KdDKdDK..c..',
  '....KdDKdDK..c..',
  '....KdDKdDK..c..',
  '....KoOKoOK..c..',
  '...KooOKooOK.c..',
];

// ── El cura ───────────────────────────────────────────────────────────────
const CURA_PAL: Pal = {
  ...BASE,
  t: '#c9956a',
  b: '#6e665c',
  k: '#161212',
  j: '#302824',
  J: '#0a0808',
  g: '#c9a227',
  y: '#e8c84a',
  o: '#0a0808',
};
const CURA = [
  '................',
  '................',
  '......KKKK......',
  '.....KttttK.....',
  '....KbttttbK....',
  '....KbsssssK....',
  '....KbsssesK....',
  '....KbSsssssK...',
  '....KbSsssSK....',
  '.....KSSSSK.....',
  '....KkkwwkkK....',
  '...KjkkkgkkkK...',
  '..KjkkkgygkkkK..',
  '..KjkkkkgkkkkK..',
  '..KjkkkkgkkkksK.',
  '..KjkkkkkkkkkK..',
  '.KjjkkkkkkkkkK..',
  '.KjkkkkkkkkkJK..',
  '.KjkkkkkkkkkJK..',
  '..KjkkkkkkkkJK..',
  '..KjkkkkkkkkJK..',
  '..KjkkkkkkkkJK..',
  '...KKKKKKKKKK...',
  '....KooK.KooK...',
];

// ── Comuneros (la comunidad indígena) ─────────────────────────────────────
function comuneroBody(hatTop: string, hatBrim: string): string[] {
  return [
    '......KKKK......',
    `.....K${hatTop}K.....`,
    `.....K${hatTop}K.....`,
    '.....KkkkkK.....',
    `...KK${hatBrim}KK...`,
    '..KHHHHHHHHHHK..',
    '....KbbssssK....',
    '....KbbsssesK...',
    '....KbSsssssK...',
    '....KbSsssSK....',
    '.....KSSSSK.....',
    '....KqKssKpK....',
    '...KqppKKpppK...',
    '..KqppppppppPK..',
    '..KqpgggggggPK..',
    '..KqppppppppPsK.',
    '..KqpgggggggPK..',
    '..KqppppppppPK..',
    '..KgKgKgKgKgKK..',
    ...LEGS.stand,
  ];
}
const COMUNERO1_PAL: Pal = {
  ...BASE,
  b: '#1a1410',
  h: '#d8ccb4',
  H: '#a8987c',
  k: '#1a1410',
  p: '#6b4a2e',
  P: '#4a321e',
  q: '#8a6444',
  g: '#c8b088',
};
const COMUNERO2_PAL: Pal = {
  ...BASE,
  b: '#1a1410',
  h: '#2a2420',
  H: '#1a1612',
  k: '#9a3a2a',
  p: '#3e4a3a',
  P: '#2a3428',
  q: '#56644e',
  g: '#9a3a2a',
};
const COMUNERO_BODY_1 = comuneroBody('hhhh', 'hhhhhh');

const COMUNERA_PAL: Pal = {
  ...BASE,
  b: '#1a1410',
  h: '#d8ccb4',
  H: '#a8987c',
  k: '#9a3a2a',
  r: '#9a3a2a',
  R: '#6e2419',
  q: '#b8503a',
  g: '#c9a227',
  a: '#1f1814',
  A: '#3a2e24',
  c: '#8a6a3a',
  C: '#6b4a24',
};
const COMUNERA = [
  '......KKKK......',
  '.....KhhhhK.....',
  '.....KkkkkK.....',
  '...KKhhhhhhKK...',
  '..KHHHHHHHHHHK..',
  '....KbbssssK....',
  '....KbbsssesK...',
  '....KbSsssssK...',
  '....KbbSsSK.....',
  '...KbbKSSK......',
  '...KbKqrrrrK....',
  '..KqrrrrrrrrK...',
  '..KqrrgggrrRK...',
  '..KqrrrrrrrRsK..',
  '..KRrrrrrrRRK...',
  '...KaaaaAaaaK...',
  '...KaaaaAaaaK...',
  '...KaaaaAaaaK...',
  '...KaaaaAaaaaK..',
  '...KaaaaAaaaaK..',
  '...KKKKKKKKKKK..',
  '....KsSK.KsSK...',
  '....KsSK.KsSK...',
  '...KffK..KffK...',
];

// ── Animales ──────────────────────────────────────────────────────────────
const HEN_PAL: Pal = { K: '#1f140c', w: '#c8a070', W: '#9a7048', r: '#b8403a', y: '#e0b040', e: '#0c0904', l: '#c89040' };
const HEN = [
  ['......rr.', '.....KwwK', '.....Kwey', 'K...KwwK.', 'KwwwwWwK.', '.KwWWWwK.', '..KwwwK..', '...l.l...'],
  ['.........', '......rr.', '.....KwwK', 'K....Kwey', 'KwwwwWwK.', '.KwWWWwK.', '..KwwwK..', '...l.l...'],
];

const SHEEP_PAL: Pal = { K: '#2a2018', w: '#e8dcc4', W: '#b8a88c', d: '#3a3028', e: '#e8dcc4', l: '#3a3028' };
const SHEEP = [
  ['..KKK.KKK....', '.KwwwKwwwKKK.', 'KwwwwwwwwKddK', 'KwwwwwwwwKdeK', 'KWwwwwwwwKddK', '.KWWwwwwWKKK.', '..KKKKKKKK...', '..l.l..l.l...'],
  ['..KKK.KKK....', '.KwwwKwwwK...', 'KwwwwwwwwKKK.', 'KwwwwwwwwKddK', 'KWwwwwwwwKdeK', '.KWWwwwwWKddK', '..KKKKKKKKK..', '..l.l..l.l...'],
];

const COW_PAL: Pal = { K: '#1f140c', b: '#6b3f2a', B: '#4a2a18', w: '#e8dcc4', h: '#d8ccb4', n: '#c89a80', e: '#0c0904', l: '#4a2a18' };
const COW = [
  [
    '...............h.h..',
    '..............KbbbK.',
    '.KKKKKKKKKKKKKbbebK.',
    'KbbwwwbbbbwwbbbbbnnK',
    'KbwwwwbbbwwwwbbbKnnK',
    'KbbwwbbbbbwwbbbbK...',
    'KBbbbbbwwbbbbbbBK...',
    '.KBbbbbbbbbbbbBK....',
    '..KBBBBBBBBBBBK.....',
    '..Kl.Kl.....Kl.Kl...',
    '..Kl.Kl.....Kl.Kl...',
    '..KK.KK.....KK.KK...',
  ],
  [
    '....................',
    '...............h.h..',
    '.KKKKKKKKKKKKKKbbbK.',
    'KbbwwwbbbbwwbbKbbebK',
    'KbwwwwbbbwwwwbbbbnnK',
    'KbbwwbbbbbwwbbbbKnnK',
    'KBbbbbbwwbbbbbbBK...',
    '.KBbbbbbbbbbbbBK....',
    '..KBBBBBBBBBBBK.....',
    '..Kl.Kl.....Kl.Kl...',
    '..Kl.Kl.....Kl.Kl...',
    '..KK.KK.....KK.KK...',
  ],
];

const CONDOR_PAL: Pal = { K: '#0c0904', b: '#1f1a18', w: '#e8dcc4', W: '#b8a88c', r: '#9a4a3a', y: '#c9a227' };
const CONDOR = [
  [
    'KK......................KK',
    '.KbK..................KbK.',
    '..KbbK......KK......KbbK..',
    '...KbbbbK..KrrK..KbbbbK...',
    '....KbWbbbKwwwwKbbbWbK....',
    '.....KWWbbbbbbbbbbWWK.....',
    '......KKWWbbbbbbWWKK......',
    '........KKKbbbbKKK........',
    '...........KKKK...........',
  ],
  [
    '..........................',
    '............KK............',
    '...........KrrK...........',
    '.KKKKKKbbbKwwwwKbbbKKKKKK.',
    'KbbbbWWbbbbbbbbbbbbWWbbbbK',
    '.KKbbWWWbbbbbbbbbbWWWbbKK.',
    '...KKKKWWbbbbbbbbWWKKKK...',
    '.......KKKbbbbbbKKK.......',
    '..........KKKKKK..........',
  ],
];

const BIRD_PAL: Pal = { K: '#2a2018' };
const BIRD = [
  ['K...K', '.K.K.', '..K..'],
  ['.....', 'KK.KK', '..K..'],
];

const BUTTERFLY_PAL: Pal = { y: '#e8c84a', o: '#c9802a', K: '#1f140c' };
const BUTTERFLY = [
  ['y.y', 'oKo', 'y.y'],
  ['...', 'yKy', '...'],
];

const PIGEON_PAL: Pal = { K: '#2a2420', g: '#8a8a90', G: '#6a6a72', n: '#5a7a6a', y: '#c9a227', e: '#0c0904' };
const PIGEON = [
  ['....KK.', '...Kgey', 'KK.Kng.', 'KgggnG.', '.KGGGK.', '..y.y..'],
  ['.......', '....KK.', 'KK.Kgey', 'KgggngK', '.KGGGK.', '..y.y..'],
];

// ── Objetos ───────────────────────────────────────────────────────────────
const PAGE_PAL: Pal = { K: '#5a3a22', c: '#f2ead8', C: '#d8c8a8', l: '#8c7459' };
const PAGE = [['.KKKKK.', 'KccccCK', 'KcllcCK', 'KccccCK', 'KclllCK', 'KccccCK', 'KcllcCK', 'KccccCK', '.KKKKK.']];

const MARK_PAL: Pal = { K: '#1f140c', g: '#e8c84a', G: '#c9a227' };
const MARK_EXCL = [['.KKK.', 'KggGK', 'KggGK', 'KggGK', '.KgK.', '.KKK.', 'KggGK', '.KKK.']];
const MARK_QUEST = [['.KKKK.', 'KggggK', 'KGKKgK', '..KgGK', '..KgK.', '..KKK.', '..KgK.', '..KKK.']];

// ── Construcción de canvases ─────────────────────────────────────────────
export interface SpriteSet {
  w: number;
  h: number;
  right: HTMLCanvasElement[];
  left: HTMLCanvasElement[];
}

function buildFrame(rows: string[], pal: Pal, w: number, extra?: (ctx: CanvasRenderingContext2D) => void) {
  const h = rows.length;
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const ctx = c.getContext('2d')!;
  rows.forEach((row, y) => {
    for (let x = 0; x < Math.min(row.length, w); x++) {
      const ch = row[x];
      if (ch === '.' || ch === ' ') continue;
      const col = pal[ch];
      if (!col) continue;
      ctx.fillStyle = col;
      ctx.fillRect(x, y, 1, 1);
    }
  });
  extra?.(ctx);
  return c;
}

function mirror(src: HTMLCanvasElement) {
  const c = document.createElement('canvas');
  c.width = src.width;
  c.height = src.height;
  const ctx = c.getContext('2d')!;
  ctx.translate(src.width, 0);
  ctx.scale(-1, 1);
  ctx.drawImage(src, 0, 0);
  return c;
}

function makeSet(frames: string[][], pal: Pal, width?: number, extras?: ((ctx: CanvasRenderingContext2D) => void)[]): SpriteSet {
  const w = width ?? Math.max(...frames.map(f => Math.max(...f.map(r => r.length))));
  const right = frames.map((f, i) => buildFrame(f, pal, w, extras?.[i]));
  return { w, h: frames[0].length, right, left: right.map(mirror) };
}

/** Dibuja un azadón (mango + hoja) en el sprite de un comunero. */
function hoe(up: boolean) {
  return (ctx: CanvasRenderingContext2D) => {
    const handle = '#7a5230';
    const blade = '#8a8070';
    const K = '#1f140c';
    const pts: [number, number][] = up
      ? [[13, 14], [14, 12], [15, 10], [16, 8], [17, 6], [18, 4]]
      : [[13, 16], [14, 17], [15, 18], [16, 19], [17, 20], [18, 21]];
    for (const [x, y] of pts) {
      ctx.fillStyle = handle;
      ctx.fillRect(x, y, 1, 2);
    }
    ctx.fillStyle = K;
    if (up) {
      ctx.fillRect(16, 2, 4, 3);
      ctx.fillStyle = blade;
      ctx.fillRect(17, 3, 2, 1);
    } else {
      ctx.fillRect(17, 21, 3, 3);
      ctx.fillStyle = blade;
      ctx.fillRect(18, 22, 1, 1);
    }
  };
}

/** Dibuja una canasta en el brazo de la comunera. */
function basket(ctx: CanvasRenderingContext2D) {
  ctx.fillStyle = '#1f140c';
  ctx.fillRect(12, 13, 6, 5);
  ctx.fillStyle = '#8a6a3a';
  ctx.fillRect(13, 14, 4, 3);
  ctx.fillStyle = '#c9a227';
  ctx.fillRect(13, 13, 1, 1);
  ctx.fillRect(15, 13, 1, 1);
  ctx.fillStyle = '#6b4a24';
  ctx.fillRect(13, 16, 4, 1);
}

export interface CharacterSprites {
  idle: SpriteSet;
  walk?: SpriteSet;
  jump?: SpriteSet;
  fall?: SpriteSet;
}

let cache: Record<string, CharacterSprites> | null = null;

export function getSprites(): Record<string, CharacterSprites> {
  if (cache) return cache;
  const idleOf = (rows: string[], pal: Pal, w = 16, breathUpTo = 11) => makeSet([rows, breathe(rows, breathUpTo)], pal, w);

  cache = {
    andres: {
      idle: idleOf(andres(LEGS.stand), ANDRES_PAL),
      walk: makeSet(
        [
          andres(LEGS.walk1, FRINGE_A),
          andres(LEGS.walk2, FRINGE_B),
          andres(LEGS.walk3, FRINGE_A),
          andres(LEGS.walk4, FRINGE_B),
        ],
        ANDRES_PAL,
        16,
      ),
      jump: makeSet([andres(LEGS.jump, FRINGE_B)], ANDRES_PAL, 16),
      fall: makeSet([andres(LEGS.fall, FRINGE_A)], ANDRES_PAL, 16),
    },
    cunshi: { idle: idleOf(CUNSHI, CUNSHI_PAL, 16, 10) },
    alfonso: { idle: idleOf(ALFONSO, ALFONSO_PAL) },
    julio: { idle: idleOf(JULIO, JULIO_PAL, 16, 12) },
    cura: { idle: idleOf(CURA, CURA_PAL, 16, 12) },
    comunero1: {
      idle: makeSet([COMUNERO_BODY_1, COMUNERO_BODY_1], COMUNERO1_PAL, 20, [hoe(true), hoe(false)]),
    },
    comunero2: {
      idle: makeSet([COMUNERO_BODY_1, COMUNERO_BODY_1], COMUNERO2_PAL, 20, [hoe(false), hoe(true)]),
    },
    comunera: {
      idle: makeSet([COMUNERA, breathe(COMUNERA, 10)], COMUNERA_PAL, 20, [basket, basket]),
    },
    hen: { idle: makeSet(HEN, HEN_PAL) },
    sheep: { idle: makeSet(SHEEP, SHEEP_PAL) },
    cow: { idle: makeSet(COW, COW_PAL) },
    condor: { idle: makeSet(CONDOR, CONDOR_PAL) },
    bird: { idle: makeSet(BIRD, BIRD_PAL) },
    butterfly: { idle: makeSet(BUTTERFLY, BUTTERFLY_PAL) },
    pigeon: { idle: makeSet(PIGEON, PIGEON_PAL) },
    page: { idle: makeSet(PAGE, PAGE_PAL) },
    markExcl: { idle: makeSet(MARK_EXCL, MARK_PAL) },
    markQuest: { idle: makeSet(MARK_QUEST, MARK_PAL) },
  };
  return cache;
}
