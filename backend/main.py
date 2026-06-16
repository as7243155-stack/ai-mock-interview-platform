from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import google.generativeai as genai
import os
import json

# Load environment variables
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
- Questions must be specific to the role
- Avoid generic questions
- Mix beginner and advanced questions
- Return only the questions
- One question per line
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


@app.post("/evaluate")
def evaluate_interview(data: dict):

    questions = data.get("questions", [])
    answers = data.get("answers", {})

    prompt = f"""
You are a senior technical interviewer.

Interview Questions:
{questions}

Candidate Answers:
{answers}

Evaluate the candidate honestly.

Scoring Guidelines:
90-100 = Exceptional
75-89 = Strong
60-74 = Average
40-59 = Weak
0-39 = Poor

Analyze:
1. Relevance of answers
2. Technical knowledge
3. Communication skills
4. Completeness

Return ONLY valid JSON in this exact format:

{{
    "score": 85,
    "strengths": [
        "Strength 1",
        "Strength 2"
    ],
    "weaknesses": [
        "Weakness 1",
        "Weakness 2"
    ],
    "suggestions": [
        "Suggestion 1",
        "Suggestion 2"
    ]
}}
"""

    try:
        response = model.generate_content(prompt)

        text = response.text.strip()

        # Remove markdown if Gemini returns it
        text = text.replace("```json", "")
        text = text.replace("```", "")
        text = text.strip()

        result = json.loads(text)

        return result

    except Exception as e:
        return {
            "score": 0,
            "strengths": [],
            "weaknesses": [str(e)],
            "suggestions": []
        }