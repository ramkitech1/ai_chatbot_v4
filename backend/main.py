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

    if data.mode == "generic":
        return f"You are a helpful assistant.\nUser: {data.message}"

    if data.mode == "custom":
        return f"You are acting as: {data.custom_prompt}\nUser: {data.message}"

    if data.mode == "finance":
        return f"""
You are a finance advisor.

Provide:
- Budget suggestions
- Savings plan
- Investment basics

User Input:
{data.message}
"""

    if data.mode == "multiagent":
        return f"""
You are a Multi-Agent AI.

1. Research:
- Response Type
- Intent
- Key Info

2. Analysis:
- Step 1
- Step 2
- Step 3

3. Final Answer:
- Clear response

User:
{data.message}
"""

    if data.mode == "workflow":
        return f"""
You are a Workflow Automation AI.

1. Task Type
2. Steps
3. Tools
4. Logic
5. Output

User:
{data.message}
"""

    # TRAVEL MODE
    if data.mode == "travel":
        return f"""
You are an AI Travel Assistant.

Your job:
- Plan trips
- Suggest places
- Manage budget

User Details:
{data.message}

STRICT FORMAT:

1. Trip Summary:
- Destination:
- Duration:
- Budget:

2. Day-wise Itinerary:
Day 1:
- Activities

Day 2:
- Activities

3. Budget Breakdown:
- Travel:
- Stay:
- Food:
- Misc:

4. Suggestions:
- Best places
- Tips

RULES:
- Structured output only
- No paragraph
"""

    return data.message


@app.post("/chat")
def chat(req: ChatRequest):
    prompt = build_prompt(req)

    response = client.chat.completions.create(
        model="llama-3.1-8b-instant",
        messages=[{"role": "system", "content": prompt}],
        temperature=0.7
    )

    return {"response": response.choices[0].message.content}