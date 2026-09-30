import { useEffect, useRef } from 'react';

interface NovelaProps {
  onComplete: () => void;
  completed: boolean;
}

const INFO_CARDS = [
  { label: 'Autor', valor: 'Jorge Icaza Coronel', icon: '✍️' },
  { label: 'Año', valor: '1934', icon: '📅' },
  { label: 'País', valor: 'Ecuador', icon: '🌎' },
  { label: 'Género', valor: 'Novela indigenista / Realismo social', icon: '📚' },
  { label: 'Movimiento', valor: 'Indigenismo latinoamericano', icon: '🏔️' },
  { label: 'Idioma', valor: 'Español (con voces kichwa)', icon: '💬' },
];

const TEMAS = [
  { titulo: 'Explotación laboral', desc: 'Los indígenas trabajan en condiciones de servidumbre sin remuneración justa.', color: '#6b3f2a' },
  { titulo: 'Desigualdad social', desc: 'La estructura de hacienda mantiene a los indígenas en la pobreza extrema.', color: '#7a6118' },
  { titulo: 'Discriminación racial', desc: 'Los indígenas son tratados como seres inferiores por terratenientes y clero.', color: '#2d5a3d' },
  { titulo: 'Despojo de tierras', desc: 'El huasipungo, único hogar del indígena, les es arrebatado al final.', color: '#4a6b7a' },
  { titulo: 'Resistencia', desc: 'Ante la opresión extrema, la comunidad se une en una rebelión desesperada.', color: '#4a4a8a' },
  { titulo: 'Denuncia social', desc: 'La novela funciona como manifiesto contra el sistema feudal andino.', color: '#8a4a4a' },
];

export default function Novela({ onComplete, completed }: NovelaProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!completed) {
      const timer = setTimeout(onComplete, 4000);
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
    <div ref={ref} className="max-w-4xl mx-auto px-4 py-12">
      {/* Header */}
      <div className="section-reveal text-center mb-12">
        <p className="font-display text-xs tracking-[0.4em] uppercase mb-3" style={{ color: '#7a6118' }}>Sección I</p>
        <h2 className="font-display text-4xl md:text-5xl font-black mb-4" style={{
          background: 'linear-gradient(135deg, #e8c84a 0%, #c9a227 100%)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
        }}>La Novela</h2>
        <div className="w-20 h-px mx-auto" style={{ background: 'linear-gradient(90deg, transparent, #c9a227, transparent)' }} />
      </div>

      {/* Info grid */}
      <div className="section-reveal grid grid-cols-2 md:grid-cols-3 gap-3 mb-12">
        {INFO_CARDS.map(card => (
          <div key={card.label} className="card-hover rounded p-4" style={{ background: '#17100a', border: '1px solid #2a1f0f' }}>
            <span className="text-xl mb-2 block">{card.icon}</span>
            <p className="text-xs uppercase tracking-widest mb-1 font-body" style={{ color: '#7a6118' }}>{card.label}</p>
            <p className="font-display text-sm font-semibold" style={{ color: '#e8d5b0' }}>{card.valor}</p>
          </div>
        ))}
      </div>

      {/* Síntesis */}
      <div className="section-reveal mb-12 p-6 md:p-8 rounded" style={{ background: '#17100a', border: '1px solid #2a1f0f' }}>
        <h3 className="font-display text-xl font-semibold mb-4" style={{ color: '#c9a227' }}>Síntesis de la obra</h3>
        <div className="space-y-4 font-body leading-relaxed" style={{ color: '#d4b896' }}>
          <p>
            <strong style={{ color: '#e8c84a' }}>Huasipungo</strong> presenta la explotación y las condiciones de vida de los indígenas ecuatorianos dentro de una estructura social profundamente desigual. La historia gira principalmente alrededor de <strong style={{ color: '#e8c84a' }}>Andrés Chiliquinga</strong> y su comunidad, quienes trabajan en condiciones injustas y enfrentan el abuso constante de los terratenientes.
          </p>
          <p>
            <strong style={{ color: '#e8c84a' }}>Alfonso Pereira</strong>, dueño de tierras endeudado, busca obtener beneficios económicos y utiliza el trabajo de los indígenas para sus proyectos. Los habitantes de los huasipungos sufren explotación, pobreza, discriminación y finalmente el despojo de sus tierras.
          </p>
          <p>
            Andrés Chiliquinga representa la resistencia y el sufrimiento de los indígenas frente a una estructura de poder que los oprime. Su grito final <em style={{ color: '#c9a227' }}>"¡Ñucanchic huasipungo!"</em> —"¡Nuestro huasipungo!" en kichwa— se convierte en el símbolo de la lucha desesperada de su pueblo.
          </p>
          <p>
            La novela funciona como una <strong style={{ color: '#e8c84a' }}>denuncia social</strong> que muestra la desigualdad, la explotación y la lucha por la dignidad y la tierra. Es considerada una de las obras más importantes del indigenismo latinoamericano.
          </p>
        </div>
      </div>

      {/* Contexto */}
      <div className="section-reveal mb-12">
        <h3 className="font-display text-xl font-semibold mb-6" style={{ color: '#c9a227' }}>Contexto histórico</h3>
        <div className="rounded p-6 font-body leading-relaxed" style={{ background: '#17100a', border: '1px solid #2a1f0f', color: '#d4b896' }}>
          <p className="mb-3">
            La novela fue publicada en <strong style={{ color: '#e8c84a' }}>1934</strong>, en un Ecuador donde el sistema de hacienda dominaba la economía agraria de los Andes. Los indígenas vivían en <em>huasipungos</em> —pequeños terrenos cedidos por el patrón— a cambio de trabajo forzado que bordeaba la esclavitud.
          </p>
          <p className="mb-3">
            Jorge Icaza utilizó un lenguaje crudo y realista, incorporando vocabulario kichwa, para retratar esta realidad sin adornos. La novela generó controversia por su denuncia directa de las clases terratenientes y de la Iglesia Católica.
          </p>
          <p>
            Treinta años después de la publicación, en <strong style={{ color: '#e8c84a' }}>1964</strong>, Ecuador promulgó la Reforma Agraria que eliminó legalmente el sistema de huasipungo. La obra de Icaza había contribuido a crear conciencia sobre la urgente necesidad de este cambio.
          </p>
        </div>
      </div>

      {/* Importancia */}
      <div className="section-reveal mb-12">
        <h3 className="font-display text-xl font-semibold mb-6" style={{ color: '#c9a227' }}>Importancia de la obra</h3>
        <div className="grid md:grid-cols-2 gap-4">
          {[
            { titulo: 'Literatura ecuatoriana', desc: 'Huasipungo es la novela ecuatoriana más reconocida internacionalmente y uno de los pilares de la identidad literaria del país.' },
            { titulo: 'Indigenismo latinoamericano', desc: 'Junto con otras obras del continente, Huasipungo definió el movimiento indigenista y abrió el debate sobre los derechos de los pueblos originarios.' },
            { titulo: 'Impacto social', desc: 'Su publicación contribuyó al debate que llevaría a la Reforma Agraria de 1964, que eliminó el sistema de servidumbre en el campo ecuatoriano.' },
            { titulo: 'Proyección internacional', desc: 'Traducida a más de doce idiomas, la novela llevó la voz de los indígenas ecuatorianos a lectores de todo el mundo.' },
          ].map(item => (
            <div key={item.titulo} className="rounded p-5 card-hover" style={{ background: '#17100a', border: '1px solid #2a1f0f' }}>
              <h4 className="font-display text-sm font-semibold mb-2" style={{ color: '#e8c84a' }}>{item.titulo}</h4>
              <p className="font-body text-sm leading-relaxed" style={{ color: '#8c7459' }}>{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Temas */}
      <div className="section-reveal">
        <h3 className="font-display text-xl font-semibold mb-6" style={{ color: '#c9a227' }}>Temas principales</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {TEMAS.map(tema => (
            <div key={tema.titulo} className="rounded p-4 card-hover" style={{ background: '#17100a', border: `1px solid ${tema.color}33` }}>
              <div className="w-2 h-2 rounded-full mb-3" style={{ background: tema.color }} />
              <h4 className="font-display text-xs font-semibold mb-2" style={{ color: tema.color }}>{tema.titulo}</h4>
              <p className="font-body text-xs leading-relaxed" style={{ color: '#8c7459' }}>{tema.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {completed && (
        <div className="mt-8 text-center animate-fade-in">
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded text-xs font-display" style={{ background: '#2d5a3d22', border: '1px solid #2d5a3d', color: '#4a7c59' }}>
            ✓ Sección completada · +200 XP
          </span>
        </div>
      )}
    </div>
  );
}
