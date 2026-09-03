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

// Custom SkillMitra AI Icon - Professional AI assistant with chat bubble and spark
const SkillMitraAIIcon = ({ className }: { className?: string }) => (
  <svg 
    viewBox="0 0 24 24" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    {/* Modern chat bubble shape */}
    <path 
      d="M12 2C6.48 2 2 6.48 2 12C2 13.54 2.35 15 2.93 16.31L2 21L6.69 20.07C8 20.65 9.46 21 11 21C16.52 21 21 16.52 21 11C21 5.48 16.52 1 11 1H12Z" 
      fill="currentColor"
    />
    {/* AI brain/network spark - represents intelligence */}
    <path 
      d="M12 6C13.66 6 15 7.34 15 9C15 10.66 13.66 12 12 12C10.34 12 9 10.66 9 9C9 7.34 10.34 6 12 6Z" 
      fill="white"
    />
    {/* Central AI spark - represents intelligence */}
    <path 
      d="M12 7.5L12.3 8.7L13.5 9L12.3 9.3L12 10.5L11.7 9.3L10.5 9L11.7 8.7L12 7.5Z" 
      fill="#123b68"
    />
    {/* Neural connection lines - represents AI */}
    <path 
      d="M12 12V15M9 13.5L12 15L15 13.5" 
      stroke="white" 
      strokeWidth="1.5" 
      strokeLinecap="round"
    />
    {/* Outer sparkles - represents AI activity */}
    <circle cx="8" cy="7" r="1" fill="white" />
    <circle cx="16" cy="7" r="1" fill="white" />
    <circle cx="12" cy="16" r="1" fill="white" />
  </svg>
);

export default function ChatbotWidget() {
  const { t, language } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [hasOpenedBefore, setHasOpenedBefore] = useState(false);
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

  // Launcher — when chat is closed
  if (!isOpen) {
    return (
      <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 flex flex-col items-end gap-2">
        {/* Tooltip - shown only on first visit */}
        {!hasOpenedBefore && (
          <div className="bg-[#123b68] text-white px-4 py-2 rounded-lg shadow-lg text-[15px] font-medium mb-2 mr-2 animate-pulse max-w-[200px] text-center">
            {t("chatbot.ask")}
          </div>
        )}

        <button
          onClick={() => {
            setIsOpen(true);
            setHasOpenedBefore(true);
          }}
          className="bg-[#123b68] text-white rounded-full shadow-lg hover:bg-[#0d2d52] transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-[#c2410c] focus:ring-offset-2 flex items-center justify-center"
          style={{ width: '60px', height: '60px', minWidth: '44px', minHeight: '44px' }}
          aria-label="Open SkillMitra AI"
          title={t("chatbot.ask")}
        >
          <SkillMitraAIIcon className="w-7 h-7" />
        </button>
      </div>
    );
  }

  // Chat panel — when open
  // Mobile (<640px): left:12px right:12px auto-width → fits any viewport ≥320px
  // Desktop (≥640px): fixed 420px anchored to bottom-right
  return (
    <>
      {/* Outer positioning wrapper */}
      <div
        className="fixed z-50"
        style={{
          // Mobile default: 12px safe margin both sides
          bottom: 0,
          left: '12px',
          right: '12px',
          width: 'auto',
          maxWidth: 'calc(100vw - 24px)',
        }}
      >
        {/* Responsive overrides via a scoped style tag */}
        <style>{`
          @media (min-width: 640px) {
            .chatbot-panel-positioner {
              left: auto !important;
              right: 24px !important;
              bottom: 96px !important;
              width: 420px !important;
              max-width: 420px !important;
            }
          }
        `}</style>

        {/* Apply the responsive class to the positioner */}
        <div className="chatbot-panel-positioner" style={{ position: 'fixed', bottom: 0, left: '12px', right: '12px', width: 'auto', maxWidth: 'calc(100vw - 24px)', zIndex: 50 }}>
          {/* Chat panel inner — flex column so only messages scroll */}
          <div
            className="bg-white shadow-2xl border border-slate-200 overflow-hidden flex flex-col w-full"
            style={{
              // Mobile: top-only rounded corners (bottom flush with screen edge)
              borderRadius: '16px 16px 0 0',
              height: 'min(85dvh, 680px)',
            }}
          >
            {/* Responsive inner overrides */}
            <style>{`
              @media (min-width: 640px) {
                .chatbot-panel-inner {
                  border-radius: 16px !important;
                  height: 560px !important;
                }
              }
            `}</style>
            <div className="chatbot-panel-inner flex flex-col w-full h-full" style={{ borderRadius: '16px 16px 0 0', height: 'min(85dvh, 680px)' }}>

              {/* Header — flex-shrink-0 so it never scrolls */}
              <div className="bg-[#123b68] text-white p-3 flex items-center justify-between flex-shrink-0">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="bg-white/20 p-2 rounded-lg flex-shrink-0">
                    <SkillMitraAIIcon className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-semibold text-[16px] leading-tight truncate">{t("chatbot.title")}</h3>
                    <p className="text-[12px] text-white/80 mt-0.5 leading-snug truncate">{getSubtitle()}</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-white/80 hover:text-white transition-colors hover:bg-white/10 rounded focus:outline-none focus:ring-2 focus:ring-white/50 flex-shrink-0 flex items-center justify-center"
                  aria-label="Close SkillMitra AI"
                  style={{ minWidth: '44px', minHeight: '44px' }}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Messages — flex-1 + overflow-y-auto — ONLY this section scrolls */}
              <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 bg-slate-50 min-h-0">
                {messages.length === 0 && (
                  <div className="flex flex-col items-center justify-center h-full text-center px-2">
                    <p className="text-slate-700 font-medium mb-3 text-[15px] leading-[1.6] max-w-full">
                      {getWelcomeMessage()}
                    </p>

                    {/* Quick Questions */}
                    <div className="grid grid-cols-1 gap-2 w-full mt-4">
                      {quickQuestions.map((question, index) => (
                        <button
                          key={index}
                          onClick={() => handleQuickQuestion(question)}
                          className="text-left p-2.5 bg-white border border-slate-200 rounded-lg hover:border-[#123b68] hover:bg-[#123b68]/5 transition-all text-[14px] text-slate-700 hover:text-[#123b68] min-h-[48px] flex items-center w-full"
                        >
                          <span className="line-clamp-2 leading-snug">{question}</span>
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
                      <div className="bg-[#123b68] p-2 rounded-full flex-shrink-0 self-start">
                        <SkillMitraAIIcon className="w-4 h-4 text-white" />
                      </div>
                    )}
                    
                    <div
                      className={`max-w-[80%] p-3 rounded-lg min-w-0 ${
                        message.role === "user"
                          ? "bg-[#123b68] text-white"
                          : "bg-white border border-slate-200 text-slate-700"
                      }`}
                    >
                      {message.role === "assistant" ? (
                        <div className="text-[15px] prose prose-sm prose-slate max-w-none leading-[1.6] prose-headings:font-semibold prose-headings:text-slate-800 prose-headings:mt-2 prose-headings:mb-2 prose-p:my-2 prose-ul:my-2 prose-li:my-1">
                          <ReactMarkdown>{message.content}</ReactMarkdown>
                        </div>
                      ) : (
                        <p className="text-[15px] whitespace-pre-wrap leading-[1.6] break-words">
                          {message.content}
                        </p>
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
                      <p className="mb-2 text-[13px] text-slate-600">{t("chatbot.loading")}</p>
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

              {/* Input footer — flex-shrink-0 so it is ALWAYS visible at the bottom */}
              <div className="p-3 border-t border-slate-200 bg-white flex-shrink-0">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    sendMessage(inputValue);
                  }}
                  className="flex gap-2 w-full"
                >
                  <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder={t("chatbot.placeholder")}
                    className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#123b68] focus:border-transparent text-[15px] placeholder:text-slate-400 disabled:bg-slate-100 min-w-0"
                    disabled={isLoading}
                    style={{ height: '48px' }}
                  />
                  <button
                    type="submit"
                    disabled={!inputValue.trim() || isLoading}
                    className="bg-[#123b68] text-white rounded-lg hover:bg-[#0d2d52] disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-[#123b68] focus:ring-offset-2 flex-shrink-0 flex items-center justify-center"
                    aria-label={t("chatbot.sendMessage")}
                    style={{ height: '48px', width: '48px', minWidth: '44px', minHeight: '44px' }}
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </form>
              </div>

            </div>
          </div>
        </div>
      </div>
    </>
  );
}