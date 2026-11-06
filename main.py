import os
import datetime
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
from dotenv import load_dotenv
import google.generativeai as genai

load_dotenv()

app = FastAPI(title="FinBot API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)

SYSTEM_PROMPT = """You are FinBot, an intelligent AI-powered financial advisor chatbot. You specialize in helping users with:
1) Budgeting - creating and managing personal budgets, expense tracking, 50/30/20 rule,
2) Savings - emergency funds, savings strategies, compound interest calculations,
3) Loans - EMI calculations, loan comparison, home loans, personal loans, car loans, understanding interest rates,
4) Investments - mutual funds, stocks, SIP, FD, PPF, NPS, gold, real estate, risk profiling,
5) Financial Planning - retirement planning, tax saving, insurance, goal-based planning.

Always provide practical, actionable advice. When asked for calculations, show the formula and step-by-step working. Use Indian financial context (INR, Indian tax laws like 80C, Indian investment options) where relevant. Keep responses clear, concise, and helpful. Format responses with bullet points and sections when appropriate."""


class Message(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    message: str
    history: Optional[List[Message]] = []


class ChatResponse(BaseModel):
    reply: str
    timestamp: str


@app.get("/health")
async def health_check():
    return {"status": "ok"}


@app.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    if not GEMINI_API_KEY:
        raise HTTPException(
            status_code=500,
            detail="GEMINI_API_KEY not configured. Please set it in the .env file.",
        )

    try:
        model = genai.GenerativeModel(
            model_name="gemini-1.5-flash",
            system_instruction=SYSTEM_PROMPT,
        )

        # Build conversation history for Gemini
        history = []
        for msg in (request.history or []):
            role = "user" if msg.role == "user" else "model"
            history.append({"role": role, "parts": [msg.content]})

        chat_session = model.start_chat(history=history)
        response = chat_session.send_message(request.message)

        timestamp = datetime.datetime.utcnow().isoformat() + "Z"
        return ChatResponse(reply=response.text, timestamp=timestamp)

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error communicating with AI: {str(e)}")
