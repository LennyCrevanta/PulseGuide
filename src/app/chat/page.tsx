"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { useChatStore, getCurrentEmployeeThreads } from "@/store/chatStore";

// Import components with dynamic import to avoid SSR
const ChatInterface = dynamic(() => import("../../components/ChatInterface"), { 
  ssr: false,
  loading: () => <div className="flex h-screen items-center justify-center bg-gray-50">Loading chat interface...</div>
});

const UserProfileForm = dynamic(() => import("../../components/UserProfileForm"), { 
  ssr: false,
  loading: () => <div className="flex h-screen items-center justify-center bg-gray-50">Loading profile form...</div>
});

export default function ChatPage() {
  const [showProfileForm, setShowProfileForm] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const { userProfile, createThread, threads, activeThreadId, setActiveThread } = useChatStore();
  
  // Check if we're in the browser
  useEffect(() => {
    setIsClient(true);
    
    // Only show profile form if user is not already set to an employee persona
    // and if profile is not already filled out
    if (!userProfile.name) {
      const profileData = localStorage.getItem("pulsetelegpt-storage");
      if (profileData) {
        try {
          const { state } = JSON.parse(profileData);
          if (!state.userProfile.name || !state.userProfile.plan || !state.userProfile.location) {
            setShowProfileForm(true);
          }
        } catch (e) {
          // If parsing fails, show the profile form
          setShowProfileForm(true);
        }
      } else {
        setShowProfileForm(true);
      }
    } else {
      // If we have a user profile, ensure there's at least one thread for this employee
      const employeeThreads = getCurrentEmployeeThreads();
      
      if (employeeThreads.length === 0) {
        // No threads for this employee, create one
        createThread();
      } else {
        // Check if active thread belongs to this employee
        const belongsToEmployee = employeeThreads.some(t => t.id === activeThreadId);
        
        if (!belongsToEmployee && employeeThreads.length > 0) {
          // Set active thread to the first thread for this employee
          setActiveThread(employeeThreads[0].id);
        }
      }
    }
  }, [userProfile.name, createThread, activeThreadId, setActiveThread]);
  
  // Show loading state until client-side code runs
  if (!isClient) {
    return <div className="flex h-screen items-center justify-center bg-gray-50">Loading...</div>;
  }
  
  if (showProfileForm) {
    return <UserProfileForm onComplete={() => setShowProfileForm(false)} />;
  }
  
  return <ChatInterface />;
} 