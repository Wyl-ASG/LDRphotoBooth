import React from 'react';
import { Camera, Users, Save, Loader2, Sparkles, Copy, Heart, RefreshCcw, XCircle, Star } from 'lucide-react';

import { Button } from './components/Button';
import { BoothCamera } from './components/BoothCamera';
import { BoothDecorate } from './components/BoothDecorate';
import { BoothGallery } from './components/BoothGallery';
import { useBoothController } from './hooks/useBoothController';

export default function App() {
  const {
    appState,
    errorMsg,
    joinIdInput,
    setJoinIdInput,
    photos,
    countdown,
    currentPoseIndex,
    totalPoses,
    capturedPoses,
    flash,
    layoutStyle,
    cameraFilter,
    customTitle,
    customDate,
    rawPhoto,
    stickers,
    isFinishing,
    isUploading,
    uploadSuccess,
    localVideoRef,
    remoteVideoRef,
    role,
    peerId,
    localStream,
    remoteStream,
    handleGoogleLogin,
    handleGoToGallery,
    handleOpenRoleSelect,
    handleGoHome,
    triggerSyncCountdown,
    handleLayoutChange,
    handleFilterChange,
    handleTitleChange,
    handleDateChange,
    handleAddSticker,
    handleUpdateSticker,
    handleInitiateFinish,
    handleFinishDecoratingLocal,
    handleGuestJoin,
    handleBackToBooth,
    saveToGoogleDrive,
  } = useBoothController();

  return (
    <div className="min-h-screen relative flex flex-col items-center justify-center p-4 overflow-hidden">
      <div className="absolute top-10 left-10 text-6xl text-pink-300 opacity-50 animate-float">
        <Star fill="currentColor" size={64} />
      </div>
      <div className="absolute bottom-20 right-10 text-6xl text-cyan-300 opacity-50 animate-float" style={{ animationDelay: '1s' }}>
        <Star fill="currentColor" size={48} />
      </div>
      <div className="absolute top-20 right-20 text-4xl animate-spin-slow opacity-60">✨</div>
      <div className="absolute bottom-10 left-20 text-5xl animate-spin-slow opacity-60" style={{ animationDirection: 'reverse' }}>
        🌸
      </div>

      <div className="w-full max-w-5xl glass-panel rounded-[3rem] shadow-[12px_12px_0px_rgba(255,105,180,0.3)] border-8 border-white flex flex-col min-h-[700px] relative z-10">
        <div className="bg-pink-400 p-6 flex justify-center items-center text-white relative rounded-t-[2.5rem] border-b-8 border-pink-500">
          <Heart className="absolute left-8 animate-pulse hidden sm:block text-pink-200" fill="currentColor" size={32} />
          <h1 className="text-4xl brand-font tracking-wider flex items-center gap-3 drop-shadow-md text-center">
            <Sparkles className="animate-spin-slow hidden sm:block" /> PURI-PURI BOOTH <Sparkles className="animate-spin-slow hidden sm:block" />
          </h1>
          {appState !== 'LANDING' ? (
            <button
              onClick={handleGoHome}
              className="absolute right-8 bg-pink-500 hover:bg-pink-600 text-white px-3 py-1 rounded-xl text-sm font-bold shadow transition-colors flex items-center gap-1 border-2 border-pink-300"
              title="Leave Room"
            >
              Leave
            </button>
          ) : (
            <Heart className="absolute right-8 animate-pulse hidden sm:block text-pink-200" fill="currentColor" size={32} />
          )}
        </div>

        {errorMsg && (
          <div className="bg-red-100 border-l-8 border-red-500 p-4 m-6 rounded-r-xl flex items-center gap-3 shadow-md">
            <XCircle className="text-red-500 shrink-0" size={28} />
            <p className="text-red-700 font-bold text-lg">{errorMsg}</p>
          </div>
        )}

        <div className="flex-1 flex flex-col items-center justify-center p-6 sm:p-10">
          {appState === 'LANDING' && (
            <div className="text-center space-y-10 animate-float">
              <div className="bg-white w-40 h-40 rounded-full flex items-center justify-center mx-auto border-8 border-pink-300 shadow-[8px_8px_0_#ffb6c1]">
                <Camera size={80} className="text-pink-400" />
              </div>
              <h2 className="text-4xl brand-font text-pink-500">Let's take a photo!</h2>
              <div className="flex flex-col sm:flex-row gap-6 justify-center">
                <Button icon={Save} onClick={handleGoogleLogin}>Start (Host)</Button>
                <Button icon={Users} variant="secondary" onClick={handleOpenRoleSelect}>Join Friend</Button>
              </div>
            </div>
          )}

          {appState === 'ROLE_SELECT' && (
            <div className="text-center space-y-8 w-full max-w-md bg-white p-10 rounded-3xl border-4 border-pink-200 shadow-[8px_8px_0_#ffb6c1]">
              <h2 className="text-3xl brand-font text-pink-500">Enter Room ID</h2>
              <input
                type="text"
                placeholder="e.g. booth-abc123"
                className="w-full px-6 py-4 border-4 border-pink-100 rounded-2xl outline-none text-center font-mono text-2xl text-pink-600 font-bold transition-all focus:border-pink-400 focus:shadow-[4px_4px_0_#f472b6]"
                value={joinIdInput}
                onChange={(e) => setJoinIdInput(e.target.value)}
              />
              <Button icon={RefreshCcw} onClick={handleGuestJoin} className="w-full">Connect!</Button>
              <button onClick={handleGoHome} className="text-lg text-pink-400 hover:text-pink-600 underline font-bold mt-4">Go Back</button>
            </div>
          )}

          {appState === 'HOST_WAITING' && (
            <div className="text-center space-y-8 bg-white p-10 rounded-3xl border-4 border-pink-200 shadow-[8px_8px_0_#ffb6c1]">
              <Loader2 size={64} className="text-pink-400 animate-spin mx-auto" />
              <h2 className="text-3xl brand-font text-pink-500">Waiting for friend...</h2>
              <div className="p-6 bg-pink-50 border-4 border-pink-100 rounded-2xl flex flex-col gap-4 items-center">
                <span className="text-gray-500 font-bold">Share this ID:</span>
                <div className="flex items-center gap-3">
                  <span className="font-mono text-3xl text-pink-600 font-black">{peerId || '...'}</span>
                  {peerId && (
                    <button onClick={() => navigator.clipboard.writeText(peerId)} className="bg-pink-200 text-pink-700 p-3 rounded-xl hover:bg-pink-300 transition-colors shadow-sm">
                      <Copy size={24} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {appState === 'GUEST_JOIN' && (
            <div className="text-center space-y-6">
              <Loader2 size={80} className="text-pink-400 animate-spin mx-auto" />
              <h2 className="text-4xl brand-font text-pink-500">Connecting...</h2>
            </div>
          )}

          {appState === 'BOOTH' && (
            <BoothCamera
              countdown={countdown}
              currentPoseIndex={currentPoseIndex}
              totalPoses={totalPoses}
              capturedPoses={capturedPoses}
              flash={flash}
              triggerSyncCountdown={triggerSyncCountdown}
              hasPhotos={photos.length > 0}
              onGoToGallery={handleGoToGallery}
              layoutStyle={layoutStyle}
              onLayoutChange={handleLayoutChange}
              cameraFilter={cameraFilter}
              onFilterChange={handleFilterChange}
              customTitle={customTitle}
              onTitleChange={handleTitleChange}
              customDate={customDate}
              onDateChange={handleDateChange}
              localStream={localStream}
              remoteStream={remoteStream}
              role={role}
              localVideoRef={localVideoRef}
              remoteVideoRef={remoteVideoRef}
            />
          )}

          {appState === 'DECORATE' && (
            <BoothDecorate
              basePhotoUrl={rawPhoto}
              stickers={stickers}
              onAddSticker={handleAddSticker}
              onUpdateSticker={handleUpdateSticker}
              onFinish={handleFinishDecoratingLocal}
              isFinishing={isFinishing}
              onInitiateFinish={handleInitiateFinish}
            />
          )}

          {appState === 'GALLERY' && (
            <BoothGallery
              photos={photos}
              role={role}
              isUploading={isUploading}
              uploadSuccess={uploadSuccess}
              onBackToBooth={handleBackToBooth}
              onSaveToDrive={saveToGoogleDrive}
            />
          )}
        </div>
      </div>
    </div>
  );
}