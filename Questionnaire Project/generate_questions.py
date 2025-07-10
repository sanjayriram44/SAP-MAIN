from core.models import llm_instance
from persona_prompt import QUESTION_PERSONA
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
            history_text += f"  \u21b3 Follow-up {j}: {fup['question']}\n"
            history_text += f"     Answer: {fup['answer']}\n"
    return history_text.strip()

def generate_suggested_questions(user_choices: dict, rag_context: str, conversation_history: list, sub_process_name: str) -> list:
    """
    Generate the next suggested discovery question(s).
    """
    try:
        formatted_history = format_history_for_prompt(conversation_history)

        # Inject probing focus
        probing_focus = get_llm_probing_focus(sub_process_name, user_choices)

        context_for_prompt = {
            "user_choices": user_choices,
            "rag_context": rag_context,
            "conversation_history": formatted_history,
            "sub_process_name": sub_process_name,
            "probing_focus": probing_focus
        }

        # CORRECTED: unpack context as kwargs
        formatted_prompt = QUESTION_PERSONA.format_messages(**context_for_prompt)
        

        formatted_prompt = QUESTION_PERSONA.format_messages(**context_for_prompt)

        # Detect type of prompt backend and convert
        try:
            # Option 1: try sending as OpenAI-style messages
            raw_messages = [msg.to_dict() for msg in formatted_prompt]
            response = llm_instance.invoke(raw_messages)
        except Exception:
            # Option 2: fallback to just sending plain text
            response = llm_instance.invoke(formatted_prompt[0].content)

        


        lines = response.content.strip().split("\n")
        questions = [
            line.strip("-•* ").strip()
            for line in lines if line.strip()
        ]

        return questions

    except Exception as e:
        return [f"[Error generating suggested questions: {e}]"]
