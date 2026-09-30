import { useState, useCallback } from 'react';

export type MemoryDifficulty = 'facil' | 'media' | 'dificil';

export interface MemoryStats {
  /** Mejor puntuación por dificultad */
  best: Partial<Record<MemoryDifficulty, number>>;
  /** Victorias por dificultad */
  wins: Partial<Record<MemoryDifficulty, number>>;
  /** Partidas ganadas sin ningún error */
  perfect: number;
}

export interface WhoAmIStats {
  /** Ids de personajes acertados al menos una vez */
  solved: string[];
  correct: number;
  total: number;
  streak: number;
  bestStreak: number;
}

/** Progreso dentro del mapa del videojuego. */
export interface WorldState {
  /** Posición guardada del jugador (null = partida nueva). */
  x: number | null;
  facing: 1 | -1;
  zones: string[];
  pages: string[];
  /** Personajes con los que ya se habló. */
  talked: string[];
  /** Personajes cuya pregunta se respondió bien. */
  answered: string[];
  signs: string[];
  hints: string[];
  introSeen: boolean;
  endingSeen: boolean;
}

export interface Settings {
  sfx: boolean;
  music: boolean;
  touch: 'auto' | 'on' | 'off';
  textSpeed: 'lenta' | 'normal' | 'rapida';
  reducedMotion: boolean;
}

export interface GameState {
  playerName: string;
  xp: number;
  level: number;
  completedSections: string[];
  completedMissions: string[];
  unlockedAchievements: string[];
  quizAnswers: Record<number, string>;
  quizCompleted: boolean;
  sectionProgress: Record<string, number>;
  leaderboard: { name: string; xp: number; level: number }[];
  soundEnabled: boolean;
  viewedCharacters: string[];
  memory: MemoryStats;
  whoAmI: WhoAmIStats;
  world: WorldState;
  settings: Settings;
}

const LEVELS = [
  { level: 1, name: 'Explorador', minXP: 0 },
  { level: 2, name: 'Lector', minXP: 500 },
  { level: 3, name: 'Investigador', minXP: 1200 },
  { level: 4, name: 'Analista', minXP: 2000 },
  { level: 5, name: 'Experto en Huasipungo', minXP: 3000 },
];

export const LEVEL_NAMES = LEVELS.map(l => l.name);

export function getLevelForXP(xp: number) {
  let current = LEVELS[0];
  for (const l of LEVELS) {
    if (xp >= l.minXP) current = l;
  }
  return current;
}

export function getNextLevelXP(xp: number) {
  const levelInfo = getLevelForXP(xp);
  const nextLevel = LEVELS.find(l => l.level === levelInfo.level + 1);
  return nextLevel ? nextLevel.minXP : levelInfo.minXP + 1000;
}

const DEFAULT_LEADERBOARD = [
  { name: 'Andrés', xp: 2450, level: 4 },
  { name: 'Carlos', xp: 2100, level: 4 },
  { name: 'María', xp: 1950, level: 3 },
  { name: 'Juan', xp: 1700, level: 3 },
  { name: 'Sofía', xp: 1450, level: 3 },
];

const INITIAL_STATE: GameState = {
  playerName: '',
  xp: 0,
  level: 1,
  completedSections: [],
  completedMissions: [],
  unlockedAchievements: [],
  quizAnswers: {},
  quizCompleted: false,
  sectionProgress: {},
  leaderboard: DEFAULT_LEADERBOARD,
  soundEnabled: false,
  viewedCharacters: [],
  memory: { best: {}, wins: {}, perfect: 0 },
  whoAmI: { solved: [], correct: 0, total: 0, streak: 0, bestStreak: 0 },
  world: {
    x: null,
    facing: 1,
    zones: [],
    pages: [],
    talked: [],
    answered: [],
    signs: [],
    hints: [],
    introSeen: false,
    endingSeen: false,
  },
  settings: { sfx: true, music: true, touch: 'auto', textSpeed: 'normal', reducedMotion: false },
};

const STORAGE_KEY = 'huasipungo_game';

function loadState(): GameState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const saved = JSON.parse(raw);
      return {
        ...INITIAL_STATE,
        ...saved,
        memory: { ...INITIAL_STATE.memory, ...saved.memory },
        whoAmI: { ...INITIAL_STATE.whoAmI, ...saved.whoAmI },
        world: { ...INITIAL_STATE.world, ...saved.world },
        settings: { ...INITIAL_STATE.settings, ...saved.settings },
      };
    }
  } catch {}
  return INITIAL_STATE;
}

/** Añade un id a una lista sin duplicarlo. */
const addUnique = (list: string[], id: string) => (list.includes(id) ? list : [...list, id]);

function saveState(state: GameState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {}
}

export function useGame() {
  const [state, setState] = useState<GameState>(loadState);

  const update = useCallback((updater: (prev: GameState) => GameState) => {
    setState(prev => {
      const next = updater(prev);
      saveState(next);
      return next;
    });
  }, []);

  const setPlayerName = useCallback((name: string) => {
    update(prev => {
      const newState = { ...prev, playerName: name };
      // Add player to leaderboard if not present
      const hasPlayer = prev.leaderboard.some(e => e.name === name);
      if (!hasPlayer) {
        const levelInfo = getLevelForXP(prev.xp);
        const newLeaderboard = [
          ...prev.leaderboard,
          { name, xp: prev.xp, level: levelInfo.level },
        ].sort((a, b) => b.xp - a.xp);
        newState.leaderboard = newLeaderboard;
      }
      return newState;
    });
  }, [update]);

  /** Cambia el nombre y actualiza su fila en la tabla de posiciones. */
  const renamePlayer = useCallback((name: string) => {
    update(prev => {
      if (!name || name === prev.playerName) return prev;
      const exists = prev.leaderboard.some(e => e.name === prev.playerName);
      const leaderboard = exists
        ? prev.leaderboard.map(e => (e.name === prev.playerName ? { ...e, name } : e))
        : [...prev.leaderboard, { name, xp: prev.xp, level: getLevelForXP(prev.xp).level }].sort((a, b) => b.xp - a.xp);
      return { ...prev, playerName: name, leaderboard };
    });
  }, [update]);

  const addXP = useCallback((amount: number, source?: string) => {
    update(prev => {
      const newXP = prev.xp + amount;
      const levelInfo = getLevelForXP(newXP);
      // Update leaderboard entry
      const leaderboard = prev.leaderboard.map(e =>
        e.name === prev.playerName ? { ...e, xp: newXP, level: levelInfo.level } : e
      ).sort((a, b) => b.xp - a.xp);
      return { ...prev, xp: newXP, level: levelInfo.level, leaderboard };
    });
  }, [update]);

  const completeSection = useCallback((sectionId: string) => {
    update(prev => {
      if (prev.completedSections.includes(sectionId)) return prev;
      const newXP = prev.xp + 200;
      const levelInfo = getLevelForXP(newXP);
      const completedSections = [...prev.completedSections, sectionId];
      const leaderboard = prev.leaderboard.map(e =>
        e.name === prev.playerName ? { ...e, xp: newXP, level: levelInfo.level } : e
      ).sort((a, b) => b.xp - a.xp);
      return { ...prev, xp: newXP, level: levelInfo.level, completedSections, leaderboard };
    });
  }, [update]);

  const completeMission = useCallback((missionId: string, xpReward: number) => {
    update(prev => {
      if (prev.completedMissions.includes(missionId)) return prev;
      const newXP = prev.xp + xpReward;
      const levelInfo = getLevelForXP(newXP);
      const completedMissions = [...prev.completedMissions, missionId];
      const leaderboard = prev.leaderboard.map(e =>
        e.name === prev.playerName ? { ...e, xp: newXP, level: levelInfo.level } : e
      ).sort((a, b) => b.xp - a.xp);
      return { ...prev, xp: newXP, level: levelInfo.level, completedMissions, leaderboard };
    });
  }, [update]);

  const unlockAchievement = useCallback((achievementId: string) => {
    update(prev => {
      if (prev.unlockedAchievements.includes(achievementId)) return prev;
      return { ...prev, unlockedAchievements: [...prev.unlockedAchievements, achievementId] };
    });
  }, [update]);

  const submitQuizAnswer = useCallback((questionId: number, answer: string) => {
    update(prev => ({ ...prev, quizAnswers: { ...prev.quizAnswers, [questionId]: answer } }));
  }, [update]);

  const completeQuiz = useCallback((score: number, total: number) => {
    update(prev => {
      if (prev.quizCompleted) return prev;
      const xpGain = 500 + (score === total ? 300 : 0);
      const newXP = prev.xp + xpGain;
      const levelInfo = getLevelForXP(newXP);
      const leaderboard = prev.leaderboard.map(e =>
        e.name === prev.playerName ? { ...e, xp: newXP, level: levelInfo.level } : e
      ).sort((a, b) => b.xp - a.xp);
      return { ...prev, xp: newXP, level: levelInfo.level, quizCompleted: true, leaderboard };
    });
  }, [update]);

  const setSectionProgress = useCallback((sectionId: string, progress: number) => {
    update(prev => ({ ...prev, sectionProgress: { ...prev.sectionProgress, [sectionId]: progress } }));
  }, [update]);

  const viewCharacter = useCallback((id: string) => {
    update(prev => prev.viewedCharacters.includes(id)
      ? prev
      : { ...prev, viewedCharacters: [...prev.viewedCharacters, id] });
  }, [update]);

  const recordMemoryWin = useCallback((difficulty: MemoryDifficulty, score: number, perfect: boolean) => {
    update(prev => ({
      ...prev,
      memory: {
        best: { ...prev.memory.best, [difficulty]: Math.max(prev.memory.best[difficulty] ?? 0, score) },
        wins: { ...prev.memory.wins, [difficulty]: (prev.memory.wins[difficulty] ?? 0) + 1 },
        perfect: prev.memory.perfect + (perfect ? 1 : 0),
      },
    }));
  }, [update]);

  const recordWhoAmI = useCallback((characterId: string, correct: boolean) => {
    update(prev => {
      const w = prev.whoAmI;
      const streak = correct ? w.streak + 1 : 0;
      return {
        ...prev,
        whoAmI: {
          solved: correct && !w.solved.includes(characterId) ? [...w.solved, characterId] : w.solved,
          correct: w.correct + (correct ? 1 : 0),
          total: w.total + 1,
          streak,
          bestStreak: Math.max(w.bestStreak, streak),
        },
      };
    });
  }, [update]);

  const toggleSound = useCallback(() => {
    update(prev => ({ ...prev, soundEnabled: !prev.soundEnabled }));
  }, [update]);

  // ── Mundo del videojuego ────────────────────────────────────────────────
  const updateWorld = useCallback((fn: (w: WorldState) => WorldState) => {
    update(prev => {
      const world = fn(prev.world);
      return world === prev.world ? prev : { ...prev, world };
    });
  }, [update]);

  const setWorldPos = useCallback((x: number, facing: 1 | -1) => {
    updateWorld(w => (w.x === x && w.facing === facing ? w : { ...w, x, facing }));
  }, [updateWorld]);

  const visitZone = useCallback((id: string) => updateWorld(w => (w.zones.includes(id) ? w : { ...w, zones: [...w.zones, id] })), [updateWorld]);
  const collectPage = useCallback((id: string) => updateWorld(w => (w.pages.includes(id) ? w : { ...w, pages: [...w.pages, id] })), [updateWorld]);
  const markTalked = useCallback((id: string) => updateWorld(w => (w.talked.includes(id) ? w : { ...w, talked: addUnique(w.talked, id) })), [updateWorld]);
  const markAnswered = useCallback((id: string) => updateWorld(w => (w.answered.includes(id) ? w : { ...w, answered: addUnique(w.answered, id) })), [updateWorld]);
  const markSign = useCallback((id: string) => updateWorld(w => (w.signs.includes(id) ? w : { ...w, signs: addUnique(w.signs, id) })), [updateWorld]);
  const markHint = useCallback((id: string) => updateWorld(w => (w.hints.includes(id) ? w : { ...w, hints: addUnique(w.hints, id) })), [updateWorld]);
  const setIntroSeen = useCallback(() => updateWorld(w => (w.introSeen ? w : { ...w, introSeen: true })), [updateWorld]);
  const setEndingSeen = useCallback(() => updateWorld(w => (w.endingSeen ? w : { ...w, endingSeen: true })), [updateWorld]);

  const updateSettings = useCallback((patch: Partial<Settings>) => {
    update(prev => ({ ...prev, settings: { ...prev.settings, ...patch } }));
  }, [update]);

  const resetGame = useCallback(() => {
    // Se conserva la configuración (sonido, controles...) al reiniciar el progreso.
    setState(prev => {
      const fresh = { ...INITIAL_STATE, leaderboard: DEFAULT_LEADERBOARD, settings: prev.settings };
      saveState(fresh);
      return fresh;
    });
  }, []);

  return {
    state,
    setPlayerName,
    renamePlayer,
    addXP,
    completeSection,
    completeMission,
    unlockAchievement,
    submitQuizAnswer,
    completeQuiz,
    setSectionProgress,
    viewCharacter,
    recordMemoryWin,
    recordWhoAmI,
    toggleSound,
    resetGame,
    getLevelForXP,
    getNextLevelXP,
    setWorldPos,
    visitZone,
    collectPage,
    markTalked,
    markAnswered,
    markSign,
    markHint,
    setIntroSeen,
    setEndingSeen,
    updateSettings,
  };
}
