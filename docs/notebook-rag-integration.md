# Notebook RAG System Integration Guide

## Overview
The Notebook RAG (Retrieval-Augmented Generation) system allows users to upload PDF documents and query their notebook content using AI. Each notebook has its own isolated collection in Qdrant vector database.

## Architecture

### Core Components

1. **NotebookRAGService** (`lib/services/notebook-rag-service.ts`)
   - Manages Qdrant collections per notebook
   - Handles PDF OCR processing with Mistral AI
   - Generates embeddings with Qwen3-Embedding-4B
   - Provides AI chat with Claude 3.7 Sonnet

2. **OCRService** (`lib/services/ocr-service.ts`)
   - Processes PDF files using Mistral OCR
   - Extracts text and markdown from documents
   - Splits content into manageable chunks

3. **EmbeddingService** (`lib/services/embedding-service.ts`)
   - Generates embeddings using Qwen3-Embedding-4B from DeepInfra
   - Handles vector similarity calculations

## API Endpoints

### Upload PDFs
```
POST /api/notebooks/[id]/rag
Content-Type: multipart/form-data

FormData:
- files: PDF files
```

### Add Text Content
```
POST /api/notebooks/[id]/rag/text
Content-Type: application/json

{
  "content": "Text to add to RAG",
  "fileName": "optional_filename"
}
```

### Search Documents
```
POST /api/notebooks/[id]/rag/search
Content-Type: application/json

{
  "query": "search query",
  "limit": 5,
  "scoreThreshold": 0.3,
  "sourceFilter": "pdf" | "text" | "cell"
}
```

### AI Chat Query
```
POST /api/notebooks/[id]/rag/query
Content-Type: application/json

{
  "question": "What is this notebook about?",
  "limit": 5
}
```

### Get Statistics
```
GET /api/notebooks/[id]/rag
```

### Clear All Data
```
DELETE /api/notebooks/[id]/rag
```

## Environment Variables Required

```env
# DeepInfra API Key (for embeddings and LLM)
DEEPINFRA_API_KEY=your_deepinfra_key

# Mistral API Key (for OCR)
MISTRAL_API_KEY=your_mistral_key

# Qdrant Configuration (already set in the service)
# Using cloud endpoint: https://8ba170ec-aa3a-4511-b5b6-11e2cc995825.us-west-1-0.aws.cloud.qdrant.io:6333
```

## Usage Flow

1. **Upload PDFs**: Users upload PDF documents through the RAG panel
2. **OCR Processing**: Mistral AI extracts text from PDFs
3. **Text Chunking**: Content is split into manageable chunks
4. **Embedding Generation**: Qwen3 generates vector embeddings
5. **Vector Storage**: Embeddings stored in isolated Qdrant collections
6. **Search & Query**: Users can search content or ask AI questions
7. **AI Response**: Claude 3.7 Sonnet generates contextual answers

## Collection Naming

Each notebook gets its own collection in Qdrant:
```
Collection Name: notebook_{userId}_{notebookId}
```

This ensures complete data isolation between users and notebooks.

## Integration with Notebook Editor

To integrate the RAG panel with your notebook editor, add the NotebookRAGPanel component:

```tsx
import { NotebookRAGPanel } from '@/components/notebook/notebook-rag-panel'

// In your notebook component
const [showRAGPanel, setShowRAGPanel] = useState(false)

// Add a button to open the RAG panel
<Button onClick={() => setShowRAGPanel(true)}>
  Open RAG System
</Button>

// Include the panel
<NotebookRAGPanel 
  notebookId={notebookId}
  isOpen={showRAGPanel}
  onClose={() => setShowRAGPanel(false)}
/>
```

## Features

- ✅ PDF upload and OCR processing
- ✅ Text content addition
- ✅ Vector similarity search
- ✅ AI-powered Q&A with context
- ✅ Source attribution and confidence scores
- ✅ Data isolation per notebook
- ✅ Statistics and management
- ✅ Automatic text chunking
- ✅ Error handling and validation

## Performance Considerations

- PDFs are processed asynchronously
- Large documents are automatically chunked
- Vector search is optimized with score thresholds
- Cloud Qdrant provides scalable vector storage
- Embeddings are cached in the vector database

## Security

- User authentication required for all operations
- Each user can only access their own notebook collections
- API keys are securely stored in environment variables
- File upload validation (PDF only)

The system is now fully functional and ready for use!
