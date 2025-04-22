import { ChatOpenAI } from "@langchain/openai";
import { config } from "dotenv";

config();
const apiKey = process.env.DEEPINFRA_API_KEY;
if (!apiKey) {
  throw new Error("DEEPINFRA_API_KEY is not defined in the environment variables.");
}


const model = new ChatOpenAI({
  model: "anthropic/claude-3-7-sonnet-latest",
  apiKey: apiKey,
  configuration: {
      baseURL: "https://api.deepinfra.com/v1/openai",
  },
  temperature: 0,
});

export default model;

// Try model

const prompt = "Give me a morning letter to my Girlfriend";
const response = await model.invoke(prompt);
console.log(response.content);