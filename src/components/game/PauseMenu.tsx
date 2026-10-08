import { useEffect, useState } from 'react';
import { audio } from '../../game/audio';
import { tr } from '../../i18n';

export type PauseAction = 'resume' | 'mapa' | 'misiones' | 'personajes' | 'logros' | 'config' | 'title';

const ITEMS: { id: PauseAction; label: string; en: string; icon: string }[] = [
  { id: 'resume', label: 'Continuar', en: 'Resume', icon: '▶' },
  { id: 'mapa', label: 'Mapa y viajes', en: 'Map & travel', icon: '🗺' },
  { id: 'misiones', label: 'Misiones', en: 'Missions', icon: '⚔' },
  { id: 'personajes', label: 'Personajes', en: 'Characters', icon: '👥' },
  { id: 'logros', label: 'Logros y progreso', en: 'Achievements & progress', icon: '🏆' },
  { id: 'config', label: 'Configuración', en: 'Settings', icon: '⚙' },
  { id: 'title', label: 'Menú principal', en: 'Main menu', icon: '⌂' },
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
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 animate-fade-in" style={{ background: 'rgba(12,9,4,0.62)' }} role="dialog" aria-modal="true" aria-label={tr('Pausa', 'Paused')}>
      <div className="px-box px-box-gold px-box-glass w-full max-w-[360px] p-4 animate-px-pop">
        <p className="px-title text-3xl text-center mb-3">{tr('PAUSA', 'PAUSED')}</p>
        <nav aria-label={tr('Menú de pausa', 'Pause menu')}>
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
              <span>{tr(it.label, it.en)}</span>
            </button>
          ))}
        </nav>
        <p className="font-pixel text-[11px] text-center mt-3 tracking-wider" style={{ color: '#8c7459' }}>{tr('Tu progreso se guarda automáticamente', 'Your progress is saved automatically')}</p>
      </div>
    </div>
  );
}
