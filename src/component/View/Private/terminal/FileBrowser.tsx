import React, { useState, useEffect, useRef } from 'react';
import {
    Box,
    IconButton,
    Typography,
    TextField,
    InputAdornment,
    List,
    ListItem,
    ListItemButton,
    ListItemText,
    ListItemIcon,
    Tooltip,
    CircularProgress,
    Chip,
    Breadcrumbs,
    Link,
    keyframes,
} from '@mui/material';
import FolderIcon from '@mui/icons-material/Folder';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import HomeIcon from '@mui/icons-material/Home';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import RefreshIcon from '@mui/icons-material/Refresh';
import SearchIcon from '@mui/icons-material/Search';
import GetAppIcon from '@mui/icons-material/GetApp';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CloseIcon from '@mui/icons-material/Close';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import makeRequest from '../../../api/makeRequest';
import { RequestMethods } from '../../../api/requestMethode';
import url from '../../../api/urls';
import { toast } from 'react-hot-toast';

interface FileBrowserProps {
    ip: string;
    username: string;
    sshKey: string;
    onExecuteCommand: (command: string) => void;
    connected: boolean;
}

interface FileItem {
    name: string;
    type: 'directory' | 'file' | 'symlink';
    permissions: string;
    owner: string;
    group: string;
    size: string;
    modified: string;
    isDirectory: boolean;
    isSymlink: boolean;
}

// Pulse animation for upload icon
const pulse = keyframes`
  0%, 100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.1);
    opacity: 0.8;
  }
`;

export default function FileBrowser({ ip, username, sshKey, onExecuteCommand, connected }: FileBrowserProps) {
    const [currentPath, setCurrentPath] = useState(`/home/${username}`);
    const [files, setFiles] = useState<FileItem[]>([]);
    const [filteredFiles, setFilteredFiles] = useState<FileItem[]>([]);
    const [searchText, setSearchText] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [showHiddenFiles, setShowHiddenFiles] = useState(false);
    const dropZoneRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Load files when path changes or connection established
    useEffect(() => {
        if (connected) {
            listFiles(currentPath);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [connected, currentPath]);

    // Filter files when search text or hidden files toggle changes
    useEffect(() => {
        let filtered = files;

        // Filter by hidden files
        if (!showHiddenFiles) {
            filtered = filtered.filter(file => !file.name.startsWith('.'));
        }

        // Filter by search text
        if (searchText) {
            filtered = filtered.filter(file =>
                file.name.toLowerCase().includes(searchText.toLowerCase())
            );
        }

        setFilteredFiles(filtered);
    }, [searchText, files, showHiddenFiles]);

    const listFiles = async (path: string) => {
        setLoading(true);
        setError(null);

        try {
            const response = await makeRequest(
                url.terminal.listFiles,
                RequestMethods.POST,
                {
                    ip,
                    username,
                    sshKey,
                    path
                }
            );

            if (response.status === 200 && response.data.success) {
                setFiles(response.data.files || []);
                setFilteredFiles(response.data.files || []);
            } else {
                setError(response.data.error || 'Failed to list files');
                toast.error('Failed to list files');
            }
        } catch (err: any) {
            console.error('File listing error:', err);
            setError(err.message || 'Failed to list files');
            toast.error('Failed to list files');
        } finally {
            setLoading(false);
        }
    };

    const handleNavigate = (path: string) => {
        setCurrentPath(path);
        setSearchText('');
    };

    const handleGoUp = () => {
        const parentPath = currentPath.split('/').slice(0, -1).join('/') || '/';
        handleNavigate(parentPath);
    };

    const handleFileDoubleClick = (file: FileItem) => {
        if (file.isDirectory) {
            const newPath = currentPath.endsWith('/')
                ? `${currentPath}${file.name}`
                : `${currentPath}/${file.name}`;
            handleNavigate(newPath);
        }
    };

    const handleDownload = async (file: FileItem) => {
        const fullPath = currentPath.endsWith('/')
            ? `${currentPath}${file.name}`
            : `${currentPath}/${file.name}`;

        if (file.isDirectory) {
            toast.error('Cannot download directories. Please download individual files.');
            return;
        }

        try {
            toast.loading('Downloading file...', { id: 'download' });

            const response = await fetch(`${import.meta.env.VITE_REACT_APP_API_URL}${import.meta.env.VITE_REACT_APP_API_VER}${url.terminal.download}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'authorization': `Bearer ${sessionStorage.getItem('authKey')}`
                },
                body: JSON.stringify({
                    ip,
                    username,
                    sshKey,
                    remotePath: fullPath,
                    localFilename: file.name
                })
            });

            if (response.ok) {
                const blob = await response.blob();
                const downloadUrl = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = downloadUrl;
                a.download = file.name;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                window.URL.revokeObjectURL(downloadUrl);

                toast.success('File downloaded successfully', { id: 'download' });
            } else {
                const errorText = await response.text();
                toast.error('Download failed: ' + errorText, { id: 'download' });
            }
        } catch (err: any) {
            console.error('Download error:', err);
            toast.error('Download failed: ' + err.message, { id: 'download' });
        }
    };

    const handleFileUpload = async (files: FileList | null) => {
        if (!files || files.length === 0) return;

        const file = files[0];

        try {
            toast.loading(`Uploading ${file.name}...`, { id: 'upload' });

            const formData = new FormData();
            formData.append('file', file);
            formData.append('ip', ip);
            formData.append('username', username);
            formData.append('sshKey', sshKey);
            formData.append('remotePath', currentPath.endsWith('/') ? currentPath : currentPath + '/');

            const response = await fetch(`${import.meta.env.VITE_REACT_APP_API_URL}${import.meta.env.VITE_REACT_APP_API_VER}${url.terminal.upload}`, {
                method: 'POST',
                headers: {
                    'authorization': `Bearer ${sessionStorage.getItem('authKey')}`
                },
                body: formData
            });

            const result = await response.json();

            if (result.success) {
                toast.success(`${file.name} uploaded successfully`, { id: 'upload' });
                // Refresh file list
                listFiles(currentPath);
            } else {
                toast.error('Upload failed: ' + (result.message || result.error), { id: 'upload' });
            }
        } catch (err: any) {
            console.error('Upload error:', err);
            toast.error('Upload failed: ' + err.message, { id: 'upload' });
        }
    };

    // Drag and drop handlers
    const dragCounter = useRef(0);

    const handleDragEnter = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        dragCounter.current++;
        if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
            setIsDragging(true);
        }
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        dragCounter.current--;
        if (dragCounter.current === 0) {
            setIsDragging(false);
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        dragCounter.current = 0;

        const droppedFiles = e.dataTransfer.files;
        handleFileUpload(droppedFiles);
    };

    const pathParts = currentPath.split('/').filter(Boolean);

    return (
        <Box
            ref={dropZoneRef}
            onDragEnter={handleDragEnter}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            sx={{
                width: 350,
                height: '100%',
                background: '#252525',
                borderLeft: '1px solid #444',
                display: 'flex',
                flexDirection: 'column',
                position: 'relative',
            }}
        >
            {/* Drag overlay */}
            {isDragging && (
                <Box
                    sx={{
                        position: 'absolute',
                        inset: 0,
                        background: 'rgba(33, 150, 243, 0.95)',
                        border: '3px dashed #fff',
                        borderRadius: 1,
                        zIndex: 9999,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        pointerEvents: 'none',
                    }}
                >
                    <Box sx={{ textAlign: 'center', pointerEvents: 'none' }}>
                        <CloudUploadIcon sx={{ fontSize: 80, color: '#fff', mb: 2, animation: `${pulse} 1.5s ease-in-out infinite` }} />
                        <Typography variant="h5" sx={{ color: '#fff', fontWeight: 700, mb: 1 }}>
                            Drop file here
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#e3f2fd', fontWeight: 500 }}>
                            Upload to {currentPath}
                        </Typography>
                    </Box>
                </Box>
            )}

            {/* Header */}
            <Box sx={{ padding: 2, borderBottom: '1px solid #444' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6" sx={{ color: '#fff' }}>
                        File Browser
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                        <Tooltip title={showHiddenFiles ? "Hide hidden files" : "Show hidden files"}>
                            <IconButton
                                size="small"
                                onClick={() => setShowHiddenFiles(!showHiddenFiles)}
                                disabled={!connected}
                                sx={{
                                    color: showHiddenFiles ? '#4caf50' : '#888',
                                    '&:hover': { color: showHiddenFiles ? '#66bb6a' : '#aaa' }
                                }}
                            >
                                {showHiddenFiles ? <VisibilityIcon fontSize="small" /> : <VisibilityOffIcon fontSize="small" />}
                            </IconButton>
                        </Tooltip>
                        <Tooltip title="Upload File">
                            <IconButton
                                size="small"
                                onClick={() => fileInputRef.current?.click()}
                                disabled={!connected}
                                sx={{ color: '#888', '&:hover': { color: '#4caf50' } }}
                            >
                                <CloudUploadIcon fontSize="small" />
                            </IconButton>
                        </Tooltip>
                    </Box>
                </Box>

                {/* Hidden file input for click upload */}
                <input
                    ref={fileInputRef}
                    type="file"
                    style={{ display: 'none' }}
                    onChange={(e) => handleFileUpload(e.target.files)}
                />

                {/* Navigation buttons */}
                <Box sx={{ display: 'flex', gap: 0.5, mb: 2 }}>
                    <Tooltip title="Home Directory">
                        <IconButton
                            size="small"
                            onClick={() => handleNavigate(`/home/${username}`)}
                            disabled={!connected}
                            sx={{
                                background: '#1e1e1e',
                                color: '#888',
                                '&:hover': { background: '#2d2d2d', color: '#2196f3' },
                                '&:disabled': { color: '#555' },
                            }}
                        >
                            <HomeIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Parent Directory">
                        <IconButton
                            size="small"
                            onClick={handleGoUp}
                            disabled={!connected || currentPath === '/'}
                            sx={{
                                background: '#1e1e1e',
                                color: '#888',
                                '&:hover': { background: '#2d2d2d', color: '#2196f3' },
                                '&:disabled': { color: '#555' },
                            }}
                        >
                            <ArrowUpwardIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Refresh">
                        <IconButton
                            size="small"
                            onClick={() => listFiles(currentPath)}
                            disabled={!connected}
                            sx={{
                                background: '#1e1e1e',
                                color: '#888',
                                '&:hover': { background: '#2d2d2d', color: '#4caf50' },
                                '&:disabled': { color: '#555' },
                            }}
                        >
                            <RefreshIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                </Box>

                {/* Breadcrumbs */}
                <Box sx={{ mb: 2, overflow: 'auto', maxHeight: 60 }}>
                    <Breadcrumbs
                        separator="/"
                        sx={{
                            '& .MuiBreadcrumbs-separator': { color: '#666' },
                        }}
                    >
                        <Link
                            component="button"
                            onClick={() => handleNavigate('/')}
                            sx={{
                                color: '#888',
                                textDecoration: 'none',
                                fontSize: '0.875rem',
                                '&:hover': { color: '#2196f3' },
                            }}
                        >
                            root
                        </Link>
                        {pathParts.map((part, index) => {
                            const path = '/' + pathParts.slice(0, index + 1).join('/');
                            return (
                                <Link
                                    key={path}
                                    component="button"
                                    onClick={() => handleNavigate(path)}
                                    sx={{
                                        color: index === pathParts.length - 1 ? '#4fc3f7' : '#888',
                                        textDecoration: 'none',
                                        fontSize: '0.875rem',
                                        fontWeight: index === pathParts.length - 1 ? 600 : 400,
                                        '&:hover': { color: '#2196f3' },
                                    }}
                                >
                                    {part}
                                </Link>
                            );
                        })}
                    </Breadcrumbs>
                </Box>

                {/* Search */}
                <TextField
                    size="small"
                    fullWidth
                    placeholder="Search files..."
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon sx={{ color: '#888' }} />
                            </InputAdornment>
                        ),
                        endAdornment: searchText && (
                            <InputAdornment position="end">
                                <IconButton
                                    size="small"
                                    onClick={() => setSearchText('')}
                                    sx={{ color: '#888' }}
                                >
                                    <CloseIcon fontSize="small" />
                                </IconButton>
                            </InputAdornment>
                        ),
                    }}
                    sx={{
                        '& .MuiOutlinedInput-root': {
                            background: '#1e1e1e',
                            color: '#fff',
                            fontSize: '0.875rem',
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
            </Box>

            {/* File List */}
            <Box sx={{ flex: 1, overflow: 'auto' }}>
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
                        <CircularProgress size={32} sx={{ color: '#2196f3' }} />
                        <Typography variant="caption" sx={{ color: '#888' }}>
                            Loading files...
                        </Typography>
                    </Box>
                ) : error ? (
                    <Box sx={{ padding: 2 }}>
                        <Typography variant="body2" sx={{ color: '#f44336', mb: 1 }}>
                            {error}
                        </Typography>
                        <IconButton
                            size="small"
                            onClick={() => listFiles(currentPath)}
                            sx={{ color: '#2196f3' }}
                        >
                            <RefreshIcon fontSize="small" />
                        </IconButton>
                    </Box>
                ) : filteredFiles.length === 0 ? (
                    <Box sx={{ padding: 2, textAlign: 'center' }}>
                        <Typography variant="body2" sx={{ color: '#888' }}>
                            {searchText ? 'No files match your search' : 'Empty directory'}
                        </Typography>
                    </Box>
                ) : (
                    <List sx={{ padding: 0 }}>
                        {filteredFiles.map((file, index) => (
                            <ListItem
                                key={index}
                                disablePadding
                                secondaryAction={
                                    !file.isDirectory && (
                                        <Tooltip title="Download">
                                            <IconButton
                                                edge="end"
                                                size="small"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDownload(file);
                                                }}
                                                sx={{
                                                    color: '#666',
                                                    '&:hover': { color: '#4caf50' },
                                                }}
                                            >
                                                <GetAppIcon fontSize="small" />
                                            </IconButton>
                                        </Tooltip>
                                    )
                                }
                                sx={{
                                    borderBottom: '1px solid #333',
                                    '&:hover': {
                                        background: file.isDirectory ? '#2d2d2d' : '#262626',
                                    },
                                }}
                            >
                                <ListItemButton
                                    onDoubleClick={() => handleFileDoubleClick(file)}
                                    disabled={!connected}
                                    sx={{
                                        cursor: file.isDirectory ? 'pointer' : 'default',
                                    }}
                                >
                                    <ListItemIcon sx={{ minWidth: 36 }}>
                                        {file.isDirectory ? (
                                            <FolderIcon sx={{ color: '#ffc107' }} />
                                        ) : (
                                            <InsertDriveFileIcon sx={{ color: '#888' }} />
                                        )}
                                    </ListItemIcon>
                                    <ListItemText
                                        primary={file.name}
                                        secondary={
                                            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mt: 0.5 }}>
                                                <Typography
                                                    variant="caption"
                                                    sx={{ color: '#666', fontFamily: 'monospace' }}
                                                >
                                                    {file.permissions}
                                                </Typography>
                                                {!file.isDirectory && (
                                                    <Chip
                                                        label={file.size}
                                                        size="small"
                                                        sx={{
                                                            height: 16,
                                                            fontSize: '0.65rem',
                                                            background: '#1e1e1e',
                                                            color: '#888',
                                                        }}
                                                    />
                                                )}
                                            </Box>
                                        }
                                        primaryTypographyProps={{
                                            sx: {
                                                fontFamily: 'monospace',
                                                fontSize: '0.875rem',
                                                color: file.isDirectory ? '#4fc3f7' : '#fff',
                                                fontWeight: file.isDirectory ? 600 : 400,
                                            },
                                        }}
                                    />
                                </ListItemButton>
                            </ListItem>
                        ))}
                    </List>
                )}
            </Box>

            {/* Footer */}
            <Box
                sx={{
                    padding: 1.5,
                    borderTop: '1px solid #444',
                    background: '#2d2d2d',
                }}
            >
                <Typography variant="caption" sx={{ color: '#888', display: 'block', mb: 0.5 }}>
                    {filteredFiles.length} item{filteredFiles.length !== 1 ? 's' : ''}
                    {searchText && ` (filtered from ${files.length})`}
                </Typography>
                <Typography variant="caption" sx={{ color: '#666', fontFamily: 'monospace', fontSize: '0.7rem' }}>
                    Drag & drop to upload files
                </Typography>
            </Box>
        </Box>
    );
}
