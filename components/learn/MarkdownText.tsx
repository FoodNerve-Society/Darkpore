import React from 'react';
import { Typography, type TypographyProps } from '@mui/material';

type MarkdownTextProps = Omit<TypographyProps, 'children'> & {
  children?: string;
};

const escapeHtml = (value: string) => value
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#039;');

const toSafeHtml = (value: string) => escapeHtml(value)
  .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
  .replace(/\*(.*?)\*/g, '<em>$1</em>')
  .replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2" target="_blank" rel="noreferrer noopener">$1</a>')
  .replace(/\n/g, '<br />');

export const MarkdownText: React.FC<MarkdownTextProps> = ({ children = '', sx, ...props }) => (
  <Typography
    {...props}
    sx={{
      ...sx,
      '& strong': { fontWeight: 800 },
      '& em': { fontStyle: 'italic' },
      '& a': { textDecoration: 'underline' },
    }}
    dangerouslySetInnerHTML={{ __html: toSafeHtml(children) }}
  />
);