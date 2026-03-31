'use client';

import DOMPurify from 'dompurify';

interface PageContentDisplayProps {
  content: string;
  className?: string;
}

export default function PageContentDisplay({ content, className = '' }: PageContentDisplayProps) {
  if (!content) return null;

  const sanitized = typeof window !== 'undefined' ? DOMPurify.sanitize(content) : content;

  return (
    <div className={`page-content prose prose-lg max-w-none ${className}`}>
      <div dangerouslySetInnerHTML={{ __html: sanitized }} />
    </div>
  );
}
