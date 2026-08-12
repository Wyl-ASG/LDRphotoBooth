import { useState, useRef, useCallback, useEffect } from 'react';
import Peer from 'peerjs';

export const useWebRTC = (setErrorMsg, onDataMessage) => {
  const [role, setRole] = useState(null);
  const [peerId, setPeerId] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);

  const peerRef = useRef(null);
  const connRef = useRef(null);
  const localStreamRef = useRef(null); 

  /* Keep the latest message handler in a ref so connection callbacks stay current. */
  const onDataMessageRef = useRef(onDataMessage);
  useEffect(() => {
    onDataMessageRef.current = onDataMessage;
  }, [onDataMessage]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: "user" }, 
        audio: false 
      });
      setLocalStream(stream);
      localStreamRef.current = stream; 
      return stream;
    } catch (error) {
      console.warn('⚠️ [WebRTC] Failed to access camera.', error);
      setErrorMsg("Camera access denied. You must allow camera access.");
      return null;
    }
  };

  const setupDataChannel = useCallback((conn) => {
    conn.on('open', () => {
      setIsConnected(true);
    });

    conn.on('data', (data) => {
      if (onDataMessageRef.current) {
        onDataMessageRef.current(data);
      } else {
        console.warn('⚠️ [WebRTC] onDataMessageRef is null!');
      }
    });

    conn.on('error', (err) => {
      console.error('❌ [WebRTC Data Error]', err);
      setErrorMsg(`Data connection error: ${err.message || err}`);
    });

    conn.on('close', () => {
      console.warn('⚠️ [WebRTC Data Closed]');
      setIsConnected(false);
      setErrorMsg('Friend disconnected.');
    });
  }, [setErrorMsg]); 

  const startHostSession = async (onReady, keepError = false) => {
    if (!keepError) setErrorMsg('');
    const stream = await startCamera();
    if (!stream) return false;

    setRole('host');
    
    const customId = 'booth-' + Math.random().toString(36).substring(2, 8);
    const peer = new Peer(customId, { debug: 2 });
    peerRef.current = peer;

    peer.on('open', (id) => {
      setPeerId(id);
    });

    peer.on('connection', (conn) => {
      connRef.current = conn;
      setupDataChannel(conn);
    });

    peer.on('call', (call) => {
      call.answer(stream);
      call.on('stream', (remoteVideo) => {
        setRemoteStream(remoteVideo);
        setIsConnected(true);
        if (onReady) onReady();
      });
    });

    peer.on('error', (err) => setErrorMsg(`Connection error: ${err.message}`));
    return true;
  };

  const startGuestSession = async (joinId, onReady) => {
    if (!joinId.trim()) {
      setErrorMsg("Please enter a valid Room ID.");
      return false;
    }
    setErrorMsg('');
    const stream = await startCamera();
    if (!stream) return false;

    setRole('guest');
    const peer = new Peer({ debug: 2 });
    peerRef.current = peer;

    peer.on('open', () => {
      const conn = peer.connect(joinId, { reliable: true });
      connRef.current = conn;
      setupDataChannel(conn);

      const call = peer.call(joinId, stream);
      call.on('stream', (remoteVideo) => {
        setRemoteStream(remoteVideo);
        setIsConnected(true);
        if (onReady) onReady();
      });
    });
    
    peer.on('error', (err) => setErrorMsg(`Connection error: ${err.message}`));
    return true;
  };

  const sendData = (data) => {
    if (connRef.current) {
      if (connRef.current.open) {
        connRef.current.send(data);
      } else {
        console.error(`❌ [WebRTC OUT FAILED] Connection exists but state is NOT open yet!`);
      }
    } else {
      console.error(`❌ [WebRTC OUT FAILED] No connection object exists!`);
    }
  };

  const cleanupWebRTC = useCallback(() => {
    if (connRef.current) {
      try { connRef.current.close(); } catch { /* ignore */ }
      connRef.current = null;
    }
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
      localStreamRef.current = null;
    }
    if (peerRef.current) {
      try { peerRef.current.destroy(); } catch { /* ignore */ }
      peerRef.current = null;
    }
    setLocalStream(null);
    setRemoteStream(null);
    setIsConnected(false);
    setRole(null);
    setPeerId('');
  }, []);

  return {
    role, peerId, isConnected, localStream, remoteStream,
    startHostSession, startGuestSession, sendData, cleanupWebRTC
  };
};