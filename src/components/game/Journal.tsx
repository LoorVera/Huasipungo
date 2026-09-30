import { PAGES, zoneAt } from '../../game/world';
import { PAGINAS } from '../../data/dialogos';

/** Diario con las páginas perdidas de Huasipungo que el jugador ha encontrado. */
export default function Journal({ pages }: { pages: string[] }) {
  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <p className="font-body text-sm mb-1" style={{ color: '#d4b896' }}>
        Las páginas perdidas están escondidas por todo el mapa: sobre techos, balcones, rocas y parvas. ¡Salta para alcanzarlas!
      </p>
      <p className="font-pixel text-base mb-4" style={{ color: '#e8c84a' }}>
        📜 {pages.length} de {PAGES.length} encontradas
      </p>
      <div className="grid sm:grid-cols-2 gap-3">
        {PAGES.map((p, i) => {
          const got = pages.includes(p.id);
          const zone = zoneAt(p.x);
          return (
            <div
              key={p.id}
              className="p-3"
              style={{
                background: got ? '#f2ead8' : '#17100a',
                boxShadow: got ? 'inset 0 0 0 2px #c9a227, 0 0 0 2px #0c0904' : 'inset 0 0 0 2px #2a1f0f',
              }}
            >
              <p className="font-pixel text-xs tracking-widest mb-1" style={{ color: got ? '#7a6118' : '#4a3820' }}>
                PÁGINA {i + 1} · {zone.name.toUpperCase()}
              </p>
              <p className="font-body text-sm leading-snug" style={{ color: got ? '#3a2810' : '#5a4630' }}>
                {got ? PAGINAS[p.id] : `Aún no la encuentras. Búscala en ${zone.name}.`}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
