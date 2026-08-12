import React, { useEffect, useState } from 'react';
import { Camera, Image as ImageIcon, Wand2, LayoutGrid, Sparkles } from 'lucide-react';
import { Button } from './Button';
import { BOOTH_PROTOCOL } from '../utils/boothProtocol';
import { getLayoutById } from '../utils/layoutsConfig';
import { LayoutPickerModal } from './LayoutPicker';

export const BoothCamera = ({
  countdown,
  isTakingPhotos = false,
  currentPoseIndex = 0,
  totalPoses = 1,
  flash,
  triggerSyncCountdown,
  hasPhotos,
  onGoToGallery,
  layoutStyle,
  onLayoutChange,
  cameraFilter,
  onFilterChange,
  customTitle,
  onTitleChange,
  customDate,
  onDateChange,
  localStream,
  remoteStream,
  role,
  localVideoRef,
  remoteVideoRef,
  capturedPoses = [],
}) => {
  const [isLayoutPickerOpen, setIsLayoutPickerOpen] = useState(false);
  const layout = getLayoutById(layoutStyle);
  const isBusy = countdown !== null || isTakingPhotos;

  useEffect(() => {
    if (localVideoRef?.current && localStream && localVideoRef.current.srcObject !== localStream) {
      localVideoRef.current.srcObject = localStream;
      localVideoRef.current.play().catch((err) => console.warn('Local video play failed:', err));
    }
    if (remoteVideoRef?.current && remoteStream && remoteVideoRef.current.srcObject !== remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
      remoteVideoRef.current.play().catch((err) => console.warn('Remote video play failed:', err));
    }
  }, [localStream, remoteStream, localVideoRef, remoteVideoRef, layoutStyle]);

  const getFilterStyle = () => {
    switch (cameraFilter) {
      case 'kawaii':
        return 'brightness(1.15) saturate(1.3) contrast(1.05) sepia(0.2) hue-rotate(-5deg)';
      case 'vintage':
        return 'sepia(0.7) contrast(1.1) brightness(0.9)';
      case 'bnw':
        return 'grayscale(1) contrast(1.2)';
      default:
        return 'none';
    }
  };

  const video1Stream = role === 'host' ? localStream : remoteStream;
  const video2Stream = role === 'guest' ? localStream : remoteStream;

  return (
    <div className="flex flex-col items-center w-full relative animate-fade-in">
      {/* Hidden persistent video elements to ensure stream capture is never interrupted */}
      <div className="hidden" aria-hidden="true">
        <video ref={localVideoRef} autoPlay playsInline muted />
        <video ref={remoteVideoRef} autoPlay playsInline muted />
      </div>

      {/* Top Toolbar */}
      <div className="flex flex-wrap justify-center items-center gap-3 mb-6 w-full max-w-3xl">
        {/* Layout Picker Trigger */}
        <button
          onClick={() => setIsLayoutPickerOpen(true)}
          disabled={isBusy}
          className="flex items-center gap-2 bg-white px-4 py-2.5 rounded-2xl shadow-sm border-2 border-pink-200 hover:border-pink-400 hover:bg-pink-50 transition-all font-bold text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:border-pink-200 disabled:hover:bg-white"
        >
          <LayoutGrid size={20} className="text-pink-500" />
          <span>Layout: <strong className="text-pink-600 font-extrabold">{layout.name}</strong> ({layout.poses} {layout.poses === 1 ? 'Pose' : 'Poses'})</span>
        </button>

        {/* Camera Filter Selector */}
        <div className="flex items-center gap-2 bg-white px-4 py-2.5 rounded-2xl shadow-sm border-2 border-pink-200">
          <Wand2 size={18} className="text-pink-400" />
          <select
            value={cameraFilter}
            onChange={(e) => onFilterChange(e.target.value)}
            disabled={isBusy}
            className="bg-transparent text-gray-700 font-bold outline-none cursor-pointer disabled:cursor-not-allowed"
          >
            {BOOTH_PROTOCOL.filters.map((filter) => (
              <option key={filter.value} value={filter.value}>
                {filter.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Interactive Print Stage */}
      <div
        className={`w-full relative ${layout.type === 'strip' ? 'max-w-xs sm:max-w-sm' : layout.type === '4R-portrait' ? 'max-w-md' : 'max-w-2xl'} bg-neutral-950 rounded-2xl p-3 shadow-2xl overflow-hidden border border-neutral-800 mb-6`}
        style={{
          aspectRatio: layout.type === 'strip' ? '1/3' : layout.type === '4R-portrait' ? '2/3' : '3/2',
        }}
      >
        {/* Render headers */}
        {(layout.headers || []).map((header, idx) => (
          <div
            key={`header-${idx}`}
            className="absolute z-10 flex flex-col items-center justify-center text-center p-1 overflow-hidden"
            style={{
              left: `${header.x}%`,
              top: `${header.y}%`,
              width: `${header.w}%`,
              height: `${header.h}%`,
            }}
          >
            <span className="italic font-bold text-white text-lg sm:text-2xl drop-shadow" style={{ fontFamily: "'Great Vibes', cursive" }}>
              {customTitle || 'Groom & Bride'}
            </span>
            <span className="text-xs sm:text-sm font-semibold text-gray-300">
              {customDate || 'DD/MM/YY'}
            </span>
          </div>
        ))}

        {/* Render photo boxes */}
        {layout.boxes.map((box, idx) => {
          const isCurrentActiveBox = currentPoseIndex === box.poseIndex;
          const captured = capturedPoses[box.poseIndex];

          return (
            <div
              key={`box-${idx}`}
              className={`absolute bg-neutral-900 rounded-xl overflow-hidden flex transition-all ${
                isCurrentActiveBox && countdown !== null ? 'ring-4 ring-pink-400 scale-[1.01]' : ''
              }`}
              style={{
                left: `${box.x}%`,
                top: `${box.y}%`,
                width: `${box.w}%`,
                height: `${box.h}%`,
              }}
            >
              <div className="w-1/2 h-full relative overflow-hidden bg-pink-100 border-r border-white/20">
                {captured?.host ? (
                  <img
                    src={captured.host}
                    alt="Host captured"
                    className="w-full h-full object-cover"
                    style={{ filter: getFilterStyle(), transform: 'scaleX(-1)' }}
                  />
                ) : (
                  <video
                    ref={(el) => {
                      if (el && video1Stream && el.srcObject !== video1Stream) {
                        el.srcObject = video1Stream;
                        el.play().catch(() => {});
                      }
                    }}
                    autoPlay
                    playsInline
                    muted
                    style={{ filter: getFilterStyle(), transform: 'scaleX(-1)' }}
                    className="w-full h-full object-cover"
                  />
                )}
                <span className="absolute bottom-1 left-1 bg-black/40 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-md backdrop-blur-xs">
                  You
                </span>
              </div>

              <div className="w-1/2 h-full relative overflow-hidden bg-pink-100">
                {captured?.guest ? (
                  <img
                    src={captured.guest}
                    alt="Guest captured"
                    className="w-full h-full object-cover"
                    style={{ filter: getFilterStyle(), transform: 'scaleX(-1)' }}
                  />
                ) : (
                  <video
                    ref={(el) => {
                      if (el && video2Stream && el.srcObject !== video2Stream) {
                        el.srcObject = video2Stream;
                        el.play().catch(() => {});
                      }
                    }}
                    autoPlay
                    playsInline
                    muted
                    style={{ filter: getFilterStyle(), transform: 'scaleX(-1)' }}
                    className="w-full h-full object-cover"
                  />
                )}
                <span className="absolute bottom-1 right-1 bg-black/40 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-md backdrop-blur-xs">
                  Friend
                </span>
              </div>
            </div>
          );
        })}

        {/* Render footers */}
        {(layout.footers || []).map((footer, idx) => (
          <div
            key={`footer-${idx}`}
            className="absolute z-10 flex flex-col items-center justify-center text-center p-1 overflow-hidden"
            style={{
              left: `${footer.x}%`,
              top: `${footer.y}%`,
              width: `${footer.w}%`,
              height: `${footer.h}%`,
            }}
          >
            {footer.type === 'logo_only' ? (
              <span className="font-black text-pink-300 text-xs sm:text-sm tracking-wider">
                ✨ PURI-PURI BOOTH ✨
              </span>
            ) : footer.type === 'horizontal_bar' ? (
              <div className="w-full flex items-center justify-between px-2 text-white">
                <span className="text-xs font-bold text-gray-300">{customDate || 'DD/MM/YY'}</span>
                <span className="italic font-bold text-base sm:text-xl" style={{ fontFamily: "'Great Vibes', cursive" }}>{customTitle || 'Groom & Bride'}</span>
                <span className="text-xs font-black text-pink-300">✨ PURI-PURI BOOTH ✨</span>
              </div>
            ) : (
              <>
                <span className="italic font-bold text-white text-lg sm:text-2xl drop-shadow mb-0.5" style={{ fontFamily: "'Great Vibes', cursive" }}>
                  {customTitle || 'Groom & Bride'}
                </span>
                <span className="text-xs sm:text-sm font-semibold text-gray-300 mb-1">
                  {customDate || 'DD/MM/YY'}
                </span>
                <span className="font-black text-pink-300 text-xs tracking-wider">
                  ✨ PURI-PURI BOOTH ✨
                </span>
              </>
            )}
          </div>
        ))}

        {/* Live Countdown & Session Overlay */}
        {countdown !== null && (
          <div className="absolute inset-0 bg-black/50 backdrop-blur-xs flex flex-col items-center justify-center z-30 rounded-2xl">
            <div className="bg-pink-500 text-white px-6 py-2 rounded-full font-black text-lg mb-4 shadow-lg flex items-center gap-2 animate-bounce">
              <Sparkles size={20} /> Pose {currentPoseIndex + 1} of {totalPoses} <Sparkles size={20} />
            </div>
            <span className="text-9xl font-black text-white drop-shadow-[0_0_30px_rgba(236,72,153,0.9)] animate-pulse">
              {countdown}
            </span>
          </div>
        )}

        {/* Camera Flash Overlay */}
        {flash && <div className="absolute inset-0 bg-white z-40 animate-pulse rounded-2xl" />}
      </div>

      {/* Bottom Action Controls */}
      <div className="flex flex-wrap justify-center gap-4">
        <Button
          icon={Camera}
          onClick={triggerSyncCountdown}
          disabled={isBusy}
          className="px-10 py-4 text-lg"
        >
          {isBusy
            ? `Taking Pose ${currentPoseIndex + 1} of ${layout.poses}...`
            : `Start Session (${layout.poses} ${layout.poses === 1 ? 'Pose' : 'Poses'})`}
        </Button>

        {hasPhotos && (
          <Button icon={ImageIcon} variant="secondary" onClick={onGoToGallery} disabled={isBusy}>
            Gallery
          </Button>
        )}
      </div>

      {/* Layout Picker Modal */}
      <LayoutPickerModal
        isOpen={isLayoutPickerOpen}
        onClose={() => setIsLayoutPickerOpen(false)}
        selectedLayoutId={layoutStyle}
        onSelectLayout={onLayoutChange}
        customTitle={customTitle}
        onTitleChange={onTitleChange}
        customDate={customDate}
        onDateChange={onDateChange}
      />
    </div>
  );
};