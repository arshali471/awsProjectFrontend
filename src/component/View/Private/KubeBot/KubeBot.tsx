import React, { useState, useRef, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    Typography,
    TextField,
    IconButton,
    Paper,
    Avatar,
    CircularProgress,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import PersonIcon from '@mui/icons-material/Person';
import MarkdownMessage from '../AIChat/MarkdownMessage';
import { SelectedRegionContext } from '../../../context/context';
import { AdminService } from '../../../services/admin.service';
import { encryptAWSCredentials, decryptAWSCredentials, isCryptoAvailable } from '../../../../utils/crypto';

interface Message {
    id: number;
    text: string;
    sender: 'user' | 'ai';
    timestamp: Date;
    isStreaming?: boolean;
}

// Get KubeBot API URL and MCP server from environment variables
const KUBEBOT_API_URL = import.meta.env.VITE_KUBEBOT_API_URL || 'http://10.35.58.168:8001';
const KUBEBOT_MCP_SERVER = import.meta.env.VITE_KUBEBOT_MCP_SERVER || 'kubernetes-mcp-server';

export default function KubeBot() {
    const navigate = useNavigate();
    const { selectedRegion }: any = useContext(SelectedRegionContext);
    const [messages, setMessages] = useState<Message[]>([
        {
            id: 1,
            text: "Hello! I'm your Kubernetes assistant. How can I help you manage your Kubernetes clusters today?",
            sender: 'ai',
            timestamp: new Date(),
        }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [sessionId] = useState(() => `kube_user_${Date.now()}`);
    const [awsKeys, setAwsKeys] = useState<any[]>([]);
    const [selectedKey, setSelectedKey] = useState<string>('');
    const [selectedAwsRegion, setSelectedAwsRegion] = useState<string>('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Load AWS keys on component mount
    useEffect(() => {
        const loadAwsKeys = async () => {
            try {
                const res = await AdminService.getAllAwsKey();
                if (res.status === 200) {
                    setAwsKeys(res.data);
                }
            } catch (error) {
                console.error('Failed to load AWS keys:', error);
            }
        };
        loadAwsKeys();
    }, []);

    // Update selected key and region when selectedRegion context changes
    useEffect(() => {
        if (selectedRegion?.value) {
            setSelectedKey(selectedRegion.value);
            // Find the region from the awsKeys data
            const keyData = awsKeys.find(key => key._id === selectedRegion.value);
            if (keyData?.region) {
                setSelectedAwsRegion(keyData.region);
            }
        }
    }, [selectedRegion, awsKeys]);

    const handleSend = async () => {
        if (!input.trim()) return;

        // Check if region is selected
        if (!selectedKey || !selectedAwsRegion) {
            setMessages(prev => [...prev, {
                id: Date.now(),
                text: 'Please select a region before sending a message.',
                sender: 'ai',
                timestamp: new Date(),
            }]);
            return;
        }

        const userMessage: Message = {
            id: Date.now(),
            text: input,
            sender: 'user',
            timestamp: new Date(),
        };

        setMessages(prev => [...prev, userMessage]);
        const currentInput = input;
        setInput('');
        setIsLoading(true);

        // Create a placeholder AI message for streaming
        const aiMessageId = Date.now() + 1;
        const aiMessage: Message = {
            id: aiMessageId,
            text: '',
            sender: 'ai',
            timestamp: new Date(),
            isStreaming: true,
        };
        setMessages(prev => [...prev, aiMessage]);
        setIsLoading(false);

        try {
            // Check if crypto is available
            if (!isCryptoAvailable()) {
                throw new Error('Encryption not available in this browser. Please use a modern browser with HTTPS.');
            }

            // First, fetch AWS credentials from backend (now encrypted)
            const awsKeyResponse = await AdminService.getAwsKeyById(selectedKey);

            if (awsKeyResponse.status !== 200 || !awsKeyResponse.data) {
                throw new Error('Failed to fetch AWS credentials');
            }

            const awsConfig = awsKeyResponse.data;

            // Decrypt the encrypted credentials from backend
            let decryptedCredentials;
            if (awsConfig.encrypted_credentials) {
                // New encrypted format
                decryptedCredentials = await decryptAWSCredentials(awsConfig.encrypted_credentials);
            } else if (awsConfig.credentials) {
                // Legacy unencrypted format (fallback)
                console.warn('Received unencrypted credentials from backend - please update backend');
                decryptedCredentials = {
                    access_key_id: awsConfig.credentials.accessKeyId,
                    secret_access_key: awsConfig.credentials.secretAccessKey,
                    region: selectedAwsRegion
                };
            } else {
                throw new Error('No credentials found in response');
            }

            // Re-encrypt credentials for sending to MCP server
            const encryptedCredentials = await encryptAWSCredentials({
                access_key_id: decryptedCredentials.access_key_id,
                secret_access_key: decryptedCredentials.secret_access_key,
                region: selectedAwsRegion
            });

            // Now send the request to MCP server with ENCRYPTED AWS credentials
            const response = await fetch(`${KUBEBOT_API_URL}/query/stream`, {
                method: 'POST',
                mode: 'cors',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    query: currentInput,
                    session_id: sessionId,
                    server_name: KUBEBOT_MCP_SERVER, // MCP server from environment variable
                    encrypted_credentials: encryptedCredentials  // Send encrypted credentials
                }),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const reader = response.body?.getReader();
            const decoder = new TextDecoder();
            let accumulatedText = '';

            if (reader) {
                // Stream the response using SSE format
                while (true) {
                    const { done, value } = await reader.read();

                    if (done) break;

                    const chunk = decoder.decode(value, { stream: true });
                    const lines = chunk.split('\n');

                    for (const line of lines) {
                        if (line.trim() === '') continue;

                        // Parse SSE format (data: {...})
                        if (line.startsWith('data: ')) {
                            try {
                                const jsonData = line.slice(6); // Remove 'data: ' prefix
                                const data = JSON.parse(jsonData);

                                if (data.type === 'content') {
                                    // Append content as it arrives
                                    accumulatedText += data.content;

                                    // Update the message with accumulated text
                                    setMessages(prev =>
                                        prev.map(msg =>
                                            msg.id === aiMessageId
                                                ? { ...msg, text: accumulatedText, isStreaming: true }
                                                : msg
                                        )
                                    );
                                } else if (data.type === 'done') {
                                    console.log('Stream complete');
                                    // Mark streaming as complete
                                    setMessages(prev =>
                                        prev.map(msg =>
                                            msg.id === aiMessageId
                                                ? { ...msg, isStreaming: false }
                                                : msg
                                        )
                                    );
                                } else if (data.type === 'error') {
                                    console.error('Stream error:', data.error);
                                    throw new Error(data.error || 'Stream error occurred');
                                }
                            } catch (parseError) {
                                console.error('Error parsing SSE data:', parseError);
                            }
                        }
                    }
                }

                // Ensure streaming is marked as complete
                setMessages(prev =>
                    prev.map(msg =>
                        msg.id === aiMessageId
                            ? { ...msg, isStreaming: false }
                            : msg
                    )
                );
            } else {
                // Fallback to regular JSON response (non-streaming endpoint)
                const data = await response.json();
                setMessages(prev =>
                    prev.map(msg =>
                        msg.id === aiMessageId
                            ? { ...msg, text: data.response || data.text || 'No response', isStreaming: false }
                            : msg
                    )
                );
            }
        } catch (error) {
            console.error('Error fetching KubeBot response:', error);
            setMessages(prev =>
                prev.map(msg =>
                    msg.id === aiMessageId
                        ? {
                            ...msg,
                            text: 'Sorry, I encountered an error while processing your request. Please check if the Kubernetes assistant service is running and try again.',
                            isStreaming: false
                        }
                        : msg
                )
            );
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <Box
            sx={{
                height: '100vh',
                background: 'linear-gradient(135deg, #f5f7fa 0%, #e9ecef 100%)',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
            }}
        >
            {/* Header */}
            <Paper
                elevation={0}
                sx={{
                    borderBottom: '1px solid rgba(0, 0, 0, 0.06)',
                    background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
                    flexShrink: 0,
                }}
            >
                <Box sx={{ maxWidth: 1200, mx: 'auto', p: 2 }}>
                    <Box display="flex" alignItems="center" gap={2}>
                        <IconButton
                            onClick={() => navigate(-1)}
                            sx={{
                                background: 'linear-gradient(135deg, #326CE5 0%, #1A4D99 100%)',
                                color: 'white',
                                '&:hover': {
                                    background: 'linear-gradient(135deg, #1A4D99 0%, #0D3A73 100%)',
                                    transform: 'translateY(-2px)',
                                },
                                transition: 'all 0.3s ease',
                            }}
                        >
                            <ArrowBackIcon />
                        </IconButton>
                        <Box
                            sx={{
                                width: 48,
                                height: 48,
                                background: 'linear-gradient(135deg, #326CE5 0%, #1A4D99 100%)',
                                borderRadius: '12px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'white',
                                boxShadow: '0 4px 16px rgba(50, 108, 229, 0.3)',
                            }}
                        >
                            <SmartToyIcon sx={{ fontSize: 28 }} />
                        </Box>
                        <Box sx={{ flex: 1 }}>
                            <Typography
                                variant="h5"
                                sx={{
                                    fontWeight: 700,
                                    color: '#232f3e',
                                    letterSpacing: '-0.5px',
                                }}
                            >
                                KubeBot AI Chat
                            </Typography>
                            <Typography variant="body2" sx={{ color: '#6c757d' }}>
                                Your intelligent Kubernetes management assistant
                            </Typography>
                        </Box>
                        <Box sx={{ minWidth: 250 }}>
                            <FormControl fullWidth size="small">
                                <InputLabel>Select Region</InputLabel>
                                <Select
                                    value={selectedKey}
                                    onChange={(e) => {
                                        const keyId = e.target.value;
                                        setSelectedKey(keyId);
                                        const keyData = awsKeys.find(key => key._id === keyId);
                                        if (keyData?.region) {
                                            setSelectedAwsRegion(keyData.region);
                                        }
                                    }}
                                    label="Select Region"
                                    sx={{
                                        background: 'white',
                                        '& .MuiOutlinedInput-notchedOutline': {
                                            borderColor: '#326CE5',
                                        },
                                        '&:hover .MuiOutlinedInput-notchedOutline': {
                                            borderColor: '#1A4D99',
                                        },
                                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                            borderColor: '#326CE5',
                                        },
                                    }}
                                >
                                    {awsKeys.map((key) => (
                                        <MenuItem key={key._id} value={key._id}>
                                            {key.enviroment} ({key.region})
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Box>
                    </Box>
                </Box>
            </Paper>

            {/* Chat Messages */}
            <Box
                sx={{
                    flex: 1,
                    maxWidth: 1200,
                    width: '100%',
                    mx: 'auto',
                    p: 3,
                    overflowY: 'auto',
                    overflowX: 'hidden',
                    '&::-webkit-scrollbar': {
                        display: 'none',
                    },
                    msOverflowStyle: 'none',
                    scrollbarWidth: 'none',
                }}
            >
                {messages.map((message) => (
                    <Box
                        key={message.id}
                        sx={{
                            display: 'flex',
                            gap: 2,
                            mb: 3,
                            justifyContent: message.sender === 'user' ? 'flex-end' : 'flex-start',
                        }}
                    >
                        {message.sender === 'ai' && (
                            <Avatar
                                sx={{
                                    background: 'linear-gradient(135deg, #326CE5 0%, #1A4D99 100%)',
                                    width: 40,
                                    height: 40,
                                }}
                            >
                                <SmartToyIcon />
                            </Avatar>
                        )}
                        <Paper
                            elevation={0}
                            sx={{
                                maxWidth: '70%',
                                p: 2,
                                borderRadius: '16px',
                                background: message.sender === 'user'
                                    ? 'linear-gradient(135deg, #326CE5 0%, #1A4D99 100%)'
                                    : 'white',
                                color: message.sender === 'user' ? 'white' : '#232f3e',
                                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
                            }}
                        >
                            {message.text ? (
                                <MarkdownMessage
                                    content={message.text}
                                    isUser={message.sender === 'user'}
                                />
                            ) : (
                                <Typography variant="body1" sx={{ lineHeight: 1.6, color: 'inherit' }}>
                                    {message.isStreaming && <CircularProgress size={16} sx={{ mr: 1 }} />}
                                    Thinking...
                                </Typography>
                            )}
                            <Typography
                                variant="caption"
                                sx={{
                                    mt: 1,
                                    display: 'block',
                                    opacity: 0.7,
                                }}
                            >
                                {message.timestamp.toLocaleTimeString([], {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                })}
                            </Typography>
                        </Paper>
                        {message.sender === 'user' && (
                            <Avatar
                                sx={{
                                    background: 'linear-gradient(135deg, #0073bb 0%, #1a8cd8 100%)',
                                    width: 40,
                                    height: 40,
                                }}
                            >
                                <PersonIcon />
                            </Avatar>
                        )}
                    </Box>
                ))}
                {isLoading && (
                    <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                        <Avatar
                            sx={{
                                background: 'linear-gradient(135deg, #326CE5 0%, #1A4D99 100%)',
                                width: 40,
                                height: 40,
                            }}
                        >
                            <SmartToyIcon />
                        </Avatar>
                        <Paper
                            elevation={0}
                            sx={{
                                p: 2,
                                borderRadius: '16px',
                                background: 'white',
                                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
                            }}
                        >
                            <CircularProgress size={24} />
                        </Paper>
                    </Box>
                )}
                <div ref={messagesEndRef} />
            </Box>

            {/* Input Area */}
            <Paper
                elevation={0}
                sx={{
                    borderTop: '1px solid rgba(0, 0, 0, 0.06)',
                    background: 'white',
                    p: 2,
                    flexShrink: 0,
                }}
            >
                <Box sx={{ maxWidth: 1200, mx: 'auto', display: 'flex', gap: 2 }}>
                    <TextField
                        fullWidth
                        multiline
                        maxRows={4}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Ask about your Kubernetes clusters, pods, deployments..."
                        variant="outlined"
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                borderRadius: '12px',
                                background: '#f5f7fa',
                                '&:hover fieldset': {
                                    borderColor: '#326CE5',
                                },
                                '&.Mui-focused fieldset': {
                                    borderColor: '#326CE5',
                                    borderWidth: '2px',
                                },
                            },
                        }}
                    />
                    <IconButton
                        onClick={handleSend}
                        disabled={!input.trim() || isLoading}
                        sx={{
                            background: 'linear-gradient(135deg, #326CE5 0%, #1A4D99 100%)',
                            color: 'white',
                            width: 56,
                            height: 56,
                            '&:hover': {
                                background: 'linear-gradient(135deg, #1A4D99 0%, #0D3A73 100%)',
                            },
                            '&:disabled': {
                                background: '#e0e0e0',
                                color: '#9e9e9e',
                            },
                        }}
                    >
                        <SendIcon />
                    </IconButton>
                </Box>
            </Paper>
        </Box>
    );
}
