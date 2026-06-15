from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import google.generativeai as genai
import os

# Load .env
load_dotenv()

# Configure Gemini
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

model = genai.GenerativeModel("gemini-2.5-flash")

app = FastAPI()

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def home():
    return {"message": "AI Mock Interview Backend Running"}

@app.get("/questions")
def generate_questions(role: str):

    prompt = f"""
You are an expert interviewer.

Generate exactly 5 realistic interview questions for a {role}.

Requirements:
- Questions must be specific to the role.
- Avoid generic questions.
- Mix beginner and advanced questions.
- Return only the questions.
- One question per line.
"""

    try:
        response = model.generate_content(prompt)

        questions = [
            q.strip()
            for q in response.text.split("\n")
            if q.strip()
        ]

        return {"questions": questions}

    except Exception as e:
        return {
            "questions": [
                f"Error generating questions: {str(e)}"
            ]
        }