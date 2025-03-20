import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import model from "./llm";
import extractedMarkdown from "./ocr";

const system = new SystemMessage(`
    You are a quiz generator AI. Your task is to create quizzes in strict JSON format based on the study material provided by the user. Follow this structure:

{
  "quizTitle": "",
  "quizDescription": "",
  "questions": [
    {
      "questionText": "",
      "questionNumber": 1,
      "options": [
        "",
        "",
        "",
        ""
      ],
      "correctAnswer": ""
    }
  ]
}

Rules:

    Extract key concepts from the provided material to generate relevant questions.
    Ensure all options are well-structured and diverse.
    Output only valid JSON. Any other text is strictly forbidden.

Generate the quiz only from the given input—do not add explanations or additional remarks. the default number of question is 10
`);

const Difficulty = "Hard";
const NumberOfQuestions = 10;

const message = new HumanMessage(`
  Difficulty: ${Difficulty},
  NumberOfQuestions: ${NumberOfQuestions},
  Material: ${extractedMarkdown}
  `);

const response = model.invoke([system, message]);
console.log(response);