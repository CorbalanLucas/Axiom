"use client";

import { useState, useRef, useEffect } from "react";
import { Sidebar } from "@/components/sidebar";
import { ChatBubble, Message } from "@/components/chat-bubble";
import { ChatInput } from "@/components/chat-input";
import { searchDocuments } from "@/lib/api";

/**
 * Main Chat Interface
 * Defines the layout structure: Fixed Sidebar + Flexible Chat Area.
 */
export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Reference to the bottom of the list for auto-scrolling
  const messagesEndRef = useRef<HTMLDivElement>(null);
  // Ref to track if the user requested to stop generation
  const abortControllerRef = useRef<boolean>(false);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const simulateStreamingResponse = async (fullText: string) => {
    const messageId = Date.now().toString();

    setMessages((prev) => [
      ...prev,
      { id: messageId, role: "assistant", content: "" },
    ]);

    const chars = fullText.split("");
    let currentText = "";

    for (let i = 0; i < chars.length; i++) {
      if (abortControllerRef.current) {
        break;
      }
      currentText += chars[i];
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === messageId ? { ...msg, content: currentText } : msg
        )
      );
      // Typing speed (5ms)
      await new Promise((resolve) => setTimeout(resolve, 5));
    }

    setIsLoading(false);
  };

  const handleStop = () => {
    abortControllerRef.current = true;
    setIsLoading(false);
  };

  const handleSendMessage = async (content: string) => {
    // Reset abort state for the new interaction
    abortControllerRef.current = false;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content,
    };
    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const results = await searchDocuments(content);

      if (abortControllerRef.current) {
        setIsLoading(false);
        return;
      }

      if (results.length > 0) {
        // Currently returns the RAW database chunk.
        // Later, we will send this chunk to the LLM to summarize it.
        await simulateStreamingResponse(results[0].content);
      } else {
        await simulateStreamingResponse("No relevant information found in the provided documents.");
      }
    } catch (error) {
      console.error("Search error:", error);
      if (!abortControllerRef.current) {
        await simulateStreamingResponse("An error occurred while processing your request.");
      } else {
        setIsLoading(false);
      }
    }
  };

  return (
    // ROOT CONTAINER
    <div className="flex h-screen w-full overflow-hidden bg-background">

      {/* SIDEBAR: Fixed width, does not shrink */}
      <div className="w-64 hidden md:block shrink-0 h-full border-r border-border">
        <Sidebar />
      </div>

      {/* MAIN CHAT AREA: Flex column that takes remaining space */}
      <main className="flex-1 flex flex-col h-full min-w-0">
        {/* MESSAGE FEED: Scrollable area */}
        <div className="flex-1 overflow-y-auto p-4 scroll-smooth">
          <div className="max-w-3xl mx-auto flex flex-col gap-6 pb-4">

            {/* Empty State */}
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center min-h-[50vh] text-center space-y-4 opacity-50 mt-20">
                <h1 className="text-4xl font-bold tracking-tighter">Axiom</h1>
                <p className="text-lg text-muted-foreground">
                  Upload a document and ask a question to begin.
                </p>
              </div>
            )}

            {/* Message Feed */}
            {messages.map((msg) => (
              <ChatBubble key={msg.id} message={msg} />
            ))}

            {/* Loading Indicator */}
            {isLoading && (
              <div className="flex items-center gap-2 text-muted-foreground text-sm pl-4 animate-pulse">
                Thinking...
              </div>
            )}

            {/* Invisible anchor for auto-scroll */}
            <div ref={messagesEndRef} className="h-1" />
          </div>
        </div>

        {/* INPUT AREA: Fixed at bottom (not part of the scroll area) */}
        <div className="w-full border-t border-border bg-background/95 p-4 backdrop-blur">
          <div className="max-w-3xl mx-auto">
            <ChatInput onSend={handleSendMessage} onStop={handleStop} isLoading={isLoading} />
          </div>
        </div>
      </main>
    </div>
  );
}