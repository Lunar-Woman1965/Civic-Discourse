
'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Textarea } from '@/components/ui/textarea';

interface User {
  id: string;
  username: string;
  name: string;
}

interface MentionTextareaProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  minRows?: number;
}

export function MentionTextarea({
  value,
  onChange,
  placeholder,
  className,
  minRows = 3
}: MentionTextareaProps) {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<User[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [mentionSearch, setMentionSearch] = useState('');
  const [cursorPosition, setCursorPosition] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Search for users when @ is typed
  useEffect(() => {
    const searchMention = async () => {
      if (mentionSearch.length > 0) {
        try {
          const response = await fetch(`/api/users/search?q=${encodeURIComponent(mentionSearch)}&limit=5`);
          if (response.ok) {
            const users = await response.json();
            setSuggestions(users);
            setShowSuggestions(users.length > 0);
          }
        } catch (error) {
          console.error('Failed to search users:', error);
        }
      } else {
        setShowSuggestions(false);
        setSuggestions([]);
      }
    };

    const timeoutId = setTimeout(searchMention, 300);
    return () => clearTimeout(timeoutId);
  }, [mentionSearch]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    const cursorPos = e.target.selectionStart;
    
    onChange(newValue);
    setCursorPosition(cursorPos);

    // Detect @ mention
    const textBeforeCursor = newValue.substring(0, cursorPos);
    const lastAtIndex = textBeforeCursor.lastIndexOf('@');
    
    if (lastAtIndex !== -1) {
      const textAfterAt = textBeforeCursor.substring(lastAtIndex + 1);
      // Check if there's a space after @ (if so, not mentioning anymore)
      if (!textAfterAt.includes(' ') && textAfterAt.length < 20) {
        setMentionSearch(textAfterAt);
        return;
      }
    }
    
    // No active mention
    setMentionSearch('');
    setShowSuggestions(false);
  };

  const insertMention = (user: User) => {
    const textBeforeCursor = value.substring(0, cursorPosition);
    const textAfterCursor = value.substring(cursorPosition);
    const lastAtIndex = textBeforeCursor.lastIndexOf('@');
    
    if (lastAtIndex !== -1) {
      const beforeAt = value.substring(0, lastAtIndex);
      const newValue = `${beforeAt}@${user.username} ${textAfterCursor}`;
      onChange(newValue);
      
      // Set cursor position after the mention
      setTimeout(() => {
        if (textareaRef.current) {
          const newCursorPos = beforeAt.length + user.username.length + 2;
          textareaRef.current.setSelectionRange(newCursorPos, newCursorPos);
          textareaRef.current.focus();
        }
      }, 0);
    }
    
    setShowSuggestions(false);
    setMentionSearch('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (showSuggestions && suggestions.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % suggestions.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + suggestions.length) % suggestions.length);
      } else if (e.key === 'Enter' || e.key === 'Tab') {
        e.preventDefault();
        insertMention(suggestions[selectedIndex]);
      } else if (e.key === 'Escape') {
        setShowSuggestions(false);
      }
    }
  };

  return (
    <div className="relative">
      <Textarea
        ref={textareaRef}
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className={className}
        rows={minRows}
      />
      
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg max-h-60 overflow-auto">
          {suggestions.map((user, index) => (
            <button
              key={user.id}
              type="button"
              onClick={() => insertMention(user)}
              className={`w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 ${
                index === selectedIndex ? 'bg-gray-100 dark:bg-gray-700' : ''
              }`}
            >
              <div className="font-medium">@{user.username}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">{user.name}</div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
