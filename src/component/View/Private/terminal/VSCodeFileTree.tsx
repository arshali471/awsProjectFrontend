import React, { useState, useEffect } from 'react';
import {
    Box,
    IconButton,
    Typography,
    TextField,
    InputAdornment,
    CircularProgress,
    Tooltip,
    Collapse,
} from '@mui/material';
import FolderIcon from '@mui/icons-material/Folder';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import RefreshIcon from '@mui/icons-material/Refresh';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import makeRequest from '../../../api/makeRequest';
import { RequestMethods } from '../../../api/requestMethode';
import url from '../../../api/urls';
import { toast } from 'react-hot-toast';

interface VSCodeFileTreeProps {
    ip: string;
    username: string;
    sshKey: string;
    connected: boolean;
    initialPath?: string; // Optional initial path, defaults to home directory
    onClose: () => void;
    onFileSelect: (file: { path: string; name: string }) => void; // Callback when file is selected
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

interface TreeNode {
    name: string;
    path: string;
    isDirectory: boolean;
    isExpanded: boolean;
    isLoading: boolean;
    children: TreeNode[];
    file: FileItem;
}

export default function VSCodeFileTree({ ip, username, sshKey, connected, initialPath, onClose, onFileSelect }: VSCodeFileTreeProps) {
    const [rootPath] = useState(initialPath || `/home/${username}`);
    const [treeData, setTreeData] = useState<TreeNode[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchText, setSearchText] = useState('');

    // Load root directory on mount or when initialPath changes
    useEffect(() => {
        if (connected) {
            // Reset tree data when path changes
            setTreeData([]);
            loadDirectory(rootPath, null);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [connected, rootPath]);

    const loadDirectory = async (path: string, parentNode: TreeNode | null) => {
        try {
            if (parentNode) {
                // Update parent node loading state
                setTreeData(prevData => updateNodeInTree(prevData, parentNode.path, { isLoading: true }));
            } else {
                setLoading(true);
            }

            const response = await makeRequest(
                url.terminal.listFiles,
                RequestMethods.POST,
                { ip, username, sshKey, path }
            );

            if (response.status === 200 && response.data.success) {
                const files: FileItem[] = response.data.files || [];

                // Sort: directories first, then files, alphabetically
                files.sort((a, b) => {
                    if (a.isDirectory && !b.isDirectory) return -1;
                    if (!a.isDirectory && b.isDirectory) return 1;
                    return a.name.localeCompare(b.name);
                });

                const nodes: TreeNode[] = files.map(file => ({
                    name: file.name,
                    path: path.endsWith('/') ? `${path}${file.name}` : `${path}/${file.name}`,
                    isDirectory: file.isDirectory,
                    isExpanded: false,
                    isLoading: false,
                    children: [],
                    file
                }));

                if (parentNode) {
                    // Update parent node with children
                    setTreeData(prevData =>
                        updateNodeInTree(prevData, parentNode.path, {
                            children: nodes,
                            isExpanded: true,
                            isLoading: false
                        })
                    );
                } else {
                    // Set as root
                    setTreeData(nodes);
                }
            } else {
                toast.error('Failed to list files');
            }
        } catch (err: any) {
            console.error('File listing error:', err);
            toast.error('Failed to list files');
        } finally {
            if (!parentNode) {
                setLoading(false);
            }
        }
    };

    const updateNodeInTree = (nodes: TreeNode[], targetPath: string, updates: Partial<TreeNode>): TreeNode[] => {
        return nodes.map(node => {
            if (node.path === targetPath) {
                return { ...node, ...updates };
            }
            if (node.children.length > 0) {
                return {
                    ...node,
                    children: updateNodeInTree(node.children, targetPath, updates)
                };
            }
            return node;
        });
    };

    const handleToggleFolder = (node: TreeNode) => {
        if (!node.isDirectory) return;

        if (node.isExpanded) {
            // Collapse
            setTreeData(prevData =>
                updateNodeInTree(prevData, node.path, { isExpanded: false })
            );
        } else {
            // Expand - load children if not already loaded
            if (node.children.length === 0) {
                loadDirectory(node.path, node);
            } else {
                setTreeData(prevData =>
                    updateNodeInTree(prevData, node.path, { isExpanded: true })
                );
            }
        }
    };

    const handleFileClick = (node: TreeNode) => {
        if (node.isDirectory) {
            handleToggleFolder(node);
        } else {
            // Notify parent component to open file in editor
            onFileSelect({
                path: node.path,
                name: node.name
            });
        }
    };

    const renderTreeNode = (node: TreeNode, depth: number = 0): React.ReactNode => {
        const indentSize = 16;
        const paddingLeft = depth * indentSize + 8;

        // Filter based on search
        const matchesSearch = searchText === '' ||
            node.name.toLowerCase().includes(searchText.toLowerCase());

        if (!matchesSearch && !node.isDirectory) {
            return null;
        }

        // For directories, check if any children match
        const hasMatchingChildren = node.isDirectory && node.children.some(child =>
            child.name.toLowerCase().includes(searchText.toLowerCase())
        );

        if (!matchesSearch && !hasMatchingChildren) {
            return null;
        }

        return (
            <Box key={node.path}>
                {/* Node Row */}
                <Box
                    onClick={() => handleFileClick(node)}
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        paddingLeft: `${paddingLeft}px`,
                        paddingRight: '8px',
                        height: 28,
                        cursor: 'pointer',
                        userSelect: 'none',
                        '&:hover': {
                            background: '#2a2d2e',
                        },
                    }}
                >
                    {/* Expand/Collapse Icon */}
                    <Box
                        sx={{
                            width: 16,
                            height: 16,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginRight: '4px',
                        }}
                    >
                        {node.isDirectory && (
                            node.isLoading ? (
                                <CircularProgress size={12} sx={{ color: '#888' }} />
                            ) : node.isExpanded ? (
                                <ExpandMoreIcon sx={{ fontSize: 16, color: '#ccc' }} />
                            ) : (
                                <ChevronRightIcon sx={{ fontSize: 16, color: '#ccc' }} />
                            )
                        )}
                    </Box>

                    {/* File/Folder Icon */}
                    <Box
                        sx={{
                            width: 16,
                            height: 16,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginRight: '6px',
                        }}
                    >
                        {node.isDirectory ? (
                            node.isExpanded ? (
                                <FolderOpenIcon sx={{ fontSize: 16, color: '#dcb67a' }} />
                            ) : (
                                <FolderIcon sx={{ fontSize: 16, color: '#dcb67a' }} />
                            )
                        ) : (
                            <InsertDriveFileIcon sx={{ fontSize: 14, color: '#858585' }} />
                        )}
                    </Box>

                    {/* File/Folder Name */}
                    <Typography
                        sx={{
                            fontSize: '13px',
                            fontFamily: 'monospace',
                            color: '#ccc',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            flex: 1,
                        }}
                    >
                        {node.name}
                    </Typography>
                </Box>

                {/* Children */}
                {node.isDirectory && node.isExpanded && (
                    <Collapse in={node.isExpanded} timeout="auto">
                        <Box>
                            {node.children.map(child => renderTreeNode(child, depth + 1))}
                        </Box>
                    </Collapse>
                )}
            </Box>
        );
    };

    return (
        <Box
            sx={{
                width: 300,
                height: '100%',
                background: '#1e1e1e',
                borderLeft: '1px solid #2d2d2d',
                display: 'flex',
                flexDirection: 'column',
            }}
        >
            {/* Header */}
            <Box sx={{ padding: '8px 12px', borderBottom: '1px solid #2d2d2d' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography
                            variant="caption"
                            sx={{
                                color: '#ccc',
                                fontWeight: 600,
                                textTransform: 'uppercase',
                                fontSize: '11px',
                                letterSpacing: '0.5px',
                                display: 'block',
                            }}
                        >
                            Explorer
                        </Typography>
                        <Typography
                            variant="caption"
                            sx={{
                                color: '#858585',
                                fontSize: '10px',
                                fontFamily: 'monospace',
                                display: 'block',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                            }}
                            title={rootPath}
                        >
                            {rootPath}
                        </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                        <Tooltip title="Refresh">
                            <IconButton
                                size="small"
                                onClick={() => loadDirectory(rootPath, null)}
                                disabled={!connected || loading}
                                sx={{
                                    color: '#ccc',
                                    padding: '4px',
                                    '&:hover': { color: '#fff', background: '#2a2d2e' }
                                }}
                            >
                                <RefreshIcon fontSize="small" sx={{ fontSize: 16 }} />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title="Close">
                            <IconButton
                                size="small"
                                onClick={onClose}
                                sx={{
                                    color: '#ccc',
                                    padding: '4px',
                                    '&:hover': { color: '#fff', background: '#2a2d2e' }
                                }}
                            >
                                <CloseIcon fontSize="small" sx={{ fontSize: 16 }} />
                            </IconButton>
                        </Tooltip>
                    </Box>
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
                                <SearchIcon sx={{ color: '#888', fontSize: 16 }} />
                            </InputAdornment>
                        ),
                        endAdornment: searchText && (
                            <InputAdornment position="end">
                                <IconButton
                                    size="small"
                                    onClick={() => setSearchText('')}
                                    sx={{ color: '#888', padding: '2px' }}
                                >
                                    <CloseIcon sx={{ fontSize: 14 }} />
                                </IconButton>
                            </InputAdornment>
                        ),
                    }}
                    sx={{
                        '& .MuiOutlinedInput-root': {
                            background: '#252526',
                            color: '#ccc',
                            fontSize: '13px',
                            height: '28px',
                            '& fieldset': {
                                borderColor: '#3c3c3c',
                            },
                            '&:hover fieldset': {
                                borderColor: '#515151',
                            },
                            '&.Mui-focused fieldset': {
                                borderColor: '#007acc',
                                borderWidth: '1px',
                            },
                        },
                        '& .MuiInputBase-input': {
                            padding: '4px 8px',
                        },
                    }}
                />
            </Box>

            {/* Tree View */}
            <Box sx={{ flex: 1, overflow: 'auto' }}>
                {loading ? (
                    <Box
                        sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            height: '100%',
                            gap: 1,
                        }}
                    >
                        <CircularProgress size={24} sx={{ color: '#007acc' }} />
                        <Typography variant="caption" sx={{ color: '#888', fontSize: '11px' }}>
                            Loading files...
                        </Typography>
                    </Box>
                ) : treeData.length === 0 ? (
                    <Box sx={{ padding: 2, textAlign: 'center' }}>
                        <Typography variant="caption" sx={{ color: '#888', fontSize: '11px' }}>
                            No files found
                        </Typography>
                    </Box>
                ) : (
                    <Box>
                        {treeData.map(node => renderTreeNode(node, 0))}
                    </Box>
                )}
            </Box>
        </Box>
    );
}
