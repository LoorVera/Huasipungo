import { INTERACTABLES, NPCS, PAGES, ZONES, type ZoneId } from '../../game/world';
import { ACTIVIDADES } from '../../data/dialogos';
import { audio } from '../../game/audio';
import { tr } from '../../i18n';

interface WorldMapProps {
  current: ZoneId | null;
  visited: string[];
  done: string[];
  talked: string[];
  pages: string[];
  onTravel: (x: number) => void;
}

/** Mapa del mundo: zonas descubiertas, lo que hay en cada una y viaje rápido. */
export default function WorldMap({ current, visited, done, talked, pages, onTravel }: WorldMapProps) {
  return (
    <div className="max-w-5xl mx-auto px-3 sm:px-5 py-5">
      {/* Tira del recorrido */}
      <div className="flex items-stretch gap-1 mb-5 overflow-x-auto pb-1" aria-hidden="true">
        {ZONES.map(z => {
          const seen = visited.includes(z.id);
          const here = current === z.id;
          return (
            <div
              key={z.id}
              className="flex-1 min-w-[64px] text-center px-1 py-2 relative"
              style={{
                background: seen ? `${z.color}` : '#1f1610',
                boxShadow: here ? 'inset 0 0 0 3px #f3dc8a' : 'inset 0 0 0 2px #0c0904',
                opacity: seen ? 1 : 0.6,
              }}
            >
              <div className="text-xl">{seen ? z.emoji : '❔'}</div>
              <div className="font-pixel text-[10px] leading-tight uppercase" style={{ color: '#f2ead8', textShadow: '1px 1px 0 #0c0904' }}>
                {seen ? tr(z.name).replace(/^(El|La|Las|Los|The) /, '') : '???'}
              </div>
              {here && (
                <div className="absolute -top-2 inset-x-0 flex justify-center">
                  <span className="font-pixel text-[10px] px-1 animate-px-bob" style={{ background: '#f3dc8a', color: '#17100a' }}>
                    {tr('TÚ', 'YOU')}
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {ZONES.map(z => {
          const seen = visited.includes(z.id);
          const acts = INTERACTABLES.filter(i => i.kind === 'activity' && i.x >= z.x0 && i.x < z.x1);
          const npcs = NPCS.filter(n => n.x >= z.x0 && n.x < z.x1);
          const zonePages = PAGES.filter(p => p.x >= z.x0 && p.x < z.x1);
          const found = zonePages.filter(p => pages.includes(p.id)).length;
          return (
            <div key={z.id} className="px-box p-3 flex flex-col" style={{ opacity: seen ? 1 : 0.7 }}>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-2xl" aria-hidden="true">{seen ? z.emoji : '❔'}</span>
                <div className="min-w-0">
                  <p className="font-pixel text-base leading-tight" style={{ color: seen ? '#e8c84a' : '#8c7459' }}>{seen ? tr(z.name) : tr('Zona sin descubrir', 'Undiscovered zone')}</p>
                  <p className="font-body text-xs" style={{ color: '#8c7459' }}>{seen ? tr(z.subtitle) : tr('Explora para descubrirla', 'Explore to discover it')}</p>
                </div>
              </div>
              {seen && (
                <ul className="font-body text-sm space-y-0.5 my-2" style={{ color: '#d4b896' }}>
                  {acts.map(a => {
                    const meta = a.activity ? ACTIVIDADES[a.activity] : null;
                    const ok = a.activity ? done.includes(a.activity) : false;
                    return (
                      <li key={a.id} className="flex items-center gap-1.5">
                        <span aria-hidden="true">{meta?.icono}</span>
                        <span className="flex-1">{tr(meta?.titulo ?? a.name)}</span>
                        <span style={{ color: ok ? '#8fd08a' : '#4a3820' }}>{ok ? '✔' : '○'}</span>
                      </li>
                    );
                  })}
                  {npcs.map(n => (
                    <li key={n.id} className="flex items-center gap-1.5">
                      <span aria-hidden="true">💬</span>
                      <span className="flex-1">{tr(n.name)}</span>
                      <span style={{ color: talked.includes(n.characterId) ? '#8fd08a' : '#4a3820' }}>{talked.includes(n.characterId) ? '✔' : '○'}</span>
                    </li>
                  ))}
                  {zonePages.length > 0 && (
                    <li className="flex items-center gap-1.5">
                      <span aria-hidden="true">📜</span>
                      <span className="flex-1">{tr('Páginas perdidas', 'Lost pages')}</span>
                      <span style={{ color: found === zonePages.length ? '#8fd08a' : '#c9a227' }}>{found}/{zonePages.length}</span>
                    </li>
                  )}
                </ul>
              )}
              <div className="mt-auto pt-1">
                {seen ? (
                  <button
                    className={current === z.id ? 'px-btn-ghost px-3 py-1.5 text-xs w-full' : 'px-btn px-3 py-1.5 text-xs w-full'}
                    onClick={() => {
                      audio.play('door');
                      onTravel(z.spawn);
                    }}
                  >
                    {current === z.id ? tr('Volver al inicio de la zona', 'Back to the start of the zone') : tr('Viajar aquí ▶', 'Travel here ▶')}
                  </button>
                ) : (
                  <p className="font-pixel text-xs text-center py-1.5" style={{ color: '#4a3820' }}>🔒 {tr('Llega caminando para desbloquear el viaje', 'Walk there to unlock travel')}</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
