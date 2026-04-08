from fastapi import FastAPI, UploadFile, File
from pydantic import BaseModel
from huggingface_hub import InferenceClient
from fastapi.middleware.cors import CORSMiddleware
import os
from dotenv import load_dotenv
from pypdf import PdfReader
import io



load_dotenv()

app = FastAPI()


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


client = InferenceClient(api_key=os.getenv("HUGGINGFACE_API_KEY"))

class ChatRequest(BaseModel):
    message: str
    mode: str
    custom_prompt: str = ""
    file_prompt: str = ""



def build_prompt(data: ChatRequest):

    if data.mode == "generic":
        prompt = "You are a helpful assistant."
    else:
        prompt = f"{data.custom_prompt}\n\nFollow strictly."

    if data.file_prompt:
        # Limit the file prompt to roughly 15,000 characters (~3750 tokens) to avoid 413 Too Large errors
        max_chars = 15000
        file_text = data.file_prompt
        if len(file_text) > max_chars:
            file_text = file_text[:max_chars] + "\n...[Document Truncated Due To Size Limits]"
        prompt += f"\n\nDocument/Reference Context:\n{file_text}"

    prompt += f"\n\nUser: {data.message}"
    
    return prompt


@app.post("/chat")
def chat(req: ChatRequest):
    prompt = build_prompt(req)

    # Using Hugging Face's Inference API with a free and highly capable model
    response = client.chat_completion(
        model="Qwen/Qwen2.5-72B-Instruct",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.7,
        max_tokens=1024
    )

    return {"response": response.choices[0].message.content}

@app.post("/upload_doc")
async def upload_doc(file: UploadFile = File(...)):
    try:
        content = await file.read()
        extracted_text = ""
        if file.filename.lower().endswith(".pdf"):
            pdf = PdfReader(io.BytesIO(content))
            for page in pdf.pages:
                text = page.extract_text()
                if text:
                    extracted_text += text + "\n"
        else:
            extracted_text = content.decode("utf-8")
        return {"extracted_text": extracted_text}
    except Exception as e:
        return {"error": str(e)}