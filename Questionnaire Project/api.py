import os
import shutil
from typing import List, Dict
from fastapi import FastAPI, HTTPException, Body, UploadFile, File, Response
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from fastapi.responses import FileResponse
from docx import Document
import uvicorn
from pydantic import BaseModel
from generate_bbp import generate_bbp_from_process_analysis
from save_conversation import save_conversation_to_excel, save_conversation_to_word
from save_analysis import save_individual_and_combined_analysis
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
        subprocesses = extract_subprocesses()
        if not subprocesses:
            raise HTTPException(status_code=404, detail="No subprocesses found")

        current_user_choices["subprocess_list"] = subprocesses
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

        return {
            "current_subprocess": subprocesses[0],
            "index": 1,
            "total": len(subprocesses),
            "progress_percent": round(1 / len(subprocesses) * 100),
            "suggested_question": first_question,
            "all_completed": False
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/submit_answer")
async def submit_answer(payload: AnswerPayload):
    answer = payload.answer
    try:
        history = current_user_choices.get("conversation_history", [])
        rag_context = current_user_choices["rag_context"]
        current_subprocess = current_user_choices["current_subprocess"]

        if not history:
            raise HTTPException(status_code=400, detail="No conversation history found.")

        history[-1]["answer"] = answer

        if "conversation_map" not in current_user_choices:
            current_user_choices["conversation_map"] = {}
        current_user_choices["conversation_map"][current_subprocess] = history[-1]
        current_user_choices["subprocess_states"][current_subprocess] = "completed"

        current_user_choices["current_process_understanding"] = generate_process_understanding(history)
        current_user_choices["current_process_recommendation"] = generate_process_recommendation(history)

        all_completed = all(
            state == "completed"
            for state in current_user_choices["subprocess_states"].values()
        )

        if all_completed:
            return {
                "status": "completed_all",
                "message": "All subprocesses completed.",
                "process_understanding": current_user_choices["current_process_understanding"],
                "process_recommendation": current_user_choices["current_process_recommendation"],
                "all_completed": True
            }

        remaining = [
            sp for sp in current_user_choices["subprocess_list"]
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

        return {
            "status": "continue",
            "next_question": next_question,
            "current_subprocess": next_subprocess,
            "process_understanding": current_user_choices["current_process_understanding"],
            "process_recommendation": current_user_choices["current_process_recommendation"],
            "all_completed": False
        }

    except Exception as e:
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

@app.get("/generate_bbp_from_process_analysis")
async def generate_bbp_from_process_analysis_endpoint():
    try:
        process_understanding = current_user_choices.get("current_process_understanding", "")
        process_recommendation = current_user_choices.get("current_process_recommendation", "")
        if not process_understanding or not process_recommendation:
            raise HTTPException(status_code=400, detail="Missing content.")
        bbp_content, image_map = generate_bbp_from_process_analysis(
            process_understanding=process_understanding,
            process_recommendation=process_recommendation
        )
        return {"bbp_content": bbp_content, "image_map": image_map}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"BBP generation failed: {str(e)}")

@app.get("/export_qna_excel")
async def export_qna_excel():
    try:
        qna_map = current_user_choices.get("conversation_map", {})
        if not qna_map:
            raise HTTPException(status_code=400, detail="No Q&A data.")
        for subprocess, entry in qna_map.items():
            if not entry.get("answer"):
                continue
            save_conversation_to_excel(subprocess, entry)
        return {
            "status": "excel_export_successful",
            "excel_path": "output/conversation_log.xlsx",
            "subprocesses": list(qna_map.keys())
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to export Excel: {str(e)}")

@app.get("/export_qna_word")
async def export_qna_word():
    try:
        qna_map = current_user_choices.get("conversation_map", {})
        if not qna_map:
            raise HTTPException(status_code=400, detail="No Q&A data.")
        save_conversation_to_word(qna_map)
        return {
            "status": "word_export_successful",
            "word_path": "output/qna_combined.docx",
            "subprocesses": list(qna_map.keys())
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to export Word doc: {str(e)}")

@app.get("/export_process_analysis_docs")
async def export_process_analysis_docs():
    try:
        pu = current_user_choices.get("current_process_understanding", "")
        pr = current_user_choices.get("current_process_recommendation", "")
        if not pu and not pr:
            raise HTTPException(status_code=400, detail="Missing content.")
        pu_path, pr_path, combined_path = save_individual_and_combined_analysis(pu, pr)
        return {
            "status": "export_successful",
            "files": {
                "process_understanding": pu_path,
                "process_recommendation": pr_path,
                "combined_summary": combined_path
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to export docs: {str(e)}")

@app.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    save_path = "BBP_Generation/uploads/qa_input.docx"
    with open(save_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    generate_bbp_from_qa()
    return Response(status_code=204)

@app.get("/get_bbp_document")
async def get_bbp_document():
    try:
        path = os.path.abspath("BBP_GENERATION/output/generated_bbp.docx")
        if not os.path.exists(path):
            raise HTTPException(status_code=404, detail="BBP document not found")
        doc = Document(path)
        full_text = "\n\n".join([para.text for para in doc.paragraphs if para.text.strip()])
        return {"content": full_text}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to read BBP: {str(e)}")



@app.post("/update_sap_product")
async def update_sap_product(product: str = Body(...)):
    try:
        current_user_choices["product"] = product
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Update failed: {str(e)}")

@app.post("/update_module")
async def update_module(module: str = Body(...)):
    try:
        current_user_choices["module"] = module
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Update failed: {str(e)}")

@app.post("/update_activity")
async def update_activity(activity: str = Body(...)):
    try:
        current_user_choices["activity"] = activity
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Update failed: {str(e)}")

@app.post("/update_customer_context")
async def update_customer_context(payload: Dict[str, Dict[str, str]]):
    try:
        context = payload.get("context", {})
        for key, value in context.items():
            current_user_choices[key] = value
        return {"status": "success"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Update failed: {str(e)}")

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
