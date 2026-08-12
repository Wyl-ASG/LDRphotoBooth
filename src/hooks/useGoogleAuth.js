import { useState, useCallback } from 'react';

export const useGoogleAuth = (clientId, setErrorMsg, onAuthSuccess) => {
  const [googleToken, setGoogleToken] = useState(null);

  const handleGoogleLogin = useCallback((callbackOverride) => {
    const onSuccess = typeof callbackOverride === 'function' ? callbackOverride : onAuthSuccess;

    if (!clientId) {
      console.warn("⚠️ [GoogleAuth] VITE_GOOGLE_CLIENT_ID is not configured.");
      setErrorMsg("Google login is currently under testing and cannot be used right now. You have been redirected to non-Google mode.");
      if (onSuccess) onSuccess(null);
      return;
    }

    if (!window.google) {
      setErrorMsg("Google services are loading. Please try again in a moment or continue in non-Google mode.");
      return;
    }
    setErrorMsg('');
    
    try {
      const client = window.google.accounts.oauth2.initTokenClient({
        client_id: clientId,
        scope: 'https://www.googleapis.com/auth/drive.file',
        callback: (response) => {
          if (response.error) {
            console.warn('⚠️ [GoogleAuth] OAuth Error:', response.error);
            setErrorMsg('Google login is currently under testing (access restricted). You have been redirected to non-Google mode.');
            if (onSuccess) onSuccess(null);
            return;
          }
          setGoogleToken(response.access_token);
          if (onSuccess) onSuccess(response.access_token);
        },
        error_callback: (err) => {
          console.warn('⚠️ [GoogleAuth] OAuth Error Callback:', err);
          setErrorMsg('Google login is currently under testing. You have been redirected to non-Google mode.');
          if (onSuccess) onSuccess(null);
        },
      });
      client.requestAccessToken();
    } catch (error) {
      console.error('❌ [GoogleAuth] Failed to initialize token client.', error);
      setErrorMsg('Google login is currently under testing or unavailable. You have been redirected to non-Google mode.');
      if (onSuccess) onSuccess(null);
    }
  }, [clientId, setErrorMsg, onAuthSuccess]);

  return { googleToken, setGoogleToken, handleGoogleLogin };
};
