# AI Safety Checklist for HR and Employee Benefits Use Cases

Deploying ChatGPT in a highly regulated HR and employee benefits environment requires strong safeguards to protect employees from misinformation and employers from legal or reputational risk. Use the following strategies to mitigate hallucinations and ensure trustworthy, compliant AI usage.

---

## 🔒 1. Use a Retrieval-Augmented Generation (RAG) Approach
- Ground responses in **approved documents** like SBCs, SPDs, HR policies.
- Prevent the model from "hallucinating" by **limiting output to retrieved content**.
- Use embeddings + vector search to **fetch relevant policy snippets**.

> Example: Use OpenAI's function calling or tools API to structure responses strictly from document retrieval.

---

## 🛡️ 2. Provide Citations or Source Links
- Require the assistant to **cite the document and section** it’s summarizing.
- Link to or display the relevant policy content in the UI.
- Helps users verify the information and increases trust.

---

## 🧑‍⚖️ 3. Limit Scope to Informational Guidance
- Avoid legal, financial, or medical **recommendations**.
- Include a disclaimer in all responses:
  > "This is general information, not legal or benefits advice. For help, contact HR or a licensed advisor."

---

## ⚠️ 4. Use Confidence Thresholds or Abstain on Uncertainty
- If the model is uncertain or no document match is found:
  - Show a fallback: **“I’m not sure—let’s ask HR.”**
  - Don’t allow it to guess or speculate.

---

## 🏗️ 5. Use Pre-Approved Response Templates
- Build **templated answers** for common questions.
- Have HR/legal **approve the content**.
- Restrict the model to using these for high-risk topics.

---

## ✅ 6. Log Conversations & Enable Compliance Review
- Log every chat for auditing and compliance.
- Flag conversations involving:
  - Leave of absence
  - ADA/FMLA
  - Discrimination or harassment
- Conduct periodic **manual reviews**.

---

## 🧠 7. Train or Embed Company-Specific Policy Language
- Index and embed your company’s HR and benefits documents.
- Avoid relying on public internet content or generic answers.

---

## 🚫 8. Block or Redirect High-Risk Topics
- Identify topics that should **always go to HR**, such as:
  - Disability accommodations
  - Terminations or grievances
  - Legal disputes (e.g., COBRA appeals)
- Redirect with a soft deflection:
  > “That’s best handled directly with HR. I can help you get in touch.”

---

## 📜 9. Clearly Communicate Model Limitations
- Include visible notices in the UI and chat interface:
  > “PulseBot is an AI assistant that helps explain your benefits. For personalized guidance, please contact HR.”

---

## 🔍 10. Audit, Test, and Tune Prompts Regularly
- Use edge-case scenarios to test system behavior.
- Track real usage feedback and errors.
- Update prompts, policies, and blocklists as needed.

---

### ✅ Optional: Add Human-in-the-Loop for Sensitive Topics
- Enable optional escalation to HR or a live agent.
- Use metadata and message classification to trigger escalations.

---

By following this checklist, you can build responsible, safe, and effective AI experiences in even the most conservative HR environments.
