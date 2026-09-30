import { useState } from 'react';
import { PERSONAJES } from '../data/content';
import { PERSONAJES_EXTRA } from '../data/personajesExtra';
import type { WhoAmIStats } from '../hooks/useGame';
import Retrato from './Retrato';

interface QuienSoyProps {
  whoAmI: WhoAmIStats;
  onAnswer: (characterId: string, correct: boolean, xp: number) => void;
}

const FIRST_XP = [50, 35, 20]; // según pistas usadas
const REPEAT_XP = 5;

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function newRound(previous?: string) {
  const pool = PERSONAJES.filter(p => p.id !== previous);
  const target = pool[Math.floor(Math.random() * pool.length)];
  const others = shuffle(PERSONAJES.filter(p => p.id !== target.id)).slice(0, 3);
  return { targetId: target.id, options: shuffle([target, ...others]).map(p => p.id) };
}

export default function QuienSoy({ whoAmI, onAnswer }: QuienSoyProps) {
  const [round, setRound] = useState(() => newRound());
  const [clues, setClues] = useState(1);
  const [picked, setPicked] = useState<string | null>(null);
  const [gained, setGained] = useState(0);

  const target = PERSONAJES.find(p => p.id === round.targetId)!;
  const pistas = PERSONAJES_EXTRA[target.id].pistas;
  const answered = picked !== null;
  const correct = picked === target.id;

  const choose = (id: string) => {
    if (answered) return;
    const ok = id === target.id;
    const xp = ok ? (whoAmI.solved.includes(target.id) ? REPEAT_XP : FIRST_XP[clues - 1]) : 0;
    setPicked(id);
    setGained(xp);
    onAnswer(target.id, ok, xp);
  };

  const next = () => {
    setRound(newRound(round.targetId));
    setClues(1);
    setPicked(null);
    setGained(0);
  };

  return (
    <div className="rounded p-5 md:p-7" style={{ background: '#17100a', border: '1px solid #c9a22744' }}>
      <div className="flex items-center justify-between flex-wrap gap-2 mb-4">
        <div>
          <p className="font-display text-xs tracking-[0.3em] uppercase" style={{ color: '#7a6118' }}>Mini juego</p>
          <h3 className="font-display text-2xl font-bold" style={{ color: '#e8c84a' }}>¿Quién soy?</h3>
        </div>
        <div className="flex gap-3 text-xs font-body" style={{ color: '#8c7459' }}>
          <span>Aciertos <b style={{ color: '#c9a227' }}>{whoAmI.correct}/{whoAmI.total}</b></span>
          <span>Racha <b style={{ color: '#c9a227' }}>🔥 {whoAmI.streak}</b></span>
          <span>Resueltos <b style={{ color: '#c9a227' }}>{whoAmI.solved.length}/{PERSONAJES.length}</b></span>
        </div>
      </div>

      <div className="space-y-2 mb-4">
        {pistas.slice(0, clues).map((p, i) => (
          <div key={i} className="animate-fade-in font-body text-sm px-4 py-3 rounded italic"
            style={{ background: '#1f1610', border: '1px solid #2a1f0f', color: '#d4b896' }}>
            <span className="not-italic font-display text-xs mr-2" style={{ color: '#c9a227' }}>Pista {i + 1}</span>“{p}”
          </div>
        ))}
        {!answered && clues < 3 && (
          <button onClick={() => setClues(c => c + 1)} className="text-xs font-body px-3 py-1.5 rounded cursor-pointer"
            style={{ background: '#c9a22712', color: '#c9a227', border: '1px solid #c9a22744' }}>
            Otra pista (menos XP)
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        {round.options.map(id => {
          const p = PERSONAJES.find(x => x.id === id)!;
          const isTarget = id === target.id;
          const isPicked = id === picked;
          const border = !answered ? '#2a1f0f' : isTarget ? '#4a7c59' : isPicked ? '#9a3a2a' : '#2a1f0f';
          return (
            <button key={id} onClick={() => choose(id)} disabled={answered}
              className={`flex flex-col sm:flex-row items-center gap-2 sm:gap-3 p-3 rounded text-center sm:text-left cursor-pointer transition-all ${!answered ? 'card-hover' : ''} ${answered && isPicked && !isTarget ? 'animate-shake' : ''}`}
              style={{
                background: answered && isTarget ? '#2d5a3d22' : '#1f1610',
                border: `1px solid ${border}`,
                opacity: answered && !isTarget && !isPicked ? 0.5 : 1,
              }}>
              <Retrato id={p.id} color={p.color} size={48} />
              <span className="font-display text-xs sm:text-sm" style={{ color: '#e8d5b0' }}>{p.nombre}</span>
            </button>
          );
        })}
      </div>

      {answered && (
        <div className="mt-4 p-4 rounded animate-fade-in" style={{ background: correct ? '#2d5a3d22' : '#9a3a2a1a', border: `1px solid ${correct ? '#4a7c59' : '#9a3a2a'}` }}>
          <p className="font-display text-sm mb-1" style={{ color: correct ? '#6fb083' : '#d97a68' }}>
            {correct ? `¡Correcto! Soy ${target.nombre}. +${gained} XP` : `No era ese. Yo soy ${target.nombre}.`}
          </p>
          <p className="font-body text-xs mb-3" style={{ color: '#d4b896' }}>{PERSONAJES_EXTRA[target.id].quienEs}</p>
          <button onClick={next} className="btn-gold px-4 py-2 rounded text-xs cursor-pointer border-0">Siguiente</button>
        </div>
      )}
    </div>
  );
}
