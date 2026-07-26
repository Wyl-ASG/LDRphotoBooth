import React from 'react';
import { Camera, Image as ImageIcon, Columns, Rows, PictureInPicture, Wand2 } from 'lucide-react';
import { Button } from './Button';

export const BoothCamera = ({ 
  canvasRef, 
  countdown, 
  flash, 
  triggerSyncCountdown, 
  hasPhotos, 
  onGoToGallery,
  layoutStyle,
  onLayoutChange,
  cameraFilter,
  onFilterChange
}) => {
  return (
    <div className="flex flex-col items-center w-full relative animate-fade-in">
      
      {/* Top Toolbars */}
      <div className="flex flex-wrap justify-center gap-6 mb-6">
        
        {/* Layout Selector */}
        <div className="flex gap-2 bg-white p-2 rounded-2xl border-4 border-pink-200 shadow-[4px_4px_0_#ffb6c1]">
          <button onClick={() => onLayoutChange('split-horizontal')} className={`p-3 rounded-xl transition-colors ${layoutStyle === 'split-horizontal' ? 'bg-pink-400 text-white' : 'text-pink-300 hover:bg-pink-50'}`}><Columns size={24} /></button>
          <button onClick={() => onLayoutChange('split-vertical')} className={`p-3 rounded-xl transition-colors ${layoutStyle === 'split-vertical' ? 'bg-pink-400 text-white' : 'text-pink-300 hover:bg-pink-50'}`}><Rows size={24} /></button>
          <button onClick={() => onLayoutChange('pip')} className={`p-3 rounded-xl transition-colors ${layoutStyle === 'pip' ? 'bg-pink-400 text-white' : 'text-pink-300 hover:bg-pink-50'}`}><PictureInPicture size={24} /></button>
        </div>

        {/* Filter Selector */}
        <div className="flex gap-3 bg-white p-2 rounded-2xl border-4 border-pink-200 shadow-[4px_4px_0_#ffb6c1] items-center px-6">
          <Wand2 size={24} className="text-pink-400" />
          <select 
            value={cameraFilter} 
            onChange={(e) => onFilterChange(e.target.value)}
            className="bg-transparent text-pink-600 font-bold text-lg outline-none cursor-pointer appearance-none"
          >
            <option value="none">Normal</option>
            <option value="kawaii">🌸 Kawaii</option>
            <option value="vintage">🎞️ Vintage</option>
            <option value="bnw">🖤 B&W</option>
          </select>
        </div>
      </div>

      <div className="relative w-full aspect-[4/3] max-w-4xl bg-white rounded-[2rem] overflow-hidden border-8 border-pink-100 mb-8 shadow-lg">
        <canvas 
          ref={canvasRef} 
          width={1280} 
          height={960} 
          className="w-full h-full object-contain bg-black" 
        />
        
        {countdown !== null && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/30 z-20 backdrop-blur-sm">
            <span className="text-[12rem] font-black text-white drop-shadow-[0_0_30px_rgba(255,105,180,1)] animate-bounce brand-font">
              {countdown}
            </span>
          </div>
        )}
        
        {flash && <div className="absolute inset-0 z-30 animate-camera-flash"></div>}
      </div>
      
      <div className="flex flex-col sm:flex-row gap-6">
        <Button icon={Camera} onClick={triggerSyncCountdown} className="px-12 py-5 text-2xl" variant="accent">
          Snap Photo!
        </Button>
        {hasPhotos && (
          <Button icon={ImageIcon} variant="secondary" onClick={onGoToGallery}>
            Gallery
          </Button>
        )}
      </div>
    </div>
  );
};

export default BoothCamera;