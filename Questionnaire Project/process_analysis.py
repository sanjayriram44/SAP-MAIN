from core.models import llm_instance

def generate_process_understanding(conversation_history: list) -> str:
    """
    Generates a bullet-point summary of the user's As-Is process understanding.
    """
    history_str = ""
    for i, item in enumerate(conversation_history, 1):
        history_str += f"Q{i}: {item['question']}\nA{i}: {item['answer']}\n"
        for j, fup in enumerate(item.get("followups", []), 1):
            history_str += f"  ↳ F{j}: {fup['question']}\n     A: {fup['answer']}\n"

    prompt = (
        "You are a SAP consultant. Based on the following discovery conversation, "
        "summarize the client's current sourcing process as bullet points.\n\n"
        f"{history_str}\n"
        "Return a clear, structured bullet-point summary of the user's current (As-Is) process understanding."
    )

    response = llm_instance.invoke(prompt)
    return response.content.strip()


def revise_process_understanding(conversation_history: list, user_input: str, current_understanding: str) -> str:
    """
    Updates the process understanding summary based on user input.
    """
    correction_prompt = (
        "You are a SAP consultant. Below is the current summary of the client's sourcing process:\n\n"
        f"{current_understanding}\n\n"
        "The user has provided the following corrections or additions:\n"
        f"{user_input}\n\n"
        "Please revise the process understanding summary by integrating these changes. "
        "Return the updated summary as a clear bullet-point list."
    )

    response = llm_instance.invoke(correction_prompt)
    return response.content.strip()

def generate_process_recommendation(conversation_history: list) -> str:
    """
    Generates two detailed SAP Ariba process recommendation options based on discovery conversation.
    """
    history_str = ""
    for item in conversation_history:
        history_str += f"Q: {item['question']}\nA: {item['answer']}\n"
        for f in item.get("followups", []):
            history_str += f"↳ Follow-up: {f['question']}\nAnswer: {f['answer']}\n"

    design_prompt = (
        "You are a senior SAP Ariba consultant in a BBP discovery session.\n\n"
        "Your task:\n"
        "Based on the discovery Q&A below, create **two distinct and actionable process recommendation options** "
        "for SAP Ariba Sourcing, tailored to the client's current sourcing practices, maturity level, and business goals.\n\n"
        "Instructions:\n"
        "- Structure each option in markdown with headings and bullet points.\n"
        "- Use precise SAP Ariba terminology.\n"
        "- Focus on actionable design changes: templates, workflows, roles, approvals, and integrations.\n"
        "- Avoid general advice. Reflect insights from the conversation.\n"
        "- Option 1: A standardized, scalable enterprise-grade setup.\n"
        "- Option 2: A minimal, flexible setup for quick adoption or pilot use.\n"
        "- Never use the word 'To-Be'. Title the section only as 'Process Recommendation'.\n\n"
        "Discovery Q&A:\n"
        f"{history_str}"
    )

    response = llm_instance.invoke(design_prompt)
    return response.content.strip()

def revise_process_recommendation(user_input: str, current_recommendation: str) -> str:
    """
    Updates the process recommendation based on user input.
    """
    revision_prompt = (
        "You are a SAP Ariba consultant. Below is the current process recommendation:\n\n"
        f"{current_recommendation}\n\n"
        "The user has provided the following correction or clarification:\n"
        f"{user_input}\n\n"
        "Please regenerate the updated process recommendation, integrating the input, and structure it as a detailed design."
    )

    response = llm_instance.invoke(revision_prompt)
    return response.content.strip()
