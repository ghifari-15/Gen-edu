import { Mistral } from '@mistralai/mistralai';

export interface OCRProcessResult {
  extractedText: string;
  extractedMarkdown: string[];
  fileId: string;
  pages: number;
}

export class OCRService {
  private client: Mistral;

  constructor() {
    const apiKey = process.env.MISTRAL_API_KEY;
    if (!apiKey) {
      throw new Error('MISTRAL_API_KEY environment variable is required');
    }
    this.client = new Mistral({ apiKey });
  }

  /**
   * Process PDF file using Mistral OCR
   * @param fileBuffer - PDF file buffer
   * @param fileName - Original file name
   * @returns Extracted text and markdown content
   */
  async processPDF(fileBuffer: Buffer, fileName: string): Promise<OCRProcessResult> {
    try {
      console.log(`Starting OCR processing for file: ${fileName}`);

      // Upload the PDF file to Mistral
      const uploaded_pdf = await this.client.files.upload({
        file: {
          fileName: fileName,
          content: fileBuffer,
        },
        purpose: "ocr",
      });

      console.log(`File uploaded with ID: ${uploaded_pdf.id}`);

      // Wait for file to be processed
      await this.client.files.retrieve({
        fileId: uploaded_pdf.id
      });

      // Get signed URL for the uploaded file
      const signedUrl = await this.client.files.getSignedUrl({
        fileId: uploaded_pdf.id,
      });

      console.log('Processing OCR...');

      // Process the document with OCR
      const ocrResponse = await this.client.ocr.process({
        model: "mistral-ocr-latest",
        document: {
          type: "document_url",
          documentUrl: signedUrl.url,
        }
      });

      // Extract markdown content from each page
      const extractedMarkdown = ocrResponse.pages.map(page => page.markdown);
      const extractedText = extractedMarkdown.join('\n\n');

      console.log(`OCR completed. Extracted ${extractedMarkdown.length} pages`);

      return {
        extractedText,
        extractedMarkdown,
        fileId: uploaded_pdf.id,
        pages: extractedMarkdown.length
      };

    } catch (error) {
      console.error('OCR processing failed:', error);
      throw new Error(`OCR processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Clean up uploaded file from Mistral
   * @param fileId - File ID to delete
   */
  async cleanupFile(fileId: string): Promise<void> {
    try {
      // Note: Check if Mistral API supports file deletion
      // await this.client.files.delete({ fileId });
      console.log(`File cleanup requested for ID: ${fileId}`);
    } catch (error) {
      console.warn('File cleanup failed:', error);
    }
  }

  /**
   * Process multiple PDF files
   * @param files - Array of file buffers and names
   * @returns Array of OCR results
   */
  async processMultiplePDFs(files: { buffer: Buffer; name: string }[]): Promise<OCRProcessResult[]> {
    const results: OCRProcessResult[] = [];
    
    for (const file of files) {
      try {
        const result = await this.processPDF(file.buffer, file.name);
        results.push(result);
      } catch (error) {
        console.error(`Failed to process ${file.name}:`, error);
        // Continue with other files even if one fails
      }
    }
    
    return results;
  }

  /**
   * Split extracted text into manageable chunks for embedding
   * @param text - Extracted text from OCR
   * @param maxChunkSize - Maximum size per chunk
   * @param overlap - Overlap between chunks
   * @returns Array of text chunks
   */
  splitTextIntoChunks(text: string, maxChunkSize: number = 8000, overlap: number = 200): string[] {
    const chunks: string[] = [];
    const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim().length > 0);
    
    let currentChunk = '';
    let currentSize = 0;
    
    for (const paragraph of paragraphs) {
      const paragraphSize = paragraph.length;
      
      if (currentSize + paragraphSize > maxChunkSize && currentChunk) {
        chunks.push(currentChunk.trim());
        
        // Start new chunk with overlap from previous chunk
        const sentences = currentChunk.split(/[.!?]+/).filter(s => s.trim().length > 0);
        const overlapSentences = sentences.slice(-Math.ceil(overlap / 100)); // Rough sentence count estimate
        currentChunk = overlapSentences.join('. ') + '. ' + paragraph;
        currentSize = currentChunk.length;
      } else {
        currentChunk += (currentChunk ? '\n\n' : '') + paragraph;
        currentSize += paragraphSize + (currentChunk ? 2 : 0);
      }
    }
    
    if (currentChunk.trim()) {
      chunks.push(currentChunk.trim());
    }
    
    return chunks.length > 0 ? chunks : [text];
  }
}

export const ocrService = new OCRService();
