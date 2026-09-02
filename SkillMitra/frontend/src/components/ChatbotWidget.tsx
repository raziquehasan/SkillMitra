"use client";

import { useState, useRef, useEffect } from "react";
import { X, Send } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import ReactMarkdown from "react-markdown";

// Custom event for opening chatbot
declare global {
  interface WindowEventMap {
    'openSkillMitraChat': CustomEvent;
  }
}

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface ChatbotResponse {
  answer: string;
  sources: string[];
  data_context: Record<string, any>;
  language: string;
  fallback?: boolean;
}

// Custom SkillMitra AI Icon - Chat bubble with sparkle
const SkillMitraAIIcon = ({ className }: { className?: string }) => (
  <svg 
    viewBox="0 0 24 24" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    {/* Chat bubble */}
    <path 
      d="M21 11.5C21.0034 12.8199 20.6951 14.1219 20.1 15.3C19.3944 16.7118 18.3098 17.8992 16.9674 18.7293C15.6251 19.5594 14.0782 19.9994 12.5 20C11.1801 20.0035 9.87812 19.6951 8.7 19.1L3 21L4.9 15.3C4.30493 14.1219 3.99656 12.8199 4 11.5C4.00061 9.92179 4.44061 8.37488 5.27072 7.03258C6.10083 5.69028 7.28825 4.6056 8.7 3.90003C9.87812 3.30496 11.1801 2.99659 12.5 3.00003H13C15.0843 3.11502 17.053 3.99479 18.5291 5.47089C20.0052 6.94699 20.885 8.91568 21 11V11.5Z" 
      fill="currentColor"
    />
    {/* Sparkle */}
    <path 
      d="M12 8L13.5 11L12 14L10.5 11L12 8Z" 
      fill="white"
    />
    <circle 
      cx="16" 
      cy="8" 
      r="1.5" 
      fill="white"
    />
    <circle 
      cx="8" 
      cy="8" 
      r="1" 
      fill="white"
    />
  </svg>
);

export default function ChatbotWidget() {
  const { t, language } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const currentLanguage = language as "en" | "hi" | "mr";

  const quickQuestions = [
    t("chatbot.quickQuestions.skillsHighDemand"),
    t("chatbot.quickQuestions.skillsFutureDemand"),
    t("chatbot.quickQuestions.chooseCourse"),
    t("chatbot.quickQuestions.matchSkills"),
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  // Listen for custom event to open chatbot
  useEffect(() => {
    const handleOpenChat = () => setIsOpen(true);
    window.addEventListener('openSkillMitraChat', handleOpenChat);
    return () => window.removeEventListener('openSkillMitraChat', handleOpenChat);
  }, []);

  const detectLanguage = (text: string): "en" | "hi" | "mr" => {
    // Simple language detection based on script and common words
    const devanagariPattern = /[\u0900-\u097F]/;
    
    if (!devanagariPattern.test(text)) return "en";
    
    // Differentiate Hindi vs Marathi based on common words
    const marathiWords = ["मी", "तुम्ही", "कसे", "आहे", "करू", "आहो", "का", "कशी", "माझे", "तुमचे"];
    const hindiWords = ["मैं", "तुम", "कैसे", "है", "करूं", "हो", "क्यों", "कैसी", "मेरे", "तुम्हारे"];
    
    const marathiCount = marathiWords.filter(word => text.includes(word)).length;
    const hindiCount = hindiWords.filter(word => text.includes(word)).length;
    
    if (marathiCount > hindiCount) return "mr";
    if (hindiCount > marathiCount) return "hi";
    
    // Default to Hindi if Devanagari script detected but can't differentiate
    // (Changed from Marathi to Hindi as a safer default)
    return "hi";
  };

  const sendMessage = async (message: string) => {
    if (!message.trim() || isLoading) return;

    const detectedLang = detectLanguage(message);
    // DO NOT change the website language based on user input
    // Only use detected language for AI response

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: message,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/ai/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: message,
          context: {},
          language: detectedLang,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to get response");
      }

      const data: ChatbotResponse = await response.json();

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.answer,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Error sending message:", error);
      
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: t("chatbot.fallback"),
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickQuestion = (question: string) => {
    sendMessage(question);
  };

  const getWelcomeMessage = () => {
    return t("chatbot.welcome");
  };

  const getSubtitle = () => {
    return t("chatbot.subtitle");
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 bg-[#123b68] text-white w-14 h-14 rounded-full shadow-lg hover:bg-[#0d2d52] transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-[#c2410c] focus:ring-offset-2 flex items-center justify-center"
        aria-label={t("chatbot.title")}
        title={t("chatbot.ask")}
      >
        <SkillMitraAIIcon className="w-7 h-7" />
      </button>
    );
  }

  // When open, hide the floating button and show the chat panel
  return (
    <>
      {/* Mobile: Floating button is hidden when chat is open */}
      {/* Desktop: Floating button is hidden when chat is open */}
      
      <div className="fixed z-50 w-full max-w-md bottom-0 right-0 left-0 md:bottom-24 md:right-6 md:w-auto md:left-auto md:max-w-md">
        <div className="bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col md:rounded-xl rounded-t-xl h-[85vh] md:h-[560px]">
          {/* Header */}
          <div className="bg-[#123b68] text-white p-4 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2.5 rounded-lg">
              <SkillMitraAIIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-base leading-tight">{t("chatbot.title")}</h3>
              <p className="text-xs text-white/80 mt-0.5 leading-snug">{getSubtitle()}</p>
            </div>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="text-white/80 hover:text-white transition-colors p-1.5 hover:bg-white/10 rounded focus:outline-none focus:ring-2 focus:ring-white/50"
            aria-label={t("chatbot.close")}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 bg-slate-50">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center px-4">
              <div className="bg-[#123b68] p-3 rounded-full mb-4">
                <SkillMitraAIIcon className="w-8 h-8 text-white" />
              </div>
              <p className="text-slate-700 font-medium mb-2 text-base leading-relaxed">{getWelcomeMessage()}</p>
              
              {/* Quick Questions */}
              <div className="grid grid-cols-1 gap-2 w-full mt-4">
                {quickQuestions.map((question, index) => (
                  <button
                    key={index}
                    onClick={() => handleQuickQuestion(question)}
                    className="text-left p-3 bg-white border border-slate-200 rounded-lg hover:border-[#123b68] hover:bg-[#123b68]/5 transition-all text-sm text-slate-700 hover:text-[#123b68] min-h-[44px] flex items-center"
                  >
                    {question}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-3 mb-4 ${
                message.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              {message.role === "assistant" && (
                <div className="bg-[#123b68] p-2 rounded-full flex-shrink-0">
                  <SkillMitraAIIcon className="w-4 h-4 text-white" />
                </div>
              )}
              
              <div
                className={`max-w-[80%] p-3 rounded-lg ${
                  message.role === "user"
                    ? "bg-[#123b68] text-white"
                    : "bg-white border border-slate-200 text-slate-700"
                }`}
              >
                {message.role === "assistant" ? (
                  <div className="text-sm prose prose-sm prose-slate max-w-none leading-relaxed prose-headings:font-semibold prose-headings:text-slate-800 prose-headings:mt-1 prose-headings:mb-2 prose-p:my-1 prose-ul:my-1 prose-li:my-0">
                    <ReactMarkdown>{message.content}</ReactMarkdown>
                  </div>
                ) : (
                  <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.content}</p>
                )}
                <p className="text-xs mt-1 opacity-60">
                  {message.timestamp.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>

            </div>
          ))}

          {isLoading && (
            <div className="flex gap-3 mb-4 justify-start">
              <div className="bg-[#123b68] p-2 rounded-full flex-shrink-0">
                <SkillMitraAIIcon className="w-4 h-4 text-white" />
              </div>
              <div className="bg-white border border-slate-200 p-3 rounded-lg">
                <p className="mb-2 text-xs text-slate-600">{t("chatbot.loading")}</p>
                <div className="flex gap-1" aria-label={t("chatbot.loading")}>
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-100" />
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-200" />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t border-slate-200 bg-white flex-shrink-0">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              sendMessage(inputValue);
            }}
            className="flex gap-2"
          >
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={t("chatbot.placeholder")}
              className="flex-1 px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#123b68] focus:border-transparent text-sm placeholder:text-slate-400 disabled:bg-slate-100"
              disabled={isLoading}
              style={{ minHeight: '44px' }}
            />
            <button
              type="submit"
              disabled={!inputValue.trim() || isLoading}
              className="bg-[#123b68] text-white p-2.5 rounded-lg hover:bg-[#0d2d52] disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-[#123b68] focus:ring-offset-2"
              aria-label={t("chatbot.sendMessage")}
              style={{ minHeight: '44px', minWidth: '44px' }}
            >
              <Send className="w-5 h-5" />
            </button>
          </form>
        </div>
      </div>
    </div>
    </>
  );
}