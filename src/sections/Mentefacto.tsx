import { useState, useEffect, useRef } from 'react';
import { tr } from '../i18n';

interface MentefactoProps {
  onComplete: () => void;
  completed: boolean;
}

const NOCIONAL_NODES = [
  { id: 'que', label: '¿Qué es?', value: 'Un terreno cedido por el patrón al indígena a cambio de trabajo servil. También: la novela que denuncia este sistema.', angle: 0, color: '#c9a227' },
  { id: 'representa', label: '¿Qué representa?', value: 'La opresión, el despojo y la resistencia de los pueblos indígenas andinos frente al sistema feudal.', angle: 60, color: '#6b3f2a' },
  { id: 'caracteristicas', label: 'Características', value: 'Explotación laboral · Servidumbre · Violencia · Pobreza extrema · Discriminación racial', angle: 120, color: '#4a7c59' },
  { id: 'temas', label: 'Temas', value: 'Injusticia social · Despojo de tierras · Resistencia indígena · Complicidad institucional', angle: 180, color: '#7a6118' },
  { id: 'personajes', label: 'Personajes', value: 'Andrés Chiliquinga · Cunshi · Alfonso Pereira · El cura · La comunidad indígena', angle: 240, color: '#4a4a8a' },
  { id: 'contexto', label: 'Contexto', value: 'Ecuador, principios del siglo XX. Sistema de haciendas andinas con trabajo forzado de indígenas.', angle: 300, color: '#8a4a4a' },
];

const CLASAL_DATA = {
  superordinada: 'Literatura ecuatoriana',
  concepto: 'HUASIPUNGO',
  infraordinadas: ['Novela indigenista', 'Novela de denuncia social'],
  caracteristicas: ['Explotación', 'Desigualdad social', 'Pobreza', 'Discriminación', 'Despojo de tierras', 'Abuso de poder', 'Resistencia'],
  exclusiones: ['Novela romántica', 'Novela fantástica', 'Historia de sociedad igualitaria'],
};

export default function Mentefacto({ onComplete, completed }: MentefactoProps) {
  const [activeTab, setActiveTab] = useState<'nocional' | 'clasal'>('nocional');
  const [selectedNode, setSelectedNode] = useState<typeof NOCIONAL_NODES[0] | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!completed) {
      const timer = setTimeout(onComplete, 6000);
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

  const CX = 200, CY = 200, R = 130;

  return (
    <div ref={ref} className="max-w-4xl mx-auto px-4 py-12">
      <div className="section-reveal text-center mb-10">
        <p className="font-display text-xs tracking-[0.4em] uppercase mb-3" style={{ color: '#7a6118' }}>{tr('Sección III', 'Section III')}</p>
        <h2 className="font-display text-4xl md:text-5xl font-black mb-4" style={{
          background: 'linear-gradient(135deg, #e8c84a 0%, #c9a227 100%)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
        }}>Mentefacto</h2>
        <div className="w-20 h-px mx-auto" style={{ background: 'linear-gradient(90deg, transparent, #c9a227, transparent)' }} />
      </div>

      {/* Tabs */}
      <div className="section-reveal flex justify-center gap-2 mb-8">
        {(['nocional', 'clasal'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className="px-5 py-2 rounded text-xs font-display tracking-widest uppercase cursor-pointer border-0 transition-all"
            style={{
              background: activeTab === tab ? '#c9a227' : '#17100a',
              color: activeTab === tab ? '#0c0904' : '#8c7459',
              border: activeTab === tab ? 'none' : '1px solid #2a1f0f',
            }}
          >
            {tr(`Mentefacto ${tab}`, tab === 'nocional' ? 'Notional concept map' : 'Class concept map')}
          </button>
        ))}
      </div>

      {activeTab === 'nocional' ? (
        <div className="section-reveal">
          <p className="text-center text-xs font-body mb-6" style={{ color: '#8c7459' }}>{tr('Haz clic en cada nodo para ver la información', 'Click each node to see the information')}</p>
          <div className="flex flex-col lg:flex-row items-center gap-8">
            {/* SVG Diagram */}
            <div className="flex-shrink-0">
              <svg width="400" height="400" viewBox="0 0 400 400" className="max-w-full">
                {/* Lines from center to nodes */}
                {NOCIONAL_NODES.map(node => {
                  const rad = (node.angle * Math.PI) / 180;
                  const nx = CX + R * Math.cos(rad);
                  const ny = CY + R * Math.sin(rad);
                  return (
                    <line key={node.id + '_line'}
                      x1={CX} y1={CY} x2={nx} y2={ny}
                      stroke={node.color} strokeWidth="1.5" strokeOpacity="0.4" />
                  );
                })}

                {/* Center node */}
                <circle cx={CX} cy={CY} r={42} fill="#1f1610" stroke="#c9a227" strokeWidth="2" />
                <text x={CX} y={CY - 6} textAnchor="middle" fontFamily="Cinzel, serif" fontSize="9" fill="#c9a227" fontWeight="700">HUASIPUNGO</text>
                <text x={CX} y={CY + 8} textAnchor="middle" fontFamily="Cinzel, serif" fontSize="7" fill="#7a6118">{tr('concepto central', 'central concept')}</text>

                {/* Outer nodes */}
                {NOCIONAL_NODES.map(node => {
                  const rad = (node.angle * Math.PI) / 180;
                  const nx = CX + R * Math.cos(rad);
                  const ny = CY + R * Math.sin(rad);
                  const isSelected = selectedNode?.id === node.id;
                  return (
                    <g key={node.id} onClick={() => setSelectedNode(isSelected ? null : node)} style={{ cursor: 'pointer' }}>
                      <circle cx={nx} cy={ny} r={30}
                        fill={isSelected ? node.color : '#17100a'}
                        stroke={node.color}
                        strokeWidth={isSelected ? 2.5 : 1.5}
                        style={{ transition: 'all 0.3s ease' }}
                      />
                      <text x={nx} y={ny} textAnchor="middle" dominantBaseline="middle"
                        fontFamily="Cinzel, serif" fontSize="7" fill={isSelected ? '#0c0904' : node.color}
                        fontWeight="600">
                        {tr(node.label).split(' ').map((word, i, arr) => (
                          <tspan key={i} x={nx} dy={i === 0 ? -(arr.length - 1) * 5 : 10}>{word}</tspan>
                        ))}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>

            {/* Info panel */}
            <div className="flex-1 min-h-[200px]">
              {selectedNode ? (
                <div className="animate-fade-in-up p-6 rounded" style={{ background: '#17100a', border: `1px solid ${selectedNode.color}55` }}>
                  <div className="w-2 h-2 rounded-full mb-3" style={{ background: selectedNode.color }} />
                  <h3 className="font-display text-lg font-semibold mb-3" style={{ color: selectedNode.color }}>{tr(selectedNode.label)}</h3>
                  <p className="font-body text-sm leading-relaxed" style={{ color: '#d4b896' }}>{tr(selectedNode.value)}</p>
                </div>
              ) : (
                <div className="p-6 rounded flex items-center justify-center min-h-[160px]" style={{ background: '#17100a', border: '1px solid #2a1f0f' }}>
                  <p className="font-body text-sm text-center" style={{ color: '#4a3820' }}>{tr('Selecciona un nodo del diagrama', 'Select a node of the diagram')}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="section-reveal">
          {/* Clasal diagram */}
          <div className="max-w-2xl mx-auto">
            {/* Superordinada */}
            <div className="text-center mb-2">
              <div className="inline-block px-6 py-3 rounded font-display text-sm" style={{ background: '#17100a', border: '1px solid #7a6118', color: '#c9a227' }}>
                {tr(CLASAL_DATA.superordinada)}
              </div>
            </div>
            <div className="flex justify-center mb-2">
              <div className="w-px h-8" style={{ background: '#7a6118' }} />
            </div>

            {/* Concepto */}
            <div className="text-center mb-2">
              <div className="inline-block px-8 py-4 rounded font-display text-xl font-black"
                style={{ background: 'linear-gradient(135deg, #c9a22722, #6b3f2a22)', border: '2px solid #c9a227', color: '#e8c84a' }}>
                {CLASAL_DATA.concepto}
              </div>
            </div>
            <div className="flex justify-center gap-16 mb-2">
              <div className="w-px h-6" style={{ background: '#6b3f2a' }} />
              <div className="w-px h-6" style={{ background: '#6b3f2a' }} />
            </div>

            {/* Infraordinadas */}
            <div className="flex justify-center gap-4 mb-6">
              {CLASAL_DATA.infraordinadas.map(inf => (
                <div key={inf} className="px-4 py-2 rounded text-xs font-display text-center"
                  style={{ background: '#17100a', border: '1px solid #6b3f2a', color: '#d4b896' }}>
                  {tr(inf)}
                </div>
              ))}
            </div>

            {/* Características y Exclusiones */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-5 rounded" style={{ background: '#17100a', border: '1px solid #2d5a3d55' }}>
                <h4 className="font-display text-xs uppercase tracking-widest mb-3" style={{ color: '#4a7c59' }}>{tr('Características', 'Characteristics')}</h4>
                <div className="space-y-1">
                  {CLASAL_DATA.caracteristicas.map(c => (
                    <div key={c} className="flex items-center gap-2 text-xs font-body" style={{ color: '#d4b896' }}>
                      <span style={{ color: '#4a7c59' }}>+</span> {tr(c)}
                    </div>
                  ))}
                </div>
              </div>
              <div className="p-5 rounded" style={{ background: '#17100a', border: '1px solid #8a4a4a55' }}>
                <h4 className="font-display text-xs uppercase tracking-widest mb-3" style={{ color: '#8a4a4a' }}>{tr('Exclusiones', 'Exclusions')}</h4>
                <div className="space-y-1">
                  {CLASAL_DATA.exclusiones.map(e => (
                    <div key={e} className="flex items-center gap-2 text-xs font-body" style={{ color: '#8c7459' }}>
                      <span style={{ color: '#8a4a4a' }}>✕</span> {tr(e)}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

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
