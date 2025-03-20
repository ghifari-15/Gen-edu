import { ChatOpenAI } from "@langchain/openai";
import { config } from "dotenv";

config();
const apiKey = process.env.DEEPINFRA_API_KEY;



const model = new ChatOpenAI({
    model: "google/gemini-2.0-flash-001",
  
    apiKey: apiKey,
    temperature: 0.7,
    configuration: {
      baseURL: "https://api.deepinfra.com/v1/openai"
    }
  });

export default model;