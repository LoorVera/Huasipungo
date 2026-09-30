import { useEffect, useRef } from 'react';
import { MISIONES } from '../data/content';

interface MisionesProps {
  completedSections: string[];
  completedMissions: string[];
  onCompleteMission: (id: string, xp: number) => void;
  onNav: (section: string) => void;
}

export default function Misiones({ completedSections, completedMissions, onCompleteMission, onNav }: MisionesProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => entries.forEach(e => e.target.classList.toggle('visible', e.isIntersecting)),
      { threshold: 0.1 }
    );
    ref.current?.querySelectorAll('.section-reveal').forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  // Auto-complete missions when sections are done
  useEffect(() => {
    MISIONES.forEach(m => {
      if (completedSections.includes(m.seccionRequerida) && !completedMissions.includes(m.id)) {
        const unlocked = !m.requiere || completedMissions.includes(m.requiere);
        if (unlocked) onCompleteMission(m.id, m.xpRecompensa);
      }
    });
  }, [completedSections, completedMissions, onCompleteMission]);

  const isUnlocked = (mision: typeof MISIONES[0]) => {
    if (!mision.requiere) return true;
    return completedMissions.includes(mision.requiere);
  };

  const isCompleted = (misionId: string) => completedMissions.includes(misionId);
  const isSectionDone = (sectionId: string) => completedSections.includes(sectionId);

  return (
    <div ref={ref} className="max-w-3xl mx-auto px-4 py-12">
      <div className="section-reveal text-center mb-10">
        <p className="font-display text-xs tracking-[0.4em] uppercase mb-3" style={{ color: '#7a6118' }}>Sistema</p>
        <h2 className="font-display text-4xl md:text-5xl font-black mb-4" style={{
          background: 'linear-gradient(135deg, #e8c84a 0%, #c9a227 100%)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
        }}>Misiones</h2>
        <div className="w-20 h-px mx-auto" style={{ background: 'linear-gradient(90deg, transparent, #c9a227, transparent)' }} />
        <p className="mt-4 font-body text-sm" style={{ color: '#8c7459' }}>
          {completedMissions.length} de {MISIONES.length} misiones completadas
        </p>
      </div>

      {/* Progress overview */}
      <div className="section-reveal mb-8 p-4 rounded" style={{ background: '#17100a', border: '1px solid #2a1f0f' }}>
        <div className="flex justify-between text-xs font-body mb-2" style={{ color: '#8c7459' }}>
          <span>Progreso general</span>
          <span style={{ color: '#c9a227' }}>{Math.round((completedMissions.length / MISIONES.length) * 100)}%</span>
        </div>
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${(completedMissions.length / MISIONES.length) * 100}%` }} />
        </div>
      </div>

      {/* Missions list */}
      <div className="section-reveal space-y-4">
        {MISIONES.map((mision, i) => {
          const unlocked = isUnlocked(mision);
          const completed = isCompleted(mision.id);
          const sectionDone = isSectionDone(mision.seccionRequerida);

          return (
            <div
              key={mision.id}
              className="rounded p-5 transition-all"
              style={{
                background: completed ? '#2d5a3d11' : unlocked ? '#17100a' : '#0f0b06',
                border: `1px solid ${completed ? '#2d5a3d' : unlocked ? '#2a1f0f' : '#1a1208'}`,
                opacity: unlocked ? 1 : 0.5,
                animationDelay: `${i * 0.1}s`,
              }}
            >
              <div className="flex items-start gap-4">
                {/* Number */}
                <div className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-display text-xs font-bold"
                  style={{
                    background: completed ? '#2d5a3d' : unlocked ? '#c9a22722' : '#17100a',
                    border: `1px solid ${completed ? '#4a7c59' : '#c9a22744'}`,
                    color: completed ? '#4a7c59' : unlocked ? '#c9a227' : '#4a3820',
                  }}>
                  {completed ? '✓' : mision.numero}
                </div>

                <div className="flex-1">
                  <div className="flex items-start justify-between gap-2 flex-wrap">
                    <div>
                      <h3 className="font-display font-semibold text-sm" style={{ color: completed ? '#4a7c59' : unlocked ? '#e8d5b0' : '#4a3820' }}>
                        {mision.titulo}
                      </h3>
                      <p className="font-body text-xs mt-1 leading-relaxed" style={{ color: '#8c7459' }}>{mision.descripcion}</p>
                    </div>
                    <span className="text-xs font-display flex-shrink-0 px-2 py-1 rounded"
                      style={{ background: '#c9a22722', color: '#c9a227', border: '1px solid #c9a22744' }}>
                      +{mision.xpRecompensa} XP
                    </span>
                  </div>

                  {unlocked && !completed && (
                    <button
                      onClick={() => onNav(mision.seccionRequerida)}
                      className="mt-3 text-xs font-body px-3 py-1.5 rounded cursor-pointer border-0 transition-all"
                      style={{ background: '#c9a22722', color: '#c9a227', border: '1px solid #c9a22744' }}
                    >
                      {sectionDone ? 'Ir al lugar →' : `${mision.instruccion} →`}
                    </button>
                  )}

                  {!unlocked && (
                    <p className="mt-2 text-xs font-body" style={{ color: '#4a3820' }}>
                      🔒 Completa la misión anterior para desbloquear
                    </p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
