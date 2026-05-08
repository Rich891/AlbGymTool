import React, { useRef, useState, useEffect } from 'react';
import { Trash2 } from 'lucide-react';

export default function SignaturePad({ label = 'Unterschrift', onSigned }) {
  const canvasRef = useRef(null);
  const [drawing, setDrawing] = useState(false);
  const [isEmpty, setIsEmpty] = useState(true);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#ffffff08'; // transparent-ish
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  }, []);

  const getPos = (e, canvas) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    if (e.touches) {
      return {
        x: (e.touches[0].clientX - rect.left) * scaleX,
        y: (e.touches[0].clientY - rect.top) * scaleY,
      };
    }
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  const startDraw = (e) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const pos = getPos(e, canvas);
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
    setDrawing(true);
    setIsEmpty(false);
  };

  const draw = (e) => {
    if (!drawing) return;
    e.preventDefault();
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const pos = getPos(e, canvas);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
  };

  const endDraw = () => {
    if (!drawing) return;
    setDrawing(false);
    const dataUrl = canvasRef.current.toDataURL('image/png');
    onSigned?.(dataUrl);
  };

  const clear = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setIsEmpty(true);
    onSigned?.(null);
  };

  return (
    <div className="w-full">
      {label && (
        <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest block mb-2">{label}</label>
      )}
      <div className="relative rounded-2xl border-2 border-dashed border-border bg-secondary/30 overflow-hidden"
        style={{ touchAction: 'none' }}>
        <canvas
          ref={canvasRef}
          width={300}
          height={80}
          onMouseDown={startDraw}
          onMouseMove={draw}
          onMouseUp={endDraw}
          onMouseLeave={endDraw}
          onTouchStart={startDraw}
          onTouchMove={draw}
          onTouchEnd={endDraw}
          className="w-full h-32 cursor-crosshair block"
        />
        {isEmpty && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <p className="text-muted-foreground/40 text-sm select-none">Hier unterschreiben...</p>
          </div>
        )}
        {!isEmpty && (
          <button
            type="button"
            onClick={clear}
            className="absolute top-2 right-2 p-1.5 rounded-lg bg-secondary hover:bg-destructive/20 text-muted-foreground hover:text-destructive transition-all">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
      {isEmpty && (
        <p className="text-xs text-muted-foreground mt-1">Mit Maus oder Finger unterschreiben</p>
      )}
    </div>
  );
}