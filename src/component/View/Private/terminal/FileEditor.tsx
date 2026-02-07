import React, { useState, useEffect, useRef } from 'react';
import {
    Dialog,
    Box,
    Typography,
    IconButton,
    Tooltip,
    Alert,
    CircularProgress,
    Snackbar
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import SaveIcon from '@mui/icons-material/Save';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import Editor, { OnMount } from '@monaco-editor/react';
import * as monaco from 'monaco-editor';
import makeRequest from '../../../api/makeRequest';
import { URLS } from '../../../api/urls';

type Props = {
    open: boolean;
    onClose: () => void;
    file: {
        path: string;
        name: string;
    } | null;
    server: {
        host: string;
        username: string;
        sshKey: string;
    };
};

const FileEditor: React.FC<Props> = ({ open, onClose, file, server }) => {
    const [content, setContent] = useState('');
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [hasChanges, setHasChanges] = useState(false);
    const [language, setLanguage] = useState('plaintext');
    const [lineCount, setLineCount] = useState(0);
    const [cursorPosition, setCursorPosition] = useState({ line: 1, column: 1 });
    const [showSuccess, setShowSuccess] = useState(false);
    const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);

    useEffect(() => {
        if (open && file) {
            loadFileContent();
            detectLanguage(file.name);
        } else {
            // Reset state when closing
            setContent('');
            setHasChanges(false);
            setError(null);
            setLineCount(0);
            setCursorPosition({ line: 1, column: 1 });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, file]);

    // Add keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Ctrl+S or Cmd+S to save
            if ((e.ctrlKey || e.metaKey) && e.key === 's') {
                e.preventDefault();
                if (hasChanges && !saving && !loading) {
                    handleSave();
                }
            }
            // Esc to close (with confirmation if unsaved)
            if (e.key === 'Escape' && !loading && !saving) {
                handleClose();
            }
        };

        if (open) {
            window.addEventListener('keydown', handleKeyDown);
            return () => window.removeEventListener('keydown', handleKeyDown);
        }
    }, [open, hasChanges, saving, loading]);

    const detectLanguage = (filename: string) => {
        const ext = filename.split('.').pop()?.toLowerCase() || '';
        const languageMap: { [key: string]: string } = {
            'js': 'javascript',
            'jsx': 'javascript',
            'ts': 'typescript',
            'tsx': 'typescript',
            'json': 'json',
            'py': 'python',
            'sh': 'shell',
            'bash': 'shell',
            'zsh': 'shell',
            'yml': 'yaml',
            'yaml': 'yaml',
            'xml': 'xml',
            'html': 'html',
            'htm': 'html',
            'css': 'css',
            'scss': 'scss',
            'sass': 'scss',
            'less': 'less',
            'md': 'markdown',
            'markdown': 'markdown',
            'sql': 'sql',
            'java': 'java',
            'cpp': 'cpp',
            'c': 'c',
            'h': 'c',
            'go': 'go',
            'rs': 'rust',
            'rb': 'ruby',
            'php': 'php',
            'ini': 'ini',
            'conf': 'ini',
            'cfg': 'ini',
            'env': 'plaintext',
            'log': 'plaintext',
            'txt': 'plaintext',
            'dockerfile': 'dockerfile',
            'vue': 'vue',
            'swift': 'swift',
            'kt': 'kotlin',
            'r': 'r',
            'scala': 'scala',
            'pl': 'perl',
            'lua': 'lua'
        };

        // Handle special filenames
        const specialFiles: { [key: string]: string } = {
            'dockerfile': 'dockerfile',
            'docker-compose.yml': 'yaml',
            'docker-compose.yaml': 'yaml',
            '.gitignore': 'plaintext',
            '.env': 'plaintext',
            '.bashrc': 'shell',
            '.zshrc': 'shell',
            'makefile': 'makefile',
            'rakefile': 'ruby'
        };

        const lowerName = filename.toLowerCase();
        if (specialFiles[lowerName]) {
            setLanguage(specialFiles[lowerName]);
        } else {
            setLanguage(languageMap[ext] || 'plaintext');
        }
    };

    const loadFileContent = async () => {
        if (!file) return;

        setLoading(true);
        setError(null);
        try {
            const response = await makeRequest(
                URLS.TERMINAL.READ_FILE,
                'POST',
                {
                    ip: server.host,
                    username: server.username,
                    sshKey: server.sshKey,
                    path: file.path
                }
            );

            if (response.data && response.data.success) {
                const fileContent = response.data.content || '';
                setContent(fileContent);
                setLineCount(fileContent.split('\n').length);
            } else {
                // File doesn't exist - create new empty file
                console.log('[FileEditor] File does not exist, creating new file');
                setContent('');
                setLineCount(1);
                setError(`Creating new file: ${file.name}`);
                // Clear error after 2 seconds
                setTimeout(() => setError(null), 2000);
            }
        } catch (err: any) {
            // File doesn't exist - create new empty file
            console.log('[FileEditor] File read error, creating new file:', err.message);
            setContent('');
            setLineCount(1);
            setError(`Creating new file: ${file.name}`);
            setTimeout(() => setError(null), 2000);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!file) return;

        setSaving(true);
        setError(null);
        try {
            console.log('[FileEditor] === SAVE START ===');
            console.log('[FileEditor] Saving file:', file.path);
            console.log('[FileEditor] Server:', server.host);
            console.log('[FileEditor] Content length:', content.length);
            console.log('[FileEditor] Content (full):', content);
            console.log('[FileEditor] Content (first 300 chars):', content.substring(0, 300));
            console.log('[FileEditor] Content (last 300 chars):', content.substring(Math.max(0, content.length - 300)));

            const response = await makeRequest(
                URLS.TERMINAL.WRITE_FILE,
                'POST',
                {
                    ip: server.host,
                    username: server.username,
                    sshKey: server.sshKey,
                    path: file.path,
                    content: content
                }
            );

            console.log('[FileEditor] Save response:', response);
            console.log('[FileEditor] Response data:', response.data);

            if (response.data && response.data.success) {
                console.log('[FileEditor] ✓ Save successful!');
                setHasChanges(false);
                setShowSuccess(true);
                // Auto-close after 1 second if user wants
                // setTimeout(() => onClose(), 1000);
            } else {
                console.error('[FileEditor] Save failed:', response.data);
                throw new Error(response.data?.message || 'Failed to save file');
            }
        } catch (err: any) {
            console.error('[FileEditor] Save error:', err);
            const errorMsg = err.response?.data?.message || err.message || 'Unknown error occurred';
            setError(`Failed to save file: ${errorMsg}`);
        } finally {
            setSaving(false);
        }
    };

    const handleEditorChange = (value: string | undefined) => {
        const newContent = value || '';
        setContent(newContent);
        setHasChanges(true);
        setLineCount(newContent.split('\n').length);
    };

    const handleClose = () => {
        if (hasChanges) {
            if (window.confirm('You have unsaved changes. Are you sure you want to close?')) {
                onClose();
            }
        } else {
            onClose();
        }
    };

    const handleEditorMount: OnMount = (editor, monaco) => {
        editorRef.current = editor;

        // Update cursor position on selection change
        editor.onDidChangeCursorPosition((e) => {
            setCursorPosition({
                line: e.position.lineNumber,
                column: e.position.column
            });
        });

        // Focus editor
        editor.focus();
    };

    // Get file icon based on language
    const getLanguageIcon = () => {
        const iconStyle = { fontSize: '1rem', mr: 0.5 };
        return <InsertDriveFileIcon sx={iconStyle} />;
    };

    return (
        <>
            <Dialog
                open={open}
                onClose={handleClose}
                maxWidth={false}
                fullWidth
                PaperProps={{
                    sx: {
                        width: '95vw',
                        height: '95vh',
                        maxWidth: '95vw',
                        maxHeight: '95vh',
                        m: 0,
                        background: '#1e1e1e',
                        color: '#fff',
                        borderRadius: '8px',
                        overflow: 'hidden',
                        display: 'flex',
                        flexDirection: 'column'
                    }
                }}
            >
                {/* VS Code-style Title Bar */}
                <Box sx={{
                    display: 'flex',
                    alignItems: 'center',
                    height: '35px',
                    background: '#323233',
                    borderBottom: '1px solid #000',
                    px: 1,
                    flexShrink: 0
                }}>
                    {/* Tab */}
                    <Box sx={{
                        display: 'flex',
                        alignItems: 'center',
                        height: '35px',
                        px: 1.5,
                        background: '#1e1e1e',
                        borderRight: '1px solid #000',
                        minWidth: 150,
                        maxWidth: 300
                    }}>
                        {getLanguageIcon()}
                        <Typography
                            variant="caption"
                            sx={{
                                color: hasChanges ? '#fff' : '#ccc',
                                fontSize: '0.8rem',
                                fontWeight: 400,
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                                flex: 1
                            }}
                        >
                            {file?.name || 'Untitled'}
                        </Typography>
                        {hasChanges && (
                            <FiberManualRecordIcon
                                sx={{
                                    fontSize: '0.5rem',
                                    color: '#fff',
                                    ml: 0.5
                                }}
                            />
                        )}
                        <Tooltip title="Close (Esc)">
                            <IconButton
                                onClick={handleClose}
                                size="small"
                                sx={{
                                    p: 0.3,
                                    ml: 0.5,
                                    color: '#858585',
                                    '&:hover': {
                                        color: '#fff',
                                        background: 'rgba(255, 255, 255, 0.1)'
                                    }
                                }}
                            >
                                <CloseIcon sx={{ fontSize: '1rem' }} />
                            </IconButton>
                        </Tooltip>
                    </Box>

                    {/* Spacer */}
                    <Box sx={{ flex: 1 }} />

                    {/* File path */}
                    <Typography
                        variant="caption"
                        sx={{
                            color: '#858585',
                            fontSize: '0.75rem',
                            mr: 2
                        }}
                    >
                        {file?.path}
                    </Typography>

                    {/* Save button */}
                    <Tooltip title={`Save (${navigator.platform.includes('Mac') ? 'Cmd' : 'Ctrl'}+S)`}>
                        <span>
                            <IconButton
                                onClick={handleSave}
                                disabled={!hasChanges || saving || loading}
                                size="small"
                                sx={{
                                    color: hasChanges ? '#4caf50' : '#858585',
                                    mr: 0.5,
                                    '&:hover': {
                                        color: '#4caf50',
                                        background: 'rgba(76, 175, 80, 0.1)'
                                    },
                                    '&:disabled': {
                                        color: '#454545'
                                    }
                                }}
                            >
                                <SaveIcon sx={{ fontSize: '1.1rem' }} />
                            </IconButton>
                        </span>
                    </Tooltip>
                </Box>

                {/* Error Alert */}
                {error && (
                    <Alert
                        severity="error"
                        sx={{
                            borderRadius: 0,
                            borderBottom: '1px solid #000',
                            background: '#5a1d1d',
                            color: '#fff'
                        }}
                        onClose={() => setError(null)}
                    >
                        {error}
                    </Alert>
                )}

                {/* Editor */}
                <Box sx={{
                    flex: 1,
                    overflow: 'hidden',
                    background: '#1e1e1e',
                    position: 'relative'
                }}>
                    {loading ? (
                        <Box sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            height: '100%',
                            flexDirection: 'column'
                        }}>
                            <CircularProgress size={60} sx={{ color: '#007acc', mb: 2 }} />
                            <Typography variant="body2" sx={{ color: '#858585' }}>
                                Loading file...
                            </Typography>
                        </Box>
                    ) : (
                        <Editor
                            height="100%"
                            language={language}
                            value={content}
                            onChange={handleEditorChange}
                            onMount={handleEditorMount}
                            theme="vs-dark"
                            options={{
                                fontSize: 14,
                                fontFamily: "'Cascadia Code', 'Fira Code', 'Consolas', 'Monaco', 'Courier New', monospace",
                                lineNumbers: 'on',
                                rulers: [80, 120],
                                minimap: {
                                    enabled: true,
                                    scale: 1,
                                    showSlider: 'mouseover'
                                },
                                scrollBeyondLastLine: false,
                                automaticLayout: true,
                                tabSize: 4,
                                insertSpaces: true,
                                detectIndentation: true,
                                wordWrap: 'on',
                                wrappingIndent: 'indent',
                                formatOnPaste: true,
                                formatOnType: false,
                                autoIndent: 'full',
                                bracketPairColorization: {
                                    enabled: true
                                },
                                guides: {
                                    bracketPairs: true,
                                    indentation: true
                                },
                                suggestOnTriggerCharacters: true,
                                quickSuggestions: true,
                                parameterHints: {
                                    enabled: true
                                },
                                folding: true,
                                foldingStrategy: 'indentation',
                                showFoldingControls: 'always',
                                matchBrackets: 'always',
                                renderWhitespace: 'selection',
                                renderControlCharacters: false,
                                smoothScrolling: true,
                                cursorBlinking: 'smooth',
                                cursorSmoothCaretAnimation: 'on',
                                mouseWheelZoom: true,
                                padding: {
                                    top: 10,
                                    bottom: 10
                                },
                                readOnly: saving,
                                contextmenu: true,
                                links: true,
                                colorDecorators: true,
                                lightbulb: {
                                    enabled: true
                                }
                            }}
                        />
                    )}

                    {/* Saving overlay */}
                    {saving && (
                        <Box sx={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            background: 'rgba(0, 0, 0, 0.3)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            zIndex: 10
                        }}>
                            <Box sx={{
                                background: '#1e1e1e',
                                border: '1px solid #007acc',
                                borderRadius: 1,
                                p: 2,
                                display: 'flex',
                                alignItems: 'center',
                                gap: 2
                            }}>
                                <CircularProgress size={24} sx={{ color: '#007acc' }} />
                                <Typography variant="body2" sx={{ color: '#fff' }}>
                                    Saving file...
                                </Typography>
                            </Box>
                        </Box>
                    )}
                </Box>

                {/* VS Code-style Status Bar */}
                <Box sx={{
                    display: 'flex',
                    alignItems: 'center',
                    height: '22px',
                    background: '#007acc',
                    color: '#fff',
                    px: 1,
                    fontSize: '0.75rem',
                    flexShrink: 0
                }}>
                    {/* Language */}
                    <Tooltip title="Select Language Mode">
                        <Box sx={{
                            px: 1,
                            py: 0.3,
                            cursor: 'pointer',
                            '&:hover': {
                                background: 'rgba(255, 255, 255, 0.1)'
                            }
                        }}>
                            <Typography variant="caption" sx={{ fontSize: '0.75rem', fontWeight: 500 }}>
                                {language.charAt(0).toUpperCase() + language.slice(1)}
                            </Typography>
                        </Box>
                    </Tooltip>

                    <Box sx={{ width: '1px', height: '16px', background: 'rgba(255, 255, 255, 0.3)', mx: 0.5 }} />

                    {/* Cursor position */}
                    <Tooltip title="Go to Line/Column">
                        <Box sx={{
                            px: 1,
                            py: 0.3,
                            cursor: 'pointer',
                            '&:hover': {
                                background: 'rgba(255, 255, 255, 0.1)'
                            }
                        }}>
                            <Typography variant="caption" sx={{ fontSize: '0.75rem' }}>
                                Ln {cursorPosition.line}, Col {cursorPosition.column}
                            </Typography>
                        </Box>
                    </Tooltip>

                    <Box sx={{ width: '1px', height: '16px', background: 'rgba(255, 255, 255, 0.3)', mx: 0.5 }} />

                    {/* Line count */}
                    <Box sx={{ px: 1, py: 0.3 }}>
                        <Typography variant="caption" sx={{ fontSize: '0.75rem' }}>
                            {lineCount} lines
                        </Typography>
                    </Box>

                    <Box sx={{ width: '1px', height: '16px', background: 'rgba(255, 255, 255, 0.3)', mx: 0.5 }} />

                    {/* Encoding */}
                    <Box sx={{ px: 1, py: 0.3 }}>
                        <Typography variant="caption" sx={{ fontSize: '0.75rem' }}>
                            UTF-8
                        </Typography>
                    </Box>

                    <Box sx={{ flex: 1 }} />

                    {/* Status */}
                    {hasChanges && !saving && (
                        <Box sx={{ px: 1, py: 0.3 }}>
                            <Typography variant="caption" sx={{ fontSize: '0.75rem', fontWeight: 500 }}>
                                • Modified
                            </Typography>
                        </Box>
                    )}
                </Box>
            </Dialog>

            {/* Success Snackbar */}
            <Snackbar
                open={showSuccess}
                autoHideDuration={2000}
                onClose={() => setShowSuccess(false)}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                <Alert
                    onClose={() => setShowSuccess(false)}
                    severity="success"
                    sx={{
                        background: '#1e1e1e',
                        color: '#4caf50',
                        border: '1px solid #4caf50'
                    }}
                >
                    File saved successfully!
                </Alert>
            </Snackbar>
        </>
    );
};

export default FileEditor;
