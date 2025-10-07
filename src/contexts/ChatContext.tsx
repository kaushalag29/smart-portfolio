"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface SuggestedQuestion {
  text: string;
  icon: string;
  color: string;
}

interface ChatContextType {
  isOpen: boolean;
  prefilledQuestion: string;
  suggestedQuestions: SuggestedQuestion[];
  openChat: (question?: string, suggestions?: SuggestedQuestion[]) => void;
  closeChat: () => void;
  clearPrefilledQuestion: () => void;
  clearSuggestedQuestions: () => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [prefilledQuestion, setPrefilledQuestion] = useState('');
  const [suggestedQuestions, setSuggestedQuestions] = useState<SuggestedQuestion[]>([]);

  const openChat = (question?: string, suggestions?: SuggestedQuestion[]) => {
    if (question) {
      setPrefilledQuestion(question);
    }
    if (suggestions) {
      setSuggestedQuestions(suggestions);
    }
    setIsOpen(true);
  };

  const closeChat = () => {
    setIsOpen(false);
    // Don't clear immediately - let the chat component handle it
  };

  const clearPrefilledQuestion = () => {
    setPrefilledQuestion('');
  };

  const clearSuggestedQuestions = () => {
    setSuggestedQuestions([]);
  };

  return (
    <ChatContext.Provider value={{ 
      isOpen, 
      prefilledQuestion, 
      suggestedQuestions,
      openChat, 
      closeChat, 
      clearPrefilledQuestion,
      clearSuggestedQuestions
    }}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
}
