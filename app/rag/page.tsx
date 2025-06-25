import RAGChatInterface from "@/components/rag/rag-chat-interface"

export default function RAGChatPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Knowledge Assistant</h1>
          <p className="text-muted-foreground mt-2">
            Ask questions and get AI-powered answers from our knowledge base
          </p>
        </div>
        <RAGChatInterface />
      </div>
    </div>
  )
}
