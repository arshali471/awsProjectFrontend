import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    IconButton,
    List,
    ListItem,
    ListItemButton,
    ListItemText,
    TextField,
    Tooltip,
    Chip,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    InputAdornment,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import SearchIcon from '@mui/icons-material/Search';
import FolderIcon from '@mui/icons-material/Folder';

interface CommandSnippet {
    id: string;
    name: string;
    command: string;
    category: string;
    description?: string;
    favorite: boolean;
}

interface CommandSnippetsProps {
    onExecuteCommand: (command: string) => void;
    connected: boolean;
}

const defaultSnippets: CommandSnippet[] = [
    {
        id: '1',
        name: 'System Info',
        command: 'uname -a && uptime',
        category: 'System',
        description: 'Show system information and uptime',
        favorite: true,
    },
    {
        id: '2',
        name: 'Disk Usage',
        command: 'df -h',
        category: 'System',
        description: 'Show disk space usage',
        favorite: true,
    },
    {
        id: '3',
        name: 'Memory Usage',
        command: 'free -h',
        category: 'System',
        description: 'Show memory usage',
        favorite: false,
    },
    {
        id: '4',
        name: 'Top Processes',
        command: 'ps aux --sort=-%mem | head -n 10',
        category: 'System',
        description: 'Show top 10 memory-consuming processes',
        favorite: false,
    },
    {
        id: '5',
        name: 'Network Interfaces',
        command: 'ip addr show',
        category: 'Network',
        description: 'Show network interfaces and IP addresses',
        favorite: false,
    },
    {
        id: '6',
        name: 'Open Ports',
        command: 'ss -tuln',
        category: 'Network',
        description: 'Show listening ports',
        favorite: false,
    },
    {
        id: '7',
        name: 'Find Large Files',
        command: 'find . -type f -size +100M -exec ls -lh {} \\; 2>/dev/null',
        category: 'Files',
        description: 'Find files larger than 100MB',
        favorite: false,
    },
    {
        id: '8',
        name: 'Docker Containers',
        command: 'docker ps -a',
        category: 'Docker',
        description: 'List all Docker containers',
        favorite: false,
    },
    {
        id: '9',
        name: 'Docker Images',
        command: 'docker images',
        category: 'Docker',
        description: 'List all Docker images',
        favorite: false,
    },
    {
        id: '10',
        name: 'Git Status',
        command: 'git status',
        category: 'Git',
        description: 'Show git repository status',
        favorite: true,
    },
    {
        id: '11',
        name: 'Git Log',
        command: 'git log --oneline --graph --all -20',
        category: 'Git',
        description: 'Show last 20 commits in graph format',
        favorite: false,
    },
    {
        id: '12',
        name: 'Nginx Status',
        command: 'sudo systemctl status nginx',
        category: 'Services',
        description: 'Check Nginx service status',
        favorite: false,
    },
];

const STORAGE_KEY = 'terminal_command_snippets';

export default function CommandSnippets({
    onExecuteCommand,
    connected,
}: CommandSnippetsProps) {
    const [snippets, setSnippets] = useState<CommandSnippet[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('All');
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingSnippet, setEditingSnippet] = useState<CommandSnippet | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        command: '',
        category: 'Custom',
        description: '',
    });

    // Load snippets from localStorage
    useEffect(() => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                setSnippets(JSON.parse(stored));
            } else {
                setSnippets(defaultSnippets);
                localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultSnippets));
            }
        } catch (error) {
            console.error('Failed to load snippets:', error);
            setSnippets(defaultSnippets);
        }
    }, []);

    // Save snippets to localStorage
    const saveSnippets = (newSnippets: CommandSnippet[]) => {
        setSnippets(newSnippets);
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(newSnippets));
        } catch (error) {
            console.error('Failed to save snippets:', error);
        }
    };

    const handleExecute = (snippet: CommandSnippet) => {
        onExecuteCommand(snippet.command);
    };

    const handleCopy = (snippet: CommandSnippet) => {
        navigator.clipboard.writeText(snippet.command);
    };

    const handleEdit = (snippet: CommandSnippet) => {
        setEditingSnippet(snippet);
        setFormData({
            name: snippet.name,
            command: snippet.command,
            category: snippet.category,
            description: snippet.description || '',
        });
        setDialogOpen(true);
    };

    const handleDelete = (id: string) => {
        if (confirm('Are you sure you want to delete this snippet?')) {
            saveSnippets(snippets.filter(s => s.id !== id));
        }
    };

    const handleAddNew = () => {
        setEditingSnippet(null);
        setFormData({
            name: '',
            command: '',
            category: 'Custom',
            description: '',
        });
        setDialogOpen(true);
    };

    const handleSave = () => {
        if (!formData.name || !formData.command) {
            return;
        }

        if (editingSnippet) {
            // Update existing
            saveSnippets(
                snippets.map(s =>
                    s.id === editingSnippet.id
                        ? { ...s, ...formData }
                        : s
                )
            );
        } else {
            // Add new
            const newSnippet: CommandSnippet = {
                id: Date.now().toString(),
                ...formData,
                favorite: false,
            };
            saveSnippets([...snippets, newSnippet]);
        }

        setDialogOpen(false);
    };

    const categories = ['All', ...Array.from(new Set(snippets.map(s => s.category)))];

    const filteredSnippets = snippets.filter(snippet => {
        const matchesSearch =
            snippet.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            snippet.command.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (snippet.description?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);

        const matchesCategory = selectedCategory === 'All' || snippet.category === selectedCategory;

        return matchesSearch && matchesCategory;
    });

    const favoriteSnippets = filteredSnippets.filter(s => s.favorite);
    const otherSnippets = filteredSnippets.filter(s => !s.favorite);

    return (
        <Box
            sx={{
                width: 350,
                height: '100%',
                background: '#252525',
                borderRight: '1px solid #444',
                display: 'flex',
                flexDirection: 'column',
            }}
        >
            {/* Header */}
            <Box
                sx={{
                    padding: 2,
                    borderBottom: '1px solid #444',
                }}
            >
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
                    <Typography variant="subtitle2" sx={{ color: '#fff', fontWeight: 'bold' }}>
                        Command Snippets
                    </Typography>
                    <Tooltip title="Add Snippet">
                        <IconButton
                            size="small"
                            onClick={handleAddNew}
                            sx={{
                                color: '#888',
                                '&:hover': { color: '#4caf50', background: 'rgba(76, 175, 80, 0.1)' },
                            }}
                        >
                            <AddIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                </Box>

                {/* Search */}
                <TextField
                    size="small"
                    placeholder="Search snippets..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon fontSize="small" sx={{ color: '#888' }} />
                            </InputAdornment>
                        ),
                    }}
                    sx={{
                        width: '100%',
                        mb: 1.5,
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
                                borderColor: '#9c27b0',
                            },
                        },
                    }}
                />

                {/* Categories */}
                <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                    {categories.map(category => (
                        <Chip
                            key={category}
                            label={category}
                            size="small"
                            onClick={() => setSelectedCategory(category)}
                            sx={{
                                background: selectedCategory === category ? '#9c27b0' : '#1e1e1e',
                                color: selectedCategory === category ? '#fff' : '#888',
                                '&:hover': {
                                    background: selectedCategory === category ? '#7b1fa2' : '#2d2d2d',
                                },
                                fontSize: '0.75rem',
                                height: 24,
                            }}
                        />
                    ))}
                </Box>
            </Box>

            {/* Snippet List */}
            <Box sx={{ flex: 1, overflow: 'auto' }}>
                {favoriteSnippets.length > 0 && (
                    <>
                        <Box sx={{ padding: 1.5, paddingBottom: 0.5 }}>
                            <Typography variant="caption" sx={{ color: '#888', fontWeight: 'bold' }}>
                                ⭐ FAVORITES
                            </Typography>
                        </Box>
                        <List sx={{ padding: 0 }}>
                            {favoriteSnippets.map(snippet => (
                                <SnippetItem
                                    key={snippet.id}
                                    snippet={snippet}
                                    onExecute={handleExecute}
                                    onCopy={handleCopy}
                                    onEdit={handleEdit}
                                    onDelete={handleDelete}
                                    connected={connected}
                                />
                            ))}
                        </List>
                    </>
                )}

                {otherSnippets.length > 0 && (
                    <>
                        {favoriteSnippets.length > 0 && (
                            <Box sx={{ padding: 1.5, paddingBottom: 0.5, paddingTop: 1 }}>
                                <Typography variant="caption" sx={{ color: '#888', fontWeight: 'bold' }}>
                                    ALL SNIPPETS
                                </Typography>
                            </Box>
                        )}
                        <List sx={{ padding: 0 }}>
                            {otherSnippets.map(snippet => (
                                <SnippetItem
                                    key={snippet.id}
                                    snippet={snippet}
                                    onExecute={handleExecute}
                                    onCopy={handleCopy}
                                    onEdit={handleEdit}
                                    onDelete={handleDelete}
                                    connected={connected}
                                />
                            ))}
                        </List>
                    </>
                )}

                {filteredSnippets.length === 0 && (
                    <Box sx={{ padding: 2 }}>
                        <Typography variant="body2" sx={{ color: '#888', textAlign: 'center' }}>
                            No snippets found
                        </Typography>
                    </Box>
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
                <Typography variant="caption" sx={{ color: '#888', fontFamily: 'monospace' }}>
                    {filteredSnippets.length} {filteredSnippets.length === 1 ? 'snippet' : 'snippets'}
                    {searchQuery && ` (filtered from ${snippets.length})`}
                </Typography>
            </Box>

            {/* Add/Edit Dialog */}
            <Dialog
                open={dialogOpen}
                onClose={() => setDialogOpen(false)}
                maxWidth="sm"
                fullWidth
                PaperProps={{
                    sx: {
                        background: '#2d2d2d',
                        color: '#fff',
                        border: '1px solid #444',
                    },
                }}
            >
                <DialogTitle sx={{ borderBottom: '1px solid #444' }}>
                    {editingSnippet ? 'Edit Snippet' : 'Add New Snippet'}
                </DialogTitle>
                <DialogContent sx={{ paddingTop: 2 }}>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Name"
                        fullWidth
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        sx={{
                            mb: 2,
                            '& .MuiOutlinedInput-root': {
                                background: '#1e1e1e',
                                color: '#fff',
                                '& fieldset': { borderColor: '#444' },
                                '&:hover fieldset': { borderColor: '#666' },
                                '&.Mui-focused fieldset': { borderColor: '#9c27b0' },
                            },
                            '& .MuiInputLabel-root': { color: '#888' },
                            '& .MuiInputLabel-root.Mui-focused': { color: '#9c27b0' },
                        }}
                    />
                    <TextField
                        margin="dense"
                        label="Command"
                        fullWidth
                        multiline
                        rows={3}
                        value={formData.command}
                        onChange={(e) => setFormData({ ...formData, command: e.target.value })}
                        sx={{
                            mb: 2,
                            '& .MuiOutlinedInput-root': {
                                background: '#1e1e1e',
                                color: '#fff',
                                fontFamily: 'monospace',
                                '& fieldset': { borderColor: '#444' },
                                '&:hover fieldset': { borderColor: '#666' },
                                '&.Mui-focused fieldset': { borderColor: '#9c27b0' },
                            },
                            '& .MuiInputLabel-root': { color: '#888' },
                            '& .MuiInputLabel-root.Mui-focused': { color: '#9c27b0' },
                        }}
                    />
                    <TextField
                        margin="dense"
                        label="Category"
                        fullWidth
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        sx={{
                            mb: 2,
                            '& .MuiOutlinedInput-root': {
                                background: '#1e1e1e',
                                color: '#fff',
                                '& fieldset': { borderColor: '#444' },
                                '&:hover fieldset': { borderColor: '#666' },
                                '&.Mui-focused fieldset': { borderColor: '#9c27b0' },
                            },
                            '& .MuiInputLabel-root': { color: '#888' },
                            '& .MuiInputLabel-root.Mui-focused': { color: '#9c27b0' },
                        }}
                    />
                    <TextField
                        margin="dense"
                        label="Description (optional)"
                        fullWidth
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                background: '#1e1e1e',
                                color: '#fff',
                                '& fieldset': { borderColor: '#444' },
                                '&:hover fieldset': { borderColor: '#666' },
                                '&.Mui-focused fieldset': { borderColor: '#9c27b0' },
                            },
                            '& .MuiInputLabel-root': { color: '#888' },
                            '& .MuiInputLabel-root.Mui-focused': { color: '#9c27b0' },
                        }}
                    />
                </DialogContent>
                <DialogActions sx={{ borderTop: '1px solid #444', padding: 2 }}>
                    <Button
                        onClick={() => setDialogOpen(false)}
                        sx={{ color: '#888', '&:hover': { background: '#3d3d3d' } }}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSave}
                        disabled={!formData.name || !formData.command}
                        sx={{
                            background: '#9c27b0',
                            color: '#fff',
                            '&:hover': { background: '#7b1fa2' },
                            '&:disabled': { background: '#555', color: '#888' },
                        }}
                    >
                        {editingSnippet ? 'Save' : 'Add'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}

// Snippet Item Component
interface SnippetItemProps {
    snippet: CommandSnippet;
    onExecute: (snippet: CommandSnippet) => void;
    onCopy: (snippet: CommandSnippet) => void;
    onEdit: (snippet: CommandSnippet) => void;
    onDelete: (id: string) => void;
    connected: boolean;
}

function SnippetItem({
    snippet,
    onExecute,
    onCopy,
    onEdit,
    onDelete,
    connected,
}: SnippetItemProps) {
    return (
        <ListItem
            disablePadding
            secondaryAction={
                <Box sx={{ display: 'flex', gap: 0.5 }}>
                    <Tooltip title="Execute">
                        <IconButton
                            edge="end"
                            size="small"
                            onClick={() => onExecute(snippet)}
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
                    <Tooltip title="Copy">
                        <IconButton
                            edge="end"
                            size="small"
                            onClick={() => onCopy(snippet)}
                            sx={{
                                color: '#666',
                                '&:hover': { color: '#2196f3' },
                            }}
                        >
                            <ContentCopyIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Edit">
                        <IconButton
                            edge="end"
                            size="small"
                            onClick={() => onEdit(snippet)}
                            sx={{
                                color: '#666',
                                '&:hover': { color: '#ff9800' },
                            }}
                        >
                            <EditIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                        <IconButton
                            edge="end"
                            size="small"
                            onClick={() => onDelete(snippet.id)}
                            sx={{
                                color: '#666',
                                '&:hover': { color: '#f44336' },
                            }}
                        >
                            <DeleteIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                </Box>
            }
            sx={{
                borderBottom: '1px solid #333',
                '&:hover': {
                    background: '#2d2d2d',
                },
            }}
        >
            <ListItemButton sx={{ paddingRight: 14 }}>
                <ListItemText
                    primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="body2" sx={{ color: '#fff', fontWeight: 'bold' }}>
                                {snippet.name}
                            </Typography>
                            <Chip
                                label={snippet.category}
                                size="small"
                                icon={<FolderIcon sx={{ fontSize: '0.75rem !important' }} />}
                                sx={{
                                    height: 20,
                                    fontSize: '0.7rem',
                                    background: '#1e1e1e',
                                    color: '#9c27b0',
                                }}
                            />
                        </Box>
                    }
                    secondary={
                        <Box sx={{ mt: 0.5 }}>
                            {snippet.description && (
                                <Typography
                                    variant="caption"
                                    sx={{
                                        color: '#888',
                                        display: 'block',
                                        mb: 0.5,
                                    }}
                                >
                                    {snippet.description}
                                </Typography>
                            )}
                            <Typography
                                variant="caption"
                                sx={{
                                    color: '#666',
                                    fontFamily: 'monospace',
                                    fontSize: '0.7rem',
                                    display: 'block',
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                }}
                            >
                                $ {snippet.command}
                            </Typography>
                        </Box>
                    }
                />
            </ListItemButton>
        </ListItem>
    );
}
