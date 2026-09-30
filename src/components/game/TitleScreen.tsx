import { useEffect, useState } from 'react';
import { audio } from '../../game/audio';

export type MenuPanel = 'personajes' | 'misiones' | 'logros' | 'config';

interface TitleScreenProps {
  /** Desactiva el teclado cuando hay una ventana abierta encima. */
  active: boolean;
  hasSave: boolean;
  saveXP: number;
  savedName: string;
  touch: boolean;
  onNewGame: (name: string) => void;
  onContinue: () => void;
  onOpen: (panel: MenuPanel) => void;
}

type Phase = 'menu' | 'confirm' | 'name';

const ITEMS: { id: string; label: string; icon: string }[] = [
  { id: 'jugar', label: 'Jugar', icon: '▶' },
  { id: 'continuar', label: 'Continuar', icon: '⟲' },
  { id: 'personajes', label: 'Personajes', icon: '👥' },
  { id: 'misiones', label: 'Misiones', icon: '⚔' },
  { id: 'logros', label: 'Logros', icon: '🏆' },
  { id: 'config', label: 'Configuración', icon: '⚙' },
];

export default function TitleScreen({ active, hasSave, saveXP, savedName, touch, onNewGame, onContinue, onOpen }: TitleScreenProps) {
  const [phase, setPhase] = useState<Phase>('menu');
  const [sel, setSel] = useState(hasSave ? 1 : 0);
  const [name, setName] = useState('');

  const disabled = (id: string) => id === 'continuar' && !hasSave;

  const activate = (id: string) => {
    audio.unlock();
    if (disabled(id)) {
      audio.play('wrong');
      return;
    }
    audio.play('confirm');
    if (id === 'jugar') setPhase(hasSave ? 'confirm' : 'name');
    else if (id === 'continuar') onContinue();
    else onOpen(id as MenuPanel);
  };

  const submitName = () => {
    audio.unlock();
    audio.play('confirm');
    onNewGame(name.trim() || 'Explorador');
  };

  useEffect(() => {
    if (!active || phase !== 'menu') return;
    const onKey = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if (k === 'arrowdown' || k === 's') {
        e.preventDefault();
        audio.unlock();
        setSel(s => (s + 1) % ITEMS.length);
        audio.play('select');
      } else if (k === 'arrowup' || k === 'w') {
        e.preventDefault();
        audio.unlock();
        setSel(s => (s - 1 + ITEMS.length) % ITEMS.length);
        audio.play('select');
      } else if (k === 'enter' || k === ' ' || k === 'e') {
        e.preventDefault();
        activate(ITEMS[sel].id);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  useEffect(() => {
    if (!active || phase === 'menu') return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        audio.play('back');
        setPhase('menu');
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [active, phase]);

  return (
    <div className="fixed inset-0 z-40 flex flex-col items-center justify-center px-4 overflow-y-auto" style={{ background: 'radial-gradient(ellipse at 50% 45%, rgba(12,9,4,0.15), rgba(12,9,4,0.72))' }}>
      <div className="text-center mb-5 sm:mb-7 animate-fade-in">
        <p className="font-pixel text-xs sm:text-sm tracking-[0.45em] uppercase mb-2" style={{ color: '#e8c84a', textShadow: '1px 1px 0 #0c0904' }}>
          Jorge Icaza · Ecuador · 1934
        </p>
        <h1 className="px-title leading-none" style={{ fontSize: 'clamp(2.8rem, 11vw, 6.6rem)' }}>
          HUASIPUNGO
        </h1>
        <p className="font-pixel text-sm sm:text-lg mt-3" style={{ color: '#f2ead8', textShadow: '2px 2px 0 #0c0904' }}>
          Una historia de tierra, explotación y resistencia
        </p>
        <p className="font-body text-xs sm:text-sm mt-1" style={{ color: '#e8d5b0', textShadow: '1px 1px 0 #0c0904' }}>
          Videojuego educativo basado en la novela de Jorge Icaza
        </p>
      </div>

      {phase === 'menu' && (
        <nav className="px-box px-box-glass w-full max-w-[340px] p-3 animate-fade-in" aria-label="Menú principal">
          {ITEMS.map((it, i) => (
            <button
              key={it.id}
              className={`px-menu-item ${sel === i ? 'selected' : ''}`}
              aria-disabled={disabled(it.id)}
              onMouseEnter={() => setSel(i)}
              onFocus={() => setSel(i)}
              onClick={() => activate(it.id)}
            >
              <span className="px-cursor">{sel === i ? '►' : ''}</span>
              <span aria-hidden="true" className="w-6 text-center">{it.icon}</span>
              <span>{it.label}</span>
              {it.id === 'continuar' && hasSave && (
                <span className="ml-auto text-xs normal-case tracking-normal opacity-80">{savedName} · {saveXP} XP</span>
              )}
            </button>
          ))}
        </nav>
      )}

      {phase === 'confirm' && (
        <div className="px-box px-box-gold px-box-glass w-full max-w-[420px] p-5 text-center animate-px-pop" role="alertdialog" aria-label="Nueva partida">
          <p className="font-pixel text-lg mb-2" style={{ color: '#e8c84a' }}>¿Empezar una nueva partida?</p>
          <p className="font-body text-sm mb-4" style={{ color: '#e8d5b0' }}>
            Ya tienes una partida guardada de <b>{savedName}</b> con {saveXP} XP. Si empiezas de nuevo, se borrará tu progreso.
          </p>
          <div className="flex gap-3 justify-center flex-wrap">
            <button className="px-btn px-4 py-2 text-sm" onClick={() => { audio.play('confirm'); setPhase('name'); }}>Nueva partida</button>
            <button className="px-btn-ghost px-4 py-2 text-sm" onClick={() => { audio.play('back'); setPhase('menu'); }}>Cancelar</button>
          </div>
        </div>
      )}

      {phase === 'name' && (
        <form
          className="px-box px-box-gold px-box-glass w-full max-w-[420px] p-5 text-center animate-px-pop"
          onSubmit={e => {
            e.preventDefault();
            submitName();
          }}
        >
          <p className="font-pixel text-lg mb-1" style={{ color: '#e8c84a' }}>Antes de comenzar</p>
          <label htmlFor="player-name" className="block font-body text-sm mb-3" style={{ color: '#e8d5b0' }}>
            ¿Cómo quieres que te llamemos?
          </label>
          <input
            id="player-name"
            value={name}
            onChange={e => setName(e.target.value)}
            maxLength={24}
            autoFocus
            placeholder="Tu nombre o apodo"
            className="w-full px-3 py-2.5 mb-4 font-pixel text-lg text-center focus:outline-none"
            style={{ background: '#0c0904', color: '#f2ead8', boxShadow: 'inset 0 0 0 2px #7a6118' }}
          />
          <div className="flex gap-3 justify-center flex-wrap">
            <button type="submit" className="px-btn px-5 py-2 text-sm">Comenzar ▶</button>
            <button type="button" className="px-btn-ghost px-4 py-2 text-sm" onClick={() => { audio.play('back'); setPhase('menu'); }}>Volver</button>
          </div>
        </form>
      )}

      <p className="font-pixel text-[11px] sm:text-xs tracking-wider mt-6 text-center max-w-[640px]" style={{ color: '#e8d5b0', textShadow: '1px 1px 0 #0c0904' }}>
        {touch ? (
          'Usa los botones de la pantalla para moverte, saltar e interactuar.'
        ) : (
          <>
            <span className="px-key">A</span>/<span className="px-key">D</span> mover · <span className="px-key">W</span>/<span className="px-key">ESPACIO</span> saltar ·{' '}
            <span className="px-key">SHIFT</span> correr · <span className="px-key">E</span> interactuar · <span className="px-key">ESC</span> menú
          </>
        )}
      </p>
    </div>
  );
}
