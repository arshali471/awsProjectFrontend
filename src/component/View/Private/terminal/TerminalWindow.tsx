import React, { useEffect, useRef, useState } from 'react';
import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import 'xterm/css/xterm.css';

type Props = { ip: string; username: string; sshKey: string };

export default function TerminalWindow({ ip, username, sshKey }: Props) {
    const terminalRef = useRef<HTMLDivElement>(null);
    const termRef = useRef<Terminal>();
    const fitRef = useRef<FitAddon>();
    const socketRef = useRef<WebSocket>();
    const [connected, setConnected] = useState(false);

    // Initialize terminal once
    useEffect(() => {
        const term = new Terminal({ cursorBlink: true });
        const fitAddon = new FitAddon();
        term.loadAddon(fitAddon);
        term.open(terminalRef.current!);
        fitAddon.fit();
        term.focus();
        termRef.current = term;
        fitRef.current = fitAddon;

        // Clean up on unmount
        return () => {
            window.removeEventListener('resize', handleResize);
            term.dispose();
        };
    }, []);

    // Handle window resize for fitting
    const handleResize = () => {
        fitRef.current?.fit();
        const cols = termRef.current!.cols;
        const rows = termRef.current!.rows;
        socketRef.current?.send(JSON.stringify({ resize: true, cols, rows }));
    };
    useEffect(() => {
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Connect function
    const connect = () => {
        // Close existing socket
        socketRef.current?.close();

        const term = termRef.current!;
        const fit = fitRef.current!;

        const sshWsUrl = import.meta.env.VITE_SSH_WS_URL || 'ws://localhost:3100/ssh';
        console.log('Connecting to WebSocket:', sshWsUrl);

        const ws = new WebSocket(sshWsUrl);
        ws.binaryType = 'arraybuffer';

        // const ws = new WebSocket('ws://localhost:3100/ssh');
        // ws.binaryType = 'arraybuffer';

        ws.onopen = () => {
            setConnected(true);
            ws.send(
                JSON.stringify({
                    ip,
                    username,
                    sshKey,
                    cols: term.cols,
                    rows: term.rows,
                })
            );
        };

        ws.onmessage = (e) => {
            if (typeof e.data === 'string') {
                term.write(e.data);
            } else {
                term.write(new Uint8Array(e.data));
            }
        };
        ws.onerror = () => term.writeln('\r\n[WebSocket error]\r\n');
        ws.onclose = () => {
            setConnected(false);
            term.writeln('\r\n[Connection closed] Press Restart to reconnect.\r\n');
        };

        term.onData((data) => ws.send(data));
        term.onResize(({ cols, rows }) => {
            fit.fit();
            ws.send(JSON.stringify({ resize: true, cols, rows }));
        });

        // initial fit after socket opens
        setTimeout(() => fit.fit(), 100);

        socketRef.current = ws;
    };

    // Establish initial connection
    useEffect(() => {
        connect();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div
            style={{
                position: 'fixed',
                inset: 0,
                display: 'flex',
                flexDirection: 'column',
                width: '100vw',
                height: '100vh',
                background: '#000',
            }}
        >
            <div
                ref={terminalRef}
                style={{
                    flex: 1,
                    width: '100%',
                    overflow: 'hidden',
                }}
            />
            <div
                style={{
                    height: 36,
                    background: '#222',
                    color: '#0f0',
                    fontFamily: 'monospace',
                    fontSize: 14,
                    borderTop: '1px solid #333',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '0 16px',
                }}
            >
                <span>
                    🖥️ <b>{ip}</b> &nbsp;|&nbsp; 👤 <b>{username}</b>
                </span>
                <span>
                    {connected ? (
                        '📡 SSH Session Active'
                    ) : (
                        <button
                            onClick={connect}
                            style={{
                                background: '#0f0',
                                color: '#000',
                                border: 'none',
                                padding: '4px 8px',
                                cursor: 'pointer',
                                fontWeight: 'bold',
                                fontFamily: 'monospace',
                            }}
                        >
                            Restart
                        </button>
                    )}
                </span>
            </div>
        </div>
    );
}