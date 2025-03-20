import { Mistral } from '@mistralai/mistralai';
import { config } from 'dotenv';
import fs from 'fs';


config();

const apiKey = process.env.MISTRAL_API_KEY;

const client = new Mistral({apiKey: apiKey});

const uploaded_file = fs.readFileSync('./aiayn.pdf');
const uploaded_pdf = await client.files.upload({
    file: {
        fileName: "aiayn.pdf",
        content: uploaded_file,
    },
    purpose: "ocr",
});

await client.files.retrieve({
    fileId: uploaded_pdf.id
});

const signedUrl = await client.files.getSignedUrl({
    fileId: uploaded_pdf.id,
});

const ocrResponse = await client.ocr.process({
    model: "mistral-ocr-latest",
    document: {
        type: "document_url",
        documentUrl: signedUrl.url,
    }
});

const extractedMarkdown = ocrResponse.pages.map(page => page.markdown);

console.log('Extracted markdown content:');
console.log(extractedMarkdown);

export default extractedMarkdown;