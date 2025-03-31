"use client";

import { useState } from "react";

interface DocumentLinkProps {
  title: string;
  url?: string;
}

export default function DocumentLink({ title, url }: DocumentLinkProps) {
  const [downloading, setDownloading] = useState(false);
  
  console.log('DocumentLink props:', { title, url });

  // Function to handle direct download
  const handleDownload = (e: React.MouseEvent) => {
    e.preventDefault();
    
    if (url) {
      setDownloading(true);
      window.open(url, '_blank');
      setDownloading(false);
    }
  };

  // If there's no URL, just show the title as text
  if (!url) {
    return <span className="text-gray-600">{title}</span>;
  }

  return (
    <div className="flex items-center">
      <a 
        href={url} 
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-600 hover:text-blue-800 hover:underline flex items-center font-medium"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1.5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
          <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
          <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
        </svg>
        {title} {url.endsWith('.pdf') && <span className="text-blue-500 font-semibold ml-1">(PDF)</span>}
      </a>
      {url.endsWith('.pdf') && (
        <button
          onClick={handleDownload}
          className="ml-2 px-2 py-0.5 text-xs text-white bg-blue-600 hover:bg-blue-700 rounded flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
          Download
        </button>
      )}
    </div>
  );
} 