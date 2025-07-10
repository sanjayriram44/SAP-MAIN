current_user_choices = {
    # Static metadata
    "product": "SAP Ariba",
    "module": "Sourcing",
    "activity": "BBP Generation",
    "questionnaire_type": "Standard Questionnaire",
    "industry": "Energy",
    "company_size": "Large",
    "scope": "Local",
    "erp_landscape": "Single ERP",
    "structure": "Simple",
    "execution": "Engineer-to-Order",
    "governance_model": "Manual",
    "risk_level": "Low",
    "maturity": "Basic",
    "focus": "ESG",
    "bbp_generation_journey": "llm-interview",
    "organization_scope": "Global, Multi-ERP, Joint Ventures",
    "supply_chain_complexity": "High, Engineer-to-Order, Long-lead Equipment",
    "compliance_risk_governance": "High, Mandatory, Manual, Risk thresholds defined",
    "sustainability_objectives": "Advanced, ESG Included, High Supplier Collaboration",

    # Dynamic session state
    "current_subprocess": "",
    "subprocess_list": [],
    "subprocess_states": {},  # <-- new: { "Subprocess A": "completed", "Subprocess B": "incomplete", ... }
    "conversation_history": [],
    "current_process_understanding": "",
    "rag_context": None,
    "current_process_recommendation": ""
}
