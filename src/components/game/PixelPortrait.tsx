import { useEffect, useRef } from 'react';
import { getSprites } from '../../game/sprites';

interface PixelPortraitProps {
  /** Id de hablante: personaje, 'narrador', 'cartel' o 'pagina'. */
  who: string;
  size?: number;
}

const SPRITE_FOR: Record<string, string> = {
  andres: 'andres',
  cunshi: 'cunshi',
  alfonso: 'alfonso',
  julio: 'julio',
  cura: 'cura',
  comunero: 'comunero1',
  comunera: 'comunera',
  comunidad: 'comunera',
};

const W = 18;
const H = 18;

function icon(ctx: CanvasRenderingContext2D, who: string) {
  const r = (x: number, y: number, w: number, h: number, c: string) => {
    ctx.fillStyle = c;
    ctx.fillRect(x, y, w, h);
  };
  if (who === 'cartel') {
    r(8, 8, 2, 9, '#1f140c');
    r(3, 3, 12, 7, '#1f140c');
    r(4, 4, 10, 5, '#7a5230');
    r(5, 5, 8, 1, '#e8d5b0');
    r(5, 7, 6, 1, '#d4b896');
    return;
  }
  if (who === 'pagina') {
    r(5, 2, 9, 13, '#5a3a22');
    r(6, 3, 7, 11, '#f2ead8');
    for (let y = 5; y < 13; y += 2) r(7, y, 5, 1, '#8c7459');
    return;
  }
  // narrador: libro abierto
  r(2, 6, 14, 8, '#1f140c');
  r(3, 7, 6, 6, '#f2ead8');
  r(9, 7, 6, 6, '#e6dcc4');
  r(8, 6, 2, 9, '#9a3a2a');
  for (let y = 8; y < 13; y += 2) {
    r(4, y, 4, 1, '#8c7459');
    r(10, y, 4, 1, '#8c7459');
  }
  r(8, 14, 2, 3, '#e8c84a');
}

/** Retrato pixel art: busto del sprite del personaje ampliado sin suavizado. */
export default function PixelPortrait({ who, size = 84 }: PixelPortraitProps) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    c.width = W;
    c.height = H;
    const ctx = c.getContext('2d')!;
    ctx.imageSmoothingEnabled = false;
    ctx.fillStyle = '#231a0e';
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = '#2d3a44';
    ctx.fillRect(0, 0, W, 9);
    ctx.fillStyle = '#3a4a50';
    ctx.fillRect(0, 9, W, 3);
    ctx.fillStyle = '#3a5a33';
    ctx.fillRect(0, 12, W, 6);
    const spriteId = SPRITE_FOR[who];
    if (spriteId) {
      const frame = getSprites()[spriteId].idle.right[0];
      const top = who === 'julio' || who === 'cura' ? 2 : 0;
      ctx.drawImage(frame, 0, top, 16, 17, 1, 1, 16, 17);
    } else {
      icon(ctx, who);
    }
  }, [who]);

  return (
    <canvas
      ref={ref}
      aria-hidden="true"
      style={{ width: size, height: size, imageRendering: 'pixelated', display: 'block' }}
    />
  );
}
