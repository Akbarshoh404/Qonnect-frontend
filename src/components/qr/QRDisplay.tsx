import { useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { motion } from 'framer-motion';
import { cn } from '../../utils/helpers';

interface QRDisplayProps {
  url: string;
  size?: number;
  className?: string;
}

export function QRDisplay({ url, size = 200, className }: QRDisplayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current || !url) return;

    QRCode.toCanvas(canvasRef.current, url, {
      width: size,
      margin: 2,
      color: {
        dark: '#0f172a',
        light: '#ffffff',
      },
      errorCorrectionLevel: 'H',
    }).catch(console.error);
  }, [url, size]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className={cn(
        'flex items-center justify-center p-4 bg-white rounded-2xl shadow-sm shadow-slate-900/5 ring-1 ring-slate-900/[0.06] dark:ring-white/10',
        className
      )}
      style={{ width: size + 32, height: size + 32 }}
    >
      <canvas
        ref={canvasRef}
        className="rounded-xl"
        style={{ imageRendering: 'pixelated' }}
      />
    </motion.div>
  );
}
