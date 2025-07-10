from core.models import llm_instance
from persona_prompt import QUESTION_PERSONA  # If this still defines your persona text
from probing_focus import get_llm_probing_focus


def format_history_for_prompt(conversation_history: list) -> str:
    """
    Convert structured Q&A history (including follow-ups) into a readable string for the LLM.
    """
    history_text = ""
    for i, entry in enumerate(conversation_history, 1):
        history_text += f"Q{i}: {entry['question']}\n"
        history_text += f"A{i}: {entry['answer']}\n"
        for j, fup in enumerate(entry.get("followups", []), 1):
            history_text += f"  ↳ Follow-up {j}: {fup['question']}\n"
            history_text += f"     Answer: {fup['answer']}\n"
    return history_text.strip()


def generate_suggested_questions(
    user_choices: dict,
    rag_context: str,
    conversation_history: list,
    sub_process_name: str
) -> list:
    """
    Generate the next suggested discovery question using:
    - User choices (filters)
    - RAG document chunks
    - Previous Q&A history (including follow-ups)
    - Subprocess name to scope the discussion
    """
    try:
        # Format the history and probing cues
        formatted_history = format_history_for_prompt(conversation_history)
        probing_focus = get_llm_probing_focus(subprocess=sub_process_name, user_choices=user_choices)

        # Build system persona
        system_prompt = (
            "You are a senior SAP Functional Consultant conducting a discovery workshop "
            "for a client implementing SAP Ariba Sourcing. Your role is to ask intelligent, "
            "structured questions to uncover their current 'As-Is' sourcing process."
        )

        # Build user message prompt
        user_prompt = f"""
Inputs:
- Product: {user_choices.get('product')}
- Module: {user_choices.get('module')}
- Questionnaire Type: {user_choices.get('questionnaire_type')}
- Industry: {user_choices.get('industry')}
- Company Size: {user_choices.get('company_size')}
- Sub-Process in Focus: {sub_process_name}
- Probing Focus: {probing_focus}

--- RAG Context ---
{rag_context or '[No documents retrieved]'}
--- End ---

--- Conversation History ---
{formatted_history or '[No prior questions]'}
--- End ---

Based on all the above, generate the **next 3 meaningful discovery questions** that help document the client's current process in detail. Use plain text format. Keep each question on a new line. Don't number or bullet them.
"""

        # Create full prompt for Gemini
        prompt = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt}
        ]

        print("🧠 formatted_prompt =", prompt)

        # Call the LLM
        response = llm_instance.invoke(prompt)

        # Extract and clean the questions
        lines = response.content.strip().split("\n")
        questions = [
            line.strip("-•* ").strip()
            for line in lines
            if line.strip()
        ]

        return questions

    except Exception as e:
        print(f"[🔥 ERROR]: generate_suggested_questions() failed – {e}")
        return [f"[Error generating suggested questions: {e}]"]
