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
    Button, TextField, Typography, Box
} from '@mui/material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

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
            formData.append('ip', instance.publicIp);
            formData.append('username', username);
            if (sshFile) formData.append('sshkey', sshFile);

            const { data } = await axios.post(
                `${import.meta.env.VITE_REACT_APP_API_URL}/api/v1/aws/ssh`,
                formData
            );

            // Open the terminal in a new tab
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
        <Dialog open onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>Connect to Instance</DialogTitle>
            <DialogContent>
                <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                    <div>Instance: <strong>{instance.instanceName || 'Unknown'}</strong></div>
                    <div>IP Address: <strong>{instance.publicIp}</strong></div>
                    <div>Instance ID: <strong>{instance.instanceId}</strong></div>
                    <div>SSH Key: <strong>{instance.keyName}</strong></div>
                </Typography>
                <TextField
                    label="Username"
                    fullWidth
                    margin="normal"
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                />

                {/* File upload */}
                <Box mt={2}>
                    <Button
                        variant="outlined"
                        component="label"
                        sx={{ textTransform: 'none' }}
                    >
                        Upload SSH Key
                        <input
                            type="file"
                            accept=".pem,.key"
                            style={{ display: 'none' }}
                            onChange={handleFileChange}
                        />
                    </Button>
                    {sshFile && (
                        <Typography
                            variant="body2"
                            sx={{
                                display: 'block',
                                mt: 1,
                                color: 'text.secondary',
                                wordBreak: 'break-all',
                            }}
                        >
                            Selected file: <strong>{sshFile.name}</strong>
                        </Typography>
                    )}
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancel</Button>
                <Button
                    variant="contained"
                    onClick={handleConnect}
                    disabled={!username || !sshFile}
                >
                    Connect
                </Button>
            </DialogActions>
        </Dialog>
    );
}

