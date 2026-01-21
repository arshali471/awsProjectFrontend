import React, { useState, useEffect } from 'react';
import { Box, Paper, List, ListItem, ListItemText, Typography, Chip } from '@mui/material';

type CommandSuggestion = {
    command: string;
    description: string;
    category: string;
};

type Props = {
    input: string;
    onSelect: (command: string) => void;
    visible: boolean;
    position: { x: number; y: number };
    commandHistory?: string[];
};

// Common Linux/Unix commands with descriptions
const COMMAND_DATABASE: CommandSuggestion[] = [
    // File Operations
    { command: 'ls', description: 'List directory contents', category: 'File Operations' },
    { command: 'ls -la', description: 'List all files with details', category: 'File Operations' },
    { command: 'cd', description: 'Change directory', category: 'File Operations' },
    { command: 'pwd', description: 'Print working directory', category: 'File Operations' },
    { command: 'mkdir', description: 'Create directory', category: 'File Operations' },
    { command: 'rmdir', description: 'Remove empty directory', category: 'File Operations' },
    { command: 'rm', description: 'Remove files', category: 'File Operations' },
    { command: 'rm -rf', description: 'Remove directory recursively', category: 'File Operations' },
    { command: 'cp', description: 'Copy files/directories', category: 'File Operations' },
    { command: 'mv', description: 'Move/rename files', category: 'File Operations' },
    { command: 'touch', description: 'Create empty file', category: 'File Operations' },
    { command: 'cat', description: 'Display file contents', category: 'File Operations' },
    { command: 'less', description: 'View file with pagination', category: 'File Operations' },
    { command: 'head', description: 'Display first lines of file', category: 'File Operations' },
    { command: 'tail', description: 'Display last lines of file', category: 'File Operations' },
    { command: 'tail -f', description: 'Follow file changes in real-time', category: 'File Operations' },
    { command: 'find', description: 'Search for files', category: 'File Operations' },
    { command: 'locate', description: 'Find files by name', category: 'File Operations' },

    // Text Processing
    { command: 'grep', description: 'Search text patterns', category: 'Text Processing' },
    { command: 'grep -r', description: 'Search recursively in directories', category: 'Text Processing' },
    { command: 'sed', description: 'Stream editor for text', category: 'Text Processing' },
    { command: 'awk', description: 'Pattern scanning and processing', category: 'Text Processing' },
    { command: 'sort', description: 'Sort lines of text', category: 'Text Processing' },
    { command: 'uniq', description: 'Remove duplicate lines', category: 'Text Processing' },
    { command: 'wc', description: 'Count words, lines, characters', category: 'Text Processing' },
    { command: 'cut', description: 'Extract columns from text', category: 'Text Processing' },
    { command: 'tr', description: 'Translate/delete characters', category: 'Text Processing' },

    // System Information
    { command: 'top', description: 'Display system processes', category: 'System' },
    { command: 'htop', description: 'Interactive process viewer', category: 'System' },
    { command: 'ps', description: 'List running processes', category: 'System' },
    { command: 'ps aux', description: 'List all processes', category: 'System' },
    { command: 'df', description: 'Disk space usage', category: 'System' },
    { command: 'df -h', description: 'Disk space in human-readable format', category: 'System' },
    { command: 'du', description: 'Directory space usage', category: 'System' },
    { command: 'du -sh', description: 'Directory size summary', category: 'System' },
    { command: 'free', description: 'Memory usage', category: 'System' },
    { command: 'free -h', description: 'Memory usage in human-readable format', category: 'System' },
    { command: 'uptime', description: 'System uptime', category: 'System' },
    { command: 'uname -a', description: 'System information', category: 'System' },
    { command: 'hostname', description: 'Display hostname', category: 'System' },
    { command: 'whoami', description: 'Current user', category: 'System' },
    { command: 'who', description: 'Show logged in users', category: 'System' },

    // Networking
    { command: 'ping', description: 'Test network connectivity', category: 'Network' },
    { command: 'curl', description: 'Transfer data from URL', category: 'Network' },
    { command: 'wget', description: 'Download files from web', category: 'Network' },
    { command: 'ssh', description: 'Secure shell connection', category: 'Network' },
    { command: 'scp', description: 'Secure copy files', category: 'Network' },
    { command: 'netstat', description: 'Network statistics', category: 'Network' },
    { command: 'ifconfig', description: 'Network interface configuration', category: 'Network' },
    { command: 'ip addr', description: 'Show IP addresses', category: 'Network' },
    { command: 'traceroute', description: 'Trace network path', category: 'Network' },
    { command: 'nslookup', description: 'Query DNS', category: 'Network' },
    { command: 'dig', description: 'DNS lookup utility', category: 'Network' },

    // Package Management
    { command: 'apt update', description: 'Update package list (Ubuntu/Debian)', category: 'Package' },
    { command: 'apt upgrade', description: 'Upgrade packages (Ubuntu/Debian)', category: 'Package' },
    { command: 'apt install', description: 'Install package (Ubuntu/Debian)', category: 'Package' },
    { command: 'yum update', description: 'Update packages (CentOS/RHEL)', category: 'Package' },
    { command: 'yum install', description: 'Install package (CentOS/RHEL)', category: 'Package' },
    { command: 'npm install', description: 'Install Node.js package', category: 'Package' },
    { command: 'pip install', description: 'Install Python package', category: 'Package' },

    // Docker
    { command: 'docker ps', description: 'List running containers', category: 'Docker' },
    { command: 'docker ps -a', description: 'List all containers', category: 'Docker' },
    { command: 'docker images', description: 'List Docker images', category: 'Docker' },
    { command: 'docker run', description: 'Run a container', category: 'Docker' },
    { command: 'docker exec', description: 'Execute command in container', category: 'Docker' },
    { command: 'docker logs', description: 'View container logs', category: 'Docker' },
    { command: 'docker stop', description: 'Stop container', category: 'Docker' },
    { command: 'docker rm', description: 'Remove container', category: 'Docker' },
    { command: 'docker-compose up', description: 'Start services', category: 'Docker' },
    { command: 'docker-compose down', description: 'Stop services', category: 'Docker' },

    // Kubernetes
    { command: 'kubectl get pods', description: 'List pods', category: 'Kubernetes' },
    { command: 'kubectl get services', description: 'List services', category: 'Kubernetes' },
    { command: 'kubectl get deployments', description: 'List deployments', category: 'Kubernetes' },
    { command: 'kubectl describe', description: 'Show resource details', category: 'Kubernetes' },
    { command: 'kubectl logs', description: 'View pod logs', category: 'Kubernetes' },
    { command: 'kubectl exec', description: 'Execute command in pod', category: 'Kubernetes' },
    { command: 'kubectl apply -f', description: 'Apply configuration', category: 'Kubernetes' },
    { command: 'kubectl delete', description: 'Delete resources', category: 'Kubernetes' },

    // Git
    { command: 'git status', description: 'Show repository status', category: 'Git' },
    { command: 'git add', description: 'Add files to staging', category: 'Git' },
    { command: 'git commit', description: 'Commit changes', category: 'Git' },
    { command: 'git commit -m', description: 'Commit with message', category: 'Git' },
    { command: 'git push', description: 'Push to remote', category: 'Git' },
    { command: 'git pull', description: 'Pull from remote', category: 'Git' },
    { command: 'git clone', description: 'Clone repository', category: 'Git' },
    { command: 'git branch', description: 'List branches', category: 'Git' },
    { command: 'git checkout', description: 'Switch branch', category: 'Git' },
    { command: 'git log', description: 'Show commit history', category: 'Git' },
    { command: 'git diff', description: 'Show changes', category: 'Git' },

    // File Permissions
    { command: 'chmod', description: 'Change file permissions', category: 'Permissions' },
    { command: 'chmod +x', description: 'Make file executable', category: 'Permissions' },
    { command: 'chown', description: 'Change file owner', category: 'Permissions' },
    { command: 'chgrp', description: 'Change file group', category: 'Permissions' },

    // Process Management
    { command: 'kill', description: 'Terminate process', category: 'Process' },
    { command: 'killall', description: 'Kill processes by name', category: 'Process' },
    { command: 'pkill', description: 'Kill processes by pattern', category: 'Process' },
    { command: 'bg', description: 'Resume job in background', category: 'Process' },
    { command: 'fg', description: 'Bring job to foreground', category: 'Process' },
    { command: 'jobs', description: 'List background jobs', category: 'Process' },

    // Compression
    { command: 'tar -czf', description: 'Create gzip archive', category: 'Compression' },
    { command: 'tar -xzf', description: 'Extract gzip archive', category: 'Compression' },
    { command: 'zip', description: 'Create zip archive', category: 'Compression' },
    { command: 'unzip', description: 'Extract zip archive', category: 'Compression' },
    { command: 'gzip', description: 'Compress file', category: 'Compression' },
    { command: 'gunzip', description: 'Decompress file', category: 'Compression' },

    // Misc
    { command: 'history', description: 'Show command history', category: 'Misc' },
    { command: 'clear', description: 'Clear terminal screen', category: 'Misc' },
    { command: 'echo', description: 'Display text', category: 'Misc' },
    { command: 'date', description: 'Display current date/time', category: 'Misc' },
    { command: 'cal', description: 'Display calendar', category: 'Misc' },
    { command: 'man', description: 'Display manual pages', category: 'Misc' },
    { command: 'which', description: 'Locate command', category: 'Misc' },
    { command: 'alias', description: 'Create command alias', category: 'Misc' },
    { command: 'export', description: 'Set environment variable', category: 'Misc' },
    { command: 'source', description: 'Execute script in current shell', category: 'Misc' },
    { command: 'sudo', description: 'Execute as superuser', category: 'Misc' },
    { command: 'su', description: 'Switch user', category: 'Misc' },
];

const CommandAutoComplete: React.FC<Props> = ({ input, onSelect, visible, position, commandHistory }) => {
    const [suggestions, setSuggestions] = useState<CommandSuggestion[]>([]);
    const [selectedIndex, setSelectedIndex] = useState(0);

    useEffect(() => {
        if (!input || input.trim() === '') {
            setSuggestions([]);
            return;
        }

        const trimmedInput = input.trim().toLowerCase();

        // Filter history commands
        const historySuggestions = (commandHistory || [])
            .filter(cmd => cmd.toLowerCase().startsWith(trimmedInput))
            .map(cmd => ({
                command: cmd,
                description: 'Recently used command',
                category: 'History'
            }))
            .slice(0, 5); // Top 5 history matches

        // Filter database commands
        const databaseSuggestions = COMMAND_DATABASE
            .filter(cmd => cmd.command.toLowerCase().startsWith(trimmedInput))
            .slice(0, 5); // Top 5 database matches

        // Merge with history first
        const merged = [...historySuggestions, ...databaseSuggestions].slice(0, 10);

        setSuggestions(merged);
        setSelectedIndex(0);
    }, [input, visible, commandHistory]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!visible || suggestions.length === 0) return;

            if (e.key === 'ArrowDown') {
                e.preventDefault();
                setSelectedIndex(prev => (prev + 1) % suggestions.length);
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                setSelectedIndex(prev => (prev - 1 + suggestions.length) % suggestions.length);
            } else if (e.key === 'Tab' && suggestions.length > 0) {
                e.preventDefault();
                onSelect(suggestions[selectedIndex].command);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [visible, suggestions, selectedIndex, onSelect]);

    if (!visible || suggestions.length === 0) {
        return null;
    }

    return (
        <Paper
            sx={{
                position: 'fixed',
                left: Math.max(10, position.x),
                top: Math.max(10, position.y - (suggestions.length * 56) - 10), // Position above cursor
                maxWidth: 500,
                maxHeight: 400,
                overflow: 'auto',
                background: '#1e1e1e',
                border: '1px solid #2196f3',
                borderRadius: 1,
                zIndex: 10000,
                boxShadow: '0 4px 20px rgba(33, 150, 243, 0.3)',
            }}
        >
            <Box sx={{ p: 1, borderBottom: '1px solid #333', background: '#2a2a2a' }}>
                <Typography variant="caption" sx={{ color: '#2196f3', fontWeight: 600 }}>
                    Command Suggestions (Tab to complete, ↑↓ to navigate)
                </Typography>
            </Box>
            <List sx={{ p: 0 }}>
                {suggestions.map((suggestion, index) => (
                    <ListItem
                        key={index}
                        onClick={() => onSelect(suggestion.command)}
                        sx={{
                            cursor: 'pointer',
                            background: index === selectedIndex ? 'rgba(33, 150, 243, 0.2)' : 'transparent',
                            borderLeft: index === selectedIndex ? '3px solid #2196f3' : '3px solid transparent',
                            '&:hover': {
                                background: 'rgba(33, 150, 243, 0.15)',
                            },
                            py: 1,
                            px: 2,
                        }}
                    >
                        <ListItemText
                            primary={
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Typography
                                        variant="body2"
                                        sx={{
                                            fontFamily: 'monospace',
                                            color: '#4fc3f7',
                                            fontWeight: 600,
                                        }}
                                    >
                                        {suggestion.command}
                                    </Typography>
                                    <Chip
                                        label={suggestion.category}
                                        size="small"
                                        sx={{
                                            height: 18,
                                            fontSize: '0.65rem',
                                            background: 'rgba(33, 150, 243, 0.2)',
                                            color: '#90caf9',
                                        }}
                                    />
                                </Box>
                            }
                            secondary={
                                <Typography variant="caption" sx={{ color: '#888' }}>
                                    {suggestion.description}
                                </Typography>
                            }
                        />
                    </ListItem>
                ))}
            </List>
        </Paper>
    );
};

export default CommandAutoComplete;
