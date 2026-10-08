import { useCallback, useEffect, useRef, useState } from 'react';
import { HABLANTES, type DialogLine, type Pregunta } from '../../data/dialogos';
import { audio } from '../../game/audio';
import PixelPortrait from './PixelPortrait';
import { tr } from '../../i18n';

interface DialogBoxProps {
  lines: DialogLine[];
  /** Pregunta que hace el personaje al terminar (opcional). */
  question?: Pregunta | null;
  /** Quién formula la pregunta (para el retrato). */
  asker?: string;
  /** XP que da la respuesta correcta (solo para mostrarlo). */
  questionXP?: number;
  textSpeed: 'lenta' | 'normal' | 'rapida';
  onAnswer?: (correct: boolean) => void;
  /** completed = true si se leyó hasta el final. */
  onClose: (completed: boolean) => void;
}

const SPEED = { lenta: 42, normal: 24, rapida: 9 };
const PITCH: Record<string, number> = {
  andres: 0.9, cunshi: 1.35, alfonso: 0.75, julio: 0.7, cura: 0.8,
  comunero: 0.95, comunera: 1.25, narrador: 1.05, cartel: 1.1, pagina: 1.2,
};

type Phase = 'lines' | 'question' | 'feedback';

export default function DialogBox({ lines, question, asker, questionXP = 50, textSpeed, onAnswer, onClose }: DialogBoxProps) {
  const [idx, setIdx] = useState(0);
  const [shown, setShown] = useState(0);
  const [phase, setPhase] = useState<Phase>('lines');
  const [sel, setSel] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const options = useRef<string[]>([]);

  const line = lines[Math.min(idx, lines.length - 1)];
  const text = phase === 'lines' ? tr(line.text) : phase === 'question' ? tr(question?.pregunta ?? '') : '';
  const typing = phase !== 'feedback' && shown < text.length;
  const who = phase === 'lines' ? line.who : asker ?? line.who;
  const speaker = HABLANTES[who] ?? HABLANTES.narrador;
  const name = phase === 'lines' && line.name ? line.name : tr(speaker.nombre);

  // Opciones en orden aleatorio (una vez por pregunta).
  if (question && options.current.length === 0) {
    options.current = [...question.opciones].sort(() => Math.random() - 0.5);
  }

  // Efecto máquina de escribir
  useEffect(() => {
    if (!typing) return;
    const id = window.setTimeout(() => {
      setShown(s => Math.min(text.length, s + 1));
      if (shown % 2 === 0) audio.play('blip', PITCH[who] ?? 1);
    }, SPEED[textSpeed]);
    return () => clearTimeout(id);
  }, [typing, shown, text, textSpeed, who]);

  const advance = useCallback(() => {
    if (phase === 'lines') {
      if (shown < text.length) {
        setShown(text.length);
        return;
      }
      if (idx < lines.length - 1) {
        setIdx(i => i + 1);
        setShown(0);
        return;
      }
      if (question) {
        setPhase('question');
        setShown(0);
        setSel(0);
        return;
      }
      audio.play('close');
      onClose(true);
      return;
    }
    if (phase === 'question') {
      if (shown < text.length) setShown(text.length);
      return;
    }
    audio.play('close');
    onClose(true);
  }, [phase, shown, text, idx, lines.length, question, onClose]);

  const choose = useCallback(
    (opt: string) => {
      if (!question || phase !== 'question') return;
      const ok = opt === question.correcta;
      setPicked(opt);
      setPhase('feedback');
      audio.play(ok ? 'correct' : 'wrong');
      onAnswer?.(ok);
    },
    [question, phase, onAnswer],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.repeat) return;
      const k = e.key.toLowerCase();
      if (k === 'escape') {
        e.preventDefault();
        audio.play('back');
        // Cuenta como leído si ya se llegó a la última línea (o a la pregunta).
        const readAll = phase !== 'lines' || (idx === lines.length - 1 && shown >= text.length);
        onClose(readAll);
        return;
      }
      if (phase === 'question' && !typing) {
        const n = Number(e.key);
        if (n >= 1 && n <= options.current.length) {
          e.preventDefault();
          choose(options.current[n - 1]);
          return;
        }
        if (k === 'arrowdown' || k === 's') {
          e.preventDefault();
          setSel(s => (s + 1) % options.current.length);
          audio.play('select');
          return;
        }
        if (k === 'arrowup' || k === 'w') {
          e.preventDefault();
          setSel(s => (s - 1 + options.current.length) % options.current.length);
          audio.play('select');
          return;
        }
        if (k === 'enter' || k === ' ' || k === 'e') {
          e.preventDefault();
          choose(options.current[sel]);
          return;
        }
        return;
      }
      if (k === 'e' || k === ' ' || k === 'enter') {
        e.preventDefault();
        advance();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [phase, typing, sel, advance, choose, onClose, idx, lines.length, shown, line]);

  const correct = picked !== null && picked === question?.correcta;

  return (
    <div
      className="fixed inset-x-0 z-[55] flex justify-center px-2"
      style={{ bottom: 'calc(env(safe-area-inset-bottom, 0px) + 12px)' }}
      role="dialog"
      aria-modal="false"
      aria-label={`${tr('Diálogo', 'Dialogue')}: ${name}`}
    >
      <div
        className="px-box px-box-gold px-box-glass w-full max-w-[760px] flex gap-3 sm:gap-4 p-3 sm:p-4 cursor-pointer animate-px-pop"
        onClick={() => (phase === 'question' && !typing ? undefined : advance())}
      >
        <div className="flex-shrink-0 self-start" style={{ boxShadow: '0 0 0 2px #0c0904, 0 0 0 4px #7a6118' }}>
          <PixelPortrait who={who} size={72} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="inline-block px-2 py-0.5 mb-1.5 font-pixel text-sm tracking-wider" style={{ background: speaker.color, color: '#f2ead8', boxShadow: '0 0 0 2px #0c0904' }}>
            {name}
          </div>

          {phase !== 'feedback' && (
            <p className="font-body text-[15px] sm:text-base leading-snug min-h-[3.2em]" style={{ color: '#f2ead8' }} aria-live="polite">
              {text.slice(0, shown)}
              {typing && <span className="animate-px-blink" style={{ color: '#e8c84a' }}>▌</span>}
            </p>
          )}

          {phase === 'question' && !typing && (
            <div className="mt-2 grid gap-1.5" role="group" aria-label={tr('Opciones de respuesta', 'Answer options')}>
              {options.current.map((opt, i) => (
                <button
                  key={opt}
                  onClick={e => {
                    e.stopPropagation();
                    choose(opt);
                  }}
                  onMouseEnter={() => setSel(i)}
                  className={`px-menu-item !text-sm !normal-case !tracking-normal !py-1.5 ${sel === i ? 'selected' : ''}`}
                  style={{ fontFamily: 'var(--font-body)', fontWeight: 600 }}
                >
                  <span className="px-key text-xs">{i + 1}</span>
                  <span>{tr(opt)}</span>
                </button>
              ))}
            </div>
          )}

          {phase === 'feedback' && question && (
            <div aria-live="polite">
              <p className="font-pixel text-lg mb-1" style={{ color: correct ? '#8fd08a' : '#e08a70' }}>
                {correct ? tr(`✔ ¡Correcto! +${questionXP} XP`, `✔ Correct! +${questionXP} XP`) : tr('✘ No es correcto', '✘ Not quite')}
              </p>
              {!correct && (
                <p className="font-body text-sm mb-1" style={{ color: '#e8d5b0' }}>
                  {tr('Respuesta', 'Answer')}: <b style={{ color: '#e8c84a' }}>{tr(question.correcta)}</b>
                </p>
              )}
              <p className="font-body text-sm leading-snug" style={{ color: '#d4b896' }}>{tr(question.explicacion)}</p>
              {!correct && (
                <p className="font-body text-xs mt-1" style={{ color: '#8c7459' }}>{tr('Vuelve a hablar con este personaje para intentarlo otra vez.', 'Talk to this character again to have another try.')}</p>
              )}
            </div>
          )}

          {!typing && phase !== 'question' && (
            <div className="flex justify-end mt-1">
              <span className="font-pixel text-xs animate-px-bob" style={{ color: '#e8c84a' }}>
                ▼ <span className="hidden sm:inline">{tr('E / ESPACIO', 'E / SPACE')}</span>
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
