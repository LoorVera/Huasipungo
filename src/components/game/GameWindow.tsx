import { useEffect, useRef, type ReactNode } from 'react';
import { audio } from '../../game/audio';
import { tr } from '../../i18n';

interface GameWindowProps {
  title: string;
  subtitle?: string;
  icon?: string;
  onClose: () => void;
  children: ReactNode;
  /** Pestañas opcionales bajo el título. */
  tabs?: { id: string; label: string }[];
  activeTab?: string;
  onTab?: (id: string) => void;
}

/**
 * Ventana a pantalla completa con marco pixel art. Contiene las actividades
 * (La Novela, Quiz, Memoria...) y los paneles del menú. Se cierra con ESC.
 */
export default function GameWindow({ title, subtitle, icon, onClose, children, tabs, activeTab, onTab }: GameWindowProps) {
  const bodyRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    closeRef.current?.focus({ preventScroll: true });
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape' || e.defaultPrevented) return;
      // Si una actividad tiene su propio modal abierto, ESC lo cierra a él primero.
      // (Fase de captura: se revisa antes de que el modal se cierre y desaparezca.)
      if (bodyRef.current?.querySelector('[role="dialog"]')) return;
      e.preventDefault();
      audio.play('close');
      onClose();
    };
    window.addEventListener('keydown', onKey, true);
    return () => window.removeEventListener('keydown', onKey, true);
  }, [onClose]);

  useEffect(() => {
    bodyRef.current?.scrollTo({ top: 0 });
  }, [activeTab]);

  return (
    <div
      className="fixed inset-0 z-[60] flex items-stretch sm:items-center justify-center sm:p-4 animate-fade-in"
      style={{ background: 'rgba(12,9,4,0.84)' }}
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div
        className="relative w-full sm:max-w-5xl flex flex-col"
        style={{
          height: '100%',
          maxHeight: '100dvh',
          background: '#0c0904',
          border: '3px solid #0c0904',
          boxShadow: 'inset 0 0 0 2px #c9a227, inset 0 0 0 4px #3a2810, 0 0 0 2px #7a6118, 0 12px 0 rgba(0,0,0,0.5)',
        }}
      >
        <header
          className="flex items-center gap-3 px-3 sm:px-5 py-2 flex-shrink-0"
          style={{ background: '#17100a', borderBottom: '2px solid #3a2810', paddingTop: 'max(8px, env(safe-area-inset-top))' }}
        >
          {icon && <span className="text-2xl" aria-hidden="true">{icon}</span>}
          <div className="flex-1 min-w-0">
            <h2 className="font-pixel text-lg sm:text-xl tracking-wider uppercase truncate" style={{ color: '#e8c84a' }}>{title}</h2>
            {subtitle && <p className="font-pixel text-[11px] sm:text-xs tracking-widest uppercase truncate" style={{ color: '#8c7459' }}>{subtitle}</p>}
          </div>
          <button ref={closeRef} onClick={() => { audio.play('close'); onClose(); }} className="px-btn px-3 py-1.5 text-sm flex-shrink-0" aria-label={tr('Cerrar y volver al juego', 'Close and return to the game')}>
            ✕ <span className="hidden sm:inline">ESC</span>
          </button>
        </header>
        {tabs && (
          <div className="flex gap-1 px-3 sm:px-5 pt-2 flex-shrink-0 overflow-x-auto" style={{ background: '#17100a' }} role="tablist">
            {tabs.map(t => (
              <button
                key={t.id}
                role="tab"
                aria-selected={activeTab === t.id}
                onClick={() => { audio.play('select'); onTab?.(t.id); }}
                className="font-pixel text-sm tracking-wider uppercase px-3 py-1.5 flex-shrink-0 cursor-pointer border-0"
                style={{
                  background: activeTab === t.id ? '#c9a227' : '#231a0e',
                  color: activeTab === t.id ? '#17100a' : '#b99a74',
                  boxShadow: activeTab === t.id ? 'inset 0 2px 0 #f3dc8a' : 'inset 0 0 0 1px #3a2810',
                }}
              >
                {t.label}
              </button>
            ))}
          </div>
        )}
        <div ref={bodyRef} className="flex-1 overflow-y-auto game-scroll" style={{ background: '#0c0904' }}>
          {children}
        </div>
      </div>
    </div>
  );
}
