"use client";

import { useState } from "react";
import { RiskLevel } from "@/lib/utils/riskScoring";
import { EnhancedMessage } from "@/lib/services/chatEnhancer";
import Image from "next/image";
import dynamic from "next/dynamic";

interface RiskMessageProps {
  message: EnhancedMessage;
}

const RiskMessage = ({ message }: RiskMessageProps) => {
  const [showDetails, setShowDetails] = useState(false);
  
  // Determine styling based on risk level
  const getBorderColor = () => {
    switch (message.riskMetadata.score) {
      case RiskLevel.HIGH:
        return "border-red-400 bg-red-50";
      case RiskLevel.MEDIUM:
        return "border-yellow-400 bg-white";
      case RiskLevel.LOW:
      default:
        return "border-gray-200 bg-white";
    }
  };
  
  const getDisclaimerStyle = () => {
    switch (message.riskMetadata.score) {
      case RiskLevel.HIGH:
        return "bg-red-50 text-red-800 border-red-200";
      case RiskLevel.MEDIUM:
        return "bg-yellow-50 text-yellow-800 border-yellow-200";
      case RiskLevel.LOW:
      default:
        return "bg-gray-50 text-gray-600 border-gray-200";
    }
  };
  
  // Format content with citations
  const content = message.content;
  const citations = message.documents.length > 0 ? (
    <div className="text-xs text-gray-500 mt-2 pt-2 border-t">
      {message.documents.map((doc, i) => (
        <div key={i} className="mt-1">
          Source: <span className="font-medium">{doc.title}</span> ({doc.category})
        </div>
      ))}
    </div>
  ) : null;
  
  // Disclaimer banner
  const disclaimer = message.disclaimer ? (
    <div className={`text-xs p-2 mt-2 rounded border ${getDisclaimerStyle()}`}>
      {message.disclaimer}
    </div>
  ) : null;
  
  // Escalation banner for high-risk messages
  const escalationBanner = message.needsEscalation ? (
    <div className="bg-red-50 text-red-800 border border-red-200 rounded p-2 mt-2 text-xs flex items-center">
      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
      This topic may require human assistance.
      <button className="ml-auto text-red-800 underline">
        Contact HR
      </button>
    </div>
  ) : null;
  
  // Risk details (for debugging/admin view)
  const riskDetails = showDetails ? (
    <div className="mt-2 p-2 bg-gray-100 text-xs rounded">
      <div><strong>Risk Score:</strong> {message.riskMetadata.score}</div>
      {message.riskMetadata.triggers.length > 0 && (
        <div>
          <strong>Triggers:</strong> {message.riskMetadata.triggers.join(", ")}
        </div>
      )}
    </div>
  ) : null;
  
  return (
    <div className={`rounded-xl px-5 py-3 text-left border ${getBorderColor()} text-gray-800 shadow-md leading-relaxed`}>
      <div className="flex items-center gap-2 mb-2">
        <Image 
          src="/PulseGuideBot.png" 
          alt="PulseGuide Bot" 
          width={24} 
          height={24} 
          className="rounded-full"
        />
        <span className="font-medium text-blue-900">PulseGuide</span>
        {/* Risk level indicator */}
        {message.riskMetadata.score > RiskLevel.LOW && (
          <div 
            className={`flex items-center ml-auto gap-1 ${
              message.riskMetadata.score === RiskLevel.HIGH ? 'text-red-600' : 'text-yellow-600'
            }`}
            onClick={() => setShowDetails(!showDetails)}
          >
            <div className={`w-2 h-2 rounded-full ${
              message.riskMetadata.score === RiskLevel.HIGH ? 'bg-red-500' : 'bg-yellow-500'
            }`} />
            <span className="text-xs font-medium">
              {message.riskMetadata.score === RiskLevel.HIGH ? 'High Risk' : 'Flagged'}
            </span>
          </div>
        )}
      </div>
      
      <div className="whitespace-pre-wrap">{content}</div>
      
      {citations}
      {disclaimer}
      {escalationBanner}
      {riskDetails}
    </div>
  );
};

// Export a client-only version of the component
export default dynamic(() => Promise.resolve(RiskMessage), {
  ssr: false
}); 