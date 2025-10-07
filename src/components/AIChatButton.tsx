"use client";

import { Bot } from "lucide-react";
import AIChatBoxImproved from "./AIChatBoxImproved";
import { useChat } from "@/contexts/ChatContext";

export default function AIChatButton() {
  const { isOpen, openChat, closeChat } = useChat();

  return (
    <>
      <button
        onClick={() => openChat()}
        className="fixed bottom-4 right-4 z-[9997] bg-gradient-to-r from-purple-600 to-blue-500 text-white rounded-full p-4 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110"
        aria-label="Open AI Chat"
      >
        <Bot size={24} className="animate-pulse" />
      </button>
      <AIChatBoxImproved open={isOpen} onClose={closeChat} />
    </>
  );
}
