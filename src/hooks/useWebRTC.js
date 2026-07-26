import { useState, useRef, useCallback } from 'react';

export const useWebRTC = (setErrorMsg, onDataMessage) => {
  const [role, setRole] = useState(null);
  const [peerId, setPeerId] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);

  const peerRef = useRef(null);
  const connRef = useRef(null);
  const localStreamRef = useRef(null); // FIX: Added ref to prevent useEffect loops

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: "user" }, 
        audio: false 
      });
      setLocalStream(stream);
      localStreamRef.current = stream; // FIX: Store in ref silently
      return stream;
    } catch (err) {
      setErrorMsg("Camera access denied. You must allow camera access.");
      return null;
    }
  };

  const setupDataChannel = useCallback((conn) => {
    conn.on('open', () => console.log("P2P Data channel opened successfully."));
    conn.on('data', (data) => {
      if (onDataMessage) onDataMessage(data);
    });
  }, [onDataMessage]);

  const startHostSession = async (onReady) => {
    setErrorMsg('');
    const stream = await startCamera();
    if (!stream) return false;

    setRole('host');
    
    // Using a custom ID to ensure fast connections
    const customId = 'booth-' + Math.random().toString(36).substring(2, 8);
    const peer = new window.Peer(customId, { debug: 2 });
    peerRef.current = peer;

    peer.on('open', (id) => setPeerId(id));

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
    const peer = new window.Peer({ debug: 2 });
    peerRef.current = peer;

    peer.on('open', () => {
      const conn = peer.connect(joinId);
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
    if (connRef.current && connRef.current.open) {
      connRef.current.send(data);
    }
  };

  const cleanupWebRTC = useCallback(() => {
    // FIX: Read from the ref instead of state so this function never changes
    if (localStreamRef.current) localStreamRef.current.getTracks().forEach(track => track.stop());
    if (peerRef.current) peerRef.current.destroy();
  }, []); // FIX: Empty dependency array

  return {
    role, peerId, isConnected, localStream, remoteStream,
    startHostSession, startGuestSession, sendData, cleanupWebRTC
  };
};