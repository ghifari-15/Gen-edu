import { connectToDatabase } from "./db";
import embeddingModel from "./embeddings";
import { config } from 'dotenv';

config();

const embedded = embeddingModel;    
export async function retrieveSimilarDocuments(queryText: string, topK: number = 3) {
    
    const { collection } = await connectToDatabase();
    const queryEmbedding = await embedded.embedQuery(queryText);

    try {
        const pipeline = [
            {
                "$vectorSearch": {
                    "index": "vector_index",
                    "path": "embedding",
                    "queryVector": queryEmbedding,
                    "numCandidates": 100,
                    "limit": topK
            }
        },
        ];
        
        const result = await collection.aggregate(pipeline).toArray();

        if (!result || result.length === 0) {
            console.log("No similar documents found.");
            return [];
        }

    } catch (error) {
        console.error("Error retrieving documents:", error);
        return [];
    }
}

// Test function
const result = await retrieveSimilarDocuments("I love coding");
console.log(result);
