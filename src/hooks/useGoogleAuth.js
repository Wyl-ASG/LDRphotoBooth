import { useState, useCallback } from 'react';

export const useGoogleAuth = (clientId, setErrorMsg, onAuthSuccess) => {
  const [googleToken, setGoogleToken] = useState(null);

  const handleGoogleLogin = useCallback(() => {
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
      setErrorMsg("Error initializing Google Auth. Did you replace the GOOGLE_CLIENT_ID?");
    }
  }, [clientId, setErrorMsg, onAuthSuccess]);

  return { googleToken, handleGoogleLogin };
};
