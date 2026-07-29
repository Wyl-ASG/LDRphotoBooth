import React, { useEffect, useRef } from 'react';
import { Camera, Image as ImageIcon, Columns, Rows, PictureInPicture, Wand2 } from 'lucide-react';
import { Button } from './Button';
import { BOOTH_PROTOCOL } from '../utils/boothProtocol';

export const BoothCamera = ({ 
  countdown, 
  flash, 
  triggerSyncCountdown, 
  hasPhotos, 
  onGoToGallery,
  layoutStyle,
  onLayoutChange,
  cameraFilter,
  onFilterChange,
  localStream,
  remoteStream,
  role
}) => {
  // Keep display refs separate so each stream stays attached to the right video element.
  const displayLocalVideoRef = useRef(null);
  const displayRemoteVideoRef = useRef(null);

  useEffect(() => {
    if (displayLocalVideoRef.current && localStream) displayLocalVideoRef.current.srcObject = localStream;
    if (displayRemoteVideoRef.current && remoteStream) displayRemoteVideoRef.current.srcObject = remoteStream;
  }, [localStream, remoteStream]);

  const getFilterStyle = () => {
    switch (cameraFilter) {
      case 'kawaii': return 'brightness(1.15) saturate(1.3) contrast(1.05) sepia(0.2) hue-rotate(-5deg)';
      case 'vintage': return 'sepia(0.7) contrast(1.1) brightness(0.9)';
      case 'bnw': return 'grayscale(1) contrast(1.2)';
      default: return 'none';
    }
  };

  const video1 = role === 'host' ? displayLocalVideoRef : displayRemoteVideoRef;
  const video2 = role === 'guest' ? displayLocalVideoRef : displayRemoteVideoRef;
  const activeLayoutButtonClass = 'bg-pink-100 text-pink-600';
  const inactiveLayoutButtonClass = 'text-gray-400 hover:bg-gray-50';

  return (
    <div className="flex flex-col items-center w-full relative animate-fade-in">
      
      <div className="flex flex-wrap justify-center gap-4 mb-4">
        <div className="flex gap-2 bg-white p-2 rounded-xl shadow-sm border border-pink-200">
          {BOOTH_PROTOCOL.layouts.map((layout) => {
            const Icon = layout.value === 'split-horizontal'
              ? Columns
              : layout.value === 'split-vertical'
                ? Rows
                : PictureInPicture;

            return (
              <button
                key={layout.value}
                onClick={() => onLayoutChange(layout.value)}
                className={`p-2 rounded-lg transition-colors ${layoutStyle === layout.value ? activeLayoutButtonClass : inactiveLayoutButtonClass}`}
                aria-label={layout.label}
              >
                <Icon size={20} />
              </button>
            );
          })}
        </div>

        <div className="flex gap-2 bg-white p-2 rounded-xl shadow-sm border border-pink-200 items-center px-4">
          <Wand2 size={18} className="text-pink-400 mr-2" />
          <select value={cameraFilter} onChange={(e) => onFilterChange(e.target.value)} className="bg-transparent text-gray-600 font-bold outline-none cursor-pointer">
            {BOOTH_PROTOCOL.filters.map((filter) => (
              <option key={filter.value} value={filter.value}>
                {filter.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="relative w-full aspect-[4/3] max-w-3xl bg-pink-50 rounded-2xl overflow-hidden border-4 border-white mb-6 shadow-inner flex" style={{ padding: '24px', backgroundColor: '#fff0f5' }}>
        {layoutStyle === 'split-horizontal' && (
          <div className="w-full h-full flex gap-4">
             <video ref={video1} autoPlay playsInline muted style={{ filter: getFilterStyle(), transform: 'scaleX(-1)' }} className="w-1/2 h-full object-cover rounded-[20px] border-[12px] border-white" />
             <video ref={video2} autoPlay playsInline muted style={{ filter: getFilterStyle(), transform: 'scaleX(-1)' }} className="w-1/2 h-full object-cover rounded-[20px] border-[12px] border-white" />
          </div>
        )}
        {layoutStyle === 'split-vertical' && (
          <div className="w-full h-full flex flex-col gap-4">
             <video ref={video1} autoPlay playsInline muted style={{ filter: getFilterStyle(), transform: 'scaleX(-1)' }} className="w-full h-1/2 object-cover rounded-[20px] border-[12px] border-white" />
             <video ref={video2} autoPlay playsInline muted style={{ filter: getFilterStyle(), transform: 'scaleX(-1)' }} className="w-full h-1/2 object-cover rounded-[20px] border-[12px] border-white" />
          </div>
        )}
        {layoutStyle === 'pip' && (
          <div className="w-full h-full relative">
             <video ref={video1} autoPlay playsInline muted style={{ filter: getFilterStyle(), transform: 'scaleX(-1)' }} className="w-full h-full object-cover rounded-[20px] border-[12px] border-white" />
             <video ref={video2} autoPlay playsInline muted style={{ filter: getFilterStyle(), transform: 'scaleX(-1)' }} className="absolute bottom-4 right-4 w-1/3 aspect-[4/3] object-cover rounded-[16px] border-[6px] border-white shadow-lg" />
          </div>
        )}

        <div className="absolute bottom-4 w-full text-center left-0 z-10">
          <span className="font-black text-3xl text-pink-500 font-['M_PLUS_Rounded_1c'] drop-shadow-[0_2px_2px_rgba(255,255,255,1)]" style={{ WebkitTextStroke: '1px white' }}>
             ✨ PURI-PURI BOOTH ✨
          </span>
        </div>

        {countdown !== null && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 z-20 rounded-2xl">
            <span className="text-9xl font-black text-white drop-shadow-[0_0_20px_rgba(251,113,133,0.8)] animate-bounce">{countdown}</span>
          </div>
        )}
        
        {flash && <div className="absolute inset-0 bg-white z-30 opacity-100 animate-pulse rounded-2xl"></div>}
      </div>
      
      <div className="flex gap-4">
        <Button icon={Camera} onClick={triggerSyncCountdown} className="px-10 py-4 text-lg">
          Take Photo
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