import React, { useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Box,
    List,
    ListItem,
    ListItemText,
    ListItemSecondaryAction,
    IconButton,
    Chip,
    Typography,
    Divider,
    Tooltip,
    Alert,
    FormControl,
    FormLabel,
    RadioGroup,
    FormControlLabel,
    Radio
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import LinkIcon from '@mui/icons-material/Link';
import StorageIcon from '@mui/icons-material/Storage';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import KeyIcon from '@mui/icons-material/Key';

export type RemoteServer = {
    id: string;
    name: string;
    host: string;
    username: string;
    sshKey: string;
    connected: boolean;
};

type Props = {
    open: boolean;
    onClose: () => void;
    currentServer: { ip: string; username: string };
    onConnectToServer: (server: RemoteServer) => void;
    onServersUpdate?: (servers: RemoteServer[]) => void;
};

const ServerConnectionManager = ({ open, onClose, currentServer, onConnectToServer, onServersUpdate }: Props) => {
    const [servers, setServers] = useState<RemoteServer[]>([]);
    const [showAddForm, setShowAddForm] = useState(false);
    const [newServer, setNewServer] = useState({
        name: '',
        host: '',
        username: '',
        sshKey: ''
    });
    const [keyOption, setKeyOption] = useState<'current' | 'upload'>('current');
    const [keyFile, setKeyFile] = useState<File | null>(null);
    const [uploadError, setUploadError] = useState<string | null>(null);

    const handleKeyFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            // Validate file type (should be a text file)
            if (file.size > 10 * 1024) { // 10KB limit for key files
                setUploadError('SSH key file is too large (max 10KB)');
                setKeyFile(null);
                return;
            }

            const reader = new FileReader();
            reader.onload = (e) => {
                const content = e.target?.result as string;

                // Basic validation for SSH key format
                if (!content.includes('BEGIN') || !content.includes('PRIVATE KEY')) {
                    setUploadError('Invalid SSH private key format');
                    setKeyFile(null);
                    return;
                }

                setNewServer({ ...newServer, sshKey: content });
                setKeyFile(file);
                setUploadError(null);
            };
            reader.onerror = () => {
                setUploadError('Failed to read key file');
                setKeyFile(null);
            };
            reader.readAsText(file);
        }
    };

    const handleAddServer = () => {
        if (!newServer.name || !newServer.host || !newServer.username) {
            setUploadError('Please fill in all required fields');
            return;
        }

        if (keyOption === 'upload' && !keyFile) {
            setUploadError('Please upload an SSH key file');
            return;
        }

        const server: RemoteServer = {
            id: `server-${Date.now()}`,
            name: newServer.name,
            host: newServer.host,
            username: newServer.username,
            sshKey: keyOption === 'current' ? '' : newServer.sshKey,
            connected: false
        };

        const updatedServers = [...servers, server];
        setServers(updatedServers);
        onServersUpdate?.(updatedServers);
        setNewServer({ name: '', host: '', username: '', sshKey: '' });
        setKeyFile(null);
        setKeyOption('current');
        setUploadError(null);
        setShowAddForm(false);
    };

    const handleRemoveServer = (id: string) => {
        const updatedServers = servers.filter(s => s.id !== id);
        setServers(updatedServers);
        onServersUpdate?.(updatedServers);
    };

    const handleConnect = (server: RemoteServer) => {
        onConnectToServer(server);
        onClose();
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="md"
            fullWidth
            PaperProps={{
                sx: {
                    background: '#1e1e1e',
                    color: '#fff',
                }
            }}
        >
            <DialogTitle sx={{ borderBottom: '1px solid #333' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <StorageIcon sx={{ color: '#2196f3' }} />
                    <Typography variant="h6">Connect to Remote Server</Typography>
                </Box>
                <Typography variant="body2" sx={{ color: '#888', mt: 1 }}>
                    Current Server: {currentServer.username}@{currentServer.ip}
                </Typography>
            </DialogTitle>

            <DialogContent sx={{ mt: 2 }}>
                {/* Info Alert */}
                <Alert severity="info" sx={{ mb: 2 }}>
                    <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                        SSH Key Authentication
                    </Typography>
                    <Typography variant="caption" component="div">
                        • <strong>Use current server's key:</strong> Connects using SSH agent forwarding (no extra setup needed)
                    </Typography>
                    <Typography variant="caption" component="div">
                        • <strong>Upload custom key:</strong> Upload a .pem or .key file for servers requiring different credentials
                    </Typography>
                </Alert>

                {/* Saved Servers List */}
                {servers.length > 0 && (
                    <Box sx={{ mb: 3 }}>
                        <Typography variant="subtitle2" sx={{ mb: 1, color: '#2196f3' }}>
                            Saved Servers
                        </Typography>
                        <List sx={{ background: '#252525', borderRadius: 1 }}>
                            {servers.map(server => (
                                <ListItem
                                    key={server.id}
                                    sx={{
                                        borderBottom: '1px solid #333',
                                        '&:last-child': { borderBottom: 'none' }
                                    }}
                                >
                                    <ListItemText
                                        primary={
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <Typography variant="body1">{server.name}</Typography>
                                                {server.connected && (
                                                    <Chip
                                                        label="Connected"
                                                        size="small"
                                                        sx={{
                                                            background: '#4caf50',
                                                            color: '#fff',
                                                            height: 20,
                                                            fontSize: '0.7rem'
                                                        }}
                                                    />
                                                )}
                                            </Box>
                                        }
                                        secondary={
                                            <Typography variant="caption" sx={{ color: '#888' }}>
                                                {server.username}@{server.host}
                                            </Typography>
                                        }
                                    />
                                    <ListItemSecondaryAction>
                                        <Tooltip title="Connect to this server">
                                            <IconButton
                                                edge="end"
                                                sx={{
                                                    color: '#2196f3',
                                                    mr: 1,
                                                    '&:hover': { background: 'rgba(33, 150, 243, 0.1)' }
                                                }}
                                                onClick={() => handleConnect(server)}
                                            >
                                                <LinkIcon />
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title="Remove server">
                                            <IconButton
                                                edge="end"
                                                sx={{
                                                    color: '#f44336',
                                                    '&:hover': { background: 'rgba(244, 67, 54, 0.1)' }
                                                }}
                                                onClick={() => handleRemoveServer(server.id)}
                                            >
                                                <DeleteIcon />
                                            </IconButton>
                                        </Tooltip>
                                    </ListItemSecondaryAction>
                                </ListItem>
                            ))}
                        </List>
                    </Box>
                )}

                <Divider sx={{ my: 2, background: '#333' }} />

                {/* Add New Server */}
                {!showAddForm ? (
                    <Button
                        variant="outlined"
                        startIcon={<AddIcon />}
                        onClick={() => setShowAddForm(true)}
                        fullWidth
                        sx={{
                            borderColor: '#2196f3',
                            color: '#2196f3',
                            '&:hover': {
                                borderColor: '#1976d2',
                                background: 'rgba(33, 150, 243, 0.1)'
                            }
                        }}
                    >
                        Add New Server
                    </Button>
                ) : (
                    <Box sx={{ background: '#252525', p: 2, borderRadius: 1 }}>
                        <Typography variant="subtitle2" sx={{ mb: 2, color: '#2196f3' }}>
                            Add New Server
                        </Typography>
                        <TextField
                            fullWidth
                            label="Server Name"
                            placeholder="e.g., Production DB Server"
                            value={newServer.name}
                            onChange={e => setNewServer({ ...newServer, name: e.target.value })}
                            sx={{ mb: 2 }}
                            InputProps={{
                                sx: { color: '#fff' }
                            }}
                            InputLabelProps={{
                                sx: { color: '#888' }
                            }}
                        />
                        <TextField
                            fullWidth
                            label="Host / IP Address"
                            placeholder="e.g., 192.168.1.100"
                            value={newServer.host}
                            onChange={e => setNewServer({ ...newServer, host: e.target.value })}
                            sx={{ mb: 2 }}
                            InputProps={{
                                sx: { color: '#fff' }
                            }}
                            InputLabelProps={{
                                sx: { color: '#888' }
                            }}
                        />
                        <TextField
                            fullWidth
                            label="Username"
                            placeholder="e.g., ubuntu"
                            value={newServer.username}
                            onChange={e => setNewServer({ ...newServer, username: e.target.value })}
                            sx={{ mb: 2 }}
                            InputProps={{
                                sx: { color: '#fff' }
                            }}
                            InputLabelProps={{
                                sx: { color: '#888' }
                            }}
                        />
                        {/* SSH Key Options */}
                        <FormControl component="fieldset" sx={{ mb: 2, width: '100%' }}>
                            <FormLabel component="legend" sx={{ color: '#2196f3', mb: 1 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <KeyIcon fontSize="small" />
                                    <Typography variant="subtitle2">SSH Authentication</Typography>
                                </Box>
                            </FormLabel>
                            <RadioGroup
                                value={keyOption}
                                onChange={(e) => {
                                    setKeyOption(e.target.value as 'current' | 'upload');
                                    setUploadError(null);
                                    if (e.target.value === 'current') {
                                        setKeyFile(null);
                                        setNewServer({ ...newServer, sshKey: '' });
                                    }
                                }}
                            >
                                <FormControlLabel
                                    value="current"
                                    control={<Radio sx={{ color: '#888', '&.Mui-checked': { color: '#2196f3' } }} />}
                                    label={
                                        <Typography variant="body2" sx={{ color: '#fff' }}>
                                            Use current server's SSH key
                                        </Typography>
                                    }
                                />
                                <FormControlLabel
                                    value="upload"
                                    control={<Radio sx={{ color: '#888', '&.Mui-checked': { color: '#2196f3' } }} />}
                                    label={
                                        <Typography variant="body2" sx={{ color: '#fff' }}>
                                            Upload a different SSH key
                                        </Typography>
                                    }
                                />
                            </RadioGroup>
                        </FormControl>

                        {/* SSH Key Upload */}
                        {keyOption === 'upload' && (
                            <Box sx={{ mb: 2 }}>
                                <input
                                    accept=".pem,.key,*"
                                    style={{ display: 'none' }}
                                    id="ssh-key-upload"
                                    type="file"
                                    onChange={handleKeyFileChange}
                                />
                                <label htmlFor="ssh-key-upload">
                                    <Button
                                        variant="outlined"
                                        component="span"
                                        startIcon={<UploadFileIcon />}
                                        fullWidth
                                        sx={{
                                            borderColor: keyFile ? '#4caf50' : '#666',
                                            color: keyFile ? '#4caf50' : '#888',
                                            '&:hover': {
                                                borderColor: keyFile ? '#388e3c' : '#888',
                                                background: keyFile ? 'rgba(76, 175, 80, 0.1)' : 'rgba(255, 255, 255, 0.05)'
                                            }
                                        }}
                                    >
                                        {keyFile ? `✓ ${keyFile.name}` : 'Upload SSH Private Key (.pem, .key)'}
                                    </Button>
                                </label>
                                <Typography variant="caption" sx={{ color: '#666', mt: 0.5, display: 'block' }}>
                                    Supported formats: .pem, .key files (max 10KB)
                                </Typography>
                            </Box>
                        )}

                        {/* Error Alert */}
                        {uploadError && (
                            <Alert severity="error" sx={{ mb: 2 }} onClose={() => setUploadError(null)}>
                                {uploadError}
                            </Alert>
                        )}

                        <Box sx={{ display: 'flex', gap: 1 }}>
                            <Button
                                variant="contained"
                                onClick={handleAddServer}
                                sx={{
                                    background: '#2196f3',
                                    '&:hover': { background: '#1976d2' }
                                }}
                            >
                                Add Server
                            </Button>
                            <Button
                                variant="outlined"
                                onClick={() => {
                                    setShowAddForm(false);
                                    setNewServer({ name: '', host: '', username: '', sshKey: '' });
                                    setKeyFile(null);
                                    setKeyOption('current');
                                    setUploadError(null);
                                }}
                                sx={{
                                    borderColor: '#666',
                                    color: '#888',
                                    '&:hover': { borderColor: '#888' }
                                }}
                            >
                                Cancel
                            </Button>
                        </Box>
                    </Box>
                )}
            </DialogContent>

            <DialogActions sx={{ borderTop: '1px solid #333', p: 2 }}>
                <Button
                    onClick={onClose}
                    sx={{
                        color: '#888',
                        '&:hover': { background: 'rgba(255, 255, 255, 0.05)' }
                    }}
                >
                    Close
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default ServerConnectionManager;
