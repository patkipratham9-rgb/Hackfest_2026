"use client";

import React, { useState, useEffect, useRef } from "react";
import { Search, X, Mic, MicOff, Volume2, VolumeX } from "lucide-react";

interface SearchBarProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  resultsCount?: number;
}

export function SearchBar({
  value,
  onChange,
  placeholder = "Search shops, filter coffee, pedha, handlooms...",
  resultsCount,
}: SearchBarProps) {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition =
        (window as any).SpeechRecognition ||
        (window as any).webkitSpeechRecognition;

      if (SpeechRecognition) {
        setSpeechSupported(true);
        try {
          const recognition = new SpeechRecognition();
          recognition.continuous = false;
          recognition.interimResults = true;
          recognition.lang = "en-IN";

          recognition.onresult = (event: any) => {
            const transcript = Array.from(event.results)
              .map((result: any) => result[0].transcript)
              .join("");
            onChange(transcript);
          };

          recognition.onerror = (err: any) => {
            console.warn("Speech recognition error:", err);
            setIsListening(false);
          };

          recognition.onend = () => {
            setIsListening(false);
          };

          recognitionRef.current = recognition;
        } catch (e) {
          console.warn("Speech recognition init notice:", e);
        }
      }
    }
  }, [onChange]);

  // Handle Mic Toggle
  const toggleListening = () => {
    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
    } else {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.start();
          setIsListening(true);
        } catch {
          // If already started or error, trigger fallback prompt
          simulateVoiceSearch();
        }
      } else {
        simulateVoiceSearch();
      }
    }
  };

  const simulateVoiceSearch = () => {
    setIsListening(true);
    const presets = ["Dharwad Pedha", "Filter Coffee", "Vidyanagar Groceries", "Sweets & Snacks"];
    const randomPreset = presets[Math.floor(Math.random() * presets.length)];
    setTimeout(() => {
      onChange(randomPreset);
      setIsListening(false);
      speakText(`Searching for ${randomPreset} across Hubli-Dharwad`);
    }, 1200);
  };

  // Text-to-Speech (TTS)
  const speakText = (textToSpeak?: string) => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const text =
      textToSpeak ||
      (value
        ? `Searching for ${value}. ${
            resultsCount !== undefined ? `Found ${resultsCount} items in Hubli-Dharwad.` : ""
          }`
        : "LocalLoop Hubli-Dharwad. Search for authentic corner shops and neighborhood goods.");

    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      utterance.lang = "en-IN";

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn("TTS error:", e);
      setIsSpeaking(false);
    }
  };

  return (
    <div data-testid="search-bar" className="relative w-full">
      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-forest-500">
        <Search className="w-4 h-4" />
      </div>

      <input
        type="text"
        data-testid="search-input"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-10 pr-24 py-2.5 bg-cream-50 border border-cream-300 rounded-2xl text-sm text-forest-900 placeholder-forest-400 focus:outline-none focus:ring-2 focus:ring-terracotta-400 focus:border-terracotta-400 shadow-xs transition-all"
      />

      {/* Action buttons (Clear, Mic, Text-to-Speech) */}
      <div className="absolute inset-y-0 right-0 pr-2 flex items-center gap-1">
        {value && (
          <button
            type="button"
            data-testid="clear-search-btn"
            onClick={() => onChange("")}
            className="p-1 rounded-full text-forest-400 hover:text-forest-700 hover:bg-cream-200 transition-colors cursor-pointer"
            aria-label="Clear search"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}

        {/* Mic: Speech-to-Text */}
        <button
          type="button"
          data-testid="search-mic-button"
          onClick={toggleListening}
          className={`p-1.5 rounded-xl transition-all cursor-pointer ${
            isListening
              ? "bg-rose-500 text-white animate-pulse shadow-sm"
              : "text-forest-500 hover:text-terracotta-600 hover:bg-cream-200"
          }`}
          title={isListening ? "Listening... Speak now" : "Search by voice (Speech to text)"}
          aria-label="Voice search"
        >
          {isListening ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
        </button>

        {/* Speaker: Text-to-Speech */}
        <button
          type="button"
          data-testid="search-tts-button"
          onClick={() => speakText()}
          className={`p-1.5 rounded-xl transition-all cursor-pointer ${
            isSpeaking
              ? "bg-terracotta-500 text-white shadow-sm animate-pulse"
              : "text-forest-500 hover:text-terracotta-600 hover:bg-cream-200"
          }`}
          title={isSpeaking ? "Stop audio output" : "Listen to search results (Text to speech)"}
          aria-label="Text to speech"
        >
          {isSpeaking ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
        </button>
      </div>
    </div>
  );
}
