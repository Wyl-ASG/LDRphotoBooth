import { useState, useCallback } from 'react';

export const useGoogleAuth = (clientId, setErrorMsg, onAuthSuccess) => {
  const [googleToken, setGoogleToken] = useState(null);

  const handleGoogleLogin = useCallback(() => {
    if (!clientId) {
      console.warn("⚠️ [GoogleAuth] VITE_GOOGLE_CLIENT_ID is not configured.");
      setErrorMsg("Google Client ID is missing. You can still use the photo booth locally or set VITE_GOOGLE_CLIENT_ID to enable Google Drive saving.");
      // Proceed to host session without Google token
      if (onAuthSuccess) onAuthSuccess();
      return;
    }

    if (!window.google) {
      setErrorMsg("Google services are loading. Please try again in a moment.");
      return;
    }
    setErrorMsg('');
    
    try {
      const client = window.google.accounts.oauth2.initTokenClient({
        client_id: clientId,
        scope: 'https://www.googleapis.com/auth/drive.file',
        callback: (response) => {
          if (response.error) {
            setErrorMsg(`Google Auth Error: ${response.error.message || response.error}`);
            return;
          }
          setGoogleToken(response.access_token);
          if (onAuthSuccess) onAuthSuccess();
        },
      });
      client.requestAccessToken();
    } catch (error) {
      console.error('❌ [GoogleAuth] Failed to initialize token client.', error);
      setErrorMsg("Error initializing Google Auth. Proceeding to room host without Google Drive sync.");
      if (onAuthSuccess) onAuthSuccess();
    }
  }, [clientId, setErrorMsg, onAuthSuccess]);

  return { googleToken, handleGoogleLogin };
};
