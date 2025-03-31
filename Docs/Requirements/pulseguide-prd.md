
# PulseGuide – Product Requirements Document (PRD)

## Overview
PulseGuide is an AI-powered HR and benefits assistant designed for PulseTel employees. It helps users understand their benefit coverage, access wellness resources, and get personalized answers quickly through a chat interface.

---

## 🎯 Problem Statement
Employees often struggle to understand their complex benefits. PulseGuide offers a conversational experience that simplifies benefit discovery and guidance.

---

## 💡 Solution
A chat-based digital assistant (similar to ChatGPT or Perplexity) that is branded for PulseTel and provides customized, plan-specific responses.

---

## 👥 Target Users
- PulseTel employees (distributed U.S. workforce)
- Users with HDHP, PPO, or HMO health plans
- Employees looking for benefit recommendations

---

## 🔑 Core Features

| Feature             | Description |
|---------------------|-------------|
| Intro Screen        | Welcome, examples, capabilities, limitations, CTA to chat |
| Chat Interface      | Conversational UI with user/assistant bubbles |
| Smart Responses     | Tailored based on plan, interests, and history |
| Supabase Backend    | Stores user profile and message history |
| Zustand Store       | Maintains app state (chat and user info) |
| Responsive Design   | Works seamlessly on desktop and mobile |

---

## 🧭 User Journey

1. **Intro Screen**  
   User sees welcome message and clicks “Start Chatting”

2. **Chat Interface**  
   Sidebar, header, chat body, and input field  
   - Assistant initiates with a welcome  
   - User enters questions  
   - Assistant replies based on context

3. **Message Experience**  
   - Rounded chat bubbles  
   - Timestamps and sender labels  
   - State managed with Zustand

---

## 🛠 Tech Stack

- **Framework**: Next.js
- **State**: Zustand
- **Backend**: Supabase (stubbed for now)
- **Styling**: Tailwind CSS
- **Icons**: Emoji-based UI

---

## 🧪 Future Enhancements

- Supabase Auth (SSO or Email Login)
- Document viewer & search
- Admin analytics
- Real-time backend with OpenAI or Claude API
- Onboarding flow for capturing survey/preferences

---

## 📄 File Structure

```
/pages
  └── index.tsx
  └── chat.tsx
/components
  └── IntroScreen.tsx
  └── ChatInterface.tsx
/store
  └── chatStore.ts
/lib
  └── (future Supabase utils)
/styles
  └── globals.css
```

---

## ⚠️ Out of Scope for MVP

- Auth flow
- PDF rendering
- Notifications or reminders
- Team views

---

## 🔗 Supabase Env

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

---

## Created by
Product, Design, and Engineering – PulseTel
