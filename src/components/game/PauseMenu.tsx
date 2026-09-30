import { useEffect, useState } from 'react';
import { audio } from '../../game/audio';

export type PauseAction = 'resume' | 'mapa' | 'misiones' | 'personajes' | 'logros' | 'config' | 'title';

const ITEMS: { id: PauseAction; label: string; icon: string }[] = [
  { id: 'resume', label: 'Continuar', icon: '▶' },
  { id: 'mapa', label: 'Mapa y viajes', icon: '🗺' },
  { id: 'misiones', label: 'Misiones', icon: '⚔' },
  { id: 'personajes', label: 'Personajes', icon: '👥' },
  { id: 'logros', label: 'Logros y progreso', icon: '🏆' },
  { id: 'config', label: 'Configuración', icon: '⚙' },
  { id: 'title', label: 'Menú principal', icon: '⌂' },
];

interface PauseMenuProps {
  active: boolean;
  onAction: (a: PauseAction) => void;
}

export default function PauseMenu({ active, onAction }: PauseMenuProps) {
  const [sel, setSel] = useState(0);

  const run = (a: PauseAction) => {
    audio.play(a === 'resume' ? 'close' : 'confirm');
    onAction(a);
  };

  useEffect(() => {
    if (!active) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.repeat) return;
      const k = e.key.toLowerCase();
      if (k === 'escape') {
        e.preventDefault();
        run('resume');
      } else if (k === 'arrowdown' || k === 's') {
        e.preventDefault();
        setSel(s => (s + 1) % ITEMS.length);
        audio.play('select');
      } else if (k === 'arrowup' || k === 'w') {
        e.preventDefault();
        setSel(s => (s - 1 + ITEMS.length) % ITEMS.length);
        audio.play('select');
      } else if (k === 'enter' || k === ' ' || k === 'e') {
        e.preventDefault();
        run(ITEMS[sel].id);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 animate-fade-in" style={{ background: 'rgba(12,9,4,0.62)' }} role="dialog" aria-modal="true" aria-label="Pausa">
      <div className="px-box px-box-gold px-box-glass w-full max-w-[360px] p-4 animate-px-pop">
        <p className="px-title text-3xl text-center mb-3">PAUSA</p>
        <nav aria-label="Menú de pausa">
          {ITEMS.map((it, i) => (
            <button
              key={it.id}
              className={`px-menu-item !text-base ${sel === i ? 'selected' : ''}`}
              onMouseEnter={() => setSel(i)}
              onFocus={() => setSel(i)}
              onClick={() => run(it.id)}
            >
              <span className="px-cursor">{sel === i ? '►' : ''}</span>
              <span aria-hidden="true" className="w-6 text-center">{it.icon}</span>
              <span>{it.label}</span>
            </button>
          ))}
        </nav>
        <p className="font-pixel text-[11px] text-center mt-3 tracking-wider" style={{ color: '#8c7459' }}>Tu progreso se guarda automáticamente</p>
      </div>
    </div>
  );
}
