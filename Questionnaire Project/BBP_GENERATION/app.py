import streamlit as st
import os
import base64
from generate_bbp import generate_bbp_from_qa

# Constants
UPLOAD_DIR = "uploads"
OUTPUT_DIR = "output"
BBP_DOC_PATH = os.path.join(OUTPUT_DIR, "generated_bbp.docx")

os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs(OUTPUT_DIR, exist_ok=True)

# Streamlit Config
st.set_page_config(page_title="SAP Ariba BBP Generator", layout="wide")
st.title("📘 SAP Ariba Sourcing BBP Generator")

# Upload Section
uploaded_file = st.file_uploader("📤 Upload BBP Q&A Sheet (.docx)", type=["docx"])
if uploaded_file:
    qa_path = os.path.join(UPLOAD_DIR, "qa_input.docx")
    with open(qa_path, "wb") as f:
        f.write(uploaded_file.read())
    st.success("✅ File uploaded!")

    if st.button("🚀 Generate BBP"):
        with st.spinner("Generating BBP..."):
            bbp_text, diagram_map = generate_bbp_from_qa(qa_path)

        if bbp_text:
            st.success("🎉 BBP generated!")

            # === BBP TEXT PREVIEW ===
            st.subheader("📝 Business Blueprint (Text)")
            # Remove mermaid blocks for clean text
            import re
            text_only = re.sub(r"```mermaid\n(.*?)```", "", bbp_text, flags=re.DOTALL)
            st.markdown(text_only.strip(), unsafe_allow_html=True)

            # === DIAGRAM SECTION ===
            if diagram_map:
                st.subheader("🖼️ Process Flow Diagrams")
                for idx, (placeholder, path) in enumerate(diagram_map.items(), start=1):
                    if os.path.exists(path):
                        st.image(path, caption=f"Diagram {idx}", use_container_width=True)
                    else:
                        st.warning(f"⚠️ Diagram {idx} not found.")

            # === DOWNLOAD SECTION ===
            st.subheader("⬇️ Download Your Files")

            # Word document
            if os.path.exists(BBP_DOC_PATH):
                with open(BBP_DOC_PATH, "rb") as f:
                    b64 = base64.b64encode(f.read()).decode()
                    st.markdown(
                        f'<a href="data:application/octet-stream;base64,{b64}" download="generated_bbp.docx">📄 Download Word Document</a>',
                        unsafe_allow_html=True,
                    )

            # Diagrams
            for key, path in diagram_map.items():
                if os.path.exists(path):
                    with open(path, "rb") as img_file:
                        b64_img = base64.b64encode(img_file.read()).decode()
                        st.markdown(
                            f'<a href="data:image/png;base64,{b64_img}" download="{os.path.basename(path)}">🖼️ Download {os.path.basename(path)}</a>',
                            unsafe_allow_html=True,
                        )
        else:
            st.error("❌ BBP generation failed.")
