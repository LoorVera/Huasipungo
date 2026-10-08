import { useState, useEffect, useRef, useCallback } from 'react';
import { PERSONAJES } from '../data/content';
import { MEMORIA_PARES } from '../data/personajesExtra';
import type { MemoryDifficulty, MemoryStats } from '../hooks/useGame';
import Retrato from '../components/Retrato';
import { tr } from '../i18n';

interface MemoriaProps {
  stats: MemoryStats;
  /** Se llama una sola vez al ganar; `xp` ya incluye bonificaciones. */
  onWin: (difficulty: MemoryDifficulty, score: number, perfect: boolean, xp: number) => void;
}

interface Cfg {
  label: string;
  emoji: string;
  pairs: number;
  base: number;
  penalty: number;
  peekMs: number;
  xp: number;
  hint: string;
  subtle: boolean;
}

const CONFIG: Record<MemoryDifficulty, Cfg> = {
  facil: { label: 'Fácil', emoji: '🌱', pairs: 3, base: 100, penalty: 0, peekMs: 2500, xp: 100, subtle: false,
    hint: '3 parejas · vista previa · sin penalización' },
  media: { label: 'Media', emoji: '⛰️', pairs: 4, base: 150, penalty: 10, peekMs: 0, xp: 200, subtle: false,
    hint: '4 parejas · −10 pts por error' },
  dificil: { label: 'Difícil', emoji: '🔥', pairs: 5, base: 200, penalty: 25, peekMs: 0, xp: 350, subtle: true,
    hint: '5 parejas · descripciones simbólicas · −25 pts por error' },
};

const REPEAT_XP = 20;
const FIRST_PERFECT_BONUS = 100;

interface Card {
  uid: string;
  pairId: string;
  kind: 'nombre' | 'desc';
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function buildDeck(difficulty: MemoryDifficulty): Card[] {
  const cfg = CONFIG[difficulty];
  const chosen = shuffle(MEMORIA_PARES).slice(0, cfg.pairs);
  return shuffle(chosen.flatMap(p => [
    { uid: `${p.id}-n`, pairId: p.id, kind: 'nombre' as const },
    { uid: `${p.id}-d`, pairId: p.id, kind: 'desc' as const },
  ]));
}

export default function Memoria({ stats, onWin }: MemoriaProps) {
  const ref = useRef<HTMLDivElement>(null);
  const timers = useRef<number[]>([]);

  const [difficulty, setDifficulty] = useState<MemoryDifficulty>('facil');
  const [phase, setPhase] = useState<'menu' | 'peek' | 'play' | 'won'>('menu');
  const [deck, setDeck] = useState<Card[]>([]);
  const [flipped, setFlipped] = useState<number[]>([]);
  const [matched, setMatched] = useState<string[]>([]);
  const [attempts, setAttempts] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [locked, setLocked] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [shakeIdx, setShakeIdx] = useState<number[]>([]);
  const [reward, setReward] = useState({ xp: 0, perfect: false, first: false });

  const cfg = CONFIG[difficulty];

  const later = useCallback((fn: () => void, ms: number) => {
    timers.current.push(window.setTimeout(fn, ms));
  }, []);
  const clearTimers = useCallback(() => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  }, []);
  useEffect(() => clearTimers, [clearTimers]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => entries.forEach(e => e.target.classList.toggle('visible', e.isIntersecting)),
      { threshold: 0.1 }
    );
    ref.current?.querySelectorAll('.section-reveal').forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, [phase]);

  // Cronómetro
  useEffect(() => {
    if (phase !== 'play') return;
    const id = window.setInterval(() => setSeconds(s => s + 1), 1000);
    return () => clearInterval(id);
  }, [phase]);

  const start = (d: MemoryDifficulty) => {
    clearTimers();
    setDifficulty(d);
    setDeck(buildDeck(d));
    setFlipped([]);
    setMatched([]);
    setAttempts(0);
    setMistakes(0);
    setScore(0);
    setStreak(0);
    setSeconds(0);
    setLocked(false);
    setShakeIdx([]);
    if (CONFIG[d].peekMs > 0) {
      setPhase('peek');
      later(() => setPhase('play'), CONFIG[d].peekMs);
    } else {
      setPhase('play');
    }
  };

  const flip = (idx: number) => {
    if (phase !== 'play' || locked) return;
    const card = deck[idx];
    if (flipped.includes(idx) || matched.includes(card.pairId)) return;

    const next = [...flipped, idx];
    setFlipped(next);
    if (next.length < 2) return;

    setLocked(true);
    setAttempts(a => a + 1);
    const [a, b] = next.map(i => deck[i]);

    if (a.pairId === b.pairId) {
      const gain = cfg.base + streak * 20;
      const newScore = score + gain;
      const newMatched = [...matched, a.pairId];
      setScore(newScore);
      setStreak(s => s + 1);
      later(() => {
        setMatched(newMatched);
        setFlipped([]);
        setLocked(false);
        if (newMatched.length === cfg.pairs) {
          const perfect = mistakes === 0;
          const first = !stats.wins[difficulty];
          const xp = (first ? cfg.xp : REPEAT_XP) + (perfect && stats.perfect === 0 ? FIRST_PERFECT_BONUS : 0);
          setReward({ xp, perfect, first });
          setPhase('won');
          onWin(difficulty, newScore, perfect, xp);
        }
      }, 650);
    } else {
      setMistakes(m => m + 1);
      setStreak(0);
      setScore(s => Math.max(0, s - cfg.penalty));
      setShakeIdx(next);
      later(() => {
        setFlipped([]);
        setShakeIdx([]);
        setLocked(false);
      }, 1000);
    }
  };

  const fmt = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
  const cols = deck.length <= 6 ? 'grid-cols-2 sm:grid-cols-3' : deck.length <= 8 ? 'grid-cols-2 sm:grid-cols-4' : 'grid-cols-2 sm:grid-cols-4 md:grid-cols-5';

  return (
    <div ref={ref} className="max-w-4xl mx-auto px-4 py-12">
      <div className="section-reveal text-center mb-10">
        <p className="font-display text-xs tracking-[0.4em] uppercase mb-3" style={{ color: '#7a6118' }}>{tr('Juego', 'Game')}</p>
        <h2 className="font-display text-4xl md:text-5xl font-black mb-4" style={{
          background: 'linear-gradient(135deg, #e8c84a 0%, #c9a227 100%)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
        }}>{tr('Memoria del Huasipungo', 'Huasipungo Memory')}</h2>
        <div className="w-20 h-px mx-auto" style={{ background: 'linear-gradient(90deg, transparent, #c9a227, transparent)' }} />
        <p className="mt-4 font-body text-sm" style={{ color: '#8c7459' }}>
          {tr('Une a cada personaje con su descripción. Cada pareja suma puntos y una victoria te da XP.', 'Match each character with their description. Every pair scores points and a win earns you XP.')}
        </p>
      </div>

      {phase === 'menu' && (
        <div className="section-reveal grid sm:grid-cols-3 gap-4">
          {(Object.keys(CONFIG) as MemoryDifficulty[]).map(d => {
            const c = CONFIG[d];
            return (
              <button key={d} onClick={() => start(d)}
                className="text-left rounded p-5 card-hover cursor-pointer"
                style={{ background: '#17100a', border: '1px solid #c9a22733' }}>
                <div className="text-3xl mb-2">{c.emoji}</div>
                <h3 className="font-display text-lg font-bold" style={{ color: '#e8d5b0' }}>{tr(c.label)}</h3>
                <p className="font-body text-xs mt-1 mb-3" style={{ color: '#8c7459' }}>{tr(c.hint)}</p>
                <div className="flex justify-between text-xs font-body" style={{ color: '#7a6118' }}>
                  <span>{tr('Mejor', 'Best')}: <b style={{ color: '#c9a227' }}>{stats.best[d] ?? '—'}</b></span>
                  <span>{tr('Victorias', 'Wins')}: <b style={{ color: '#c9a227' }}>{stats.wins[d] ?? 0}</b></span>
                </div>
                <p className="mt-3 text-xs font-display" style={{ color: '#c9a227' }}>
                  +{stats.wins[d] ? REPEAT_XP : c.xp} XP {tr('al ganar', 'for winning')}
                </p>
              </button>
            );
          })}
        </div>
      )}

      {phase !== 'menu' && (
        <>
          {/* Marcadores */}
          <div className="grid grid-cols-4 gap-2 mb-5 text-center">
            {[
              { l: tr('Puntos', 'Points'), v: score },
              { l: tr('Intentos', 'Attempts'), v: attempts },
              { l: tr('Parejas', 'Pairs'), v: `${matched.length}/${cfg.pairs}` },
              { l: tr('Tiempo', 'Time'), v: fmt(seconds) },
            ].map(s => (
              <div key={s.l} className="rounded py-2 px-1" style={{ background: '#17100a', border: '1px solid #2a1f0f' }}>
                <div className="font-display text-lg sm:text-xl font-bold" style={{ color: '#e8c84a' }}>{s.v}</div>
                <div className="font-body text-[11px] sm:text-xs" style={{ color: '#8c7459' }}>{s.l}</div>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between mb-4 text-xs font-body" style={{ color: '#8c7459' }}>
            <span>{cfg.emoji} {tr(cfg.label)}{streak >= 2 && <span style={{ color: '#e8c84a' }}> · 🔥 {tr('racha', 'streak')} x{streak}</span>}</span>
            <div className="flex gap-2">
              <button onClick={() => start(difficulty)} className="px-3 py-1 rounded cursor-pointer"
                style={{ background: '#c9a22722', color: '#c9a227', border: '1px solid #c9a22744' }}>{tr('Reiniciar', 'Restart')}</button>
              <button onClick={() => { clearTimers(); setPhase('menu'); }} className="px-3 py-1 rounded cursor-pointer"
                style={{ background: '#17100a', color: '#8c7459', border: '1px solid #2a1f0f' }}>{tr('Dificultad', 'Difficulty')}</button>
            </div>
          </div>

          {phase === 'peek' && (
            <p className="text-center text-sm font-body mb-3 animate-fade-in" style={{ color: '#e8c84a' }}>
              👀 {tr('¡Memoriza las cartas!', 'Memorize the cards!')}
            </p>
          )}

          <div className={`grid ${cols} gap-3`}>
            {deck.map((card, idx) => {
              const p = PERSONAJES.find(x => x.id === card.pairId)!;
              const par = MEMORIA_PARES.find(x => x.id === card.pairId)!;
              const isMatched = matched.includes(card.pairId);
              const up = phase === 'peek' || isMatched || flipped.includes(idx);
              const label = tr(card.kind === 'nombre' ? p.nombre : cfg.subtle ? par.dificil : par.facil);
              return (
                <button
                  key={card.uid}
                  onClick={() => flip(idx)}
                  disabled={phase !== 'play'}
                  aria-label={up ? label : tr('Carta oculta', 'Hidden card')}
                  className={`flip-scene h-36 sm:h-44 p-0 border-0 bg-transparent cursor-pointer ${shakeIdx.includes(idx) ? 'animate-shake' : ''} ${isMatched ? 'match-glow' : ''}`}
                >
                  <div className={`flip-card ${up ? 'flipped' : ''}`}>
                    {/* Dorso */}
                    <div className="flip-face flex items-center justify-center"
                      style={{
                        background: 'repeating-linear-gradient(45deg, #231a0e 0 8px, #1a1208 8px 16px)',
                        border: '2px solid #7a6118',
                      }}>
                      <div className="w-14 h-14 rotate-45 flex items-center justify-center" style={{ border: '2px solid #c9a227' }}>
                        <div className="w-7 h-7" style={{ background: '#c9a22733', border: '1px solid #c9a227' }} />
                      </div>
                    </div>
                    {/* Frente */}
                    <div className="flip-face flip-back-face flex flex-col items-center justify-center gap-2 p-2 text-center"
                      style={{
                        background: isMatched ? '#2d5a3d33' : '#1f1610',
                        border: `2px solid ${isMatched ? '#4a7c59' : '#c9a227'}`,
                      }}>
                      {card.kind === 'nombre' ? (
                        <>
                          <Retrato id={p.id} color={p.color} size={72} />
                          <span className="font-display text-xs sm:text-sm font-semibold leading-tight" style={{ color: '#e8d5b0' }}>{tr(p.nombre)}</span>
                        </>
                      ) : (
                        <span className="font-body text-xs sm:text-sm leading-snug italic" style={{ color: '#d4b896' }}>“{label}”</span>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </>
      )}

      {phase === 'won' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-overlay" role="dialog" aria-modal="true" aria-label={tr('Victoria', 'Victory')}>
          <div className="max-w-sm w-full rounded p-8 text-center animate-pop-in" style={{ background: '#1f1610', border: '2px solid #c9a227' }}>
            <div className="text-5xl mb-3">🏆</div>
            <h3 className="font-display text-2xl font-black mb-1" style={{ color: '#e8c84a' }}>{tr('¡Victoria!', 'Victory!')}</h3>
            <p className="font-body text-sm mb-4" style={{ color: '#d4b896' }}>
              {reward.perfect
                ? tr('Ni un solo error: tu memoria honra a Andrés.', 'Not a single mistake: your memory honors Andrés.')
                : tr('Recordaste a los personajes de Huasipungo.', 'You remembered the characters of Huasipungo.')}
            </p>
            <div className="grid grid-cols-3 gap-2 mb-4 text-center">
              {[{ l: tr('Puntos', 'Points'), v: score }, { l: tr('Intentos', 'Attempts'), v: attempts }, { l: tr('Tiempo', 'Time'), v: fmt(seconds) }].map(s => (
                <div key={s.l} className="rounded py-2" style={{ background: '#17100a', border: '1px solid #2a1f0f' }}>
                  <div className="font-display text-lg font-bold" style={{ color: '#e8c84a' }}>{s.v}</div>
                  <div className="font-body text-xs" style={{ color: '#8c7459' }}>{s.l}</div>
                </div>
              ))}
            </div>
            <p className="font-display text-sm mb-5" style={{ color: '#c9a227' }}>
              +{reward.xp} XP{!reward.first && <span className="text-xs" style={{ color: '#8c7459' }}> ({tr('repetición', 'replay')})</span>}
            </p>
            <div className="flex gap-2 justify-center flex-wrap">
              <button onClick={() => start(difficulty)} className="btn-gold px-4 py-2 rounded text-xs cursor-pointer border-0">{tr('Jugar otra vez', 'Play again')}</button>
              <button onClick={() => setPhase('menu')} className="px-4 py-2 rounded text-xs font-body cursor-pointer"
                style={{ background: '#17100a', color: '#8c7459', border: '1px solid #2a1f0f' }}>{tr('Cambiar dificultad', 'Change difficulty')}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
