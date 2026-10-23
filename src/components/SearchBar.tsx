"use client";

import React from "react";
import { Search, X } from "lucide-react";

interface SearchBarProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
}

export function SearchBar({
  value,
  onChange,
  placeholder = "Search shops, filter coffee, pedha, handlooms...",
}: SearchBarProps) {
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
        className="w-full pl-10 pr-9 py-2.5 bg-cream-50 border border-cream-300 rounded-2xl text-sm text-forest-900 placeholder-forest-400 focus:outline-none focus:ring-2 focus:ring-terracotta-400 focus:border-terracotta-400 shadow-xs transition-all"
      />
      {value && (
        <button
          data-testid="clear-search-btn"
          onClick={() => onChange("")}
          className="absolute inset-y-0 right-0 pr-3 flex items-center text-forest-400 hover:text-forest-700 transition-colors"
          aria-label="Clear search"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
