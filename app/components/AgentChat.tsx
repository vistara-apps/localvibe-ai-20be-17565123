
"use client";

import { useState, useRef, useEffect } from "react";
import { ChatMessage } from "../types";
import { Send, Sparkles, MapPin } from "lucide-react";
import { clsx } from "clsx";

interface AgentChatProps {
  messages: ChatMessage[];
  onSendMessage: (message: string) => void;
  variant?: "withTools" | "compact";
  isLoading?: boolean;
}

export function AgentChat({ messages, onSendMessage, variant = "withTools", isLoading }: AgentChatProps) {
  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isCompact = variant === "compact";

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim() && !isLoading) {
      onSendMessage(inputValue.trim());
      setInputValue("");
    }
  };

  const quickPrompts = [
    { icon: "🍽️", text: "Find trending restaurants nearby" },
    { icon: "🍻", text: "Show me bars with live music" },
    { icon: "🎵", text: "What events are happening tonight?" },
    { icon: "💎", text: "Discover hidden gems" },
  ];

  return (
    <div className={clsx(
      "card flex flex-col",
      isCompact ? "h-80" : "h-96"
    )}>
      <div className="flex items-center gap-2 mb-4 pb-3 border-b border-white/10">
        <Sparkles className="w-5 h-5 text-accent" />
        <h3 className="heading text-textPrimary">LocalVibe AI</h3>
      </div>
      
      <div className="flex-1 overflow-y-auto space-y-3 mb-4">
        {messages.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-12 h-12 bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-3">
              <MapPin className="w-6 h-6 text-accent" />
            </div>
            <p className="text-textSecondary">Ask me about local spots, events, or vibes!</p>
            
            {!isCompact && (
              <div className="grid grid-cols-2 gap-2 mt-4">
                {quickPrompts.map((prompt, index) => (
                  <button
                    key={index}
                    onClick={() => onSendMessage(prompt.text)}
                    className="p-2 bg-surface/50 hover:bg-surface/80 rounded-md text-sm text-left transition-all duration-150"
                  >
                    <span className="mr-2">{prompt.icon}</span>
                    {prompt.text}
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={clsx(
                "flex",
                message.type === "user" ? "justify-end" : "justify-start"
              )}
            >
              <div
                className={clsx(
                  "max-w-[80%] p-3 rounded-lg text-sm",
                  message.type === "user"
                    ? "bg-primary text-white"
                    : "bg-surface text-textPrimary"
                )}
              >
                {message.content}
              </div>
            </div>
          ))
        )}
        
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-surface text-textPrimary p-3 rounded-lg text-sm">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-accent rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-accent rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-accent rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
      
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Ask about local spots..."
          className="input-field flex-1"
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={!inputValue.trim() || isLoading}
          className="btn-accent px-3 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
