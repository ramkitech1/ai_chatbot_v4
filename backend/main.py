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

    return f"""
{data.custom_prompt}

Follow strictly.

User: {data.message}
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