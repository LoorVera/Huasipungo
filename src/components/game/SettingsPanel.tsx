import { useState, type ReactNode } from 'react';
import type { Settings } from '../../hooks/useGame';
import { audio } from '../../game/audio';

interface SettingsPanelProps {
  settings: Settings;
  onChange: (patch: Partial<Settings>) => void;
  playerName: string;
  hasSave: boolean;
  onRename: (name: string) => void;
  onReset: () => void;
}

function Row({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 py-3 flex-wrap" style={{ borderBottom: '1px solid #2a1f0f' }}>
      <div>
        <p className="font-pixel text-base" style={{ color: '#f2ead8' }}>{label}</p>
        {hint && <p className="font-body text-xs" style={{ color: '#8c7459' }}>{hint}</p>}
      </div>
      <div className="flex gap-1.5 flex-wrap">{children}</div>
    </div>
  );
}

function Choice<T extends string | boolean>({ value, current, label, onPick }: { value: T; current: T; label: string; onPick: (v: T) => void }) {
  const on = value === current;
  return (
    <button
      onClick={() => {
        audio.play('select');
        onPick(value);
      }}
      aria-pressed={on}
      className={on ? 'px-btn px-3 py-1.5 text-sm' : 'px-btn-ghost px-3 py-1.5 text-sm'}
    >
      {label}
    </button>
  );
}

export default function SettingsPanel({ settings, onChange, playerName, hasSave, onRename, onReset }: SettingsPanelProps) {
  const [name, setName] = useState(playerName);
  const [confirmReset, setConfirmReset] = useState(false);
  const canFullscreen = typeof document !== 'undefined' && !!document.fullscreenEnabled;

  const toggleFullscreen = () => {
    audio.play('confirm');
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
    else document.documentElement.requestFullscreen?.().catch(() => {});
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 sm:py-8">
      <h3 className="font-pixel text-sm tracking-[0.3em] uppercase mb-1" style={{ color: '#c9a227' }}>Sonido</h3>
      <Row label="Efectos de sonido">
        <Choice value={true} current={settings.sfx} label="Sí" onPick={v => onChange({ sfx: v })} />
        <Choice value={false} current={settings.sfx} label="No" onPick={v => onChange({ sfx: v })} />
      </Row>
      <Row label="Música andina" hint="Solo suena después de pulsar Jugar o Continuar.">
        <Choice value={true} current={settings.music} label="Sí" onPick={v => onChange({ music: v })} />
        <Choice value={false} current={settings.music} label="No" onPick={v => onChange({ music: v })} />
      </Row>

      <h3 className="font-pixel text-sm tracking-[0.3em] uppercase mt-6 mb-1" style={{ color: '#c9a227' }}>Controles</h3>
      <Row label="Controles táctiles" hint="Botones en pantalla para celulares y tabletas.">
        <Choice value="auto" current={settings.touch} label="Auto" onPick={v => onChange({ touch: v })} />
        <Choice value="on" current={settings.touch} label="Siempre" onPick={v => onChange({ touch: v })} />
        <Choice value="off" current={settings.touch} label="Nunca" onPick={v => onChange({ touch: v })} />
      </Row>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 py-3 font-body text-sm" style={{ color: '#d4b896' }}>
        {[
          ['A / D', 'Moverse'],
          ['W / Espacio', 'Saltar'],
          ['Shift', 'Correr'],
          ['E', 'Interactuar'],
          ['S', 'Bajar de plataforma'],
          ['Esc', 'Menú / cerrar'],
        ].map(([k, v]) => (
          <div key={k} className="flex items-center gap-2">
            <span className="px-key text-xs">{k}</span>
            <span>{v}</span>
          </div>
        ))}
      </div>

      <h3 className="font-pixel text-sm tracking-[0.3em] uppercase mt-6 mb-1" style={{ color: '#c9a227' }}>Lectura y accesibilidad</h3>
      <Row label="Velocidad del texto">
        <Choice value="lenta" current={settings.textSpeed} label="Lenta" onPick={v => onChange({ textSpeed: v })} />
        <Choice value="normal" current={settings.textSpeed} label="Normal" onPick={v => onChange({ textSpeed: v })} />
        <Choice value="rapida" current={settings.textSpeed} label="Rápida" onPick={v => onChange({ textSpeed: v })} />
      </Row>
      <Row label="Reducir animaciones" hint="Menos partículas y movimientos de cámara más suaves.">
        <Choice value={true} current={settings.reducedMotion} label="Sí" onPick={v => onChange({ reducedMotion: v })} />
        <Choice value={false} current={settings.reducedMotion} label="No" onPick={v => onChange({ reducedMotion: v })} />
      </Row>
      {canFullscreen && (
        <Row label="Pantalla completa">
          <button onClick={toggleFullscreen} className="px-btn-ghost px-3 py-1.5 text-sm">Alternar</button>
        </Row>
      )}

      {hasSave && (
        <>
          <h3 className="font-pixel text-sm tracking-[0.3em] uppercase mt-6 mb-1" style={{ color: '#c9a227' }}>Jugador</h3>
          <Row label="Nombre">
            <form
              className="flex gap-1.5"
              onSubmit={e => {
                e.preventDefault();
                const n = name.trim();
                if (n && n !== playerName) {
                  audio.play('confirm');
                  onRename(n);
                }
              }}
            >
              <input
                value={name}
                onChange={e => setName(e.target.value)}
                maxLength={24}
                aria-label="Nombre del jugador"
                className="px-2 py-1.5 font-pixel text-sm w-40 focus:outline-none"
                style={{ background: '#0c0904', color: '#f2ead8', boxShadow: 'inset 0 0 0 2px #7a6118' }}
              />
              <button type="submit" className="px-btn px-3 py-1.5 text-sm">Guardar</button>
            </form>
          </Row>
          <Row label="Reiniciar progreso" hint="Borra XP, misiones, logros y la partida guardada.">
            {confirmReset ? (
              <>
                <button
                  className="px-btn px-3 py-1.5 text-sm"
                  style={{ background: '#b8503a' }}
                  onClick={() => {
                    audio.play('wrong');
                    setConfirmReset(false);
                    onReset();
                  }}
                >
                  Sí, borrar todo
                </button>
                <button className="px-btn-ghost px-3 py-1.5 text-sm" onClick={() => setConfirmReset(false)}>Cancelar</button>
              </>
            ) : (
              <button className="px-btn-ghost px-3 py-1.5 text-sm" onClick={() => setConfirmReset(true)}>Reiniciar…</button>
            )}
          </Row>
        </>
      )}
    </div>
  );
}
