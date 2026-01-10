import { Sidebar } from "@/components/sidebar";

export default function Home() {
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar Area */}
      <div className="w-64 hidden md:block shrink-0">
        <Sidebar />
      </div>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col items-center justify-center p-4">
        <h1 className="text-3xl font-bold text-primary">Axiom RAG</h1>
        <p className="text-muted-foreground mt-2">
          Upload a PDF in the sidebar to test the connection.
        </p>
      </main>
    </div>
  );
}