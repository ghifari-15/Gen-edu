# Notebook Chat Integration

This document describes the notebook chat system that allows users to upload PDFs, process them with OCR, and have conversations about the content.

## Overview

The notebook chat system provides:
- PDF upload and OCR processing using Mistral
- Conversational AI using LangChain and Claude Sonnet
- Persistent chat history stored in MongoDB
- Streaming responses for better UX
- Notebook-specific chat threads

## Architecture

### Components

1. **NotebookChatPanel** (`components/notebook/notebook-chat-panel.tsx`)
   - React component for the chat interface
   - Handles file uploads and chat messages
   - Displays conversation history
   - Supports streaming responses

2. **Chat API** (`app/api/notebooks/[id]/chat/route.ts`)
   - Handles PDF upload and OCR processing
   - Manages chat conversations with LLM
   - Stores chat history in MongoDB
   - Streams responses back to client

3. **ChatThread Model** (`lib/models/ChatThread.ts`)
   - MongoDB schema for storing chat conversations
   - Links chat threads to specific notebooks
   - Stores OCR content from uploaded files

### Data Flow

1. User uploads PDF file
2. File is processed with Mistral OCR
3. Extracted text is stored in ChatThread
4. User sends chat messages
5. LLM responds using stored context
6. Conversation history is persisted

## API Endpoints

### GET `/api/notebooks/[id]/chat`
Retrieves chat history for a notebook.

**Response:**
```json
{
  "success": true,
  "messages": [
    {
      "role": "user",
      "content": "What is this document about?",
      "timestamp": "2025-06-29T10:00:00Z"
    }
  ],
  "threadId": "thread_123",
  "hasUploadedContent": true
}
```

### POST `/api/notebooks/[id]/chat` (File Upload)
Uploads and processes a PDF file.

**Request:** FormData with file
**Response:**
```json
{
  "success": true,
  "message": "File uploaded and processed successfully",
  "threadId": "thread_123"
}
```

### POST `/api/notebooks/[id]/chat` (Chat Message)
Sends a chat message and receives streaming response.

**Request:**
```json
{
  "message": "Explain the main concepts in this document"
}
```

**Response:** Server-Sent Events stream
```
data: {"content": "The document discusses..."}
data: {"content": " several key concepts..."}
data: {"done": true}
```

### DELETE `/api/notebooks/[id]/chat`
Clears chat history for a notebook.

**Response:**
```json
{
  "success": true,
  "message": "Chat history cleared"
}
```

## Database Schema

### ChatThread Collection

```typescript
interface IChatThread {
  threadId: string
  userId: string
  notebookId?: string // Links to specific notebook
  messages: IChatMessage[]
  model: 'claude-sonnet' | 'deepseek-reasoning'
  title?: string
  uploadedFileContent?: string // OCR content from uploaded files
  createdAt: Date
  updatedAt: Date
}

interface IChatMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: Date
}
```

### Indexes

```javascript
// Efficient queries for user's chat threads
{ userId: 1, updatedAt: -1 }
{ threadId: 1, userId: 1 }
{ notebookId: 1, userId: 1 } // Notebook-specific queries
```

## Integration

To integrate the chat panel with your notebook editor:

```tsx
import { NotebookChatPanel } from '@/components/notebook/notebook-chat-panel'

function NotebookEditor({ notebookId }: { notebookId: string }) {
  return (
    <div className="flex">
      {/* Notebook content */}
      <div className="flex-1">
        {/* ... notebook editor ... */}
      </div>
      
      {/* Chat sidebar */}
      <div className="w-80 border-l">
        <NotebookChatPanel notebookId={notebookId} />
      </div>
    </div>
  )
}
```

## Configuration

### Environment Variables

```env
# Required for OCR processing
MISTRAL_API_KEY=your_mistral_api_key

# Required for LLM responses
DEEPINFRA_API_KEY=your_deepinfra_api_key

# Required for database
MONGODB_URI=mongodb://localhost:27017/genedu
```

### LLM Configuration

The system uses Claude Sonnet via DeepInfra:

```typescript
const defaultLLM = new ChatOpenAI({
  model: "anthropic/claude-3-7-sonnet-latest",
  apiKey: process.env.DEEPINFRA_API_KEY,
  temperature: 0.7,
  streaming: true,
  configuration: {
    baseURL: "https://api.deepinfra.com/v1/openai"
  }
})
```

## Features

### File Upload and OCR
- Supports PDF files only
- Uses Mistral OCR for text extraction
- Content is stored once per notebook
- New uploads replace previous content

### Chat Conversations
- Conversational context maintained
- Streaming responses for better UX
- Chat history limited to last 10 messages to prevent token overflow
- Content is injected into system prompt only once

### Notebook Integration
- Each notebook has its own chat thread
- Chat history persists across sessions
- Easy access from notebook editor interface

## Usage Tips

1. **Upload a PDF first** for best results
2. **Ask specific questions** about the document content
3. **Use follow-up questions** to dive deeper into topics
4. **Clear chat history** to start fresh conversations

## Error Handling

The system handles various error scenarios:
- Invalid file types (only PDF allowed)
- OCR processing failures
- LLM API errors
- Database connection issues
- Network timeouts

All errors are logged and user-friendly messages are displayed in the UI.
