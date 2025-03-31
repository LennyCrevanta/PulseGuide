"use client";

import { useState } from "react";
import { RiskLevel } from "@/lib/utils/riskScoring";
import { EnhancedMessage } from "@/lib/services/chatEnhancer";
import dynamic from "next/dynamic";
import DocumentLink from "./DocumentLink";

interface RiskBadgeProps {
  riskMetadata: EnhancedMessage['riskMetadata'];
  documents?: { title: string; url?: string; id: string }[];
  ragUsed?: boolean;
}

const RiskBadge = ({ riskMetadata, documents = [], ragUsed = false }: RiskBadgeProps) => {
  // Debug log to see what props are being received
  console.log('RiskBadge props:', { 
    hasDocuments: documents && documents.length > 0,
    documentCount: documents?.length || 0,
    documents: documents,
    ragUsed
  });
  
  return (
    <div className="flex flex-col mb-2 mt-2">
      <div className="flex items-center mb-2">
        <div className="flex items-center px-2 py-1 rounded-full gap-1 bg-gray-100 text-gray-700">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          <span className="text-xs font-medium">
            AI Generated Information
          </span>
        </div>
      </div>
      
      {/* Disclaimer message */}
      <div className="text-xs text-gray-500 mb-3">
        This information is provided by AI. For personalized advice, please contact HR directly.
      </div>
      
      {/* Source documents section - make it more prominent and always visible when available */}
      {documents && documents.length > 0 && (
        <div className="text-xs mt-2 py-2 px-3 bg-gray-50 border border-gray-200 rounded-md">
          <div className="font-medium text-gray-700 mb-2">Sources:</div>
          <ul className="space-y-2">
            {documents.map((doc, i) => {
              console.log('Document link (visible):', doc);
              return (
                <li key={i} className="flex items-center">
                  <span className="w-3 h-3 bg-blue-100 rounded-full mr-1.5 flex-shrink-0"></span>
                  <DocumentLink title={doc.title} url={doc.url} />
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
};

// Export a client-only version of the component
export default dynamic(() => Promise.resolve(RiskBadge), {
  ssr: false
}); 