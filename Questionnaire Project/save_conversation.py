import os
import pandas as pd
import docx
import re

EXCEL_OUTPUT_PATH = "output/conversation_log.xlsx"
WORD_OUTPUT_PATH = "output/qna_combined.docx"

os.makedirs("output", exist_ok=True)

def clean_sheet_name(name):
    return re.sub(r'[\\/*?:\[\]]', '_', name)[:31]

def save_conversation_to_excel(subprocess_name, conversation_entry):
    data = []
    data.append({"Type": "Main", "Question": conversation_entry["question"], "Answer": conversation_entry["answer"]})
    for fup in conversation_entry.get("followups", []):
        data.append({"Type": "Follow-up", "Question": fup["question"], "Answer": fup["answer"]})

    df_new = pd.DataFrame(data)
    sheet_name = clean_sheet_name(subprocess_name)

    try:
        with pd.ExcelWriter(EXCEL_OUTPUT_PATH, engine='openpyxl', mode='a', if_sheet_exists='overlay') as writer:
            df_new.to_excel(writer, sheet_name=sheet_name, index=False, header=not writer.sheets.get(sheet_name))
    except FileNotFoundError:
        with pd.ExcelWriter(EXCEL_OUTPUT_PATH, engine='openpyxl', mode='w') as writer:
            df_new.to_excel(writer, sheet_name=sheet_name, index=False)

def save_conversation_to_word(conversation_map):
    doc = docx.Document()
    doc.add_heading("Combined Q&A Log", 0)

    for subprocess_name, entry in conversation_map.items():
        doc.add_heading(f"Subprocess: {subprocess_name}", level=1)
        doc.add_heading("Main Question", level=2)
        doc.add_paragraph(entry.get("question", ""))
        doc.add_heading("Answer", level=2)
        doc.add_paragraph(entry.get("answer", ""))
        followups = entry.get("followups", [])
        if followups:
            doc.add_heading("Follow-Up Questions", level=2)
            for i, fup in enumerate(followups, 1):
                doc.add_paragraph(f"{i}. Q: {fup.get('question', '')}", style='List Number')
                doc.add_paragraph(f"   A: {fup.get('answer', '')}")

    doc.save(WORD_OUTPUT_PATH)
