import os
import shutil
from typing import List, Dict
from fastapi import FastAPI, HTTPException, Body, UploadFile, File, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.concurrency import run_in_threadpool
from pydantic import BaseModel
from dotenv import load_dotenv
from docx import Document
import uvicorn
from pydantic import BaseModel
from logging import log
from pydantic import BaseModel


from extract_subprocesses import extract_subprocesses
from vector_utils import build_rag_context
from generate_questions import generate_suggested_questions
from BBP_GENERATION.generate_bbp import generate_bbp_from_qa
from process_analysis import (
    generate_process_understanding,
    revise_process_understanding,
    generate_process_recommendation,
    revise_process_recommendation
)
from user_choices import current_user_choices

load_dotenv(dotenv_path="local.env", override=True)

app = FastAPI(
    title="SAP BBP Discovery Assistant API",
    description="API backend for SAP Ariba BBP process understanding and recommendation",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ProcessUnderstandingFeedback(BaseModel):
    user_input: str

class RecommendationFeedback(BaseModel):
    user_input: str

class AnswerPayload(BaseModel):
    answer: str

@app.get("/init_subprocess_flow")
async def init_subprocess_flow():
    try:
        print("🧠 Initializing subprocess flow...")

        subprocesses = extract_subprocesses()
        if not subprocesses:
            raise HTTPException(status_code=404, detail="No subprocesses found")

        current_user_choices["subrpocess_list"] = subprocesses
        current_user_choices["current_subprocess"] = subprocesses[0]
        current_user_choices["subprocess_states"] = {sp: "incomplete" for sp in subprocesses}

        rag_context = build_rag_context()
        current_user_choices["rag_context"] = rag_context

        first_question = generate_suggested_questions(
            user_choices=current_user_choices,
            sub_process_name=subprocesses[0],
            rag_context=rag_context,
            conversation_history=[]
        )[0]

        current_user_choices["conversation_history"] = [{
            "question": first_question,
            "answer": "",
            "followups": []
        }]

    

        print("✅ Subprocess initialized:", current_user_choices["current_subprocess"])
        return {
            "current_subprocess": subprocesses[0],
            "index": 1,
            "total": len(subprocesses),
            "progress_percent": round(1 / len(subprocesses) * 100),
            "suggested_question": first_question,
            "all_completed": False
        }

    except Exception as e:
        print(f"❌ Failed to init subprocess: {e}")
        raise HTTPException(status_code=500, detail=str(e))




@app.post("/submit_answer")
async def submit_answer(payload: AnswerPayload):
    answer = payload.answer
    print(f"[DEBUG] Received answer: {answer}")

    try:
        history = current_user_choices.get("conversation_history", [])
        rag_context = current_user_choices["rag_context"]
        current_subprocess = current_user_choices["current_subprocess"]

        if not history:
            raise HTTPException(status_code=400, detail="No conversation history found.")

        history[-1]["answer"] = answer
        current_user_choices["subprocess_states"][current_subprocess] = "completed"

        all_completed = all(
            state == "completed"
            for state in current_user_choices["subprocess_states"].values()
        )

        if all_completed:
            print("✅ All subprocesses completed.")
            return {
                "status": "completed_all",
                "message": "All subprocesses completed.",
                "process_understanding": current_user_choices["current_process_understanding"],
                "all_completed": True
            }

        # Get next subprocess
        remaining = [
            sp for sp in current_user_choices["subrpocess_list"]
            if current_user_choices["subprocess_states"].get(sp) != "completed"
        ]
        next_subprocess = remaining[0]
        current_user_choices["current_subprocess"] = next_subprocess

        followups = generate_suggested_questions(
            user_choices=current_user_choices,
            sub_process_name=next_subprocess,
            rag_context=rag_context,
            conversation_history=[]
        )
        next_question = followups[0] if followups else "[No further questions generated]"

        current_user_choices["conversation_history"] = [{
            "question": next_question,
            "answer": "",
            "followups": []
        }]

        current_user_choices["current_process_understanding"] = generate_process_understanding(
            current_user_choices["conversation_history"]
        )

        print(f"➡️ Switched to subprocess: {next_subprocess}")
        return {
            "status": "continue",
            "next_question": next_question,
            "current_subprocess": next_subprocess,
            "process_understanding": current_user_choices["current_process_understanding"],
            "all_completed": False
        }

    except Exception as e:
        print(f"❌ Failed to submit answer: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/revise_process_understanding")
async def revise_process_understanding_endpoint(payload: ProcessUnderstandingFeedback):
    try:
        history = current_user_choices.get("conversation_history", [])
        current_summary = current_user_choices.get("current_process_understanding", "")
        user_input = payload.user_input

        revised_summary = revise_process_understanding(
            conversation_history=history,
            user_input=user_input,
            current_understanding=current_summary
        )

        current_user_choices["current_process_understanding"] = revised_summary

        return {"updated_process_understanding": revised_summary}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/generate_process_recommendation")
async def generate_process_recommendation_endpoint():
    try:
        history = current_user_choices.get("conversation_history", [])
        if not history:
            raise HTTPException(status_code=400, detail="No conversation history available.")

        recommendation = generate_process_recommendation(history)
        current_user_choices["current_process_recommendation"] = recommendation

        return {"process_recommendation": recommendation}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/revise_process_recommendation")
async def revise_process_recommendation_endpoint(payload: RecommendationFeedback):
    try:
        current_rec = current_user_choices.get("current_process_recommendation", "")
        user_input = payload.user_input

        if not current_rec:
            raise HTTPException(status_code=400, detail="No recommendation to revise.")

        updated_rec = revise_process_recommendation(user_input, current_rec)
        current_user_choices["current_process_recommendation"] = updated_rec

        return {"updated_process_recommendation": updated_rec}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

