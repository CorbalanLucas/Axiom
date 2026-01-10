"use client";

import { useEffect, useState, useRef } from "react";
import { Upload, FileText, Trash2, Loader2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ModeToggle } from "@/components/mode-toggle";
import { getDocuments, uploadDocument, Document } from "@/lib/api";

export function Sidebar() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 1. Load documents when component mounts
  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      const docs = await getDocuments();
      setDocuments(docs);
    } catch (error) {
      console.error("Failed to load documents", error);
    }
  };

  // 2. Handle File Upload
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      await uploadDocument(file);
      await fetchDocuments(); // Refresh list after upload
    } catch (error) {
      console.error("Upload failed", error);
      alert("Failed to upload document");
    } finally {
      setIsUploading(false);
      // Reset input so you can select the same file again if needed
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <div className="flex h-full w-full flex-col bg-sidebar border-r border-border">
      {/* Header */}
      <div className="p-4 border-b border-border flex items-center justify-between">
        <h2 className="text-lg font-semibold tracking-tight text-sidebar-foreground">
          Library
        </h2>
        <ModeToggle />
      </div>

      {/* File List */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
            <div className="py-2">
            <h3 className="mb-2 px-2 text-xs font-semibold text-sidebar-foreground/70 uppercase tracking-wider">
                Indexed Files
            </h3>
            <div className="space-y-1">
                {documents.length === 0 ? (
                <p className="px-2 text-sm text-muted-foreground italic">
                    No files indexed yet.
                </p>
                ) : (
                documents.map((doc) => (
                    <div
                    key={doc.id}
                    className="flex items-center justify-between px-2 py-1.5 text-sm group hover:bg-sidebar-accent hover:text-sidebar-accent-foreground rounded-md transition-colors"
                    >
                    <div className="flex items-center gap-2 overflow-hidden">
                        <FileText className="h-4 w-4 shrink-0 opacity-70" />
                        <span className="truncate max-w-[140px]">
                        {doc.metadata.filename || `Doc ${doc.id}`}
                        </span>
                    </div>
                    </div>
                ))
                )}
            </div>
            </div>
        </div>
      </ScrollArea>

      {/* Upload Footer */}
      <div className="p-4 border-t border-border bg-sidebar">
        {/* Hidden Input */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelect}
          className="hidden"
          accept=".pdf,.txt,.md"
        />
        
        <Button 
          className="w-full gap-2 font-medium" 
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
        >
          {isUploading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Plus className="h-4 w-4" />
          )}
          {isUploading ? "Indexing..." : "Add Source"}
        </Button>
      </div>
    </div>
  );
}