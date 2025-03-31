/**
 * Service to enhance chat messages with risk scoring and RAG
 */

import { RiskLevel, RiskMetadata, getDisclaimerForRiskLevel, logRiskData, scoreRisk } from '../utils/riskScoring';
import { HRDocument, formatCitations, retrieveRelevantDocuments } from '../data/hrDocuments';

export interface EnhancedMessage {
  content: string;
  riskMetadata: RiskMetadata;
  documents: HRDocument[];
  disclaimer: string;
  needsEscalation: boolean;
  ragUsed?: boolean;
  sourceDocs?: {
    title: string;
    url?: string;
    id: string;
  }[];
}

/**
 * Processes an AI response to enhance it with risk scoring and document citations
 */
export function enhanceMessage(query: string, response: string): EnhancedMessage {
  // Score both the query and response for risk
  const queryRiskMetadata = scoreRisk(query);
  const responseRiskMetadata = scoreRisk(response);
  
  // Use the highest risk level between query and response
  const riskMetadata: RiskMetadata = {
    score: Math.max(queryRiskMetadata.score, responseRiskMetadata.score) as RiskLevel,
    triggers: Array.from(new Set([...queryRiskMetadata.triggers, ...responseRiskMetadata.triggers])),
    escalated: queryRiskMetadata.escalated || responseRiskMetadata.escalated,
    source: undefined
  };
  
  // Retrieve relevant documents
  const relevantDocs = retrieveRelevantDocuments(query);
  
  // Add document sources to metadata if available
  if (relevantDocs.length > 0) {
    riskMetadata.source = relevantDocs.map(doc => doc.id).join(', ');
  }
  
  // Get appropriate disclaimer
  const disclaimer = getDisclaimerForRiskLevel(riskMetadata.score);
  
  // Determine if this message needs human escalation
  const needsEscalation = riskMetadata.score === RiskLevel.HIGH;
  
  // Log this interaction for audit
  logRiskData(query, response, riskMetadata);
  
  return {
    content: response,
    riskMetadata,
    documents: relevantDocs,
    disclaimer,
    needsEscalation
  };
}

/**
 * Formats a message with citations and disclaimers
 */
export function formatEnhancedMessage(enhancedMsg: EnhancedMessage): string {
  const citations = formatCitations(enhancedMsg.documents);
  
  let formattedMessage = enhancedMsg.content;
  
  // Add citations if available
  if (citations) {
    formattedMessage += `\n\n${citations}`;
  }
  
  // Add disclaimer
  if (enhancedMsg.disclaimer) {
    formattedMessage += `\n\n${enhancedMsg.disclaimer}`;
  }
  
  return formattedMessage;
} 