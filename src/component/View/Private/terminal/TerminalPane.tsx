import React, { useEffect, useRef, useState } from 'react';
import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import { SearchAddon } from '@xterm/addon-search';
import { Box, IconButton, TextField, InputAdornment, Typography, Tooltip, Chip, Drawer, List, ListItem, ListItemButton, ListItemText } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import HistoryIcon from '@mui/icons-material/History';
import SearchIcon from '@mui/icons-material/Search';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import CloseIcon from '@mui/icons-material/Close';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import 'xterm/css/xterm.css';
import TerminalFileUpload from './TerminalFileUpload';
import TerminalToolbar, { terminalThemes } from './TerminalToolbar';
import FileBrowser from './FileBrowser';
import CommandSnippets from './CommandSnippets';
import TerminalSearch from './TerminalSearch';
import ServerConnectionManager, { RemoteServer } from './ServerConnectionManager';
import ServerFileTransfer from './ServerFileTransfer';
import CommandAutoComplete from './CommandAutoComplete';

type Props = {
    ip: string;
    username: string;
    sshKey: string;
    paneId: string;
    onSplitHorizontal?: () => void;
    onSplitVertical?: () => void;
    canClose?: boolean;
    onClosePane?: () => void;
};

const TerminalPane = ({ ip, username, sshKey, paneId, onSplitHorizontal, onSplitVertical, canClose, onClosePane }: Props) => {
    console.log(`[TerminalPane] MOUNTING component for pane: ${paneId}`);

    const terminalRef = useRef<HTMLDivElement>(null);
    const termRef = useRef<Terminal>();
    const fitRef = useRef<FitAddon>();
    const searchAddonRef = useRef<SearchAddon>();
    const socketRef = useRef<WebSocket>();
    const [connected, setConnected] = useState(false);
    const resizeObserverRef = useRef<ResizeObserver>();
    const [commandHistory, setCommandHistory] = useState<string[]>([]);
    const [showHistory, setShowHistory] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [showUpload, setShowUpload] = useState(false);
    const commandBufferRef = useRef<string>('');

    // New state for enhanced features
    const [fileBrowserOpen, setFileBrowserOpen] = useState(false);
    const [snippetsOpen, setSnippetsOpen] = useState(false);
    const [searchOpen, setSearchOpen] = useState(false);
    const [fontSize, setFontSize] = useState(14);
    const [currentTheme, setCurrentTheme] = useState('default');
    const [serverConnectOpen, setServerConnectOpen] = useState(false);
    const [fileTransferOpen, setFileTransferOpen] = useState(false);
    const [connectedServer, setConnectedServer] = useState<any>(null);
    const [savedServers, setSavedServers] = useState<RemoteServer[]>([]);

    // Autocomplete state
    const [currentCommand, setCurrentCommand] = useState('');
    const [showAutoComplete, setShowAutoComplete] = useState(false);
    const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });

    // Add cleanup logging
    useEffect(() => {
        console.log(`[TerminalPane] Component mounted for pane: ${paneId}`);
        return () => {
            console.log(`[TerminalPane] UNMOUNTING component for pane: ${paneId}`);
        };
    }, [paneId]);

    // Initialize terminal once
    useEffect(() => {
        const term = new Terminal({
            cursorBlink: true,
            fontSize: fontSize,
            fontFamily: 'Menlo, Monaco, "Courier New", monospace',
            theme: terminalThemes[currentTheme],
        });
        const fitAddon = new FitAddon();
        const searchAddon = new SearchAddon();
        term.loadAddon(fitAddon);
        term.loadAddon(searchAddon);
        term.open(terminalRef.current!);

        termRef.current = term;
        fitRef.current = fitAddon;
        searchAddonRef.current = searchAddon;

        // Wait for terminal to be fully rendered before fitting
        // Use requestAnimationFrame to ensure DOM is ready
        requestAnimationFrame(() => {
            setTimeout(() => {
                try {
                    if (fitRef.current && termRef.current) {
                        fitRef.current.fit();
                        termRef.current.focus();
                    }
                } catch (error) {
                    console.warn('Error during initial terminal fit:', error);
                }
            }, 50);
        });

        // Set up ResizeObserver for better resize handling
        resizeObserverRef.current = new ResizeObserver(() => {
            if (fitRef.current && termRef.current) {
                try {
                    fitRef.current.fit();
                    const cols = termRef.current.cols;
                    const rows = termRef.current.rows;
                    // Only send resize if WebSocket is connected
                    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
                        socketRef.current.send(JSON.stringify({ resize: true, cols, rows }));
                    }
                } catch (error) {
                    console.warn('Error during terminal resize:', error);
                }
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

    // Apply theme and font size changes
    useEffect(() => {
        if (termRef.current && fitRef.current) {
            try {
                termRef.current.options.fontSize = fontSize;
                termRef.current.options.theme = terminalThemes[currentTheme];
                // Small delay to ensure options are applied before fitting
                requestAnimationFrame(() => {
                    if (fitRef.current) {
                        fitRef.current.fit();
                    }
                });
            } catch (error) {
                console.warn('Error applying terminal theme/font:', error);
            }
        }
    }, [fontSize, currentTheme]);

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
        ws.send('history\r');

        // Safety timeout
        setTimeout(() => {
            if (isCollectingHistory) {
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

            if (commands.length > 0) {
                setCommandHistory(() => {
                    // Remove duplicates while preserving order (most recent occurrence wins)
                    const uniqueCommands = Array.from(new Set(commands.reverse()));
                    return uniqueCommands.slice(0, 500); // Limit to 500 commands
                });
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
                    setCommandHistory(prev => {
                        // Remove duplicate if exists, add to front
                        const filtered = prev.filter(cmd => cmd !== command);
                        const updated = [command, ...filtered].slice(0, 500);
                        return updated;
                    });
                }
                commandBufferRef.current = '';
                setCurrentCommand('');
                setShowAutoComplete(false);
            } else if (data === '\x7f' || data === '\b') {
                // Backspace (both DEL and BS)
                if (commandBufferRef.current.length > 0) {
                    commandBufferRef.current = commandBufferRef.current.slice(0, -1);
                    setCurrentCommand(commandBufferRef.current);

                    // Update cursor position
                    if (terminalRef.current) {
                        const rect = terminalRef.current.getBoundingClientRect();
                        const buffer = term.buffer.active;
                        const cursorX = buffer.cursorX;
                        const cursorY = buffer.cursorY;

                        setCursorPosition({
                            x: rect.left + (cursorX * 9),
                            y: rect.top + (cursorY * 17) + 50
                        });
                    }

                    setShowAutoComplete(commandBufferRef.current.length > 0);
                }
            } else if (data === '\t') {
                // Tab key - prevent default, let autocomplete handle it
                return;
            } else if (data.charCodeAt(0) >= 32 && data.charCodeAt(0) < 127) {
                // Regular printable ASCII character
                commandBufferRef.current += data;
                setCurrentCommand(commandBufferRef.current);

                // Update cursor position
                if (terminalRef.current) {
                    const rect = terminalRef.current.getBoundingClientRect();
                    const buffer = term.buffer.active;
                    const cursorX = buffer.cursorX;
                    const cursorY = buffer.cursorY;

                    setCursorPosition({
                        x: rect.left + (cursorX * 9),
                        y: rect.top + (cursorY * 17) + 50
                    });
                }

                setShowAutoComplete(true);
            } else if (data === '\x1b[A' || data === '\x1b[B') {
                // Arrow up/down - hide autocomplete when navigating history
                setShowAutoComplete(false);
            } else if (data === '\x03') {
                // Ctrl+C - clear current command
                commandBufferRef.current = '';
                setCurrentCommand('');
                setShowAutoComplete(false);
            }
        });

        term.onResize(({ cols, rows }) => {
            fit.fit();
            if (ws.readyState === WebSocket.OPEN) {
                ws.send(JSON.stringify({ resize: true, cols, rows }));
            }
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

    const handleAutoCompleteSelect = (command: string) => {
        const term = termRef.current;
        const ws = socketRef.current;

        if (!term || !ws || !connected) return;

        // Clear current command buffer
        const currentLength = commandBufferRef.current.length;
        for (let i = 0; i < currentLength; i++) {
            ws.send('\x7f'); // Send backspace
        }

        // Send the selected command
        ws.send(command);
        commandBufferRef.current = command;
        setCurrentCommand(command);
        setShowAutoComplete(false);
    };

    const saveAndConnectWithKey = async (server: RemoteServer) => {
        try {
            // Create a unique key filename
            const keyFileName = `${server.username}_${server.host}_${Date.now()}.pem`;

            // Save the key content to a file
            const ws = socketRef.current;
            if (!ws || !connected) {
                console.error('[TerminalPane] No active connection');
                return;
            }

            // Create the key file in /tmp directory with proper permissions
            const commands = [
                `cat > /tmp/${keyFileName} << 'EOF'\n${server.sshKey}\nEOF`,
                `chmod 600 /tmp/${keyFileName}`,
                `ssh -o StrictHostKeyChecking=no -i /tmp/${keyFileName} ${server.username}@${server.host}`
            ];

            // Execute commands one by one
            for (const cmd of commands) {
                ws.send(cmd + '\r');
                // Small delay between commands
                await new Promise(resolve => setTimeout(resolve, 200));
            }

            console.log('[TerminalPane] SSH connection initiated with custom key');
        } catch (error) {
            console.error('[TerminalPane] Error connecting with custom key:', error);
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

    const downloadCommandHistory = () => {
        const content = commandHistory.join('\n');
        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `terminal-history-${ip}-${Date.now()}.txt`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const handleClearTerminal = () => {
        if (termRef.current) {
            termRef.current.clear();
        }
    };

    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                width: '100%',
                height: '100%',
                background: '#1e1e1e',
            }}
        >
            {/* Enhanced Toolbar */}
            <TerminalToolbar
                connected={connected}
                onReconnect={connect}
                onShowHistory={() => setShowHistory(!showHistory)}
                onShowFileBrowser={() => setFileBrowserOpen(!fileBrowserOpen)}
                onShowSnippets={() => setSnippetsOpen(!snippetsOpen)}
                onShowSearch={() => setSearchOpen(!searchOpen)}
                onDownloadHistory={downloadCommandHistory}
                onClearTerminal={handleClearTerminal}
                fontSize={fontSize}
                onFontSizeChange={setFontSize}
                theme={currentTheme}
                onThemeChange={setCurrentTheme}
                historyCount={commandHistory.length}
                fileBrowserOpen={fileBrowserOpen}
                snippetsOpen={snippetsOpen}
                searchOpen={searchOpen}
                onSplitHorizontal={onSplitHorizontal}
                onSplitVertical={onSplitVertical}
                canClose={canClose}
                onClosePane={onClosePane}
                onShowServerConnect={() => setServerConnectOpen(true)}
                onShowFileTransfer={() => setFileTransferOpen(true)}
            />

            {/* Main Content Area */}
            <Box
                sx={{
                    display: 'flex',
                    flex: 1,
                    overflow: 'hidden',
                    position: 'relative',
                }}
            >
                {/* Command Snippets - Left Sidebar */}
                {snippetsOpen && (
                    <CommandSnippets
                        onExecuteCommand={executeCommand}
                        connected={connected}
                    />
                )}

                {/* Terminal Area */}
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        flex: 1,
                        minWidth: 0,
                        position: 'relative',
                    }}
                >
                    {/* File Upload Panel */}
                    {showUpload && (
                        <Box sx={{ padding: 2, background: '#1e1e1e' }}>
                            <TerminalFileUpload
                                serverIp={ip}
                                username={username}
                                sshKey={sshKey}
                                onClose={() => setShowUpload(false)}
                            />
                        </Box>
                    )}

                    {/* Terminal */}
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

                    {/* Search Overlay */}
                    {searchOpen && (
                        <TerminalSearch
                            terminal={termRef.current}
                            searchAddon={searchAddonRef.current}
                            onClose={() => setSearchOpen(false)}
                        />
                    )}

                    {/* Status Bar */}
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
                            <Tooltip title="Upload File">
                                <IconButton
                                    size="small"
                                    onClick={() => setShowUpload(!showUpload)}
                                    disabled={!connected}
                                    sx={{
                                        color: showUpload ? '#ff9800' : '#888',
                                        background: showUpload ? 'rgba(255, 152, 0, 0.1)' : 'transparent',
                                        '&:hover': {
                                            background: 'rgba(255, 152, 0, 0.2)',
                                            color: '#ff9800',
                                        },
                                        '&:disabled': {
                                            color: '#555',
                                            background: 'transparent',
                                        },
                                    }}
                                >
                                    <UploadFileIcon fontSize="small" />
                                </IconButton>
                            </Tooltip>
                        </Box>
                    </Box>
                </Box>

                {/* File Browser - Right Sidebar */}
                {fileBrowserOpen && (
                    <FileBrowser
                        ip={ip}
                        username={username}
                        sshKey={sshKey}
                        onExecuteCommand={executeCommand}
                        connected={connected}
                    />
                )}
            </Box>

            {/* Command History Drawer */}
            <Drawer
                anchor="right"
                open={showHistory}
                onClose={() => setShowHistory(false)}
                PaperProps={{
                    sx: {
                        width: 400,
                        background: '#252525',
                        color: '#fff',
                    },
                }}
            >
                <Box sx={{ padding: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 }}>
                        <Typography variant="h6">Command History</Typography>
                        <IconButton size="small" onClick={() => setShowHistory(false)} sx={{ color: '#888' }}>
                            <CloseIcon />
                        </IconButton>
                    </Box>
                    <TextField
                        size="small"
                        fullWidth
                        placeholder="Search commands..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon sx={{ color: '#888' }} />
                                </InputAdornment>
                            ),
                        }}
                        sx={{
                            marginBottom: 2,
                            '& .MuiOutlinedInput-root': {
                                background: '#1e1e1e',
                                color: '#fff',
                                '& fieldset': {
                                    borderColor: '#444',
                                },
                                '&:hover fieldset': {
                                    borderColor: '#666',
                                },
                                '&.Mui-focused fieldset': {
                                    borderColor: '#2196f3',
                                },
                            },
                        }}
                    />
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 }}>
                        <Chip
                            label={`${filteredHistory.length} commands`}
                            size="small"
                            sx={{ background: '#1e1e1e', color: '#888' }}
                        />
                        <Tooltip title="Fetch complete history from server">
                            <IconButton
                                size="small"
                                onClick={fetchCommandHistory}
                                disabled={!connected}
                                sx={{
                                    color: '#888',
                                    background: '#1e1e1e',
                                    border: '1px solid #444',
                                    borderRadius: 1,
                                    padding: '4px 12px',
                                    '&:hover': {
                                        background: '#2d2d2d',
                                        color: '#4fc3f7',
                                        borderColor: '#4fc3f7',
                                    },
                                    '&:disabled': {
                                        color: '#555',
                                        borderColor: '#333',
                                    },
                                }}
                            >
                                <RefreshIcon fontSize="small" sx={{ marginRight: 0.5 }} />
                                <Typography variant="caption" sx={{ fontSize: '0.7rem', fontWeight: 600 }}>
                                    Fetch All
                                </Typography>
                            </IconButton>
                        </Tooltip>
                    </Box>
                    <List sx={{ padding: 0 }}>
                        {filteredHistory.map((cmd, index) => (
                            <ListItem
                                key={index}
                                disablePadding
                                secondaryAction={
                                    <Tooltip title="Execute">
                                        <IconButton
                                            edge="end"
                                            size="small"
                                            onClick={() => {
                                                executeCommand(cmd);
                                                setShowHistory(false);
                                            }}
                                            disabled={!connected}
                                            sx={{
                                                color: '#666',
                                                '&:hover': { color: '#4caf50' },
                                                '&:disabled': { color: '#444' },
                                            }}
                                        >
                                            <PlayArrowIcon fontSize="small" />
                                        </IconButton>
                                    </Tooltip>
                                }
                                sx={{
                                    borderBottom: '1px solid #333',
                                    '&:hover': {
                                        background: '#2d2d2d',
                                    },
                                }}
                            >
                                <ListItemButton
                                    onClick={() => {
                                        executeCommand(cmd);
                                        setShowHistory(false);
                                    }}
                                    disabled={!connected}
                                >
                                    <ListItemText
                                        primary={cmd}
                                        primaryTypographyProps={{
                                            sx: {
                                                fontFamily: 'monospace',
                                                fontSize: '0.875rem',
                                                color: '#fff',
                                            },
                                        }}
                                    />
                                </ListItemButton>
                            </ListItem>
                        ))}
                    </List>
                </Box>
            </Drawer>

            {/* Server Connection Manager Dialog */}
            <ServerConnectionManager
                open={serverConnectOpen}
                onClose={() => setServerConnectOpen(false)}
                currentServer={{ ip, username }}
                onConnectToServer={(server: RemoteServer) => {
                    console.log('[TerminalPane] Connecting to server:', server);
                    setConnectedServer(server);

                    // If custom SSH key provided, we need to save it first
                    if (server.sshKey && server.sshKey.trim() !== '') {
                        // Save key to a temporary file on the backend and then connect
                        saveAndConnectWithKey(server);
                    } else {
                        // Use default SSH connection (will use current server's key via SSH agent forwarding)
                        const ws = socketRef.current;
                        if (ws && connected) {
                            const sshCommand = `ssh -o StrictHostKeyChecking=no ${server.username}@${server.host}\r`;
                            ws.send(sshCommand);
                        }
                    }
                }}
                onServersUpdate={(servers) => {
                    console.log('[TerminalPane] Servers updated:', servers);
                    setSavedServers(servers);
                }}
            />

            {/* Server File Transfer Dialog */}
            <ServerFileTransfer
                open={fileTransferOpen}
                onClose={() => setFileTransferOpen(false)}
                sourceServer={{ ip, username, sshKey }}
                targetServer={connectedServer}
                savedServers={savedServers}
                onOpenServerManager={() => {
                    setFileTransferOpen(false);
                    setServerConnectOpen(true);
                }}
            />

            {/* Command Autocomplete */}
            <CommandAutoComplete
                input={currentCommand}
                onSelect={handleAutoCompleteSelect}
                visible={showAutoComplete && connected}
                position={cursorPosition}
                commandHistory={commandHistory}
            />
        </Box>
    );
};

// Memoize TerminalPane to prevent unnecessary re-renders when splitting
// Only re-render if props actually change (ip, username, sshKey, paneId)
// Ignore function props AND canClose as they change when splitting but don't need re-render
export default React.memo(TerminalPane, (prevProps, nextProps) => {
    // Return true to SKIP re-render, false to allow re-render
    const shouldSkip = (
        prevProps.ip === nextProps.ip &&
        prevProps.username === nextProps.username &&
        prevProps.sshKey === nextProps.sshKey &&
        prevProps.paneId === nextProps.paneId
    );

    // Debug logging
    if (!shouldSkip) {
        console.log('[TerminalPane] Re-rendering pane:', nextProps.paneId);
    } else {
        console.log('[TerminalPane] SKIPPING re-render for pane:', nextProps.paneId);
    }

    return shouldSkip;
});
