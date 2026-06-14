from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def home():
    return {"message": "Backend is working!"}


@app.get("/questions")
def questions(role: str = ""):

    if role.lower() == "data scientist":
        return {
            "questions": [
                "What is overfitting?",
                "Explain logistic regression.",
                "What is a confusion matrix?"
            ]
        }

    elif role.lower() == "software engineer":
        return {
            "questions": [
                "What is OOP?",
                "Explain polymorphism.",
                "What is a REST API?"
            ]
        }

    else:
        return {
            "questions": [
                "Tell me about yourself.",
                "What are your strengths?",
                "Explain a challenging project you worked on."
            ]
        }