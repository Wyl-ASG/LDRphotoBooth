import { useCallback, useEffect, useRef, useState } from 'react';

import { loadScript } from '../utils/loadScript';
import { BOOTH_PROTOCOL, normalizePeerMessage, dataUrlToBlob } from '../utils/boothProtocol';
import { getLayoutById, compileLayoutCanvas } from '../utils/layoutsConfig';
import { useGoogleAuth } from './useGoogleAuth';
import { useWebRTC } from './useWebRTC';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

export const useBoothController = () => {
  const [appState, setAppState] = useState('LANDING');
  const [errorMsg, setErrorMsg] = useState('');
  const [joinIdInput, setJoinIdInput] = useState('');
  const [photos, setPhotos] = useState([]);
  const [countdown, setCountdown] = useState(null);
  const [currentPoseIndex, setCurrentPoseIndex] = useState(0);
  const [totalPoses, setTotalPoses] = useState(1);
  const [capturedPoses, setCapturedPoses] = useState([]);
  const [flash, setFlash] = useState(false);
  const [layoutStyle, setLayoutStyle] = useState(BOOTH_PROTOCOL.defaults.layoutStyle);
  const [cameraFilter, setCameraFilter] = useState(BOOTH_PROTOCOL.defaults.cameraFilter);
  const [customTitle, setCustomTitle] = useState(BOOTH_PROTOCOL.defaults.customTitle);
  const [customDate, setCustomDate] = useState(BOOTH_PROTOCOL.defaults.customDate);
  const [rawPhoto, setRawPhoto] = useState(null);
  const [stickers, setStickers] = useState([]);
  const [isTakingPhotos, setIsTakingPhotos] = useState(false);
  const [isFinishing, setIsFinishing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const latestStateRef = useRef({ layoutStyle, cameraFilter, role: null, customTitle, customDate });

  const resetToBooth = useCallback(() => {
    setAppState('BOOTH');
    setRawPhoto(null);
    setStickers([]);
    setIsFinishing(false);
    setIsTakingPhotos(false);
    setCountdown(null);
    setCapturedPoses([]);
    setCurrentPoseIndex(0);
    setIsUploading(false);
    setUploadSuccess(false);
  }, []);

  const safelyUpdatePhotos = useCallback((newPhotoUrl) => {
    setPhotos((prev) => {
      let newHistory = [...prev, newPhotoUrl];
      if (newHistory.length > 5) newHistory = newHistory.slice(1);
      return newHistory;
    });
  }, []);

  useEffect(() => {
    const init = async () => {
      try {
        await Promise.all([loadScript('https://accounts.google.com/gsi/client', 'google-gis-script')]);
      } catch (error) {
        console.warn('⚠️ [App] Failed to load Google sign-in script.', error);
        setErrorMsg('Failed to load Google sign-in services. Please refresh and try again.');
      }
    };
    init();
  }, []);

  const {
    role,
    peerId,
    localStream,
    remoteStream,
    startHostSession,
    startGuestSession,
    sendData,
    cleanupWebRTC,
  } = useWebRTC(setErrorMsg, (data) => {
    const normalizedData = normalizePeerMessage(data);
    if (!normalizedData) {
      console.warn('⚠️ [App] Ignored invalid WebRTC message.', data);
      return;
    }

    if (normalizedData.type === BOOTH_PROTOCOL.messageTypes.countdownTick) {
      setIsTakingPhotos(true);
      setCountdown(normalizedData.count);
      setCurrentPoseIndex(normalizedData.poseIndex || 0);
      setTotalPoses(normalizedData.totalPoses || 1);
      if (normalizedData.count === 0) {
        triggerFlash();
        const posePair = captureSinglePosePair(normalizedData.poseIndex || 0);
        setCapturedPoses((prev) => {
          const next = [...prev];
          next[normalizedData.poseIndex || 0] = posePair;
          return next;
        });
      }
    } else if (normalizedData.type === BOOTH_PROTOCOL.messageTypes.photoTaken) {
      triggerFlash();
      setRawPhoto(normalizedData.photoUrl);
      setStickers([]);
      setIsFinishing(false);
      setIsTakingPhotos(false);
      setAppState('DECORATE');
    } else if (normalizedData.type === BOOTH_PROTOCOL.messageTypes.backToBooth) {
      resetToBooth();
    } else if (normalizedData.type === BOOTH_PROTOCOL.messageTypes.layoutChange) {
      setLayoutStyle(normalizedData.layoutStyle);
      if (normalizedData.customTitle) setCustomTitle(normalizedData.customTitle);
      if (normalizedData.customDate) setCustomDate(normalizedData.customDate);
    } else if (normalizedData.type === BOOTH_PROTOCOL.messageTypes.titleChange) {
      setCustomTitle(normalizedData.customTitle);
    } else if (normalizedData.type === BOOTH_PROTOCOL.messageTypes.dateChange) {
      setCustomDate(normalizedData.customDate);
    } else if (normalizedData.type === BOOTH_PROTOCOL.messageTypes.filterChange) {
      setCameraFilter(normalizedData.cameraFilter);
    } else if (normalizedData.type === BOOTH_PROTOCOL.messageTypes.syncStickers) {
      setStickers(normalizedData.stickers);
    } else if (normalizedData.type === BOOTH_PROTOCOL.messageTypes.updateSticker) {
      setStickers((prev) =>
        prev.map((s) => (s.id === normalizedData.sticker.id ? { ...s, ...normalizedData.sticker } : s))
      );
    } else if (normalizedData.type === BOOTH_PROTOCOL.messageTypes.initiateFinish) {
      setIsFinishing(true);
    }
  });

  useEffect(() => {
    latestStateRef.current = { layoutStyle, cameraFilter, role, customTitle, customDate };
  }, [layoutStyle, cameraFilter, role, customTitle, customDate]);

  const handleStartHostDirect = useCallback((keepError = false) => {
    if (!keepError) setErrorMsg('');
    setAppState('HOST_WAITING');
    startHostSession(() => setAppState('BOOTH'), keepError);
  }, [startHostSession]);

  const { googleToken, handleGoogleLogin } = useGoogleAuth(GOOGLE_CLIENT_ID, setErrorMsg, () => {
    handleStartHostDirect(true);
  });

  useEffect(() => {
    return () => {
      cleanupWebRTC();
    };
  }, [cleanupWebRTC]);

  useEffect(() => {
    if (localVideoRef.current && localStream && localVideoRef.current.srcObject !== localStream) {
      localVideoRef.current.srcObject = localStream;
      localVideoRef.current.play().catch((err) => console.warn('Local video play failed:', err));
    }
    if (remoteVideoRef.current && remoteStream && remoteVideoRef.current.srcObject !== remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
      remoteVideoRef.current.play().catch((err) => console.warn('Remote video play failed:', err));
    }
  }, [localStream, remoteStream]);

  const triggerFlash = () => {
    setFlash(true);
    setTimeout(() => setFlash(false), 250);
  };

  useEffect(() => {
    if (localStream) {
      const isCameraActive = appState === 'BOOTH' || appState === 'HOST_WAITING' || appState === 'GUEST_JOIN';
      localStream.getVideoTracks().forEach((track) => {
        if (track.enabled !== isCameraActive) {
          track.enabled = isCameraActive;
        }
      });
    }
  }, [appState, localStream]);

  const handleGoToGallery = () => {
    setAppState('GALLERY');
  };

  const handleOpenRoleSelect = () => {
    setAppState('ROLE_SELECT');
  };

  const handleGoHome = () => {
    cleanupWebRTC();
    setAppState('LANDING');
    setErrorMsg('');
    setRawPhoto(null);
    setStickers([]);
    setIsFinishing(false);
    setIsTakingPhotos(false);
    setCountdown(null);
    setCapturedPoses([]);
    setCurrentPoseIndex(0);
    setIsUploading(false);
    setUploadSuccess(false);
  };

  /**
   * Snaps a single pose pair (Host frame + Guest frame)
   */
  const captureSinglePosePair = (poseIndex = 0) => {
    const currentRole = latestStateRef.current.role;
    const currentLayoutId = latestStateRef.current.layoutStyle;
    const activeLayout = getLayoutById(currentLayoutId);

    const activeBox = (activeLayout.boxes && activeLayout.boxes.find((b) => b.poseIndex === poseIndex)) || activeLayout.boxes[0];

    const halfBoxW = ((activeBox.w / 100) * activeLayout.canvasWidth) / 2;
    const halfBoxH = (activeBox.h / 100) * activeLayout.canvasHeight;
    const targetRatio = halfBoxW / halfBoxH;

    const primaryVideo = currentRole === 'host' ? localVideoRef.current : remoteVideoRef.current;
    const secondaryVideo = currentRole === 'guest' ? localVideoRef.current : remoteVideoRef.current;

    const createHalfCanvas = (videoElem, ratio) => {
      const c = document.createElement('canvas');
      c.width = 600;
      c.height = Math.round(600 / ratio);
      const ctx = c.getContext('2d');
      if (videoElem && videoElem.readyState >= 2 && (videoElem.videoWidth || videoElem.width)) {
        const vw = videoElem.videoWidth || videoElem.width || 640;
        const vh = videoElem.videoHeight || videoElem.height || 480;
        const sourceRatio = vw / vh;
        let sWidth = vw;
        let sHeight = vh;
        let sx = 0;
        let sy = 0;
        if (sourceRatio > ratio) {
          sWidth = vh * ratio;
          sx = (vw - sWidth) / 2;
        } else {
          sHeight = vw / ratio;
          sy = (vh - sHeight) / 2;
        }
        ctx.drawImage(videoElem, sx, sy, sWidth, sHeight, 0, 0, c.width, c.height);
      } else {
        ctx.fillStyle = '#fbcfe8';
        ctx.fillRect(0, 0, c.width, c.height);
      }
      return c.toDataURL('image/png');
    };

    return {
      host: createHalfCanvas(primaryVideo, targetRatio),
      guest: createHalfCanvas(secondaryVideo, targetRatio),
    };
  };

  /**
   * Executes multi-pose capture session based on active layout pose count.
   */
  const triggerSyncCountdown = async () => {
    if (isTakingPhotos) return;
    setIsTakingPhotos(true);
    try {
      const activeLayout = getLayoutById(latestStateRef.current.layoutStyle);
      const posesNeeded = activeLayout.poses;
      const accumulatedPoses = [];

      setCapturedPoses([]);

      for (let p = 0; p < posesNeeded; p++) {
        setCurrentPoseIndex(p);
        setTotalPoses(posesNeeded);

        // Countdown 3..2..1
        for (let c = 3; c >= 1; c--) {
          setCountdown(c);
          sendData({
            type: BOOTH_PROTOCOL.messageTypes.countdownTick,
            count: c,
            poseIndex: p,
            totalPoses: posesNeeded,
          });
          await new Promise((res) => setTimeout(res, 1000));
        }

        setCountdown(0);
        sendData({
          type: BOOTH_PROTOCOL.messageTypes.countdownTick,
          count: 0,
          poseIndex: p,
          totalPoses: posesNeeded,
        });

        triggerFlash();
        await new Promise((res) => setTimeout(res, 80));

        const posePair = captureSinglePosePair(p);
        accumulatedPoses.push(posePair);
        setCapturedPoses([...accumulatedPoses]);

        setCountdown(null);
        sendData({
          type: BOOTH_PROTOCOL.messageTypes.countdownTick,
          count: null,
          poseIndex: p,
          totalPoses: posesNeeded,
        });

        // Pause between poses if more remain
        if (p < posesNeeded - 1) {
          await new Promise((res) => setTimeout(res, 1200));
        }
      }

      // All poses snapped! Compile layout canvas.
      const compiledPhotoUrl = await compileLayoutCanvas({
        layoutId: latestStateRef.current.layoutStyle,
        poseImages: accumulatedPoses,
        customTitle: latestStateRef.current.customTitle,
        customDate: latestStateRef.current.customDate,
        cameraFilter: latestStateRef.current.cameraFilter,
      });

      setRawPhoto(compiledPhotoUrl);
      setStickers([]);
      setIsFinishing(false);
      setAppState('DECORATE');

      sendData({ type: BOOTH_PROTOCOL.messageTypes.photoTaken, photoUrl: compiledPhotoUrl });
    } catch (err) {
      console.error('Error during photo capture:', err);
    } finally {
      setIsTakingPhotos(false);
    }
  };

  const handleAddSticker = (emoji, x, y) => {
    const activeLayout = getLayoutById(latestStateRef.current.layoutStyle);
    const defaultX = x ?? Math.round((activeLayout?.canvasWidth || 1800) / 2);
    const defaultY = y ?? Math.round((activeLayout?.canvasHeight || 1200) / 2);

    setStickers((prev) => {
      const newStickers = [...prev, { id: Date.now() + Math.random(), emoji, x: defaultX, y: defaultY, size: 120 }];
      sendData({ type: BOOTH_PROTOCOL.messageTypes.syncStickers, stickers: newStickers });
      return newStickers;
    });
  };

  const handleUpdateSticker = (id, newProps) => {
    setStickers((prev) => {
      const newStickers = prev.map((s) => (s.id === id ? { ...s, ...newProps } : s));
      const targetSticker = newStickers.find((s) => s.id === id);
      if (targetSticker) {
        sendData({ type: BOOTH_PROTOCOL.messageTypes.updateSticker, sticker: targetSticker });
      }
      return newStickers;
    });
  };

  const handleInitiateFinish = () => {
    setIsFinishing(true);
    sendData({ type: BOOTH_PROTOCOL.messageTypes.initiateFinish });
  };

  const handleFinishDecoratingLocal = useCallback(
    (finalPhotoPayload) => {
      safelyUpdatePhotos(finalPhotoPayload);
      setAppState('GALLERY');
    },
    [safelyUpdatePhotos]
  );

  const uploadToDriveWithToken = useCallback(
    async (token) => {
      if (!token || photos.length === 0) return;
      setIsUploading(true);
      setUploadSuccess(false);

      try {
        const blob = dataUrlToBlob(photos[photos.length - 1]);
        const metadata = { name: `Purikura_${Date.now()}.jpg`, mimeType: 'image/jpeg' };
        const form = new FormData();
        form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
        form.append('file', blob);

        const res = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
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
    },
    [photos]
  );

  const saveToGoogleDrive = useCallback(async () => {
    if (photos.length === 0) return;
    if (googleToken) {
      await uploadToDriveWithToken(googleToken);
    } else {
      handleGoogleLogin(async (newToken) => {
        if (newToken) {
          await uploadToDriveWithToken(newToken);
        }
      });
    }
  }, [photos, googleToken, uploadToDriveWithToken, handleGoogleLogin]);

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
    setErrorMsg,
    joinIdInput,
    setJoinIdInput,
    photos,
    countdown,
    currentPoseIndex,
    totalPoses,
    capturedPoses,
    flash,
    layoutStyle,
    setLayoutStyle,
    cameraFilter,
    setCameraFilter,
    customTitle,
    setCustomTitle,
    customDate,
    setCustomDate,
    rawPhoto,
    stickers,
    isTakingPhotos,
    isFinishing,
    isUploading,
    uploadSuccess,
    localVideoRef,
    remoteVideoRef,
    role,
    peerId,
    localStream,
    remoteStream,
    googleToken,
    handleStartHostDirect,
    handleStartHostWithGoogle: handleGoogleLogin,
    handleGoogleLogin,
    handleGoToGallery,
    handleOpenRoleSelect,
    handleGoHome,
    triggerSyncCountdown,
    handleLayoutChange: (nextLayoutStyle) => {
      setLayoutStyle(nextLayoutStyle);
      sendData({
        type: BOOTH_PROTOCOL.messageTypes.layoutChange,
        layoutStyle: nextLayoutStyle,
        customTitle: latestStateRef.current.customTitle,
        customDate: latestStateRef.current.customDate,
      });
    },
    handleTitleChange: (nextTitle) => {
      setCustomTitle(nextTitle);
      sendData({ type: BOOTH_PROTOCOL.messageTypes.titleChange, customTitle: nextTitle });
    },
    handleDateChange: (nextDate) => {
      setCustomDate(nextDate);
      sendData({ type: BOOTH_PROTOCOL.messageTypes.dateChange, customDate: nextDate });
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
  };
};