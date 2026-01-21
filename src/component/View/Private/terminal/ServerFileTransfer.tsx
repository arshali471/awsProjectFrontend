import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Box,
    Typography,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Checkbox,
    LinearProgress,
    Chip,
    IconButton,
    TextField,
    InputAdornment,
    Divider,
    Alert,
    Switch,
    FormControlLabel,
    Tooltip,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Breadcrumbs,
    Link,
    CircularProgress
} from '@mui/material';
import FolderIcon from '@mui/icons-material/Folder';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import SearchIcon from '@mui/icons-material/Search';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import RefreshIcon from '@mui/icons-material/Refresh';
import HomeIcon from '@mui/icons-material/Home';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import DeleteIcon from '@mui/icons-material/Delete';
import CreateNewFolderIcon from '@mui/icons-material/CreateNewFolder';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import AddIcon from '@mui/icons-material/Add';
import StorageIcon from '@mui/icons-material/Storage';
import { Menu } from '@mui/material';
import { RemoteServer } from './ServerConnectionManager';
import makeRequest from '../../../api/makeRequest';
import { URLS } from '../../../api/urls';

type FileItem = {
    name: string;
    type: 'file' | 'directory';
    size: number;
    path: string;
    permissions: string;
    modified: string;
};

type Props = {
    open: boolean;
    onClose: () => void;
    sourceServer: { ip: string; username: string; sshKey: string };
    targetServer: RemoteServer | null;
    savedServers: RemoteServer[];
    onOpenServerManager?: () => void;
};

const ServerFileTransfer = ({ open, onClose, sourceServer, targetServer, savedServers, onOpenServerManager }: Props) => {
    const [sourceFiles, setSourceFiles] = useState<FileItem[]>([]);
    const [targetFiles, setTargetFiles] = useState<FileItem[]>([]);
    const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
    const [sourcePath, setSourcePath] = useState('/home');
    const [targetPath, setTargetPath] = useState('/home');
    const [sourceSearch, setSourceSearch] = useState('');
    const [targetSearch, setTargetSearch] = useState('');
    const [loading, setLoading] = useState(false);
    const [sourceLoading, setSourceLoading] = useState(false);
    const [targetLoading, setTargetLoading] = useState(false);
    const [transferring, setTransferring] = useState(false);
    const [transferProgress, setTransferProgress] = useState(0);
    const [error, setError] = useState<string | null>(null);
    const [draggedFile, setDraggedFile] = useState<FileItem | null>(null);
    const [transferDirectories, setTransferDirectories] = useState(true); // Allow directory transfer

    // Selected servers for transfer
    const [selectedSourceServer, setSelectedSourceServer] = useState<RemoteServer | null>(null);
    const [selectedTargetServer, setSelectedTargetServer] = useState<RemoteServer | null>(null);

    // File management options
    const [showHiddenFiles, setShowHiddenFiles] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [fileToDelete, setFileToDelete] = useState<{ path: string; name: string; isTarget: boolean } | null>(null);
    const [createFolderDialogOpen, setCreateFolderDialogOpen] = useState(false);
    const [newFolderName, setNewFolderName] = useState('');
    const [createFolderTarget, setCreateFolderTarget] = useState(false)

    useEffect(() => {
        if (open) {
            // Initialize with default servers
            if (!selectedSourceServer) {
                const currentServerAsRemote: RemoteServer = {
                    id: 'current',
                    name: 'Current Server',
                    host: sourceServer.ip,
                    username: sourceServer.username,
                    sshKey: sourceServer.sshKey,
                    connected: true
                };
                setSelectedSourceServer(currentServerAsRemote);
            }
            if (!selectedTargetServer && targetServer) {
                setSelectedTargetServer(targetServer);
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open]);

    useEffect(() => {
        if (selectedSourceServer) {
            loadSourceFiles();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedSourceServer]);

    useEffect(() => {
        if (selectedTargetServer) {
            loadTargetFiles();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedTargetServer]);

    const loadSourceFiles = async () => {
        if (!selectedSourceServer) return;

        setSourceLoading(true);
        setError(null);
        try {
            const response = await makeRequest(
                URLS.TERMINAL.LIST_FILES,
                'POST',
                {
                    ip: selectedSourceServer.host,
                    username: selectedSourceServer.username,
                    sshKey: selectedSourceServer.sshKey || sourceServer.sshKey,
                    path: sourcePath
                }
            );

            if (response.data && response.data.files) {
                setSourceFiles(response.data.files);
            }
        } catch (err: any) {
            console.error('Error loading source files:', err);
            setError(`Failed to load files from source server: ${err.message}`);
        } finally {
            setSourceLoading(false);
        }
    };

    const loadTargetFiles = async () => {
        if (!selectedTargetServer) return;

        setTargetLoading(true);
        setError(null);
        try {
            const response = await makeRequest(
                URLS.TERMINAL.LIST_FILES,
                'POST',
                {
                    ip: selectedTargetServer.host,
                    username: selectedTargetServer.username,
                    sshKey: selectedTargetServer.sshKey || sourceServer.sshKey,
                    path: targetPath
                }
            );

            if (response.data && response.data.files) {
                setTargetFiles(response.data.files);
            }
        } catch (err: any) {
            console.error('Error loading target files:', err);
            setError(`Failed to load files from target server: ${err.message}`);
        } finally {
            setTargetLoading(false);
        }
    };

    const handleFolderClick = async (file: FileItem, isTarget: boolean) => {
        if (file.type === 'directory') {
            console.log('[FolderClick] Navigating to:', file.path, 'isTarget:', isTarget);

            setError(null);

            if (isTarget) {
                setTargetPath(file.path);
                setTargetLoading(true);
                // Load files immediately after state update
                try {
                    const response = await makeRequest(
                        URLS.TERMINAL.LIST_FILES,
                        'POST',
                        {
                            ip: selectedTargetServer?.host,
                            username: selectedTargetServer?.username,
                            sshKey: selectedTargetServer?.sshKey || sourceServer.sshKey,
                            path: file.path
                        }
                    );
                    if (response.data && response.data.files) {
                        setTargetFiles(response.data.files);
                    }
                } catch (err: any) {
                    console.error('Error loading target files:', err);
                    setError(`Failed to load files: ${err.message}`);
                } finally {
                    setTargetLoading(false);
                }
            } else {
                setSourcePath(file.path);
                setSourceLoading(true);
                // Load files immediately after state update
                try {
                    const response = await makeRequest(
                        URLS.TERMINAL.LIST_FILES,
                        'POST',
                        {
                            ip: selectedSourceServer?.host,
                            username: selectedSourceServer?.username,
                            sshKey: selectedSourceServer?.sshKey || sourceServer.sshKey,
                            path: file.path
                        }
                    );
                    if (response.data && response.data.files) {
                        setSourceFiles(response.data.files);
                    }
                } catch (err: any) {
                    console.error('Error loading source files:', err);
                    setError(`Failed to load files: ${err.message}`);
                } finally {
                    setSourceLoading(false);
                }
            }
        }
    };

    const handleToggleFile = (path: string) => {
        setSelectedFiles(prev =>
            prev.includes(path)
                ? prev.filter(p => p !== path)
                : [...prev, path]
        );
    };

    const handleDragStart = (file: FileItem) => {
        console.log('[DragDrop] Drag started:', file.name);
        setDraggedFile(file);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDrop = async (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (!draggedFile || !selectedTargetServer) {
            console.log('[DragDrop] No file dragged or no target server');
            return;
        }

        console.log('[DragDrop] Dropped file:', draggedFile.name);

        // Add to selected files and transfer
        setSelectedFiles([draggedFile.path]);
        setDraggedFile(null);

        // Trigger transfer
        await handleTransfer();
    };

    const handleDeleteFile = async () => {
        if (!fileToDelete) return;

        setLoading(true);
        setError(null);
        try {
            const server = fileToDelete.isTarget ? selectedTargetServer : selectedSourceServer;
            if (!server) return;

            const response = await makeRequest(
                URLS.TERMINAL.DELETE_FILE,
                'POST',
                {
                    ip: server.host,
                    username: server.username,
                    sshKey: server.sshKey || sourceServer.sshKey,
                    path: fileToDelete.path
                }
            );

            if (response.data && response.data.success) {
                // Reload files
                if (fileToDelete.isTarget) {
                    await loadTargetFiles();
                } else {
                    await loadSourceFiles();
                }
                setDeleteDialogOpen(false);
                setFileToDelete(null);
            } else {
                throw new Error(response.data?.message || 'Delete failed');
            }
        } catch (err: any) {
            console.error('Error deleting file:', err);
            setError(`Failed to delete: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateFolder = async () => {
        if (!newFolderName.trim()) {
            setError('Please enter a folder name');
            return;
        }

        setLoading(true);
        setError(null);
        try {
            const server = createFolderTarget ? selectedTargetServer : selectedSourceServer;
            const currentPath = createFolderTarget ? targetPath : sourcePath;
            if (!server) return;

            const newFolderPath = currentPath.endsWith('/')
                ? `${currentPath}${newFolderName}`
                : `${currentPath}/${newFolderName}`;

            const response = await makeRequest(
                URLS.TERMINAL.CREATE_FOLDER,
                'POST',
                {
                    ip: server.host,
                    username: server.username,
                    sshKey: server.sshKey || sourceServer.sshKey,
                    path: newFolderPath
                }
            );

            if (response.data && response.data.success) {
                // Reload files
                if (createFolderTarget) {
                    await loadTargetFiles();
                } else {
                    await loadSourceFiles();
                }
                setCreateFolderDialogOpen(false);
                setNewFolderName('');
            } else {
                throw new Error(response.data?.message || 'Create folder failed');
            }
        } catch (err: any) {
            console.error('Error creating folder:', err);
            setError(`Failed to create folder: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleTransfer = async () => {
        if (selectedFiles.length === 0) {
            setError('Please select at least one file to transfer');
            return;
        }

        if (!selectedSourceServer || !selectedTargetServer) {
            setError('Please select both source and target servers');
            return;
        }

        setTransferring(true);
        setTransferProgress(0);
        setError(null);

        try {
            // Transfer files one by one
            for (let i = 0; i < selectedFiles.length; i++) {
                const filePath = selectedFiles[i];
                const fileItem = sourceFiles.find(f => f.path === filePath);

                // Skip if file not found or if it's a directory and directories are disabled
                if (!fileItem) {
                    console.warn(`[FileTransfer] File not found: ${filePath}`);
                    continue;
                }

                if (fileItem.type === 'directory' && !transferDirectories) {
                    console.warn(`[FileTransfer] Skipping directory (disabled): ${filePath}`);
                    continue;
                }

                // Simulate progress (in real implementation, this would be actual transfer progress)
                setTransferProgress(((i + 1) / selectedFiles.length) * 100);

                // Transfer file using backend endpoint
                const itemType = fileItem.type === 'directory' ? 'directory' : 'file';
                console.log(`[FileTransfer] Transferring ${itemType}: ${filePath}`);

                const response = await makeRequest(
                    URLS.TERMINAL.TRANSFER_FILE,
                    'POST',
                    {
                        sourceIp: selectedSourceServer.host,
                        sourceUsername: selectedSourceServer.username,
                        sourceSshKey: selectedSourceServer.sshKey || sourceServer.sshKey,
                        sourcePath: filePath,
                        targetIp: selectedTargetServer.host,
                        targetUsername: selectedTargetServer.username,
                        targetSshKey: selectedTargetServer.sshKey || sourceServer.sshKey,
                        targetPath: targetPath,
                        isDirectory: fileItem.type === 'directory'
                    }
                );

                if (response.data && !response.data.success) {
                    throw new Error(response.data.message || 'Transfer failed');
                }

                console.log(`[FileTransfer] Successfully transferred ${itemType}: ${filePath}`);
            }

            // Reload target files to show transferred files
            await loadTargetFiles();
            setSelectedFiles([]);
            setTransferProgress(100);

            setTimeout(() => {
                setTransferring(false);
                setTransferProgress(0);
            }, 1000);
        } catch (err: any) {
            console.error('[FileTransfer] Transfer error:', err);
            console.error('[FileTransfer] Error details:', err.response?.data);

            let errorMessage = 'Transfer failed';
            if (err.response?.data?.message) {
                errorMessage = err.response.data.message;
            } else if (err.message) {
                errorMessage = err.message;
            }

            setError(`Transfer failed: ${errorMessage}`);
            setTransferring(false);
        }
    };

    const filteredSourceFiles = sourceFiles
        .filter(file => showHiddenFiles || !file.name.startsWith('.'))
        .filter(file => file.name.toLowerCase().includes(sourceSearch.toLowerCase()));

    const filteredTargetFiles = targetFiles
        .filter(file => showHiddenFiles || !file.name.startsWith('.'))
        .filter(file => file.name.toLowerCase().includes(targetSearch.toLowerCase()));

    const formatSize = (bytes: number) => {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return `${Math.round(bytes / Math.pow(k, i) * 100) / 100} ${sizes[i]}`;
    };

    const FileList = ({ files, search, onSearchChange, path, onPathChange, isTarget }: {
        files: FileItem[];
        search: string;
        onSearchChange: (value: string) => void;
        path: string;
        onPathChange: (path: string) => void;
        isTarget: boolean;
    }) => {
        // Generate breadcrumb parts from path
        const pathParts = path.split('/').filter(p => p !== '');

        const handleBreadcrumbClick = async (index: number) => {
            const newPath = index === -1 ? '/' : '/' + pathParts.slice(0, index + 1).join('/');
            console.log('[BreadcrumbClick] Navigating to:', newPath, 'isTarget:', isTarget);

            onPathChange(newPath);
            setError(null);

            if (isTarget) {
                setTargetPath(newPath);
                setTargetLoading(true);
                // Load files immediately
                try {
                    const response = await makeRequest(
                        URLS.TERMINAL.LIST_FILES,
                        'POST',
                        {
                            ip: selectedTargetServer?.host,
                            username: selectedTargetServer?.username,
                            sshKey: selectedTargetServer?.sshKey || sourceServer.sshKey,
                            path: newPath
                        }
                    );
                    if (response.data && response.data.files) {
                        setTargetFiles(response.data.files);
                    }
                } catch (err: any) {
                    console.error('Error loading target files:', err);
                    setError(`Failed to load files: ${err.message}`);
                } finally {
                    setTargetLoading(false);
                }
            } else {
                setSourcePath(newPath);
                setSourceLoading(true);
                // Load files immediately
                try {
                    const response = await makeRequest(
                        URLS.TERMINAL.LIST_FILES,
                        'POST',
                        {
                            ip: selectedSourceServer?.host,
                            username: selectedSourceServer?.username,
                            sshKey: selectedSourceServer?.sshKey || sourceServer.sshKey,
                            path: newPath
                        }
                    );
                    if (response.data && response.data.files) {
                        setSourceFiles(response.data.files);
                    }
                } catch (err: any) {
                    console.error('Error loading source files:', err);
                    setError(`Failed to load files: ${err.message}`);
                } finally {
                    setSourceLoading(false);
                }
            }
        };

        return (
            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                <Box sx={{ mb: 2 }}>
                    {/* Breadcrumb Navigation with Toolbar */}
                    <Box sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Breadcrumbs
                            separator={<NavigateNextIcon fontSize="small" sx={{ color: '#666' }} />}
                            sx={{ flex: 1, overflow: 'auto' }}
                        >
                            <Link
                                component="button"
                                onClick={() => handleBreadcrumbClick(-1)}
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 0.5,
                                    color: '#2196f3',
                                    textDecoration: 'none',
                                    cursor: 'pointer',
                                    fontSize: '0.85rem',
                                    '&:hover': { textDecoration: 'underline' }
                                }}
                            >
                                <HomeIcon fontSize="small" />
                                root
                            </Link>
                            {pathParts.map((part, index) => (
                                <Link
                                    key={index}
                                    component="button"
                                    onClick={() => handleBreadcrumbClick(index)}
                                    sx={{
                                        color: index === pathParts.length - 1 ? '#fff' : '#2196f3',
                                        textDecoration: 'none',
                                        cursor: 'pointer',
                                        fontSize: '0.85rem',
                                        fontWeight: index === pathParts.length - 1 ? 600 : 400,
                                        '&:hover': { textDecoration: 'underline' }
                                    }}
                                >
                                    {part}
                                </Link>
                            ))}
                        </Breadcrumbs>
                        <Tooltip title={showHiddenFiles ? "Hide hidden files" : "Show hidden files"}>
                            <IconButton
                                size="small"
                                onClick={() => setShowHiddenFiles(!showHiddenFiles)}
                                sx={{
                                    color: showHiddenFiles ? '#2196f3' : '#888',
                                    '&:hover': { background: 'rgba(33, 150, 243, 0.1)' }
                                }}
                            >
                                {showHiddenFiles ? <VisibilityIcon fontSize="small" /> : <VisibilityOffIcon fontSize="small" />}
                            </IconButton>
                        </Tooltip>
                        <Tooltip title="Create new folder">
                            <IconButton
                                size="small"
                                onClick={() => {
                                    setCreateFolderTarget(isTarget);
                                    setCreateFolderDialogOpen(true);
                                }}
                                sx={{
                                    color: '#4caf50',
                                    '&:hover': { background: 'rgba(76, 175, 80, 0.1)' }
                                }}
                            >
                                <CreateNewFolderIcon fontSize="small" />
                            </IconButton>
                        </Tooltip>
                        <IconButton
                            size="small"
                            onClick={() => isTarget ? loadTargetFiles() : loadSourceFiles()}
                            sx={{
                                color: '#2196f3',
                                '&:hover': { background: 'rgba(33, 150, 243, 0.1)' }
                            }}
                        >
                            <RefreshIcon fontSize="small" />
                        </IconButton>
                    </Box>
                <TextField
                    fullWidth
                    size="small"
                    placeholder="Search files..."
                    value={search}
                    onChange={e => onSearchChange(e.target.value)}
                    InputProps={{
                        sx: { color: '#fff' },
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon sx={{ color: '#888' }} />
                            </InputAdornment>
                        )
                    }}
                />
            </Box>

            <Box
                sx={{
                    flex: 1,
                    overflow: 'auto',
                    background: isTarget && draggedFile
                        ? 'linear-gradient(135deg, #1a3a1a 0%, #0d2a0d 100%)'
                        : '#252525',
                    borderRadius: 1,
                    minHeight: 500,
                    maxHeight: 700,
                    border: isTarget && draggedFile ? '3px dashed #4caf50' : '2px solid #333',
                    transition: 'all 0.3s ease',
                    position: 'relative',
                    boxShadow: isTarget && draggedFile ? '0 0 20px rgba(76, 175, 80, 0.3)' : 'none'
                }}
                onDragOver={isTarget ? handleDragOver : undefined}
                onDrop={isTarget ? handleDrop : undefined}
            >
                {/* Loading Overlay */}
                {((isTarget && targetLoading) || (!isTarget && sourceLoading)) && (
                    <Box sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: 'rgba(0, 0, 0, 0.7)',
                        backdropFilter: 'blur(4px)',
                        zIndex: 20,
                        borderRadius: 1
                    }}>
                        <CircularProgress
                            size={60}
                            sx={{
                                color: isTarget ? '#4caf50' : '#2196f3',
                                mb: 2
                            }}
                        />
                        <Typography variant="body2" sx={{ color: isTarget ? '#4caf50' : '#2196f3', fontWeight: 500 }}>
                            Loading files...
                        </Typography>
                    </Box>
                )}

                {isTarget && draggedFile && (
                    <Box sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        textAlign: 'center',
                        pointerEvents: 'none',
                        zIndex: 10,
                        background: 'rgba(26, 58, 26, 0.95)',
                        backdropFilter: 'blur(4px)'
                    }}>
                        <CloudUploadIcon
                            sx={{
                                fontSize: 80,
                                color: '#4caf50',
                                mb: 2,
                                animation: 'pulse 1.5s ease-in-out infinite',
                                '@keyframes pulse': {
                                    '0%, 100%': { transform: 'scale(1)', opacity: 1 },
                                    '50%': { transform: 'scale(1.1)', opacity: 0.8 }
                                }
                            }}
                        />
                        <Typography
                            variant="h5"
                            sx={{
                                color: '#4caf50',
                                fontWeight: 600,
                                mb: 1,
                                textShadow: '0 2px 8px rgba(0,0,0,0.3)'
                            }}
                        >
                            Drop to Transfer
                        </Typography>
                        <Chip
                            icon={draggedFile.type === 'directory' ? <FolderIcon /> : <InsertDriveFileIcon />}
                            label={draggedFile.name}
                            sx={{
                                background: '#4caf50',
                                color: '#fff',
                                fontWeight: 500,
                                fontSize: '0.9rem',
                                px: 1,
                                boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
                            }}
                        />
                        <Typography variant="caption" sx={{ color: '#81c784', mt: 2 }}>
                            {draggedFile.type === 'directory' ? 'Directory' : formatSize(draggedFile.size)}
                        </Typography>
                    </Box>
                )}
                <List dense>
                    {files.length === 0 ? (
                        <Box sx={{ p: 3, textAlign: 'center', color: '#666' }}>
                            <Typography variant="body2">No files found</Typography>
                            <Typography variant="caption" sx={{ display: 'block', mt: 1 }}>
                                {isTarget ? 'Drag files here to transfer' : 'Enter a path and press Enter'}
                            </Typography>
                        </Box>
                    ) : (
                        files.map(file => {
                            const isDraggable = !isTarget && (file.type === 'file' || (file.type === 'directory' && transferDirectories));
                            const isDisabled = file.type === 'directory' && !transferDirectories;

                            return (
                                <ListItem
                                    key={file.path}
                                    draggable={isDraggable}
                                    onDragStart={isDraggable ? () => handleDragStart(file) : undefined}
                                    onDragEnd={() => setDraggedFile(null)}
                                    sx={{
                                        borderBottom: '1px solid #333',
                                        '&:hover': {
                                            background: isDisabled ? '#1e1e1e' : '#2a2a2a',
                                            transform: isDraggable || file.type === 'directory' ? 'translateX(4px)' : 'none',
                                            boxShadow: isDraggable || file.type === 'directory' ? '0 2px 8px rgba(33, 150, 243, 0.2)' : 'none'
                                        },
                                        cursor: isDisabled
                                            ? 'not-allowed'
                                            : (file.type === 'directory' ? 'pointer' : (isDraggable ? 'grab' : 'default')),
                                        '&:active': {
                                            cursor: isDraggable ? 'grabbing' : (file.type === 'directory' ? 'pointer' : 'default')
                                        },
                                        transition: 'all 0.2s ease',
                                        opacity: isDisabled ? 0.4 : 1,
                                        background: draggedFile?.path === file.path ? 'rgba(33, 150, 243, 0.1)' : 'transparent',
                                        position: 'relative'
                                    }}
                                    onClick={(e) => {
                                        // Single click: select files only
                                        if (file.type === 'file' && !isTarget && !isDisabled) {
                                            handleToggleFile(file.path);
                                        }
                                    }}
                                    onDoubleClick={(e) => {
                                        // Double click: navigate folders
                                        if (file.type === 'directory' && !isDisabled) {
                                            handleFolderClick(file, isTarget);
                                        }
                                    }}
                                >
                                    {!isTarget && !isDisabled && (
                                        <ListItemIcon sx={{ minWidth: 40 }}>
                                            <Checkbox
                                                edge="start"
                                                checked={selectedFiles.includes(file.path)}
                                                tabIndex={-1}
                                                disableRipple
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleToggleFile(file.path);
                                                }}
                                                sx={{ color: '#888', '&.Mui-checked': { color: '#2196f3' } }}
                                            />
                                        </ListItemIcon>
                                    )}
                                    <ListItemIcon sx={{ minWidth: 40 }}>
                                        {file.type === 'directory' ? (
                                            <FolderIcon sx={{ color: isDisabled ? '#666' : '#ffa726' }} />
                                        ) : (
                                            <InsertDriveFileIcon sx={{ color: isDisabled ? '#666' : '#42a5f5' }} />
                                        )}
                                    </ListItemIcon>
                                    <ListItemText
                                        primary={
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <Typography variant="body2" sx={{ color: isDisabled ? '#666' : '#fff' }}>
                                                    {file.name}
                                                </Typography>
                                                {isDisabled && (
                                                    <Chip
                                                        label="Disabled"
                                                        size="small"
                                                        sx={{
                                                            height: 18,
                                                            fontSize: '0.65rem',
                                                            background: '#444',
                                                            color: '#888'
                                                        }}
                                                    />
                                                )}
                                            </Box>
                                        }
                                        secondary={
                                            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                                                <Typography variant="caption" sx={{ color: '#666' }}>
                                                    {file.type === 'file' ? formatSize(file.size) : 'Directory'}
                                                </Typography>
                                                <Typography variant="caption" sx={{ color: '#666' }}>
                                                    •
                                                </Typography>
                                                <Typography variant="caption" sx={{ color: '#666' }}>
                                                    {file.permissions}
                                                </Typography>
                                            </Box>
                                        }
                                    />
                                    <Tooltip title="Delete">
                                        <IconButton
                                            edge="end"
                                            size="small"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setFileToDelete({
                                                    path: file.path,
                                                    name: file.name,
                                                    isTarget: isTarget
                                                });
                                                setDeleteDialogOpen(true);
                                            }}
                                            sx={{
                                                color: '#f44336',
                                                '&:hover': {
                                                    background: 'rgba(244, 67, 54, 0.1)'
                                                }
                                            }}
                                        >
                                            <DeleteIcon fontSize="small" />
                                        </IconButton>
                                    </Tooltip>
                                </ListItem>
                            );
                        })
                    )}
                </List>
            </Box>

            <Box sx={{ mt: 1, textAlign: 'right' }}>
                <Typography variant="caption" sx={{ color: '#666' }}>
                    {files.length} items
                </Typography>
            </Box>
        </Box>
        );
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="lg"
            fullWidth
            PaperProps={{
                sx: {
                    background: '#1e1e1e',
                    color: '#fff',
                    minHeight: '70vh'
                }
            }}
        >
            <DialogTitle sx={{ borderBottom: '1px solid #333', pb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CloudUploadIcon sx={{ color: '#2196f3' }} />
                        <Typography variant="h6">Server-to-Server File Transfer</Typography>
                    </Box>
                    <Tooltip title={transferDirectories ? "Directories can be transferred" : "Only files can be transferred"}>
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={transferDirectories}
                                    onChange={(e) => setTransferDirectories(e.target.checked)}
                                    sx={{
                                        '& .MuiSwitch-switchBase.Mui-checked': {
                                            color: '#4caf50',
                                        },
                                        '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                                            backgroundColor: '#4caf50',
                                        },
                                    }}
                                />
                            }
                            label={
                                <Typography variant="body2" sx={{ color: '#fff', fontSize: '0.85rem' }}>
                                    Include Directories
                                </Typography>
                            }
                            sx={{ m: 0 }}
                        />
                    </Tooltip>
                </Box>
                {/* Server Selection Dropdowns */}
                {savedServers.length > 0 && (
                    <Box sx={{ display: 'flex', gap: 1.5, mt: 2, alignItems: 'center' }}>
                        <FormControl fullWidth size="small">
                            <InputLabel sx={{ color: '#888', '&.Mui-focused': { color: '#2196f3' } }}>
                                Source Server
                            </InputLabel>
                            <Select
                                value={selectedSourceServer?.id || ''}
                                onChange={(e) => {
                                    const server = [
                                        {
                                            id: 'current',
                                            name: 'Current Server',
                                            host: sourceServer.ip,
                                            username: sourceServer.username,
                                            sshKey: sourceServer.sshKey,
                                            connected: true
                                        },
                                        ...savedServers
                                    ].find(s => s.id === e.target.value);
                                    if (server) {
                                        setSelectedSourceServer(server);
                                        setSourcePath('/home');
                                    }
                                }}
                                label="Source Server"
                                sx={{
                                    color: '#fff',
                                    '.MuiOutlinedInput-notchedOutline': { borderColor: '#2196f3' },
                                    '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#42a5f5' },
                                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#2196f3' },
                                    '.MuiSvgIcon-root': { color: '#888' }
                                }}
                            >
                                <MenuItem value="current">
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Chip label="Current" size="small" sx={{ background: '#2196f3', color: '#fff', height: 20, fontSize: '0.7rem' }} />
                                        <Typography variant="body2">{sourceServer.username}@{sourceServer.ip}</Typography>
                                    </Box>
                                </MenuItem>
                                {savedServers.map(server => (
                                    <MenuItem key={server.id} value={server.id}>
                                        <Typography variant="body2">{server.name} ({server.username}@{server.host})</Typography>
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        <SwapHorizIcon sx={{ color: '#888', flexShrink: 0 }} />

                        <FormControl fullWidth size="small">
                            <InputLabel sx={{ color: '#888', '&.Mui-focused': { color: '#4caf50' } }}>
                                Target Server
                            </InputLabel>
                            <Select
                                value={selectedTargetServer?.id || ''}
                                onChange={(e) => {
                                    const server = [
                                        {
                                            id: 'current',
                                            name: 'Current Server',
                                            host: sourceServer.ip,
                                            username: sourceServer.username,
                                            sshKey: sourceServer.sshKey,
                                            connected: true
                                        },
                                        ...savedServers
                                    ].find(s => s.id === e.target.value);
                                    if (server) {
                                        setSelectedTargetServer(server);
                                        setTargetPath('/home');
                                    }
                                }}
                                label="Target Server"
                                sx={{
                                    color: '#fff',
                                    '.MuiOutlinedInput-notchedOutline': { borderColor: '#4caf50' },
                                    '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#66bb6a' },
                                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#4caf50' },
                                    '.MuiSvgIcon-root': { color: '#888' }
                                }}
                            >
                                <MenuItem value="current">
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Chip label="Current" size="small" sx={{ background: '#4caf50', color: '#fff', height: 20, fontSize: '0.7rem' }} />
                                        <Typography variant="body2">{sourceServer.username}@{sourceServer.ip}</Typography>
                                    </Box>
                                </MenuItem>
                                {savedServers.map(server => (
                                    <MenuItem key={server.id} value={server.id}>
                                        <Typography variant="body2">{server.name} ({server.username}@{server.host})</Typography>
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        {/* Add Server Button */}
                        <Tooltip title="Add new server">
                            <IconButton
                                onClick={onOpenServerManager}
                                sx={{
                                    color: '#2196f3',
                                    border: '1px solid #2196f3',
                                    borderRadius: 1,
                                    '&:hover': {
                                        background: 'rgba(33, 150, 243, 0.1)',
                                        borderColor: '#42a5f5'
                                    }
                                }}
                            >
                                <AddIcon />
                            </IconButton>
                        </Tooltip>
                    </Box>
                )}

                {/* Current Server Display (when no saved servers) */}
                {savedServers.length === 0 && (
                    <Box sx={{ display: 'flex', gap: 1.5, mt: 1.5, alignItems: 'center' }}>
                        <Chip
                            label={`Source: ${sourceServer.username}@${sourceServer.ip}`}
                            size="small"
                            sx={{ background: '#2196f3', color: '#fff', fontWeight: 500 }}
                        />
                        <SwapHorizIcon sx={{ color: '#888' }} />
                        <Chip
                            label={targetServer ? `Target: ${targetServer.username}@${targetServer.host}` : 'No target selected'}
                            size="small"
                            sx={{ background: targetServer ? '#4caf50' : '#666', color: '#fff', fontWeight: 500 }}
                        />
                        <Tooltip title="Add new server">
                            <IconButton
                                onClick={onOpenServerManager}
                                sx={{
                                    color: '#2196f3',
                                    border: '1px solid #2196f3',
                                    borderRadius: 1,
                                    ml: 'auto',
                                    '&:hover': {
                                        background: 'rgba(33, 150, 243, 0.1)',
                                        borderColor: '#42a5f5'
                                    }
                                }}
                            >
                                <AddIcon />
                            </IconButton>
                        </Tooltip>
                    </Box>
                )}
                <Alert
                    severity="info"
                    sx={{
                        mt: 1.5,
                        py: 0.5,
                        px: 1.5,
                        background: 'rgba(33, 150, 243, 0.08)',
                        border: '1px solid rgba(33, 150, 243, 0.3)',
                        '& .MuiAlert-icon': {
                            fontSize: '1rem',
                            py: 0.5
                        }
                    }}
                >
                    <Typography variant="caption" component="div" sx={{ lineHeight: 1.4, fontSize: '0.7rem' }}>
                        <strong>Navigate:</strong> Double-click folders • <strong>Drag & Drop:</strong> Drag files to transfer{!transferDirectories && ' (dirs disabled)'} • <strong>Multi-Select:</strong> Use checkboxes + button
                    </Typography>
                </Alert>
            </DialogTitle>

            <DialogContent sx={{ mt: 2 }}>
                {error && (
                    <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
                        {error}
                    </Alert>
                )}

                {transferring && (
                    <Box sx={{ mb: 2 }}>
                        <Typography variant="body2" sx={{ mb: 1, color: '#2196f3' }}>
                            Transferring {selectedFiles.length} file(s)...
                        </Typography>
                        <LinearProgress
                            variant="determinate"
                            value={transferProgress}
                            sx={{
                                background: '#333',
                                '& .MuiLinearProgress-bar': { background: '#2196f3' }
                            }}
                        />
                    </Box>
                )}

                {!selectedTargetServer ? (
                    <Box sx={{ p: 3, textAlign: 'center', color: '#666' }}>
                        <Typography variant="body1">
                            Please select a target server
                        </Typography>
                        <Typography variant="caption">
                            {savedServers.length > 0
                                ? 'Use the dropdown above to select a target server'
                                : 'Use the "Connect to Server" button to add servers first'}
                        </Typography>
                    </Box>
                ) : (
                    <Box sx={{ display: 'flex', gap: 2, height: '100%' }}>
                        {/* Source Server Files */}
                        <FileList
                            files={filteredSourceFiles}
                            search={sourceSearch}
                            onSearchChange={setSourceSearch}
                            path={sourcePath}
                            onPathChange={setSourcePath}
                            isTarget={false}
                        />

                        <Divider orientation="vertical" flexItem sx={{ background: '#333' }} />

                        {/* Target Server Files */}
                        <FileList
                            files={filteredTargetFiles}
                            search={targetSearch}
                            onSearchChange={setTargetSearch}
                            path={targetPath}
                            onPathChange={setTargetPath}
                            isTarget={true}
                        />
                    </Box>
                )}
            </DialogContent>

            <DialogActions sx={{ borderTop: '1px solid #333', p: 2 }}>
                <Box sx={{ flex: 1 }}>
                    {selectedFiles.length > 0 && (
                        <Chip
                            label={`${selectedFiles.length} file(s) selected`}
                            size="small"
                            sx={{ background: '#2196f3', color: '#fff' }}
                        />
                    )}
                </Box>
                <Button
                    onClick={onClose}
                    sx={{
                        color: '#888',
                        '&:hover': { background: 'rgba(255, 255, 255, 0.05)' }
                    }}
                >
                    Close
                </Button>
                <Button
                    variant="contained"
                    startIcon={<CloudUploadIcon />}
                    onClick={handleTransfer}
                    disabled={selectedFiles.length === 0 || !selectedSourceServer || !selectedTargetServer || transferring || loading}
                    sx={{
                        background: '#2196f3',
                        '&:hover': { background: '#1976d2' },
                        '&:disabled': { background: '#333', color: '#666' }
                    }}
                >
                    Transfer Files
                </Button>
            </DialogActions>

            {/* Delete Confirmation Dialog */}
            <Dialog
                open={deleteDialogOpen}
                onClose={() => {
                    setDeleteDialogOpen(false);
                    setFileToDelete(null);
                }}
                PaperProps={{
                    sx: {
                        background: '#1e1e1e',
                        color: '#fff'
                    }
                }}
            >
                <DialogTitle sx={{ borderBottom: '1px solid #333' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <DeleteIcon sx={{ color: '#f44336' }} />
                        <Typography variant="h6">Confirm Delete</Typography>
                    </Box>
                </DialogTitle>
                <DialogContent sx={{ mt: 2 }}>
                    <Typography variant="body2" sx={{ mb: 2 }}>
                        Are you sure you want to delete this {fileToDelete?.name.includes('.') ? 'file' : 'folder'}?
                    </Typography>
                    <Alert severity="warning" sx={{ background: 'rgba(255, 152, 0, 0.1)', border: '1px solid #ff9800' }}>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {fileToDelete?.name}
                        </Typography>
                        <Typography variant="caption" sx={{ display: 'block', mt: 1, color: '#888' }}>
                            Path: {fileToDelete?.path}
                        </Typography>
                        <Typography variant="caption" sx={{ display: 'block', mt: 1, color: '#f44336' }}>
                            This action cannot be undone!
                        </Typography>
                    </Alert>
                </DialogContent>
                <DialogActions sx={{ borderTop: '1px solid #333', p: 2 }}>
                    <Button
                        onClick={() => {
                            setDeleteDialogOpen(false);
                            setFileToDelete(null);
                        }}
                        sx={{
                            color: '#888',
                            '&:hover': { background: 'rgba(255, 255, 255, 0.05)' }
                        }}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="contained"
                        startIcon={<DeleteIcon />}
                        onClick={handleDeleteFile}
                        disabled={loading}
                        sx={{
                            background: '#f44336',
                            '&:hover': { background: '#d32f2f' },
                            '&:disabled': { background: '#333', color: '#666' }
                        }}
                    >
                        {loading ? 'Deleting...' : 'Delete'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Create Folder Dialog */}
            <Dialog
                open={createFolderDialogOpen}
                onClose={() => {
                    setCreateFolderDialogOpen(false);
                    setNewFolderName('');
                    setError(null);
                }}
                PaperProps={{
                    sx: {
                        background: '#1e1e1e',
                        color: '#fff'
                    }
                }}
            >
                <DialogTitle sx={{ borderBottom: '1px solid #333' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CreateNewFolderIcon sx={{ color: '#4caf50' }} />
                        <Typography variant="h6">Create New Folder</Typography>
                    </Box>
                </DialogTitle>
                <DialogContent sx={{ mt: 2 }}>
                    <Typography variant="body2" sx={{ mb: 2, color: '#888' }}>
                        Creating folder in: {createFolderTarget ? targetPath : sourcePath}
                    </Typography>
                    <TextField
                        autoFocus
                        fullWidth
                        label="Folder Name"
                        placeholder="e.g., my-folder"
                        value={newFolderName}
                        onChange={(e) => setNewFolderName(e.target.value)}
                        onKeyPress={(e) => {
                            if (e.key === 'Enter' && newFolderName.trim()) {
                                handleCreateFolder();
                            }
                        }}
                        InputProps={{
                            sx: { color: '#fff' }
                        }}
                        InputLabelProps={{
                            sx: { color: '#888' }
                        }}
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                '& fieldset': { borderColor: '#4caf50' },
                                '&:hover fieldset': { borderColor: '#66bb6a' },
                                '&.Mui-focused fieldset': { borderColor: '#4caf50' }
                            }
                        }}
                    />
                    {error && (
                        <Alert severity="error" sx={{ mt: 2 }} onClose={() => setError(null)}>
                            {error}
                        </Alert>
                    )}
                </DialogContent>
                <DialogActions sx={{ borderTop: '1px solid #333', p: 2 }}>
                    <Button
                        onClick={() => {
                            setCreateFolderDialogOpen(false);
                            setNewFolderName('');
                            setError(null);
                        }}
                        sx={{
                            color: '#888',
                            '&:hover': { background: 'rgba(255, 255, 255, 0.05)' }
                        }}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="contained"
                        startIcon={<CreateNewFolderIcon />}
                        onClick={handleCreateFolder}
                        disabled={loading || !newFolderName.trim()}
                        sx={{
                            background: '#4caf50',
                            '&:hover': { background: '#388e3c' },
                            '&:disabled': { background: '#333', color: '#666' }
                        }}
                    >
                        {loading ? 'Creating...' : 'Create Folder'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Dialog>
    );
};

export default ServerFileTransfer;
