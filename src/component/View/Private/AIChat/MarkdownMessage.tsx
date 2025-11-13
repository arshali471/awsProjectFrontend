import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Box } from '@mui/material';

interface MarkdownMessageProps {
    content: string;
    isUser: boolean;
}

const MarkdownMessage: React.FC<MarkdownMessageProps> = ({ content, isUser }) => {
    return (
        <Box
            sx={{
                '& h1, & h2, & h3, & h4, & h5, & h6': {
                    marginTop: '16px',
                    marginBottom: '8px',
                    fontWeight: 600,
                    lineHeight: 1.3,
                    color: isUser ? 'white' : '#232f3e',
                },
                '& h1': { fontSize: '1.8em' },
                '& h2': { fontSize: '1.5em' },
                '& h3': { fontSize: '1.3em' },
                '& h4': { fontSize: '1.1em' },
                '& p': {
                    marginBottom: '12px',
                    lineHeight: 1.6,
                    color: isUser ? 'white' : '#232f3e',
                },
                '& ul, & ol': {
                    marginLeft: '20px',
                    marginBottom: '12px',
                    paddingLeft: '8px',
                },
                '& li': {
                    marginBottom: '6px',
                    lineHeight: 1.6,
                },
                '& code': {
                    backgroundColor: isUser ? 'rgba(0, 0, 0, 0.2)' : 'rgba(0, 0, 0, 0.05)',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    fontSize: '0.9em',
                    fontFamily: 'monospace',
                    color: isUser ? 'white' : '#d63384',
                },
                '& pre': {
                    backgroundColor: isUser ? 'rgba(0, 0, 0, 0.2)' : '#f5f5f5',
                    padding: '12px',
                    borderRadius: '8px',
                    overflow: 'auto',
                    marginBottom: '12px',
                    border: isUser ? '1px solid rgba(255, 255, 255, 0.2)' : '1px solid #e0e0e0',
                },
                '& pre code': {
                    backgroundColor: 'transparent',
                    padding: 0,
                    color: isUser ? 'white' : '#232f3e',
                },
                '& blockquote': {
                    borderLeft: `4px solid ${isUser ? 'rgba(255, 255, 255, 0.5)' : '#667eea'}`,
                    paddingLeft: '16px',
                    marginLeft: 0,
                    marginBottom: '12px',
                    color: isUser ? 'rgba(255, 255, 255, 0.9)' : '#6c757d',
                    fontStyle: 'italic',
                },
                '& table': {
                    borderCollapse: 'collapse',
                    width: '100%',
                    marginBottom: '12px',
                    border: `1px solid ${isUser ? 'rgba(255, 255, 255, 0.2)' : '#e0e0e0'}`,
                },
                '& th, & td': {
                    border: `1px solid ${isUser ? 'rgba(255, 255, 255, 0.2)' : '#e0e0e0'}`,
                    padding: '8px 12px',
                    textAlign: 'left',
                },
                '& th': {
                    backgroundColor: isUser ? 'rgba(0, 0, 0, 0.2)' : '#f5f5f5',
                    fontWeight: 600,
                },
                '& a': {
                    color: isUser ? 'white' : '#667eea',
                    textDecoration: 'underline',
                    '&:hover': {
                        opacity: 0.8,
                    },
                },
                '& hr': {
                    border: 'none',
                    borderTop: `1px solid ${isUser ? 'rgba(255, 255, 255, 0.2)' : '#e0e0e0'}`,
                    marginTop: '16px',
                    marginBottom: '16px',
                },
                '& strong': {
                    fontWeight: 600,
                },
                '& em': {
                    fontStyle: 'italic',
                },
            }}
        >
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {content}
            </ReactMarkdown>
        </Box>
    );
};

export default MarkdownMessage;
