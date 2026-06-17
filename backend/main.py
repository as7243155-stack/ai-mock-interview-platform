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
    role = data.get("role", "Unknown")

    prompt = f"""
You are a senior professional interviewer.

Role:
{role}

Interview Questions:
{questions}

Candidate Answers:
{answers}

Interview Evaluation Philosophy:

- Judge candidates based on demonstrated knowledge, not perfection.
- Reward partial understanding.
- Reward logical thinking even if the answer is incomplete.
- Do not be overly harsh.
- Do not be overly generous.
- Act like a real interviewer hiring for the role.

Evaluate the candidate on:

1. Technical Knowledge
2. Communication Skills
3. Problem Solving Ability
4. Relevance of Answers
5. Completeness of Responses

Scoring Rules:

Question Score Guide:

0-1 = Completely incorrect, irrelevant, or empty answer
2-3 = Very weak answer with minimal understanding
4-5 = Basic understanding but lacks depth
6-7 = Good answer showing reasonable knowledge
8-9 = Strong answer with examples and clear reasoning
10 = Exceptional answer with deep understanding and excellent communication

Important:

- Use the FULL scoring range.
- Do NOT give all questions the same score.
- Reward effort and partial understanding.
- Only use 0 when the answer is completely wrong or empty.
- Penalize irrelevant answers.
- Reward detailed examples.

Return ONLY valid JSON in this format:

{{
    "overall_score": 78,

    "technical_score": 80,
    "communication_score": 75,
    "problem_solving_score": 79,

    "question_feedback": [
        {{
            "question": "Question text",
            "score": 8,
            "feedback": "Detailed feedback"
        }}
    ],

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

        print("\n===== GEMINI RESPONSE =====")
        print(text)
        print("===========================\n")

        result = json.loads(text)

        return result

    except Exception as e:
        print("EVALUATION ERROR:", str(e))

        return {
            "overall_score": 0,
            "technical_score": 0,
            "communication_score": 0,
            "problem_solving_score": 0,
            "question_feedback": [],
            "strengths": [],
            "weaknesses": [str(e)],
            "suggestions": []
        }