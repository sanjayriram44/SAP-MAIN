import os
import logging
import traceback
from dotenv import load_dotenv

from langchain_ollama import OllamaEmbeddings
from langchain_google_genai import ChatGoogleGenerativeAI



load_dotenv(dotenv_path=".env", override=True)

os.environ["GOOGLE_API_KEY"] = os.getenv("GOOGLE_API_KEY")
os.environ["HUGGINGFACE_API_KEY"] = os.getenv("HUGGINGFACE_API_KEY")
logger = logging.getLogger(__name__)




class Model:
    def llm(self):
        try:
            return ChatGoogleGenerativeAI(
    model="gemini-2.5-flash",
)

                
            
        except Exception as e:
            raise Exception(f"LLM Init Error: {e}\n{traceback.format_exc()}")

    

    def embedding(self):
        try:
            return OllamaEmbeddings(model="nomic-embed-text")  # or any local embedding model you've pulled
        except Exception as e:
            raise Exception(f"Embedding Init Error: {e}\n{traceback.format_exc()}")



mode_instance = Model()
llm_instance = mode_instance.llm() 
embeddings_instance = mode_instance.embedding()
