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
import VSCodeFileTree from './VSCodeFileTree';
import InlineFileEditor from './InlineFileEditor';
import CommandSnippets from './CommandSnippets';
import TerminalSearch from './TerminalSearch';
import ServerConnectionManager, { RemoteServer } from './ServerConnectionManager';
import ServerFileTransfer from './ServerFileTransfer';
import CommandAutoComplete from './CommandAutoComplete';
import FileEditor from './FileEditor';

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
    // Component render (not necessarily mounting)

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
    const isMountedRef = useRef<boolean>(true);

    // New state for enhanced features
    const [fileBrowserOpen, setFileBrowserOpen] = useState(false);
    const [vscodeTreeOpen, setVscodeTreeOpen] = useState(false); // VS Code file tree (left side)
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

    // Track current working directory
    const [currentWorkingDir, setCurrentWorkingDir] = useState(`/home/${username}`);

    // File editor state (for dialog-based editor)
    const [editorOpen, setEditorOpen] = useState(false);
    const [fileToEdit, setFileToEdit] = useState<{ path: string; name: string } | null>(null);

    // Inline editor state (for VS Code-style split view)
    const [inlineFileToEdit, setInlineFileToEdit] = useState<{ path: string; name: string } | null>(null);

    const [showAutoComplete, setShowAutoComplete] = useState(false);
    const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });

    // Add cleanup logging
    useEffect(() => {
        isMountedRef.current = true;
        return () => {
            isMountedRef.current = false;
        };
    }, [paneId]);

    // Initialize terminal once
    useEffect(() => {
        const term = new Terminal({
            cursorBlink: true,
            fontSize: fontSize,
            fontFamily: 'Menlo, Monaco, "Courier New", monospace',
            theme: terminalThemes[currentTheme],
            // Ensure all input is allowed
            allowProposedApi: false,
            allowTransparency: true,
            convertEol: false,
            scrollback: 1000,
        });
        const fitAddon = new FitAddon();
        const searchAddon = new SearchAddon();
        term.loadAddon(fitAddon);
        term.loadAddon(searchAddon);
        term.open(terminalRef.current!);

        termRef.current = term;
        fitRef.current = fitAddon;
        searchAddonRef.current = searchAddon;

        // Aggressively ensure terminal has focus
        const ensureFocus = () => {
            if (term) {
                term.focus();
            }
        };

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
            if (socketRef.current) {
                socketRef.current.close();
            }
            if (term && !term.isDisposed) {
                term.dispose();
            }
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

        if (!ws || !connected || !term || !isMountedRef.current) {
            console.log('Cannot fetch history - not connected or component unmounted');
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
                if (isMountedRef.current) {
                    setCommandHistory(() => {
                        // Remove duplicates while preserving order (most recent occurrence wins)
                        const uniqueCommands = Array.from(new Set(commands.reverse()));
                        return uniqueCommands.slice(0, 500); // Limit to 500 commands
                    });
                }
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
        // Use arraybuffer to properly receive binary data from backend
        ws.binaryType = 'arraybuffer';

        // Default message handler with directory tracking
        const defaultMessageHandler = async (e: MessageEvent) => {
            let dataStr = '';
            if (typeof e.data === 'string') {
                dataStr = e.data;
                term.write(e.data);
            } else if (e.data instanceof Blob) {
                const text = await e.data.text();
                dataStr = text;
                term.write(text);
            } else if (e.data instanceof ArrayBuffer) {
                const uint8Data = new Uint8Array(e.data);
                dataStr = new TextDecoder().decode(uint8Data);
                term.write(uint8Data);
            } else {
                const uint8Data = new Uint8Array(e.data);
                dataStr = new TextDecoder().decode(uint8Data);
                term.write(uint8Data);
            }

            // Track current directory from prompt (e.g., "ubuntu@ip-172-31-41-95:~/EXMBIO$")
            // Extract directory from patterns like: user@host:~/path$ or user@host:/full/path$
            const promptMatch = dataStr.match(/[@\w-]+:([~\/][\w\-\/\.]*)\$/);
            if (promptMatch) {
                let dir = promptMatch[1];
                // Convert ~ to /home/username
                if (dir.startsWith('~')) {
                    dir = dir.replace('~', `/home/${username}`);
                }
                if (dir !== currentWorkingDir) {
                    console.log('[TerminalPane] Directory changed:', dir);
                    setCurrentWorkingDir(dir);
                }
            }
        };

        ws.onmessage = defaultMessageHandler;

        ws.onopen = () => {
            if (!isMountedRef.current) return;
            setConnected(true);
            console.log('[TerminalPane] WebSocket opened, sending handshake with IP:', ip, 'username:', username);
            ws.send(
                JSON.stringify({
                    ip,
                    username,
                    sshKey,
                    cols: term.cols,
                    rows: term.rows,
                })
            );

            // Ensure terminal is focused after connection
            setTimeout(() => {
                if (term && !term.isDisposed) {
                    term.focus();
                }
            }, 500);

            // Wait for connection to be fully established, then fetch history
            setTimeout(() => {
                if (isMountedRef.current) {
                    fetchCommandHistory();
                }
            }, 2000);
        };

        ws.onerror = () => {
            if (term && !term.isDisposed) {
                term.writeln('\r\n[WebSocket error]\r\n');
            }
        };
        ws.onclose = () => {
            if (isMountedRef.current) {
                setConnected(false);
            }
            if (term && !term.isDisposed) {
                term.writeln('\r\n[Connection closed] Click Restart to reconnect.\r\n');
            }
        };

        // Helper function to safely send data via WebSocket
        const safeSend = (data: string) => {
            if (ws.readyState === WebSocket.OPEN) {
                ws.send(data);
            } else {
                console.warn('[TerminalPane] Cannot send data - WebSocket not open. State:', ws.readyState);
            }
        };

        term.onData((data) => {
            // Send data to server - server will echo back
            safeSend(data);
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

        // Send the selected command character by character
        for (let i = 0; i < command.length; i++) {
            ws.send(command[i]);
        }

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
        
        return () => {
            if (socketRef.current) {
                socketRef.current.close();
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [paneId]);

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

                {/* VS Code File Tree - Left Sidebar */}
                {vscodeTreeOpen && (
                    <VSCodeFileTree
                        key={currentWorkingDir} // Re-mount when directory changes
                        ip={ip}
                        username={username}
                        sshKey={sshKey}
                        connected={connected}
                        initialPath={currentWorkingDir}
                        onClose={() => setVscodeTreeOpen(false)}
                        onFileSelect={(file) => setInlineFileToEdit(file)}
                    />
                )}

                {/* Main Content Area - Terminal or Editor */}
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        flex: 1,
                        minWidth: 0,
                        position: 'relative',
                    }}
                >
                    {/* Show Inline Editor when file is selected (either from tree or edit command) */}
                    {inlineFileToEdit ? (
                        <InlineFileEditor
                            file={inlineFileToEdit}
                            server={{
                                host: ip,
                                username: username,
                                sshKey: sshKey
                            }}
                            onClose={() => setInlineFileToEdit(null)}
                        />
                    ) : (
                        // Show terminal when no file is selected
                        <>
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
                        tabIndex={0}
                        // Disable any browser autocomplete or input helpers
                        autoComplete="off"
                        autoCorrect="off"
                        autoCapitalize="off"
                        spellCheck="false"
                        onClick={(e) => {
                            e.stopPropagation();
                            // Ensure terminal gets focus when clicked
                            if (termRef.current) {
                                termRef.current.focus();
                            }
                        }}
                        onFocus={() => {
                            // Also focus terminal when container gets focus
                            if (termRef.current) {
                                termRef.current.focus();
                            }
                        }}
                        onMouseDown={(e) => {
                            // Ensure we don't prevent default on mousedown which could interfere with focus
                            // Allow the terminal to handle its own mouse events
                        }}
                        onKeyDown={(e) => {
                            // Do NOT prevent default - let xterm handle all keys
                            // Force focus if needed
                            if (termRef.current) {
                                termRef.current.focus();
                            }
                        }}
                        sx={{
                            flex: 1,
                            width: '100%',
                            overflow: 'hidden',
                            cursor: 'text',
                            userSelect: 'text', // Allow text selection
                            WebkitUserSelect: 'text',
                            '& .xterm': {
                                height: '100%',
                            },
                            '& .xterm-viewport': {
                                width: '100% !important',
                            },
                            '&:focus': {
                                outline: 'none',
                            },
                            // Ensure terminal is interactive and not blocked
                            pointerEvents: 'auto',
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
                    </>
                    )}
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

            {/* Command Autocomplete - DISABLED */}
            {/*
            <CommandAutoComplete
                input={currentCommand}
                onSelect={handleAutoCompleteSelect}
                visible={showAutoComplete && connected}
                position={cursorPosition}
                commandHistory={commandHistory}
            />
            */}

            {/* File Editor */}
            <FileEditor
                open={editorOpen}
                onClose={() => {
                    setEditorOpen(false);
                    setFileToEdit(null);
                }}
                file={fileToEdit}
                server={{
                    host: ip,
                    username: username,
                    sshKey: sshKey
                }}
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
