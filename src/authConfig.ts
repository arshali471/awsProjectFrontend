import { Configuration, PublicClientApplication } from '@azure/msal-browser';

export const msalConfig: Configuration = {
    auth: {
        clientId: import.meta.env.VITE_AZURE_CLIENT_ID || '',
        authority: `https://login.microsoftonline.com/${import.meta.env.VITE_AZURE_TENANT_ID || 'common'}`,
        redirectUri: import.meta.env.VITE_AZURE_REDIRECT_URI || window.location.origin,
    },
    cache: {
        cacheLocation: 'sessionStorage',
        storeAuthStateInCookie: false,
    },
};

export const loginRequest = {
    scopes: ['User.Read', 'GroupMember.Read.All'],
};

export const msalInstance = new PublicClientApplication(msalConfig);

export async function initializeMsal() {
    try {
        await msalInstance.initialize();
        console.log('[MSAL] Initialized successfully');
    } catch (error) {
        console.error('[MSAL] Initialization failed:', error);
    }
}
