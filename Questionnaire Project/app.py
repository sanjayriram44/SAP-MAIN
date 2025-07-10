import streamlit as st
from generate_suggested_questions import generate_suggested_questions
from generate_followups import generate_next_followup
from vector_utils import build_rag_context
from extract_subprocesses import extract_subprocesses
from user_choices import current_user_choices
from process_analysis import generate_process_understanding, revise_process_understanding, generate_process_recommendation, revise_process_recommendation

# Page config
st.set_page_config(page_title="SAP BBP Discovery Assistant", layout="wide")
st.title("📘 SAP BBP Discovery Assistant - Sub-Process Mode")

# Initialize session state
if "conversation_history" not in st.session_state:
    st.session_state.conversation_history = []
    st.session_state.current_question = ""
    st.session_state.step = "question"
    st.session_state.process_understanding = ""
    st.session_state.process_recommendation = ""
    st.session_state.followup_index = 0
    st.session_state.followup_questions = []
    st.session_state.temp_main_answer = ""

if "subprocess_list" not in st.session_state:
    st.session_state.subprocess_list = extract_subprocesses()
    st.session_state.current_subprocess_index = 0

if "selected_subprocess" not in st.session_state:
    st.session_state.selected_subprocess = st.session_state.subprocess_list[0]

if "rag_context" not in st.session_state or not st.session_state.rag_context:
    with st.spinner("Loading documents and building context..."):
        st.session_state.rag_context = build_rag_context()

# View subprocess list
with st.expander("📄 View All Sub-Processes"):
    for idx, sp in enumerate(st.session_state.subprocess_list, 1):
        st.markdown(f"{idx}. {sp}")

# Step 1: Generate Suggested Question
if st.session_state.step == "question":
    st.session_state.selected_subprocess = st.session_state.subprocess_list[st.session_state.current_subprocess_index]
    with st.spinner("Generating suggested question..."):
        suggested = generate_suggested_questions(
            user_choices=current_user_choices,
            sub_process_name=st.session_state.selected_subprocess,
            rag_context=st.session_state.rag_context,
            conversation_history=st.session_state.conversation_history
        )
        if suggested:
            st.session_state.current_question = suggested[0]
            st.session_state.followup_questions = []
            st.session_state.followup_index = 0
            st.session_state.step = "await_answer"
        else:
            st.session_state.current_subprocess_index += 1
            if st.session_state.current_subprocess_index >= len(st.session_state.subprocess_list):
                st.success("✅ All subprocesses completed!")
                st.stop()
            else:
                st.session_state.step = "question"
                st.rerun()

# Step 2: Await Main Answer
if st.session_state.step == "await_answer":
    st.markdown(f"###  Sub-Process: {st.session_state.selected_subprocess}")
    st.subheader("💬 Suggested Question")
    st.markdown(f"**Question:** {st.session_state.current_question}")
    main_answer = st.text_area("Your Answer")

    col1, col2 = st.columns([3, 1])
    with col1:
        if st.button("Submit Main Answer"):
            if not main_answer.strip():
                st.warning("⚠️ Please enter an answer before proceeding.")
            else:
                st.session_state.temp_main_answer = main_answer
                st.session_state.step = "followups"

                # Update conversation history
                st.session_state.conversation_history.append({
                    "question": st.session_state.current_question,
                    "answer": main_answer,
                    "followups": []
                })

                # Update Process Understanding
                with st.spinner("🔍 Updating Process Understanding..."):
                    convo = st.session_state.conversation_history
                    st.session_state.process_understanding = generate_process_understanding(convo)

                # Generate first follow-up
                with st.spinner("⏳ Generating follow-up question..."):
                    first_fup = generate_next_followup(
                        question=st.session_state.current_question,
                        answer=main_answer,
                        prior_followups=[],
                        rag_context=st.session_state.rag_context,
                        conversation_history=st.session_state.conversation_history
                    )
                    if first_fup:
                        st.session_state.followup_questions.append({"question": first_fup, "answer": ""})

                st.rerun()

    with col2:
        if st.button("➡️ Next Sub-Process"):
            st.session_state.current_subprocess_index += 1
            st.session_state.step = "question"
            st.session_state.followup_index = 0
            st.session_state.followup_questions = []
            st.session_state.temp_main_answer = ""
            for i in range(10):
                st.session_state.pop(f"fup_answer_{i}", None)
            st.rerun()


# Step 3: Follow-Up Questions
if st.session_state.step == "followups":
    st.markdown(f"### Sub-Process: {st.session_state.selected_subprocess}")
    st.subheader("💬 Suggested Question")
    st.markdown(f"**Question:** {st.session_state.current_question}")
    st.markdown(f"**Your Answer:** {st.session_state.temp_main_answer}")

    st.subheader("🔍 Follow-Up Questions")

    current_fup = st.session_state.followup_questions[st.session_state.followup_index]
    fup_key = f"fup_answer_{st.session_state.followup_index}"
    current_fup["answer"] = st.text_input(f"Follow-up: {current_fup['question']}", key=fup_key)

    if st.button("Submit Follow-Up Answer"):
        if not current_fup["answer"].strip():
            st.warning("⚠️ Please enter an answer.")
        else:
            # Save follow-up
            st.session_state.conversation_history[-1]["followups"].append(current_fup)
            st.session_state.followup_index += 1

            # Generate next follow-up
            with st.spinner("🔍 Checking for more follow-ups..."):
                next_fup = generate_next_followup(
                    question=st.session_state.current_question,
                    answer=st.session_state.temp_main_answer,
                    prior_followups=st.session_state.conversation_history[-1]["followups"],
                    rag_context=st.session_state.rag_context,
                    conversation_history=st.session_state.conversation_history
                )

                if next_fup:
                    st.session_state.followup_questions.append({"question": next_fup, "answer": ""})
                    st.rerun()
                else:
                    st.markdown("✅ All follow-up questions complete.")

                    if st.button("➡️ Next Sub-Process"):
                        st.session_state.current_subprocess_index += 1
                        st.session_state.step = "question"
                        st.session_state.followup_index = 0
                        st.session_state.followup_questions = []
                        st.session_state.temp_main_answer = ""
                        for i in range(10):
                            st.session_state.pop(f"fup_answer_{i}", None)
                        st.rerun()


# Step 4: Final Review and Next Subprocess
if st.session_state.step == "summary":
    st.markdown("## ✅ Current Sub-Process Complete")

    if st.button("➡️ Next Sub-Process"):
        st.session_state.current_subprocess_index += 1
        st.session_state.step = "question"
        st.session_state.followup_index = 0
        st.session_state.followup_questions = []
        st.session_state.temp_main_answer = ""
        for i in range(10):
            st.session_state.pop(f"fup_answer_{i}", None)
        st.rerun()

# ---- Always Show Understanding and Recommendation ----
st.divider()
st.markdown("## 🔍 Process Analysis")

col1, col2 = st.columns([1, 1])

with col1:
    st.markdown("### 🧾 Process Understanding")
    st.markdown(st.session_state.process_understanding)
    user_input = st.text_area("✏️ Add clarification or corrections", key="corrections_input")
    if st.button("🔁 Update Process Understanding"):
        updated = revise_process_understanding(
            conversation_history=st.session_state.conversation_history,
            user_input=user_input,
            current_understanding=st.session_state.process_understanding
        )
        st.session_state.process_understanding = updated
        st.rerun()
with col2:
    if st.button("🛠️ Generate Process Recommendation"):
        with st.spinner("⚙️ Generating process recommendation..."):
            st.session_state.process_recommendation = generate_process_recommendation(
                st.session_state.conversation_history
            )
            st.rerun()

    if st.session_state.process_recommendation:
        st.markdown("##### ✅ Process Recommendation")  # Smaller header, no 'To-Be'
        st.markdown(st.session_state.process_recommendation, unsafe_allow_html=True)  # Allow markdown formatting

        rec_input = st.text_area("✏️ Add clarifications or corrections", key="rec_input")
        if st.button("🔁 Update Process Recommendation"):
            updated_rec = revise_process_recommendation(
                current_recommendation=st.session_state.process_recommendation,
                user_input=rec_input
            )
            st.session_state.process_recommendation = updated_rec
            st.rerun()
