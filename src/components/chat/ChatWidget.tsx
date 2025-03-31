"use client";

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useChatStore } from '@/store/chatStore';

interface ChatWidgetProps {
  personaId?: string;
  position?: 'bottom-right' | 'bottom-left' | 'side-right' | 'side-left';
  title?: string;
  iconText?: string;
  themeColor?: string;
  embedded?: boolean;
}

export function ChatWidget({
  personaId,
  position = 'bottom-right',
  title = 'PulseGuide Assistant',
  iconText = 'PG',
  themeColor = '#1e40af', // blue-800
  embedded = false,
}: ChatWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Array<{type: 'user' | 'assistant', content: string}>>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [threadId, setThreadId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { createThread, setUserProfile, addMessage } = useChatStore();

  // Initialize chat with a thread and welcome message
  useEffect(() => {
    // Create a new thread when the widget first mounts
    const initializeChat = async () => {
      // Set user profile based on persona if available
      if (personaId) {
        const personas: Record<string, {name: string, plan: "HMO" | "PPO" | "HDHP", location: string}> = {
          peg: { name: 'Peg', plan: 'HMO', location: 'Marketing' },
          joe: { name: 'Joe', plan: 'PPO', location: 'Finance' },
          mia: { name: 'Mia', plan: 'HDHP', location: 'Engineering' }
        };
        
        if (personas[personaId]) {
          setUserProfile({
            name: personas[personaId].name,
            plan: personas[personaId].plan,
            location: personas[personaId].location,
            interests: []
          });
        }
      }
      
      // Create a new thread and save its ID
      const newThreadId = createThread();
      setThreadId(newThreadId);
      
      // Add initial welcome message
      setMessages([
        { 
          type: 'assistant', 
          content: 'Hello! I\'m your PulseGuide Benefits Assistant. How can I help you today?' 
        }
      ]);
    };
    
    initializeChat();
  }, [createThread, personaId, setUserProfile]);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleOpen = () => {
    setIsOpen(true);
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading || !threadId) return;
    
    // Add user message to UI
    const userMessage = { type: 'user' as const, content: input.trim() };
    setMessages(prev => [...prev, userMessage]);
    
    // Clear input and set loading state
    const userInput = input.trim();
    setInput('');
    setIsLoading(true);
    
    try {
      // Send message to backend and get response
      // Create message object for the chatStore
      const userChatMessage = {
        id: crypto.randomUUID(),
        role: 'user' as const,
        content: userInput,
        createdAt: new Date()
      };
      
      // Add to chatStore
      addMessage(userChatMessage);
      
      // Add a temporary loading message
      setMessages(prev => [...prev, { type: 'assistant', content: '...' }]);
      
      // Simulate API call delay for demo purposes
      // In a real app, this would be an actual API call to your AI service
      setTimeout(async () => {
        // Remove the loading message
        setMessages(prev => prev.slice(0, -1));
        
        // Determine response based on user input
        let response = '';
        
        if (personaId === 'peg') {
          if (userInput.toLowerCase().includes('doctor') || userInput.toLowerCase().includes('cost')) {
            response = "As someone with an HMO plan, your doctor visits have a copay of $25 for primary care and $45 for specialists. Your plan includes comprehensive prenatal care coverage with a 20% coinsurance after your $1,000 deductible is met.";
          } else if (userInput.toLowerCase().includes('prenatal') || userInput.toLowerCase().includes('baby') || userInput.toLowerCase().includes('pregnancy')) {
            response = "Your HMO plan covers prenatal care, delivery, and postnatal care. For your specific situation (having a baby with 9 months of in-network care), you can expect to pay about $3,660 out of a total cost of $12,700, which includes your deductible, copayments, and coinsurance.";
          } else if (userInput.toLowerCase().includes('deductible')) {
            response = "Your HMO plan has a $1,000 annual deductible. This means you'll pay the first $1,000 of covered services before your plan starts to pay. Preventive care services are covered before you meet your deductible.";
          } else {
            response = "As a Marketing employee with an HMO plan, you have comprehensive coverage for your pregnancy and delivery needs. Your plan requires you to use in-network providers and get referrals from your primary care physician for specialist care. Would you like specific information about your maternity benefits or costs?";
          }
        } else if (personaId === 'joe') {
          if (userInput.toLowerCase().includes('diabetes') || userInput.toLowerCase().includes('chronic')) {
            response = "For managing Type 2 Diabetes, your PPO plan provides comprehensive coverage. You'll pay $30 for primary care visits and $45 for endocrinologist visits. Your plan covers diabetic supplies and medications with different tiers of copayments. For routine care of a well-controlled condition, you can expect to pay about $5,400 out of a total cost of $7,400 annually.";
          } else if (userInput.toLowerCase().includes('specialist') || userInput.toLowerCase().includes('doctor')) {
            response = "Your PPO plan allows you to see specialists without a referral, with a $45 copay for in-network specialists. If you choose to see out-of-network providers, your plan will cover 60% of the allowed amount after you meet your out-of-network deductible of $2,500.";
          } else if (userInput.toLowerCase().includes('medication') || userInput.toLowerCase().includes('prescription')) {
            response = "Your PPO plan includes prescription drug coverage with the following copays: $10 for generic drugs, $45 for preferred brand-name drugs, and $75 for non-preferred brand-name drugs. Specialty medications are covered at 20% coinsurance up to a maximum of $250 per prescription.";
          } else {
            response = "As a Finance department employee with a PPO plan, you have flexibility in choosing healthcare providers both in and out of network. Your plan is well-suited for managing your Type 2 Diabetes with comprehensive coverage for specialist visits, prescriptions, and routine care. Would you like specific information about your coverage for diabetes care or medications?";
          }
        } else if (personaId === 'mia') {
          if (userInput.toLowerCase().includes('fracture') || userInput.toLowerCase().includes('emergency')) {
            response = "For a simple fracture, your HDHP covers emergency room visits and follow-up care after you meet your deductible. For this scenario, you can expect to pay about $2,800 out of a total cost of $4,500. This includes your deductible and 20% coinsurance for the ER visit, X-rays, and follow-up care.";
          } else if (userInput.toLowerCase().includes('hsa') || userInput.toLowerCase().includes('savings')) {
            response = "Your HDHP is HSA-eligible, allowing you to contribute pre-tax dollars to a Health Savings Account. For 2023, you can contribute up to $3,850 for individual coverage or $7,750 for family coverage. These funds can be used tax-free for qualified medical expenses and roll over year to year.";
          } else if (userInput.toLowerCase().includes('deductible')) {
            response = "Your HDHP has a $2,800 annual deductible. You'll need to pay this amount before your plan starts to cover most services. Preventive care is covered at 100% before the deductible. After meeting your deductible, you'll pay 20% coinsurance for most services until you reach your out-of-pocket maximum of $6,900.";
          } else {
            response = "As an Engineering employee with a High Deductible Health Plan (HDHP), you have lower premiums but higher initial costs when you need care. Your plan works well with a Health Savings Account (HSA) to help manage healthcare expenses. For your simple fracture scenario, your plan provides comprehensive coverage once you meet your deductible. Would you like specific information about emergency coverage or how to maximize your HSA benefits?";
          }
        } else {
          // Generic responses if no persona is set
          if (userInput.toLowerCase().includes('doctor') || userInput.toLowerCase().includes('appointment')) {
            response = "Your healthcare plan provides coverage for doctor visits. The specific coverage details depend on your plan type (HMO, PPO, or HDHP). Would you like me to explain the differences in coverage for each plan type?";
          } else if (userInput.toLowerCase().includes('deductible')) {
            response = "A deductible is the amount you pay for covered healthcare services before your insurance plan starts to pay. For example, with a $2,000 deductible, you pay the first $2,000 of covered services yourself. After you pay your deductible, you usually pay only a copayment or coinsurance for covered services.";
          } else if (userInput.toLowerCase().includes('coverage') || userInput.toLowerCase().includes('benefits')) {
            response = "Your benefits include medical, dental, and vision coverage, as well as access to wellness programs and mental health resources. The specific details of your coverage depend on your plan type. Would you like information about a specific aspect of your benefits?";
          } else {
            response = "I can help you understand your healthcare benefits, coverage details, costs, and how to use your plan effectively. Please let me know what specific aspect of your benefits you'd like to learn more about.";
          }
        }
        
        // Add AI response to UI
        setMessages(prev => [...prev, { type: 'assistant', content: response }]);
        
        // Add message to store for thread continuity
        const assistantChatMessage = {
          id: crypto.randomUUID(),
          role: 'assistant' as const,
          content: response,
          createdAt: new Date()
        };
        
        // Add to chatStore
        addMessage(assistantChatMessage);
        
        setIsLoading(false);
      }, 1500);
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prev => [...prev, { type: 'assistant', content: 'Sorry, there was an error processing your request. Please try again.' }]);
      setIsLoading(false);
    }
  };

  const getPositionClasses = () => {
    switch (position) {
      case 'bottom-left':
        return 'bottom-6 left-6';
      case 'side-right':
        return 'bottom-1/2 right-6 transform translate-y-1/2';
      case 'side-left':
        return 'bottom-1/2 left-6 transform translate-y-1/2';
      case 'bottom-right':
      default:
        return 'bottom-6 right-6';
    }
  };
  
  const buttonPositionClasses = getPositionClasses();
  const widgetPositionClasses = position.includes('left') ? 'left-6' : 'right-6';

  // For embedded mode, just show the chat interface directly
  if (embedded) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex-1 overflow-auto p-5 bg-gray-50">
          {messages.map((message, index) => (
            <div 
              key={index} 
              className={`mb-4 ${message.type === 'user' ? 'text-right' : 'text-left'}`}
            >
              <div 
                className={`inline-block rounded-lg px-5 py-3 max-w-[85%] text-base ${
                  message.type === 'user' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-200 text-gray-800'
                }`}
              >
                {message.content === '...' ? (
                  <div className="flex space-x-1 items-center px-2">
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                ) : (
                  message.content
                )}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
        
        <div className="border-t p-3 bg-white">
          <form 
            className="flex"
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !isLoading) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              placeholder="Type your question here..."
              className="flex-1 border rounded-l-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
              disabled={isLoading}
            />
            <button
              type="submit"
              className={`bg-blue-600 text-white px-4 py-2 rounded-r-lg ${isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'}`}
              disabled={isLoading}
            >
              {isLoading ? (
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 102 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                </svg>
              )}
            </button>
          </form>
          <div className="text-center mt-2 text-xs text-gray-500">
            <Link 
              href={`/chat${threadId ? `?thread=${threadId}` : ''}`}
              className="hover:underline"
            >
              Open full chat experience →
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Chat Widget Button */}
      <button
        onClick={isOpen ? handleClose : handleOpen}
        className={`fixed ${buttonPositionClasses} w-16 h-16 rounded-full text-white flex items-center justify-center shadow-lg hover:opacity-90 transition-all z-50`}
        style={{ backgroundColor: themeColor }}
      >
        {isOpen ? (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <div className="flex items-center justify-center">
            {iconText ? (
              <span className="font-bold text-lg">{iconText}</span>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
            )}
          </div>
        )}
      </button>
      
      {/* Chat Widget Panel */}
      {isOpen && (
        <div 
          className={`fixed ${widgetPositionClasses} bottom-24 w-[450px] h-[550px] bg-white rounded-lg shadow-2xl overflow-hidden z-50`}
          style={{ borderColor: themeColor }}
        >
          <div className="flex flex-col h-full">
            <div className="p-4 flex justify-between items-center" style={{ backgroundColor: themeColor }}>
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center mr-3">
                  <span className="font-bold text-xl" style={{ color: themeColor }}>{iconText ? iconText : 'PG'}</span>
                </div>
                <h3 className="font-medium text-white text-lg">{title}</h3>
              </div>
              <div className="flex items-center">
                <Link 
                  href={`/chat${threadId ? `?thread=${threadId}` : ''}`}
                  className="text-white hover:text-gray-200 mr-4"
                  title="Open in full screen"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M3 4a1 1 0 011-1h4a1 1 0 010 2H6.414l2.293 2.293a1 1 0 01-1.414 1.414L5 6.414V8a1 1 0 01-2 0V4zm9 1a1 1 0 010-2h4a1 1 0 011 1v4a1 1 0 01-2 0V6.414l-2.293 2.293a1 1 0 11-1.414-1.414L13.586 5H12zm-9 7a1 1 0 012 0v1.586l2.293-2.293a1 1 0 111.414 1.414L6.414 15H8a1 1 0 010 2H4a1 1 0 01-1-1v-4zm13-1a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 010-2h1.586l-2.293-2.293a1 1 0 111.414-1.414L15 13.586V12a1 1 0 011-1z" clipRule="evenodd" />
                  </svg>
                </Link>
                <button onClick={handleClose} className="text-white hover:text-gray-200">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
            
            <div className="flex-1 overflow-auto p-4 bg-gray-50">
              {messages.map((message, index) => (
                <div 
                  key={index} 
                  className={`mb-4 ${message.type === 'user' ? 'text-right' : 'text-left'}`}
                >
                  <div 
                    className={`inline-block rounded-lg px-4 py-3 max-w-[85%] ${
                      message.type === 'user' 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-200 text-gray-800'
                    }`}
                  >
                    {message.content === '...' ? (
                      <div className="flex space-x-1 items-center px-2">
                        <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                        <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                        <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                      </div>
                    ) : (
                      message.content
                    )}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
            
            <div className="border-t p-3 bg-white">
              <form 
                className="flex"
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
              >
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !isLoading) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  placeholder="Type your question here..."
                  className="flex-1 border rounded-l-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
                  disabled={isLoading}
                />
                <button
                  type="submit"
                  className={`text-white px-4 py-2 rounded-r-lg ${isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-90'}`}
                  style={{ backgroundColor: themeColor }}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 102 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                    </svg>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
} 