import React, { useState } from 'react';
import { AdminService } from '../../../services/admin.service';
import toast from 'react-hot-toast';
import './TerminalFileUpload.css';

interface TerminalFileUploadProps {
    serverIp: string;
    username: string;
    sshKey: string;
    onClose?: () => void;
}

const TerminalFileUpload: React.FC<TerminalFileUploadProps> = ({
    serverIp,
    username,
    sshKey,
    onClose
}) => {
    const [files, setFiles] = useState<File[]>([]);
    const [remotePath, setRemotePath] = useState('/home/' + username + '/');
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [currentFileIndex, setCurrentFileIndex] = useState(0);
    const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const selectedFiles = Array.from(e.target.files);

            // Check individual file size (500MB limit per file)
            const oversizedFiles = selectedFiles.filter(f => f.size > 500 * 1024 * 1024);
            if (oversizedFiles.length > 0) {
                toast.error(`File size exceeds 500MB limit: ${oversizedFiles.map(f => f.name).join(', ')}`);
                return;
            }

            setFiles(selectedFiles);
            setUploadedFiles([]); // Reset uploaded files list
            setCurrentFileIndex(0); // Reset current index
        }
    };

    const refreshTokenIfNeeded = async () => {
        try {
            const token = sessionStorage.getItem('authKey');
            if (!token) return null;

            // Decode token to check expiry
            const tokenParts = token.split('.');
            if (tokenParts.length !== 3) return token;

            const payload = JSON.parse(atob(tokenParts[1]));
            const expiryTime = payload.exp * 1000; // Convert to milliseconds
            const currentTime = Date.now();
            const timeUntilExpiry = expiryTime - currentTime;

            // If token expires in less than 5 minutes, refresh it
            if (timeUntilExpiry < 5 * 60 * 1000) {
                console.log('[Upload] Token expiring soon, refreshing...');

                const response = await fetch(
                    `${import.meta.env.VITE_REACT_APP_API_URL}${import.meta.env.VITE_REACT_APP_API_VER}/user/refresh-token`,
                    {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        }
                    }
                );

                if (response.ok) {
                    const data = await response.json();
                    const newToken = data.token;
                    sessionStorage.setItem('authKey', newToken);
                    console.log('[Upload] Token refreshed successfully');
                    return newToken;
                }
            }

            return token;
        } catch (error) {
            console.error('[Upload] Error refreshing token:', error);
            return sessionStorage.getItem('authKey');
        }
    };

    const uploadSingleFile = (file: File, fileIndex: number, totalFiles: number): Promise<boolean> => {
        return new Promise(async (resolve, reject) => {
            try {
                if (!remotePath) {
                    toast.error('Please enter a remote path');
                    reject(false);
                    return;
                }

                // Refresh token if needed before starting upload
                const currentToken = await refreshTokenIfNeeded();
                if (!currentToken) {
                    toast.error('Authentication failed. Please login again.');
                    reject(false);
                    return;
                }

                console.log(`[Upload] Starting upload ${fileIndex + 1}/${totalFiles}: ${file.name}`);
                console.log('[Upload] Server IP:', serverIp);
                console.log('[Upload] Username:', username);
                console.log('[Upload] Remote path:', remotePath);
                console.log('[Upload] File:', file.name, file.size, 'bytes');
                console.log('[Upload] SSH Key length:', sshKey.length, 'chars');

                setProgress(0);

                const formData = new FormData();
                formData.append('file', file);
                formData.append('ip', serverIp);
                formData.append('username', username);
                formData.append('sshKey', sshKey);
                formData.append('remotePath', remotePath);

                const xhr = new XMLHttpRequest();

                // Track upload progress to backend (0-50%)
                xhr.upload.addEventListener('progress', (e) => {
                    if (e.lengthComputable) {
                        // Show upload to backend as 0-50% of total progress
                        const percentage = (e.loaded / e.total) * 50;
                        console.log(`[Upload] Progress to backend (${file.name}):`, percentage.toFixed(1) + '%');
                        setProgress(percentage);
                    }
                });

                // Handle completion
                xhr.addEventListener('load', () => {
                    console.log(`[Upload] XHR load event for ${file.name}, status:`, xhr.status);
                    console.log('[Upload] Response:', xhr.responseText);

                    if (xhr.status === 200) {
                        try {
                            const response = JSON.parse(xhr.responseText);
                            console.log('[Upload] Success response:', response);

                            if (response.success) {
                                // File reached backend, now show SCP transfer (50-100%)
                                setProgress(50);
                                console.log('[Upload] File reached backend, starting SCP transfer...');

                                // Simulate SCP transfer progress smoothly from 50% to 100%
                                let currentProgress = 50;
                                const progressInterval = setInterval(() => {
                                    currentProgress += 2;
                                    if (currentProgress >= 100) {
                                        currentProgress = 100;
                                        clearInterval(progressInterval);

                                        // Show success after reaching 100%
                                        setTimeout(() => {
                                            toast.success(`${file.name} uploaded successfully to ${response.data.remotePath}`);
                                            setProgress(0);

                                            // Add to uploaded files list
                                            setUploadedFiles(prev => [...prev, file.name]);

                                            resolve(true);
                                        }, 300);
                                    } else {
                                        setProgress(currentProgress);
                                    }
                                }, 100); // Update every 100ms for smooth animation
                            } else {
                                console.error('[Upload] Server returned success=false:', response);
                                toast.error(`Upload failed for ${file.name}: ${response.message || 'Unknown error'}`);
                                reject(false);
                            }
                        } catch (parseError) {
                            console.error('[Upload] Failed to parse response:', parseError);
                            toast.error(`Upload failed for ${file.name}: Invalid server response`);
                            reject(false);
                        }
                    } else {
                        console.error('[Upload] HTTP error status:', xhr.status);
                        try {
                            const error = JSON.parse(xhr.responseText);
                            console.error('[Upload] Error response:', error);
                            toast.error(`Upload failed for ${file.name}: ${error.message || error.error || error}`);
                        } catch (parseError) {
                            console.error('[Upload] Failed to parse error response');
                            toast.error(`Upload failed for ${file.name}: HTTP ${xhr.status}`);
                        }
                        reject(false);
                    }
                });

                // Handle errors
                xhr.addEventListener('error', () => {
                    console.error(`[Upload] XHR error event for ${file.name}`);
                    toast.error(`Upload failed for ${file.name}: Network error`);
                    setProgress(0);
                    reject(false);
                });

                const uploadUrl = `${import.meta.env.VITE_REACT_APP_API_URL}${import.meta.env.VITE_REACT_APP_API_VER}/terminal/upload`;
                console.log('[Upload] Uploading to:', uploadUrl);
                console.log('[Upload] Auth token present:', !!currentToken);

                xhr.open('POST', uploadUrl);
                xhr.setRequestHeader('Authorization', `Bearer ${currentToken}`);
                xhr.send(formData);
            } catch (error) {
                console.error(`[Upload] Exception during upload of ${file.name}:`, error);
                toast.error(`Upload failed for ${file.name}`);
                setProgress(0);
                reject(false);
            }
        });
    };

    const handleUpload = async () => {
        if (files.length === 0) {
            toast.error('Please select at least one file');
            return;
        }

        if (!remotePath) {
            toast.error('Please enter a remote path');
            return;
        }

        setUploading(true);
        setUploadedFiles([]);

        let successCount = 0;
        let failCount = 0;

        for (let i = 0; i < files.length; i++) {
            setCurrentFileIndex(i);

            try {
                const success = await uploadSingleFile(files[i], i, files.length);
                if (success) {
                    successCount++;
                } else {
                    failCount++;
                }
            } catch (error) {
                failCount++;
            }
        }

        // All uploads complete
        setUploading(false);
        setProgress(0);

        if (files.length > 1) {
            if (failCount === 0) {
                toast.success(`All ${successCount} files uploaded successfully!`);
            } else if (successCount > 0) {
                toast(`${successCount} files uploaded, ${failCount} failed`, { icon: '⚠️' });
            } else {
                toast.error(`All ${failCount} files failed to upload`);
            }
        }

        // Reset file input
        const fileInput = document.getElementById('file-input') as HTMLInputElement;
        if (fileInput) {
            fileInput.value = '';
        }

        setFiles([]);
        setCurrentFileIndex(0);
    };

    const formatFileSize = (bytes: number): string => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    };

    return (
        <div className="terminal-file-upload">
            <div className="upload-header">
                <h3>Upload File to Server</h3>
                {onClose && (
                    <button className="close-btn" onClick={onClose} disabled={uploading}>
                        ×
                    </button>
                )}
            </div>

            <div className="upload-body">
                <div className="server-info">
                    <div className="info-row">
                        <span className="info-label">Server:</span>
                        <span className="info-value">{serverIp}</span>
                    </div>
                    <div className="info-row">
                        <span className="info-label">User:</span>
                        <span className="info-value">{username}</span>
                    </div>
                </div>

                <div className="form-group">
                    <label htmlFor="file-input">Select Files:</label>
                    <input
                        id="file-input"
                        type="file"
                        multiple
                        onChange={handleFileChange}
                        disabled={uploading}
                        className="file-input"
                    />
                    {files.length > 0 && (
                        <div className="files-list">
                            <div className="files-list-header">
                                <strong>{files.length} file{files.length > 1 ? 's' : ''} selected</strong>
                            </div>
                            {files.map((file, index) => (
                                <div key={index} className={`file-info ${uploadedFiles.includes(file.name) ? 'uploaded' : ''} ${currentFileIndex === index && uploading ? 'uploading' : ''}`}>
                                    <span className="file-name">{file.name}</span>
                                    <span className="file-size">({formatFileSize(file.size)})</span>
                                    {uploadedFiles.includes(file.name) && <span className="file-status">✓</span>}
                                    {currentFileIndex === index && uploading && <span className="file-status">⏳</span>}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="form-group">
                    <label htmlFor="remote-path">Remote Path:</label>
                    <input
                        id="remote-path"
                        type="text"
                        value={remotePath}
                        onChange={(e) => setRemotePath(e.target.value)}
                        placeholder="/home/ubuntu/"
                        disabled={uploading}
                        className="text-input"
                    />
                    <small className="help-text">
                        Specify the full path including filename, or a directory path ending with /
                    </small>
                </div>

                <button
                    onClick={handleUpload}
                    disabled={files.length === 0 || uploading || !remotePath}
                    className="upload-button"
                >
                    {uploading
                        ? `Uploading ${currentFileIndex + 1}/${files.length}... ${progress.toFixed(0)}%`
                        : files.length > 1
                            ? `Upload ${files.length} Files to Server`
                            : 'Upload to Server'}
                </button>

                {uploading && (
                    <div className="progress-container">
                        <div className="progress-bar">
                            <div
                                className="progress-fill"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                        <span className="progress-text">{progress.toFixed(0)}%</span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TerminalFileUpload;
