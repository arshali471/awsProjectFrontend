import React, { useState, useEffect, useRef } from 'react';
import TerminalPane from './TerminalPane';
import { Box, IconButton, Tooltip, Typography } from '@mui/material';
import VerticalSplitIcon from '@mui/icons-material/VerticalSplit';
import HorizontalSplitIcon from '@mui/icons-material/HorizontalSplit';
import CloseIcon from '@mui/icons-material/Close';

type Credentials = {
    ip: string;
    username: string;
    sshKey: string;
};

type Pane = {
    id: string;
    credentials?: Credentials;
    splitDirection?: 'horizontal' | 'vertical';
    children?: [Pane, Pane];
};

interface SplitTerminalProps {
    credentials: Credentials;
}

let paneIdCounter = 0;

const LAYOUT_KEY = 'terminal_layout';
const LAYOUT_TIMESTAMP_KEY = 'terminal_layout_timestamp';
const LAYOUT_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours

export default function SplitTerminal({ credentials }: SplitTerminalProps) {
    // Store terminal components to prevent remounting
    const terminalComponentsRef = useRef<Map<string, React.ReactElement>>(new Map());

    // Initialize from saved layout or create new
    const initializePane = (): Pane => {
        try {
            const savedLayout = sessionStorage.getItem(LAYOUT_KEY);
            const timestamp = sessionStorage.getItem(LAYOUT_TIMESTAMP_KEY);

            if (savedLayout && timestamp) {
                const age = Date.now() - parseInt(timestamp);
                if (age < LAYOUT_EXPIRY) {
                    const layout = JSON.parse(savedLayout);
                    // Restore credentials in all panes
                    const restoreCredentials = (pane: Pane): Pane => {
                        if (pane.children) {
                            return {
                                ...pane,
                                children: [
                                    restoreCredentials(pane.children[0]),
                                    restoreCredentials(pane.children[1])
                                ] as [Pane, Pane]
                            };
                        }
                        return { ...pane, credentials };
                    };

                    // Update counter to avoid ID conflicts
                    const updateCounter = (pane: Pane) => {
                        const idNum = parseInt(pane.id.split('-')[1]);
                        if (idNum >= paneIdCounter) {
                            paneIdCounter = idNum + 1;
                        }
                        if (pane.children) {
                            updateCounter(pane.children[0]);
                            updateCounter(pane.children[1]);
                        }
                    };

                    const restoredLayout = restoreCredentials(layout);
                    updateCounter(restoredLayout);
                    return restoredLayout;
                }
            }
        } catch (error) {
            console.error('Failed to restore layout:', error);
        }

        // Default single pane
        return {
            id: `pane-${paneIdCounter++}`,
            credentials,
        };
    };

    const [rootPane, setRootPane] = useState<Pane>(initializePane());
    const [focusedPaneId, setFocusedPaneId] = useState<string>(rootPane.id);

    // Save layout to sessionStorage whenever it changes
    useEffect(() => {
        try {
            // Remove credentials before saving (security)
            const stripCredentials = (pane: Pane): any => {
                if (pane.children) {
                    return {
                        id: pane.id,
                        splitDirection: pane.splitDirection,
                        children: [
                            stripCredentials(pane.children[0]),
                            stripCredentials(pane.children[1])
                        ]
                    };
                }
                return { id: pane.id };
            };

            const layoutToSave = stripCredentials(rootPane);
            sessionStorage.setItem(LAYOUT_KEY, JSON.stringify(layoutToSave));
            sessionStorage.setItem(LAYOUT_TIMESTAMP_KEY, Date.now().toString());
        } catch (error) {
            console.error('Failed to save layout:', error);
        }
    }, [rootPane]);

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Cmd/Ctrl + D: Split horizontally
            if ((e.metaKey || e.ctrlKey) && e.key === 'd') {
                e.preventDefault();
                splitPane(focusedPaneId, 'horizontal');
            }
            // Cmd/Ctrl + Shift + D: Split vertically
            if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 'D') {
                e.preventDefault();
                splitPane(focusedPaneId, 'vertical');
            }
            // Cmd/Ctrl + W: Close pane
            if ((e.metaKey || e.ctrlKey) && e.key === 'w') {
                if (countPanes(rootPane) > 1) {
                    e.preventDefault();
                    closePane(focusedPaneId);
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [focusedPaneId, rootPane]);

    const splitPane = (paneId: string, direction: 'horizontal' | 'vertical') => {
        // Create new pane ID
        const newPaneId = `pane-${paneIdCounter++}`;

        const transformPane = (pane: Pane): Pane => {
            // If this is the pane we're splitting
            if (!pane.children && pane.id === paneId) {
                const newPane: Pane = {
                    id: newPaneId,
                    credentials: pane.credentials,
                };

                // Create container - use a new ID for container
                const containerId = `pane-${paneIdCounter++}`;
                return {
                    id: containerId,
                    splitDirection: direction,
                    children: [
                        pane, // Keep the EXACT SAME object reference!
                        newPane,
                    ] as [Pane, Pane]
                };
            }

            // For containers, recursively transform
            if (pane.children) {
                const child0 = transformPane(pane.children[0]);
                const child1 = transformPane(pane.children[1]);

                // Only create new object if children changed
                if (child0 !== pane.children[0] || child1 !== pane.children[1]) {
                    return {
                        ...pane,
                        children: [child0, child1] as [Pane, Pane]
                    };
                }
            }

            // Return same reference if nothing changed
            return pane;
        };

        const newRootPane = transformPane(rootPane);
        setRootPane(newRootPane);
        setFocusedPaneId(newPaneId);
    };

    const closePane = (paneId: string) => {
        // Cannot close if this is the only pane
        if (rootPane.id === paneId && !rootPane.children) {
            return;
        }

        // Special case: if we're closing a direct child of root
        if (rootPane.children && (rootPane.children[0].id === paneId || rootPane.children[1].id === paneId)) {
            const remainingChild = rootPane.children.find(child => child.id !== paneId);
            if (remainingChild) {
                setRootPane({ ...remainingChild });
                setFocusedPaneId(remainingChild.children ? findFirstLeafPane(remainingChild)?.id || remainingChild.id : remainingChild.id);
            }
            return;
        }

        const newRootPane = JSON.parse(JSON.stringify(rootPane));
        const parent = findParentPane(newRootPane, paneId);

        if (parent && parent.children) {
            const remainingChild = parent.children.find((child: Pane) => child.id !== paneId);
            if (remainingChild) {
                // Replace parent with remaining child's properties
                parent.id = remainingChild.id;
                parent.credentials = remainingChild.credentials;
                parent.children = remainingChild.children;
                parent.splitDirection = remainingChild.splitDirection;
            }
        }

        setRootPane(newRootPane);

        // Update focus if closing the focused pane
        if (focusedPaneId === paneId) {
            const firstPane = findFirstLeafPane(newRootPane);
            if (firstPane) {
                setFocusedPaneId(firstPane.id);
            }
        }
    };

    const findFirstLeafPane = (pane: Pane): Pane | null => {
        if (!pane.children) {
            return pane;
        }
        return findFirstLeafPane(pane.children[0]);
    };

    const findPane = (pane: Pane, id: string): Pane | null => {
        if (pane.id === id) return pane;
        if (pane.children) {
            return findPane(pane.children[0], id) || findPane(pane.children[1], id);
        }
        return null;
    };

    const findParentPane = (pane: Pane, childId: string): Pane | null => {
        if (pane.children) {
            if (pane.children[0].id === childId || pane.children[1].id === childId) {
                return pane;
            }
            return findParentPane(pane.children[0], childId) || findParentPane(pane.children[1], childId);
        }
        return null;
    };

    const renderPane = (pane: Pane): React.ReactNode => {
        if (pane.children) {
            const isHorizontal = pane.splitDirection === 'horizontal';
            return (
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: isHorizontal ? 'row' : 'column',
                        width: '100%',
                        height: '100%',
                        gap: '2px',
                    }}
                >
                    <Box sx={{ flex: 1, minWidth: 0, minHeight: 0 }}>
                        {renderPane(pane.children[0])}
                    </Box>
                    <Box sx={{ flex: 1, minWidth: 0, minHeight: 0 }}>
                        {renderPane(pane.children[1])}
                    </Box>
                </Box>
            );
        }

        const isFocused = pane.id === focusedPaneId;
        const canClose = countPanes(rootPane) > 1;

        return (
            <Box
                sx={{
                    position: 'relative',
                    width: '100%',
                    height: '100%',
                    border: isFocused ? '2px solid #0073bb' : '2px solid transparent',
                    transition: 'border-color 0.2s',
                }}
                onClick={() => setFocusedPaneId(pane.id)}
            >
                {/* Split Controls */}
                <Box
                    sx={{
                        position: 'absolute',
                        top: 8,
                        right: 8,
                        zIndex: 1000,
                        display: 'flex',
                        gap: 0.5,
                        opacity: isFocused ? 1 : 0.3,
                        transition: 'opacity 0.2s',
                        '&:hover': { opacity: 1 },
                    }}
                >
                    <Tooltip title="Split Horizontally (⌘D)">
                        <IconButton
                            size="small"
                            onClick={(e) => {
                                e.stopPropagation();
                                splitPane(pane.id, 'horizontal');
                            }}
                            sx={{
                                background: 'rgba(0, 0, 0, 0.7)',
                                color: 'white',
                                '&:hover': {
                                    background: 'rgba(0, 115, 187, 0.9)',
                                },
                            }}
                        >
                            <VerticalSplitIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Split Vertically (⌘⇧D)">
                        <IconButton
                            size="small"
                            onClick={(e) => {
                                e.stopPropagation();
                                splitPane(pane.id, 'vertical');
                            }}
                            sx={{
                                background: 'rgba(0, 0, 0, 0.7)',
                                color: 'white',
                                '&:hover': {
                                    background: 'rgba(0, 115, 187, 0.9)',
                                },
                            }}
                        >
                            <HorizontalSplitIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                    {canClose && (
                        <Tooltip title="Close Pane (⌘W)">
                            <IconButton
                                size="small"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    closePane(pane.id);
                                }}
                                sx={{
                                    background: 'rgba(0, 0, 0, 0.7)',
                                    color: 'white',
                                    '&:hover': {
                                        background: 'rgba(220, 53, 69, 0.9)',
                                    },
                                }}
                            >
                                <CloseIcon fontSize="small" />
                            </IconButton>
                        </Tooltip>
                    )}
                </Box>

                {/* Use cached component if exists, otherwise create new one */}
                {(() => {
                    if (!terminalComponentsRef.current.has(pane.id) && pane.credentials) {
                        // Create and cache the terminal component
                        const terminalComponent = (
                            <TerminalPane
                                key={pane.id}
                                ip={pane.credentials.ip}
                                username={pane.credentials.username}
                                sshKey={pane.credentials.sshKey}
                                paneId={pane.id}
                            />
                        );
                        terminalComponentsRef.current.set(pane.id, terminalComponent);
                    }
                    return terminalComponentsRef.current.get(pane.id);
                })()}
            </Box>
        );
    };

    const countPanes = (pane: Pane): number => {
        if (pane.children) {
            return countPanes(pane.children[0]) + countPanes(pane.children[1]);
        }
        return 1;
    };

    return (
        <Box
            sx={{
                position: 'fixed',
                inset: 0,
                width: '100vw',
                height: '100vh',
                background: '#000',
                overflow: 'hidden',
            }}
        >
            {renderPane(rootPane)}

            {/* Keyboard shortcuts help */}
            <Box
                sx={{
                    position: 'fixed',
                    bottom: 8,
                    left: 8,
                    background: 'rgba(0, 0, 0, 0.8)',
                    color: '#888',
                    padding: '6px 12px',
                    borderRadius: 1,
                    fontSize: '11px',
                    fontFamily: 'monospace',
                    display: 'flex',
                    gap: 2,
                    opacity: 0.5,
                    transition: 'opacity 0.2s',
                    '&:hover': { opacity: 1 },
                }}
            >
                <span>⌘D Split H</span>
                <span>⌘⇧D Split V</span>
                <span>⌘W Close</span>
            </Box>
        </Box>
    );
}
