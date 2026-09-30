// Datos del mundo: zonas, relieve, plataformas, NPCs, lugares interactivos y páginas.
// Coordenadas en píxeles del mundo; y crece hacia abajo y el suelo base está en y = 0.

export const WORLD_W = 4400;
/** Límite superior/inferior del lienzo pre-renderizado del terreno. */
export const Y_TOP = -210;
export const Y_BOTTOM = 210;

export type ZoneId = 'montanas' | 'huasipungo' | 'aprendizaje' | 'casa' | 'cultivos' | 'hacienda' | 'pueblo';

export interface Zone {
  id: ZoneId;
  name: string;
  subtitle: string;
  emoji: string;
  x0: number;
  x1: number;
  /** Punto de llegada al viajar a la zona. */
  spawn: number;
  color: string;
  ambient: 'mist' | 'smoke' | 'motes' | 'pollen' | 'dust';
}

export const ZONES: Zone[] = [
  { id: 'montanas', name: 'Las Montañas', subtitle: 'Páramo andino · tierra ancestral', emoji: '⛰️', x0: 0, x1: 700, spawn: 640, color: '#4a6b7a', ambient: 'mist' },
  { id: 'huasipungo', name: 'El Huasipungo', subtitle: 'El hogar de Andrés y Cunshi', emoji: '🛖', x0: 700, x1: 1300, spawn: 1030, color: '#4a7c59', ambient: 'smoke' },
  { id: 'aprendizaje', name: 'Zona de Aprendizaje', subtitle: 'Estudia la novela de Jorge Icaza', emoji: '📚', x0: 1300, x1: 1950, spawn: 1360, color: '#c9a227', ambient: 'motes' },
  { id: 'casa', name: 'Casa de los Personajes', subtitle: 'Galería de retratos de la novela', emoji: '🏠', x0: 1950, x1: 2400, spawn: 2010, color: '#9a5c3f', ambient: 'motes' },
  { id: 'cultivos', name: 'Zona de Cultivos', subtitle: 'Trabajo forzado en tierras ajenas', emoji: '🌽', x0: 2400, x1: 3050, spawn: 2440, color: '#7a6118', ambient: 'pollen' },
  { id: 'hacienda', name: 'La Hacienda', subtitle: 'Cuchitambo · el poder del patrón', emoji: '🏚️', x0: 3050, x1: 3800, spawn: 3110, color: '#6b3f2a', ambient: 'dust' },
  { id: 'pueblo', name: 'El Pueblo', subtitle: 'La iglesia y las autoridades', emoji: '⛪', x0: 3800, x1: 4400, spawn: 3860, color: '#8a4a4a', ambient: 'dust' },
];

export function zoneAt(x: number): Zone {
  for (const z of ZONES) if (x < z.x1) return z;
  return ZONES[ZONES.length - 1];
}

// ── Relieve: puntos de control [x, elevación] (interpolación lineal) ──────
const H: [number, number][] = [
  [0, 330], [44, 330],
  [45, 118], [236, 118],
  [240, 44], [330, 44], [380, 38], [440, 31], [470, 30],
  [471, 20], [560, 14], [640, 5], [700, 0],
  [800, 2], [880, 1], [900, 0], [1150, 0], [1220, 3], [1300, 0],
  [2400, 0],
  // terrazas de cultivo
  [2470, 0], [2471, 10], [2560, 10], [2561, 20], [2720, 20], [2721, 10], [2820, 10], [2821, 0],
  [3800, 0],
  // gradas de la iglesia
  [4028, 0], [4029, 3], [4032, 3], [4033, 6], [4036, 6], [4037, 9],
  [4190, 9], [4191, 6], [4194, 6], [4195, 3], [4198, 3], [4199, 0],
  [4350, 0], [4351, 330], [4400, 330],
];

let heightmap: Int16Array | null = null;

/** y de la superficie (negativo = más alto) para cada columna del mundo. */
export function getHeightmap(): Int16Array {
  if (heightmap) return heightmap;
  const hm = new Int16Array(WORLD_W);
  let i = 0;
  for (let x = 0; x < WORLD_W; x++) {
    while (i < H.length - 2 && x > H[i + 1][0]) i++;
    const [x0, e0] = H[i];
    const [x1, e1] = H[i + 1];
    const t = x1 === x0 ? 0 : Math.min(1, Math.max(0, (x - x0) / (x1 - x0)));
    hm[x] = -Math.round(e0 + (e1 - e0) * t);
  }
  heightmap = hm;
  return hm;
}

export function surfaceY(x: number): number {
  const hm = getHeightmap();
  const i = Math.max(0, Math.min(WORLD_W - 1, Math.round(x)));
  return hm[i];
}

export type SurfaceKind = 'rock' | 'paramo' | 'grass' | 'dirt' | 'field' | 'patio' | 'road' | 'cobble';

export function surfaceKind(x: number): SurfaceKind {
  if (x < 240 || x >= 4350) return 'rock';
  if (x < 700) return 'paramo';
  if (x >= 930 && x < 1160) return 'dirt';
  if (x < 2400) {
    if (x >= 1410 && x < 1900) return 'dirt';
    if (x >= 2090 && x < 2250) return 'patio';
    return 'grass';
  }
  if (x < 2900) return 'field';
  if (x < 3050) return 'dirt';
  if (x < 3600) return x >= 3270 && x < 3530 ? 'patio' : 'grass';
  if (x < 3800) return 'road';
  return 'cobble';
}

// ── Plataformas de un solo sentido (se atraviesan desde abajo) ────────────
export interface Platform {
  x0: number;
  x1: number;
  y: number;
}

export const PLATFORMS: Platform[] = [
  { x0: 250, x1: 292, y: -70 },
  { x0: 240, x1: 272, y: -94 },
  { x0: 358, x1: 384, y: -62 },
  { x0: 940, x1: 970, y: -12 },
  { x0: 988, x1: 1012, y: -47 },
  { x0: 1552, x1: 1574, y: -14 },
  { x0: 2112, x1: 2228, y: -36 },
  { x0: 2238, x1: 2254, y: -12 },
  { x0: 2228, x1: 2244, y: -24 },
  { x0: 2508, x1: 2532, y: -26 },
  { x0: 3300, x1: 3500, y: -38 },
  { x0: 3276, x1: 3292, y: -13 },
  { x0: 3288, x1: 3302, y: -26 },
  { x0: 3700, x1: 3728, y: -16 },
  { x0: 3946, x1: 3974, y: -8 },
];

// ── Personajes ───────────────────────────────────────────────────────────
export interface NpcDef {
  id: string;
  characterId: string;
  sprite: string;
  x: number;
  name: string;
  face: 1 | -1;
  group?: { sprite: string; dx: number; face: 1 | -1 }[];
}

export const NPCS: NpcDef[] = [
  { id: 'cunshi', characterId: 'cunshi', sprite: 'cunshi', x: 1060, name: 'Cunshi', face: -1 },
  {
    id: 'comunidad',
    characterId: 'comunidad',
    sprite: 'comunera',
    x: 2640,
    name: 'La comunidad',
    face: -1,
    group: [
      { sprite: 'comunero1', dx: -34, face: 1 },
      { sprite: 'comunero2', dx: 30, face: 1 },
    ],
  },
  { id: 'alfonso', characterId: 'alfonso', sprite: 'alfonso', x: 3236, name: 'Alfonso Pereira', face: -1 },
  { id: 'julio', characterId: 'julio', sprite: 'julio', x: 3552, name: 'Julio Pereira', face: -1 },
  { id: 'cura', characterId: 'cura', sprite: 'cura', x: 4074, name: 'El cura', face: -1 },
];

// ── Lugares con los que se interactúa ([E]) ──────────────────────────────
export type ActivityId = 'novela' | 'personajes' | 'memoria' | 'mentefacto' | 'timeline' | 'mapa' | 'quiz' | 'quiensoy' | 'tabla';

export interface Interactable {
  id: string;
  kind: 'npc' | 'activity' | 'sign' | 'home';
  x: number;
  /** Altura (sobre el suelo) donde se dibuja el aviso. */
  top: number;
  label: string;
  name: string;
  activity?: ActivityId;
  characterId?: string;
  signId?: string;
  range?: number;
}

export const INTERACTABLES: Interactable[] = [
  { id: 'act:timeline', kind: 'activity', x: 140, top: 44, label: 'OBSERVAR', name: 'Mirador del tiempo', activity: 'timeline', range: 18 },
  { id: 'sign:montanas', kind: 'sign', x: 612, top: 22, label: 'LEER', name: 'Las Montañas', signId: 'montanas' },
  { id: 'sign:huasipungos', kind: 'sign', x: 760, top: 22, label: 'LEER', name: 'Los Huasipungos', signId: 'huasipungos' },
  { id: 'home:andres', kind: 'home', x: 1008, top: 30, label: 'ENTRAR', name: 'Tu choza', characterId: 'andres', range: 12 },
  { id: 'npc:cunshi', kind: 'npc', x: 1060, top: 30, label: 'HABLAR', name: 'Cunshi', characterId: 'cunshi' },
  { id: 'act:quiensoy', kind: 'activity', x: 1110, top: 22, label: 'JUGAR', name: 'Junto al fogón', activity: 'quiensoy' },
  { id: 'sign:aprendizaje', kind: 'sign', x: 1330, top: 22, label: 'LEER', name: 'Zona de Aprendizaje', signId: 'aprendizaje' },
  { id: 'act:novela', kind: 'activity', x: 1440, top: 26, label: 'LEER', name: 'El libro de Icaza', activity: 'novela' },
  { id: 'act:mentefacto', kind: 'activity', x: 1610, top: 34, label: 'ESTUDIAR', name: 'La pizarra', activity: 'mentefacto' },
  { id: 'act:quiz', kind: 'activity', x: 1780, top: 28, label: 'RESPONDER', name: 'El gran examen', activity: 'quiz' },
  { id: 'act:tabla', kind: 'activity', x: 1880, top: 34, label: 'VER', name: 'Cuadro de honor', activity: 'tabla' },
  { id: 'sign:casa', kind: 'sign', x: 1985, top: 22, label: 'LEER', name: 'Casa de los Personajes', signId: 'casa' },
  { id: 'act:personajes', kind: 'activity', x: 2170, top: 30, label: 'ENTRAR', name: 'Casa de los personajes', activity: 'personajes', range: 14 },
  { id: 'sign:tierras', kind: 'sign', x: 2432, top: 22, label: 'LEER', name: 'Tierras de cultivo', signId: 'tierras' },
  { id: 'sign:comunidad', kind: 'sign', x: 2590, top: 22, label: 'LEER', name: 'Comunidad indígena', signId: 'comunidad' },
  { id: 'npc:comunidad', kind: 'npc', x: 2640, top: 30, label: 'HABLAR', name: 'La comunidad', characterId: 'comunidad', range: 22 },
  { id: 'act:memoria', kind: 'activity', x: 2940, top: 34, label: 'JUGAR', name: 'El granero de la memoria', activity: 'memoria', range: 14 },
  { id: 'sign:hacienda', kind: 'sign', x: 3094, top: 22, label: 'LEER', name: 'La Hacienda', signId: 'hacienda' },
  { id: 'npc:alfonso', kind: 'npc', x: 3236, top: 30, label: 'HABLAR', name: 'Alfonso Pereira', characterId: 'alfonso' },
  { id: 'act:mapa', kind: 'activity', x: 3362, top: 30, label: 'VER', name: 'Mapa del territorio', activity: 'mapa' },
  { id: 'npc:julio', kind: 'npc', x: 3552, top: 30, label: 'HABLAR', name: 'Julio Pereira', characterId: 'julio' },
  { id: 'sign:camino', kind: 'sign', x: 3622, top: 22, label: 'LEER', name: 'El Camino', signId: 'camino' },
  { id: 'sign:pueblo', kind: 'sign', x: 3832, top: 22, label: 'LEER', name: 'El Pueblo', signId: 'pueblo' },
  { id: 'npc:cura', kind: 'npc', x: 4074, top: 30, label: 'HABLAR', name: 'El cura', characterId: 'cura' },
];

/** Dónde está cada actividad (para misiones y viajes). */
export function activityLocation(id: ActivityId): Interactable | undefined {
  return INTERACTABLES.find(i => i.activity === id);
}

// ── Páginas perdidas de Huasipungo (coleccionables) ──────────────────────
export interface PageDef {
  id: string;
  x: number;
  y: number;
}

export const PAGES: PageDef[] = [
  { id: 'p1', x: 994, y: -64 },
  { id: 'p2', x: 371, y: -76 },
  { id: 'p3', x: 1563, y: -50 },
  { id: 'p4', x: 1690, y: -40 },
  { id: 'p5', x: 2150, y: -50 },
  { id: 'p6', x: 2520, y: -40 },
  { id: 'p7', x: 3374, y: -52 },
  { id: 'p8', x: 3714, y: -32 },
  { id: 'p9', x: 3960, y: -46 },
  { id: 'p10', x: 84, y: -132 },
];

// ── Decorado ─────────────────────────────────────────────────────────────
export type PropType =
  | 'mirador'
  | 'cairn'
  | 'rock'
  | 'boulder'
  | 'ledge'
  | 'sign'
  | 'agave'
  | 'woodpile'
  | 'choza'
  | 'fogon'
  | 'pirca'
  | 'library'
  | 'lectern'
  | 'crates'
  | 'blackboard'
  | 'bench'
  | 'desk'
  | 'honorboard'
  | 'casa'
  | 'haystack'
  | 'scarecrow'
  | 'granero'
  | 'gate'
  | 'corral'
  | 'hacienda'
  | 'stonepile'
  | 'logs'
  | 'wheelbarrow'
  | 'house'
  | 'fountain'
  | 'church'
  | 'cross'
  | 'flowers';

export interface Prop {
  type: PropType;
  x: number;
  w?: number;
  /** Elevación extra sobre el suelo (p. ej. objetos sobre plataformas). */
  lift?: number;
  variant?: number;
  flip?: boolean;
  text?: string;
}

export const PROPS: Prop[] = [
  // Montañas
  { type: 'cairn', x: 200 },
  { type: 'mirador', x: 140 },
  { type: 'ledge', x: 271, w: 42, lift: 70 },
  { type: 'ledge', x: 256, w: 32, lift: 94 },
  { type: 'rock', x: 300, variant: 1 },
  { type: 'boulder', x: 371 },
  { type: 'rock', x: 452, variant: 0 },
  { type: 'rock', x: 530, variant: 2 },
  { type: 'sign', x: 612 },
  { type: 'agave', x: 668 },
  { type: 'flowers', x: 580, w: 40, variant: 2 },
  // Huasipungo
  { type: 'agave', x: 722, variant: 1 },
  { type: 'sign', x: 760 },
  { type: 'woodpile', x: 955 },
  { type: 'choza', x: 1000 },
  { type: 'fogon', x: 1110 },
  { type: 'pirca', x: 1170, w: 60 },
  { type: 'flowers', x: 1240, w: 40, variant: 0 },
  // Aprendizaje
  { type: 'sign', x: 1330 },
  { type: 'library', x: 1492 },
  { type: 'lectern', x: 1440 },
  { type: 'crates', x: 1563 },
  { type: 'blackboard', x: 1610 },
  { type: 'bench', x: 1690 },
  { type: 'desk', x: 1780 },
  { type: 'honorboard', x: 1880 },
  { type: 'flowers', x: 1830, w: 30, variant: 1 },
  // Casa de los personajes
  { type: 'sign', x: 1985 },
  { type: 'casa', x: 2170 },
  { type: 'agave', x: 2350 },
  { type: 'flowers', x: 2050, w: 36, variant: 0 },
  // Cultivos
  { type: 'sign', x: 2432 },
  { type: 'pirca', x: 2471, w: 0 },
  { type: 'pirca', x: 2561, w: 0 },
  { type: 'pirca', x: 2720, w: 0, variant: 1 },
  { type: 'pirca', x: 2820, w: 0, variant: 1 },
  { type: 'haystack', x: 2520 },
  { type: 'sign', x: 2590 },
  { type: 'scarecrow', x: 2764 },
  { type: 'haystack', x: 2800, variant: 1 },
  { type: 'granero', x: 2940 },
  { type: 'agave', x: 3020, variant: 1 },
  // Hacienda
  { type: 'gate', x: 3062, text: 'CUCHITAMBO' },
  { type: 'sign', x: 3094 },
  { type: 'corral', x: 3155, w: 96 },
  { type: 'hacienda', x: 3400 },
  { type: 'bench', x: 3566 },
  { type: 'sign', x: 3622 },
  { type: 'logs', x: 3662 },
  { type: 'stonepile', x: 3714 },
  { type: 'wheelbarrow', x: 3752 },
  // Pueblo
  { type: 'cross', x: 3812 },
  { type: 'sign', x: 3832 },
  { type: 'house', x: 3890, variant: 0, text: 'TIENDA' },
  { type: 'fountain', x: 3960 },
  { type: 'church', x: 4115 },
  { type: 'house', x: 4250, variant: 1 },
  { type: 'house', x: 4318, variant: 2 },
];

// ── Vegetación animada ───────────────────────────────────────────────────
export type TreeKind = 'eucalipto' | 'capuli' | 'polylepis';
export interface TreeDef {
  kind: TreeKind;
  x: number;
  h: number;
  seed: number;
}

export const TREES: TreeDef[] = [
  { kind: 'polylepis', x: 330, h: 34, seed: 11 },
  { kind: 'polylepis', x: 560, h: 30, seed: 12 },
  { kind: 'eucalipto', x: 742, h: 78, seed: 1 },
  { kind: 'capuli', x: 1196, h: 40, seed: 2 },
  { kind: 'eucalipto', x: 1268, h: 70, seed: 3 },
  { kind: 'eucalipto', x: 1366, h: 64, seed: 4 },
  { kind: 'capuli', x: 1706, h: 42, seed: 5 },
  { kind: 'eucalipto', x: 1928, h: 82, seed: 6 },
  { kind: 'capuli', x: 2040, h: 38, seed: 7 },
  { kind: 'eucalipto', x: 2310, h: 76, seed: 8 },
  { kind: 'eucalipto', x: 3212, h: 72, seed: 9 },
  { kind: 'capuli', x: 3588, h: 40, seed: 10 },
  { kind: 'capuli', x: 4010, h: 38, seed: 13 },
];

export interface CropRange {
  kind: 'maize' | 'wheat';
  x0: number;
  x1: number;
}

export const CROPS: CropRange[] = [
  { kind: 'maize', x0: 790, x1: 892 },
  { kind: 'maize', x0: 2478, x1: 2502 },
  { kind: 'wheat', x0: 2538, x1: 2556 },
  { kind: 'wheat', x0: 2566, x1: 2600 },
  { kind: 'maize', x0: 2690, x1: 2716 },
  { kind: 'maize', x0: 2726, x1: 2748 },
  { kind: 'wheat', x0: 2778, x1: 2816 },
  { kind: 'wheat', x0: 2826, x1: 2880 },
];

export interface AnimalDef {
  sprite: 'hen' | 'sheep' | 'cow' | 'pigeon';
  x: number;
  range: [number, number];
  speed: number;
}

export const ANIMALS: AnimalDef[] = [
  { sprite: 'sheep', x: 420, range: [380, 520], speed: 6 },
  { sprite: 'sheep', x: 600, range: [540, 690], speed: 5 },
  { sprite: 'sheep', x: 470, range: [420, 560], speed: 7 },
  { sprite: 'hen', x: 1130, range: [1080, 1190], speed: 10 },
  { sprite: 'hen', x: 920, range: [900, 980], speed: 9 },
  { sprite: 'hen', x: 1160, range: [1120, 1230], speed: 11 },
  { sprite: 'cow', x: 3140, range: [3116, 3186], speed: 4 },
  { sprite: 'cow', x: 3170, range: [3120, 3190], speed: 3 },
  { sprite: 'pigeon', x: 3930, range: [3900, 3945], speed: 8 },
  { sprite: 'pigeon', x: 3995, range: [3980, 4015], speed: 7 },
  { sprite: 'pigeon', x: 3920, range: [3905, 3942], speed: 9 },
];
