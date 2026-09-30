import { useState, useEffect, useRef } from 'react';
import { PERSONAJES } from '../data/content';
import { PERSONAJES_EXTRA } from '../data/personajesExtra';
import type { WhoAmIStats } from '../hooks/useGame';
import Retrato from '../components/Retrato';
import QuienSoy from '../components/QuienSoy';

interface PersonajesProps {
  onComplete: () => void;
  completed: boolean;
  viewedCharacters: string[];
  onView: (id: string) => void;
  whoAmI: WhoAmIStats;
  onWhoAnswer: (characterId: string, correct: boolean, xp: number) => void;
}

type Tab = 'ficha' | 'historia' | 'relaciones' | 'representa';

const TABS: { id: Tab; label: string }[] = [
  { id: 'ficha', label: 'Ficha' },
  { id: 'historia', label: 'Mi historia' },
  { id: 'relaciones', label: 'Mis relaciones' },
  { id: 'representa', label: '¿Qué represento?' },
];

export default function Personajes({ onComplete, completed, viewedCharacters, onView, whoAmI, onWhoAnswer }: PersonajesProps) {
  const [selected, setSelected] = useState<typeof PERSONAJES[0] | null>(null);
  const [tab, setTab] = useState<Tab>('ficha');
  const ref = useRef<HTMLDivElement>(null);

  const open = (p: typeof PERSONAJES[0]) => {
    setSelected(p);
    setTab('ficha');
    onView(p.id);
  };

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

  useEffect(() => {
    if (!selected) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setSelected(null); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [selected]);

  const ex = selected ? PERSONAJES_EXTRA[selected.id] : null;

  return (
    <div ref={ref} className="max-w-5xl mx-auto px-4 py-12">
      <div className="section-reveal text-center mb-12">
        <p className="font-display text-xs tracking-[0.4em] uppercase mb-3" style={{ color: '#7a6118' }}>Sección II</p>
        <h2 className="font-display text-4xl md:text-5xl font-black mb-4" style={{
          background: 'linear-gradient(135deg, #e8c84a 0%, #c9a227 100%)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
        }}>Personajes</h2>
        <div className="w-20 h-px mx-auto" style={{ background: 'linear-gradient(90deg, transparent, #c9a227, transparent)' }} />
        <p className="mt-4 font-body text-sm" style={{ color: '#8c7459' }}>
          Haz clic en una tarjeta para conocer al personaje ({viewedCharacters.length}/{PERSONAJES.length} descubiertos)
        </p>
      </div>

      {/* Character map */}
      <div className="section-reveal mb-10 p-5 rounded" style={{ background: '#17100a', border: '1px solid #2a1f0f' }}>
        <h3 className="font-display text-sm text-center mb-4" style={{ color: '#7a6118' }}>Mapa de relaciones</h3>
        <div className="flex flex-wrap justify-center gap-3 text-xs font-body" style={{ color: '#8c7459' }}>
          <span className="px-3 py-1 rounded" style={{ background: '#6b3f2a33', border: '1px solid #6b3f2a' }}>Andrés Chiliquinga (protagonista)</span>
          <span style={{ color: '#2a1f0f' }}>↔</span>
          <span className="px-3 py-1 rounded" style={{ background: '#1a120833', border: '1px solid #6b3f2a55' }}>Alfonso Pereira (opresor)</span>
          <span style={{ color: '#2a1f0f' }}>↔</span>
          <span className="px-3 py-1 rounded" style={{ background: '#2d5a3d33', border: '1px solid #2d5a3d' }}>Comunidad indígena</span>
        </div>
      </div>

      {/* Cards grid */}
      <div className="section-reveal grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-10">
        {PERSONAJES.map((p, i) => (
          <button
            key={p.id}
            onClick={() => open(p)}
            className="text-left rounded p-6 card-hover cursor-pointer border-0 transition-all"
            style={{
              background: '#17100a',
              border: `1px solid ${p.color}44`,
              animationDelay: `${i * 0.1}s`,
            }}
            aria-label={`Ver información de ${p.nombre}`}
          >
            <div className="flex items-start gap-4 mb-4">
              <div className="flex-shrink-0"><Retrato id={p.id} color={p.color} size={56} /></div>
              <div>
                <h3 className="font-display font-semibold text-base leading-tight" style={{ color: '#e8d5b0' }}>{p.nombre}</h3>
                <span className="text-xs font-body" style={{ color: '#c9a227' }}>{p.rol}</span>
              </div>
            </div>
            <p className="font-body text-sm leading-relaxed" style={{ color: '#8c7459' }}>{p.descripcionCorta}</p>
            <div className="mt-4 flex flex-wrap gap-1">
              {p.caracteristicas.slice(0, 2).map(c => (
                <span key={c} className="text-xs px-2 py-0.5 rounded-full" style={{ background: '#c9a22715', color: '#c9a227' }}>
                  {c}
                </span>
              ))}
            </div>
            <p className="mt-3 text-xs font-body flex justify-between" style={{ color: '#c9a22766' }}>
              <span>Ver detalle →</span>
              {viewedCharacters.includes(p.id) && <span style={{ color: '#4a7c59' }}>✓ visto</span>}
            </p>
          </button>
        ))}
      </div>

      {/* ¿Quién soy? */}
      <div className="section-reveal mb-10">
        <QuienSoy whoAmI={whoAmI} onAnswer={onWhoAnswer} />
      </div>

      {completed && (
        <div className="text-center animate-fade-in">
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded text-xs font-display" style={{ background: '#2d5a3d22', border: '1px solid #2d5a3d', color: '#4a7c59' }}>
            ✓ Sección completada · +200 XP
          </span>
        </div>
      )}

      {/* Modal */}
      {selected && ex && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-overlay"
          onClick={() => setSelected(null)}
          role="dialog"
          aria-modal="true"
          aria-label={selected.nombre}
        >
          <div
            className="relative max-w-lg w-full rounded p-6 md:p-8 animate-pop-in max-h-[90vh] overflow-y-auto"
            style={{ background: '#1f1610', border: '1px solid #c9a22766' }}
            onClick={e => e.stopPropagation()}
          >
            <button
              onClick={() => setSelected(null)}
              className="absolute top-4 right-4 text-lg cursor-pointer border-0 bg-transparent"
              style={{ color: '#7a6118' }}
              aria-label="Cerrar"
            >✕</button>

            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 mb-5 text-center sm:text-left">
              <Retrato id={selected.id} color={selected.color} size={110} />
              <div>
                <h3 className="font-display text-xl font-bold" style={{ color: '#e8d5b0' }}>{selected.nombre}</h3>
                <span className="font-body text-sm" style={{ color: '#c9a227' }}>{selected.rol}</span>
                <p className="font-body text-sm mt-2" style={{ color: '#d4b896' }}>{ex.quienEs}</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mb-5">
              {TABS.map(t => (
                <button key={t.id} onClick={() => setTab(t.id)}
                  className="text-xs font-body px-3 py-1.5 rounded cursor-pointer transition-colors"
                  style={{
                    background: tab === t.id ? '#c9a227' : '#c9a22712',
                    color: tab === t.id ? '#0c0904' : '#c9a227',
                    border: '1px solid #c9a22755',
                    fontWeight: tab === t.id ? 700 : 400,
                  }}>
                  {t.label}
                </button>
              ))}
            </div>

            <div key={tab} className="animate-fade-in font-body text-sm leading-relaxed" style={{ color: '#d4b896' }}>
              {tab === 'ficha' && (
                <>
                  <p className="text-xs uppercase tracking-widest mb-2 font-display" style={{ color: '#7a6118' }}>Características</p>
                  <div className="flex flex-wrap gap-2 mb-5">
                    {selected.caracteristicas.map(c => (
                      <span key={c} className="text-xs px-2 py-1 rounded" style={{ background: '#c9a22715', color: '#e8c84a', border: '1px solid #c9a22744' }}>{c}</span>
                    ))}
                  </div>
                  <p className="text-xs uppercase tracking-widest mb-2 font-display" style={{ color: '#7a6118' }}>Importancia en la novela</p>
                  <p className="mb-5">{ex.importancia}</p>
                  <p className="text-xs uppercase tracking-widest mb-2 font-display" style={{ color: '#7a6118' }}>Relaciones</p>
                  <div className="space-y-1">
                    {selected.relaciones.map(r => (
                      <div key={r} className="flex items-center gap-2 text-xs" style={{ color: '#8c7459' }}>
                        <span style={{ color: '#c9a227' }}>→</span> {r}
                      </div>
                    ))}
                  </div>
                </>
              )}
              {tab === 'historia' && (
                <p className="whitespace-pre-line">{ex.historia}</p>
              )}
              {tab === 'relaciones' && (
                <div className="space-y-3">
                  {ex.relacionesDetalle.map(r => (
                    <div key={r.con} className="p-3 rounded" style={{ background: '#17100a', border: '1px solid #2a1f0f' }}>
                      <p className="font-display text-sm mb-1" style={{ color: '#e8c84a' }}>↔ {r.con}</p>
                      <p className="text-xs">{r.texto}</p>
                    </div>
                  ))}
                </div>
              )}
              {tab === 'representa' && (
                <div className="p-4 rounded" style={{ background: '#c9a22710', border: '1px solid #c9a22744' }}>
                  <p className="text-xs uppercase tracking-widest mb-2 font-display" style={{ color: '#7a6118' }}>Simbolismo</p>
                  <p className="text-base" style={{ color: '#e8d5b0' }}>{ex.representa}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
