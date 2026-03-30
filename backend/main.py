from fastapi import FastAPI
from pydantic import BaseModel
from groq import Groq
from fastapi.middleware.cors import CORSMiddleware
import os
from dotenv import load_dotenv


load_dotenv()

app = FastAPI()


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


client = Groq(api_key=os.getenv("GROQ_API_KEY"))

class ChatRequest(BaseModel):
    message: str
    mode: str
    custom_prompt: str = ""



def build_prompt(data: ChatRequest):

    # GENERIC
    if data.mode == "generic":
        return f"You are a helpful assistant.\nUser: {data.message}"

    # CUSTOM
    if data.mode == "custom":
        return f"""
You are acting as: {data.custom_prompt}

User:
{data.message}
"""

    # FINANCE
    if data.mode == "finance":
        return f"""
You are an AI Finance Advisor.

Give:
- Budget tips
- Savings advice
- Simple investment suggestions

User:
{data.message}
"""

    # MULTI-AGENT
    if data.mode == "multiagent":
        return f"""
You are a Multi-Agent AI system.

STRICT FORMAT:

1. Research:
- Response Type:
- Intent:
- Key Info:

2. Analysis:
- Step 1:
- Step 2:
- Step 3:

3. Final Answer:
- Clear response

RULES:
- Each section must be on a new line
- No paragraph format
- Use bullet points

    User Input:
    {data.message}
    """

        #  WORKFLOW MODE
    if data.mode == "workflow":
        return f"""
    You are an AI Workflow Automation Assistant.

    Your job is to:
    1. Detect the task type
    2. Break it into steps
    3. Provide structured output

    SUPPORTED TASKS:
    - Summarization
    - Email generation
    - To-do list creation
    - General automation tasks

    STRICT FORMAT:

    1. Task Type:
    - Identify task (e.g., Summarization / Email / To-Do / Other)

    2. Intent Detection:
    - What user wants clearly

    3. Step-by-Step Plan:
    - Step 1:
    - Step 2:
    - Step 3:

    4. Execution Output:
    - Provide final result (summary / email / to-do list)

    5. Tools / Enhancements:
    - Suggest tools (optional)
    - Mention context awareness or automation logic

    RULES:
    - No paragraph blocks
    - Use structured format only
    - Keep output clean and readable

    User Input:
    {data.message}
    """



@app.post("/chat")
def chat(req: ChatRequest):
    prompt = build_prompt(req)

    response = client.chat.completions.create(
        model="llama-3.1-8b-instant",
        messages=[{"role": "system", "content": prompt}],
        temperature=0.7
    )

    return {"response": response.choices[0].message.content}