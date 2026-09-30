import { useState, useEffect, useRef } from 'react';
import { TIMELINE_EVENTS } from '../data/content';

interface TimelineProps {
  onComplete: () => void;
  completed: boolean;
}

const TYPE_COLORS = {
  autor: '#c9a227',
  contexto: '#4a7c59',
  obra: '#6b3f2a',
};

const TYPE_LABELS = {
  autor: 'Autor',
  contexto: 'Contexto histórico',
  obra: 'La obra',
};

export default function Timeline({ onComplete, completed }: TimelineProps) {
  const [selected, setSelected] = useState<string | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!completed) {
      const timer = setTimeout(onComplete, 5000);
      return () => clearTimeout(timer);
    }
  }, [completed, onComplete]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => entries.forEach(e => e.target.classList.toggle('visible', e.isIntersecting)),
      { threshold: 0.15 }
    );
    ref.current?.querySelectorAll('.section-reveal').forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className="max-w-3xl mx-auto px-4 py-12">
      <div className="section-reveal text-center mb-10">
        <p className="font-display text-xs tracking-[0.4em] uppercase mb-3" style={{ color: '#7a6118' }}>Sección IV</p>
        <h2 className="font-display text-4xl md:text-5xl font-black mb-4" style={{
          background: 'linear-gradient(135deg, #e8c84a 0%, #c9a227 100%)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
        }}>Línea del Tiempo</h2>
        <div className="w-20 h-px mx-auto" style={{ background: 'linear-gradient(90deg, transparent, #c9a227, transparent)' }} />
      </div>

      {/* Legend */}
      <div className="section-reveal flex flex-wrap justify-center gap-4 mb-8">
        {(Object.entries(TYPE_LABELS) as [keyof typeof TYPE_LABELS, string][]).map(([type, label]) => (
          <div key={type} className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ background: TYPE_COLORS[type] }} />
            <span className="text-xs font-body" style={{ color: '#8c7459' }}>{label}</span>
          </div>
        ))}
      </div>

      {/* Timeline */}
      <div className="relative">
        {/* Vertical line */}
        <div className="absolute left-8 top-0 bottom-0 w-px md:left-1/2" style={{ background: 'linear-gradient(180deg, #c9a227, #6b3f2a, #2d5a3d)' }} />

        <div className="space-y-6">
          {TIMELINE_EVENTS.map((event, i) => {
            const color = TYPE_COLORS[event.tipo as keyof typeof TYPE_COLORS] || '#c9a227';
            const isSelected = selected === event.id;
            const isRight = i % 2 === 0;

            return (
              <div key={event.id} className="section-reveal relative" style={{ animationDelay: `${i * 0.12}s` }}>
                {/* Desktop: alternating sides */}
                <div className={`hidden md:flex items-center gap-4 ${isRight ? 'flex-row' : 'flex-row-reverse'}`}>
                  <div className="w-1/2" />
                  {/* Dot */}
                  <div className="relative z-10 flex-shrink-0">
                    <div className="w-4 h-4 rounded-full border-2 transition-transform"
                      style={{ background: color, borderColor: '#0c0904', transform: isSelected ? 'scale(1.4)' : 'scale(1)' }} />
                  </div>
                  <div className="w-1/2">
                    <button
                      onClick={() => setSelected(isSelected ? null : event.id)}
                      className="w-full text-left rounded p-4 card-hover cursor-pointer border-0 transition-all"
                      style={{ background: '#17100a', border: `1px solid ${isSelected ? color : '#2a1f0f'}` }}
                    >
                      <span className="text-xs font-display tracking-widest" style={{ color }}>{event.año}</span>
                      <h3 className="font-display font-semibold text-sm mt-1" style={{ color: '#e8d5b0' }}>{event.titulo}</h3>
                      <span className="text-xs" style={{ color: `${color}88` }}>{TYPE_LABELS[event.tipo as keyof typeof TYPE_LABELS]}</span>
                      {isSelected && (
                        <p className="mt-3 text-xs font-body leading-relaxed animate-fade-in" style={{ color: '#d4b896' }}>{event.descripcion}</p>
                      )}
                    </button>
                  </div>
                </div>

                {/* Mobile: all on right */}
                <div className="flex md:hidden items-start gap-4 pl-12">
                  <div className="absolute left-7 top-4 z-10">
                    <div className="w-3 h-3 rounded-full border-2" style={{ background: color, borderColor: '#0c0904' }} />
                  </div>
                  <button
                    onClick={() => setSelected(isSelected ? null : event.id)}
                    className="w-full text-left rounded p-4 card-hover cursor-pointer border-0 transition-all"
                    style={{ background: '#17100a', border: `1px solid ${isSelected ? color : '#2a1f0f'}` }}
                  >
                    <span className="text-xs font-display tracking-widest" style={{ color }}>{event.año}</span>
                    <h3 className="font-display font-semibold text-sm mt-1" style={{ color: '#e8d5b0' }}>{event.titulo}</h3>
                    {isSelected && (
                      <p className="mt-3 text-xs font-body leading-relaxed animate-fade-in" style={{ color: '#d4b896' }}>{event.descripcion}</p>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {completed && (
        <div className="mt-10 text-center animate-fade-in">
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded text-xs font-display" style={{ background: '#2d5a3d22', border: '1px solid #2d5a3d', color: '#4a7c59' }}>
            ✓ Sección completada · +200 XP
          </span>
        </div>
      )}
    </div>
  );
}
