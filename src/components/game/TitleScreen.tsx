import { useEffect, useState } from 'react';
import { audio } from '../../game/audio';
import { tr, type Lang } from '../../i18n';

export type MenuPanel = 'personajes' | 'misiones' | 'logros' | 'config';

interface TitleScreenProps {
  /** Desactiva el teclado cuando hay una ventana abierta encima. */
  active: boolean;
  hasSave: boolean;
  saveXP: number;
  savedName: string;
  touch: boolean;
  lang: Lang;
  onLang: (l: Lang) => void;
  onNewGame: (name: string) => void;
  onContinue: () => void;
  onOpen: (panel: MenuPanel) => void;
}

type Phase = 'menu' | 'confirm' | 'name';

const ITEMS: { id: string; label: string; en: string; icon: string }[] = [
  { id: 'jugar', label: 'Jugar', en: 'Play', icon: '▶' },
  { id: 'continuar', label: 'Continuar', en: 'Continue', icon: '⟲' },
  { id: 'personajes', label: 'Personajes', en: 'Characters', icon: '👥' },
  { id: 'misiones', label: 'Misiones', en: 'Missions', icon: '⚔' },
  { id: 'logros', label: 'Logros', en: 'Achievements', icon: '🏆' },
  { id: 'config', label: 'Configuración', en: 'Settings', icon: '⚙' },
];

/** Pantallas bajas (p. ej. el recuadro de 960×540 de itch.io o un celular en horizontal). */
function useShortScreen() {
  const [short, setShort] = useState(() => typeof window !== 'undefined' && window.innerHeight < 640);
  useEffect(() => {
    const onResize = () => setShort(window.innerHeight < 640);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);
  return short;
}

export default function TitleScreen({ active, hasSave, saveXP, savedName, touch, lang, onLang, onNewGame, onContinue, onOpen }: TitleScreenProps) {
  const [phase, setPhase] = useState<Phase>('menu');
  const [sel, setSel] = useState(hasSave ? 1 : 0);
  const [name, setName] = useState('');
  const short = useShortScreen();

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
    onNewGame(name.trim() || tr('Explorador', 'Explorer'));
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
    <div
      className="fixed inset-0 z-40 flex flex-col items-center px-4 py-3 overflow-y-auto [justify-content:safe_center]"
      style={{ background: 'radial-gradient(ellipse at 50% 45%, rgba(12,9,4,0.15), rgba(12,9,4,0.72))' }}
    >
      <button
        className="px-btn-ghost fixed top-3 right-3 z-10 px-3 py-1.5 text-sm"
        onClick={() => {
          audio.unlock();
          audio.play('select');
          onLang(lang === 'es' ? 'en' : 'es');
        }}
        aria-label={lang === 'es' ? 'Switch to English' : 'Cambiar a español'}
      >
        🌐 {lang === 'es' ? 'English' : 'Español'}
      </button>

      <div className={`text-center animate-fade-in ${short ? 'mb-3' : 'mb-5 sm:mb-7'}`}>
        <p className={`font-pixel text-xs sm:text-sm tracking-[0.45em] uppercase ${short ? 'mb-1' : 'mb-2'}`} style={{ color: '#e8c84a', textShadow: '1px 1px 0 #0c0904' }}>
          Jorge Icaza · Ecuador · 1934
        </p>
        <h1 className="px-title leading-none" style={{ fontSize: short ? 'clamp(2.2rem, min(10vw, 13vh), 5rem)' : 'clamp(2.8rem, 11vw, 6.6rem)' }}>
          HUASIPUNGO
        </h1>
        <p className={`font-pixel text-sm ${short ? 'mt-2' : 'sm:text-lg mt-3'}`} style={{ color: '#f2ead8', textShadow: '2px 2px 0 #0c0904' }}>
          {tr('Una historia de tierra, explotación y resistencia', 'A story of land, exploitation and resistance')}
        </p>
        {!short && (
          <p className="font-body text-xs sm:text-sm mt-1" style={{ color: '#e8d5b0', textShadow: '1px 1px 0 #0c0904' }}>
            {tr('Videojuego educativo basado en la novela de Jorge Icaza', 'Educational video game based on the novel by Jorge Icaza')}
          </p>
        )}
      </div>

      {phase === 'menu' && (
        <nav className={`px-box px-box-glass w-full max-w-[340px] animate-fade-in ${short ? 'p-2' : 'p-3'}`} aria-label={tr('Menú principal', 'Main menu')}>
          {ITEMS.map((it, i) => (
            <button
              key={it.id}
              className={`px-menu-item ${short ? '!py-1 !text-base' : ''} ${sel === i ? 'selected' : ''}`}
              aria-disabled={disabled(it.id)}
              onMouseEnter={() => setSel(i)}
              onFocus={() => setSel(i)}
              onClick={() => activate(it.id)}
            >
              <span className="px-cursor">{sel === i ? '►' : ''}</span>
              <span aria-hidden="true" className="w-6 text-center">{it.icon}</span>
              <span>{tr(it.label, it.en)}</span>
              {it.id === 'continuar' && hasSave && (
                <span className="ml-auto text-xs normal-case tracking-normal opacity-80">{savedName} · {saveXP} XP</span>
              )}
            </button>
          ))}
        </nav>
      )}

      {phase === 'confirm' && (
        <div className="px-box px-box-gold px-box-glass w-full max-w-[420px] p-5 text-center animate-px-pop" role="alertdialog" aria-label={tr('Nueva partida', 'New game')}>
          <p className="font-pixel text-lg mb-2" style={{ color: '#e8c84a' }}>{tr('¿Empezar una nueva partida?', 'Start a new game?')}</p>
          <p className="font-body text-sm mb-4" style={{ color: '#e8d5b0' }}>
            {tr('Ya tienes una partida guardada de', 'You already have a saved game for')} <b>{savedName}</b> {tr('con', 'with')} {saveXP} XP.{' '}
            {tr('Si empiezas de nuevo, se borrará tu progreso.', 'If you start over, your progress will be erased.')}
          </p>
          <div className="flex gap-3 justify-center flex-wrap">
            <button className="px-btn px-4 py-2 text-sm" onClick={() => { audio.play('confirm'); setPhase('name'); }}>{tr('Nueva partida', 'New game')}</button>
            <button className="px-btn-ghost px-4 py-2 text-sm" onClick={() => { audio.play('back'); setPhase('menu'); }}>{tr('Cancelar', 'Cancel')}</button>
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
          <p className="font-pixel text-lg mb-1" style={{ color: '#e8c84a' }}>{tr('Antes de comenzar', 'Before we begin')}</p>
          <label htmlFor="player-name" className="block font-body text-sm mb-3" style={{ color: '#e8d5b0' }}>
            {tr('¿Cómo quieres que te llamemos?', 'What should we call you?')}
          </label>
          <input
            id="player-name"
            value={name}
            onChange={e => setName(e.target.value)}
            maxLength={24}
            autoFocus
            placeholder={tr('Tu nombre o apodo', 'Your name or nickname')}
            className="w-full px-3 py-2.5 mb-4 font-pixel text-lg text-center focus:outline-none"
            style={{ background: '#0c0904', color: '#f2ead8', boxShadow: 'inset 0 0 0 2px #7a6118' }}
          />
          <div className="flex gap-3 justify-center flex-wrap">
            <button type="submit" className="px-btn px-5 py-2 text-sm">{tr('Comenzar ▶', 'Start ▶')}</button>
            <button type="button" className="px-btn-ghost px-4 py-2 text-sm" onClick={() => { audio.play('back'); setPhase('menu'); }}>{tr('Volver', 'Back')}</button>
          </div>
        </form>
      )}

      <p className={`font-pixel text-[11px] sm:text-xs tracking-wider text-center max-w-[640px] ${short ? 'mt-3' : 'mt-6'}`} style={{ color: '#e8d5b0', textShadow: '1px 1px 0 #0c0904' }}>
        {touch ? (
          tr('Usa los botones de la pantalla para moverte, saltar e interactuar.', 'Use the on-screen buttons to move, jump and interact.')
        ) : (
          <>
            <span className="px-key">A</span>/<span className="px-key">D</span> {tr('mover', 'move')} · <span className="px-key">W</span>/<span className="px-key">{tr('ESPACIO', 'SPACE')}</span> {tr('saltar', 'jump')} ·{' '}
            <span className="px-key">SHIFT</span> {tr('correr', 'run')} · <span className="px-key">E</span> {tr('interactuar', 'interact')} · <span className="px-key">ESC</span> {tr('menú', 'menu')}
          </>
        )}
      </p>
    </div>
  );
}
