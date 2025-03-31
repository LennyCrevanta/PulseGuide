import { OpenAIStream, StreamingTextResponse } from 'ai';
import OpenAI from 'openai';

// Create an OpenAI API client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
});

export const runtime = 'edge';

const SYSTEM_PROMPT = `You are PulseGuide, an AI-powered HR and benefits assistant for PulseTel employees.

PulseTel is a telecommunications company with employees across the US, with concentrations in 5 major cities. 

Your role is to help employees understand their benefits, which vary based on their selected health plan (HDHP, PPO, or HMO) and other eligibility factors.

Your tone should be helpful, informative, and personal. When providing information, focus on being accurate and tailoring your responses to the specific health plan and circumstances of the employee when possible.

If you don't know the answer, be honest and offer to help find the information or direct them to HR for specific questions about their individual benefits.`;

// Plan details that the assistant should know about
const PLAN_DETAILS = {
  HMO: {
    name: "Health Maintenance Organization Plan",
    deductible: "$1,000",
    specialist_copay: "$45",
    hospital_coinsurance: "20%",
    other_coinsurance: "20%",
    benefits: "Lower monthly premiums, primary care physician required, referrals required for specialists, limited network, predictable costs with copays",
    ideal_for: "Employees who prefer lower premiums and don't mind using a limited network of providers",
    coverage: "Comprehensive coverage for preventive care, prenatal care, specialist visits, hospital stays, and prescription drugs but only within network. Out-of-network care is not covered except in emergencies."
  },
  PPO: {
    name: "Preferred Provider Organization Plan",
    deductible: "$1,500",
    specialist_copay: "$30",
    hospital_coinsurance: "15%",
    other_coinsurance: "15%",
    benefits: "More flexibility, larger provider network, coverage for out-of-network care (at higher cost), no referrals needed for specialists",
    ideal_for: "Employees who want more flexibility and a wider choice of healthcare providers",
    coverage: "Good coverage for regular doctor visits, specialist visits, hospital stays, and prescription drugs. Lower costs when using in-network providers, but still provides some coverage out-of-network."
  },
  HDHP: {
    name: "High Deductible Health Plan",
    deductible: "$2,500",
    specialist_copay: "Full cost until deductible met, then 10% coinsurance",
    hospital_coinsurance: "10% after deductible",
    other_coinsurance: "10% after deductible",
    benefits: "Lowest monthly premiums, compatible with Health Savings Account (HSA), preventive care covered at 100%",
    ideal_for: "Healthy employees or those who want to save for future medical expenses through an HSA",
    coverage: "Full coverage for preventive care, but employee pays full cost for other services until meeting the deductible. After reaching the deductible, the plan pays most costs (typically 90%)."
  }
};

// Employee-specific health information
const EMPLOYEE_HEALTH_INFO = {
  'Peg': {
    condition: "Pregnancy",
    description: "Having a baby (9 months of in-network pre-natal care and hospital delivery)",
    totalCost: "$12,700",
    userPays: "$3,660",
    breakdown: {
      deductibles: "$1,000",
      copayments: "$500",
      coinsurance: "$2,100",
      notCovered: "$60"
    },
    services: [
      "Specialist office visits (prenatal care)",
      "Childbirth/Delivery Professional Services",
      "Childbirth/Delivery Facility Services",
      "Diagnostic tests (ultrasounds and blood work)",
      "Specialist visit (anesthesia)"
    ]
  },
  'Joe': {
    condition: "Type 2 Diabetes",
    description: "Managing Type 2 Diabetes (a year of routine in-network care of a well-controlled condition)",
    totalCost: "$5,600",
    userPays: "$2,270",
    breakdown: {
      deductibles: "$800",
      copayments: "$1,100",
      coinsurance: "$350",
      notCovered: "$20"
    },
    services: [
      "Primary care physician office visits (including disease education)",
      "Diagnostic tests (blood work)",
      "Prescription drugs",
      "Durable medical equipment (glucose meter)"
    ]
  },
  'Mia': {
    condition: "Simple Fracture",
    description: "Simple Fracture (in-network emergency room visit and follow up care)",
    totalCost: "$2,800",
    userPays: "$1,740",
    breakdown: {
      deductibles: "$1,000",
      copayments: "$500",
      coinsurance: "$240",
      notCovered: "$0"
    },
    services: [
      "Emergency room care (including medical supplies)",
      "Diagnostic test (x-ray)",
      "Durable medical equipment (crutches)",
      "Rehabilitation services (physical therapy)"
    ]
  }
};

export async function POST(req: Request) {
  try {
    const { messages, id, employeeProfile } = await req.json();

    // Build a dynamic system prompt based on employee profile if available
    let systemPrompt = SYSTEM_PROMPT;
    
    if (employeeProfile && employeeProfile.name && employeeProfile.plan) {
      const planInfo = PLAN_DETAILS[employeeProfile.plan as keyof typeof PLAN_DETAILS];
      const healthInfo = EMPLOYEE_HEALTH_INFO[employeeProfile.name as keyof typeof EMPLOYEE_HEALTH_INFO];
      
      systemPrompt += `\n\nIMPORTANT: You are currently speaking with ${employeeProfile.name} who has the ${employeeProfile.plan} plan.
      
Plan details for ${employeeProfile.plan} (${planInfo.name}):
- Deductible: ${planInfo.deductible}
- Specialist copay: ${planInfo.specialist_copay}
- Hospital coinsurance: ${planInfo.hospital_coinsurance}
- Other coinsurance: ${planInfo.other_coinsurance}
- Key benefits: ${planInfo.benefits}
- Ideal for: ${planInfo.ideal_for}
- Coverage details: ${planInfo.coverage}`;

      // Add health condition information if we have it for this employee
      if (healthInfo) {
        systemPrompt += `\n\nHealth Condition Information for ${employeeProfile.name}:
- Condition: ${healthInfo.condition}
- Description: ${healthInfo.description}
- Total Estimated Cost: ${healthInfo.totalCost}
- Employee Pays: ${healthInfo.userPays}
- Cost Breakdown:
  - Deductibles: ${healthInfo.breakdown.deductibles}
  - Copayments: ${healthInfo.breakdown.copayments}
  - Coinsurance: ${healthInfo.breakdown.coinsurance}
  - Not Covered: ${healthInfo.breakdown.notCovered}
- Covered Services:
  ${healthInfo.services.map(service => `  - ${service}`).join('\n')}`;
      }

      systemPrompt += `\n\nAlways tailor your answers to ${employeeProfile.name}'s ${employeeProfile.plan} plan when discussing coverage, costs, or benefits.`;
    }

    // Request the OpenAI API for the response
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      stream: true,
      messages: [
        { role: "system", content: systemPrompt },
        ...messages.map((message: any) => ({
          role: message.role,
          content: message.content,
        }))
      ],
    });

    // Convert the response into a friendly text-stream
    const stream = OpenAIStream(response);

    // Respond with the stream
    return new StreamingTextResponse(stream, {
      headers: {
        'x-conversation-id': id || 'default',
      },
    });
  } catch (error) {
    console.error('Error in OpenAI chat route:', error);
    return new Response(JSON.stringify({ error: 'Failed to process your request' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}
