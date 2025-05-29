import llm from "../llm";

async function test() {
    let message = "Kontol"
const response = llm.invoke(message)
console.log(response)
}

test().catch(console.error);
