import { StreamingTextResponse } from 'ai';
import OpenAI from 'openai';
import { getContextForQuery } from '@/lib/rag/benefitsData';

// Create an OpenAI API client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
});

export const runtime = 'edge';

// Custom function to convert OpenAI stream to ReadableStream
async function* streamIterator(stream: any) {
  for await (const chunk of stream) {
    const content = chunk.choices[0]?.delta?.content || '';
    if (content) {
      yield content;
    }
  }
}

function createReadableStream(iterator: AsyncIterableIterator<string>): ReadableStream<Uint8Array> {
  return new ReadableStream({
    async start(controller) {
      for await (const chunk of iterator) {
        controller.enqueue(new TextEncoder().encode(chunk));
      }
      controller.close();
    },
  });
}

export async function POST(req: Request) {
  try {
    const { messages, id, employeeProfile } = await req.json();
    
    // Get the latest user message
    const latestUserMessage = messages
      .filter((message: any) => message.role === 'user')
      .pop();

    let ragContext = '';
    let sourceDocs: { id: string; title: string; url?: string }[] = [];
    
    // Only perform RAG retrieval if we have a user message
    if (latestUserMessage) {
      try {
        // Get relevant context based on the user query and employee plan
        const response = await getContextForQuery(
          latestUserMessage.content,
          employeeProfile?.plan || null
        );
        
        ragContext = response.context;
        sourceDocs = response.sourceDocs;
        
      } catch (error) {
        console.error('Error retrieving RAG context:', error);
        // Continue without RAG context if there's an error
      }
    }

    // Build a system prompt that includes RAG context
    let systemPrompt = `You are PulseGuide, an AI-powered HR and benefits assistant for PulseTel employees.

PulseTel is a telecommunications company with employees across the US, with concentrations in 5 major cities.

Your role is to help employees understand their benefits, which vary based on their selected health plan (HDHP, PPO, or HMO) and other eligibility factors.

Your tone should be helpful, informative, and personal. When providing information, focus on being accurate and tailoring your responses to the specific health plan and circumstances of the employee when possible.

If you don't know the answer, be honest and offer to help find the information or direct them to HR for specific questions about their individual benefits.`;

    // Add employee profile context if available
    if (employeeProfile && employeeProfile.name && employeeProfile.plan) {
      systemPrompt += `\n\nYou are currently speaking with ${employeeProfile.name} who has the ${employeeProfile.plan} plan.`;
    }

    // Add RAG context to the system prompt if available
    if (ragContext) {
      systemPrompt += `\n\nHere is the relevant information from our benefits documentation to help answer the question:
\n\n${ragContext}\n\nPlease use this information to provide an accurate response. If the information doesn't fully address the question, you can provide general information but make it clear what is and isn't covered in the documentation.`;
    }

    // Make a simple request to OpenAI without using custom stream handling
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages.map((message: any) => ({
          role: message.role,
          content: message.content,
        }))
      ],
      stream: true,
    });

    // Create a stream manually to avoid type incompatibility
    const iterator = streamIterator(response);
    const readableStream = createReadableStream(iterator);

    // Before creating the sourceDocsHeader, deduplicate documents by ID
    // Create a Map to deduplicate by ID
    const uniqueDocsMap = new Map();
    sourceDocs.forEach(doc => {
      // Ensure URL is set correctly
      console.log('Processing document:', doc);
      uniqueDocsMap.set(doc.id, doc);
    });

    // Convert back to array
    const uniqueSourceDocs = Array.from(uniqueDocsMap.values());

    // Make sure each document has title and URL
    uniqueSourceDocs.forEach(doc => {
      // Make sure all docs have proper URLs
      if (!doc.url && doc.id) {
        // Try to find a matching document in our predefined documents
        const pdfDoc = require('@/lib/rag/pdfUtils').loadPdfDocuments().find(
          (d: any) => d.id === doc.id || d.title === doc.title
        );
        if (pdfDoc && pdfDoc.url) {
          doc.url = pdfDoc.url;
        }
      }
    });

    // Prepare a JSON string of source documents for the header
    const sourceDocsHeader = uniqueSourceDocs.length > 0 
      ? JSON.stringify(uniqueSourceDocs)
      : '';

    console.log('Source docs for header (deduplicated):', {
      count: uniqueSourceDocs.length,
      docs: uniqueSourceDocs.map(d => d.title)
    });

    console.log('Headers being set:', {
      'x-conversation-id': id || 'default',
      'x-rag-used': ragContext ? 'true' : 'false',
      'x-source-docs': sourceDocsHeader ? '[truncated]' : '',
      'x-source-docs-length': sourceDocsHeader.length
    });

    // Return the streaming response
    return new StreamingTextResponse(readableStream, {
      headers: {
        'x-conversation-id': id || 'default',
        'x-rag-used': ragContext ? 'true' : 'false',
        'x-source-docs': sourceDocsHeader,
        'x-source-docs-count': sourceDocs.length.toString(),
      },
    });
  } catch (error) {
    console.error('Error in RAG chat route:', error);
    console.error('Full error:', JSON.stringify(error));
    return new Response(JSON.stringify({ error: 'Failed to process your request' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
} 