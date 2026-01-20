import React, { useState, useEffect } from 'react';
import {
    Box,
    TextField,
    IconButton,
    Tooltip,
    Typography,
    Checkbox,
    FormControlLabel,
    Chip,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import { Terminal } from 'xterm';
import { SearchAddon } from '@xterm/addon-search';

interface TerminalSearchProps {
    terminal: Terminal | undefined;
    searchAddon: SearchAddon | undefined;
    onClose: () => void;
}

export default function TerminalSearch({ terminal, searchAddon, onClose }: TerminalSearchProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [caseSensitive, setCaseSensitive] = useState(false);
    const [wholeWord, setWholeWord] = useState(false);
    const [regex, setRegex] = useState(false);
    const [currentMatch, setCurrentMatch] = useState(0);
    const [totalMatches, setTotalMatches] = useState(0);

    // Count total matches in terminal buffer
    const countMatches = (term: string): number => {
        if (!terminal || !term) return 0;

        let count = 0;
        const buffer = terminal.buffer.active;

        try {
            for (let i = 0; i < buffer.length; i++) {
                const line = buffer.getLine(i);
                if (!line) continue;

                const lineText = line.translateToString(true);

                if (regex) {
                    try {
                        const regexPattern = new RegExp(term, caseSensitive ? 'g' : 'gi');
                        const matches = lineText.match(regexPattern);
                        if (matches) count += matches.length;
                    } catch (e) {
                        // Invalid regex, skip
                    }
                } else if (wholeWord) {
                    const wordBoundary = caseSensitive
                        ? new RegExp(`\\b${term}\\b`, 'g')
                        : new RegExp(`\\b${term}\\b`, 'gi');
                    const matches = lineText.match(wordBoundary);
                    if (matches) count += matches.length;
                } else {
                    const searchText = caseSensitive ? lineText : lineText.toLowerCase();
                    const searchPattern = caseSensitive ? term : term.toLowerCase();
                    let pos = 0;
                    while ((pos = searchText.indexOf(searchPattern, pos)) !== -1) {
                        count++;
                        pos += searchPattern.length;
                    }
                }
            }
        } catch (error) {
            console.error('Error counting matches:', error);
        }

        return count;
    };

    // Perform search when search term or options change
    useEffect(() => {
        if (searchTerm && searchAddon && terminal) {
            // Count total matches
            const total = countMatches(searchTerm);
            setTotalMatches(total);

            if (total > 0) {
                // Find first match
                const found = searchAddon.findNext(searchTerm, {
                    caseSensitive,
                    wholeWord,
                    regex,
                });

                if (found) {
                    setCurrentMatch(1);
                } else {
                    setCurrentMatch(0);
                }
            } else {
                setCurrentMatch(0);
            }
        } else {
            setCurrentMatch(0);
            setTotalMatches(0);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchTerm, caseSensitive, wholeWord, regex, searchAddon, terminal]);

    const navigateNext = () => {
        if (searchTerm && searchAddon && totalMatches > 0) {
            const found = searchAddon.findNext(searchTerm, {
                caseSensitive,
                wholeWord,
                regex,
            });

            if (found) {
                setCurrentMatch(prev => {
                    const next = prev + 1;
                    return next > totalMatches ? 1 : next;
                });
            } else {
                // Wrap around to first match
                searchAddon.findNext(searchTerm, {
                    caseSensitive,
                    wholeWord,
                    regex,
                });
                setCurrentMatch(1);
            }
        }
    };

    const navigatePrev = () => {
        if (searchTerm && searchAddon && totalMatches > 0) {
            const found = searchAddon.findPrevious(searchTerm, {
                caseSensitive,
                wholeWord,
                regex,
            });

            if (found) {
                setCurrentMatch(prev => {
                    const next = prev - 1;
                    return next < 1 ? totalMatches : next;
                });
            } else {
                // Wrap around to last match
                searchAddon.findPrevious(searchTerm, {
                    caseSensitive,
                    wholeWord,
                    regex,
                });
                setCurrentMatch(totalMatches);
            }
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            if (e.shiftKey) {
                navigatePrev();
            } else {
                navigateNext();
            }
        } else if (e.key === 'Escape') {
            onClose();
        }
    };

    const handleClose = () => {
        // Clear search highlighting
        if (searchAddon) {
            searchAddon.clearDecorations();
        }
        onClose();
    };

    const getResultsMessage = () => {
        if (!searchTerm) return 'Type to search';
        if (totalMatches === 0) return 'No matches';
        return `${currentMatch} of ${totalMatches}`;
    };

    const hasMatches = totalMatches > 0;

    return (
        <Box
            sx={{
                position: 'absolute',
                top: 48,
                right: 12,
                zIndex: 1000,
                background: '#2d2d2d',
                border: '1px solid #444',
                borderRadius: 1,
                padding: 2,
                minWidth: 350,
                boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
            }}
        >
            {/* Search Input */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                <TextField
                    autoFocus
                    size="small"
                    placeholder="Search in terminal..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyDown={handleKeyDown}
                    InputProps={{
                        startAdornment: <SearchIcon sx={{ color: '#888', mr: 1 }} fontSize="small" />,
                    }}
                    sx={{
                        flex: 1,
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
                                borderColor: '#00bcd4',
                            },
                        },
                    }}
                />
                <Tooltip title="Close (Esc)">
                    <IconButton
                        size="small"
                        onClick={handleClose}
                        sx={{
                            color: '#888',
                            '&:hover': { color: '#fff', background: 'rgba(255, 255, 255, 0.1)' },
                        }}
                    >
                        <CloseIcon fontSize="small" />
                    </IconButton>
                </Tooltip>
            </Box>

            {/* Search Options */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, mb: 1.5 }}>
                <FormControlLabel
                    control={
                        <Checkbox
                            checked={caseSensitive}
                            onChange={(e) => setCaseSensitive(e.target.checked)}
                            size="small"
                            sx={{
                                color: '#888',
                                '&.Mui-checked': { color: '#00bcd4' },
                            }}
                        />
                    }
                    label={
                        <Typography variant="caption" sx={{ color: '#ccc' }}>
                            Case sensitive
                        </Typography>
                    }
                />
                <FormControlLabel
                    control={
                        <Checkbox
                            checked={wholeWord}
                            onChange={(e) => setWholeWord(e.target.checked)}
                            size="small"
                            sx={{
                                color: '#888',
                                '&.Mui-checked': { color: '#00bcd4' },
                            }}
                        />
                    }
                    label={
                        <Typography variant="caption" sx={{ color: '#ccc' }}>
                            Match whole word
                        </Typography>
                    }
                />
                <FormControlLabel
                    control={
                        <Checkbox
                            checked={regex}
                            onChange={(e) => setRegex(e.target.checked)}
                            size="small"
                            sx={{
                                color: '#888',
                                '&.Mui-checked': { color: '#00bcd4' },
                            }}
                        />
                    }
                    label={
                        <Typography variant="caption" sx={{ color: '#ccc' }}>
                            Use regular expression
                        </Typography>
                    }
                />
            </Box>

            {/* Navigation */}
            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    borderTop: '1px solid #444',
                    paddingTop: 1.5,
                }}
            >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Chip
                        label={getResultsMessage()}
                        size="small"
                        sx={{
                            background: hasMatches ? '#1e4d1e' : '#1e1e1e',
                            color: hasMatches ? '#4caf50' : '#888',
                            fontFamily: 'monospace',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                        }}
                    />
                </Box>
                <Box sx={{ display: 'flex', gap: 0.5 }}>
                    <Tooltip title="Previous (Shift+Enter)">
                        <span>
                            <IconButton
                                size="small"
                                onClick={navigatePrev}
                                disabled={!searchTerm || totalMatches === 0}
                                sx={{
                                    color: '#888',
                                    '&:hover': { color: '#00bcd4', background: 'rgba(0, 188, 212, 0.1)' },
                                    '&:disabled': { color: '#555' },
                                }}
                            >
                                <NavigateBeforeIcon fontSize="small" />
                            </IconButton>
                        </span>
                    </Tooltip>
                    <Tooltip title="Next (Enter)">
                        <span>
                            <IconButton
                                size="small"
                                onClick={navigateNext}
                                disabled={!searchTerm || totalMatches === 0}
                                sx={{
                                    color: '#888',
                                    '&:hover': { color: '#00bcd4', background: 'rgba(0, 188, 212, 0.1)' },
                                    '&:disabled': { color: '#555' },
                                }}
                            >
                                <NavigateNextIcon fontSize="small" />
                            </IconButton>
                        </span>
                    </Tooltip>
                </Box>
            </Box>

            {/* Keyboard Shortcuts Help */}
            <Box
                sx={{
                    marginTop: 1,
                    padding: 1,
                    background: '#1e1e1e',
                    borderRadius: 0.5,
                }}
            >
                <Typography variant="caption" sx={{ color: '#666', fontSize: '0.7rem' }}>
                    <strong>Enter:</strong> Next match • <strong>Shift+Enter:</strong> Previous • <strong>Esc:</strong> Close
                </Typography>
            </Box>
        </Box>
    );
}
