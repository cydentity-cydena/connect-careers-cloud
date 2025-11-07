import { useState, useRef, useEffect } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList } from '@/components/ui/command';

type User = {
  id: string;
  username: string;
  full_name: string | null;
  avatar_url: string | null;
};

type MentionTextareaProps = {
  value: string;
  onChange: (value: string) => void;
  onMentionsChange: (mentionedUserIds: string[]) => void;
  placeholder?: string;
  maxLength?: number;
  className?: string;
  onKeyDown?: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
};

export const MentionTextarea = ({
  value,
  onChange,
  onMentionsChange,
  placeholder,
  maxLength,
  className,
  onKeyDown
}: MentionTextareaProps) => {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<User[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [cursorPosition, setCursorPosition] = useState<{ top: number; left: number } | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [mentionedUsers, setMentionedUsers] = useState<Map<string, string>>(new Map());
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (searchQuery && showSuggestions) {
      fetchUsers(searchQuery);
    }
  }, [searchQuery, showSuggestions]);

  const fetchUsers = async (query: string) => {
    const { data } = await supabase
      .from('profiles')
      .select('id, username, full_name, avatar_url')
      .or(`username.ilike.%${query}%,full_name.ilike.%${query}%`)
      .limit(5);

    if (data) {
      setSuggestions(data.filter(u => u.username));
    }
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    const cursorPos = e.target.selectionStart;
    
    onChange(newValue);
    
    // Check if @ was just typed
    const textBeforeCursor = newValue.substring(0, cursorPos);
    const lastAtIndex = textBeforeCursor.lastIndexOf('@');
    
    if (lastAtIndex !== -1) {
      const textAfterAt = textBeforeCursor.substring(lastAtIndex + 1);
      
      // Check if there's a space after @ (which would end the mention)
      if (!textAfterAt.includes(' ') && !textAfterAt.includes('\n')) {
        setSearchQuery(textAfterAt);
        setShowSuggestions(true);
        setSelectedIndex(0);
        
        // Calculate cursor position for dropdown
        const lines = textBeforeCursor.split('\n');
        const currentLine = lines.length;
        const lineHeight = 20; // approximate
        
        setCursorPosition({
          top: currentLine * lineHeight,
          left: 0
        });
      } else {
        setShowSuggestions(false);
      }
    } else {
      setShowSuggestions(false);
    }
  };

  const insertMention = (user: User) => {
    if (!textareaRef.current) return;
    
    const cursorPos = textareaRef.current.selectionStart;
    const textBeforeCursor = value.substring(0, cursorPos);
    const textAfterCursor = value.substring(cursorPos);
    const lastAtIndex = textBeforeCursor.lastIndexOf('@');
    
    const username = `@${user.username}`;
    const newValue = 
      textBeforeCursor.substring(0, lastAtIndex) + 
      username + ' ' +
      textAfterCursor;
    
    onChange(newValue);
    
    // Track mentioned user
    const newMentionedUsers = new Map(mentionedUsers);
    newMentionedUsers.set(user.username, user.id);
    setMentionedUsers(newMentionedUsers);
    onMentionsChange(Array.from(newMentionedUsers.values()));
    
    setShowSuggestions(false);
    
    // Set cursor position after the mention
    setTimeout(() => {
      if (textareaRef.current) {
        const newCursorPos = lastAtIndex + username.length + 1;
        textareaRef.current.setSelectionRange(newCursorPos, newCursorPos);
        textareaRef.current.focus();
      }
    }, 0);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (showSuggestions && suggestions.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % suggestions.length);
        return;
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => (prev - 1 + suggestions.length) % suggestions.length);
        return;
      }
      if (e.key === 'Enter') {
        e.preventDefault();
        insertMention(suggestions[selectedIndex]);
        return;
      }
      if (e.key === 'Escape') {
        e.preventDefault();
        setShowSuggestions(false);
        return;
      }
    }
    
    onKeyDown?.(e);
  };

  return (
    <div className="relative">
      <Textarea
        ref={textareaRef}
        value={value}
        onChange={handleTextChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className={className}
        maxLength={maxLength}
      />
      
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-50 w-64 bg-popover border rounded-md shadow-md mt-1">
          <Command>
            <CommandList>
              <CommandGroup>
                {suggestions.map((user, index) => (
                  <CommandItem
                    key={user.id}
                    onSelect={() => insertMention(user)}
                    className={index === selectedIndex ? 'bg-accent' : ''}
                  >
                    <div className="flex items-center gap-2">
                      {user.avatar_url && (
                        <img 
                          src={user.avatar_url} 
                          alt={user.username} 
                          className="w-6 h-6 rounded-full"
                        />
                      )}
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">@{user.username}</span>
                        {user.full_name && (
                          <span className="text-xs text-muted-foreground">{user.full_name}</span>
                        )}
                      </div>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </div>
      )}
    </div>
  );
};