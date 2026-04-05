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
        return f"""
You are acting as: {data.custom_prompt}
Follow strictly.

User: {data.message}
"""

    if data.mode == "finance":
        return f"""
You are an AI Personal Finance Advisor.

- Analyze income/expenses
- Suggest savings
- Give investment tips

User Input:
{data.message}
"""

    if data.mode == "multiagent":
        return f"""
You are a Multi-Agent AI system.

STRICT FORMAT:

Research:
- Response Type:
- Intent:
- Key Info:

Analysis:
- Step 1:
- Step 2:
- Step 3:

Final Answer:
- Clear response

User Input:
{data.message}
"""

    if data.mode == "workflow":
        return f"""
You are an AI Workflow Assistant.

Tasks:
- Summarize
- Generate email
- Create to-do

Return structured output.

User Task:
{data.message}
"""

    if data.mode == "travel":
        return f"""
You are a Travel Assistant.

- Suggest itinerary
- Plan budget
- Provide tips

User Input:
{data.message}

Output format:
Trip Summary:
Itinerary:
Budget:
Suggestions:
"""

    
    if data.mode == "fitness":
        return f"""
You are a certified fitness coach.

User details:
{data.message}

Your job:
1. Workout Plan (based on goal)
2. Diet Plan (simple meals)
3. Tips

STRICT FORMAT:

Workout Plan:
- ...

Diet Plan:
- ...

Tips:
- ...
"""

    return "Invalid mode"


@app.post("/chat")
def chat(req: ChatRequest):
    prompt = build_prompt(req)

    response = client.chat.completions.create(
        model="llama-3.1-8b-instant",
        messages=[{"role": "system", "content": prompt}],
        temperature=0.7
    )

    return {"response": response.choices[0].message.content}