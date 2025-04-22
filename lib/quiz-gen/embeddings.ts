import { config } from "dotenv";
import { OpenAIEmbeddings } from "@langchain/openai";
import * as ocr from "./ocr";
config();

const apiKey = process.env.DEEPINFRA_API_KEY;

const embeddingModel = new OpenAIEmbeddings({
    apiKey: apiKey,
    model: "BAAI/bge-m3",
    configuration: {
        baseURL: "https://api.deepinfra.com/v1/openai"
    },
    dimensions: 1024
});

export default embeddingModel;

// Try model
// const text = "I love coding";
// console.log("Sebelum di embed:", text)
// const response = await embeddingModel.embedQuery(text);
// console.log("After embed to vector:", response);
