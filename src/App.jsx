import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Camera, Users, Save, Loader2, Sparkles, Copy, Heart, RefreshCcw, XCircle, Star } from 'lucide-react';

import { loadScript } from './utils/loadScript';
import { useGoogleAuth } from './hooks/useGoogleAuth';
import { useWebRTC } from './hooks/useWebRTC';
import { Button } from './components/Button';
import { BoothCamera } from './components/BoothCamera';
import { BoothDecorate } from './components/BoothDecorate';
import { BoothGallery } from './components/BoothGallery';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

export default function App() {
  const [appState, setAppState] = useState('LANDING'); 
  const [errorMsg, setErrorMsg] = useState('');
  const [joinIdInput, setJoinIdInput] = useState('');
  
  const [photos, setPhotos] = useState([]); 
  const [countdown, setCountdown] = useState(null);
  const [flash, setFlash] = useState(false);
  const [layoutStyle, setLayoutStyle] = useState('split-horizontal');
  const [cameraFilter, setCameraFilter] = useState('none');
  
  const [rawPhoto, setRawPhoto] = useState(null); 
  const [stickers, setStickers] = useState([]);
  
  const [isFinishing, setIsFinishing] = useState(false);

  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const hiddenLocalVideoRef = useRef(null);
  const hiddenRemoteVideoRef = useRef(null);

  const latestStateRef = useRef({ layoutStyle, cameraFilter });
  useEffect(() => {
    latestStateRef.current = { layoutStyle, cameraFilter };
  }, [layoutStyle, cameraFilter]);

  const base64ToBlobUrl = (base64Data, contentType = 'image/jpeg') => {
    const split = base64Data.split(',');
    const b64 = split[1] || split[0];
    const byteCharacters = atob(b64);
    const byteArrays = [];
    for (let offset = 0; offset < byteCharacters.length; offset += 512) {
      const slice = byteCharacters.slice(offset, offset + 512);
      const byteArraysChunk = new Array(slice.length);
      for (let i = 0; i < slice.length; i++) {
        byteArraysChunk[i] = slice.charCodeAt(i);
      }
      byteArrays.push(new Uint8Array(byteArraysChunk));
    }
    const blob = new Blob(byteArrays, { type: contentType });
    return URL.createObjectURL(blob);
  };

  // NEW: A dedicated function to perfectly reset the booth state and free memory
  const resetToBooth = useCallback(() => {
    setAppState('BOOTH');
    setRawPhoto(prev => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
    setStickers([]);
    setIsFinishing(false);
    setCountdown(null);
    setIsUploading(false);
    setUploadSuccess(false);
  }, []);

  const safelyUpdatePhotos = useCallback((newPhotoUrl) => {
    setPhotos(prev => {
      let newHistory = [...prev, newPhotoUrl];
      if (newHistory.length > 3) {
        URL.revokeObjectURL(newHistory[0]);
        newHistory = newHistory.slice(1);
      }
      return newHistory;
    });
  }, []);

  useEffect(() => {
    const init = async () => {
      try {
        await Promise.all([
          loadScript('https://unpkg.com/peerjs@1.5.2/dist/peerjs.min.js', 'peerjs-script'),
          loadScript('https://accounts.google.com/gsi/client', 'google-gis-script')
        ]);
      } catch (err) {}
    };
    init();
  }, []);

  const { 
    role, peerId, localStream, remoteStream, 
    startHostSession, startGuestSession, sendData, cleanupWebRTC 
  } = useWebRTC(setErrorMsg, (data) => {
    console.log(`⚡ [App] Handling Action via WebRTC:`, data.type);
    
    if (data.type === 'COUNTDOWN_TICK') setCountdown(data.count); 
    else if (data.type === 'PHOTO_TAKEN') {
      console.log("📸 [App] Received actual photo from peer.");
      triggerFlash();
      const blobUrl = base64ToBlobUrl(data.photoUrl);
      setRawPhoto(prev => {
        if (prev) URL.revokeObjectURL(prev);
        return blobUrl;
      });
      setStickers([]); 
      setIsFinishing(false);
      setAppState('DECORATE');
    }
    else if (data.type === 'BACK_TO_BOOTH') {
      console.log("🔙 [App] Returning to booth via peer command.");
      resetToBooth();
    }
    else if (data.type === 'LAYOUT_CHANGE') setLayoutStyle(data.layoutStyle);
    else if (data.type === 'FILTER_CHANGE') setCameraFilter(data.cameraFilter);
    else if (data.type === 'SYNC_STICKERS') {
      console.log("🎨 [App] Syncing stickers from peer...", data.stickers);
      setStickers(data.stickers);
    }
    else if (data.type === 'INITIATE_FINISH') {
      console.log("🏁 [App] Peer initiated FINISH. Triggering local save...");
      setIsFinishing(true);
    }
  });

  const { googleToken, handleGoogleLogin } = useGoogleAuth(
    GOOGLE_CLIENT_ID, 
    setErrorMsg, 
    () => {
      setAppState('HOST_WAITING');
      startHostSession(() => setAppState('BOOTH'));
    }
  );

  // Removed `photos` and `rawPhoto` from this array so taking a photo doesn't destroy the network!
  useEffect(() => {
    return () => {
      console.log("🧹 [App] Component unmounting, destroying WebRTC...");
      cleanupWebRTC();
    };
  }, [cleanupWebRTC]);

  useEffect(() => {
    if (hiddenLocalVideoRef.current && localStream) hiddenLocalVideoRef.current.srcObject = localStream;
    if (hiddenRemoteVideoRef.current && remoteStream) hiddenRemoteVideoRef.current.srcObject = remoteStream;
  }, [localStream, remoteStream]);

  const triggerSyncCountdown = () => {
    let count = 3;
    setCountdown(count);
    sendData({ type: 'COUNTDOWN_TICK', count });

    const interval = setInterval(() => {
      count -= 1;
      if (count > 0) {
        setCountdown(count);
        sendData({ type: 'COUNTDOWN_TICK', count });
      } else {
        clearInterval(interval);
        setCountdown(null);
        sendData({ type: 'COUNTDOWN_TICK', count: null });
        
        triggerFlash();
        // Give the browser 50ms to paint the white flash before blocking the CPU to take the photo
        setTimeout(() => {
          takePhotoAndDecorateLocal();
        }, 50);
      }
    }, 1000);
  };

  const triggerFlash = () => {
    setFlash(true);
    setTimeout(() => setFlash(false), 200);
  };

  const capturePhoto = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 1280;
    canvas.height = 960;
    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;
    
    const currentLayout = latestStateRef.current.layoutStyle;
    const currentFilter = latestStateRef.current.cameraFilter;

    ctx.fillStyle = '#fff0f5'; 
    ctx.fillRect(0, 0, w, h);

    if (currentFilter === 'kawaii') ctx.filter = 'brightness(1.15) saturate(1.3) contrast(1.05) sepia(0.2) hue-rotate(-5deg)';
    else if (currentFilter === 'vintage') ctx.filter = 'sepia(0.7) contrast(1.1) brightness(0.9)';
    else if (currentFilter === 'bnw') ctx.filter = 'grayscale(1) contrast(1.2)';
    else ctx.filter = 'none';

    const drawVideo = (videoElem, x, y, width, height) => {
      if (videoElem && videoElem.readyState >= 2) {
        const vidRatio = videoElem.videoWidth / videoElem.videoHeight;
        const targetRatio = width / height;
        let sWidth = videoElem.videoWidth, sHeight = videoElem.videoHeight, sx = 0, sy = 0;

        if (vidRatio > targetRatio) {
          sWidth = sHeight * targetRatio;
          sx = (videoElem.videoWidth - sWidth) / 2;
        } else {
          sHeight = sWidth / targetRatio;
          sy = (videoElem.videoHeight - sHeight) / 2;
        }
        ctx.save();
        ctx.translate(x + width, y);
        ctx.scale(-1, 1);
        ctx.beginPath();
        ctx.roundRect(0, 0, width, height, [20]); 
        ctx.clip();
        ctx.drawImage(videoElem, sx, sy, sWidth, sHeight, 0, 0, width, height);
        ctx.restore();
      }
    };

    const pad = 24;

    if (currentLayout === 'split-horizontal') {
      const halfW = (w / 2) - (pad * 1.5);
      const drawH = h - (pad * 2);
      drawVideo(role === 'host' ? hiddenLocalVideoRef.current : hiddenRemoteVideoRef.current, pad, pad, halfW, drawH);
      drawVideo(role === 'guest' ? hiddenLocalVideoRef.current : hiddenRemoteVideoRef.current, w / 2 + (pad / 2), pad, halfW, drawH);

      ctx.filter = 'none'; 
      ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 16;
      ctx.beginPath(); ctx.roundRect(pad, pad, halfW, drawH, [20]); ctx.stroke();
      ctx.beginPath(); ctx.roundRect(w / 2 + (pad / 2), pad, halfW, drawH, [20]); ctx.stroke();
    } 
    else if (currentLayout === 'split-vertical') {
      const drawW = w - (pad * 2);
      const halfH = (h / 2) - (pad * 1.5);
      drawVideo(role === 'host' ? hiddenLocalVideoRef.current : hiddenRemoteVideoRef.current, pad, pad, drawW, halfH);
      drawVideo(role === 'guest' ? hiddenLocalVideoRef.current : hiddenRemoteVideoRef.current, pad, h / 2 + (pad / 2), drawW, halfH);

      ctx.filter = 'none';
      ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 16;
      ctx.beginPath(); ctx.roundRect(pad, pad, drawW, halfH, [20]); ctx.stroke();
      ctx.beginPath(); ctx.roundRect(pad, h / 2 + (pad / 2), drawW, halfH, [20]); ctx.stroke();
    }
    else if (currentLayout === 'pip') {
      const drawW = w - (pad * 2);
      const drawH = h - (pad * 2);
      const pipW = drawW / 3.5;
      const pipH = drawH / 3.5;
      
      drawVideo(role === 'host' ? hiddenLocalVideoRef.current : hiddenRemoteVideoRef.current, pad, pad, drawW, drawH);
      drawVideo(role === 'guest' ? hiddenLocalVideoRef.current : hiddenRemoteVideoRef.current, w - pipW - (pad * 2), h - pipH - (pad * 2), pipW, pipH);

      ctx.filter = 'none';
      ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 16;
      ctx.beginPath(); ctx.roundRect(pad, pad, drawW, drawH, [20]); ctx.stroke();
      ctx.lineWidth = 8;
      ctx.beginPath(); ctx.roundRect(w - pipW - (pad * 2), h - pipH - (pad * 2), pipW, pipH, [16]); ctx.stroke();
    }
    
    ctx.fillStyle = '#ff69b4'; 
    ctx.font = '900 36px "M PLUS Rounded 1c", sans-serif'; 
    ctx.textAlign = 'center';
    ctx.lineWidth = 6;
    ctx.strokeStyle = 'white';
    ctx.strokeText('✨ PURI-PURI BOOTH ✨', w / 2, h - 30);
    ctx.fillText('✨ PURI-PURI BOOTH ✨', w / 2, h - 30);

    // Export at 0.75 quality to compress the file size, making network transfer instant
    return canvas.toDataURL('image/jpeg', 0.75);
  };

  const takePhotoAndDecorateLocal = () => {
    const base64Url = capturePhoto();
    const blobUrl = base64ToBlobUrl(base64Url);
    
    setRawPhoto(prev => {
      if (prev) URL.revokeObjectURL(prev);
      return blobUrl;
    });
    setStickers([]); 
    setIsFinishing(false);
    setAppState('DECORATE');
    
    console.log("📤 [App] Broadcasting actual generated photo...");
    sendData({ type: 'PHOTO_TAKEN', photoUrl: base64Url });
  };

  const handleAddSticker = (emoji) => {
    console.log(`[App] Adding sticker locally:`, emoji);
    setStickers(prev => {
      const newStickers = [...prev, { id: Date.now(), emoji, x: 640, y: 480, size: 120 }];
      sendData({ type: 'SYNC_STICKERS', stickers: newStickers });
      return newStickers;
    });
  };

  const handleUpdateSticker = (id, newProps) => {
    setStickers(prev => {
      const newStickers = prev.map(s => s.id === id ? { ...s, ...newProps } : s);
      sendData({ type: 'SYNC_STICKERS', stickers: newStickers });
      return newStickers;
    });
  };

  const handleInitiateFinish = () => {
    console.log(`🏁 [App] Local Finish Button Clicked! Broadcasting INITIATE_FINISH.`);
    setIsFinishing(true);
    sendData({ type: 'INITIATE_FINISH' });
  };

  const handleFinishDecoratingLocal = useCallback((finalBase64Url) => {
    console.log(`🖼️ [App] Local Finishing processing... Navigating to Gallery.`);
    const blobUrl = base64ToBlobUrl(finalBase64Url);
    safelyUpdatePhotos(blobUrl);
    setAppState('GALLERY');
  }, [safelyUpdatePhotos]);

  const saveToGoogleDrive = async () => {
    if (!googleToken || photos.length === 0) return;
    setIsUploading(true);
    setUploadSuccess(false);

    try {
      const blobResponse = await fetch(photos[photos.length - 1]);
      const blob = await blobResponse.blob();

      const metadata = { name: `Purikura_${Date.now()}.jpg`, mimeType: 'image/jpeg' };
      const form = new FormData();
      form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
      form.append('file', blob);

      const res = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${googleToken}` },
        body: form
      });

      if (!res.ok) throw new Error('Upload failed');
      setUploadSuccess(true);
      setTimeout(() => setUploadSuccess(false), 3000);
    } catch (err) {
      setErrorMsg(`Upload failed: ${err.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  const handleGuestJoin = async () => {
    setAppState('GUEST_JOIN');
    const success = await startGuestSession(joinIdInput, () => setAppState('BOOTH'));
    if (!success) setAppState('ROLE_SELECT');
  };

  const handleBackToBooth = () => {
    resetToBooth();
    sendData({ type: 'BACK_TO_BOOTH' });
  };

  return (
    <div className="min-h-screen relative flex flex-col items-center justify-center p-4 overflow-hidden">
      
      <video ref={hiddenLocalVideoRef} autoPlay playsInline muted className="hidden opacity-0 w-0 h-0 absolute pointer-events-none" />
      <video ref={hiddenRemoteVideoRef} autoPlay playsInline className="hidden opacity-0 w-0 h-0 absolute pointer-events-none" />

      <div className="absolute top-10 left-10 text-6xl text-pink-300 opacity-50 animate-float"><Star fill="currentColor" size={64}/></div>
      <div className="absolute bottom-20 right-10 text-6xl text-cyan-300 opacity-50 animate-float" style={{animationDelay: '1s'}}><Star fill="currentColor" size={48}/></div>
      <div className="absolute top-20 right-20 text-4xl animate-spin-slow opacity-60">✨</div>
      <div className="absolute bottom-10 left-20 text-5xl animate-spin-slow opacity-60" style={{animationDirection: 'reverse'}}>🌸</div>

      <div className="w-full max-w-5xl glass-panel rounded-[3rem] shadow-[12px_12px_0px_rgba(255,105,180,0.3)] border-8 border-white flex flex-col min-h-[700px] relative z-10">
        
        <div className="bg-pink-400 p-6 flex justify-center text-white relative rounded-t-[2.5rem] border-b-8 border-pink-500">
          <Heart className="absolute left-8 animate-pulse hidden sm:block text-pink-200" fill="currentColor" size={32} />
          <h1 className="text-4xl brand-font tracking-wider flex items-center gap-3 drop-shadow-md text-center">
            <Sparkles className="animate-spin-slow hidden sm:block" /> PURI-PURI BOOTH <Sparkles className="animate-spin-slow hidden sm:block" />
          </h1>
          <Heart className="absolute right-8 animate-pulse hidden sm:block text-pink-200" fill="currentColor" size={32} />
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
                <Button icon={Users} variant="secondary" onClick={() => setAppState('ROLE_SELECT')}>Join Friend</Button>
              </div>
            </div>
          )}

          {appState === 'ROLE_SELECT' && (
            <div className="text-center space-y-8 w-full max-w-md bg-white p-10 rounded-3xl border-4 border-pink-200 shadow-[8px_8px_0_#ffb6c1]">
              <h2 className="text-3xl brand-font text-pink-500">Enter Room ID</h2>
              <input type="text" placeholder="e.g. booth-abc123" className="w-full px-6 py-4 border-4 border-pink-100 rounded-2xl outline-none text-center font-mono text-2xl text-pink-600 font-bold transition-all focus:border-pink-400 focus:shadow-[4px_4px_0_#f472b6]"
                value={joinIdInput} onChange={(e) => setJoinIdInput(e.target.value)} />
              <Button icon={RefreshCcw} onClick={handleGuestJoin} className="w-full">Connect!</Button>
              <button onClick={() => setAppState('LANDING')} className="text-lg text-pink-400 hover:text-pink-600 underline font-bold mt-4">Go Back</button>
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
                      <Copy size={24}/>
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
              flash={flash}
              triggerSyncCountdown={triggerSyncCountdown}
              hasPhotos={photos.length > 0}
              onGoToGallery={() => setAppState('GALLERY')}
              layoutStyle={layoutStyle}
              onLayoutChange={(s) => { setLayoutStyle(s); sendData({ type: 'LAYOUT_CHANGE', layoutStyle: s }); }}
              cameraFilter={cameraFilter}
              onFilterChange={(f) => { setCameraFilter(f); sendData({ type: 'FILTER_CHANGE', cameraFilter: f }); }}
              localStream={localStream}
              remoteStream={remoteStream}
              role={role}
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