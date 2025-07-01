# Serverless OCR Implementation for Vercel

This document explains how the GenEdu notebook chat system is designed to work perfectly with serverless environments like Vercel, without storing any files locally.

## Overview

The GenEdu notebook chat system is fully serverless-compatible and uses Mistral OCR API for processing PDFs without any local file storage. This makes it perfect for Vercel deployments.

## Architecture

### Serverless-Compatible Design

1. **No Local File Storage**: All PDF processing happens in memory using file buffers
2. **Direct Mistral API Integration**: Files are uploaded directly to Mistral's OCR service
3. **Immediate Cleanup**: Files are deleted from Mistral after processing
4. **Memory-Efficient**: File buffers are processed and discarded quickly

### Key Components

#### 1. Chat API (`app/api/notebooks/[id]/chat/route.ts`)
```typescript
// ✅ SERVERLESS-COMPATIBLE: Uses file buffers, not local storage
const fileBuffer = await file.arrayBuffer()
const uploadedFile = await mistralClient.files.upload({
  file: {
    fileName: file.name,
    content: new Uint8Array(fileBuffer), // Direct buffer upload
  },
  purpose: "ocr",
})
```

#### 2. OCR Service (`lib/services/ocr-service.ts`)
```typescript
// ✅ SERVERLESS-COMPATIBLE: Processes Buffer objects directly
async processPDF(fileBuffer: Buffer, fileName: string): Promise<OCRProcessResult> {
  // Upload buffer directly to Mistral - no local storage
  const uploaded_pdf = await this.client.files.upload({
    file: {
      fileName: fileName,
      content: fileBuffer, // Direct buffer processing
    },
    purpose: "ocr",
  });
  // ... rest of processing
}
```

#### 3. RAG Service (`lib/services/notebook-rag-service.ts`)
```typescript
// ✅ SERVERLESS-COMPATIBLE: Works with file buffers
async addPDFDocuments(
  notebookId: string,
  userId: string,
  files: { buffer: Buffer; name: string }[] // Buffer-based interface
): Promise<{ success: boolean; documentsAdded: number; chunks: number }>
```

## How It Works (Serverless Flow)

1. **File Upload**: User uploads PDF via form
2. **Buffer Processing**: File is converted to ArrayBuffer/Buffer in memory
3. **Mistral Upload**: Buffer is uploaded directly to Mistral OCR API
4. **OCR Processing**: Mistral processes the PDF and returns text
5. **Text Storage**: Extracted text is stored in MongoDB (not the file)
6. **Cleanup**: File is deleted from Mistral servers
7. **Buffer Disposal**: File buffer is garbage collected

## Vercel Compatibility

### Why It Works on Vercel

- ✅ **No File System Access**: Uses only memory buffers
- ✅ **External API Processing**: Mistral handles all OCR processing
- ✅ **Fast Execution**: Processes within Vercel's time limits
- ✅ **Memory Efficient**: Files are processed and discarded quickly
- ✅ **Automatic Cleanup**: No persistent storage required

### Configuration for Vercel

```env
# Required environment variables
MISTRAL_API_KEY=your_mistral_api_key
DEEPINFRA_API_KEY=your_deepinfra_api_key
MONGODB_URI=your_mongodb_connection_string
```

### File Size Limits

```typescript
// Configured for Vercel limits
const maxFileSize = 50 * 1024 * 1024 // 50MB limit for serverless
if (file.size > maxFileSize) {
  return NextResponse.json({ 
    error: 'File too large. Maximum size is 50MB' 
  }, { status: 400 })
}
```

## Benefits

1. **Scalability**: No local storage means infinite horizontal scaling
2. **Performance**: Direct API processing is faster than local OCR
3. **Reliability**: No disk space or file permission issues
4. **Security**: Files are never stored permanently
5. **Cost-Effective**: No storage costs, only API usage

## Error Handling

The system includes robust error handling for serverless environments:

```typescript
try {
  // OCR processing
} catch (error) {
  console.error('OCR processing failed:', error)
  return NextResponse.json({ 
    error: `Failed to process PDF: ${error instanceof Error ? error.message : 'Unknown error'}` 
  }, { status: 500 })
} finally {
  // Always cleanup - even on error
  if (uploadedFileId) {
    try {
      await mistralClient.files.delete({ fileId: uploadedFileId })
    } catch (cleanupError) {
      console.error('Failed to cleanup uploaded file:', cleanupError)
    }
  }
}
```

## Performance Optimizations

1. **Timeout Handling**: Waits up to 30 seconds for OCR processing
2. **Progress Tracking**: Shows upload progress to users
3. **Streaming Responses**: Uses streaming for chat responses
4. **Memory Management**: Immediate buffer disposal after processing

## Deployment Checklist

- ✅ Environment variables configured
- ✅ API keys valid and have sufficient quota
- ✅ MongoDB connection configured
- ✅ File upload limits set appropriately
- ✅ Error handling tested
- ✅ Cleanup mechanisms verified

## Common Issues and Solutions

### Issue: "File too large" errors
**Solution**: File size is limited to 50MB for serverless compatibility

### Issue: OCR timeout
**Solution**: 30-second timeout with retry logic implemented

### Issue: Memory issues
**Solution**: Files are processed as streams and buffers are disposed immediately

### Issue: API quota exceeded
**Solution**: Monitor Mistral API usage and upgrade plan if needed

## Migration from Local Storage

If you were previously using local file storage, here's how to migrate:

### Before (❌ Not serverless-compatible):
```typescript
// Don't do this - requires file system
const filePath = './uploads/' + file.name
fs.writeFileSync(filePath, fileBuffer)
const result = await processLocalFile(filePath)
fs.unlinkSync(filePath) // Cleanup
```

### After (✅ Serverless-compatible):
```typescript
// Do this - uses memory buffers only
const fileBuffer = await file.arrayBuffer()
const result = await mistralClient.files.upload({
  file: {
    fileName: file.name,
    content: new Uint8Array(fileBuffer)
  },
  purpose: "ocr"
})
```

## Monitoring and Debugging

### Logs to Monitor

1. File upload success/failure
2. OCR processing time
3. Memory usage patterns
4. API response times
5. Cleanup success/failure

### Debug Information

```typescript
console.log(`Processing PDF file: ${file.name} (${file.size} bytes)`)
console.log(`File uploaded to Mistral with ID: ${uploadedFileId}`)
console.log(`OCR completed. Extracted ${extractedText.length} characters`)
console.log(`Cleaned up file: ${uploadedFileId}`)
```

## Conclusion

The GenEdu notebook chat system is already fully optimized for serverless deployment on Vercel. No changes are needed for serverless compatibility - the system uses memory buffers and external APIs without any local file storage.

The key is that all file processing happens in memory using ArrayBuffer and Buffer objects, which are then sent directly to Mistral's OCR API. This approach is both serverless-compatible and more efficient than local file processing.
