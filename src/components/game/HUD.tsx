import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { getLevelForXP, getNextLevelXP } from '../../hooks/useGame';
import { WORLD_W, ZONES, type ZoneId } from '../../game/world';
import { tr } from '../../i18n';

export interface HudHandle {
  /** Se llama en cada fotograma con la x del jugador (sin re-renderizar React). */
  update(x: number): void;
}

export interface HudMission {
  numero: string;
  titulo: string;
  instruccion: string;
  x: number;
}

interface HudProps {
  playerName: string;
  xp: number;
  zone: ZoneId | null;
  visited: string[];
  pages: number;
  pagesTotal: number;
  mission: HudMission | null;
  allMissionsDone: boolean;
  onMenu: () => void;
  onJournal: () => void;
}

/** Pantallas bajas (celular en horizontal): HUD compacto para no tapar la escena. */
function useCompact() {
  const [compact, setCompact] = useState(() => typeof window !== 'undefined' && window.innerHeight < 600);
  useEffect(() => {
    const onResize = () => setCompact(window.innerHeight < 600);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);
  return compact;
}

const HUD = forwardRef<HudHandle, HudProps>(function HUD(
  { playerName, xp, zone, visited, pages, pagesTotal, mission, allMissionsDone, onMenu, onJournal },
  ref,
) {
  const compact = useCompact();
  const markerRef = useRef<HTMLDivElement>(null);
  const distRef = useRef<HTMLSpanElement>(null);
  const lastText = useRef('');
  const level = getLevelForXP(xp);
  const next = getNextLevelXP(xp);
  const pct = level.level >= 5 ? 100 : Math.min(100, ((xp - level.minXP) / (next - level.minXP)) * 100);
  const zoneInfo = ZONES.find(z => z.id === zone);

  useImperativeHandle(
    ref,
    () => ({
      update(x: number) {
        if (markerRef.current) markerRef.current.style.left = `${(x / WORLD_W) * 100}%`;
        if (distRef.current && mission) {
          const d = mission.x - x;
          const m = Math.round(Math.abs(d) / 8);
          const txt = m <= 3 ? tr('★ ¡Estás aquí!', '★ You are here!') : `${d < 0 ? '◀' : '▶'} ${m} m`;
          if (txt !== lastText.current) {
            distRef.current.textContent = txt;
            lastText.current = txt;
          }
        }
      },
    }),
    [mission],
  );

  return (
    <div
      className="pointer-events-none fixed inset-x-0 top-0 z-30 flex items-start justify-between gap-2 px-2 sm:px-3"
      style={{ paddingTop: 'max(8px, env(safe-area-inset-top))' }}
    >
      {/* Jugador y misión */}
      <div className={`flex flex-col ${compact ? 'gap-1 w-[210px]' : 'gap-2 w-[min(46vw,270px)]'}`}>
        <div className={`px-box px-box-glass ${compact ? 'px-2 py-1' : 'p-2'}`}>
          <div className="flex items-center justify-between gap-2">
            <span className="font-pixel text-sm truncate" style={{ color: '#f2ead8' }}>{playerName}</span>
            <span className="font-pixel text-xs px-1.5 flex-shrink-0" style={{ background: '#c9a227', color: '#17100a' }}>
              {tr('NV', 'LV')} {level.level}
            </span>
          </div>
          {!compact && (
            <div className="font-pixel text-[11px] uppercase tracking-wider truncate" style={{ color: '#c9a227' }}>{tr(level.name)}</div>
          )}
          <div className="px-bar mt-1" role="progressbar" aria-valuenow={Math.round(pct)} aria-valuemin={0} aria-valuemax={100} aria-label={tr('Progreso de nivel', 'Level progress')}>
            <div className="px-bar-fill" style={{ width: `${pct}%` }} />
          </div>
          <div className="font-pixel text-[11px] mt-0.5" style={{ color: '#b99a74' }}>
            {xp} {level.level < 5 ? `/ ${next}` : ''} XP{compact ? ` · ${tr(level.name)}` : ''}
          </div>
        </div>

        {mission ? (
          <div className={`px-box px-box-glass ${compact ? 'px-2 py-1' : 'p-2'}`}>
            <div className="font-pixel text-[11px] tracking-widest" style={{ color: '#c9a227' }}>{tr('MISIÓN', 'MISSION')} {mission.numero}</div>
            <div className={`font-pixel leading-tight ${compact ? 'text-xs' : 'text-sm'}`} style={{ color: '#f2ead8' }}>{mission.titulo}</div>
            {!compact && (
              <div className="hidden sm:block font-body text-xs leading-snug mt-0.5" style={{ color: '#d4b896' }}>{mission.instruccion}</div>
            )}
            <div className="font-pixel text-xs mt-0.5" style={{ color: '#e8c84a' }}>
              <span ref={distRef} />
            </div>
          </div>
        ) : allMissionsDone ? (
          <div className="px-box px-box-glass p-2">
            <div className="font-pixel text-xs tracking-widest" style={{ color: '#c9a227' }}>🏆 {tr('MISIONES COMPLETAS', 'ALL MISSIONS DONE')}</div>
            <div className="font-body text-xs" style={{ color: '#d4b896' }}>{tr('Sigue explorando: páginas, preguntas y logros.', 'Keep exploring: pages, questions and achievements.')}</div>
          </div>
        ) : null}
      </div>

      {/* Zona y minimapa */}
      <div className={`${compact ? 'hidden' : 'hidden md:flex'} flex-col items-center gap-1.5 flex-1 max-w-[380px]`}>
        {zoneInfo && (
          <div className="px-box px-box-glass px-3 py-1 font-pixel text-sm tracking-widest uppercase" style={{ color: '#e8c84a' }}>
            {zoneInfo.emoji} {tr(zoneInfo.name)}
          </div>
        )}
        <div className="px-box px-box-glass w-full px-2 py-1.5" aria-hidden="true">
          <div className="relative h-3 flex">
            {ZONES.map(z => {
              const seen = visited.includes(z.id);
              return (
                <div
                  key={z.id}
                  style={{
                    width: `${((z.x1 - z.x0) / WORLD_W) * 100}%`,
                    background: seen ? z.color : '#2a1f0f',
                    borderRight: '1px solid #0c0904',
                    opacity: seen ? 1 : 0.7,
                  }}
                />
              );
            })}
            {mission && (
              <div
                className="absolute -top-[5px] -translate-x-1/2 font-pixel text-[11px] leading-none"
                style={{ left: `${(mission.x / WORLD_W) * 100}%`, color: '#e8c84a', textShadow: '0 1px 0 #0c0904' }}
              >
                ▼
              </div>
            )}
            <div
              ref={markerRef}
              className="absolute -top-[2px] w-[6px] h-4 -translate-x-1/2"
              style={{ left: '0%', background: '#f3dc8a', boxShadow: '0 0 0 1px #0c0904' }}
            />
          </div>
        </div>
      </div>

      {/* Páginas y menú */}
      <div className="flex flex-col items-end gap-2">
        <div className="flex items-center gap-2 pointer-events-auto">
          <button onClick={onJournal} className="px-btn-ghost px-2 py-1.5 text-xs sm:text-sm" aria-label={tr(`Páginas encontradas: ${pages} de ${pagesTotal}`, `Pages found: ${pages} of ${pagesTotal}`)}>
            📜 {pages}/{pagesTotal}
          </button>
          <button onClick={onMenu} className="px-btn px-3 py-1.5 text-sm" aria-label={tr('Abrir menú', 'Open menu')}>
            ☰<span className="hidden sm:inline"> ESC</span>
          </button>
        </div>
        {zoneInfo && (
          <div className={`${compact ? '' : 'md:hidden'} px-box px-box-glass px-2 py-0.5 font-pixel text-[11px] tracking-wider uppercase`} style={{ color: '#e8c84a' }}>
            {zoneInfo.emoji} {tr(zoneInfo.name)}
          </div>
        )}
      </div>
    </div>
  );
});

export default HUD;
