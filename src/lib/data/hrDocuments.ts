/**
 * Simple document storage for HR and benefits information
 * This simulates a RAG system without complex dependencies
 */

export interface HRDocument {
  id: string;
  title: string;
  content: string;
  category: string;
  url?: string;
}

// Sample HR documents for demonstration
export const HR_DOCUMENTS: HRDocument[] = [
  {
    id: "health-benefits-overview",
    title: "Health Benefits Overview",
    category: "Health Insurance",
    content: "PulseTel offers three health plans: High-Deductible Health Plan (HDHP), Preferred Provider Organization (PPO), and Health Maintenance Organization (HMO). Each plan has different premium costs, deductibles, and out-of-pocket maximums. The HDHP plan is eligible for a Health Savings Account (HSA).",
    url: "/Docs/Plan Docs/health-benefits-2024.md"
  },
  {
    id: "fmla-policy",
    title: "Family and Medical Leave Act (FMLA) Policy",
    category: "Leave",
    content: "Eligible employees may take up to 12 weeks of unpaid, job-protected leave under the FMLA. Eligibility requires 12 months of employment and 1,250 hours worked in the past 12 months. FMLA leave may be taken for birth/adoption of a child, serious health condition of employee or family member, or qualifying exigencies related to military service.",
    url: "/Docs/Plan Docs/family-medical-leave.md"
  },
  {
    id: "ada-accommodations",
    title: "Americans with Disabilities Act (ADA) Accommodations",
    category: "Compliance",
    content: "PulseTel provides reasonable accommodations to qualified individuals with disabilities. Accommodation requests should be directed to HR. Medical documentation may be required. Each request is evaluated on a case-by-case basis. Accommodations may include modified equipment, schedule adjustments, or other workplace changes.",
    url: "/Docs/Plan Docs/ada-accommodations.md"
  },
  {
    id: "401k-plan",
    title: "401(k) Retirement Plan",
    category: "Retirement",
    content: "PulseTel offers a 401(k) retirement plan with company matching. Employees are eligible after 90 days of employment. The company matches 100% of the first 3% contributed and 50% of the next 2%. Employees may contribute up to the IRS annual limit. Vesting of employer contributions occurs over a 4-year period."
  },
  {
    id: "cobra-coverage",
    title: "COBRA Continuation Coverage",
    category: "Health Insurance",
    content: "Under COBRA, employees who lose health coverage due to qualifying events may continue their coverage for a limited time. Qualifying events include termination (except for gross misconduct), reduction in hours, death, divorce, or loss of dependent status. COBRA coverage typically lasts 18 months but may extend to 36 months in certain circumstances. Participants pay the full premium plus a 2% administrative fee."
  }
];

/**
 * Simulate document retrieval based on query
 * In a real implementation, this would use embeddings and vector search
 */
export function retrieveRelevantDocuments(query: string): HRDocument[] {
  const normalizedQuery = query.toLowerCase();
  
  // Very simple keyword matching - would be replaced with vector similarity in production
  return HR_DOCUMENTS.filter(doc => {
    const content = doc.content.toLowerCase();
    const title = doc.title.toLowerCase();
    
    return content.includes(normalizedQuery) || 
           title.includes(normalizedQuery) ||
           doc.category.toLowerCase().includes(normalizedQuery);
  });
}

/**
 * Get citations from the document
 */
export function generateCitation(document: HRDocument): string {
  return `Source: ${document.title} (${document.category})${document.url ? ' - See full document' : ''}`;
}

/**
 * Format multiple document citations
 */
export function formatCitations(documents: HRDocument[]): string {
  if (documents.length === 0) return "";
  
  return documents
    .map(doc => generateCitation(doc))
    .join('\n');
} 