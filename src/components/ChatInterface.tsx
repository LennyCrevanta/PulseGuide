"use client";

import { useEffect, useRef, useState } from "react";
import { useChatStore, getActiveThread, getActiveMessages, getCurrentEmployeeThreads } from "@/store/chatStore";
import { useChat } from "ai/react";
import Link from "next/link";
import Image from "next/image";
import BenefitRecommendations from "./BenefitRecommendations";
import { enhanceMessage } from "@/lib/services/chatEnhancer";
import { EnhancedMessage } from "@/lib/services/chatEnhancer";
import { formatDistanceToNow } from "date-fns";
import dynamic from "next/dynamic";
import { useRouter } from 'next/navigation';
import ReactMarkdown from "react-markdown";
import { RiskLevel } from '@/lib/utils/riskScoring';
import RiskBadge from './RiskBadge';

// Custom confirm dialog component
const ConfirmDialog = ({ isOpen, onClose, onConfirm, message }: { 
  isOpen: boolean; 
  onClose: () => void; 
  onConfirm: () => void; 
  message: string;
}) => {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white rounded-lg p-6 max-w-sm w-full shadow-xl" onClick={e => e.stopPropagation()}>
        <h3 className="text-lg font-medium mb-4">Confirm</h3>
        <p className="mb-6">{message}</p>
        <div className="flex justify-end space-x-3">
          <button 
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded" 
            onClick={onClose}
          >
            Cancel
          </button>
          <button 
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded" 
            onClick={() => {
              onConfirm();
              onClose();
            }}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

// Create a client-only version of the component to avoid hydration issues
const ChatInterface = () => {
  const { threads: allThreads, activeThreadId, createThread, setActiveThread, addMessage, deleteThread, updateThreadTitle, userProfile, clearUserProfile } = useChatStore();
  const router = useRouter();
  const activeThread = getActiveThread();
  const threads = getCurrentEmployeeThreads(); // Only get threads for current employee
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [enhancedMessages, setEnhancedMessages] = useState<Map<string, EnhancedMessage>>(new Map());
  const [editingThreadId, setEditingThreadId] = useState<string | null>(null);
  const [editThreadTitle, setEditThreadTitle] = useState("");
  const [isMounted, setIsMounted] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [threadToDelete, setThreadToDelete] = useState<string | null>(null);
  
  // Prepare a system message that includes the employee profile context
  const getInitialMessages = () => {
    // If we have active thread messages, use them
    if (activeThread.messages && activeThread.messages.length > 0) {
      // Check if we need to update the welcome message with profile info
      if (userProfile?.name && 
          activeThread.messages.length === 1 && 
          activeThread.messages[0].id === "welcome") {
        // Return messages with updated context
        return [
          {
            id: "system",
            role: "system" as const,
            content: `You are PulseGuide, an HR & benefits assistant. You're speaking with ${userProfile.name} who has a ${userProfile.plan} health plan. When answering questions about coverage, costs, or benefits, always refer to the specific details of the ${userProfile.plan} plan and tailor your responses accordingly.`,
            createdAt: new Date()
          },
          {
            ...activeThread.messages[0],
            content: `Hi there ${userProfile.name}! I'm PulseGuide — your HR and benefits assistant. I can see you're on the ${userProfile.plan} plan. I can help you understand your coverage, access available resources, and make the most of your PulseTel benefits. What would you like to know today?`
          }
        ];
      }
      return activeThread.messages;
    }
    return [];
  };
  
  const { messages, input, handleInputChange, handleSubmit, isLoading, setMessages } = useChat({
    api: "/api/rag/chat",
    initialMessages: getInitialMessages(),
    id: activeThreadId,
    body: {
      employeeProfile: userProfile // Pass the user profile to the API
    },
    onResponse: (response) => {
      // Get the RAG usage indicator from headers
      const ragUsed = response.headers.get('x-rag-used') === 'true';
      
      // Get source documents from headers if available
      let sourceDocs = [];
      const sourceDocsHeader = response.headers.get('x-source-docs');
      console.log('sourceDocsHeader:', sourceDocsHeader);
      
      if (sourceDocsHeader) {
        try {
          sourceDocs = JSON.parse(sourceDocsHeader);
          console.log('Parsed sourceDocs:', sourceDocs);
        } catch (e) {
          console.error('Error parsing source docs:', e);
        }
      }
      
      // Store this information in the enhanced messages map
      setEnhancedMessages(prev => {
        const newMap = new Map(prev);
        // We don't have the message ID yet, so use a temporary key
        newMap.set('__last_response', { 
          content: '',
          riskMetadata: { score: RiskLevel.LOW, triggers: [], escalated: false },
          documents: [],
          disclaimer: '',
          needsEscalation: false,
          ragUsed,
          sourceDocs
        });
        return newMap;
      });
    },
    onFinish: (message) => {
      // Enhance message with risk scoring and citations
      const enhanced = enhanceMessage(input, message.content);
      
      // Check if we have RAG info from the last response and apply it
      const lastResponse = enhancedMessages.get('__last_response');
      console.log('Last response data:', lastResponse);
      
      if (lastResponse) {
        if (lastResponse.ragUsed !== undefined) {
          enhanced.ragUsed = lastResponse.ragUsed;
        }
        if (lastResponse.sourceDocs !== undefined) {
          enhanced.sourceDocs = lastResponse.sourceDocs;
          console.log('Applied sourceDocs to message:', enhanced.sourceDocs);
        }
        
        // Clean up the temporary data
        setEnhancedMessages(prev => {
          const newMap = new Map(prev);
          newMap.delete('__last_response');
          return newMap;
        });
      }
      
      // Store the enhanced message
      setEnhancedMessages(prev => {
        const newMap = new Map(prev);
        newMap.set(message.id, enhanced);
        console.log('Enhanced message stored:', {
          id: message.id,
          hasSourceDocs: (enhanced.sourceDocs && enhanced.sourceDocs.length > 0) || false,
          ragUsed: enhanced.ragUsed
        });
        return newMap;
      });
      
      // Save completed message to our store
      addMessage(message);
    },
  });

  // Create a wrapper for handleSubmit to save the user message first
  const handleSubmitWithStore = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim()) return;

    // Create and save the user message to the store first
    const userMessage = {
      id: crypto.randomUUID(),
      content: input.trim(),
      role: 'user' as const,
      createdAt: new Date()
    };
    addMessage(userMessage);

    // Then proceed with the normal submit
    await handleSubmit(e);
  };

  // When component mounts, set mounted state to true
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // When active thread changes, update the messages
  useEffect(() => {
    setMessages(activeThread.messages);
  }, [activeThreadId, setMessages, activeThread.messages]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Handle new thread creation
  const handleNewThread = () => {
    createThread();
  };

  // Handle thread selection
  const handleSelectThread = (threadId: string) => {
    setEditingThreadId(null);
    setActiveThread(threadId);
  };

  // Handle thread deletion click - open confirmation dialog
  const handleDeleteThreadClick = (e: React.MouseEvent, threadId: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    setThreadToDelete(threadId);
    setConfirmDialogOpen(true);
  };
  
  // Handle actual thread deletion after confirmation
  const confirmDeleteThread = () => {
    if (threadToDelete) {
      deleteThread(threadToDelete);
      setThreadToDelete(null);
    }
  };

  // Handle thread title edit start
  const handleEditThreadTitle = (e: React.MouseEvent, threadId: string, currentTitle: string) => {
    e.stopPropagation();
    setEditingThreadId(threadId);
    setEditThreadTitle(currentTitle);
  };

  // Handle thread title save
  const handleSaveThreadTitle = (e: React.FormEvent, threadId: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (editThreadTitle.trim()) {
      updateThreadTitle(threadId, editThreadTitle.trim());
    }
    setEditingThreadId(null);
  };

  // Format timestamp for messages
  const formatTimestamp = (date: Date | string | undefined) => {
    if (!date) return '';
    return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const handleChangeEmployee = () => {
    clearUserProfile();
    router.push('/');
  };

  // Add a function to get the border color based on risk level
  const getBorderColor = (message: EnhancedMessage) => {
    switch (message.riskMetadata.score) {
      case RiskLevel.HIGH:
        return "border-gray-400 bg-gray-50";
      case RiskLevel.MEDIUM:
        return "border-gray-300 bg-gray-50";
      case RiskLevel.LOW:
      default:
        return "border-gray-200 bg-white";
    }
  };

  // If not mounted yet (server-side rendering), show a loading placeholder
  if (!isMounted) {
    return (
      <div className="flex h-screen font-sans">
        <aside className="w-64 border-r bg-gradient-to-b from-blue-900 to-blue-700 text-white shadow-md flex flex-col">
          <div className="p-4">
            <div className="text-2xl font-bold mb-6">PulseTel</div>
            <div className="w-full bg-white text-blue-900 py-2 px-4 rounded font-medium block text-center mb-4">
              + New Thread
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            <div className="px-4 py-2 text-sm font-semibold text-blue-200">Your conversations</div>
            <div className="space-y-1 px-2">
              <div className="p-2 rounded text-sm bg-blue-800/30">
                <div className="animate-pulse h-5 bg-blue-800/30 rounded w-3/4 mb-1"></div>
                <div className="animate-pulse h-3 bg-blue-800/30 rounded w-1/2"></div>
              </div>
            </div>
          </div>
          <div className="p-4 border-t border-blue-800 space-y-2 text-sm">
            <div className="hover:underline cursor-pointer">My Benefits</div>
            <div className="hover:underline cursor-pointer">Saved Answers</div>
            <div className="hover:underline cursor-pointer">Settings</div>
          </div>
        </aside>
        
        <main className="flex-1 flex flex-col bg-gray-50">
          <header className="px-6 py-4 border-b text-xl font-semibold text-blue-900 bg-white shadow-sm flex items-center gap-2">
            <Image 
              src="/PulseGuideBot.png" 
              alt="PulseGuide Bot" 
              width={32} 
              height={32} 
              className="rounded-full"
            />
            PulseGuide – Your HR & Benefits Assistant
          </header>
          <div className="flex-1 px-6 py-6 space-y-4 overflow-y-auto">
            <div className="animate-pulse h-16 bg-gray-200 rounded w-3/4 mx-auto"></div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex h-screen font-sans">
      {/* Custom confirm dialog */}
      <ConfirmDialog 
        isOpen={confirmDialogOpen} 
        onClose={() => setConfirmDialogOpen(false)}
        onConfirm={confirmDeleteThread}
        message="Are you sure you want to delete this conversation? This action cannot be undone."
      />
      
      <aside className="w-64 border-r bg-gradient-to-b from-blue-900 to-blue-700 text-white shadow-md flex flex-col">
        <div className="p-4">
          <div className="text-2xl font-bold mb-6">PulseTel</div>
          <button 
            onClick={handleNewThread}
            className="w-full bg-white text-blue-900 hover:bg-blue-100 py-2 px-4 rounded font-medium block text-center mb-4"
          >
            + New Thread
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          <div className="px-4 py-2 text-sm font-semibold text-blue-200">Your conversations</div>
          <div className="space-y-1 px-2">
            {threads.map(thread => (
              <div 
                key={thread.id}
                onClick={() => handleSelectThread(thread.id)}
                className={`flex items-center justify-between p-2 rounded text-sm cursor-pointer transition-colors ${
                  thread.id === activeThreadId 
                    ? 'bg-blue-800 text-white' 
                    : 'hover:bg-blue-800/30 text-white'
                }`}
              >
                <div className="flex-1 min-w-0">
                  {editingThreadId === thread.id ? (
                    <form 
                      onSubmit={(e) => handleSaveThreadTitle(e, thread.id)}
                      className="flex items-center"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <input 
                        value={editThreadTitle}
                        onChange={(e) => setEditThreadTitle(e.target.value)}
                        className="w-full bg-blue-700 text-white px-2 py-0.5 rounded text-sm"
                        autoFocus
                      />
                      <button 
                        type="submit"
                        className="ml-1 text-blue-300 hover:text-white"
                        onClick={(e) => e.stopPropagation()}
                      >
                        ✓
                      </button>
                    </form>
                  ) : (
                    <>
                      <div className="font-medium truncate flex items-center">
                        {thread.title || "New Conversation"}
                        {!thread.titleGenerated && thread.messages.length > 1 && (
                          <span className="ml-1 text-xs text-blue-300 animate-pulse">
                            (generating...)
                          </span>
                        )}
                        <button 
                          className="ml-1 opacity-50 hover:opacity-100"
                          onClick={(e) => handleEditThreadTitle(e, thread.id, thread.title)}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3">
                            <path d="M5.433 13.917l1.262-3.155A4 4 0 017.58 9.42l6.92-6.918a2.121 2.121 0 013 3l-6.92 6.918c-.383.383-.84.685-1.343.886l-3.154 1.262a.5.5 0 01-.65-.65z" />
                            <path d="M3.5 5.75c0-.69.56-1.25 1.25-1.25H10A.75.75 0 0010 3H4.75A2.75 2.75 0 002 5.75v9.5A2.75 2.75 0 004.75 18h9.5A2.75 2.75 0 0017 15.25V10a.75.75 0 00-1.5 0v5.25c0 .69-.56 1.25-1.25 1.25h-9.5c-.69 0-1.25-.56-1.25-1.25v-9.5z" />
                          </svg>
                        </button>
                      </div>
                      <div className="text-xs text-blue-300">
                        {formatDistanceToNow(new Date(thread.updatedAt), { addSuffix: true })}
                      </div>
                    </>
                  )}
                </div>
                {threads.length > 1 && !editingThreadId && (
                  <button 
                    onClick={(e) => handleDeleteThreadClick(e, thread.id)}
                    onMouseDown={(e) => e.stopPropagation()}
                    className="text-blue-300 hover:text-red-300 p-1 opacity-50 hover:opacity-100"
                    aria-label="Delete thread"
                    type="button"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
        
        <div className="p-4 border-t border-blue-800 space-y-2 text-sm">
          <div className="hover:underline cursor-pointer">My Benefits</div>
          <div className="hover:underline cursor-pointer">Saved Answers</div>
          <div className="hover:underline cursor-pointer">Settings</div>
          <button 
            onClick={handleChangeEmployee}
            className="w-full text-left hover:bg-blue-800 rounded px-2 py-1 flex items-center space-x-1"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
            </svg>
            <span>Change Employee</span>
          </button>
        </div>
      </aside>
      
      <main className="flex-1 flex flex-col bg-gray-50">
        <header className="px-6 py-4 border-b text-xl font-semibold text-blue-900 bg-white shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Image 
              src="/PulseGuideBot.png" 
              alt="PulseGuide Bot" 
              width={32} 
              height={32} 
              className="rounded-full"
            />
            PulseGuide – Your HR & Benefits Assistant
          </div>
          
          {userProfile?.name && (
            <div className="flex items-center bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1.5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
              </svg>
              Chatting as: {userProfile.name} ({userProfile.plan})
              <button 
                onClick={handleChangeEmployee}
                className="ml-2 text-blue-600 hover:text-blue-800 underline flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M8 5a1 1 0 100 2h5.586l-1.293 1.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L13.586 5H8z" />
                </svg>
                Change
              </button>
            </div>
          )}
        </header>
        <div className="flex-1 px-6 py-6 space-y-4 overflow-y-auto">
          {messages.map((msg, i) => (
            <div key={i} className="space-y-1">
              {msg.role === "user" ? (
                <div className="ml-auto bg-blue-100 text-blue-900 text-right rounded-xl px-5 py-3 max-w-md text-sm whitespace-pre-wrap shadow-md leading-relaxed">
                  {msg.content}
                </div>
              ) : (
                <div className={`text-left border rounded-xl px-5 py-3 max-w-md text-sm whitespace-pre-wrap shadow-md leading-relaxed ${
                  enhancedMessages.has(msg.id) && enhancedMessages.get(msg.id) && enhancedMessages.get(msg.id)!.riskMetadata?.score > RiskLevel.LOW
                    ? getBorderColor(enhancedMessages.get(msg.id)!)
                    : "border-gray-200 bg-white text-gray-800"
                }`}>
                  <div className="flex items-center gap-2 mb-2">
                    <Image 
                      src="/PulseGuideBot.png" 
                      alt="PulseGuide Bot" 
                      width={24} 
                      height={24} 
                      className="rounded-full"
                    />
                    <span className="font-medium text-blue-900">PulseGuide</span>
                    
                    {enhancedMessages.has(msg.id) && enhancedMessages.get(msg.id)?.ragUsed && (
                      <span className="inline-flex items-center ml-2 px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
                        </svg>
                        Plan Docs
                      </span>
                    )}
                  </div>
                  <div className="text-gray-800">
                    {msg.content}
                  </div>
                  
                  {(() => {
                    // Always display the AI generated badge for assistant messages
                    if (msg.role === "assistant") {
                      // Get enhanced message if available
                      const enhanced = enhancedMessages.has(msg.id) 
                        ? enhancedMessages.get(msg.id) 
                        : null;
                      
                      // Only display the badge if we have risk metadata
                      if (enhanced && enhanced.riskMetadata) {
                        console.log('Enhanced message data:', {
                          id: msg.id,
                          hasSourceDocs: enhanced.sourceDocs ? enhanced.sourceDocs.length > 0 : false,
                          sourceDocs: enhanced.sourceDocs,
                          ragUsed: enhanced.ragUsed
                        });
                        
                        // Use actual sourceDocs only without fallback documents
                        const documents = enhanced.sourceDocs || [];
                        
                        return <RiskBadge 
                          riskMetadata={enhanced.riskMetadata} 
                          documents={documents} 
                          ragUsed={enhanced.ragUsed}
                        />;
                      } else {
                        // Create default low risk metadata to always show badge
                        return <RiskBadge 
                          riskMetadata={{ 
                            score: RiskLevel.LOW, 
                            triggers: [], 
                            escalated: false 
                          }}
                        />;
                      }
                    }
                    return null;
                  })()}
                </div>
              )}
              <div className="text-xs text-gray-400 mt-1 ml-1">
                {msg.role === "user" ? 'You' : 'PulseGuide'} 
                {msg.createdAt && (
                  <> • {formatTimestamp(msg.createdAt)}</>
                )}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
        
        <form 
          onSubmit={handleSubmitWithStore} 
          className="flex items-center gap-2 p-4 border-t bg-white"
        >
          <textarea
            value={input}
            onChange={handleInputChange}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                if (input.trim() && !isLoading) {
                  handleSubmitWithStore(e as any);
                }
              }
            }}
            placeholder="Ask me anything about your benefits..."
            className="flex-1 resize-none border border-gray-300 rounded-md p-2 text-gray-800"
            rows={2}
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="h-fit bg-blue-700 text-white px-4 py-2 rounded hover:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Thinking..." : "Send"}
          </button>
        </form>
        <BenefitRecommendations />
      </main>
    </div>
  );
};

export default ChatInterface;