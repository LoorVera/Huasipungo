import { useState, useEffect, useRef } from 'react';
import { MAPA_ZONAS } from '../data/content';
import reference from '../assets/reference.png';
import { tr } from '../i18n';

interface MapaProps {
  onComplete: () => void;
  completed: boolean;
}

export default function Mapa({ onComplete, completed }: MapaProps) {
  const [selected, setSelected] = useState<typeof MAPA_ZONAS[0] | null>(null);
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
      { threshold: 0.1 }
    );
    ref.current?.querySelectorAll('.section-reveal').forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className="max-w-5xl mx-auto px-4 py-12">
      <div className="section-reveal text-center mb-10">
        <p className="font-display text-xs tracking-[0.4em] uppercase mb-3" style={{ color: '#7a6118' }}>{tr('Sección V', 'Section V')}</p>
        <h2 className="font-display text-4xl md:text-5xl font-black mb-4" style={{
          background: 'linear-gradient(135deg, #e8c84a 0%, #c9a227 100%)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
        }}>{tr('Mapa Interactivo', 'Interactive Map')}</h2>
        <div className="w-20 h-px mx-auto" style={{ background: 'linear-gradient(90deg, transparent, #c9a227, transparent)' }} />
        <p className="mt-4 font-body text-sm" style={{ color: '#8c7459' }}>{tr('Haz clic en las zonas para explorar los espacios de la novela', 'Click the zones to explore the places of the novel')}</p>
      </div>

      <div className="section-reveal grid lg:grid-cols-2 gap-6 items-start">
        {/* Map photo */}
        <div className="relative rounded overflow-hidden" style={{ background: '#17100a', border: '1px solid #2a1f0f', minHeight: '320px' }}>
          <img
            src={reference}
            alt={tr('Paisaje andino de Huasipungo', 'Andean landscape of Huasipungo')}
            className="absolute inset-0 w-full h-full object-cover"
            style={{ filter: 'saturate(0.85) contrast(1.05) brightness(0.85)' }}
          />
          {/* Sepia/gold vignette to match theme */}
          <div className="absolute inset-0" style={{
            background: 'linear-gradient(180deg, rgba(12,9,4,0.55) 0%, rgba(12,9,4,0.15) 30%, rgba(12,9,4,0.25) 65%, rgba(12,9,4,0.75) 100%)',
          }} />
          <div className="absolute inset-0" style={{
            background: 'radial-gradient(ellipse at center, transparent 40%, rgba(12,9,4,0.5) 100%)',
            mixBlendMode: 'multiply',
          }} />
          <div className="absolute inset-0" style={{ background: 'rgba(120,80,20,0.12)', mixBlendMode: 'color' }} />

          {/* Zone markers */}
          <div className="absolute inset-0">
            {MAPA_ZONAS.map(zona => {
              const isSelected = selected?.id === zona.id;
              return (
                <button
                  key={zona.id}
                  onClick={() => setSelected(isSelected ? null : zona)}
                  className="absolute flex flex-col items-center border-0 bg-transparent cursor-pointer"
                  style={{
                    left: `${zona.x}%`, top: `${zona.y}%`,
                    transform: 'translate(-50%, -50%)',
                    zIndex: isSelected ? 10 : 1,
                  }}
                >
                  <span
                    className="font-display text-[10px] tracking-wide uppercase mb-1 px-1.5 py-0.5 rounded whitespace-nowrap"
                    style={{
                      color: isSelected ? '#e8c84a' : '#e8d5b0',
                      background: 'rgba(12,9,4,0.6)',
                      fontWeight: isSelected ? 700 : 400,
                      transition: 'all 0.3s ease',
                    }}
                  >
                    {tr(zona.nombre)}
                  </span>
                  <span
                    className="flex items-center justify-center rounded-full"
                    style={{
                      width: isSelected ? '2.1rem' : '1.6rem',
                      height: isSelected ? '2.1rem' : '1.6rem',
                      fontSize: isSelected ? '1.1rem' : '0.9rem',
                      background: `${zona.color}dd`,
                      border: `1.5px solid ${isSelected ? '#e8c84a' : '#c9a22788'}`,
                      boxShadow: isSelected ? `0 0 10px ${zona.color}` : 'none',
                      transition: 'all 0.3s ease',
                    }}
                  >
                    {zona.emoji}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Info panel */}
        <div className="space-y-3">
          {selected ? (
            <div key={selected.id} className="animate-fade-in-up p-6 rounded" style={{ background: '#17100a', border: `1px solid ${selected.color}55` }}>
              <div className="flex items-center gap-3 mb-4">
                <span className="text-3xl">{selected.emoji}</span>
                <div>
                  <h3 className="font-display font-semibold text-lg" style={{ color: '#e8d5b0' }}>{tr(selected.nombre)}</h3>
                  <div className="w-2 h-0.5 rounded mt-1" style={{ background: selected.color }} />
                </div>
              </div>
              <p className="font-body text-sm leading-relaxed mb-4" style={{ color: '#d4b896' }}>{tr(selected.descripcion)}</p>
              <div className="p-3 rounded" style={{ background: '#23160e', border: `1px solid ${selected.color}22` }}>
                <p className="font-body text-xs leading-relaxed" style={{ color: '#8c7459' }}>{tr(selected.detalle)}</p>
              </div>
            </div>
          ) : (
            <div className="p-6 rounded flex items-center justify-center" style={{ background: '#17100a', border: '1px solid #2a1f0f', minHeight: '200px' }}>
              <p className="font-body text-sm text-center" style={{ color: '#4a3820' }}>{tr('Selecciona una zona del mapa', 'Select a zone on the map')}</p>
            </div>
          )}

          {/* Zone list */}
          <div className="grid grid-cols-2 gap-2">
            {MAPA_ZONAS.map(zona => (
              <button
                key={zona.id}
                onClick={() => setSelected(selected?.id === zona.id ? null : zona)}
                className="flex items-center gap-2 px-3 py-2 rounded text-left text-xs font-body cursor-pointer border-0 transition-all"
                style={{
                  background: selected?.id === zona.id ? `${zona.color}22` : '#17100a',
                  border: `1px solid ${selected?.id === zona.id ? zona.color : '#2a1f0f'}`,
                  color: selected?.id === zona.id ? zona.color : '#8c7459',
                }}
              >
                <span>{zona.emoji}</span>
                {tr(zona.nombre)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {completed && (
        <div className="mt-8 text-center animate-fade-in">
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded text-xs font-display" style={{ background: '#2d5a3d22', border: '1px solid #2d5a3d', color: '#4a7c59' }}>
            ✓ {tr('Sección completada', 'Section completed')} · +200 XP
          </span>
        </div>
      )}
    </div>
  );
}
