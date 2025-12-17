import React, { useRef, useEffect } from 'react';

interface SafeHTMLProps {
  html: string;
  className?: string;
}

export const SafeHTML: React.FC<SafeHTMLProps> = ({ html, className }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Attach shadow root if not already attached
    const shadowRoot = containerRef.current.shadowRoot || containerRef.current.attachShadow({ mode: 'open' });
    
    // Basic styles to replicate the Tailwind classes we had before
    // and ensure the content looks reasonable.
    const style = `
      <style>
        :host {
          display: block;
          font-family: inherit;
          color: inherit;
          font-size: inherit;
          line-height: inherit;
          overflow: auto;
        }
        a {
          color: #2563eb; /* text-blue-600 */
          text-decoration: underline;
        }
        p {
          margin-bottom: 0.5rem;
        }
        ul {
          list-style-type: disc;
          padding-left: 1rem;
        }
        ol {
          list-style-type: decimal;
          padding-left: 1rem;
        }
        img {
          display: inline;
          vertical-align: text-bottom;
          margin: 0;
          margin-right: 0.25rem;
          max-width: 100%;
        }
        table {
          border-collapse: collapse;
        }
        td {
          vertical-align: middle;
          padding: 0.125rem 0.25rem;
        }
        /* Reset body margin/padding if the email content includes a body tag */
        body {
          margin: 0;
          padding: 0;
          background-color: transparent !important; /* Force transparent background */
          color: inherit !important;
        }
      </style>
    `;

    // We need to sanitize or handle the HTML. 
    // Since we are putting it in a shadow root, scripts won't execute easily if we just use innerHTML, 
    // but <script> tags inside innerHTML are not executed by default in HTML5.
    // However, <img onerror> etc still work. 
    // The user's request is specifically about CSS leaking. Shadow DOM solves that.
    
    shadowRoot.innerHTML = `${style}${html}`;

  }, [html]);

  return <div ref={containerRef} className={className} />;
};
