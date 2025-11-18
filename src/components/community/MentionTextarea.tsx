import { useState, useRef, useEffect, KeyboardEvent, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Textarea } from '@/components/ui/textarea';
import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList } from '@/components/ui/command';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { debounce } from 'lodash';

type Mention = {
  id: string;
  username: string;
  avatar_url: string | null;
};

type MentionTextareaProps = {
  value: string;
  onChange: (value: string, mentionedUsers: string[]) => void;
  onKeyDown?: (e: KeyboardEvent<HTMLTextAreaElement>) => void;
  placeholder?: string;
  className?: string;
  maxLength?: number;
};

export const MentionTextarea = ({
  value,
  onChange,
  onKeyDown,
  placeholder,
  className,
  maxLength
}: MentionTextareaProps) => {
  const [showMentions, setShowMentions] = useState(false);
  const [mentionSearch, setMentionSearch] = useState('');
  const [candidates, setCandidates] = useState<Mention[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [cursorPosition, setCursorPosition] = useState(0);

  // Debounced search function to avoid querying on every keystroke
  const debouncedSearch = useCallback(
    debounce(async (search: string) => {
      if (!search) {
        setCandidates([]);
        return;
      }
      
      const { data } = await supabase
        .from('profiles')
        .select('id, username, avatar_url')
        .ilike('username', `%${search}%`)
        .not('username', 'is', null)
        .limit(5);

      setCandidates(data || []);
    }, 300),
    []
  );

  useEffect(() => {
    if (mentionSearch) {
      debouncedSearch(mentionSearch);
    } else {
      setCandidates([]);
    }
  }, [mentionSearch, debouncedSearch]);

  const handleTextChange = (text: string) => {
    const cursorPos = textareaRef.current?.selectionStart || 0;
    setCursorPosition(cursorPos);

    // Check if we're typing a mention
    const textBeforeCursor = text.substring(0, cursorPos);
    const lastAtIndex = textBeforeCursor.lastIndexOf('@');
    
    if (lastAtIndex !== -1) {
      const textAfterAt = textBeforeCursor.substring(lastAtIndex + 1);
      
      // Only show mentions if there's no space after @
      if (!textAfterAt.includes(' ')) {
        setMentionSearch(textAfterAt);
        setShowMentions(true);
        setSelectedIndex(0);
      } else {
        setShowMentions(false);
      }
    } else {
      setShowMentions(false);
    }

    // Extract mentioned usernames from text (don't look up IDs on every keystroke)
    const mentionPattern = /@(\w+)/g;
    const matches = [...text.matchAll(mentionPattern)];
    const usernames = matches.map(m => m[1]);
    
    // Pass the text and empty array - parent can look up IDs on submit
    onChange(text, []);
  };

  const insertMention = (candidate: Mention) => {
    if (!textareaRef.current) return;

    const textBeforeCursor = value.substring(0, cursorPosition);
    const textAfterCursor = value.substring(cursorPosition);
    const lastAtIndex = textBeforeCursor.lastIndexOf('@');

    const newText = 
      value.substring(0, lastAtIndex) + 
      `@${candidate.username} ` + 
      textAfterCursor;

    setShowMentions(false);
    setMentionSearch('');
    
    onChange(newText, []);

    // Focus back on textarea
    setTimeout(() => {
      textareaRef.current?.focus();
      const newCursorPos = lastAtIndex + candidate.username!.length + 2;
      textareaRef.current?.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (showMentions && candidates.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < candidates.length - 1 ? prev + 1 : 0
        );
        return;
      }
      
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : candidates.length - 1
        );
        return;
      }
      
      if (e.key === 'Enter' && !e.shiftKey && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        insertMention(candidates[selectedIndex]);
        return;
      }
      
      if (e.key === 'Escape') {
        e.preventDefault();
        setShowMentions(false);
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
        onChange={(e) => handleTextChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className={className}
        maxLength={maxLength}
      />
      
      {showMentions && candidates.length > 0 && (
        <div className="absolute bottom-full left-0 right-0 mb-2 z-50">
          <Command className="rounded-lg border shadow-md">
            <CommandList>
              <CommandEmpty>No candidates found.</CommandEmpty>
              <CommandGroup heading="Mention candidate">
                {candidates.map((candidate, index) => (
                  <CommandItem
                    key={candidate.id}
                    onSelect={() => insertMention(candidate)}
                    className={index === selectedIndex ? 'bg-accent' : ''}
                  >
                    <Avatar className="h-6 w-6 mr-2">
                      <AvatarImage src={candidate.avatar_url || undefined} />
                      <AvatarFallback>
                        {candidate.username?.[0]?.toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="font-medium">@{candidate.username}</div>
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