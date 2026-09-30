export type Action = 'left' | 'right' | 'jump' | 'run' | 'interact' | 'down';

const KEY_MAP: Record<string, Action> = {
  a: 'left',
  arrowleft: 'left',
  d: 'right',
  arrowright: 'right',
  w: 'jump',
  ' ': 'jump',
  arrowup: 'jump',
  shift: 'run',
  e: 'interact',
  s: 'down',
  arrowdown: 'down',
};

/**
 * Estado de controles del jugador: teclado (A/D, W/Espacio, Shift, E) y
 * botones táctiles virtuales. Los "presses" son eventos de un solo disparo.
 */
export class Input {
  private held = new Set<Action>();
  private virtual = new Set<Action>();
  private pressed = new Set<Action>();
  private enabled = true;
  runToggle = false;
  onPause: (() => void) | null = null;

  private onKeyDown = (e: KeyboardEvent) => {
    const target = e.target as HTMLElement | null;
    if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) return;
    if (e.key === 'Escape') {
      if (this.enabled && !e.repeat && !e.defaultPrevented) {
        e.preventDefault();
        this.onPause?.();
      }
      return;
    }
    if (!this.enabled) return;
    const action = KEY_MAP[e.key.toLowerCase()];
    if (!action) return;
    e.preventDefault();
    if (!this.held.has(action) && !e.repeat) this.pressed.add(action);
    this.held.add(action);
  };

  private onKeyUp = (e: KeyboardEvent) => {
    const action = KEY_MAP[e.key.toLowerCase()];
    if (action) this.held.delete(action);
    // Con Shift pulsado, las letras llegan en mayúscula: se limpian ambas.
    if (e.key === 'Shift') this.held.delete('run');
  };

  private onBlur = () => this.clear();

  constructor() {
    window.addEventListener('keydown', this.onKeyDown);
    window.addEventListener('keyup', this.onKeyUp);
    window.addEventListener('blur', this.onBlur);
  }

  dispose() {
    window.removeEventListener('keydown', this.onKeyDown);
    window.removeEventListener('keyup', this.onKeyUp);
    window.removeEventListener('blur', this.onBlur);
  }

  setEnabled(on: boolean) {
    if (this.enabled === on) return;
    this.enabled = on;
    this.clear();
  }

  isEnabled() {
    return this.enabled;
  }

  clear() {
    this.held.clear();
    this.virtual.clear();
    this.pressed.clear();
  }

  /** Botones táctiles. */
  setVirtual(action: Action, down: boolean) {
    if (!this.enabled) return;
    if (down) {
      if (!this.virtual.has(action)) this.pressed.add(action);
      this.virtual.add(action);
    } else {
      this.virtual.delete(action);
    }
  }

  down(action: Action) {
    if (!this.enabled) return false;
    if (action === 'run' && this.runToggle) return true;
    return this.held.has(action) || this.virtual.has(action);
  }

  /** Devuelve true una sola vez por pulsación. */
  consume(action: Action) {
    if (!this.pressed.has(action)) return false;
    this.pressed.delete(action);
    return this.enabled;
  }

  endFrame() {
    this.pressed.clear();
  }
}
