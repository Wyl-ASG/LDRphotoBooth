import React, { useRef, useEffect, useState } from 'react';
import { CheckCircle } from 'lucide-react';
import { Button } from './Button';

const STAMPS = ['🐱', '🐰', '🎀', '✨', '💖', '👑', '😎', '⭐'];

export const BoothDecorate = ({ 
  basePhotoUrl, 
  stickers, 
  onAddSticker, 
  onUpdateSticker, 
  onFinish,
  isFinishing,
  onInitiateFinish
}) => {
  const canvasRef = useRef(null);
  const [dragState, setDragState] = useState({ id: null, x: 0, y: 0 });
  const [bgImg, setBgImg] = useState(null);
  const lastSyncRef = useRef(0);
  const dragStateRef = useRef(dragState);
  const rafRef = useRef(null);

  useEffect(() => {
    dragStateRef.current = dragState;
  }, [dragState]);

  /* Load the background photo into an offscreen image before drawing the canvas. */
  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      setBgImg(img);
    };
    img.src = basePhotoUrl;

    return () => {
      img.onload = null;
    };
  }, [basePhotoUrl]);

  /* Redraw the composition whenever the photo or sticker state changes. */
  useEffect(() => {
    if (!bgImg || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);

    stickers.forEach(sticker => {
      ctx.font = `${sticker.size}px Arial`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      const isDraggingThis = dragState.id === sticker.id;
      const drawX = isDraggingThis ? dragState.x : sticker.x;
      const drawY = isDraggingThis ? dragState.y : sticker.y;
      
      ctx.fillText(sticker.emoji, drawX, drawY);
    });
  }, [bgImg, stickers, dragState]);

  /* Export the final decorated image once the finish signal arrives. */
  useEffect(() => {
    if (isFinishing && canvasRef.current) {
      const finalDataUrl = canvasRef.current.toDataURL('image/jpeg', 0.85);
      onFinish(finalDataUrl);
    }
  }, [isFinishing, onFinish]);

  /* Translate pointer coordinates into canvas space for sticker dragging. */
  const handlePointerDown = (e) => {
    if (!canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const scaleX = canvasRef.current.width / rect.width;
    const scaleY = canvasRef.current.height / rect.height;
    
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    for (let i = stickers.length - 1; i >= 0; i--) {
      const s = stickers[i];
      if (Math.abs(s.x - x) < s.size / 2 && Math.abs(s.y - y) < s.size / 2) {
        setDragState({ id: s.id, x, y });
        canvasRef.current.setPointerCapture(e.pointerId);
        return;
      }
    }
  };

  const handlePointerMove = (e) => {
    if (!dragStateRef.current.id || !canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const scaleX = canvasRef.current.width / rect.width;
    const scaleY = canvasRef.current.height / rect.height;
    
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    dragStateRef.current = { ...dragStateRef.current, x, y };

    if (rafRef.current === null) {
      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = null;
        setDragState({ ...dragStateRef.current });
      });
    }

    const now = Date.now();
    // Limit sync traffic while dragging so peers stay responsive.
    if (now - lastSyncRef.current > 50) {
      onUpdateSticker(dragStateRef.current.id, { x, y });
      lastSyncRef.current = now;
    }
  };

  const handlePointerUp = (e) => {
    if (canvasRef.current && e?.pointerId !== undefined) {
      canvasRef.current.releasePointerCapture(e.pointerId);
    }

    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }

    if (dragStateRef.current.id) {
      onUpdateSticker(dragStateRef.current.id, { x: dragStateRef.current.x, y: dragStateRef.current.y });
    }
    setDragState({ id: null, x: 0, y: 0 });
    dragStateRef.current = { id: null, x: 0, y: 0 };
  };

  useEffect(() => {
    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);

  /* Render the sticker palette and the decoration canvas. */
  return (
    <div className="w-full flex flex-col items-center animate-fade-in">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">✨ Decorate Time! ✨</h2>
      
      <div className="flex flex-wrap justify-center gap-2 mb-4 bg-white p-3 rounded-2xl shadow-sm border-2 border-pink-100">
        <span className="text-sm font-bold text-gray-400 self-center mr-2 uppercase tracking-wide">Stamps</span>
        {STAMPS.map(emoji => (
          <button 
            key={emoji}
            onClick={() => onAddSticker(emoji)}
            className="text-3xl hover:scale-125 transition-transform active:scale-95 bg-pink-50 p-2 rounded-xl"
          >
            {emoji}
          </button>
        ))}
      </div>

      <div className="w-full max-w-3xl aspect-[4/3] bg-gray-100 rounded-2xl border-4 border-white shadow-lg overflow-hidden relative mb-6 cursor-crosshair">
        <canvas 
          ref={canvasRef} 
          width={1280} 
          height={960}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
          className="w-full h-full object-contain touch-none" 
        />
      </div>

      <Button icon={CheckCircle} onClick={onInitiateFinish} className="px-12">
        Finish & Save
      </Button>
      <p className="text-sm text-gray-500 mt-4 text-center">
        Both of you can drag stamps in real-time!
      </p>
    </div>
  );
};
export default BoothDecorate;