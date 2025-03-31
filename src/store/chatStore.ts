import { create } from "zustand";
import { Message } from "ai";
import { persist } from "zustand/middleware";

type UserProfile = {
  name: string;
  plan: "HDHP" | "PPO" | "HMO" | null;
  location: string;
  interests: string[];
};

type Thread = {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
  titleGenerated?: boolean;
  employeeId?: string;
};

type ChatState = {
  threads: Thread[];
  activeThreadId: string;
  userProfile: UserProfile;
  
  // Thread operations
  createThread: () => string;
  setActiveThread: (threadId: string) => void;
  addMessage: (message: Message) => void;
  updateThreadTitle: (threadId: string, title: string) => void;
  deleteThread: (threadId: string) => void;
  
  // User profile
  setUserProfile: (profile: Partial<UserProfile>) => void;
  clearUserProfile: () => void;
};

const WELCOME_MESSAGE: Message = {
  id: "welcome",
  role: "assistant",
  content: "Hi there! I'm PulseGuide — your HR and benefits assistant. I can help you understand your coverage, access available resources, and make the most of your PulseTel benefits. What would you like to know today?",
  createdAt: new Date()
};

// Generate a title based on the conversation content
const generateThreadTitle = async (messages: Message[]): Promise<string> => {
  console.log('generateThreadTitle called with messages:', messages.length);
  
  try {
    console.log('Sending fetch request to generate-title API');
    const response = await fetch('/api/openai/generate-title', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ messages }),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to generate title. Status: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Log success for debugging
    console.log('Title generated successfully:', data.title);
    
    return data.title;
  } catch (error) {
    console.error('Error generating thread title:', error);
    return "New Conversation";
  }
};

export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      threads: [{
        id: "default",
        title: "New Conversation",
        messages: [WELCOME_MESSAGE],
        createdAt: new Date(),
        updatedAt: new Date(),
        employeeId: ""
      }],
      activeThreadId: "default",
      userProfile: {
        name: "",
        plan: null,
        location: "",
        interests: []
      },
      
      createThread: () => {
        const { userProfile } = get();
        
        // Get a custom welcome message based on the user profile
        let welcomeMessage = { ...WELCOME_MESSAGE };
        
        if (userProfile.name) {
          welcomeMessage = {
            ...WELCOME_MESSAGE,
            content: `Hi there ${userProfile.name}! I'm PulseGuide — your HR and benefits assistant. I can see you're on the ${userProfile.plan} plan. I can help you understand your coverage, access available resources, and make the most of your PulseTel benefits. What would you like to know today?`
          };
        }
        
        const newThread: Thread = {
          id: crypto.randomUUID(),
          title: "New Conversation",
          messages: [welcomeMessage],
          createdAt: new Date(),
          updatedAt: new Date(),
          employeeId: userProfile.name || undefined
        };
        
        set(state => ({
          threads: [...state.threads, newThread],
          activeThreadId: newThread.id
        }));
        
        return newThread.id;
      },
      
      setActiveThread: (threadId: string) => {
        // Only set if thread exists
        const threadExists = get().threads.some(t => t.id === threadId);
        if (threadExists) {
          set({ activeThreadId: threadId });
        }
      },
      
      addMessage: (message) => {
        console.log('Adding message to thread:', message.role);
        
        set(state => {
          const { threads, activeThreadId } = state;
          console.log('Active thread ID:', activeThreadId);
          
          // Find the active thread
          const updatedThreads = threads.map(thread => {
            if (thread.id === activeThreadId) {
              // Update thread with new message and timestamp
              const updatedMessages = [...thread.messages, message];
              const updatedThread = {
                ...thread,
                messages: updatedMessages,
                updatedAt: new Date(),
                // Temporary title based on first user message if not generated yet
                title: thread.titleGenerated 
                  ? thread.title 
                  : (updatedMessages.length <= 1 || message.role !== "user" 
                      ? thread.title 
                      : message.content.slice(0, 30) + (message.content.length > 30 ? "..." : ""))
              };
              
              // If we have enough messages and title hasn't been generated yet,
              // generate a theme-based title (done outside this function)
              // Make sure we only start title generation when we have enough context
              const userMessages = updatedMessages.filter(m => m.role === "user");
              const assistantMessages = updatedMessages.filter(m => m.role === "assistant" && m.id !== "welcome");
              
              console.log(`Thread ${thread.id}:
                User messages: ${userMessages.length}
                Assistant messages: ${assistantMessages.length}
                Thread titleGenerated: ${thread.titleGenerated}
                Message role: ${message.role}
              `);
              
              const shouldGenerateTitle = 
                !thread.titleGenerated && 
                userMessages.length >= 1 && 
                assistantMessages.length >= 1 &&
                message.role === "assistant"; // Only try to generate after assistant replies
              
              console.log('Should generate title:', shouldGenerateTitle);
              
              if (shouldGenerateTitle) {
                console.log('Starting title generation process');
                // Mark that we're generating a title to avoid multiple calls
                updatedThread.titleGenerated = true;
                
                // Set a temporary title to indicate generation is in progress
                get().updateThreadTitle(thread.id, "Generating title...");
                
                // Asynchronously generate and update the title immediately
                generateThreadTitle(updatedMessages)
                  .then(newTitle => {
                    console.log('Title generation completed:', newTitle);
                    if (newTitle && newTitle !== "New Conversation") {
                      console.log('Updating thread title to:', newTitle);
                      get().updateThreadTitle(thread.id, newTitle);
                    } else {
                      // If title generation failed or returned default, reset the flag to try again
                      console.log('Title generation returned default or failed, resetting flag');
                      const currentThread = get().threads.find(t => t.id === thread.id);
                      if (currentThread) {
                        // Reset the titleGenerated flag to try again next message
                        get().updateThreadTitle(thread.id, currentThread.title);
                      }
                    }
                  })
                  .catch(err => {
                    console.error("Title generation failed:", err);
                    // Reset the flag to try again next message
                    const currentThread = get().threads.find(t => t.id === thread.id);
                    if (currentThread) {
                      get().updateThreadTitle(thread.id, currentThread.title);
                    }
                  });
              }
              
              return updatedThread;
            }
            return thread;
          });
          
          return { threads: updatedThreads };
        });
      },
      
      updateThreadTitle: (threadId: string, title: string) => {
        set(state => ({
          threads: state.threads.map(thread => 
            thread.id === threadId 
              ? { 
                  ...thread, 
                  title, 
                  // Only mark as generated if title is not default and different from current
                  titleGenerated: title !== "New Conversation" && title !== thread.title
                } 
              : thread
          )
        }));
      },
      
      deleteThread: (threadId: string) => {
        set(state => {
          // Make a copy of the current state
          const { threads, activeThreadId, userProfile } = state;
          
          // Filter out the thread to be deleted
          const updatedThreads = threads.filter(t => t.id !== threadId);
          
          // Determine the new active thread ID
          let newActiveThreadId = activeThreadId;
          
          // If we're deleting the active thread, switch to another thread
          if (threadId === activeThreadId) {
            // Get threads for the current employee
            const employeeThreads = updatedThreads.filter(t => 
              !t.employeeId || t.employeeId === userProfile.name
            );
            
            if (employeeThreads.length > 0) {
              // Switch to the first available thread for this employee
              newActiveThreadId = employeeThreads[0].id;
            } else {
              // Create a new default thread if no threads remain for this employee
              newActiveThreadId = "default-" + (userProfile.name || "anonymous");
              
              // Create a personalized welcome message if a user profile exists
              let welcomeMessage = { ...WELCOME_MESSAGE };
              if (userProfile.name) {
                welcomeMessage = {
                  ...WELCOME_MESSAGE,
                  content: `Hi there ${userProfile.name}! I'm PulseGuide — your HR and benefits assistant. I can see you're on the ${userProfile.plan} plan. I can help you understand your coverage, access available resources, and make the most of your PulseTel benefits. What would you like to know today?`
                };
              }
              
              updatedThreads.push({
                id: newActiveThreadId,
                title: "New Conversation",
                messages: [welcomeMessage],
                createdAt: new Date(),
                updatedAt: new Date(),
                employeeId: userProfile.name || undefined
              });
            }
          }
          
          // Return the updated state
          return {
            threads: updatedThreads,
            activeThreadId: newActiveThreadId
          };
        });
      },
      
      setUserProfile: (profile) =>
        set((state) => ({
          userProfile: { ...state.userProfile, ...profile }
        })),
        
      clearUserProfile: () =>
        set({
          userProfile: {
            name: "",
            plan: null,
            location: "",
            interests: []
          }
        }),
    }),
    {
      name: "pulsetelegpt-storage"
    }
  )
);

// Helper function to get the active thread
export const getActiveThread = () => {
  const { threads, activeThreadId } = useChatStore.getState();
  return threads.find(t => t.id === activeThreadId) || threads[0];
};

// Helper function to get messages from the active thread
export const getActiveMessages = () => {
  const activeThread = getActiveThread();
  return activeThread?.messages || [];
};

// Helper function to get threads for the current employee
export const getCurrentEmployeeThreads = () => {
  const { threads, userProfile } = useChatStore.getState();
  
  // If there's no employee selected, only show threads with no employee ID
  if (!userProfile.name) {
    return threads.filter(thread => !thread.employeeId);
  }
  
  // Return only threads associated with this specific employee
  return threads.filter(thread => thread.employeeId === userProfile.name);
};
