import { useEffect, useRef } from 'react';
import { LOGROS, type LogroExtra } from '../data/content';

interface LogrosProps {
  unlockedAchievements: string[];
  completedSections: string[];
  completedMissions: string[];
  quizCompleted: boolean;
  quizScore: number;
  quizTotal: number;
  extra: LogroExtra;
  onUnlock: (id: string) => void;
}

export default function Logros({
  unlockedAchievements, completedSections, completedMissions,
  quizCompleted, quizScore, quizTotal, extra, onUnlock,
}: LogrosProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    LOGROS.forEach(logro => {
      if (!unlockedAchievements.includes(logro.id)) {
        const earned = logro.condicion(completedSections, quizCompleted, quizScore, quizTotal, completedMissions, extra);
        if (earned) onUnlock(logro.id);
      }
    });
  }, [completedSections, completedMissions, quizCompleted, quizScore, quizTotal, extra]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => entries.forEach(e => e.target.classList.toggle('visible', e.isIntersecting)),
      { threshold: 0.1 }
    );
    ref.current?.querySelectorAll('.section-reveal').forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const unlocked = LOGROS.filter(l => unlockedAchievements.includes(l.id));
  const locked = LOGROS.filter(l => !unlockedAchievements.includes(l.id));

  return (
    <div ref={ref} className="max-w-3xl mx-auto px-4 py-12">
      <div className="section-reveal text-center mb-10">
        <p className="font-display text-xs tracking-[0.4em] uppercase mb-3" style={{ color: '#7a6118' }}>Sistema</p>
        <h2 className="font-display text-4xl md:text-5xl font-black mb-4" style={{
          background: 'linear-gradient(135deg, #e8c84a 0%, #c9a227 100%)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
        }}>Logros</h2>
        <div className="w-20 h-px mx-auto" style={{ background: 'linear-gradient(90deg, transparent, #c9a227, transparent)' }} />
        <p className="mt-4 font-body text-sm" style={{ color: '#8c7459' }}>
          <span style={{ color: '#c9a227' }}>{unlocked.length}</span> de {LOGROS.length} desbloqueados
        </p>
      </div>

      {/* Unlocked */}
      {unlocked.length > 0 && (
        <div className="section-reveal mb-8">
          <h3 className="font-display text-sm uppercase tracking-widest mb-4" style={{ color: '#c9a227' }}>Desbloqueados</h3>
          <div className="grid sm:grid-cols-2 gap-3">
            {unlocked.map(logro => (
              <div key={logro.id} className="flex items-center gap-4 p-4 rounded animate-achievement"
                style={{ background: '#c9a22711', border: '1px solid #c9a22744' }}>
                <div className="w-12 h-12 rounded-full flex items-center justify-center text-2xl flex-shrink-0"
                  style={{ background: '#c9a22722', border: '1px solid #c9a227' }}>
                  {logro.emoji}
                </div>
                <div>
                  <p className="font-display text-sm font-semibold" style={{ color: '#e8d5b0' }}>{logro.titulo}</p>
                  <p className="font-body text-xs mt-0.5" style={{ color: '#8c7459' }}>{logro.descripcion}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Locked */}
      {locked.length > 0 && (
        <div className="section-reveal">
          <h3 className="font-display text-sm uppercase tracking-widest mb-4" style={{ color: '#4a3820' }}>Por desbloquear</h3>
          <div className="grid sm:grid-cols-2 gap-3">
            {locked.map(logro => (
              <div key={logro.id} className="flex items-center gap-4 p-4 rounded"
                style={{ background: '#17100a', border: '1px solid #1f1610', opacity: 0.6 }}>
                <div className="w-12 h-12 rounded-full flex items-center justify-center text-2xl flex-shrink-0"
                  style={{ background: '#1f1610', border: '1px solid #2a1f0f', filter: 'grayscale(1)' }}>
                  🔒
                </div>
                <div>
                  <p className="font-display text-sm font-semibold" style={{ color: '#4a3820' }}>{logro.titulo}</p>
                  <p className="font-body text-xs mt-0.5" style={{ color: '#3a2810' }}>{logro.descripcion}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {unlocked.length === LOGROS.length && (
        <div className="section-reveal mt-8 text-center p-6 rounded animate-fade-in" style={{ background: '#c9a22711', border: '2px solid #c9a227' }}>
          <div className="text-4xl mb-3">🏆</div>
          <p className="font-display text-lg font-bold" style={{ color: '#e8c84a' }}>¡Todos los logros desbloqueados!</p>
          <p className="font-body text-sm mt-2" style={{ color: '#8c7459' }}>Eres un verdadero experto en Huasipungo</p>
        </div>
      )}
    </div>
  );
}
