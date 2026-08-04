/**
 * useMicrosoftLogin — Zero-dependency Microsoft OAuth2 popup hook.
 *
 * How it works:
 *  1. Opens a popup to Microsoft's /authorize endpoint.
 *  2. On success, Microsoft redirects to /auth/microsoft/callback (handled by the
 *     AuthCallback.jsx page in this app) which postMessages the token back.
 *  3. The hook resolves with { access_token, id_token } so the caller can
 *     POST those to the backend just like Google auth.
 *
 * Setup:
 *  - Add VITE_MICROSOFT_CLIENT_ID=<your-azure-app-id> to frontend/.env
 *  - Add VITE_MICROSOFT_TENANT_ID=common (or your tenant id) to frontend/.env
 *  - In Azure Portal → your App Registration → Authentication:
 *      Add a SPA redirect URI: http://localhost:3000/auth/microsoft/callback
 *      Enable "Access tokens" and "ID tokens" under Implicit grant.
 */
export const useMicrosoftLogin = ({ onSuccess, onError, mode = 'login', role = 'Employee' }) => {
  const login = () => {
    let clientId = import.meta.env.VITE_MICROSOFT_CLIENT_ID;
    const tenantId = import.meta.env.VITE_MICROSOFT_TENANT_ID || 'common';

    // If the user hasn't added their own Client ID, we'll use a placeholder
    // just so the popup opens (though it will show an error on Microsoft's end).
    if (!clientId) {
      console.warn('VITE_MICROSOFT_CLIENT_ID is missing in .env. Using placeholder for demonstration.');
      clientId = '11111111-1111-1111-1111-111111111111';
    }

    const redirectUri = `${window.location.origin}/auth/microsoft/callback`;
    const state = JSON.stringify({ mode, role, nonce: Math.random().toString(36).slice(2) });
    const stateEncoded = btoa(state);

    const params = new URLSearchParams({
      client_id: clientId,
      response_type: 'token id_token',
      redirect_uri: redirectUri,
      scope: 'openid profile email User.Read',
      response_mode: 'fragment',
      state: stateEncoded,
      nonce: Math.random().toString(36).slice(2),
      prompt: 'select_account',
    });

    const url = `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/authorize?${params.toString()}`;

    const width = 520;
    const height = 600;
    const left = window.screenX + (window.innerWidth - width) / 2;
    const top = window.screenY + (window.innerHeight - height) / 2;

    const popup = window.open(
      url,
      'microsoft-login',
      `width=${width},height=${height},left=${left},top=${top},toolbar=no,menubar=no`
    );

    if (!popup) {
      onError?.(new Error('Popup blocked. Please allow popups for this site.'));
      return;
    }

    // Listen for the callback via postMessage from AuthMicrosoftCallback.jsx
    const handler = (event) => {
      if (event.origin !== window.location.origin) return;
      if (!event.data || event.data.type !== 'MICROSOFT_AUTH_CALLBACK') return;

      window.removeEventListener('message', handler);
      popup.close();

      if (event.data.error) {
        onError?.(new Error(event.data.error));
      } else {
        onSuccess?.(event.data);
      }
    };

    window.addEventListener('message', handler);

    // Cleanup if the popup is closed manually
    const checkClosed = setInterval(() => {
      if (popup.closed) {
        clearInterval(checkClosed);
        window.removeEventListener('message', handler);
      }
    }, 500);
  };

  return login;
};
