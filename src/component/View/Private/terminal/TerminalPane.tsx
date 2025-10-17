import React, { useEffect, useRef, useState } from 'react';
import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import { Box, IconButton, TextField, InputAdornment, Typography, Tooltip, Chip } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import HistoryIcon from '@mui/icons-material/History';
import SearchIcon from '@mui/icons-material/Search';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import CloseIcon from '@mui/icons-material/Close';
import 'xterm/css/xterm.css';

type Props = {
    ip: string;
    username: string;
    sshKey: string;
    paneId: string;
};

const TerminalPane = ({ ip, username, sshKey, paneId }: Props) => {
    const terminalRef = useRef<HTMLDivElement>(null);
    const termRef = useRef<Terminal>();
    const fitRef = useRef<FitAddon>();
    const socketRef = useRef<WebSocket>();
    const [connected, setConnected] = useState(false);
    const resizeObserverRef = useRef<ResizeObserver>();
    const [commandHistory, setCommandHistory] = useState<string[]>([]);
    const [showHistory, setShowHistory] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const commandBufferRef = useRef<string>('');
    // Initialize terminal once
    useEffect(() => {
        const term = new Terminal({
            cursorBlink: true,
            fontSize: 14,
            fontFamily: 'Menlo, Monaco, "Courier New", monospace',
            theme: {
                background: '#1e1e1e',
                foreground: '#d4d4d4',
            }
        });
        const fitAddon = new FitAddon();
        term.loadAddon(fitAddon);
        term.open(terminalRef.current!);
        fitAddon.fit();
        term.focus();
        termRef.current = term;
        fitRef.current = fitAddon;

        // Set up ResizeObserver for better resize handling
        resizeObserverRef.current = new ResizeObserver(() => {
            if (fitRef.current && termRef.current) {
                fitRef.current.fit();
                const cols = termRef.current.cols;
                const rows = termRef.current.rows;
                socketRef.current?.send(JSON.stringify({ resize: true, cols, rows }));
            }
        });

        if (terminalRef.current) {
            resizeObserverRef.current.observe(terminalRef.current);
        }

        // Clean up on unmount
        return () => {
            resizeObserverRef.current?.disconnect();
            socketRef.current?.close();
            term.dispose();
        };
    }, [paneId]);

    // Fetch command history by executing 'history' command silently
    const fetchCommandHistory = () => {
        const ws = socketRef.current;
        const term = termRef.current;

        if (!ws || !connected || !term) {
            console.log('Cannot fetch history - not connected');
            return;
        }

        // Buffer to collect history output
        let historyBuffer = '';
        let isCollectingHistory = true;
        let promptCount = 0;

        console.log('=== Starting history fetch ===');

        // Store original handler
        const originalHandler = ws.onmessage;

        // Text decoder for binary data
        const decoder = new TextDecoder();

        // Override onmessage to collect history output
        ws.onmessage = (e: MessageEvent) => {
            let dataStr = '';

            // Convert data to string
            if (typeof e.data === 'string') {
                dataStr = e.data;
            } else if (e.data instanceof ArrayBuffer) {
                dataStr = decoder.decode(new Uint8Array(e.data));
            }

            if (isCollectingHistory) {
                // DON'T display output in terminal - collect silently
                historyBuffer += dataStr;
                console.log('Received data chunk (length: ' + dataStr.length + '):', dataStr.substring(0, 100).replace(/\r/g, '\\r').replace(/\n/g, '\\n'));

                // Count prompts to know when command is done
                if (dataStr.includes('$') || dataStr.includes('#') || dataStr.includes('>')) {
                    promptCount++;
                    console.log('Prompt detected, count:', promptCount);

                    // Wait for prompt after command output
                    if (promptCount >= 1) {
                        // Give a small delay to ensure all data received
                        setTimeout(() => {
                            isCollectingHistory = false;
                            console.log('=== History collection complete ===');
                            console.log('Buffer length:', historyBuffer.length);
                            console.log('First 500 chars:', historyBuffer.substring(0, 500).replace(/\r/g, '\\r').replace(/\n/g, '\\n'));

                            // Parse history
                            parseHistoryOutput(historyBuffer);

                            // Restore handler
                            ws.onmessage = originalHandler;
                        }, 200);
                    }
                }
            } else if (originalHandler) {
                // @ts-expect-error - WebSocket event handler context
                originalHandler(e);
            }
        };

        // Send history command
        console.log('Sending: history');
        ws.send('history\r');

        // Safety timeout
        setTimeout(() => {
            if (isCollectingHistory) {
                console.log('History fetch timeout - forcing completion');
                console.log('Buffer at timeout:', historyBuffer);
                isCollectingHistory = false;
                parseHistoryOutput(historyBuffer);
                ws.onmessage = originalHandler;
            }
        }, 5000);
    };

    // Parse history command output
    const parseHistoryOutput = (output: string) => {
        try {
            // Remove ANSI escape codes and control characters
            const cleanOutput = output
                .replace(/\x1b\[[0-9;]*m/g, '')           // Color codes
                .replace(/\x1b\[?[0-9;]*[A-Za-z]/g, '')  // Other escape sequences
                .replace(/\r/g, '');                       // Carriage returns

            // Split by lines
            const lines = cleanOutput.split('\n');

            const commands: string[] = [];

            console.log('Raw history output lines:', lines);

            lines.forEach(line => {
                // Match history format: "  123  command" or "123  command" or "  123 command"
                // Also handle formats like "  123* command" (with asterisks)
                const match = line.match(/^\s*(\d+)\s*\*?\s+(.+)$/);
                if (match && match[2]) {
                    const cmd = match[2].trim();
                    // Skip empty commands and the history command itself
                    if (cmd && cmd.length > 0 && cmd !== 'history') {
                        commands.push(cmd);
                    }
                }
            });

            console.log('Parsed commands from history:', commands);
            console.log('Total commands found:', commands.length);

            if (commands.length > 0) {
                setCommandHistory(() => {
                    // Remove duplicates while preserving order (most recent occurrence wins)
                    const uniqueCommands = Array.from(new Set(commands.reverse()));
                    console.log('Unique commands after deduplication:', uniqueCommands.length);
                    console.log('Setting command history state with', uniqueCommands.length, 'commands');
                    return uniqueCommands.slice(0, 500); // Limit to 500 commands
                });
            } else {
                console.warn('No commands parsed from history output');
                console.warn('Check if history output matches expected format');
                console.warn('Sample lines:', lines.slice(0, 10));
            }
        } catch (error) {
            console.error('Failed to parse history output:', error);
        }
    };

    // Connect function
    const connect = () => {
        // Close existing socket
        socketRef.current?.close();

        const term = termRef.current!;
        const fit = fitRef.current!;

        const sshWsUrl = import.meta.env.VITE_SSH_WS_URL || 'ws://localhost:3100/ssh';

        const ws = new WebSocket(sshWsUrl);
        ws.binaryType = 'arraybuffer';

        // Default message handler
        const defaultMessageHandler = (e: MessageEvent) => {
            if (typeof e.data === 'string') {
                term.write(e.data);
            } else {
                term.write(new Uint8Array(e.data));
            }
        };

        ws.onmessage = defaultMessageHandler;

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

            // Wait for connection to be fully established, then fetch history
            setTimeout(() => {
                console.log('Calling fetchCommandHistory after connection');
                fetchCommandHistory();
            }, 2000);
        };

        ws.onerror = () => term.writeln('\r\n[WebSocket error]\r\n');
        ws.onclose = () => {
            setConnected(false);
            term.writeln('\r\n[Connection closed] Click Restart to reconnect.\r\n');
        };

        term.onData((data) => {
            ws.send(data);

            // Track commands (detect Enter key)
            if (data === '\r') {
                const command = commandBufferRef.current.trim();
                if (command && command.length > 0 && command !== 'history') {
                    console.log('Adding command to history:', command);
                    setCommandHistory(prev => {
                        // Remove duplicate if exists, add to front
                        const filtered = prev.filter(cmd => cmd !== command);
                        const updated = [command, ...filtered].slice(0, 500);
                        console.log('Updated history length:', updated.length);
                        return updated;
                    });
                }
                commandBufferRef.current = '';
            } else if (data === '\x7f') {
                // Backspace
                commandBufferRef.current = commandBufferRef.current.slice(0, -1);
            } else if (data.charCodeAt(0) >= 32 && data.charCodeAt(0) < 127) {
                // Regular printable ASCII character
                commandBufferRef.current += data;
            }
        });

        term.onResize(({ cols, rows }) => {
            fit.fit();
            ws.send(JSON.stringify({ resize: true, cols, rows }));
        });

        // initial fit after socket opens
        setTimeout(() => fit.fit(), 100);

        socketRef.current = ws;
    };

    const executeCommand = (command: string) => {
        const term = termRef.current;
        const ws = socketRef.current;
        if (term && ws && connected) {
            // Send the command
            ws.send(command + '\r');
            // Update terminal display
            term.write(command + '\r\n');
        }
    };

    // Establish initial connection
    useEffect(() => {
        connect();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const filteredHistory = commandHistory.filter(cmd =>
        cmd.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'row',
                width: '100%',
                height: '100%',
                background: '#1e1e1e',
            }}
        >
            {/* Terminal */}
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    flex: 1,
                    minWidth: 0,
                }}
            >
                <Box
                    ref={terminalRef}
                    sx={{
                        flex: 1,
                        width: '100%',
                        overflow: 'hidden',
                        '& .xterm': {
                            height: '100%',
                        },
                        '& .xterm-viewport': {
                            width: '100% !important',
                        }
                    }}
                />
                <Box
                    sx={{
                        height: 32,
                        background: '#2d2d2d',
                        color: '#0f0',
                        fontFamily: 'monospace',
                        fontSize: 12,
                        borderTop: '1px solid #444',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '0 12px',
                    }}
                >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <span>🖥️</span>
                        <span style={{ fontWeight: 'bold', color: '#4fc3f7' }}>{ip}</span>
                        <span style={{ color: '#666' }}>|</span>
                        <span>👤</span>
                        <span style={{ fontWeight: 'bold', color: '#81c784' }}>{username}</span>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Tooltip title="Command History">
                            <IconButton
                                size="small"
                                onClick={() => setShowHistory(!showHistory)}
                                sx={{
                                    color: showHistory ? '#4fc3f7' : '#888',
                                    background: showHistory ? 'rgba(79, 195, 247, 0.1)' : 'transparent',
                                    '&:hover': {
                                        background: 'rgba(79, 195, 247, 0.2)',
                                        color: '#4fc3f7',
                                    },
                                }}
                            >
                                <HistoryIcon fontSize="small" />
                            </IconButton>
                        </Tooltip>
                        {connected ? (
                            <span style={{ color: '#81c784' }}>📡 Connected</span>
                        ) : (
                            <IconButton
                                size="small"
                                onClick={connect}
                                sx={{
                                    color: '#0f0',
                                    background: 'rgba(15, 255, 0, 0.1)',
                                    '&:hover': {
                                        background: 'rgba(15, 255, 0, 0.2)',
                                    },
                                }}
                            >
                                <RefreshIcon fontSize="small" />
                            </IconButton>
                        )}
                    </Box>
                </Box>
            </Box>

            {/* Command History Sidebar */}
            {showHistory && (
                <Box
                    sx={{
                        width: 350,
                        background: '#1e1e1e',
                        borderLeft: '1px solid #444',
                        display: 'flex',
                        flexDirection: 'column',
                    }}
                >
                    {/* Header */}
                    <Box
                        sx={{
                            height: 48,
                            background: '#2d2d2d',
                            borderBottom: '1px solid #444',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '0 12px',
                        }}
                    >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <HistoryIcon sx={{ color: '#4fc3f7', fontSize: 20 }} />
                            <Typography
                                sx={{
                                    color: '#4fc3f7',
                                    fontWeight: 600,
                                    fontSize: 14,
                                    fontFamily: 'monospace',
                                }}
                            >
                                Command History ({commandHistory.length})
                            </Typography>
                            <Tooltip title="Refresh History from Server">
                                <IconButton
                                    size="small"
                                    onClick={fetchCommandHistory}
                                    sx={{
                                        color: '#81c784',
                                        background: 'rgba(129, 199, 132, 0.15)',
                                        border: '1px solid rgba(129, 199, 132, 0.3)',
                                        '&:hover': {
                                            color: '#fff',
                                            background: 'rgba(129, 199, 132, 0.3)',
                                            borderColor: '#81c784',
                                        },
                                    }}
                                >
                                    <RefreshIcon fontSize="small" />
                                </IconButton>
                            </Tooltip>
                        </Box>
                        <Box sx={{ display: 'flex', gap: 0.5 }}>
                            <IconButton
                                size="small"
                                onClick={() => setShowHistory(false)}
                                sx={{
                                    color: '#888',
                                    '&:hover': {
                                        color: '#fff',
                                        background: 'rgba(255, 255, 255, 0.1)',
                                    },
                                }}
                            >
                                <CloseIcon fontSize="small" />
                            </IconButton>
                        </Box>
                    </Box>

                    {/* Search */}
                    <Box sx={{ padding: '12px' }}>
                        <TextField
                            fullWidth
                            size="small"
                            placeholder="Search commands..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon sx={{ color: '#888', fontSize: 18 }} />
                                    </InputAdornment>
                                ),
                            }}
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    background: '#2d2d2d',
                                    color: '#fff',
                                    fontFamily: 'monospace',
                                    fontSize: 13,
                                    '& fieldset': {
                                        borderColor: '#444',
                                    },
                                    '&:hover fieldset': {
                                        borderColor: '#4fc3f7',
                                    },
                                    '&.Mui-focused fieldset': {
                                        borderColor: '#4fc3f7',
                                    },
                                },
                                '& .MuiInputBase-input::placeholder': {
                                    color: '#666',
                                    opacity: 1,
                                },
                            }}
                        />
                    </Box>

                    {/* Command List */}
                    <Box
                        sx={{
                            flex: 1,
                            overflowY: 'auto',
                            padding: '0 12px 12px',
                            '&::-webkit-scrollbar': {
                                width: '8px',
                            },
                            '&::-webkit-scrollbar-track': {
                                background: '#1e1e1e',
                            },
                            '&::-webkit-scrollbar-thumb': {
                                background: '#444',
                                borderRadius: '4px',
                                '&:hover': {
                                    background: '#555',
                                },
                            },
                        }}
                    >
                        {filteredHistory.length === 0 ? (
                            <Box
                                sx={{
                                    textAlign: 'center',
                                    color: '#666',
                                    fontSize: 13,
                                    fontFamily: 'monospace',
                                    marginTop: 4,
                                }}
                            >
                                {searchQuery ? 'No commands found' : 'No command history yet'}
                            </Box>
                        ) : (
                            filteredHistory.map((cmd, index) => (
                                <Tooltip key={index} title="Click to execute" placement="left">
                                    <Box
                                        onClick={() => executeCommand(cmd)}
                                        sx={{
                                            background: '#2d2d2d',
                                            border: '1px solid #444',
                                            borderRadius: '6px',
                                            padding: '10px 12px',
                                            marginBottom: '8px',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 1,
                                            '&:hover': {
                                                background: '#3d3d3d',
                                                borderColor: '#4fc3f7',
                                                transform: 'translateX(-4px)',
                                            },
                                        }}
                                    >
                                        <PlayArrowIcon
                                            sx={{
                                                color: '#81c784',
                                                fontSize: 16,
                                            }}
                                        />
                                        <Typography
                                            sx={{
                                                color: '#fff',
                                                fontFamily: 'monospace',
                                                fontSize: 13,
                                                wordBreak: 'break-all',
                                                flex: 1,
                                            }}
                                        >
                                            {cmd}
                                        </Typography>
                                        <Chip
                                            label={index === 0 ? 'Latest' : `${index + 1}`}
                                            size="small"
                                            sx={{
                                                height: 20,
                                                fontSize: 10,
                                                background: index === 0 ? 'rgba(129, 199, 132, 0.2)' : 'rgba(79, 195, 247, 0.2)',
                                                color: index === 0 ? '#81c784' : '#4fc3f7',
                                                fontFamily: 'monospace',
                                                fontWeight: 600,
                                            }}
                                        />
                                    </Box>
                                </Tooltip>
                            ))
                        )}
                    </Box>
                </Box>
            )}
        </Box>
    );
};

// Use React.memo to prevent re-renders when props haven't changed
export default React.memo(TerminalPane, (prevProps, nextProps) => {
    // Only re-render if paneId changes (which means it's actually a different terminal)
    return prevProps.paneId === nextProps.paneId;
});
