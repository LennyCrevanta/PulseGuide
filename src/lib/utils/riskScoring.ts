/**
 * Risk scoring utility for HR and benefits AI responses
 * Based on the AI Risk Scoring Framework
 */

export enum RiskLevel {
  LOW = 1,
  MEDIUM = 2,
  HIGH = 3
}

export interface RiskMetadata {
  score: RiskLevel;
  triggers: string[];
  source?: string;
  escalated: boolean;
}

// High-risk keywords and patterns
const HIGH_RISK_PATTERNS = [
  /FMLA/i,
  /disability/i,
  /ADA/i,
  /COBRA/i,
  /termination/i,
  /lawsuit/i,
  /legal\s+advice/i,
  /discrimination/i,
  /harass(ment|ing|ed)?/i,
  /uncomfortable/i,
  /hostile/i,
  /bully(ing)?/i,
  /threat(s|ening)?/i,
  /union/i,
  /grievance/i,
  /appeal/i,
  /accommodat(e|ion)/i
];

// Medium-risk keywords and patterns
const MEDIUM_RISK_PATTERNS = [
  /eligibility/i,
  /recommend/i,
  /compare/i,
  /claim/i,
  /denial/i,
  /coverage/i,
  /out.of.network/i,
  /dispute/i,
  /deadline/i,
  /deductible/i,
  /copay/i,
  /coinsurance/i,
  /premium/i,
  /prescription/i,
  /specialist/i,
  /referral/i,
  /doctor/i,
  /hospital/i,
  /emergency/i,
  /surgery/i,
  /preventive/i,
  /medical/i,
  /healthcare/i,
  /insurance/i,
  /plan/i,
  /hmo/i,
  /ppo/i,
  /hdhp/i
];

/**
 * Scores an AI response for risk based on content
 */
export function scoreRisk(responseText: string): RiskMetadata {
  const triggers: string[] = [];
  let highestScore: RiskLevel = RiskLevel.LOW;
  
  // Check both the response and any context for high-risk patterns
  for (const pattern of HIGH_RISK_PATTERNS) {
    const match = responseText.match(pattern);
    if (match && match[0]) {
      triggers.push(match[0]);
      highestScore = RiskLevel.HIGH;
    }
  }
  
  // If we found any high-risk triggers, return immediately
  if (highestScore >= RiskLevel.HIGH) {
    return {
      score: RiskLevel.HIGH,
      triggers,
      escalated: true
    };
  }
  
  // Check for medium-risk patterns
  for (const pattern of MEDIUM_RISK_PATTERNS) {
    const match = responseText.match(pattern);
    if (match && match[0]) {
      triggers.push(match[0]);
      highestScore = RiskLevel.MEDIUM;
    }
  }
  
  return {
    score: highestScore,
    triggers,
    escalated: highestScore >= RiskLevel.HIGH
  };
}

/**
 * Returns appropriate disclaimer based on risk level
 */
export function getDisclaimerForRiskLevel(riskLevel: RiskLevel): string {
  switch (riskLevel) {
    case RiskLevel.HIGH:
      return "This is general information only, not legal or benefits advice. For personalized guidance on this sensitive topic, please contact HR directly.";
    case RiskLevel.MEDIUM:
      return "This is general information, not personalized advice. For specific questions about your situation, please contact HR.";
    case RiskLevel.LOW:
      return "For more information, please refer to your benefits documentation or contact HR.";
    default:
      return "";
  }
}

/**
 * Logs risk information for auditing
 */
export function logRiskData(
  query: string, 
  response: string, 
  metadata: RiskMetadata
): void {
  const logEntry = {
    timestamp: new Date().toISOString(),
    query,
    response: response.substring(0, 100) + (response.length > 100 ? '...' : ''),
    riskScore: metadata.score,
    triggers: metadata.triggers,
    source: metadata.source,
    escalated: metadata.escalated
  };
  
  // Get existing logs or initialize empty array
  const existingLogs = localStorage.getItem('hrChatRiskLogs');
  const logs = existingLogs ? JSON.parse(existingLogs) : [];
  
  // Add new log and save
  logs.push(logEntry);
  localStorage.setItem('hrChatRiskLogs', JSON.stringify(logs));
} 