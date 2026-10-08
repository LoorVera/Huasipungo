import { useRef, useState, type PointerEvent as RPointerEvent, type ReactNode } from 'react';
import type { Action, Input } from '../../game/input';
import { tr } from '../../i18n';

interface TouchControlsProps {
  input: Input | null;
  /** Texto del botón de interactuar (p. ej. "HABLAR"); null si no hay nada cerca. */
  interactLabel: string | null;
  running: boolean;
  onToggleRun: () => void;
}

function HoldButton({ input, action, label, className, children }: { input: Input | null; action: Action; label: string; className: string; children: ReactNode }) {
  const [pressed, setPressed] = useState(false);
  const down = (e: RPointerEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.currentTarget.setPointerCapture?.(e.pointerId);
    input?.setVirtual(action, true);
    setPressed(true);
  };
  const up = () => {
    input?.setVirtual(action, false);
    setPressed(false);
  };
  return (
    <button
      aria-label={label}
      className={`touch-btn ${pressed ? 'pressed' : ''} ${className}`}
      onPointerDown={down}
      onPointerUp={up}
      onPointerCancel={up}
      onLostPointerCapture={up}
      onContextMenu={e => e.preventDefault()}
    >
      {children}
    </button>
  );
}

/** Cruceta: se puede deslizar el dedo entre izquierda y derecha sin levantarlo. */
function DPad({ input }: { input: Input | null }) {
  const ref = useRef<HTMLDivElement>(null);
  const [dir, setDir] = useState<-1 | 0 | 1>(0);
  const apply = (d: -1 | 0 | 1) => {
    input?.setVirtual('left', d === -1);
    input?.setVirtual('right', d === 1);
    setDir(d);
  };
  const fromEvent = (e: RPointerEvent<HTMLDivElement>) => {
    const r = ref.current!.getBoundingClientRect();
    apply(e.clientX < r.left + r.width / 2 ? -1 : 1);
  };
  return (
    <div
      ref={ref}
      className="flex gap-2 touch-none"
      onPointerDown={e => {
        e.preventDefault();
        e.currentTarget.setPointerCapture?.(e.pointerId);
        fromEvent(e);
      }}
      onPointerMove={e => {
        if (dir !== 0) fromEvent(e);
      }}
      onPointerUp={() => apply(0)}
      onPointerCancel={() => apply(0)}
      onLostPointerCapture={() => apply(0)}
      onContextMenu={e => e.preventDefault()}
      role="group"
      aria-label={tr('Mover a la izquierda o a la derecha', 'Move left or right')}
    >
      <div className={`touch-btn w-16 h-16 text-2xl ${dir === -1 ? 'pressed' : ''}`}>◀</div>
      <div className={`touch-btn w-16 h-16 text-2xl ${dir === 1 ? 'pressed' : ''}`}>▶</div>
    </div>
  );
}

export default function TouchControls({ input, interactLabel, running, onToggleRun }: TouchControlsProps) {
  return (
    <div
      className="fixed inset-x-0 bottom-0 z-30 flex items-end justify-between px-3 pointer-events-none"
      style={{ paddingBottom: 'max(12px, env(safe-area-inset-bottom))' }}
    >
      <div className="pointer-events-auto">
        <DPad input={input} />
      </div>
      <div className="flex items-end gap-2 pointer-events-auto">
        <div className="flex flex-col items-center gap-2">
          <button
            aria-label={running ? tr('Dejar de correr', 'Stop running') : tr('Correr', 'Run')}
            aria-pressed={running}
            className={`touch-btn w-12 h-12 text-xs ${running ? 'pressed' : ''}`}
            onClick={onToggleRun}
          >
            {tr('CORRER', 'RUN')}
          </button>
          <HoldButton
            input={input}
            action="interact"
            label={interactLabel ? `${tr('Interactuar', 'Interact')}: ${tr(interactLabel)}` : tr('Interactuar', 'Interact')}
            className={`w-16 h-16 flex-col text-[11px] leading-tight ${interactLabel ? '' : 'opacity-50'}`}
          >
            <span className="text-xl">E</span>
            <span className="max-w-[60px] truncate">{interactLabel ? tr(interactLabel) : '—'}</span>
          </HoldButton>
        </div>
        <HoldButton input={input} action="jump" label={tr('Saltar', 'Jump')} className="w-20 h-20 text-3xl">
          ▲
        </HoldButton>
      </div>
    </div>
  );
}
