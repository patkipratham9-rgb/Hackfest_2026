"use client";

import React, { useState, useRef, useEffect } from "react";
import { usePathname } from "next/navigation";
import {
  Bot,
  X,
  Send,
  Sparkles,
  ShieldCheck,
  Truck,
  Store,
  CreditCard,
  MessageSquare,
  ChevronDown,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ChatMessage {
  id: string;
  sender: "bot" | "user";
  text: string;
  time: string;
  engine?: string;
}

export function LocalLoopAssistantBot() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "msg_welcome",
      sender: "bot",
      text: "Namaskara! I am your 24/7 LocalLoop Concierge. Connecting you with authentic corner shops across Hubli-Dharwad. How can I help you today?",
      time: "Just now",
      engine: "Google Dialogflow",
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  if (pathname?.startsWith("/login") || pathname?.startsWith("/merchant/login")) {
    return null;
  }

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || input).trim();
    if (!text) return;

    const userMsg: ChatMessage = {
      id: `usr_${Date.now()}`,
      sender: "user",
      text,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    try {
      const res = await fetch("/api/ai/integrations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "dialogflow_message",
          payload: { message: text },
        }),
      });

      const data = await res.json();
      const botResponse =
        data.data?.fulfillmentText ||
        "I am always here to assist you with orders, delivery options, or finding neighborhood shops in Hubli-Dharwad.";

      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            id: `bot_${Date.now()}`,
            sender: "bot",
            text: botResponse,
            time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            engine: "Google Dialogflow",
          },
        ]);
        setIsTyping(false);
      }, 500);
    } catch {
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            id: `bot_${Date.now()}`,
            sender: "bot",
            text: "LocalLoop offers 1. Home Delivery to your doorstep and 2. Express Store Pick-up. Payments are securely processed via Cashfree PG.",
            time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            engine: "Google Dialogflow",
          },
        ]);
        setIsTyping(false);
      }, 500);
    }
  };

  return (
    <>
      {/* Floating Trigger Button in Bottom Right */}
      <div className="fixed bottom-20 right-4 sm:bottom-6 sm:right-6 z-40">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsOpen(!isOpen)}
          data-testid="localloop-assistant-bot-button"
          className="relative flex items-center gap-2.5 px-4 py-3 rounded-full bg-forest-900 text-cream-100 shadow-floating hover:bg-forest-800 border border-forest-700 transition-all cursor-pointer"
          aria-label="Open 24/7 LocalLoop Bot"
        >
          <div className="relative">
            <Bot className="w-5 h-5 text-terracotta-400" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-500" />
          </div>
          <span className="font-serif font-bold text-xs tracking-wide hidden sm:inline">
            LocalLoop AI Concierge
          </span>
          <span className="text-[10px] bg-forest-800 text-emerald-300 px-1.5 py-0.5 rounded-md font-mono hidden md:inline">
            24/7 Active
          </span>
        </motion.button>
      </div>

      {/* Slide-Up Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="localloop-assistant-bot-drawer"
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            data-testid="localloop-assistant-bot-drawer"
            className="fixed bottom-24 right-4 sm:bottom-20 sm:right-6 z-50 w-[92vw] sm:w-96 max-h-[520px] h-[500px] flex flex-col bg-cream-50 rounded-3xl border border-cream-300 shadow-floating overflow-hidden"
          >
            {/* Header */}
            <div className="p-3.5 bg-forest-900 text-cream-100 flex items-center justify-between border-b border-forest-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-forest-800 flex items-center justify-center border border-forest-700 text-terracotta-400">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-serif font-bold text-sm text-cream-50 flex items-center gap-1.5">
                    <span>LocalLoop 24/7 Concierge</span>
                  </h4>
                  <p className="text-[10px] text-cream-300 flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-emerald-400" />
                    <span>24/7 Sift Shield • Dialogflow &amp; Gemini</span>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-full text-cream-300 hover:text-white hover:bg-forest-800 transition-colors"
                aria-label="Close Bot"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Action Chips */}
            <div className="p-2 bg-cream-100 border-b border-cream-200 flex items-center gap-1.5 overflow-x-auto text-[11px] scrollbar-none">
              <button
                onClick={() => handleSendMessage("What are the delivery options?")}
                className="px-2.5 py-1 rounded-xl bg-white text-forest-800 border border-cream-300 hover:border-terracotta-400 shrink-0 flex items-center gap-1 cursor-pointer transition-colors"
              >
                <Truck className="w-3 h-3 text-terracotta-600" />
                <span>Delivery Options</span>
              </button>
              <button
                onClick={() => handleSendMessage("How is Cashfree payment handled?")}
                className="px-2.5 py-1 rounded-xl bg-white text-forest-800 border border-cream-300 hover:border-terracotta-400 shrink-0 flex items-center gap-1 cursor-pointer transition-colors"
              >
                <CreditCard className="w-3 h-3 text-terracotta-600" />
                <span>Cashfree Payment</span>
              </button>
              <button
                onClick={() => handleSendMessage("Recommend popular items in Vidyanagar")}
                className="px-2.5 py-1 rounded-xl bg-white text-forest-800 border border-cream-300 hover:border-terracotta-400 shrink-0 flex items-center gap-1 cursor-pointer transition-colors"
              >
                <Sparkles className="w-3 h-3 text-terracotta-600" />
                <span>Recommendations</span>
              </button>
            </div>

            {/* Messages Scroll View */}
            <div className="flex-1 p-3 overflow-y-auto space-y-3 bg-cream-50">
              {messages.map((m, idx) => (
                <div
                  key={m.id || `bot-msg-${idx}`}
                  className={`flex flex-col ${m.sender === "user" ? "items-end" : "items-start"}`}
                >
                  <div
                    className={`max-w-[85%] p-3 rounded-2xl text-xs leading-relaxed ${
                      m.sender === "user"
                        ? "bg-terracotta-500 text-white rounded-br-xs"
                        : "bg-white text-forest-900 border border-cream-300 rounded-bl-xs shadow-2xs"
                    }`}
                  >
                    <p>{m.text}</p>
                    {m.engine && (
                      <p className="mt-1 text-[9px] text-forest-400 font-mono flex items-center gap-1">
                        <Sparkles className="w-2.5 h-2.5 text-terracotta-500" />
                        <span>Powered by {m.engine}</span>
                      </p>
                    )}
                  </div>
                  <span className="text-[9px] text-forest-400 px-1 mt-0.5">{m.time}</span>
                </div>
              ))}

              {isTyping && (
                <div className="flex items-center gap-1.5 p-2 rounded-2xl bg-white border border-cream-200 w-fit">
                  <div className="w-1.5 h-1.5 rounded-full bg-forest-600 animate-bounce" />
                  <div className="w-1.5 h-1.5 rounded-full bg-forest-600 animate-bounce [animation-delay:0.2s]" />
                  <div className="w-1.5 h-1.5 rounded-full bg-forest-600 animate-bounce [animation-delay:0.4s]" />
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Form */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="p-2.5 bg-white border-t border-cream-300 flex items-center gap-2"
            >
              <input
                type="text"
                data-testid="bot-input-field"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask anything about stores, orders, delivery..."
                className="flex-1 px-3 py-2 bg-cream-100 border border-cream-300 rounded-xl text-xs text-forest-900 placeholder-forest-400 focus:outline-none focus:ring-2 focus:ring-terracotta-400"
              />
              <button
                type="submit"
                data-testid="bot-send-button"
                disabled={!input.trim()}
                className="p-2 rounded-xl bg-forest-900 text-cream-100 hover:bg-forest-800 disabled:opacity-50 transition-colors cursor-pointer"
                aria-label="Send message"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
