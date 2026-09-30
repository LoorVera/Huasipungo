import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useGame, getLevelForXP, type MemoryDifficulty } from './hooks/useGame';
import { QUIZ_QUESTIONS, LOGROS, MISIONES, TOTAL_PAGINAS, type LogroExtra } from './data/content';
import { ACTIVIDADES, CARTELES, GUIONES, HABLANTES, INTRO, PAGINAS, finalLines, type DialogLine, type Pregunta } from './data/dialogos';
import { Game, type GameEvents } from './game/Game';
import { audio } from './game/audio';
import { PAGES, ZONES, activityLocation, type ActivityId, type Interactable, type ZoneId } from './game/world';
import Novela from './sections/Novela';
import Personajes from './sections/Personajes';
import Memoria from './sections/Memoria';
import Mentefacto from './sections/Mentefacto';
import Timeline from './sections/Timeline';
import Mapa from './sections/Mapa';
import Quiz from './sections/Quiz';
import Misiones from './sections/Misiones';
import Logros from './sections/Logros';
import Tabla from './sections/Tabla';
import Perfil from './sections/Perfil';
import QuienSoy from './components/QuienSoy';
import TitleScreen, { type MenuPanel } from './components/game/TitleScreen';
import HUD, { type HudHandle } from './components/game/HUD';
import DialogBox from './components/game/DialogBox';
import TouchControls from './components/game/TouchControls';
import GameWindow from './components/game/GameWindow';
import PauseMenu, { type PauseAction } from './components/game/PauseMenu';
import Celebrations, { type Celebration, type Toast } from './components/game/Celebrations';
import SettingsPanel from './components/game/SettingsPanel';
import WorldMap from './components/game/WorldMap';
import Journal from './components/game/Journal';

/** Punto de partida: junto a la choza de Andrés. */
const START_X = 1030;
const SECTION_IDS = ['novela', 'personajes', 'mentefacto', 'timeline', 'mapa', 'quiz'] as const;

type Panel = 'misiones' | 'personajes' | 'logros' | 'config' | 'mapa';
type Win = { kind: 'activity'; id: ActivityId } | { kind: 'panel'; id: Panel; from: 'title' | 'pause' | 'game' };

interface DialogState {
  key: number;
  lines: DialogLine[];
  question: Pregunta | null;
  asker?: string;
  npc: string | null;
  onAnswer?: (ok: boolean) => void;
  onDone?: (completed: boolean) => void;
}

type Hint = 'move' | 'talk' | 'jump' | null;

const PANEL_META: Record<Panel, { title: string; icon: string; subtitle?: string }> = {
  mapa: { title: 'Mapa del mundo', icon: '🗺️', subtitle: 'Zonas descubiertas y viaje rápido' },
  misiones: { title: 'Misiones', icon: '⚔️', subtitle: 'Completa las actividades del mapa' },
  personajes: { title: 'Personajes', icon: '👥', subtitle: 'Fichas de la novela' },
  logros: { title: 'Logros y progreso', icon: '🏆' },
  config: { title: 'Configuración', icon: '⚙️' },
};

export default function App() {
  const g = useGame();
  const { state } = g;
  const stateRef = useRef(state);
  stateRef.current = state;

  const [screen, setScreen] = useState<'title' | 'game'>('title');
  const [win, setWin] = useState<Win | null>(null);
  const [paused, setPaused] = useState(false);
  const [dialog, setDialog] = useState<DialogState | null>(null);
  const [zone, setZone] = useState<ZoneId | null>(null);
  const [banner, setBanner] = useState<{ id: ZoneId; key: number; discovered: boolean } | null>(null);
  const [pagePopup, setPagePopup] = useState<{ id: string; key: number } | null>(null);
  const [nearby, setNearby] = useState<Interactable | null>(null);
  const [hint, setHint] = useState<Hint>(null);
  const [fade, setFade] = useState(0);
  const [logrosTab, setLogrosTab] = useState('logros');
  const [running, setRunning] = useState(false);
  const [ready, setReady] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameRef = useRef<Game | null>(null);
  const hudRef = useRef<HudHandle>(null);
  const idRef = useRef(0);
  const nextId = () => ++idRef.current;
  /** Evita celebrar dos veces lo mismo (efectos dobles, temporizadores...). */
  const onceRef = useRef(new Set<string>(state.unlockedAchievements.map(a => `ach:${a}`)));
  const once = (key: string) => {
    if (onceRef.current.has(key)) return false;
    onceRef.current.add(key);
    return true;
  };

  // ── Celebraciones y avisos de XP ────────────────────────────────────────
  const [queue, setQueue] = useState<Celebration[]>([]);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const celebrate = useCallback((c: Omit<Celebration, 'id'>) => setQueue(q => [...q, { ...c, id: ++idRef.current }]), []);
  const toast = useCallback((text: string, detail?: string) => {
    const id = ++idRef.current;
    setToasts(t => [...t.slice(-3), { id, text, detail }]);
    window.setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 1900);
  }, []);
  const current = queue[0] ?? null;
  useEffect(() => {
    if (!current) return;
    audio.play(current.kind === 'level' ? 'level' : current.kind === 'achievement' ? 'achievement' : 'mission');
    if (current.kind !== 'achievement') gameRef.current?.celebrate();
    const t = window.setTimeout(() => setQueue(q => q.slice(1)), current.kind === 'achievement' ? 3400 : 2800);
    return () => clearTimeout(t);
  }, [current]);

  const { addXP } = g;
  const gainXP = useCallback(
    (amount: number, detail: string) => {
      addXP(amount);
      toast(`+${amount} XP`, detail);
      gameRef.current?.floatText(`+${amount} XP`);
      audio.play('xp');
    },
    [addXP, toast],
  );

  // ── Controles táctiles ──────────────────────────────────────────────────
  const autoTouch = useMemo(
    () => typeof window !== 'undefined' && (window.matchMedia?.('(pointer: coarse)').matches || 'ontouchstart' in window),
    [],
  );
  const touch = state.settings.touch === 'on' || (state.settings.touch === 'auto' && autoTouch);

  // ── Motor del juego ─────────────────────────────────────────────────────
  const eventsRef = useRef<GameEvents>({});
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const game = new Game(canvas, eventsRef);
    gameRef.current = game;
    game.start();
    // Solo en desarrollo: acceso al motor desde la consola para depurar.
    if (import.meta.env.DEV) (window as unknown as { __huasipungo?: Game }).__huasipungo = game;
    return () => {
      game.destroy();
      gameRef.current = null;
    };
  }, []);

  const overlayOpen = !!win || paused;
  useEffect(() => {
    const game = gameRef.current;
    if (!game) return;
    if (screen === 'title') {
      game.setMode('attract');
      game.setPaused(false);
      game.setInputEnabled(false);
      return;
    }
    game.setMode('play');
    game.setPaused(overlayOpen);
    game.setInputEnabled(!overlayOpen && !dialog);
    game.setTalking(dialog?.npc ?? null);
  }, [screen, overlayOpen, dialog, ready]);

  useEffect(() => {
    audio.setSfx(state.settings.sfx);
  }, [state.settings.sfx]);
  useEffect(() => {
    audio.setMusic(state.settings.music);
  }, [state.settings.music]);
  useEffect(() => {
    gameRef.current?.setTouchMode(touch);
  }, [touch, ready]);
  useEffect(() => {
    gameRef.current?.setReducedMotion(state.settings.reducedMotion);
  }, [state.settings.reducedMotion, ready]);
  useEffect(() => {
    if (gameRef.current) gameRef.current.input.runToggle = running;
  }, [running, ready]);

  // Actividades ya completadas (sin destellos en el mapa)
  const memoryWins = (state.memory.wins.facil ?? 0) + (state.memory.wins.media ?? 0) + (state.memory.wins.dificil ?? 0);
  const done = useMemo(() => {
    const d: string[] = [...state.completedSections, 'tabla'];
    if (memoryWins > 0) d.push('memoria');
    if (state.whoAmI.solved.length > 0) d.push('quiensoy');
    return d;
  }, [state.completedSections, memoryWins, state.whoAmI.solved.length]);

  useEffect(() => {
    gameRef.current?.setProgress({ pages: state.world.pages, talked: state.world.talked, answered: state.world.answered, done });
  }, [state.world.pages, state.world.talked, state.world.answered, done, ready]);

  // Misión actual y objetivo en el mapa
  const nextMission = MISIONES.find(m => !state.completedMissions.includes(m.id)) ?? null;
  const objective = useMemo(
    () => (nextMission ? activityLocation(nextMission.seccionRequerida as ActivityId) ?? null : null),
    [nextMission],
  );
  useEffect(() => {
    gameRef.current?.setObjective(objective);
  }, [objective, ready]);
  const hudMission = nextMission && objective
    ? { numero: nextMission.numero, titulo: nextMission.titulo, instruccion: nextMission.instruccion, x: objective.x }
    : null;

  // ── Guardado de la posición ─────────────────────────────────────────────
  const { setWorldPos } = g;
  const saveNow = useCallback(() => {
    const game = gameRef.current;
    if (!game || screen !== 'game') return;
    setWorldPos(Math.round(game.getPlayerX()), game.getFacing());
  }, [screen, setWorldPos]);
  useEffect(() => {
    const onHide = () => {
      if (document.visibilityState === 'hidden') saveNow();
    };
    document.addEventListener('visibilitychange', onHide);
    window.addEventListener('pagehide', saveNow);
    return () => {
      document.removeEventListener('visibilitychange', onHide);
      window.removeEventListener('pagehide', saveNow);
    };
  }, [saveNow]);

  // ── Diálogos ────────────────────────────────────────────────────────────
  const openCharacter = (cid: string, npcId: string | null) => {
    const s = stateRef.current;
    const guion = GUIONES[cid];
    if (!guion) return;
    const first = !s.world.talked.includes(cid);
    const lines = first ? guion.primera : guion.otras[Math.floor(Math.random() * guion.otras.length)];
    const pending = !s.world.answered.includes(cid);
    const nombre = cid === 'andres' ? 'Andrés' : cid === 'comunidad' ? 'la comunidad' : HABLANTES[cid]?.nombre ?? cid;
    audio.play('open');
    setDialog({
      key: nextId(),
      lines,
      question: pending ? guion.pregunta : null,
      asker: cid === 'comunidad' ? 'comunero' : cid,
      npc: npcId,
      onAnswer: ok => {
        if (ok && !stateRef.current.world.answered.includes(cid)) {
          g.markAnswered(cid);
          gainXP(50, '¡Respuesta correcta!');
        }
      },
      onDone: completed => {
        if (completed && first) {
          g.markTalked(cid);
          gainXP(20, `Conociste a ${nombre}`);
        }
      },
    });
  };

  const openSign = (signId: string) => {
    const c = CARTELES[signId];
    if (!c) return;
    const first = !stateRef.current.world.signs.includes(signId);
    audio.play('open');
    setDialog({
      key: nextId(),
      lines: c.lineas.map(text => ({ who: 'cartel', name: `Cartel · ${c.titulo}`, text })),
      question: null,
      npc: null,
      onDone: completed => {
        if (completed && first) {
          g.markSign(signId);
          gainXP(10, 'Cartel leído');
        }
      },
    });
  };

  const showIntro = () => {
    const controls: DialogLine = touch
      ? { who: 'narrador', text: 'Usa los botones de la pantalla: ◀ ▶ para caminar, ▲ para saltar, CORRER para ir más rápido y E para interactuar.' }
      : { who: 'narrador', text: 'Usa A / D para moverte, W o ESPACIO para saltar, SHIFT para correr y E para interactuar. ESC abre el menú.' };
    setDialog({
      key: nextId(),
      lines: [...INTRO, controls],
      question: null,
      npc: null,
      onDone: () => {
        g.setIntroSeen();
        setHint('move');
      },
    });
  };

  const closeDialog = (completed: boolean) => {
    const d = dialog;
    setDialog(null);
    d?.onDone?.(completed);
  };

  // ── Eventos del juego ───────────────────────────────────────────────────
  const handleInteract = (t: Interactable) => {
    if (t.kind === 'npc' || t.kind === 'home') {
      const npcId = t.kind === 'npc' ? t.id.replace('npc:', '') : null;
      openCharacter(t.characterId!, npcId);
      if (hint === 'talk') setHint('jump');
    } else if (t.kind === 'sign') {
      openSign(t.signId!);
    } else if (t.activity) {
      audio.play(t.activity === 'personajes' || t.activity === 'memoria' ? 'door' : 'open');
      setWin({ kind: 'activity', id: t.activity });
    }
  };

  const handleZone = (id: ZoneId) => {
    setZone(id);
    const discovered = !stateRef.current.world.zones.includes(id);
    setBanner({ id, key: nextId(), discovered });
    audio.play('zone');
    if (discovered && stateRef.current.playerName) {
      g.visitZone(id);
      gainXP(25, 'Zona descubierta');
    }
  };

  const handlePage = (id: string) => {
    if (stateRef.current.world.pages.includes(id)) return;
    g.collectPage(id);
    gainXP(10, 'Página encontrada');
    setPagePopup({ id, key: nextId() });
  };

  eventsRef.current = {
    interact: handleInteract,
    zone: handleZone,
    page: handlePage,
    nearby: setNearby,
    pause: () => {
      audio.play('open');
      saveNow();
      setPaused(true);
    },
    save: (x, f) => setWorldPos(x, f),
    moved: () => setHint(h => (h === 'move' ? 'talk' : h)),
    frame: x => hudRef.current?.update(x),
    ready: () => setReady(true),
  };

  // Ocultar avisos temporales
  useEffect(() => {
    if (!banner) return;
    const t = window.setTimeout(() => setBanner(null), 3500);
    return () => clearTimeout(t);
  }, [banner]);
  useEffect(() => {
    if (!pagePopup) return;
    const t = window.setTimeout(() => setPagePopup(null), 7000);
    return () => clearTimeout(t);
  }, [pagePopup]);
  useEffect(() => {
    if (hint !== 'jump') return;
    const t = window.setTimeout(() => setHint(null), 7000);
    return () => clearTimeout(t);
  }, [hint]);
  useEffect(() => {
    if (hint === 'talk' && state.world.talked.length > 0) setHint('jump');
  }, [hint, state.world.talked.length]);

  // ── Inicio de partida y navegación ──────────────────────────────────────
  const startGame = (isNew: boolean) => {
    audio.unlock();
    audio.wantMusic(true);
    const s = stateRef.current;
    const x = isNew || s.world.x == null ? START_X : s.world.x;
    setWin(null);
    setPaused(false);
    setScreen('game');
    setFade(f => f + 1);
    gameRef.current?.setMode('play');
    gameRef.current?.teleport(x, isNew ? 1 : s.world.facing);
    if (isNew || !s.world.introSeen) window.setTimeout(showIntro, 650);
  };

  const handleNewGame = (name: string) => {
    if (stateRef.current.playerName) {
      g.resetGame();
      onceRef.current.clear();
      setQueue([]);
    }
    g.setPlayerName(name);
    startGame(true);
  };

  const travel = (x: number) => {
    setFade(f => f + 1);
    setWin(null);
    setPaused(false);
    window.setTimeout(() => {
      gameRef.current?.teleport(x, 1);
      setWorldPos(Math.round(x), 1);
    }, 280);
  };

  const travelToSection = (section: string) => {
    const loc = activityLocation(section as ActivityId);
    if (!loc) return;
    if (screen === 'game') travel(loc.x - 22);
    else if (stateRef.current.playerName) {
      startGame(false);
      window.setTimeout(() => gameRef.current?.teleport(loc.x - 22, 1), 300);
    } else setWin(null);
  };

  const onPauseAction = (a: PauseAction) => {
    if (a === 'resume') setPaused(false);
    else if (a === 'title') {
      saveNow();
      setPaused(false);
      setWin(null);
      setDialog(null);
      setHint(null);
      setScreen('title');
    } else setWin({ kind: 'panel', id: a, from: 'pause' });
  };

  const closeWin = useCallback(() => setWin(null), []);

  const handleReset = () => {
    g.resetGame();
    onceRef.current.clear();
    setQueue([]);
    setWin(null);
    setPaused(false);
    setDialog(null);
    setHint(null);
    setScreen('title');
  };

  // ── Progreso: secciones, misiones, logros, niveles ──────────────────────
  const completeSectionRef = useRef<(id: string) => void>(() => {});
  completeSectionRef.current = (id: string) => {
    if (stateRef.current.completedSections.includes(id) || !once(`sec:${id}`)) return;
    g.completeSection(id);
    celebrate({ kind: 'activity', kicker: ACTIVIDADES[id]?.titulo ?? 'Actividad', title: '¡ACTIVIDAD COMPLETADA!', xp: 200 });
  };
  const onSection = useMemo(
    () => Object.fromEntries(SECTION_IDS.map(id => [id, () => completeSectionRef.current(id)])) as Record<(typeof SECTION_IDS)[number], () => void>,
    [],
  );

  // El quiz terminado también cuenta como sección completada (misión 6).
  useEffect(() => {
    if (state.playerName && state.quizCompleted && !state.completedSections.includes('quiz')) completeSectionRef.current('quiz');
  }, [state.playerName, state.quizCompleted, state.completedSections]);

  const { completeMission } = g;
  const handleCompleteMission = useCallback(
    (id: string, xp: number) => {
      if (stateRef.current.completedMissions.includes(id)) return;
      completeMission(id, xp);
      const m = MISIONES.find(x => x.id === id);
      if (m && onceRef.current.has(`mis:${id}`) === false) {
        onceRef.current.add(`mis:${id}`);
        celebrate({ kind: 'mission', kicker: `Misión ${m.numero}`, title: '¡MISIÓN COMPLETADA!', sub: m.titulo, xp });
      }
    },
    [completeMission, celebrate],
  );

  // Las misiones se completan solas al terminar su actividad (en orden).
  useEffect(() => {
    if (!state.playerName) return;
    for (const m of MISIONES) {
      if (state.completedMissions.includes(m.id)) continue;
      const unlocked = !m.requiere || state.completedMissions.includes(m.requiere);
      if (unlocked && state.completedSections.includes(m.seccionRequerida)) handleCompleteMission(m.id, m.xpRecompensa);
      break;
    }
  }, [state.playerName, state.completedSections, state.completedMissions, handleCompleteMission]);

  const logroExtra: LogroExtra = useMemo(
    () => ({
      memoryWins,
      memoryHardWins: state.memory.wins.dificil ?? 0,
      memoryPerfect: state.memory.perfect,
      whoAmISolved: state.whoAmI.solved.length,
      whoAmIBestStreak: state.whoAmI.bestStreak,
      charactersViewed: state.viewedCharacters.length,
      zonesVisited: state.world.zones.length,
      charactersTalked: state.world.talked.length,
      pagesCollected: state.world.pages.length,
      questionsAnswered: state.world.answered.length,
    }),
    [memoryWins, state.memory, state.whoAmI, state.viewedCharacters, state.world],
  );
  const quizScore = QUIZ_QUESTIONS.filter(q => state.quizAnswers[q.id] === q.correcta).length;

  const { unlockAchievement } = g;
  useEffect(() => {
    if (!state.playerName) return;
    LOGROS.forEach(logro => {
      if (state.unlockedAchievements.includes(logro.id)) return;
      const earned = logro.condicion(state.completedSections, state.quizCompleted, quizScore, QUIZ_QUESTIONS.length, state.completedMissions, logroExtra);
      if (!earned) return;
      unlockAchievement(logro.id);
      if (once(`ach:${logro.id}`)) celebrate({ kind: 'achievement', kicker: 'Logro desbloqueado', title: logro.titulo, sub: logro.descripcion, emoji: logro.emoji });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.playerName, state.completedSections, state.completedMissions, state.quizCompleted, state.unlockedAchievements, quizScore, logroExtra, unlockAchievement, celebrate]);

  const prevLevel = useRef(state.level);
  useEffect(() => {
    if (state.level > prevLevel.current && state.playerName) {
      celebrate({ kind: 'level', kicker: `Nivel ${state.level}`, title: '¡SUBISTE DE NIVEL!', sub: getLevelForXP(state.xp).name });
    }
    prevLevel.current = state.level;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.level]);

  // Final del recorrido: todas las misiones completadas
  const allMissionsDone = MISIONES.every(m => state.completedMissions.includes(m.id));
  useEffect(() => {
    if (screen !== 'game' || dialog || win || paused || state.world.endingSeen || !allMissionsDone) return;
    const t = window.setTimeout(() => {
      setDialog({
        key: nextId(),
        lines: finalLines(stateRef.current.playerName),
        question: null,
        npc: null,
        onDone: () => {
          g.setEndingSeen();
          celebrate({ kind: 'final', kicker: 'Fin del recorrido', title: '¡MAESTRO DE HUASIPUNGO!', sub: 'Completaste todas las misiones', emoji: '🏆' });
        },
      });
    }, 3400);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [screen, dialog, win, paused, state.world.endingSeen, allMissionsDone]);

  // ── Manejadores de las actividades existentes ───────────────────────────
  const handleViewCharacter = (id: string) => {
    if (stateRef.current.viewedCharacters.includes(id)) return;
    g.viewCharacter(id);
    gainXP(15, 'Personaje descubierto');
  };
  const handleWhoAnswer = (characterId: string, correct: boolean, xp: number) => {
    g.recordWhoAmI(characterId, correct);
    if (xp > 0) gainXP(xp, '¿Quién soy?');
  };
  const handleMemoryWin = (difficulty: MemoryDifficulty, score: number, perfect: boolean, xp: number) => {
    const first = !stateRef.current.memory.wins[difficulty];
    g.recordMemoryWin(difficulty, score, perfect);
    g.addXP(xp);
    if (first) celebrate({ kind: 'activity', kicker: 'El granero de la memoria', title: '¡ACTIVIDAD COMPLETADA!', xp });
    else toast(`+${xp} XP`, 'Memoria ganada');
  };
  const handleQuizXP = (amount: number) => gainXP(amount, 'Respuesta correcta');
  const handleQuizComplete = (score: number, total: number) => {
    if (stateRef.current.quizCompleted) return;
    g.completeQuiz(score, total);
    const bonus = 500 + (score === total ? 300 : 0);
    toast(`+${bonus} XP`, 'Gran examen terminado');
    completeSectionRef.current('quiz');
  };

  // ── Contenido de las ventanas ───────────────────────────────────────────
  const renderActivity = (id: ActivityId) => {
    switch (id) {
      case 'novela':
        return <Novela onComplete={onSection.novela} completed={state.completedSections.includes('novela')} />;
      case 'personajes':
        return (
          <Personajes
            viewedCharacters={state.viewedCharacters}
            onView={handleViewCharacter}
            whoAmI={state.whoAmI}
            onWhoAnswer={handleWhoAnswer}
            onComplete={onSection.personajes}
            completed={state.completedSections.includes('personajes')}
          />
        );
      case 'memoria':
        return <Memoria stats={state.memory} onWin={handleMemoryWin} />;
      case 'mentefacto':
        return <Mentefacto onComplete={onSection.mentefacto} completed={state.completedSections.includes('mentefacto')} />;
      case 'timeline':
        return <Timeline onComplete={onSection.timeline} completed={state.completedSections.includes('timeline')} />;
      case 'mapa':
        return <Mapa onComplete={onSection.mapa} completed={state.completedSections.includes('mapa')} />;
      case 'quiz':
        return (
          <Quiz
            onComplete={handleQuizComplete}
            onAddXP={handleQuizXP}
            quizCompleted={state.quizCompleted}
            quizAnswers={state.quizAnswers}
            onSubmitAnswer={g.submitQuizAnswer}
          />
        );
      case 'quiensoy':
        return (
          <div className="max-w-2xl mx-auto px-4 py-8">
            <p className="font-body text-sm mb-4 text-center" style={{ color: '#d4b896' }}>
              Junto al fogón, la comunidad adivina personajes con pistas. Cuantas menos pistas uses, más XP ganas.
            </p>
            <QuienSoy whoAmI={state.whoAmI} onAnswer={handleWhoAnswer} />
          </div>
        );
      case 'tabla':
        return <Tabla leaderboard={state.leaderboard} playerName={state.playerName} />;
    }
  };

  const renderPanel = (id: Panel) => {
    switch (id) {
      case 'mapa':
        return (
          <WorldMap current={zone} visited={state.world.zones} done={done} talked={state.world.talked} pages={state.world.pages} onTravel={travel} />
        );
      case 'misiones':
        return (
          <Misiones
            completedSections={state.completedSections}
            completedMissions={state.completedMissions}
            onCompleteMission={handleCompleteMission}
            onNav={travelToSection}
          />
        );
      case 'personajes':
        return renderActivity('personajes');
      case 'config':
        return (
          <SettingsPanel
            settings={state.settings}
            onChange={g.updateSettings}
            playerName={state.playerName}
            hasSave={!!state.playerName}
            onRename={g.renamePlayer}
            onReset={handleReset}
          />
        );
      case 'logros':
        if (logrosTab === 'tabla') return <Tabla leaderboard={state.leaderboard} playerName={state.playerName} />;
        if (logrosTab === 'paginas') return <Journal pages={state.world.pages} />;
        if (logrosTab === 'perfil')
          return (
            <Perfil
              playerName={state.playerName || 'Sin nombre'}
              xp={state.xp}
              completedSections={state.completedSections}
              completedMissions={state.completedMissions}
              unlockedAchievements={state.unlockedAchievements}
              quizAnswers={state.quizAnswers}
              quizCompleted={state.quizCompleted}
              memory={state.memory}
              whoAmI={state.whoAmI}
              charactersViewed={state.viewedCharacters.length}
              onChangeName={g.renamePlayer}
              onReset={handleReset}
              adventure={{
                zones: state.world.zones.length,
                pages: state.world.pages.length,
                talked: state.world.talked.length,
                answered: state.world.answered.length,
              }}
            />
          );
        return (
          <Logros
            unlockedAchievements={state.unlockedAchievements}
            completedSections={state.completedSections}
            completedMissions={state.completedMissions}
            quizCompleted={state.quizCompleted}
            quizScore={quizScore}
            quizTotal={QUIZ_QUESTIONS.length}
            extra={logroExtra}
            onUnlock={id => {
              if (!stateRef.current.unlockedAchievements.includes(id)) unlockAchievement(id);
            }}
          />
        );
    }
  };

  const openPanelFromTitle = (p: MenuPanel) => {
    if (p === 'logros') setLogrosTab('logros');
    setWin({ kind: 'panel', id: p, from: 'title' });
  };

  const bannerZone = banner ? ZONES.find(z => z.id === banner.id) : null;
  const pageIndex = pagePopup ? PAGES.findIndex(p => p.id === pagePopup.id) + 1 : 0;
  const hintText =
    hint === 'move'
      ? touch
        ? 'Usa ◀ ▶ para caminar'
        : 'Muévete con A / D'
      : hint === 'talk'
        ? touch
          ? 'Acércate a Cunshi y toca E para hablar'
          : 'Acércate a Cunshi y pulsa E para hablar'
        : hint === 'jump'
          ? touch
            ? 'Salta con ▲ y activa CORRER para ir más rápido'
            : 'Salta con W / ESPACIO y mantén SHIFT para correr'
          : null;

  const winTitle =
    win?.kind === 'activity'
      ? { title: ACTIVIDADES[win.id].titulo, icon: ACTIVIDADES[win.id].icono, subtitle: ACTIVIDADES[win.id].lugar }
      : win
        ? PANEL_META[win.id]
        : null;

  return (
    <div className="game-root">
      <canvas ref={canvasRef} className="game-canvas" role="img" aria-label="Mundo de Huasipungo: Andes ecuatorianos en pixel art" />

      {!ready && (
        <div className="fixed inset-0 z-[95] flex items-center justify-center" style={{ background: '#0c0904' }}>
          <p className="font-pixel text-lg tracking-widest animate-px-blink" style={{ color: '#e8c84a' }}>CARGANDO LOS ANDES…</p>
        </div>
      )}

      {screen === 'title' && (
        <TitleScreen
          active={!win}
          hasSave={!!state.playerName}
          saveXP={state.xp}
          savedName={state.playerName}
          touch={touch}
          onNewGame={handleNewGame}
          onContinue={() => startGame(false)}
          onOpen={openPanelFromTitle}
        />
      )}

      {screen === 'game' && (
        <>
          <HUD
            ref={hudRef}
            playerName={state.playerName}
            xp={state.xp}
            zone={zone}
            visited={state.world.zones}
            pages={state.world.pages.length}
            pagesTotal={TOTAL_PAGINAS}
            mission={hudMission}
            allMissionsDone={allMissionsDone}
            onMenu={() => {
              audio.play('open');
              saveNow();
              setPaused(true);
            }}
            onJournal={() => {
              audio.play('open');
              setLogrosTab('paginas');
              setWin({ kind: 'panel', id: 'logros', from: 'game' });
            }}
          />

          {touch && !overlayOpen && !dialog && (
            <TouchControls input={gameRef.current?.input ?? null} interactLabel={nearby?.label ?? null} running={running} onToggleRun={() => setRunning(r => !r)} />
          )}

          {banner && bannerZone && (
            <div key={banner.key} className="pointer-events-none fixed inset-x-0 top-[20%] z-[35] flex justify-center animate-px-slide" role="status">
              <div className="text-center px-10 py-3" style={{ background: 'linear-gradient(90deg, transparent, rgba(12,9,4,0.78) 18%, rgba(12,9,4,0.78) 82%, transparent)' }}>
                {banner.discovered && (
                  <p className="font-pixel text-xs tracking-[0.4em]" style={{ color: '#e8c84a' }}>✦ ZONA DESCUBIERTA ✦</p>
                )}
                <p className="px-title text-3xl sm:text-5xl">{bannerZone.name.toUpperCase()}</p>
                <p className="font-pixel text-sm sm:text-base mt-1" style={{ color: '#e8d5b0' }}>{bannerZone.subtitle}</p>
              </div>
            </div>
          )}

          {pagePopup && (
            <div key={pagePopup.key} className="fixed inset-x-0 z-[45] flex justify-center px-3" style={{ bottom: touch ? '130px' : '28px' }}>
              <button
                className="w-full max-w-[440px] text-left p-4 animate-px-pop cursor-pointer border-0"
                style={{ background: '#f2ead8', boxShadow: '0 0 0 3px #0c0904, 0 0 0 6px #c9a227, 0 10px 0 rgba(0,0,0,0.4)' }}
                onClick={() => setPagePopup(null)}
                aria-label="Cerrar página"
              >
                <p className="font-pixel text-xs tracking-widest mb-1" style={{ color: '#7a6118' }}>
                  📜 PÁGINA PERDIDA {pageIndex}/{TOTAL_PAGINAS}
                </p>
                <p className="font-body text-base leading-snug" style={{ color: '#2a1c10' }}>{PAGINAS[pagePopup.id]}</p>
                <p className="font-pixel text-[11px] mt-2 text-right" style={{ color: '#7a6118' }}>Se guardó en tu diario · toca para cerrar</p>
              </button>
            </div>
          )}

          {hintText && !dialog && !overlayOpen && (
            <div className="pointer-events-none fixed inset-x-0 z-[34] flex justify-center px-3" style={{ bottom: touch ? '120px' : '28px' }}>
              <div className="px-box px-box-glass px-4 py-2 font-pixel text-sm sm:text-base animate-px-bob" style={{ color: '#f3dc8a' }}>
                💡 {hintText}
              </div>
            </div>
          )}

          {paused && !win && <PauseMenu active={!win} onAction={onPauseAction} />}
        </>
      )}

      {dialog && (
        <DialogBox
          key={dialog.key}
          lines={dialog.lines}
          question={dialog.question}
          asker={dialog.asker}
          textSpeed={state.settings.textSpeed}
          onAnswer={dialog.onAnswer}
          onClose={closeDialog}
        />
      )}

      {win && winTitle && (
        <GameWindow
          title={winTitle.title}
          icon={winTitle.icon}
          subtitle={winTitle.subtitle}
          onClose={closeWin}
          tabs={
            win.kind === 'panel' && win.id === 'logros'
              ? [
                  { id: 'logros', label: 'Logros' },
                  { id: 'tabla', label: 'Posiciones' },
                  { id: 'perfil', label: 'Perfil' },
                  { id: 'paginas', label: 'Páginas' },
                ]
              : undefined
          }
          activeTab={logrosTab}
          onTab={setLogrosTab}
        >
          {win.kind === 'activity' ? renderActivity(win.id) : renderPanel(win.id)}
        </GameWindow>
      )}

      <Celebrations current={current} toasts={toasts} />

      {fade > 0 && (
        <div key={fade} className="fixed inset-0 z-[90] pointer-events-none" style={{ background: '#0c0904', animation: 'px-fade-io 0.6s steps(6) forwards' }} />
      )}
    </div>
  );
}
