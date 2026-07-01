import { useEffect, useRef } from 'react';
import { RoundStatus } from '@ruleta/shared';

interface Props {
  status: RoundStatus;
  winningNumber?: number | null;
  winningColorHex?: string | null;
}

// 19 segmentos (0-18), colores alternados
const SEGMENT_COLORS = [
  '#00C851', // 0 Verde
  '#FF4444', // 1 Rojo
  '#222222', // 2 Negro
  '#FF4444', // 3
  '#222222', // 4
  '#FF4444', // 5
  '#222222', // 6
  '#FF4444', // 7
  '#222222', // 8
  '#FF4444', // 9
  '#222222', // 10
  '#FF4444', // 11
  '#222222', // 12
  '#FF4444', // 13
  '#222222', // 14
  '#FF4444', // 15
  '#222222', // 16
  '#FF4444', // 17
  '#222222', // 18
];

export function RouletteWheel({ status, winningNumber, winningColorHex }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const angleRef = useRef(0);
  const spinRef = useRef(false);
  const rafRef = useRef(0);

  const TOTAL = 19;
  const ARC = (2 * Math.PI) / TOTAL;

  const draw = (angle: number, highlight: number | null = null) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    const r = cx - 4;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Outer glow
    const grd = ctx.createRadialGradient(cx, cy, r * 0.7, cx, cy, r);
    grd.addColorStop(0, 'rgba(255,215,0,0.08)');
    grd.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = grd;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, 2 * Math.PI);
    ctx.fill();

    for (let i = 0; i < TOTAL; i++) {
      const start = angle + i * ARC;
      const end = start + ARC;
      const color = SEGMENT_COLORS[i];
      const isHighlighted = highlight === i;

      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, r, start, end);
      ctx.closePath();
      ctx.fillStyle = isHighlighted ? '#FFD700' : color;
      ctx.fill();
      ctx.strokeStyle = isHighlighted ? '#FFD700' : 'rgba(255,255,255,0.12)';
      ctx.lineWidth = isHighlighted ? 3 : 1;
      ctx.stroke();

      // Número
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(start + ARC / 2);
      ctx.textAlign = 'right';
      ctx.fillStyle = isHighlighted ? '#000' : '#fff';
      ctx.font = `bold ${r * 0.11}px Inter, sans-serif`;
      ctx.fillText(String(i), r * 0.82, r * 0.04);
      ctx.restore();
    }

    // Centro
    ctx.beginPath();
    ctx.arc(cx, cy, r * 0.12, 0, 2 * Math.PI);
    ctx.fillStyle = '#0a0a0a';
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,215,0,0.4)';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Puntero (arriba)
    ctx.beginPath();
    ctx.moveTo(cx, cy - r - 6);
    ctx.lineTo(cx - 10, cy - r + 14);
    ctx.lineTo(cx + 10, cy - r + 14);
    ctx.closePath();
    ctx.fillStyle = '#FFD700';
    ctx.fill();
  };

  // Spin animation
  useEffect(() => {
    const isSpinning = status === RoundStatus.DRAWING;
    spinRef.current = isSpinning;

    if (isSpinning) {
      let speed = 0.18;
      const animate = () => {
        if (!spinRef.current) return;
        angleRef.current += speed;
        draw(angleRef.current, null);
        rafRef.current = requestAnimationFrame(animate);
      };
      rafRef.current = requestAnimationFrame(animate);
    } else {
      cancelAnimationFrame(rafRef.current);
      const hl = winningNumber != null ? winningNumber : null;
      draw(angleRef.current, hl);
    }

    return () => cancelAnimationFrame(rafRef.current);
  }, [status, winningNumber]);

  // Initial draw
  useEffect(() => {
    draw(0, null);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      width={380}
      height={380}
      className="drop-shadow-[0_0_40px_rgba(255,215,0,0.2)]"
    />
  );
}
