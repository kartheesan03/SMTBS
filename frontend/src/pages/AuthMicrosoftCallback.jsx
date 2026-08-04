/**
 * AuthMicrosoftCallback.jsx
 *
 * This page is opened inside a popup by useMicrosoftLogin.
 * Microsoft redirects here with the token in the URL fragment (#).
 * We parse it and postMessage it back to the opener, then close the popup.
 */
import { useEffect } from 'react';

const AuthMicrosoftCallback = () => {
  useEffect(() => {
    const hash = window.location.hash.substring(1); // remove leading '#'
    const params = new URLSearchParams(hash);

    const access_token = params.get('access_token');
    const id_token = params.get('id_token');
    const error = params.get('error');
    const errorDescription = params.get('error_description');

    const message = error
      ? { type: 'MICROSOFT_AUTH_CALLBACK', error: errorDescription || error }
      : { type: 'MICROSOFT_AUTH_CALLBACK', access_token, id_token };

    if (window.opener) {
      window.opener.postMessage(message, window.location.origin);
    }

    // Auto-close the popup
    window.close();
  }, []);

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      fontFamily: 'Inter, sans-serif',
      background: '#0a0118',
      color: '#fff',
      flexDirection: 'column',
      gap: '16px',
    }}>
      <svg width="40" height="40" viewBox="0 0 21 21" style={{ borderRadius: '4px' }}>
        <rect x="1" y="1" width="9" height="9" fill="#F25022" />
        <rect x="11" y="1" width="9" height="9" fill="#7FBA00" />
        <rect x="1" y="11" width="9" height="9" fill="#00A4EF" />
        <rect x="11" y="11" width="9" height="9" fill="#FFB900" />
      </svg>
      <p style={{ fontSize: '15px', color: '#c4b5fd' }}>Completing Microsoft sign-in…</p>
    </div>
  );
};

export default AuthMicrosoftCallback;
