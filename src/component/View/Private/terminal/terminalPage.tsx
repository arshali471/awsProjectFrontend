import React, { useEffect, useState } from 'react';
import TerminalWindow from './TerminalWindow';

export default function TerminalPage() {
  const [credentials, setCredentials] = useState<any>(null);

  useEffect(() => {
    // Listen for credentials from the parent window
    const handler = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      if (event.data && event.data.ip && event.data.username && event.data.sshKey) {
        setCredentials(event.data);
        // Send ack to parent so it stops spamming
        window.opener?.postMessage('ack', window.location.origin);
      }
      if (event.data && event.data.request === 'credentials' && window.opener) {
        // If a reload in child tab, ask parent to resend credentials
        window.opener.postMessage('resend', window.location.origin);
      }
    };
    window.addEventListener('message', handler);

    // If user refreshes the tab, request credentials from parent
    if (window.opener) {
      window.opener.postMessage({ request: 'credentials' }, window.location.origin);
    }

    return () => window.removeEventListener('message', handler);
  }, []);

  if (!credentials) return <div>Waiting for credentials...</div>;

  return (
    <TerminalWindow
      ip={credentials.ip}
      username={credentials.username}
      sshKey={credentials.sshKey}
    />
  );
}
