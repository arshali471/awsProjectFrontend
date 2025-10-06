// import React, { useState } from 'react';
// import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Typography } from '@mui/material';
// import axios from 'axios';
// import { useNavigate } from 'react-router-dom';

// export default function ConnectModal({ instance, onClose }) {
//     const [username, setUsername] = useState('');
//     const [sshFile, setSshFile] = useState<File | null>(null);
//     const navigate = useNavigate();

//     const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//         const file = e.target.files?.[0];
//         if (file) setSshFile(file);
//     };

//     const handleConnect = async () => {
//         try {
//             const formData = new FormData();
//             formData.append('ip', instance.publicIp);
//             formData.append('username', username);
//             if (sshFile) formData.append('sshkey', sshFile);

//             const { data } = await axios.post(`${import.meta.env.VITE_REACT_APP_API_URL}/api/v1/aws/ssh`, formData);

//             // Open the terminal in a new tab
//             const terminalUrl = `${window.location.origin}/terminal`;
//             const newWindow = window.open(terminalUrl, '_blank');

//             // Repeatedly send credentials until new tab acknowledges receipt
//             let acknowledged = false;
//             let sendAttempts = 0;
//             function sendCredentials(event?: MessageEvent) {
//                 if (event && event.data === 'ack') {
//                     acknowledged = true;
//                     window.removeEventListener('message', sendCredentials);
//                     return;
//                 }
//                 if (newWindow && !acknowledged && sendAttempts < 20) {
//                     newWindow.postMessage(
//                         {
//                             ip: data.ip,
//                             username: data.username,
//                             sshKey: data.sshKey,
//                         },
//                         window.location.origin
//                     );
//                     sendAttempts++;
//                     setTimeout(sendCredentials, 150);
//                 }
//             }
//             // Listen for ack from the terminal tab
//             window.addEventListener('message', sendCredentials);
//             sendCredentials();
//         } catch (error) {
//             alert('SSH Connect Error');
//         }
//         onClose();
//     };



//     return (
//         <Dialog open onClose={onClose}>
//             <DialogTitle>Connect to Instance</DialogTitle>
//             <DialogContent>
//                 <Typography variant="subtitle2" color="textSecondary" gutterBottom>
//                     <div>Instance: <strong>{instance.instanceName || 'Unknown'}</strong></div>
//                     <div>IP Address: <strong>{instance.publicIp}</strong></div>
//                     <div>Instance ID: <strong>{instance.instanceId}</strong></div>
//                     <div>SSH Key: <strong>{instance.keyName}</strong></div>
//                 </Typography>
//                 <TextField
//                     label="Username"
//                     fullWidth
//                     margin="normal"
//                     value={username}
//                     onChange={e => setUsername(e.target.value)}
//                 />
//                 <Button variant="outlined" component="label">
//                     Upload SSH Key
//                     <input type="file" hidden onChange={handleFileChange} />
//                 </Button>
//             </DialogContent>
//             <DialogActions>
//                 <Button onClick={onClose}>Cancel</Button>
//                 <Button variant="contained" onClick={handleConnect} disabled={!username || !sshFile}>Connect</Button>
//             </DialogActions>
//         </Dialog>
//     );
// }




// import React, { useState } from 'react';
// import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Typography, Box } from '@mui/material';
// import axios from 'axios';
// import { useNavigate } from 'react-router-dom';

// export default function ConnectModal({ instance, onClose }) {
//     const [username, setUsername] = useState('');
//     const [sshFile, setSshFile] = useState<File | null>(null);
//     const navigate = useNavigate();

//     const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//         const file = e.target.files?.[0];
//         if (file) setSshFile(file);
//     };

//     const handleConnect = async () => {
//         try {
//             const formData = new FormData();
//             formData.append('ip', instance.publicIp);
//             formData.append('username', username);
//             if (sshFile) formData.append('sshkey', sshFile);

//             const { data } = await axios.post(`${import.meta.env.VITE_REACT_APP_API_URL}/api/v1/aws/ssh`, formData);

//             // Open the terminal in a new tab
//             const terminalUrl = `${window.location.origin}/terminal`;
//             const newWindow = window.open(terminalUrl, '_blank');

//             let acknowledged = false;
//             let sendAttempts = 0;
//             function sendCredentials(event?: MessageEvent) {
//                 if (event && event.data === 'ack') {
//                     acknowledged = true;
//                     window.removeEventListener('message', sendCredentials);
//                     return;
//                 }
//                 if (newWindow && !acknowledged && sendAttempts < 20) {
//                     newWindow.postMessage(
//                         {
//                             ip: data.ip,
//                             username: data.username,
//                             sshKey: data.sshKey,
//                         },
//                         window.location.origin
//                     );
//                     sendAttempts++;
//                     setTimeout(sendCredentials, 150);
//                 }
//             }
//             window.addEventListener('message', sendCredentials);
//             sendCredentials();
//         } catch (error) {
//             alert('SSH Connect Error');
//         }
//         onClose();
//     };

//     return (
//         <Dialog open onClose={onClose}
//             maxWidth="sm"  // options: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | false
//             fullWidth
//         >
//             <DialogTitle>Connect to Instance</DialogTitle>
//             <DialogContent>
//                 <Typography variant="subtitle2" color="textSecondary" gutterBottom>
//                     <div>Instance: <strong>{instance.instanceName || 'Unknown'}</strong></div>
//                     <div>IP Address: <strong>{instance.publicIp}</strong></div>
//                     <div>Instance ID: <strong>{instance.instanceId}</strong></div>
//                     <div>SSH Key: <strong>{instance.keyName}</strong></div>
//                 </Typography>
//                 <TextField
//                     label="Username"
//                     fullWidth
//                     margin="normal"
//                     value={username}
//                     onChange={e => setUsername(e.target.value)}
//                 />
//                 <Box mt={2}>
//                     <Button variant="outlined" component="label">
//                         Upload SSH Key
//                         <input type="file" hidden onChange={handleFileChange} />
//                     </Button>
//                     {/* Show filename if selected */}
//                     {sshFile && (
//                         <Typography
//                             variant="body2"
//                             sx={{ display: 'block', mt: 1, color: 'text.secondary' }}
//                         >
//                             Selected file: <strong>{sshFile.name}</strong>
//                         </Typography>
//                     )}
//                 </Box>
//             </DialogContent>
//             <DialogActions>
//                 <Button onClick={onClose}>Cancel</Button>
//                 <Button variant="contained" onClick={handleConnect} disabled={!username || !sshFile}>Connect</Button>
//             </DialogActions>
//         </Dialog>
//     );
// }



import React, { useState } from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions,
    Button, TextField, Typography, Box, Card, CardContent, Chip, Divider
} from '@mui/material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import TerminalIcon from '@mui/icons-material/Terminal';
import PersonIcon from '@mui/icons-material/Person';
import VpnKeyIcon from '@mui/icons-material/VpnKey';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import LinkIcon from '@mui/icons-material/Link';
import CloseIcon from '@mui/icons-material/Close';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

export default function ConnectModal({ instance, onClose }) {
    const [username, setUsername] = useState('');
    const [sshFile, setSshFile] = useState(null);
    const navigate = useNavigate();

    const handleFileChange = (e) => {
        const file = e.target.files && e.target.files[0];
        if (file) setSshFile(file);
    };

    const handleConnect = async () => {
        try {
            const formData = new FormData();
            formData.append('ip', instance.publicIp || instance.privateIp);
            formData.append('username', username);
            if (sshFile) formData.append('sshkey', sshFile);

            const { data } = await axios.post(
                `${import.meta.env.VITE_REACT_APP_API_URL}/api/v1/aws/ssh`,
                formData
            );

            const terminalUrl = `${window.location.origin}/terminal`;
            const newWindow = window.open(terminalUrl, '_blank');

            let acknowledged = false;
            let sendAttempts = 0;
            function sendCredentials(event?: MessageEvent) {
                if (event && event.data === 'ack') {
                    acknowledged = true;
                    window.removeEventListener('message', sendCredentials);
                    return;
                }
                if (newWindow && !acknowledged && sendAttempts < 20) {
                    newWindow.postMessage(
                        {
                            ip: data.ip,
                            username: data.username,
                            sshKey: data.sshKey,
                        },
                        window.location.origin
                    );
                    sendAttempts++;
                    setTimeout(sendCredentials, 150);
                }
            }
            window.addEventListener('message', sendCredentials);
            sendCredentials();
        } catch (error) {
            alert('SSH Connect Error');
        }
        onClose();
    };

    return (
        <Dialog
            open
            onClose={onClose}
            maxWidth="sm"
            fullWidth
            PaperProps={{
                sx: {
                    borderRadius: 3,
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
                }
            }}
        >
            <DialogTitle sx={{ pb: 2, pt: 3, px: 3 }}>
                <Box display="flex" alignItems="center" gap={2}>
                    <Box
                        sx={{
                            width: 48,
                            height: 48,
                            borderRadius: 2.5,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            background: 'linear-gradient(135deg, #28a745 0%, #20c997 100%)',
                            color: 'white',
                        }}
                    >
                        <TerminalIcon sx={{ fontSize: 28 }} />
                    </Box>
                    <Box>
                        <Typography variant="h6" fontWeight={700} color="text.primary">
                            SSH Connection
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                            Connect to your instance securely
                        </Typography>
                    </Box>
                </Box>
            </DialogTitle>

            <DialogContent sx={{ px: 3, pb: 2 }}>
                {/* Instance Info Card */}
                <Card
                    elevation={0}
                    sx={{
                        mb: 3,
                        border: '1px solid',
                        borderColor: 'divider',
                        borderRadius: 2,
                        background: 'linear-gradient(135deg, rgba(40, 167, 69, 0.05) 0%, rgba(32, 201, 151, 0.05) 100%)',
                    }}
                >
                    <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
                        <Box display="flex" flexDirection="column" gap={1.5}>
                            <Box display="flex" justifyContent="space-between" alignItems="center">
                                <Typography variant="caption" color="text.secondary" fontWeight={500}>
                                    Instance Name
                                </Typography>
                                <Typography variant="body2" fontWeight={600} color="text.primary">
                                    {instance.instanceName || 'Unknown'}
                                </Typography>
                            </Box>
                            <Divider />
                            <Box display="flex" justifyContent="space-between" alignItems="center">
                                <Typography variant="caption" color="text.secondary" fontWeight={500}>
                                    IP Address
                                </Typography>
                                <Chip
                                    label={instance.publicIp || instance.privateIp}
                                    size="small"
                                    sx={{
                                        fontWeight: 600,
                                        background: 'linear-gradient(135deg, #0073bb 0%, #005a94 100%)',
                                        color: 'white',
                                    }}
                                />
                            </Box>
                            <Divider />
                            <Box display="flex" justifyContent="space-between" alignItems="center">
                                <Typography variant="caption" color="text.secondary" fontWeight={500}>
                                    Instance ID
                                </Typography>
                                <Typography variant="body2" fontWeight={500} color="text.primary" sx={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>
                                    {instance.instanceId}
                                </Typography>
                            </Box>
                            <Divider />
                            <Box display="flex" justifyContent="space-between" alignItems="center">
                                <Typography variant="caption" color="text.secondary" fontWeight={500}>
                                    SSH Key Name
                                </Typography>
                                <Typography variant="body2" fontWeight={600} color="text.primary">
                                    {instance.keyName || 'N/A'}
                                </Typography>
                            </Box>
                        </Box>
                    </CardContent>
                </Card>

                {/* Username Input */}
                <Box mb={2.5}>
                    <Typography variant="subtitle2" fontWeight={600} color="text.primary" sx={{ mb: 1.5 }}>
                        <Box display="flex" alignItems="center" gap={1}>
                            <PersonIcon sx={{ fontSize: 18, color: 'primary.main' }} />
                            Username
                        </Box>
                    </Typography>
                    <TextField
                        placeholder="Enter username (e.g., ec2-user, ubuntu)"
                        fullWidth
                        value={username}
                        onChange={e => setUsername(e.target.value)}
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                borderRadius: 2,
                            }
                        }}
                    />
                </Box>

                {/* SSH Key Upload */}
                <Box>
                    <Typography variant="subtitle2" fontWeight={600} color="text.primary" sx={{ mb: 1.5 }}>
                        <Box display="flex" alignItems="center" gap={1}>
                            <VpnKeyIcon sx={{ fontSize: 18, color: 'primary.main' }} />
                            SSH Private Key
                        </Box>
                    </Typography>
                    <Button
                        variant="outlined"
                        component="label"
                        fullWidth
                        startIcon={<CloudUploadIcon />}
                        sx={{
                            borderRadius: 2,
                            textTransform: 'none',
                            fontWeight: 600,
                            py: 1.5,
                            borderStyle: 'dashed',
                            borderWidth: 2,
                            '&:hover': {
                                borderWidth: 2,
                                borderStyle: 'dashed',
                            }
                        }}
                    >
                        {sshFile ? 'Change SSH Key File' : 'Upload SSH Key (.pem, .key)'}
                        <input
                            type="file"
                            accept=".pem,.key"
                            style={{ display: 'none' }}
                            onChange={handleFileChange}
                        />
                    </Button>
                    {sshFile && (
                        <Box
                            sx={{
                                mt: 1.5,
                                p: 1.5,
                                borderRadius: 2,
                                background: 'linear-gradient(135deg, rgba(40, 167, 69, 0.1) 0%, rgba(32, 201, 151, 0.1) 100%)',
                                border: '1px solid',
                                borderColor: 'success.light',
                            }}
                        >
                            <Box display="flex" alignItems="center" gap={1}>
                                <CheckCircleIcon sx={{ fontSize: 20, color: 'success.main' }} />
                                <Typography
                                    variant="body2"
                                    sx={{
                                        color: 'success.dark',
                                        fontWeight: 600,
                                        wordBreak: 'break-all',
                                    }}
                                >
                                    {sshFile.name}
                                </Typography>
                            </Box>
                        </Box>
                    )}
                </Box>
            </DialogContent>

            <DialogActions sx={{ px: 3, pb: 3, pt: 1, gap: 1.5 }}>
                <Button
                    onClick={onClose}
                    variant="outlined"
                    startIcon={<CloseIcon />}
                    sx={{
                        borderRadius: 2,
                        textTransform: 'none',
                        fontWeight: 600,
                        px: 3,
                    }}
                >
                    Cancel
                </Button>
                <Button
                    variant="contained"
                    onClick={handleConnect}
                    disabled={!username || !sshFile}
                    startIcon={<LinkIcon />}
                    sx={{
                        borderRadius: 2,
                        textTransform: 'none',
                        fontWeight: 600,
                        px: 3,
                        background: 'linear-gradient(135deg, #28a745 0%, #20c997 100%)',
                        '&:hover': {
                            background: 'linear-gradient(135deg, #218838 0%, #1aa179 100%)',
                        },
                        '&:disabled': {
                            background: 'rgba(0, 0, 0, 0.12)',
                        }
                    }}
                >
                    Connect Now
                </Button>
            </DialogActions>
        </Dialog>
    );
}

