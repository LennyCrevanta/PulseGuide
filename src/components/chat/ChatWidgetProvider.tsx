"use client";

import { useState, useEffect } from 'react';
import { ChatWidget } from './ChatWidget';

interface ChatWidgetProviderProps {
  iconText?: string;
  title?: string;
  themeColor?: string;
  position?: 'bottom-right' | 'bottom-left' | 'side-right' | 'side-left';
  personaId?: string;
  autoOpen?: boolean;
  delay?: number;
}

export function ChatWidgetProvider({
  iconText = 'PG',
  title = 'PulseGuide Assistant',
  themeColor = '#1e40af',
  position = 'bottom-right',
  personaId,
  autoOpen = false,
  delay = 5000,
}: ChatWidgetProviderProps) {
  const [mounted, setMounted] = useState(false);
  
  // Only render on client
  useEffect(() => {
    setMounted(true);
    
    // Auto-open chat after delay if specified
    let timer: NodeJS.Timeout;
    if (autoOpen) {
      timer = setTimeout(() => {
        // We could add state here to auto-open the chat
        // But better UX is probably not to auto-open
        // Instead, we could add a subtle pulse animation to the button
      }, delay);
    }
    
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [autoOpen, delay]);
  
  if (!mounted) return null;
  
  return (
    <ChatWidget 
      iconText={iconText}
      title={title}
      themeColor={themeColor}
      position={position}
      personaId={personaId}
    />
  );
} 