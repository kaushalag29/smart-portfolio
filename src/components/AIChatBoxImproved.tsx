import { cn } from "@/lib/utils";
import { Message, useChat as useAIChat } from "ai/react";
import { Bot, SendHorizontal, Trash, XCircle, Copy, Check, ArrowDown, Sparkles, ExternalLink } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import { useChat } from "@/contexts/ChatContext";

interface AIChatBoxProps {
  open: boolean;
  onClose: () => void;
}

// Generate intelligent follow-up questions based on conversation context
const generateFollowUpQuestions = (lastUserMessage: string, lastAIMessage: string): string[] => {
  const lowerUser = lastUserMessage.toLowerCase();
  const lowerAI = lastAIMessage.toLowerCase();
  
  // Extract entities from the conversation
  const hasCompanyMention = /\b(aws|amazon|paycom|cloudwick|qubole|microland|rice|bit)\b/i.test(lowerUser + lowerAI);
  const hasTechMention = /\b(python|java|aws|react|machine learning|ml|ai|docker|kubernetes)\b/i.test(lowerUser + lowerAI);
  const hasProjectMention = /\b(project|built|developed|implemented|system)\b/i.test(lowerUser + lowerAI);
  const hasImpactMention = /\b(impact|result|improved|increased|reduced|achieved)\b/i.test(lowerAI);
  
  const followUps: string[] = [];
  
  // Context-aware follow-ups
  if (hasImpactMention && followUps.length < 3) {
    followUps.push("Can you elaborate on the specific metrics and outcomes?");
  }
  
  if (hasProjectMention && followUps.length < 3) {
    followUps.push("What were the biggest technical challenges in this project?");
  }
  
  if (hasTechMention && followUps.length < 3) {
    followUps.push("How did you learn and master these technologies?");
  }
  
  if (hasCompanyMention && followUps.length < 3) {
    followUps.push("What was the team structure and your role in it?");
  }
  
  // Generic valuable follow-ups
  const genericFollowUps = [
    "Tell me more about your problem-solving approach",
    "What did you learn from this experience?",
    "How does this relate to your current work at AWS?",
    "Can you share another example of similar work?",
    "What would you do differently if you did this again?"
  ];
  
  // Fill remaining slots with generic questions
  while (followUps.length < 3) {
    const randomFollowUp = genericFollowUps[Math.floor(Math.random() * genericFollowUps.length)];
    if (!followUps.includes(randomFollowUp)) {
      followUps.push(randomFollowUp);
    }
  }
  
  return followUps.slice(0, 3);
};

export default function AIChatBoxImproved({ open, onClose }: AIChatBoxProps) {
  const CHAT_HISTORY_KEY = 'smart-portfolio-chat-history';
  const [hasLoadedHistory, setHasLoadedHistory] = useState(false);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const [followUpQuestions, setFollowUpQuestions] = useState<string[]>([]);
  const { prefilledQuestion, clearPrefilledQuestion, suggestedQuestions, clearSuggestedQuestions } = useChat();
  
  // chat-related states and functions from useAIChat hook
  const {
    messages,
    input,
    handleInputChange,
    handleSubmit: originalHandleSubmit,
    setMessages,
    setInput,
    isLoading,
    error,
  } = useAIChat({
    api: '/api/chat',
    streamProtocol: 'text',
    onResponse: (response) => {
      if (!response.ok) {
        console.error('Response error:', response.statusText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    },
    onFinish: (message) => {
      console.log('Chat finished successfully');
    },
    onError: (error) => {
      console.error("Chat error:", error);
      const errorMessage: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: `An error occurred: ${error?.message || 'Something went wrong. Please try refreshing the page if this persists.'}`,
      };
      setMessages([...messages, errorMessage]);
    }
  });

  // Load chat history from localStorage on component mount
  useEffect(() => {
    if (!hasLoadedHistory) {
      try {
        const savedHistory = localStorage.getItem(CHAT_HISTORY_KEY);
        if (savedHistory) {
          const parsedHistory = JSON.parse(savedHistory);
          if (Array.isArray(parsedHistory) && parsedHistory.length > 0) {
            setMessages(parsedHistory);
            console.log('💾 Loaded chat history from localStorage:', parsedHistory.length, 'messages');
          }
        }
      } catch (error) {
        console.error('❌ Failed to load chat history from localStorage:', error);
      } finally {
        setHasLoadedHistory(true);
      }
    }
  }, [hasLoadedHistory, setMessages]);

  // Save chat history to localStorage whenever messages change (after initial load)
  useEffect(() => {
    if (hasLoadedHistory) {
      try {
        if (messages.length > 0) {
          localStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(messages));
        } else {
          localStorage.removeItem(CHAT_HISTORY_KEY);
        }
      } catch (error) {
        console.error('❌ Failed to save chat history to localStorage:', error);
        if (error instanceof Error && error.name === 'QuotaExceededError') {
          console.warn('⚠️  localStorage quota exceeded. Chat history will not persist.');
        }
      }
    }
  }, [messages, hasLoadedHistory]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim()) return;
    
    // Clear suggested questions after first message
    if (suggestedQuestions.length > 0) {
      clearSuggestedQuestions();
    }
    
    // Clear follow-up questions when user sends a new message
    setFollowUpQuestions([]);
    
    try {
      await originalHandleSubmit(e);
    } catch (err: any) {
      console.error("Failed to send message:", err);
      const errorMessage: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: `Failed to send message: ${err?.message || 'Please try again.'}`,
      };
      setMessages([...messages, errorMessage]);
    }
  };

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [input]);

  // Scroll detection
  const handleScroll = () => {
    if (scrollRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
      setShowScrollButton(!isNearBottom && messages.length > 3);
    }
  };

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (scrollRef.current && !showScrollButton) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [messages, showScrollButton]);

  // Scroll to bottom manually
  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  };

  // Auto-focus textarea and scroll to bottom when chat box is opened
  useEffect(() => {
    if (open) {
      textareaRef.current?.focus();
      
      // Prevent body scroll on mobile when chat is open
      const originalOverflow = document.body.style.overflow;
      const originalPosition = document.body.style.position;
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
      
      // Scroll to bottom when chat opens to show latest content
      setTimeout(() => {
        if (scrollRef.current) {
          scrollRef.current.scrollTo({
            top: scrollRef.current.scrollHeight,
            behavior: 'smooth'
          });
        }
      }, 100);

      // Cleanup: restore body scroll when chat closes
      return () => {
        document.body.style.overflow = originalOverflow;
        document.body.style.position = originalPosition;
        document.body.style.width = '';
      };
    }
  }, [open]);

  // Handle Escape key to close chat
  useEffect(() => {
    const handleEscapeKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) {
        onClose();
      }
    };
    
    if (open) {
      document.addEventListener('keydown', handleEscapeKey);
      return () => document.removeEventListener('keydown', handleEscapeKey);
    }
  }, [open, onClose]);

  // Handle prefilled question when chat opens
  useEffect(() => {
    if (open && prefilledQuestion && hasLoadedHistory) {
      setInput(prefilledQuestion);
      clearPrefilledQuestion();
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.focus();
          textareaRef.current.setSelectionRange(
            textareaRef.current.value.length,
            textareaRef.current.value.length
          );
        }
      }, 100);
    }
  }, [open, prefilledQuestion, hasLoadedHistory, setInput, clearPrefilledQuestion]);

  // Auto-scroll to bottom when suggested questions appear or chat opens
  useEffect(() => {
    if (open && suggestedQuestions.length > 0) {
      // Wait for DOM to update, then scroll to show suggested questions
      setTimeout(() => {
        if (scrollRef.current) {
          scrollRef.current.scrollTo({
            top: scrollRef.current.scrollHeight,
            behavior: 'smooth'
          });
        }
      }, 150); // Slightly longer delay to ensure DOM is fully rendered
    }
  }, [open, suggestedQuestions]);

  // Generate follow-up questions when AI responds
  useEffect(() => {
    if (messages.length >= 2) {
      const lastMessage = messages[messages.length - 1];
      const secondLastMessage = messages[messages.length - 2];
      
      // Only generate follow-ups if the last message is from AI and second last is from user
      if (lastMessage.role === 'assistant' && secondLastMessage.role === 'user') {
        const followUps = generateFollowUpQuestions(
          secondLastMessage.content,
          lastMessage.content
        );
        setFollowUpQuestions(followUps);
        
        // Auto-scroll to show follow-up questions after AI response
        setTimeout(() => {
          if (scrollRef.current) {
            scrollRef.current.scrollTo({
              top: scrollRef.current.scrollHeight,
              behavior: 'smooth'
            });
          }
        }, 300);
      }
    } else {
      setFollowUpQuestions([]);
    }
  }, [messages]);

  // Copy message to clipboard
  const copyToClipboard = async (text: string, messageId: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedMessageId(messageId);
      setTimeout(() => setCopiedMessageId(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  // Handle suggested question click
  const handleSuggestedClick = (question: string) => {
    setInput(question);
    textareaRef.current?.focus();
  };

  const lastMessageIsUser = messages[messages.length - 1]?.role === "user";

  return (
    <>
      {/* Backdrop overlay for mobile - Highest z-index to cover everything */}
      {open && (
        <div 
          className="fixed inset-0 bg-black/60 z-[9998] md:hidden backdrop-blur-sm"
          onClick={onClose}
        />
      )}
      
      <div
        className={cn(
          "fixed bottom-0 right-0 md:bottom-16 md:right-4 w-full md:w-full md:max-w-[500px] md:p-4 xl:right-22 z-[9999]",
          open ? "block" : "hidden",
        )}
      >
        <div className="flex h-screen md:h-[600px] flex-col border-0 md:border bg-background shadow-xl md:rounded-lg overflow-hidden relative">
        {/* Header */}
        <div className="flex items-center justify-between bg-gradient-to-r from-purple-600 to-blue-500 p-4">
          <div className="flex items-center gap-2">
            <Bot size={24} className="text-white" />
            <h2 className="text-white font-bold text-lg">AI Assistant</h2>
          </div>
          <button 
            onClick={onClose} 
            className="text-white hover:text-gray-200 transition-all duration-200 hover:scale-110 p-2 rounded-full hover:bg-white/20"
            aria-label="Close chat"
          >
            <XCircle size={28} className="md:w-6 md:h-6" />
          </button>
        </div>

        {/* Messages Area */}
        <div 
          className="flex-1 overflow-y-auto px-3 py-3" 
          ref={scrollRef}
          onScroll={handleScroll}
        >
          {messages.map((message) => (
            <ChatMessage 
              message={message} 
              key={message.id}
              onCopy={copyToClipboard}
              isCopied={copiedMessageId === message.id}
            />
          ))}
          
          {isLoading && lastMessageIsUser && (
            <div className="flex items-center gap-2 mb-3">
              <Bot className="text-purple-500" size={20} />
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            </div>
          )}
          
          {error && (
            <ChatMessage
              message={{
                id: "error",
                role: "assistant",
                content: error?.message || "Something went wrong. Please try again!",
              }}
              onCopy={copyToClipboard}
              isCopied={false}
            />
          )}
          
          {!error && messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center px-4">
              <Bot size={48} className="text-purple-500 mb-4 animate-bounce" />
              <p className="text-lg font-medium mb-2">
                Hello! How can I assist you today?
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Ask me anything about Kaushal's portfolio, experience, or projects.
              </p>
            </div>
          )}

          {/* Suggested Questions - Show even with chat history */}
          {suggestedQuestions.length > 0 && (
            <div className="mt-4 mb-3 space-y-2 animate-in fade-in slide-in-from-bottom-4 duration-300">
              <div className="flex items-center gap-2 mb-3 px-2">
                <Sparkles size={18} className="text-purple-500 animate-pulse" />
                <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  {messages.length === 0 ? 'Suggested Questions' : 'Quick Questions About This'}
                </p>
              </div>
              <div className="space-y-2">
                {suggestedQuestions.map((q, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSuggestedClick(q.text)}
                    className="w-full text-left px-4 py-3 rounded-lg border-2 border-purple-200 dark:border-purple-700 
                      hover:border-purple-400 dark:hover:border-purple-500 
                      bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 
                      hover:from-purple-100 hover:to-blue-100 dark:hover:from-purple-900/30 dark:hover:to-blue-900/30
                      transition-all duration-200 group transform hover:scale-[1.02]"
                  >
                    <span className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-purple-700 dark:group-hover:text-purple-300 font-medium">
                      {q.text}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Follow-up Questions - Show after AI responses */}
          {followUpQuestions.length > 0 && messages.length > 0 && messages[messages.length - 1]?.role === 'assistant' && !isLoading && (
            <div className="mt-4 mb-3 space-y-2 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex items-center gap-2 mb-3 px-2">
                <Sparkles size={16} className="text-blue-500" />
                <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                  Continue Exploring
                </p>
              </div>
              <div className="space-y-2">
                {followUpQuestions.map((q, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setInput(q);
                      textareaRef.current?.focus();
                    }}
                    className="w-full text-left px-3 py-2 rounded-lg border border-blue-200 dark:border-blue-700 
                      hover:border-blue-400 dark:hover:border-blue-500 
                      bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/10 dark:to-indigo-900/10 
                      hover:from-blue-100 hover:to-indigo-100 dark:hover:from-blue-900/20 dark:hover:to-indigo-900/20
                      transition-all duration-200 group transform hover:scale-[1.01] hover:shadow-sm"
                  >
                    <span className="text-xs text-gray-600 dark:text-gray-400 group-hover:text-blue-700 dark:group-hover:text-blue-300">
                      {q}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Scroll to Bottom Button */}
        {showScrollButton && (
          <div className="absolute bottom-24 right-8">
            <button
              onClick={scrollToBottom}
              className="p-2 bg-purple-600 hover:bg-purple-700 text-white rounded-full shadow-lg transition-all duration-200 animate-bounce"
              aria-label="Scroll to bottom"
            >
              <ArrowDown size={20} />
            </button>
          </div>
        )}

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="border-t border-gray-200 dark:border-gray-700 p-3 bg-gray-50 dark:bg-gray-800">
          <div className="flex gap-2">
            <button
              type="button"
              className="flex-none p-2 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors duration-200"
              title="Clear chat"
              onClick={() => {
                setMessages([]);
                localStorage.removeItem(CHAT_HISTORY_KEY);
                clearSuggestedQuestions();
                console.log('🗑️  Cleared chat history');
              }}
            >
              <Trash size={20} />
            </button>
            
            <div className="flex-1 relative">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={handleInputChange}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit(e as any);
                  }
                }}
                placeholder="Type your message... (Shift+Enter for new line)"
                className="w-full resize-none rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-4 py-2 pr-12 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm max-h-32 overflow-y-auto"
                rows={1}
                style={{ minHeight: '40px' }}
              />
            </div>
            
            <button
              type="submit"
              className="flex-none p-2 disabled:opacity-50 disabled:cursor-not-allowed enabled:hover:text-blue-500 enabled:hover:bg-blue-50 dark:enabled:hover:bg-blue-900/20 rounded-lg transition-colors duration-200"
              disabled={input.length === 0 || isLoading}
              title="Send message"
            >
              <SendHorizontal size={20} />
            </button>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
            Press Enter to send • Shift+Enter for new line • Esc to close
          </p>
        </form>

        {/* Floating Close Button for Mobile - Bottom Center */}
        <div className="md:hidden pb-safe">
          <button
            onClick={onClose}
            className="w-full py-3 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 
              transition-colors duration-200 flex items-center justify-center gap-2 font-medium text-gray-700 dark:text-gray-300
              border-t border-gray-300 dark:border-gray-600"
            aria-label="Close chat"
          >
            <XCircle size={20} />
            <span>Close Chat</span>
          </button>
        </div>
      </div>
    </div>
    </>
  );
}

// Component to display individual chat messages with copy button
interface ChatMessageProps {
  message: Message;
  onCopy: (text: string, messageId: string) => void;
  isCopied: boolean;
}

function ChatMessage({ message: { id, role, content }, onCopy, isCopied }: ChatMessageProps) {
  const isAiMessage = role === "assistant";

  return (
    <div
      className={cn(
        "mb-3 flex items-start gap-2",
        isAiMessage ? "justify-start" : "justify-end",
      )}
    >
      {isAiMessage && <Bot className="flex-none mt-1 text-purple-500" size={20} />}
      
      <div className="group relative max-w-[85%]">
        <div
          className={cn(
            "rounded-lg border px-3 py-2",
            isAiMessage 
              ? "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700" 
              : "bg-gradient-to-r from-purple-600 to-blue-500 text-white border-transparent",
          )}
        >
          <ReactMarkdown
            components={{
              a: ({ node, ref, ...props }) => (
                <a
                  {...props}
                  href={props.href ?? ""}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    "underline font-semibold hover:no-underline transition-all inline-flex items-center gap-1",
                    isAiMessage 
                      ? "text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300" 
                      : "text-white hover:text-gray-100"
                  )}
                  onClick={(e) => e.stopPropagation()}
                >
                  {props.children}
                  {isAiMessage && <ExternalLink size={12} className="inline" />}
                </a>
              ),
              p: ({ node, ...props }) => (
                <p {...props} className="mt-2 first:mt-0" />
              ),
              ul: ({ node, ...props }) => (
                <ul {...props} className="mt-2 list-inside list-disc first:mt-0 space-y-1" />
              ),
              ol: ({ node, ...props }) => (
                <ol {...props} className="mt-2 list-inside list-decimal first:mt-0 space-y-1" />
              ),
              li: ({ node, ...props }) => <li {...props} className="ml-4" />,
              code: ({ node, ...props }) => {
                const { inline } = node as any;
                return (
                  <code
                    {...props}
                    className={cn(
                      "rounded px-1.5 py-0.5",
                      inline ? "inline-block" : "block mt-2 p-2",
                      isAiMessage 
                        ? "bg-gray-100 dark:bg-gray-700 text-purple-600 dark:text-purple-400"
                        : "bg-white/20 text-white"
                    )}
                  />
                );
              },
              pre: ({ node, ...props }) => (
                <pre {...props} className="bg-gray-100 dark:bg-gray-700 rounded p-3 overflow-auto mt-2 text-sm" />
              ),
              h1: ({ node, ...props }) => <h1 {...props} className="text-xl font-bold mt-3 first:mt-0" />,
              h2: ({ node, ...props }) => <h2 {...props} className="text-lg font-bold mt-2 first:mt-0" />,
              h3: ({ node, ...props }) => <h3 {...props} className="text-base font-bold mt-2 first:mt-0" />,
              strong: ({ node, ...props }) => <strong {...props} className="font-bold" />,
              blockquote: ({ node, ...props }) => (
                <blockquote {...props} className="border-l-4 border-gray-300 dark:border-gray-600 pl-3 italic my-2" />
              ),
            }}
          >
            {content}
          </ReactMarkdown>
        </div>
        
        {/* Copy Button */}
        <button
          onClick={() => onCopy(content, id)}
          className={cn(
            "absolute -bottom-1 right-2 p-1.5 rounded-md transition-all duration-200",
            "opacity-0 group-hover:opacity-100",
            "bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600",
            "border border-gray-300 dark:border-gray-600"
          )}
          title="Copy message"
        >
          {isCopied ? (
            <Check size={14} className="text-green-600 dark:text-green-400" />
          ) : (
            <Copy size={14} className="text-gray-600 dark:text-gray-400" />
          )}
        </button>
      </div>
    </div>
  );
}
