"use client";

import { cn } from "@/lib/utils";
import { User, Bot } from "lucide-react";

/**
 * Defines the structure of a chat message within the session.
 */
export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  sources?: string[];
}

interface ChatBubbleProps {
  message: Message;
}

/**
 * Renders a single message bubble in the chat feed.
 * Differentiates styling based on the message role (user vs. assistant).
 */
export function ChatBubble({ message }: ChatBubbleProps) {
  const isUser = message.role === "user";

  return (
    <div
      className={cn(
        "flex w-full items-start gap-4 p-4",
        isUser ? "flex-row-reverse" : "flex-row"
      )}
    >
      {/* Avatar Indicator */}
      <div className="flex-shrink-0">
        <div
          className={cn(
            "flex h-8 w-8 items-center justify-center rounded-full border",
            isUser 
              ? "bg-primary text-primary-foreground border-primary" 
              : "bg-muted text-muted-foreground border-border"
          )}
        >
          {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
        </div>
      </div>

      {/* Message Body */}
      <div
        className={cn(
          "relative max-w-[80%] rounded-lg px-4 py-3 text-sm leading-relaxed",
          isUser
            ? "bg-primary text-primary-foreground"
            : "bg-muted/50 text-foreground border border-border"
        )}
      >
        <div className="whitespace-pre-wrap">{message.content}</div>
        
        {/* Source Citations */}
        {message.sources && message.sources.length > 0 && (
            <div className="mt-2 flex gap-2 pt-2 border-t border-border/50">
                <span className="text-xs font-semibold opacity-50">Sources:</span>
                {/* Source mapping implementation pending */}
            </div>
        )}
      </div>
    </div>
  );
}