import React, { useState, useEffect, useRef } from 'react';
import {
    Box,
    Typography,
    IconButton,
    Tooltip,
    CircularProgress,
    Snackbar,
    Alert,
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import CloseIcon from '@mui/icons-material/Close';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import Editor, { OnMount } from '@monaco-editor/react';
import * as monaco from 'monaco-editor';
import makeRequest from '../../../api/makeRequest';
import { URLS } from '../../../api/urls';

interface InlineFileEditorProps {
    file: {
        path: string;
        name: string;
    } | null;
    server: {
        host: string;
        username: string;
        sshKey: string;
    };
    onClose: () => void;
}

export default function InlineFileEditor({ file, server, onClose }: InlineFileEditorProps) {
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
        if (file) {
            loadFileContent();
            detectLanguage(file.name);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [file]);

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 's') {
                e.preventDefault();
                if (hasChanges && !saving && !loading) {
                    handleSave();
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [hasChanges, saving, loading]);

    const detectLanguage = (filename: string) => {
        const ext = filename.split('.').pop()?.toLowerCase() || '';
        const languageMap: Record<string, string> = {
            js: 'javascript', jsx: 'javascript', ts: 'typescript', tsx: 'typescript',
            py: 'python', rb: 'ruby', go: 'go', rs: 'rust', java: 'java',
            cpp: 'cpp', c: 'c', cs: 'csharp', php: 'php', swift: 'swift',
            kt: 'kotlin', scala: 'scala', html: 'html', css: 'css', scss: 'scss',
            json: 'json', xml: 'xml', yaml: 'yaml', yml: 'yaml', md: 'markdown',
            sql: 'sql', sh: 'shell', bash: 'shell', zsh: 'shell', ps1: 'powershell',
            r: 'r', lua: 'lua', dart: 'dart', vue: 'vue', svelte: 'svelte',
            dockerfile: 'dockerfile', makefile: 'makefile', ini: 'ini', toml: 'toml',
        };
        setLanguage(languageMap[ext] || 'plaintext');
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
                // File doesn't exist - create new
                setContent('');
                setLineCount(1);
            }
        } catch (err: any) {
            // File doesn't exist - create new
            setContent('');
            setLineCount(1);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!file) return;

        // Small delay to ensure editor state is fully synced
        await new Promise(resolve => setTimeout(resolve, 50));

        // Get the latest content from the editor directly
        const currentContent = editorRef.current?.getValue() || content;

        setSaving(true);
        setError(null);
        try {
            console.log('[InlineFileEditor] === SAVE START ===');
            console.log('[InlineFileEditor] Saving file:', file.path);
            console.log('[InlineFileEditor] Editor content length:', editorRef.current?.getValue()?.length || 0);
            console.log('[InlineFileEditor] State content length:', content.length);
            console.log('[InlineFileEditor] Current content length:', currentContent.length);
            console.log('[InlineFileEditor] Current content:', currentContent);
            
            const response = await makeRequest(
                URLS.TERMINAL.WRITE_FILE,
                'POST',
                {
                    ip: server.host,
                    username: server.username,
                    sshKey: server.sshKey,
                    path: file.path,
                    content: currentContent
                }
            );

            console.log('[InlineFileEditor] Save response:', response);

            if (response.data && response.data.success) {
                console.log('[InlineFileEditor] ✓ File saved successfully');
                setContent(currentContent); // Update state to match saved content
                setHasChanges(false);
                setShowSuccess(true);
                setTimeout(() => setShowSuccess(false), 2000);
            } else {
                console.error('[InlineFileEditor] Save failed:', response.data);
                throw new Error(response.data?.message || 'Failed to save file');
            }
        } catch (err: any) {
            console.error('[InlineFileEditor] Save error:', err);
            const errorMsg = err.response?.data?.message || err.message || 'Unknown error occurred';
            setError(`Failed to save: ${errorMsg}`);
        } finally {
            setSaving(false);
        }
    };

    const handleEditorMount: OnMount = (editor, monaco) => {
        editorRef.current = editor;
        editor.onDidChangeCursorPosition((e) => {
            setCursorPosition({
                line: e.position.lineNumber,
                column: e.position.column
            });
        });
    };

    const handleContentChange = (value: string | undefined) => {
        const newValue = value || '';
        console.log('[InlineFileEditor] Content changed, length:', newValue.length);
        setContent(newValue);
        setHasChanges(true);
        setLineCount(newValue.split('\n').length);
    };

    if (!file) {
        return (
            <Box
                sx={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: '#1e1e1e',
                }}
            >
                <Typography sx={{ color: '#858585', fontSize: '14px' }}>
                    No file selected
                </Typography>
            </Box>
        );
    }

    return (
        <Box
            sx={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                background: '#1e1e1e',
                overflow: 'hidden',
            }}
        >
            {/* Title Bar */}
            <Box
                sx={{
                    height: '35px',
                    background: '#2d2d2d',
                    borderBottom: '1px solid #1e1e1e',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    px: 1,
                }}
            >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1, minWidth: 0 }}>
                    <InsertDriveFileIcon sx={{ fontSize: 16, color: '#858585' }} />
                    <Typography
                        sx={{
                            fontSize: '13px',
                            fontFamily: 'monospace',
                            color: '#ccc',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                        }}
                        title={file.path}
                    >
                        {file.name}
                    </Typography>
                    {hasChanges && (
                        <FiberManualRecordIcon sx={{ fontSize: 10, color: '#ccc' }} />
                    )}
                </Box>

                <Box sx={{ display: 'flex', gap: 0.5 }}>
                    <Tooltip title="Save (Ctrl+S)">
                        <span>
                            <IconButton
                                size="small"
                                onClick={handleSave}
                                disabled={!hasChanges || saving || loading}
                                sx={{
                                    color: hasChanges ? '#4caf50' : '#666',
                                    padding: '4px',
                                    '&:hover': { color: hasChanges ? '#66bb6a' : '#888' },
                                    '&:disabled': { color: '#444' }
                                }}
                            >
                                <SaveIcon sx={{ fontSize: 18 }} />
                            </IconButton>
                        </span>
                    </Tooltip>
                    <Tooltip title="Close">
                        <IconButton
                            size="small"
                            onClick={onClose}
                            sx={{
                                color: '#ccc',
                                padding: '4px',
                                '&:hover': { color: '#fff', background: '#3c3c3c' }
                            }}
                        >
                            <CloseIcon sx={{ fontSize: 18 }} />
                        </IconButton>
                    </Tooltip>
                </Box>
            </Box>

            {/* Editor Area */}
            <Box sx={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
                {loading ? (
                    <Box
                        sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            height: '100%',
                            gap: 2,
                        }}
                    >
                        <CircularProgress size={32} sx={{ color: '#007acc' }} />
                        <Typography sx={{ color: '#858585', fontSize: '13px' }}>
                            Loading file...
                        </Typography>
                    </Box>
                ) : (
                    <Editor
                        height="100%"
                        language={language}
                        value={content}
                        onChange={handleContentChange}
                        onMount={handleEditorMount}
                        theme="vs-dark"
                        options={{
                            fontSize: 13,
                            minimap: { enabled: true },
                            scrollBeyondLastLine: false,
                            automaticLayout: true,
                            tabSize: 2,
                            wordWrap: 'on',
                            lineNumbers: 'on',
                            renderWhitespace: 'selection',
                            bracketPairColorization: { enabled: true },
                        }}
                    />
                )}
            </Box>

            {/* Status Bar */}
            <Box
                sx={{
                    height: '22px',
                    background: '#007acc',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    px: 1,
                }}
            >
                <Box sx={{ display: 'flex', gap: 2 }}>
                    <Typography sx={{ fontSize: '11px', color: '#fff', fontFamily: 'monospace' }}>
                        Ln {cursorPosition.line}, Col {cursorPosition.column}
                    </Typography>
                    <Typography sx={{ fontSize: '11px', color: '#fff' }}>
                        {language.toUpperCase()}
                    </Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 2 }}>
                    {saving && (
                        <Typography sx={{ fontSize: '11px', color: '#fff' }}>
                            Saving...
                        </Typography>
                    )}
                    <Typography sx={{ fontSize: '11px', color: '#fff' }}>
                        {lineCount} lines
                    </Typography>
                </Box>
            </Box>

            {/* Success Snackbar */}
            <Snackbar
                open={showSuccess}
                autoHideDuration={2000}
                onClose={() => setShowSuccess(false)}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                <Alert severity="success" sx={{ fontSize: '13px' }}>
                    File saved successfully!
                </Alert>
            </Snackbar>

            {/* Error Snackbar */}
            <Snackbar
                open={!!error}
                autoHideDuration={5000}
                onClose={() => setError(null)}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                <Alert severity="error" sx={{ fontSize: '13px' }}>
                    {error}
                </Alert>
            </Snackbar>
        </Box>
    );
}
