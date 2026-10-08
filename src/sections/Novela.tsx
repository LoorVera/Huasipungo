import { useEffect, useRef } from 'react';
import { getLang, tr } from '../i18n';

interface NovelaProps {
  onComplete: () => void;
  completed: boolean;
}

const INFO_CARDS = [
  { label: ['Autor', 'Author'], valor: ['Jorge Icaza Coronel', 'Jorge Icaza Coronel'], icon: '✍️' },
  { label: ['Año', 'Year'], valor: ['1934', '1934'], icon: '📅' },
  { label: ['País', 'Country'], valor: ['Ecuador', 'Ecuador'], icon: '🌎' },
  { label: ['Género', 'Genre'], valor: ['Novela indigenista / Realismo social', 'Indigenista novel / Social realism'], icon: '📚' },
  { label: ['Movimiento', 'Movement'], valor: ['Indigenismo latinoamericano', 'Latin American indigenismo'], icon: '🏔️' },
  { label: ['Idioma', 'Language'], valor: ['Español (con voces kichwa)', 'Spanish (with Kichwa words)'], icon: '💬' },
];

const TEMAS = [
  { titulo: ['Explotación laboral', 'Labor exploitation'], desc: ['Los indígenas trabajan en condiciones de servidumbre sin remuneración justa.', 'Indigenous people work in conditions of servitude without fair pay.'], color: '#6b3f2a' },
  { titulo: ['Desigualdad social', 'Social inequality'], desc: ['La estructura de hacienda mantiene a los indígenas en la pobreza extrema.', 'The hacienda structure keeps Indigenous people in extreme poverty.'], color: '#7a6118' },
  { titulo: ['Discriminación racial', 'Racial discrimination'], desc: ['Los indígenas son tratados como seres inferiores por terratenientes y clero.', 'Indigenous people are treated as inferior beings by landowners and clergy.'], color: '#2d5a3d' },
  { titulo: ['Despojo de tierras', 'Land dispossession'], desc: ['El huasipungo, único hogar del indígena, les es arrebatado al final.', 'The huasipungo, their only home, is taken from them in the end.'], color: '#4a6b7a' },
  { titulo: ['Resistencia', 'Resistance'], desc: ['Ante la opresión extrema, la comunidad se une en una rebelión desesperada.', 'Faced with extreme oppression, the community unites in a desperate rebellion.'], color: '#4a4a8a' },
  { titulo: ['Denuncia social', 'Social denunciation'], desc: ['La novela funciona como manifiesto contra el sistema feudal andino.', 'The novel works as a manifesto against the Andean feudal system.'], color: '#8a4a4a' },
];

const IMPORTANCIA = [
  { titulo: ['Literatura ecuatoriana', 'Ecuadorian literature'], desc: ['Huasipungo es la novela ecuatoriana más reconocida internacionalmente y uno de los pilares de la identidad literaria del país.', "Huasipungo is the most internationally recognized Ecuadorian novel and one of the pillars of the country's literary identity."] },
  { titulo: ['Indigenismo latinoamericano', 'Latin American indigenismo'], desc: ['Junto con otras obras del continente, Huasipungo definió el movimiento indigenista y abrió el debate sobre los derechos de los pueblos originarios.', 'Together with other works from the continent, Huasipungo defined the indigenista movement and opened the debate on the rights of Indigenous peoples.'] },
  { titulo: ['Impacto social', 'Social impact'], desc: ['Su publicación contribuyó al debate que llevaría a la Reforma Agraria de 1964, que eliminó el sistema de servidumbre en el campo ecuatoriano.', 'Its publication contributed to the debate that would lead to the Agrarian Reform of 1964, which abolished the system of servitude in the Ecuadorian countryside.'] },
  { titulo: ['Proyección internacional', 'International reach'], desc: ['Traducida a más de doce idiomas, la novela llevó la voz de los indígenas ecuatorianos a lectores de todo el mundo.', 'Translated into more than twelve languages, the novel carried the voice of Ecuadorian Indigenous people to readers around the world.'] },
];

const HL = { color: '#e8c84a' };

export default function Novela({ onComplete, completed }: NovelaProps) {
  const ref = useRef<HTMLDivElement>(null);
  const en = getLang() === 'en';

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
        <p className="font-display text-xs tracking-[0.4em] uppercase mb-3" style={{ color: '#7a6118' }}>{tr('Sección I', 'Section I')}</p>
        <h2 className="font-display text-4xl md:text-5xl font-black mb-4" style={{
          background: 'linear-gradient(135deg, #e8c84a 0%, #c9a227 100%)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
        }}>{tr('La Novela', 'The Novel')}</h2>
        <div className="w-20 h-px mx-auto" style={{ background: 'linear-gradient(90deg, transparent, #c9a227, transparent)' }} />
      </div>

      {/* Info grid */}
      <div className="section-reveal grid grid-cols-2 md:grid-cols-3 gap-3 mb-12">
        {INFO_CARDS.map(card => (
          <div key={card.label[0]} className="card-hover rounded p-4" style={{ background: '#17100a', border: '1px solid #2a1f0f' }}>
            <span className="text-xl mb-2 block">{card.icon}</span>
            <p className="text-xs uppercase tracking-widest mb-1 font-body" style={{ color: '#7a6118' }}>{tr(card.label[0], card.label[1])}</p>
            <p className="font-display text-sm font-semibold" style={{ color: '#e8d5b0' }}>{tr(card.valor[0], card.valor[1])}</p>
          </div>
        ))}
      </div>

      {/* Síntesis */}
      <div className="section-reveal mb-12 p-6 md:p-8 rounded" style={{ background: '#17100a', border: '1px solid #2a1f0f' }}>
        <h3 className="font-display text-xl font-semibold mb-4" style={{ color: '#c9a227' }}>{tr('Síntesis de la obra', 'Summary of the work')}</h3>
        {en ? (
          <div className="space-y-4 font-body leading-relaxed" style={{ color: '#d4b896' }}>
            <p>
              <strong style={HL}>Huasipungo</strong> portrays the exploitation and living conditions of Ecuadorian Indigenous people within a deeply unequal social structure. The story centers on <strong style={HL}>Andrés Chiliquinga</strong> and his community, who work under unjust conditions and face constant abuse from the landowners.
            </p>
            <p>
              <strong style={HL}>Alfonso Pereira</strong>, an indebted landowner, seeks economic gain and uses Indigenous labor for his projects. The people of the huasipungos suffer exploitation, poverty, discrimination and, finally, the seizure of their land.
            </p>
            <p>
              Andrés Chiliquinga represents the resistance and suffering of the Indigenous people in the face of a power structure that oppresses them. His final cry, <em style={{ color: '#c9a227' }}>"¡Ñucanchic huasipungo!"</em> —"Our huasipungo!" in Kichwa— becomes the symbol of his people's desperate struggle.
            </p>
            <p>
              The novel works as a <strong style={HL}>social denunciation</strong> that exposes inequality, exploitation and the struggle for dignity and land. It is considered one of the most important works of Latin American indigenismo.
            </p>
          </div>
        ) : (
          <div className="space-y-4 font-body leading-relaxed" style={{ color: '#d4b896' }}>
            <p>
              <strong style={HL}>Huasipungo</strong> presenta la explotación y las condiciones de vida de los indígenas ecuatorianos dentro de una estructura social profundamente desigual. La historia gira principalmente alrededor de <strong style={HL}>Andrés Chiliquinga</strong> y su comunidad, quienes trabajan en condiciones injustas y enfrentan el abuso constante de los terratenientes.
            </p>
            <p>
              <strong style={HL}>Alfonso Pereira</strong>, dueño de tierras endeudado, busca obtener beneficios económicos y utiliza el trabajo de los indígenas para sus proyectos. Los habitantes de los huasipungos sufren explotación, pobreza, discriminación y finalmente el despojo de sus tierras.
            </p>
            <p>
              Andrés Chiliquinga representa la resistencia y el sufrimiento de los indígenas frente a una estructura de poder que los oprime. Su grito final <em style={{ color: '#c9a227' }}>"¡Ñucanchic huasipungo!"</em> —"¡Nuestro huasipungo!" en kichwa— se convierte en el símbolo de la lucha desesperada de su pueblo.
            </p>
            <p>
              La novela funciona como una <strong style={HL}>denuncia social</strong> que muestra la desigualdad, la explotación y la lucha por la dignidad y la tierra. Es considerada una de las obras más importantes del indigenismo latinoamericano.
            </p>
          </div>
        )}
      </div>

      {/* Contexto */}
      <div className="section-reveal mb-12">
        <h3 className="font-display text-xl font-semibold mb-6" style={{ color: '#c9a227' }}>{tr('Contexto histórico', 'Historical context')}</h3>
        {en ? (
          <div className="rounded p-6 font-body leading-relaxed" style={{ background: '#17100a', border: '1px solid #2a1f0f', color: '#d4b896' }}>
            <p className="mb-3">
              The novel was published in <strong style={HL}>1934</strong>, in an Ecuador where the hacienda system dominated the agrarian economy of the Andes. Indigenous people lived on <em>huasipungos</em> —small plots granted by the master— in exchange for forced labor that bordered on slavery.
            </p>
            <p className="mb-3">
              Jorge Icaza used raw, realistic language and included Kichwa vocabulary to portray this reality without embellishment. The novel caused controversy for its direct denunciation of the landowning classes and the Catholic Church.
            </p>
            <p>
              Thirty years after its publication, in <strong style={HL}>1964</strong>, Ecuador enacted the Agrarian Reform that legally abolished the huasipungo system. Icaza's work had helped raise awareness of the urgent need for this change.
            </p>
          </div>
        ) : (
          <div className="rounded p-6 font-body leading-relaxed" style={{ background: '#17100a', border: '1px solid #2a1f0f', color: '#d4b896' }}>
            <p className="mb-3">
              La novela fue publicada en <strong style={HL}>1934</strong>, en un Ecuador donde el sistema de hacienda dominaba la economía agraria de los Andes. Los indígenas vivían en <em>huasipungos</em> —pequeños terrenos cedidos por el patrón— a cambio de trabajo forzado que bordeaba la esclavitud.
            </p>
            <p className="mb-3">
              Jorge Icaza utilizó un lenguaje crudo y realista, incorporando vocabulario kichwa, para retratar esta realidad sin adornos. La novela generó controversia por su denuncia directa de las clases terratenientes y de la Iglesia Católica.
            </p>
            <p>
              Treinta años después de la publicación, en <strong style={HL}>1964</strong>, Ecuador promulgó la Reforma Agraria que eliminó legalmente el sistema de huasipungo. La obra de Icaza había contribuido a crear conciencia sobre la urgente necesidad de este cambio.
            </p>
          </div>
        )}
      </div>

      {/* Importancia */}
      <div className="section-reveal mb-12">
        <h3 className="font-display text-xl font-semibold mb-6" style={{ color: '#c9a227' }}>{tr('Importancia de la obra', 'Importance of the work')}</h3>
        <div className="grid md:grid-cols-2 gap-4">
          {IMPORTANCIA.map(item => (
            <div key={item.titulo[0]} className="rounded p-5 card-hover" style={{ background: '#17100a', border: '1px solid #2a1f0f' }}>
              <h4 className="font-display text-sm font-semibold mb-2" style={{ color: '#e8c84a' }}>{tr(item.titulo[0], item.titulo[1])}</h4>
              <p className="font-body text-sm leading-relaxed" style={{ color: '#8c7459' }}>{tr(item.desc[0], item.desc[1])}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Temas */}
      <div className="section-reveal">
        <h3 className="font-display text-xl font-semibold mb-6" style={{ color: '#c9a227' }}>{tr('Temas principales', 'Main themes')}</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {TEMAS.map(tema => (
            <div key={tema.titulo[0]} className="rounded p-4 card-hover" style={{ background: '#17100a', border: `1px solid ${tema.color}33` }}>
              <div className="w-2 h-2 rounded-full mb-3" style={{ background: tema.color }} />
              <h4 className="font-display text-xs font-semibold mb-2" style={{ color: tema.color }}>{tr(tema.titulo[0], tema.titulo[1])}</h4>
              <p className="font-body text-xs leading-relaxed" style={{ color: '#8c7459' }}>{tr(tema.desc[0], tema.desc[1])}</p>
            </div>
          ))}
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
