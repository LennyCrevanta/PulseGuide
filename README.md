# PulseGuide - AI-Powered HR Benefits Assistant

PulseGuide is an AI assistant designed for PulseTel employees to quickly understand their benefits, get personalized recommendations, and find relevant resources.

## Features

- **Chat Interface**: Ask questions about benefits in natural language
- **Personalized Responses**: Tailored information based on your health plan and preferences
- **Benefit Recommendations**: Contextual suggestions based on your profile
- **Document Support**: (Coming soon) Access to benefit PDFs and documentation

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **UI**: React & Tailwind CSS
- **AI**: OpenAI GPT-4o via Vercel AI SDK
- **State Management**: Zustand
- **Backend**: Supabase (future implementation)

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Set up your environment variables:
   ```
   # Create a .env.local file with:
   OPENAI_API_KEY=your_openai_key_here
   ```
4. Run the development server:
   ```
   npm run dev
   ```
5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

- `/app`: Next.js App Router pages and API routes
- `/components`: React components
- `/store`: Zustand state management
- `/lib`: Utility functions, hooks, and RAG implementation (future)

## Future Enhancements

- RAG (Retrieval Augmented Generation) for benefits data
- PDF document viewer and search
- User authentication via Supabase
- Admin analytics dashboard
- Mobile app version