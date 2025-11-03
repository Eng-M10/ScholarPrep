
import React, { useEffect, useState } from 'react';

interface MarkdownRendererProps {
  content: string;
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
  const [htmlContent, setHtmlContent] = useState('');

  useEffect(() => {
    if (content && (window as any).marked) {
      setHtmlContent((window as any).marked.parse(content));
    }
  }, [content]);

  return (
    <div
      className="prose prose-indigo max-w-none"
      dangerouslySetInnerHTML={{ __html: htmlContent }}
    />
  );
};

export default MarkdownRenderer;
