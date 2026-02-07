import React, { useEffect, useState } from 'react';
import SplitTerminal from './SplitTerminal';
import { Box, CircularProgress, Typography } from '@mui/material';

const CREDENTIALS_KEY = 'terminal_credentials';
const CREDENTIALS_TIMESTAMP_KEY = 'terminal_credentials_timestamp';
const CREDENTIALS_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours

export default function TerminalPage() {
  const [credentials, setCredentials] = useState<any>(null);
  const [tabId] = useState(() => `tab_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);

  useEffect(() => {
    console.log('[TerminalPage] Tab initialized with ID:', tabId);
    
    // DO NOT restore credentials from sessionStorage on initial load
    // Each tab should receive fresh credentials from its parent window
    // This ensures multiple tabs can connect to different servers independently
    
    // Only restore if this is a page refresh (not a new tab)
    const isPageRefresh = window.performance?.navigation?.type === 1 || 
                          (window.performance?.getEntriesByType('navigation')[0] as any)?.type === 'reload';
    
    const restoreCredentials = () => {
      if (!isPageRefresh) {
        console.log('[TerminalPage] New tab detected - waiting for credentials from parent');
        return false;
      }
      
      try {
        const storedCredentials = sessionStorage.getItem(CREDENTIALS_KEY);
        const timestamp = sessionStorage.getItem(CREDENTIALS_TIMESTAMP_KEY);

        if (storedCredentials && timestamp) {
          const age = Date.now() - parseInt(timestamp);
          if (age < CREDENTIALS_EXPIRY) {
            const parsed = JSON.parse(storedCredentials);
            console.log('[TerminalPage] Restored credentials from cache (page refresh):', {
              ip: parsed.ip,
              username: parsed.username
            });
            setCredentials(parsed);
            return true;
          } else {
            // Expired, clear storage
            sessionStorage.removeItem(CREDENTIALS_KEY);
            sessionStorage.removeItem(CREDENTIALS_TIMESTAMP_KEY);
          }
        }
      } catch (error) {
        console.error('Failed to restore credentials:', error);
      }
      return false;
    };

    // Attempt to restore from storage only on page refresh
    const restored = restoreCredentials();

    // Listen for credentials from the parent window
    const handler = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;

      if (event.data && event.data.ip && event.data.username && event.data.sshKey) {
        console.log('[TerminalPage] Received NEW credentials from parent (Tab:', tabId + '):', {
          ip: event.data.ip,
          username: event.data.username,
          sshKeyLength: event.data.sshKey?.length || 0
        });

        const creds = {
          ip: event.data.ip,
          username: event.data.username,
          sshKey: event.data.sshKey,
        };

        // ALWAYS override any existing credentials (for independent tabs)
        // Clear old sessionStorage first
        sessionStorage.removeItem(CREDENTIALS_KEY);
        sessionStorage.removeItem(CREDENTIALS_TIMESTAMP_KEY);

        // Set new credentials
        setCredentials(creds);

        // Store ONLY this tab's credentials for refresh purposes
        // Note: sessionStorage is shared across tabs, but on refresh we check if it's actually a refresh
        try {
          sessionStorage.setItem(CREDENTIALS_KEY, JSON.stringify(creds));
          sessionStorage.setItem(CREDENTIALS_TIMESTAMP_KEY, Date.now().toString());
          console.log('[TerminalPage] ✓ Credentials stored for IP:', creds.ip, '(Tab:', tabId + ')');
        } catch (error) {
          console.error('Failed to store credentials:', error);
        }

        // Send ack to parent so it stops spamming
        window.opener?.postMessage('ack', window.location.origin);
      }

      if (event.data && event.data.request === 'credentials' && window.opener) {
        // If a reload in child tab, ask parent to resend credentials
        window.opener.postMessage('resend', window.location.origin);
      }
    };

    window.addEventListener('message', handler);

    // If user refreshes the tab and no stored credentials, request from parent
    if (!restored && window.opener) {
      window.opener.postMessage({ request: 'credentials' }, window.location.origin);
    }

    return () => window.removeEventListener('message', handler);
  }, []);

  if (!credentials) {
    return (
      <Box
        sx={{
          position: 'fixed',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 2,
          background: '#1e1e1e',
          color: 'white',
        }}
      >
        <CircularProgress sx={{ color: '#0073bb' }} />
        <Typography variant="body1" sx={{ fontFamily: 'monospace' }}>
          Connecting to terminal...
        </Typography>
      </Box>
    );
  }

  return (
    <SplitTerminal
      credentials={{
        ip: credentials.ip,
        username: credentials.username,
        sshKey: credentials.sshKey,
      }}
    />
  );
}
