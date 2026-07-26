import React, { useRef, useEffect, useState } from 'react';
import { CheckCircle, Plus } from 'lucide-react';
import { Button } from './Button';

export const BoothDecorate = ({ 
  basePhotoUrl, 
  stickers, 
  onAddSticker, 
  onUpdateSticker, 
  onFinish 
}) => {
  const canvasRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragId, setDragId] = useState(null);

  const STAMPS = ['🐱', '🐰', '🎀', '✨', '💖', '👑', '😎', '⭐'];

  // Redraw canvas whenever stickers change
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.src = basePhotoUrl;
    img.onload = () => {
      // Draw Base Photo
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      // Draw Stickers
      // If you add image assets later, you would load them here via new Image()
      // instead of using ctx.fillText
      stickers.forEach(sticker => {
        ctx.font = `${sticker.size}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(sticker.emoji, sticker.x, sticker.y);
      });
    };
  }, [basePhotoUrl, stickers]);

  // Drag & Drop Logic
  const handlePointerDown = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const scaleX = canvasRef.current.width / rect.width;
    const scaleY = canvasRef.current.height / rect.height;
    
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    // Find if we clicked on a sticker (reverse loop to select top-most)
    for (let i = stickers.length - 1; i >= 0; i--) {
      const s = stickers[i];
      // Rough hitbox for emoji
      if (Math.abs(s.x - x) < s.size / 2 && Math.abs(s.y - y) < s.size / 2) {
        setIsDragging(true);
        setDragId(s.id);
        return;
      }
    }
  };

  const handlePointerMove = (e) => {
    if (!isDragging || dragId === null) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const scaleX = canvasRef.current.width / rect.width;
    const scaleY = canvasRef.current.height / rect.height;
    
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    onUpdateSticker(dragId, { x, y });
  };

  const handlePointerUp = () => {
    setIsDragging(false);
    setDragId(null);
  };

  const handleFinish = () => {
    // Generate final baked image and pass it up
    const finalDataUrl = canvasRef.current.toDataURL('image/jpeg', 0.9);
    onFinish(finalDataUrl);
  };

  return (
    <div className="w-full flex flex-col items-center animate-fade-in">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">✨ Decorate Time! ✨</h2>
      
      {/* Stamp Toolbar */}
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

      <Button icon={CheckCircle} onClick={handleFinish} className="px-12">
        Finish & Save
      </Button>
      <p className="text-sm text-gray-500 mt-4 text-center">
        Both of you can drag stamps around in real-time!
      </p>
    </div>
  );
};

export default BoothDecorate;