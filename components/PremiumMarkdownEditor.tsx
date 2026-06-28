'use client';

import React, { useRef } from 'react';
import { Box, IconButton, Tooltip, alpha } from '@mui/material';
import PremiumTextField from './PremiumTextField';
import DebouncedPremiumTextField from './DebouncedPremiumTextField';
import FormatBoldIcon from '@mui/icons-material/FormatBold';
import FormatItalicIcon from '@mui/icons-material/FormatItalic';
import FormatUnderlinedIcon from '@mui/icons-material/FormatUnderlined';
import InsertLinkIcon from '@mui/icons-material/InsertLink';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import FormatListNumberedIcon from '@mui/icons-material/FormatListNumbered';
import FormatQuoteIcon from '@mui/icons-material/FormatQuote';
import TitleIcon from '@mui/icons-material/Title';

export interface PremiumMarkdownEditorProps {
    colorTheme: string;
    value: string;
    onChange: (e: any) => void;
    label?: string;
    placeholder?: string;
    minRows?: number;
    rows?: number;
    fullWidth?: boolean;
    [key: string]: any;
}

export default function PremiumMarkdownEditor({
    colorTheme,
    value,
    onChange,
    label,
    placeholder,
    minRows = 3,
    rows,
    fullWidth = true,
    ...props
}: PremiumMarkdownEditorProps) {
    const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

    const applyFormat = (format: string) => {
        if (!inputRef.current) return;
        
        const start = inputRef.current.selectionStart || 0;
        const end = inputRef.current.selectionEnd || 0;
        const val = value || '';
        const selectedText = val.substring(start, end);
        let replacement = '';
        let newCursorPos = 0;

        switch (format) {
            case 'bold':
                replacement = `**${selectedText}**`;
                newCursorPos = end + 4;
                break;
            case 'italic':
                replacement = `*${selectedText}*`;
                newCursorPos = end + 2;
                break;
            case 'underline':
                replacement = `<u>${selectedText}</u>`;
                newCursorPos = end + 7;
                break;
            case 'link':
                replacement = `[${selectedText}](https://)`;
                newCursorPos = start + replacement.length - 1; // Put cursor at end of URL
                break;
            case 'h2':
                replacement = `\n## ${selectedText || 'Heading 2'}\n`;
                newCursorPos = start + replacement.length;
                break;
            case 'h3':
                replacement = `\n### ${selectedText || 'Heading 3'}\n`;
                newCursorPos = start + replacement.length;
                break;
            case 'ul':
                replacement = `\n- ${selectedText || 'List item'}\n`;
                newCursorPos = start + replacement.length;
                break;
            case 'ol':
                replacement = `\n1. ${selectedText || 'List item'}\n`;
                newCursorPos = start + replacement.length;
                break;
            case 'quote':
                replacement = `\n> ${selectedText || 'Quote'}\n`;
                newCursorPos = start + replacement.length;
                break;
        }

        const newValue = val.substring(0, start) + replacement + val.substring(end);
        
        if (onChange) {
            onChange({ target: { value: newValue } });
        }

        setTimeout(() => {
            if (inputRef.current) {
                inputRef.current.focus();
                inputRef.current.setSelectionRange(newCursorPos, newCursorPos);
            }
        }, 10);
    };

    return (
        <Box sx={{ 
            display: 'flex',
            flexDirection: 'column',
            width: fullWidth ? '100%' : 'auto',
        }}>
            {/* The Formatting Ribbon (Sitting on top of text field) */}
            <Box sx={{ display: 'flex', justifyContent: 'flex-start', width: '100%', pl: 2 }}>
                <Box sx={{ 
                    display: 'inline-flex', 
                    gap: 0.5, 
                    p: 0.5, 
                    bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(15, 23, 42, 0.65)' : 'rgba(255, 255, 255, 0.85)',
                    backdropFilter: 'blur(16px)',
                    WebkitBackdropFilter: 'blur(16px)',
                    borderRadius: '12px 12px 0 0', // Sharp bottom edges
                    border: `1px solid ${alpha(colorTheme || '#0f172a', 0.2)}`,
                    borderBottom: 'none', // Remove bottom border so it blends into text field
                    boxShadow: `0 -4px 12px ${alpha(colorTheme || '#0f172a', 0.04)}`, // Toned down shadow, projecting upwards slightly
                    flexWrap: 'nowrap',
                    position: 'relative',
                    top: '1px', // Pull it down 1px to perfectly overlap the text field border
                    zIndex: 2,
                }}>
                    <Tooltip title="Bold (Ctrl+B)">
                        <IconButton size="small" onMouseDown={(e) => { e.preventDefault(); applyFormat('bold'); }} sx={{ color: colorTheme, '&:hover': { bgcolor: alpha(colorTheme, 0.1) } }}>
                            <FormatBoldIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Italic (Ctrl+I)">
                        <IconButton size="small" onMouseDown={(e) => { e.preventDefault(); applyFormat('italic'); }} sx={{ color: colorTheme, '&:hover': { bgcolor: alpha(colorTheme, 0.1) } }}>
                            <FormatItalicIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Underline (Ctrl+U)">
                        <IconButton size="small" onMouseDown={(e) => { e.preventDefault(); applyFormat('underline'); }} sx={{ color: colorTheme, '&:hover': { bgcolor: alpha(colorTheme, 0.1) } }}>
                            <FormatUnderlinedIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                    <Box sx={{ width: '1px', height: 20, bgcolor: alpha(colorTheme || '#000', 0.1), mx: 0.5, my: 'auto' }} />
                    <Tooltip title="Heading 2">
                        <IconButton size="small" onMouseDown={(e) => { e.preventDefault(); applyFormat('h2'); }} sx={{ color: colorTheme, '&:hover': { bgcolor: alpha(colorTheme, 0.1) } }}>
                            <TitleIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Heading 3">
                        <IconButton size="small" onMouseDown={(e) => { e.preventDefault(); applyFormat('h3'); }} sx={{ color: colorTheme, '&:hover': { bgcolor: alpha(colorTheme, 0.1) }, transform: 'scale(0.85)' }}>
                            <TitleIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                    <Box sx={{ width: '1px', height: 20, bgcolor: alpha(colorTheme || '#000', 0.1), mx: 0.5, my: 'auto' }} />
                    <Tooltip title="Bullet List">
                        <IconButton size="small" onMouseDown={(e) => { e.preventDefault(); applyFormat('ul'); }} sx={{ color: colorTheme, '&:hover': { bgcolor: alpha(colorTheme, 0.1) } }}>
                            <FormatListBulletedIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Numbered List">
                        <IconButton size="small" onMouseDown={(e) => { e.preventDefault(); applyFormat('ol'); }} sx={{ color: colorTheme, '&:hover': { bgcolor: alpha(colorTheme, 0.1) } }}>
                            <FormatListNumberedIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                    <Box sx={{ width: '1px', height: 20, bgcolor: alpha(colorTheme || '#000', 0.1), mx: 0.5, my: 'auto' }} />
                    <Tooltip title="Blockquote">
                        <IconButton size="small" onMouseDown={(e) => { e.preventDefault(); applyFormat('quote'); }} sx={{ color: colorTheme, '&:hover': { bgcolor: alpha(colorTheme, 0.1) } }}>
                            <FormatQuoteIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Hyperlink">
                        <IconButton size="small" onMouseDown={(e) => { e.preventDefault(); applyFormat('link'); }} sx={{ color: colorTheme, '&:hover': { bgcolor: alpha(colorTheme, 0.1) } }}>
                            <InsertLinkIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                </Box>
            </Box>

            {/* The Editor Area */}
            <Box sx={{ 
                border: `1px solid ${alpha(colorTheme || '#0f172a', 0.2)}`,
                borderRadius: '16px',
                borderTopLeftRadius: '4px', // Connect smoothly with the ribbon
                overflow: 'hidden',
                bgcolor: alpha('#000', 0.02),
                transition: 'all 0.3s ease',
                position: 'relative',
                zIndex: 1,
                '&:focus-within': {
                    borderColor: colorTheme,
                    boxShadow: `0 0 0 3px ${alpha(colorTheme, 0.15)}`,
                    bgcolor: alpha(colorTheme, 0.02)
                }
            }}>
                <DebouncedPremiumTextField
                    {...props}
                    inputRef={inputRef}
                    fullWidth
                    multiline
                    minRows={rows ? undefined : minRows}
                    rows={rows}
                    colorTheme={colorTheme}
                    value={value}
                    onChange={onChange}
                    label={label}
                    placeholder={placeholder}
                    sx={{
                        '& .MuiFilledInput-root': {
                            bgcolor: 'transparent !important', 
                            boxShadow: 'none !important',
                            borderRadius: 0,
                            '&::before, &::after': { display: 'none' },
                        },
                        '& .MuiInputBase-inputMultiline': {
                            padding: '16px 8px',
                            lineHeight: 1.6
                        },
                        ...(props.sx || {})
                    }}
                />
            </Box>
        </Box>
    );
}
