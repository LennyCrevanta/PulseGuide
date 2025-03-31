import { BenefitDocument, HealthPlan, BenefitCategory } from './benefitsData';

// Store the actual PDF text content from the source documents
interface PdfContent {
  HDHP: string;
  PPO: string;
  HMO: string;
}

// Actual PDF content from the documents uploaded by the user
const actualPdfContent: PdfContent = {
  HDHP: `# High Deductible Health Plan (HDHP) Details

## Plan Overview
The High Deductible Health Plan (HDHP) offers comprehensive coverage after meeting the annual deductible. This plan qualifies for a Health Savings Account (HSA), allowing you to save pre-tax dollars for medical expenses.

## Key Features
- **Annual Deductible**: $1,500 (individual), $3,000 (family)
- **Out-of-Pocket Maximum**: $3,500 (individual), $7,000 (family)
- **Coinsurance**: 10% after deductible
- **Preventive Care**: 100% covered, no deductible
- **HSA Contribution**: Company contributes $500 (individual) or $1,000 (family) annually

## Coverage Details

### Physician Services
- Primary Care Visits: 10% after deductible
- Specialist Visits: 10% after deductible
- Preventive Care: Covered 100%, no deductible
- Diagnostic Lab/X-ray: 10% after deductible

### Hospital Services
- Inpatient: 10% after deductible
- Outpatient: 10% after deductible
- Emergency Room: 10% after deductible

### Prescription Drugs
- Generic: $10 (after deductible)
- Preferred Brand: $35 (after deductible)
- Non-Preferred Brand: $60 (after deductible)
- Specialty: 20% up to $200 (after deductible)

## HSA Information
- 2024 Maximum Contribution: $4,150 (individual), $8,300 (family)
- Catch-up Contribution (age 55+): Additional $1,000
- Funds roll over year to year
- Triple tax advantage: contributions, growth, and qualified withdrawals are tax-free`,

  PPO: `# Preferred Provider Organization (PPO) Plan Details

## Plan Overview
The PPO plan offers flexibility to see both in-network and out-of-network providers, with better coverage when using in-network services. No referrals are required to see specialists.

## Key Features
- **Annual Deductible**: $500 (individual), $1,000 (family)
- **Out-of-Pocket Maximum**: $3,000 (individual), $6,000 (family)
- **Copays**: $25 (primary care), $50 (specialist)
- **Coinsurance**: 20% after deductible
- **Preventive Care**: 100% covered, no deductible

## Coverage Details

### In-Network Services

#### Physician Services
- Primary Care Visits: $25 copay
- Specialist Visits: $50 copay
- Preventive Care: Covered 100%, no deductible
- Diagnostic Lab/X-ray: 20% after deductible

#### Hospital Services
- Inpatient: 20% after deductible
- Outpatient: 20% after deductible
- Emergency Room: $200 copay (waived if admitted)

#### Prescription Drugs
- Generic: $10
- Preferred Brand: $35
- Non-Preferred Brand: $60
- Specialty: 20% up to $200

### Out-of-Network Services

#### Physician Services
- Primary Care Visits: 40% after deductible
- Specialist Visits: 40% after deductible
- Preventive Care: Not covered
- Diagnostic Lab/X-ray: 40% after deductible

#### Hospital Services
- Inpatient: 40% after deductible
- Outpatient: 40% after deductible
- Emergency Room: $200 copay (waived if admitted) plus 20% coinsurance`,

  HMO: `# Health Maintenance Organization (HMO) Plan Details

## Plan Overview
The HMO plan provides comprehensive coverage through a network of providers, with an emphasis on preventive care and coordinated services. All care must be coordinated through your Primary Care Physician (PCP).

## Key Features
- **Annual Deductible**: None
- **Out-of-Pocket Maximum**: $2,500 (individual), $5,000 (family)
- **Copays**: $20 (primary care), $40 (specialist)
- **Referrals**: Required for specialist visits
- **Preventive Care**: 100% covered

## Coverage Details

### Physician Services
- Primary Care Visits: $20 copay/visit; deductible does not apply
- Specialist Visits: $40 copay (referral required)
- Preventive Care: Covered 100%
- Diagnostic Lab/X-ray: Covered 100%

### Hospital Services
- Inpatient: $250 copay per admission
- Outpatient: $100 copay
- Emergency Room: $150 copay (waived if admitted)

### Prescription Drugs
- Generic: $5
- Preferred Brand: $25
- Non-Preferred Brand: $50
- Specialty: 20% up to $150

## Special Features
- Telemedicine visits: $10 copay/visit; deductible does not apply
- Wellness program discounts
- Disease management programs at no additional cost

## Important Notes
- Out-of-network care is not covered except in emergencies
- Prior authorization required for certain procedures
- All specialist care requires referral from your PCP`
};

// Get content for a specific PDF file
export const getPdfContent = async (pdfName: string): Promise<string> => {
  // Map filename to plan type
  let planType: keyof PdfContent | null = null;
  
  if (pdfName.includes('high-deductible-plan')) {
    planType = 'HDHP';
  } else if (pdfName.includes('ppo-plan')) {
    planType = 'PPO';
  } else if (pdfName.includes('hmo-plan')) {
    planType = 'HMO';
  }
  
  // Return the actual PDF content from the user's uploaded files
  if (planType && actualPdfContent[planType]) {
    return actualPdfContent[planType];
  }
  
  return "PDF content not available";
};

export const loadPdfDocuments = async (): Promise<BenefitDocument[]> => {
  // Define the PDFs we want to load
  const pdfFiles = [
    {
      filename: 'high-deductible-plan-formatted.pdf',
      id: 'high-deductible-plan',
      title: 'High Deductible Health Plan (HDHP) Details',
      category: 'Health' as BenefitCategory,
      plans: ['HDHP'] as HealthPlan[]
    },
    {
      filename: 'ppo-plan-formatted.pdf',
      id: 'ppo-plan',
      title: 'Preferred Provider Organization (PPO) Plan Details',
      category: 'Health' as BenefitCategory,
      plans: ['PPO'] as HealthPlan[]
    },
    {
      filename: 'hmo-plan-formatted.pdf',
      id: 'hmo-plan',
      title: 'Health Maintenance Organization (HMO) Plan Details',
      category: 'Health' as BenefitCategory,
      plans: ['HMO'] as HealthPlan[]
    }
  ];
  
  // Load each PDF
  const pdfDocuments: BenefitDocument[] = [];
  for (const pdf of pdfFiles) {
    try {
      const content = await getPdfContent(pdf.filename);
      pdfDocuments.push({
        id: pdf.id,
        title: pdf.title,
        content,
        category: pdf.category,
        plans: pdf.plans,
        url: `/api/test-pdf?file=${pdf.filename}`
      });
    } catch (error) {
      console.error(`Error loading PDF document ${pdf.filename}:`, error);
    }
  }
  
  return pdfDocuments;
};

// Mapping for document titles to PDFs
const documentPdfMapping: Record<string, string> = {
  'Health Maintenance Organization (HMO) Plan Details': '/api/test-pdf?file=hmo-plan-formatted.pdf',
  'Preferred Provider Organization (PPO) Plan Details': '/api/test-pdf?file=ppo-plan-formatted.pdf',
  'High Deductible Health Plan (HDHP) Details': '/api/test-pdf?file=high-deductible-plan-formatted.pdf'
};

export { documentPdfMapping }; 