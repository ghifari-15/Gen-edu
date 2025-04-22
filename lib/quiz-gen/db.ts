import * as mongodb from 'mongodb';
import * as dotenv from 'dotenv';

export async function connectToDatabase() {
    dotenv.config();
    const uri = process.env.MONGO_URI;
    if (!uri) {
        throw new Error("MONGO_URI is not defined in the environment variables.");
    }
    const client: mongodb.MongoClient = new mongodb.MongoClient(uri);
    const db = client.db("gen-edu");
    const collection = db.collection("embeddings-documents");
    await client.connect();
    console.log("Connected to the database successfully.");

    return { collection, client, db };
   

    
}


// Test function

// connectToDatabase();


