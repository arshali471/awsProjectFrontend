import React, { useState } from 'react';
import {
    Box,
    IconButton,
    Tooltip,
    Menu,
    MenuItem,
    Slider,
    Typography,
    Divider,
    ListItemIcon,
    ListItemText,
    Select,
    FormControl,
    SelectChangeEvent
} from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';
import TextFieldsIcon from '@mui/icons-material/TextFields';
import PaletteIcon from '@mui/icons-material/Palette';
import RefreshIcon from '@mui/icons-material/Refresh';
import HistoryIcon from '@mui/icons-material/History';
import FolderIcon from '@mui/icons-material/Folder';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import SearchIcon from '@mui/icons-material/Search';
import DownloadIcon from '@mui/icons-material/Download';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import ClearIcon from '@mui/icons-material/Clear';
import HorizontalSplitIcon from '@mui/icons-material/HorizontalSplit';
import VerticalSplitIcon from '@mui/icons-material/VerticalSplit';
import CloseIcon from '@mui/icons-material/Close';

export interface TerminalTheme {
    name: string;
    background: string;
    foreground: string;
    cursor: string;
    selection: string;
    black: string;
    red: string;
    green: string;
    yellow: string;
    blue: string;
    magenta: string;
    cyan: string;
    white: string;
    brightBlack: string;
    brightRed: string;
    brightGreen: string;
    brightYellow: string;
    brightBlue: string;
    brightMagenta: string;
    brightCyan: string;
    brightWhite: string;
}

export const terminalThemes: { [key: string]: TerminalTheme } = {
    default: {
        name: 'Default Dark',
        background: '#1e1e1e',
        foreground: '#d4d4d4',
        cursor: '#ffffff',
        selection: 'rgba(255, 255, 255, 0.3)',
        black: '#000000',
        red: '#cd3131',
        green: '#0dbc79',
        yellow: '#e5e510',
        blue: '#2472c8',
        magenta: '#bc3fbc',
        cyan: '#11a8cd',
        white: '#e5e5e5',
        brightBlack: '#666666',
        brightRed: '#f14c4c',
        brightGreen: '#23d18b',
        brightYellow: '#f5f543',
        brightBlue: '#3b8eea',
        brightMagenta: '#d670d6',
        brightCyan: '#29b8db',
        brightWhite: '#ffffff',
    },
    monokai: {
        name: 'Monokai',
        background: '#272822',
        foreground: '#f8f8f2',
        cursor: '#f8f8f0',
        selection: 'rgba(255, 255, 255, 0.2)',
        black: '#272822',
        red: '#f92672',
        green: '#a6e22e',
        yellow: '#f4bf75',
        blue: '#66d9ef',
        magenta: '#ae81ff',
        cyan: '#a1efe4',
        white: '#f8f8f2',
        brightBlack: '#75715e',
        brightRed: '#f92672',
        brightGreen: '#a6e22e',
        brightYellow: '#f4bf75',
        brightBlue: '#66d9ef',
        brightMagenta: '#ae81ff',
        brightCyan: '#a1efe4',
        brightWhite: '#f9f8f5',
    },
    dracula: {
        name: 'Dracula',
        background: '#282a36',
        foreground: '#f8f8f2',
        cursor: '#f8f8f0',
        selection: 'rgba(68, 71, 90, 0.5)',
        black: '#21222c',
        red: '#ff5555',
        green: '#50fa7b',
        yellow: '#f1fa8c',
        blue: '#bd93f9',
        magenta: '#ff79c6',
        cyan: '#8be9fd',
        white: '#f8f8f2',
        brightBlack: '#6272a4',
        brightRed: '#ff6e6e',
        brightGreen: '#69ff94',
        brightYellow: '#ffffa5',
        brightBlue: '#d6acff',
        brightMagenta: '#ff92df',
        brightCyan: '#a4ffff',
        brightWhite: '#ffffff',
    },
    solarizedDark: {
        name: 'Solarized Dark',
        background: '#002b36',
        foreground: '#839496',
        cursor: '#93a1a1',
        selection: 'rgba(7, 54, 66, 0.5)',
        black: '#073642',
        red: '#dc322f',
        green: '#859900',
        yellow: '#b58900',
        blue: '#268bd2',
        magenta: '#d33682',
        cyan: '#2aa198',
        white: '#eee8d5',
        brightBlack: '#002b36',
        brightRed: '#cb4b16',
        brightGreen: '#586e75',
        brightYellow: '#657b83',
        brightBlue: '#839496',
        brightMagenta: '#6c71c4',
        brightCyan: '#93a1a1',
        brightWhite: '#fdf6e3',
    },
    nord: {
        name: 'Nord',
        background: '#2e3440',
        foreground: '#d8dee9',
        cursor: '#d8dee9',
        selection: 'rgba(76, 86, 106, 0.5)',
        black: '#3b4252',
        red: '#bf616a',
        green: '#a3be8c',
        yellow: '#ebcb8b',
        blue: '#81a1c1',
        magenta: '#b48ead',
        cyan: '#88c0d0',
        white: '#e5e9f0',
        brightBlack: '#4c566a',
        brightRed: '#bf616a',
        brightGreen: '#a3be8c',
        brightYellow: '#ebcb8b',
        brightBlue: '#81a1c1',
        brightMagenta: '#b48ead',
        brightCyan: '#8fbcbb',
        brightWhite: '#eceff4',
    },
    gruvbox: {
        name: 'Gruvbox Dark',
        background: '#282828',
        foreground: '#ebdbb2',
        cursor: '#ebdbb2',
        selection: 'rgba(235, 219, 178, 0.3)',
        black: '#282828',
        red: '#cc241d',
        green: '#98971a',
        yellow: '#d79921',
        blue: '#458588',
        magenta: '#b16286',
        cyan: '#689d6a',
        white: '#a89984',
        brightBlack: '#928374',
        brightRed: '#fb4934',
        brightGreen: '#b8bb26',
        brightYellow: '#fabd2f',
        brightBlue: '#83a598',
        brightMagenta: '#d3869b',
        brightCyan: '#8ec07c',
        brightWhite: '#ebdbb2',
    },
    light: {
        name: 'Light',
        background: '#ffffff',
        foreground: '#333333',
        cursor: '#333333',
        selection: 'rgba(0, 0, 0, 0.15)',
        black: '#000000',
        red: '#cd3131',
        green: '#00bc00',
        yellow: '#949800',
        blue: '#0451a5',
        magenta: '#bc05bc',
        cyan: '#0598bc',
        white: '#555555',
        brightBlack: '#666666',
        brightRed: '#cd3131',
        brightGreen: '#14ce14',
        brightYellow: '#b5ba00',
        brightBlue: '#0451a5',
        brightMagenta: '#bc05bc',
        brightCyan: '#0598bc',
        brightWhite: '#a5a5a5',
    },
    tokyoNight: {
        name: 'Tokyo Night',
        background: '#1a1b26',
        foreground: '#c0caf5',
        cursor: '#c0caf5',
        selection: 'rgba(40, 47, 78, 0.7)',
        black: '#15161e',
        red: '#f7768e',
        green: '#9ece6a',
        yellow: '#e0af68',
        blue: '#7aa2f7',
        magenta: '#bb9af7',
        cyan: '#7dcfff',
        white: '#a9b1d6',
        brightBlack: '#414868',
        brightRed: '#f7768e',
        brightGreen: '#9ece6a',
        brightYellow: '#e0af68',
        brightBlue: '#7aa2f7',
        brightMagenta: '#bb9af7',
        brightCyan: '#7dcfff',
        brightWhite: '#c0caf5',
    },
    oneDark: {
        name: 'One Dark',
        background: '#282c34',
        foreground: '#abb2bf',
        cursor: '#528bff',
        selection: 'rgba(67, 76, 94, 0.5)',
        black: '#282c34',
        red: '#e06c75',
        green: '#98c379',
        yellow: '#e5c07b',
        blue: '#61afef',
        magenta: '#c678dd',
        cyan: '#56b6c2',
        white: '#abb2bf',
        brightBlack: '#5c6370',
        brightRed: '#e06c75',
        brightGreen: '#98c379',
        brightYellow: '#e5c07b',
        brightBlue: '#61afef',
        brightMagenta: '#c678dd',
        brightCyan: '#56b6c2',
        brightWhite: '#ffffff',
    },
    cobalt2: {
        name: 'Cobalt2',
        background: '#193549',
        foreground: '#ffffff',
        cursor: '#f0cc09',
        selection: 'rgba(25, 53, 73, 0.5)',
        black: '#000000',
        red: '#ff0000',
        green: '#38de21',
        yellow: '#ffe50a',
        blue: '#1460d2',
        magenta: '#ff005d',
        cyan: '#00bbbb',
        white: '#bbbbbb',
        brightBlack: '#555555',
        brightRed: '#f40e17',
        brightGreen: '#3bd01d',
        brightYellow: '#edc809',
        brightBlue: '#5555ff',
        brightMagenta: '#ff55ff',
        brightCyan: '#6ae3fa',
        brightWhite: '#ffffff',
    },
    nightOwl: {
        name: 'Night Owl',
        background: '#011627',
        foreground: '#d6deeb',
        cursor: '#80a4c2',
        selection: 'rgba(95, 126, 151, 0.3)',
        black: '#011627',
        red: '#ef5350',
        green: '#22da6e',
        yellow: '#addb67',
        blue: '#82aaff',
        magenta: '#c792ea',
        cyan: '#21c7a8',
        white: '#ffffff',
        brightBlack: '#575656',
        brightRed: '#ef5350',
        brightGreen: '#22da6e',
        brightYellow: '#ffeb95',
        brightBlue: '#82aaff',
        brightMagenta: '#c792ea',
        brightCyan: '#7fdbca',
        brightWhite: '#ffffff',
    },
    materialTheme: {
        name: 'Material Theme',
        background: '#263238',
        foreground: '#eeffff',
        cursor: '#ffcc00',
        selection: 'rgba(128, 203, 196, 0.2)',
        black: '#000000',
        red: '#e53935',
        green: '#91b859',
        yellow: '#ffb62c',
        blue: '#6182b8',
        magenta: '#7c4dff',
        cyan: '#39adb5',
        white: '#ffffff',
        brightBlack: '#000000',
        brightRed: '#ff5370',
        brightGreen: '#c3e88d',
        brightYellow: '#ffcb6b',
        brightBlue: '#82aaff',
        brightMagenta: '#c792ea',
        brightCyan: '#89ddff',
        brightWhite: '#ffffff',
    },
    atomOneLight: {
        name: 'Atom One Light',
        background: '#fafafa',
        foreground: '#383a42',
        cursor: '#383a42',
        selection: 'rgba(56, 58, 66, 0.15)',
        black: '#000000',
        red: '#e45649',
        green: '#50a14f',
        yellow: '#c18401',
        blue: '#0184bc',
        magenta: '#a626a4',
        cyan: '#0997b3',
        white: '#fafafa',
        brightBlack: '#4f525e',
        brightRed: '#e06c75',
        brightGreen: '#98c379',
        brightYellow: '#e5c07b',
        brightBlue: '#61afef',
        brightMagenta: '#c678dd',
        brightCyan: '#56b6c2',
        brightWhite: '#ffffff',
    },
};

interface TerminalToolbarProps {
    connected: boolean;
    onReconnect: () => void;
    onShowHistory: () => void;
    onShowFileBrowser: () => void;
    onShowSnippets: () => void;
    onShowSearch: () => void;
    onDownloadHistory: () => void;
    onClearTerminal: () => void;
    fontSize: number;
    onFontSizeChange: (size: number) => void;
    theme: string;
    onThemeChange: (theme: string) => void;
    historyCount: number;
    fileBrowserOpen: boolean;
    snippetsOpen: boolean;
    searchOpen: boolean;
    onSplitHorizontal?: () => void;
    onSplitVertical?: () => void;
    canClose?: boolean;
    onClosePane?: () => void;
}

export default function TerminalToolbar({
    connected,
    onReconnect,
    onShowHistory,
    onShowFileBrowser,
    onShowSnippets,
    onShowSearch,
    onDownloadHistory,
    onClearTerminal,
    fontSize,
    onFontSizeChange,
    theme,
    onThemeChange,
    historyCount,
    fileBrowserOpen,
    snippetsOpen,
    searchOpen,
    onSplitHorizontal,
    onSplitVertical,
    canClose,
    onClosePane,
}: TerminalToolbarProps) {
    const [settingsAnchor, setSettingsAnchor] = useState<null | HTMLElement>(null);

    const handleSettingsClick = (event: React.MouseEvent<HTMLElement>) => {
        setSettingsAnchor(event.currentTarget);
    };

    const handleSettingsClose = () => {
        setSettingsAnchor(null);
    };

    const handleThemeChange = (event: SelectChangeEvent) => {
        onThemeChange(event.target.value);
        handleSettingsClose();
    };

    return (
        <Box
            sx={{
                height: 48,
                background: '#2d2d2d',
                borderBottom: '1px solid #444',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0 12px',
                gap: 1,
            }}
        >
            {/* Left side - Connection status */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box
                    sx={{
                        width: 10,
                        height: 10,
                        borderRadius: '50%',
                        background: connected ? '#4caf50' : '#f44336',
                        boxShadow: connected ? '0 0 8px #4caf50' : '0 0 8px #f44336',
                        animation: connected ? 'pulse 2s infinite' : 'none',
                        '@keyframes pulse': {
                            '0%, 100%': { opacity: 1 },
                            '50%': { opacity: 0.5 },
                        },
                    }}
                />
                <Typography
                    variant="caption"
                    sx={{
                        color: connected ? '#4caf50' : '#f44336',
                        fontFamily: 'monospace',
                        fontWeight: 'bold',
                    }}
                >
                    {connected ? 'Connected' : 'Disconnected'}
                </Typography>
            </Box>

            {/* Center - Actions */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flex: 1, justifyContent: 'flex-end' }}>
                <Tooltip title="Reconnect">
                    <IconButton
                        size="small"
                        onClick={onReconnect}
                        sx={{
                            color: '#888',
                            '&:hover': { color: '#4caf50', background: 'rgba(76, 175, 80, 0.1)' },
                        }}
                    >
                        <RefreshIcon fontSize="small" />
                    </IconButton>
                </Tooltip>

                <Tooltip title={`Command History (${historyCount})`}>
                    <IconButton
                        size="small"
                        onClick={onShowHistory}
                        disabled={!connected}
                        sx={{
                            color: '#888',
                            '&:hover': { color: '#2196f3', background: 'rgba(33, 150, 243, 0.1)' },
                            '&:disabled': { color: '#555' },
                        }}
                    >
                        <HistoryIcon fontSize="small" />
                    </IconButton>
                </Tooltip>

                <Tooltip title="File Browser">
                    <IconButton
                        size="small"
                        onClick={onShowFileBrowser}
                        disabled={!connected}
                        sx={{
                            color: fileBrowserOpen ? '#ff9800' : '#888',
                            background: fileBrowserOpen ? 'rgba(255, 152, 0, 0.1)' : 'transparent',
                            '&:hover': { color: '#ff9800', background: 'rgba(255, 152, 0, 0.15)' },
                            '&:disabled': { color: '#555' },
                        }}
                    >
                        <FolderIcon fontSize="small" />
                    </IconButton>
                </Tooltip>

                <Tooltip title="Command Snippets">
                    <IconButton
                        size="small"
                        onClick={onShowSnippets}
                        sx={{
                            color: snippetsOpen ? '#9c27b0' : '#888',
                            background: snippetsOpen ? 'rgba(156, 39, 176, 0.1)' : 'transparent',
                            '&:hover': { color: '#9c27b0', background: 'rgba(156, 39, 176, 0.15)' },
                        }}
                    >
                        <BookmarkIcon fontSize="small" />
                    </IconButton>
                </Tooltip>

                <Tooltip title="Search in Terminal">
                    <IconButton
                        size="small"
                        onClick={onShowSearch}
                        disabled={!connected}
                        sx={{
                            color: searchOpen ? '#00bcd4' : '#888',
                            background: searchOpen ? 'rgba(0, 188, 212, 0.1)' : 'transparent',
                            '&:hover': { color: '#00bcd4', background: 'rgba(0, 188, 212, 0.15)' },
                            '&:disabled': { color: '#555' },
                        }}
                    >
                        <SearchIcon fontSize="small" />
                    </IconButton>
                </Tooltip>

                <Tooltip title="Download History">
                    <IconButton
                        size="small"
                        onClick={onDownloadHistory}
                        disabled={!connected || historyCount === 0}
                        sx={{
                            color: '#888',
                            '&:hover': { color: '#4caf50', background: 'rgba(76, 175, 80, 0.1)' },
                            '&:disabled': { color: '#555' },
                        }}
                    >
                        <DownloadIcon fontSize="small" />
                    </IconButton>
                </Tooltip>

                <Tooltip title="Copy All Text">
                    <IconButton
                        size="small"
                        onClick={() => {
                            // This will be implemented in parent component
                            console.log('Copy all text');
                        }}
                        disabled={!connected}
                        sx={{
                            color: '#888',
                            '&:hover': { color: '#2196f3', background: 'rgba(33, 150, 243, 0.1)' },
                            '&:disabled': { color: '#555' },
                        }}
                    >
                        <ContentCopyIcon fontSize="small" />
                    </IconButton>
                </Tooltip>

                <Tooltip title="Clear Terminal">
                    <IconButton
                        size="small"
                        onClick={onClearTerminal}
                        disabled={!connected}
                        sx={{
                            color: '#888',
                            '&:hover': { color: '#f44336', background: 'rgba(244, 67, 54, 0.1)' },
                            '&:disabled': { color: '#555' },
                        }}
                    >
                        <ClearIcon fontSize="small" />
                    </IconButton>
                </Tooltip>
            </Box>

            {/* Right side - Split & Settings */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Divider orientation="vertical" flexItem sx={{ background: '#555', height: 24, mx: 0.5 }} />

                {onSplitHorizontal && (
                    <Tooltip title="Split Horizontally (⌘D)">
                        <IconButton
                            size="small"
                            onClick={onSplitHorizontal}
                            sx={{
                                color: '#888',
                                '&:hover': { color: '#2196f3', background: 'rgba(33, 150, 243, 0.1)' },
                            }}
                        >
                            <VerticalSplitIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                )}

                {onSplitVertical && (
                    <Tooltip title="Split Vertically (⌘⇧D)">
                        <IconButton
                            size="small"
                            onClick={onSplitVertical}
                            sx={{
                                color: '#888',
                                '&:hover': { color: '#2196f3', background: 'rgba(33, 150, 243, 0.1)' },
                            }}
                        >
                            <HorizontalSplitIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                )}

                {canClose && onClosePane && (
                    <Tooltip title="Close Pane">
                        <IconButton
                            size="small"
                            onClick={onClosePane}
                            sx={{
                                color: '#888',
                                '&:hover': { color: '#f44336', background: 'rgba(244, 67, 54, 0.1)' },
                            }}
                        >
                            <CloseIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                )}

                <Divider orientation="vertical" flexItem sx={{ background: '#555', height: 24, mx: 0.5 }} />

                <Tooltip title="Settings (Theme & Font)">
                    <IconButton
                        size="small"
                        onClick={handleSettingsClick}
                        sx={{
                            color: Boolean(settingsAnchor) ? '#2196f3' : '#888',
                            '&:hover': { color: '#2196f3', background: 'rgba(33, 150, 243, 0.1)' },
                        }}
                    >
                        <SettingsIcon fontSize="small" />
                    </IconButton>
                </Tooltip>
            </Box>

            {/* Settings Menu (triggered from floating button) */}
            <Menu
                anchorEl={settingsAnchor}
                open={Boolean(settingsAnchor)}
                onClose={handleSettingsClose}
                PaperProps={{
                    sx: {
                        background: '#2d2d2d',
                        color: '#fff',
                        minWidth: 280,
                        border: '1px solid #444',
                    },
                }}
            >
                <Box sx={{ px: 2, py: 1.5 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                        <TextFieldsIcon fontSize="small" sx={{ color: '#888' }} />
                        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                            Font Size: {fontSize}px
                        </Typography>
                    </Box>
                    <Slider
                        value={fontSize}
                        onChange={(_, value) => onFontSizeChange(value as number)}
                        min={10}
                        max={24}
                        step={1}
                        marks
                        valueLabelDisplay="auto"
                        sx={{
                            color: '#2196f3',
                            '& .MuiSlider-thumb': {
                                background: '#2196f3',
                            },
                        }}
                    />
                </Box>

                <Divider sx={{ background: '#444', my: 1 }} />

                <Box sx={{ px: 2, py: 1.5 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                        <PaletteIcon fontSize="small" sx={{ color: '#888' }} />
                        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                            Color Theme
                        </Typography>
                    </Box>
                    <FormControl fullWidth size="small">
                        <Select
                            value={theme}
                            onChange={handleThemeChange}
                            sx={{
                                color: '#fff',
                                background: '#1e1e1e',
                                '& .MuiOutlinedInput-notchedOutline': {
                                    borderColor: '#444',
                                },
                                '&:hover .MuiOutlinedInput-notchedOutline': {
                                    borderColor: '#666',
                                },
                                '& .MuiSvgIcon-root': {
                                    color: '#888',
                                },
                            }}
                        >
                            {Object.keys(terminalThemes).map((key) => (
                                <MenuItem
                                    key={key}
                                    value={key}
                                    sx={{
                                        background: '#2d2d2d',
                                        color: '#fff',
                                        '&:hover': { background: '#3d3d3d' },
                                        '&.Mui-selected': {
                                            background: '#4d4d4d',
                                            '&:hover': { background: '#5d5d5d' },
                                        },
                                    }}
                                >
                                    <Box
                                        sx={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 1.5,
                                            width: '100%',
                                        }}
                                    >
                                        <Box
                                            sx={{
                                                width: 20,
                                                height: 20,
                                                borderRadius: 1,
                                                background: terminalThemes[key].background,
                                                border: `2px solid ${terminalThemes[key].foreground}`,
                                            }}
                                        />
                                        <Typography variant="body2">
                                            {terminalThemes[key].name}
                                        </Typography>
                                    </Box>
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Box>
            </Menu>
        </Box>
    );
}
