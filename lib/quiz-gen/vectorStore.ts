import { Collection, MongoClient } from "mongodb";
import embeddingModel from "./embeddings";
import { config } from 'dotenv';
import { connectToDatabase } from "./db";
import extractedMarkdown from "./ocr";



config();
const embedded = embeddingModel;

export async function saveEmbeddings(doc: string) {
    const { collection } = await connectToDatabase();
    
    const vector = await embedded.embedQuery(doc);
    console.log(vector);
    console.log(vector.length);

    await collection.insertOne({
        text: doc,
        vector: vector,
        timestamp: new Date()
    });
    console.log("Data berhasil disimpan");
}


saveEmbeddings(extractedMarkdown[0]);






