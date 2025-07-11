import os
import docx
from docx.shared import Pt

OUTPUT_DIR = "output"
os.makedirs(OUTPUT_DIR, exist_ok=True)

def save_individual_and_combined_analysis(pu: str = "", pr: str = ""):
    pu_path = os.path.join(OUTPUT_DIR, "process_understanding.docx")
    pr_path = os.path.join(OUTPUT_DIR, "process_recommendation.docx")
    combined_path = os.path.join(OUTPUT_DIR, "process_analysis_summary.docx")

    def write_paragraph(doc, heading, text):
        doc.add_heading(heading, level=1)
        para = doc.add_paragraph(text)
        for run in para.runs:
            run.font.size = Pt(11)

    if pu:
        doc_pu = docx.Document()
        write_paragraph(doc_pu, "Process Understanding", pu)
        doc_pu.save(pu_path)

    if pr:
        doc_pr = docx.Document()
        write_paragraph(doc_pr, "Process Recommendation", pr)
        doc_pr.save(pr_path)

    if pu or pr:
        doc_combined = docx.Document()
        if pu:
            write_paragraph(doc_combined, "Process Understanding", pu)
        if pr:
            write_paragraph(doc_combined, "Process Recommendation", pr)
        doc_combined.save(combined_path)

    return pu_path, pr_path, combined_path
