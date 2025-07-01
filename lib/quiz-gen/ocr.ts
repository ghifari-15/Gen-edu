import { Mistral } from '@mistralai/mistralai';

/**
 * OCR Service for processing PDF files using Mistral AI
 * This is serverless-compatible and doesn't store files locally
 * 
 * NOTE: This is a reusable service class for OCR processing.
 * The actual chat notebook implementation is in:
 * - app/api/notebooks/[id]/chat/route.ts (Chat API)
 * - lib/services/ocr-service.ts (OCR Service)
 * - components/notebook/notebook-chat-panel.tsx (UI Component)
 */

export interface OCRResult {
  extractedText: string;
  extractedMarkdown: string[];
  pages: number;
}

export class OCRProcessor {
  private client: Mistral;

  constructor() {
    const apiKey = process.env.MISTRAL_API_KEY;
    if (!apiKey) {
      throw new Error('MISTRAL_API_KEY environment variable is required');
    }
    this.client = new Mistral({ apiKey });
  }

  /**
   * Process PDF buffer using Mistral OCR (serverless-compatible)
   * @param fileBuffer - PDF file buffer
   * @param fileName - Original file name
   * @returns Extracted text and metadata
   */
  async processPDFBuffer(fileBuffer: Buffer | Uint8Array, fileName: string): Promise<OCRResult> {
    let uploadedFileId: string | null = null;

    try {
      console.log(`Starting OCR processing for: ${fileName}`);

      // Upload directly to Mistral (no local storage)
      const uploadedFile = await this.client.files.upload({
        file: {
          fileName: fileName,
          content: fileBuffer,
        },
        purpose: "ocr",
      });

      uploadedFileId = uploadedFile.id;
      console.log(`File uploaded with ID: ${uploadedFileId}`);

      // Wait for file processing
      await this.client.files.retrieve({
        fileId: uploadedFileId
      });

      // Get signed URL for OCR processing
      const signedUrl = await this.client.files.getSignedUrl({
        fileId: uploadedFileId,
      });

      // Process OCR
      const ocrResponse = await this.client.ocr.process({
        model: "mistral-ocr-latest",
        document: {
          type: "document_url",
          documentUrl: signedUrl.url,
        }
      });

      const extractedMarkdown = ocrResponse.pages.map(page => page.markdown);
      const extractedText = extractedMarkdown.join('\n\n');

      console.log(`OCR completed. Extracted ${extractedMarkdown.length} pages`);

      return {
        extractedText,
        extractedMarkdown,
        pages: extractedMarkdown.length
      };

    } catch (error) {
      console.error('OCR processing failed:', error);
      throw new Error(`OCR processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      // Always clean up the uploaded file
      if (uploadedFileId) {
        try {
          await this.client.files.delete({ fileId: uploadedFileId });
          console.log(`Cleaned up file: ${uploadedFileId}`);
        } catch (cleanupError) {
          console.error('Failed to cleanup file:', cleanupError);
        }
      }
    }
  }
}

// Export singleton instance
export const ocrProcessor = new OCRProcessor();