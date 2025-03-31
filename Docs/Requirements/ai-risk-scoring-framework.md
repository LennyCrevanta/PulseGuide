# AI Risk Scoring Framework for HR & Employee Benefits Chat Responses

This guide provides a framework for evaluating and classifying AI-generated responses based on risk level to protect employees and employers in regulated HR and benefits environments.

---

## 🎯 Purpose

To identify and mitigate responses that could pose legal, compliance, or reputational risks by scoring each AI output and triggering appropriate safeguards.

---

## ✅ Step 1: Define Risk Levels

| Risk Level | Description | Example Topics |
|------------|-------------|----------------|
| **Low (1)** | Factual, non-sensitive info. No compliance risk. | Office hours, deductible amounts, finding in-network providers |
| **Medium (2)** | Moderate importance. May influence decisions, not highly regulated. | Eligibility rules, benefit comparisons, enrollment timing |
| **High (3)** | Sensitive or regulated. Missteps could lead to harm or liability. | FMLA, ADA, COBRA, disability, discrimination, terminations |

---

## 🧠 Step 2: Score Responses Using Logic or AI

### Option A: Rule-Based Scoring

```ts
function classifyRiskLevel(responseText: string): number {
  if (responseText.includes("FMLA") || responseText.match(/(disability|termination|legal|ADA|COBRA)/i)) {
    return 3; // High risk
  } else if (responseText.includes("eligibility") || responseText.match(/compare|recommend/i)) {
    return 2; // Medium risk
  } else {
    return 1; // Low risk
  }
}
```

### Option B: AI-Based Classification

Prompt an LLM:
> “Classify the following response as Low, Medium, or High risk based on legal/regulatory sensitivity and user impact…”

Or train a custom classifier with labeled examples from HR/legal use cases.

---

## ⚠️ Step 3: Take Action Based on Risk Score

| Risk Score | Action |
|------------|--------|
| **1 – Low**    | Display immediately |
| **2 – Medium** | Add legal disclaimer, log for audit |
| **3 – High**   | Block or escalate to HR/human reviewer before display |

---

## 🔍 Step 4: Add Risk Metadata for Auditing

For each response, log:

- Risk score
- Trigger keywords or classification method
- Document sources used (if applicable)
- Whether the response was escalated or shown

Example:

```json
{
  "response": "Your COBRA continuation coverage lasts 18 months...",
  "risk_score": 3,
  "triggers": ["COBRA"],
  "source": "SPD_HealthPlan_2025.pdf",
  "escalated": true
}
```

---

## 🛠 Tools & Techniques

- **Prompt-based classifiers** (simple, effective)
- **RAG document tracing** to identify sensitive source material
- **Guardrails tools** (e.g., [Guardrails AI](https://www.guardrailsai.com/), [Rebuff](https://rebuff.ai/))
- **Human-in-the-loop** review pipelines for high-risk topics

---

## ✅ Final Tip: Start Small and Iterate

Begin with rule-based risk scoring and log real-world usage. Use feedback to refine your triggers, model prompts, and escalation policies.

---
