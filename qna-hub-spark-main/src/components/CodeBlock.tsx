import React from 'react';
import { PrismLight as SyntaxHighlighter } from 'react-syntax-highlighter';
import tsx from 'react-syntax-highlighter/dist/esm/languages/prism/tsx';
import javascript from 'react-syntax-highlighter/dist/esm/languages/prism/javascript';
import typescript from 'react-syntax-highlighter/dist/esm/languages/prism/typescript';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

SyntaxHighlighter.registerLanguage('tsx', tsx as any);
SyntaxHighlighter.registerLanguage('javascript', javascript as any);
SyntaxHighlighter.registerLanguage('typescript', typescript as any);

type Props = {
  content: string;
  language?: 'tsx' | 'javascript' | 'typescript';
};

// Parses text with markers: (  code here  )
// and renders code sections with syntax highlighting
export const CodeBlock: React.FC<Props> = ({ content, language = 'typescript' }) => {
  const parts = content.split(/\(\s{2}code here\s{2}\)/i);
  // If no markers, render as plain text
  if (parts.length === 1) {
    return <div style={{ whiteSpace: 'pre-wrap' }}>{content}</div>;
  }
  return (
    <div>
      {parts.map((part, idx) => {
        // Even indexes are text, odd indexes are code blocks (following the marker)
        if (idx % 2 === 0) {
          return (
            <p key={idx} style={{ whiteSpace: 'pre-wrap', margin: '0 0 8px 0' }}>
              {part}
            </p>
          );
        }
        return (
          <SyntaxHighlighter key={idx} language={language} style={vscDarkPlus} wrapLongLines>
            {part}
          </SyntaxHighlighter>
        );
      })}
    </div>
  );
};

export default CodeBlock;



