import { useEffect, useRef } from 'react';
import { getLevelForXP } from '../hooks/useGame';
import { tr } from '../i18n';

interface TablaProps {
  leaderboard: { name: string; xp: number; level: number }[];
  playerName: string;
}

const MEDAL = ['🥇', '🥈', '🥉'];

export default function Tabla({ leaderboard, playerName }: TablaProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => entries.forEach(e => e.target.classList.toggle('visible', e.isIntersecting)),
      { threshold: 0.1 }
    );
    ref.current?.querySelectorAll('.section-reveal').forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const sorted = [...leaderboard].sort((a, b) => b.xp - a.xp);

  return (
    <div ref={ref} className="max-w-2xl mx-auto px-4 py-12">
      <div className="section-reveal text-center mb-10">
        <p className="font-display text-xs tracking-[0.4em] uppercase mb-3" style={{ color: '#7a6118' }}>{tr('Sistema', 'System')}</p>
        <h2 className="font-display text-4xl md:text-5xl font-black mb-4" style={{
          background: 'linear-gradient(135deg, #e8c84a 0%, #c9a227 100%)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
        }}>{tr('Tabla de Posiciones', 'Leaderboard')}</h2>
        <div className="w-20 h-px mx-auto" style={{ background: 'linear-gradient(90deg, transparent, #c9a227, transparent)' }} />
      </div>

      {/* Top 3 podium */}
      {sorted.length >= 3 && (
        <div className="section-reveal flex items-end justify-center gap-4 mb-10">
          {/* 2nd */}
          <div className="text-center flex-1">
            <div className="text-2xl mb-2">🥈</div>
            <div className="rounded-t p-3 text-center" style={{ background: '#1f1610', border: '1px solid #7a6118', minHeight: '80px' }}>
              <p className="font-display text-xs font-bold" style={{ color: '#d4b896' }}>{sorted[1]?.name}</p>
              <p className="font-body text-xs mt-1" style={{ color: '#8c7459' }}>{sorted[1]?.xp} XP</p>
            </div>
          </div>
          {/* 1st */}
          <div className="text-center flex-1">
            <div className="text-3xl mb-2">🥇</div>
            <div className="rounded-t p-4 text-center" style={{ background: '#c9a22722', border: '2px solid #c9a227', minHeight: '100px' }}>
              <p className="font-display text-sm font-bold" style={{ color: '#e8c84a' }}>{sorted[0]?.name}</p>
              <p className="font-body text-xs mt-1" style={{ color: '#c9a227' }}>{sorted[0]?.xp} XP</p>
            </div>
          </div>
          {/* 3rd */}
          <div className="text-center flex-1">
            <div className="text-2xl mb-2">🥉</div>
            <div className="rounded-t p-3 text-center" style={{ background: '#1f1610', border: '1px solid #6b3f2a', minHeight: '60px' }}>
              <p className="font-display text-xs font-bold" style={{ color: '#d4b896' }}>{sorted[2]?.name}</p>
              <p className="font-body text-xs mt-1" style={{ color: '#8c7459' }}>{sorted[2]?.xp} XP</p>
            </div>
          </div>
        </div>
      )}

      {/* Full table */}
      <div className="section-reveal rounded overflow-hidden" style={{ border: '1px solid #2a1f0f' }}>
        <div className="grid grid-cols-12 px-4 py-2 text-xs font-display uppercase tracking-widest" style={{ background: '#17100a', color: '#7a6118', borderBottom: '1px solid #2a1f0f' }}>
          <div className="col-span-1">#</div>
          <div className="col-span-5">{tr('Nombre', 'Name')}</div>
          <div className="col-span-4 text-right">XP</div>
          <div className="col-span-2 text-right">{tr('Nivel', 'Level')}</div>
        </div>
        {sorted.map((entry, i) => {
          const isPlayer = entry.name === playerName;
          const levelInfo = getLevelForXP(entry.xp);
          return (
            <div
              key={`${entry.name}-${i}`}
              className="grid grid-cols-12 px-4 py-3 items-center text-sm font-body transition-colors"
              style={{
                background: isPlayer ? '#c9a22711' : i % 2 === 0 ? '#17100a' : '#0f0b06',
                borderBottom: '1px solid #1a1208',
                borderLeft: isPlayer ? '2px solid #c9a227' : '2px solid transparent',
              }}
            >
              <div className="col-span-1 font-display text-xs" style={{ color: i < 3 ? '#c9a227' : '#4a3820' }}>
                {i < 3 ? MEDAL[i] : `${i + 1}.`}
              </div>
              <div className="col-span-5" style={{ color: isPlayer ? '#e8c84a' : '#d4b896' }}>
                {entry.name} {isPlayer && <span className="text-xs" style={{ color: '#c9a22788' }}>({tr('tú', 'you')})</span>}
              </div>
              <div className="col-span-4 text-right font-display font-semibold" style={{ color: '#c9a227' }}>
                {entry.xp.toLocaleString()} XP
              </div>
              <div className="col-span-2 text-right text-xs" style={{ color: '#8c7459' }}>
                {tr('Nv.', 'Lv.')} {levelInfo.level}
              </div>
            </div>
          );
        })}
      </div>

      <p className="section-reveal text-center mt-4 text-xs font-body" style={{ color: '#4a3820' }}>
        {tr('La tabla se actualiza automáticamente con tu progreso', 'The leaderboard updates automatically with your progress')}
      </p>
    </div>
  );
}
