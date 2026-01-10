"use client";

import * as React from "react";
import { SendHorizonal, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface ChatInputProps {
  /** Callback triggered when the user submits a message. */
  onSend: (message: string) => void;
  /** Callback triggered when the user stops the current processing. */
  onStop: () => void;
  /** Disables input and button during active processing. */
  isLoading: boolean;
}

/**
 * Provides the user input interface for the chat session.
 * Handles auto-resizing text area and keyboard submission events.
 */
export function ChatInput({ onSend, onStop, isLoading }: ChatInputProps) {
  const [input, setInput] = React.useState("");

  /**
   * Handles keyboard events to allow submission via Enter key.
   * Shift+Enter preserves default newline behavior.
   */
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSend = () => {
    if (input.trim() === "" || isLoading) return;
    onSend(input);
    setInput("");
  };

  return (
    <div className="relative flex items-end gap-2 p-4 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <Textarea
        placeholder="Ask a question about your documents..."
        className="min-h-[60px] w-full resize-none rounded-xl border-border bg-muted/50 pr-12 focus-visible:ring-1 focus-visible:ring-primary"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={isLoading} // Optional: disable typing while generating
        rows={1}
      />
      
      {isLoading ? (
        <Button
          size="icon"
          variant="destructive" // Red/Destructive color for Stop
          className="absolute right-6 bottom-6 h-8 w-8 rounded-full transition-all hover:bg-destructive/90"
          onClick={onStop}
        >
          <Square className="h-3 w-3 fill-current" />
          <span className="sr-only">Stop generating</span>
        </Button>
      ) : (
        <Button
          size="icon"
          className="absolute right-6 bottom-6 h-8 w-8 rounded-full transition-all"
          onClick={handleSend}
          disabled={input.trim() === ""}
        >
          <SendHorizonal className="h-4 w-4" />
          <span className="sr-only">Send message</span>
        </Button>
      )}
    </div>
  );
}