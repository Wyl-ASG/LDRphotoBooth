import { useCallback, useEffect, useRef, useState } from 'react';

import { loadScript } from '../utils/loadScript';
import { BOOTH_PROTOCOL, normalizePeerMessage } from '../utils/boothProtocol';
import { useGoogleAuth } from './useGoogleAuth';
import { useWebRTC } from './useWebRTC';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

export const useBoothController = () => {
  const [appState, setAppState] = useState('LANDING');
  const [errorMsg, setErrorMsg] = useState('');
  const [joinIdInput, setJoinIdInput] = useState('');
  const [photos, setPhotos] = useState([]);
  const [countdown, setCountdown] = useState(null);
  const [flash, setFlash] = useState(false);
  const [layoutStyle, setLayoutStyle] = useState(BOOTH_PROTOCOL.defaults.layoutStyle);
  const [cameraFilter, setCameraFilter] = useState(BOOTH_PROTOCOL.defaults.cameraFilter);
  const [rawPhoto, setRawPhoto] = useState(null);
  const [stickers, setStickers] = useState([]);
  const [isFinishing, setIsFinishing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const hiddenLocalVideoRef = useRef(null);
  const hiddenRemoteVideoRef = useRef(null);
  const countdownIntervalRef = useRef(null);
  const latestStateRef = useRef({ layoutStyle, cameraFilter });

  useEffect(() => {
    latestStateRef.current = { layoutStyle, cameraFilter };
  }, [layoutStyle, cameraFilter]);

  const resetToBooth = useCallback(() => {
    setAppState('BOOTH');
    if (countdownIntervalRef.current !== null) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
    setRawPhoto(null);
    setStickers([]);
    setIsFinishing(false);
    setCountdown(null);
    setIsUploading(false);
    setUploadSuccess(false);
  }, []);

  const safelyUpdatePhotos = useCallback((newPhotoUrl) => {
    setPhotos(prev => {
      let newHistory = [...prev, newPhotoUrl];
      if (newHistory.length > 3) newHistory = newHistory.slice(1);
      return newHistory;
    });
  }, []);

  useEffect(() => {
    const init = async () => {
      try {
        await Promise.all([
          loadScript('https://accounts.google.com/gsi/client', 'google-gis-script'),
        ]);
      } catch (error) {
        console.warn('⚠️ [App] Failed to load Google sign-in script.', error);
        setErrorMsg('Failed to load Google sign-in services. Please refresh and try again.');
      }
    };

    init();
  }, []);

  const { 
    role, peerId, isConnected, localStream, remoteStream,
    startHostSession, startGuestSession, sendData, cleanupWebRTC,
  } = useWebRTC(setErrorMsg, (data) => {
    const normalizedData = normalizePeerMessage(data);
    if (!normalizedData) {
      console.warn('⚠️ [App] Ignored invalid WebRTC message.', data);
      return;
    }

    if (normalizedData.type === BOOTH_PROTOCOL.messageTypes.countdownTick) {
      setCountdown(normalizedData.count);
    } else if (normalizedData.type === BOOTH_PROTOCOL.messageTypes.photoTaken) {
      triggerFlash();
      setRawPhoto(normalizedData.photoUrl);
      setStickers([]);
      setIsFinishing(false);
      setAppState('DECORATE');
    } else if (normalizedData.type === BOOTH_PROTOCOL.messageTypes.backToBooth) {
      resetToBooth();
    } else if (normalizedData.type === BOOTH_PROTOCOL.messageTypes.layoutChange) {
      setLayoutStyle(normalizedData.layoutStyle);
    } else if (normalizedData.type === BOOTH_PROTOCOL.messageTypes.filterChange) {
      setCameraFilter(normalizedData.cameraFilter);
    } else if (normalizedData.type === BOOTH_PROTOCOL.messageTypes.syncStickers) {
      setStickers(normalizedData.stickers);
    } else if (normalizedData.type === BOOTH_PROTOCOL.messageTypes.initiateFinish) {
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

  useEffect(() => {
    return () => {
      if (countdownIntervalRef.current !== null) {
        clearInterval(countdownIntervalRef.current);
        countdownIntervalRef.current = null;
      }
      cleanupWebRTC();
    };
  }, [cleanupWebRTC]);

  useEffect(() => {
    if (hiddenLocalVideoRef.current && localStream) hiddenLocalVideoRef.current.srcObject = localStream;
    if (hiddenRemoteVideoRef.current && remoteStream) hiddenRemoteVideoRef.current.srcObject = remoteStream;
  }, [localStream, remoteStream]);

  const triggerFlash = () => {
    setFlash(true);
    setTimeout(() => setFlash(false), 200);
  };

  const handleGoToGallery = () => {
    setAppState('GALLERY');
  };

  const handleOpenRoleSelect = () => {
    setAppState('ROLE_SELECT');
  };

  const handleGoHome = () => {
    setAppState('LANDING');
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
  const primaryVideo = role === 'host' ? hiddenLocalVideoRef.current : hiddenRemoteVideoRef.current;
  const secondaryVideo = role === 'host' ? hiddenRemoteVideoRef.current : hiddenLocalVideoRef.current;
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
    const primaryVideo = hiddenLocalVideoRef.current;
    const secondaryVideo = hiddenRemoteVideoRef.current;

    if (currentLayout === 'split-horizontal') {
      const halfW = (w / 2) - (pad * 1.5);
      const drawH = h - (pad * 2);
      drawVideo(primaryVideo, pad, pad, halfW, drawH);
      drawVideo(secondaryVideo, w / 2 + (pad / 2), pad, halfW, drawH);

      ctx.filter = 'none';
      ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 16;
      ctx.beginPath(); ctx.roundRect(pad, pad, halfW, drawH, [20]); ctx.stroke();
      ctx.beginPath(); ctx.roundRect(w / 2 + (pad / 2), pad, halfW, drawH, [20]); ctx.stroke();
    } else if (currentLayout === 'split-vertical') {
      const drawW = w - (pad * 2);
      const halfH = (h / 2) - (pad * 1.5);
      drawVideo(primaryVideo, pad, pad, drawW, halfH);
      drawVideo(secondaryVideo, pad, h / 2 + (pad / 2), drawW, halfH);

      ctx.filter = 'none';
      ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 16;
      ctx.beginPath(); ctx.roundRect(pad, pad, drawW, halfH, [20]); ctx.stroke();
      ctx.beginPath(); ctx.roundRect(pad, h / 2 + (pad / 2), drawW, halfH, [20]); ctx.stroke();
    } else if (currentLayout === 'pip') {
      const drawW = w - (pad * 2);
      const drawH = h - (pad * 2);
      const pipW = drawW / 3.5;
      const pipH = drawH / 3.5;

      drawVideo(primaryVideo, pad, pad, drawW, drawH);
      drawVideo(secondaryVideo, w - pipW - (pad * 2), h - pipH - (pad * 2), pipW, pipH);

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

    return canvas.toDataURL('image/jpeg', 0.75);
  };

  const triggerSyncCountdown = () => {
    if (countdownIntervalRef.current !== null) return;

    let count = 3;
    setCountdown(count);
    sendData({ type: BOOTH_PROTOCOL.messageTypes.countdownTick, count });

    countdownIntervalRef.current = setInterval(() => {
      count -= 1;
      if (count > 0) {
        setCountdown(count);
        sendData({ type: BOOTH_PROTOCOL.messageTypes.countdownTick, count });
      } else {
        clearInterval(countdownIntervalRef.current);
        countdownIntervalRef.current = null;
        setCountdown(null);
        sendData({ type: BOOTH_PROTOCOL.messageTypes.countdownTick, count: null });

        triggerFlash();
        setTimeout(() => {
          takePhotoAndDecorateLocal();
        }, 50);
      }
    }, 1000);
  };

  const takePhotoAndDecorateLocal = async () => {
    try {
      const photoDataUrl = capturePhoto();
      setRawPhoto(photoDataUrl);
      setStickers([]);
      setIsFinishing(false);
      setAppState('DECORATE');

      sendData({ type: BOOTH_PROTOCOL.messageTypes.photoTaken, photoUrl: photoDataUrl });
    } catch (error) {
      setErrorMsg(`Failed to capture photo: ${error.message}`);
    }
  };

  const handleAddSticker = (emoji) => {
    setStickers(prev => {
      const newStickers = [...prev, { id: Date.now(), emoji, x: 640, y: 480, size: 120 }];
      sendData({ type: BOOTH_PROTOCOL.messageTypes.syncStickers, stickers: newStickers });
      return newStickers;
    });
  };

  const handleUpdateSticker = (id, newProps) => {
    setStickers(prev => {
      const newStickers = prev.map(s => s.id === id ? { ...s, ...newProps } : s);
      sendData({ type: BOOTH_PROTOCOL.messageTypes.syncStickers, stickers: newStickers });
      return newStickers;
    });
  };

  const handleInitiateFinish = () => {
    setIsFinishing(true);
    sendData({ type: BOOTH_PROTOCOL.messageTypes.initiateFinish });
  };

  const handleFinishDecoratingLocal = useCallback((finalPhotoPayload) => {
    safelyUpdatePhotos(finalPhotoPayload);
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
        body: form,
      });

      if (!res.ok) throw new Error('Upload failed');
      setUploadSuccess(true);
      setTimeout(() => setUploadSuccess(false), 3000);
    } catch (error) {
      setErrorMsg(`Upload failed: ${error.message}`);
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
    sendData({ type: BOOTH_PROTOCOL.messageTypes.backToBooth });
  };

  return {
    appState,
    errorMsg,
    joinIdInput,
    setJoinIdInput,
    photos,
    countdown,
    flash,
    layoutStyle,
    setLayoutStyle,
    cameraFilter,
    setCameraFilter,
    rawPhoto,
    stickers,
    isFinishing,
    isUploading,
    uploadSuccess,
    hiddenLocalVideoRef,
    hiddenRemoteVideoRef,
    role,
    peerId,
    isConnected,
    localStream,
    remoteStream,
    googleToken,
    handleGoogleLogin,
    handleGoToGallery,
    handleOpenRoleSelect,
    handleGoHome,
    triggerSyncCountdown,
    handleLayoutChange: (nextLayoutStyle) => {
      setLayoutStyle(nextLayoutStyle);
      sendData({ type: BOOTH_PROTOCOL.messageTypes.layoutChange, layoutStyle: nextLayoutStyle });
    },
    handleFilterChange: (nextCameraFilter) => {
      setCameraFilter(nextCameraFilter);
      sendData({ type: BOOTH_PROTOCOL.messageTypes.filterChange, cameraFilter: nextCameraFilter });
    },
    handleAddSticker,
    handleUpdateSticker,
    handleInitiateFinish,
    handleFinishDecoratingLocal,
    handleGuestJoin,
    handleBackToBooth,
    saveToGoogleDrive,
    canTakePhoto: isConnected,
  };
};