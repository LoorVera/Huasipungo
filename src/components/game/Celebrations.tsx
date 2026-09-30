import { useMemo } from 'react';

export type CelebrationKind = 'mission' | 'activity' | 'level' | 'achievement' | 'final';

export interface Celebration {
  id: number;
  kind: CelebrationKind;
  kicker: string;
  title: string;
  sub?: string;
  xp?: number;
  emoji?: string;
}

export interface Toast {
  id: number;
  text: string;
  detail?: string;
}

function Stars({ seed }: { seed: number }) {
  const stars = useMemo(
    () =>
      Array.from({ length: 16 }, (_, i) => {
        const a = (i / 16) * Math.PI * 2 + seed;
        const r = 120 + ((i * 37) % 60);
        return { dx: Math.cos(a) * r, dy: Math.sin(a) * r * 0.55, delay: (i % 4) * 0.06 };
      }),
    [seed],
  );
  return (
    <div className="absolute left-1/2 top-1/2" aria-hidden="true">
      {stars.map((s, i) => (
        <span
          key={i}
          className="px-star"
          style={{ ['--dx' as string]: `${s.dx}px`, ['--dy' as string]: `${s.dy}px`, animationDelay: `${s.delay}s` }}
        />
      ))}
    </div>
  );
}

/** Capa de celebraciones: un anuncio grande a la vez y avisos de XP simultáneos. */
export default function Celebrations({ current, toasts }: { current: Celebration | null; toasts: Toast[] }) {
  return (
    <>
      {current && current.kind !== 'achievement' && (
        <div key={current.id} className="pointer-events-none fixed inset-x-0 top-[26%] z-[80] flex justify-center px-3 animate-px-banner" role="status" aria-live="assertive">
          <div className="relative w-full max-w-[640px]">
            <Stars seed={current.id} />
            <div
              className="relative px-5 py-4 sm:py-5 text-center overflow-hidden"
              style={{
                background: 'rgba(12,9,4,0.9)',
                boxShadow: '0 0 0 3px #0c0904, 0 0 0 6px #c9a227, 0 0 0 9px #3a2810, 0 14px 0 rgba(0,0,0,0.45)',
              }}
            >
              <div className="absolute inset-0 px-shine" aria-hidden="true" />
              <p className="relative font-pixel text-xs sm:text-sm tracking-[0.35em] uppercase" style={{ color: '#c9a227' }}>
                {current.emoji ? `${current.emoji} ` : ''}
                {current.kicker}
              </p>
              <p className="relative px-title text-3xl sm:text-5xl leading-tight my-1">{current.title}</p>
              {current.sub && (
                <p className="relative font-body text-sm sm:text-base" style={{ color: '#e8d5b0' }}>
                  {current.sub}
                </p>
              )}
              {!!current.xp && (
                <p className="relative font-pixel text-2xl sm:text-3xl mt-1" style={{ color: '#f3dc8a', textShadow: '2px 2px 0 #7a6118' }}>
                  +{current.xp} XP
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {current && current.kind === 'achievement' && (
        <div key={current.id} className="pointer-events-none fixed inset-x-0 top-24 z-[80] flex justify-center px-3 animate-px-slide" role="status" aria-live="polite">
          <div className="px-box px-box-gold flex items-center gap-3 px-4 py-2.5" style={{ background: 'rgba(23,16,10,0.95)' }}>
            <span className="text-3xl" aria-hidden="true">{current.emoji ?? '🏆'}</span>
            <div>
              <p className="font-pixel text-[11px] tracking-[0.3em] uppercase" style={{ color: '#c9a227' }}>{current.kicker}</p>
              <p className="font-pixel text-lg leading-tight" style={{ color: '#f2ead8' }}>{current.title}</p>
              {current.sub && <p className="font-body text-xs" style={{ color: '#b99a74' }}>{current.sub}</p>}
            </div>
          </div>
        </div>
      )}

      <div className="pointer-events-none fixed right-3 bottom-28 sm:bottom-6 z-[70] flex flex-col items-end gap-1.5">
        {toasts.map(t => (
          <div key={t.id} className="animate-px-rise font-pixel text-base sm:text-lg" style={{ color: '#f3dc8a', textShadow: '2px 2px 0 #0c0904, -1px -1px 0 #0c0904' }}>
            {t.text}
            {t.detail && <span className="font-pixel text-xs ml-1.5" style={{ color: '#e8d5b0' }}>· {t.detail}</span>}
          </div>
        ))}
      </div>
    </>
  );
}
