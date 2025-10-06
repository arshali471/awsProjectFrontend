import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    Typography,
    TextField,
    IconButton,
    Paper,
    Avatar,
    CircularProgress,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import PersonIcon from '@mui/icons-material/Person';

interface Message {
    id: number;
    text: string;
    sender: 'user' | 'ai';
    timestamp: Date;
}

export default function AIChat() {
    const navigate = useNavigate();
    const [messages, setMessages] = useState<Message[]>([
        {
            id: 1,
            text: "Hello! I'm your AI Cloud Assistant. How can I help you with your cloud infrastructure today?",
            sender: 'ai',
            timestamp: new Date(),
        }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMessage: Message = {
            id: messages.length + 1,
            text: input,
            sender: 'user',
            timestamp: new Date(),
        };

        setMessages([...messages, userMessage]);
        setInput('');
        setIsLoading(true);

        // Simulate AI response (replace with actual API call)
        setTimeout(() => {
            const aiMessage: Message = {
                id: messages.length + 2,
                text: "I understand you're asking about: '" + input + "'. This is a demo response. In production, this would connect to your AI service to provide cloud infrastructure insights, troubleshooting help, and recommendations.",
                sender: 'ai',
                timestamp: new Date(),
            };
            setMessages(prev => [...prev, aiMessage]);
            setIsLoading(false);
        }, 1000);
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
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                color: 'white',
                                '&:hover': {
                                    background: 'linear-gradient(135deg, #764ba2 0%, #5a3d8a 100%)',
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
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                borderRadius: '12px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'white',
                                boxShadow: '0 4px 16px rgba(102, 126, 234, 0.3)',
                            }}
                        >
                            <SmartToyIcon sx={{ fontSize: 28 }} />
                        </Box>
                        <Box>
                            <Typography
                                variant="h5"
                                sx={{
                                    fontWeight: 700,
                                    color: '#232f3e',
                                    letterSpacing: '-0.5px',
                                }}
                            >
                                AI Cloud Chat
                            </Typography>
                            <Typography variant="body2" sx={{ color: '#6c757d' }}>
                                Your intelligent cloud infrastructure assistant
                            </Typography>
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
                                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
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
                                    ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                                    : 'white',
                                color: message.sender === 'user' ? 'white' : '#232f3e',
                                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
                            }}
                        >
                            <Typography variant="body1" sx={{ lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                                {message.text}
                            </Typography>
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
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
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
                        placeholder="Ask about your cloud infrastructure..."
                        variant="outlined"
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                borderRadius: '12px',
                                background: '#f5f7fa',
                                '&:hover fieldset': {
                                    borderColor: '#667eea',
                                },
                                '&.Mui-focused fieldset': {
                                    borderColor: '#667eea',
                                    borderWidth: '2px',
                                },
                            },
                        }}
                    />
                    <IconButton
                        onClick={handleSend}
                        disabled={!input.trim() || isLoading}
                        sx={{
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            color: 'white',
                            width: 56,
                            height: 56,
                            '&:hover': {
                                background: 'linear-gradient(135deg, #764ba2 0%, #5a3d8a 100%)',
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
