import { ChatOpenAI } from "@langchain/openai";
import { config } from "dotenv";

config();
const apiKey = process.env.DEEPINFRA_API_KEY;

const llm = new ChatOpenAI({
    model: "claude-3-7-sonnet-latest",
    apiKey: apiKey,
    temperature: 0.7,
    configuration: {
      baseURL: "https://api.deepinfra.com/v1/openai"
    }
  });


export default llm;