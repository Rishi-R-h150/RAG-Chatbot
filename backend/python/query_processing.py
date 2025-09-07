import sys
from sentence_transformers import SentenceTransformer
import faiss
import pickle
import numpy as np
from dotenv import load_dotenv
import os
from huggingface_hub import InferenceClient


# === Load FAISS index and text chunks ===
def load_faiss_index(index_path="faiss_index.bin"):
    return faiss.read_index(index_path)

def load_chunks(chunks_path="chunks.pkl"):
    with open(chunks_path, 'rb') as f:
        return pickle.load(f)

# === Find relevant chunks ===
def query_retrieval(query, index, chunks):
    model = SentenceTransformer('all-MiniLM-L6-v2')
    query_embedding = model.encode([query])[0].astype('float32')
    distances, indices = index.search(np.array([query_embedding]), 3)
    return [chunks[i] for i in indices[0]]

# === Call Hugging Face Inference API (chat) ===
def call_chat_completion_hf(query, context):
    load_dotenv()
    hf_token = os.getenv("HUGGINGFACE_API_KEY")
    if not hf_token:
        return "Error: HF_TOKEN not set in environment."

    try:
        client = InferenceClient(
            provider="nscale",  
            api_key=hf_token,
        )

        prompt = f"""You are a helpful assistant. Use the context below to answer the user's question.

Context:
{context}

Question: {query}
Answer:"""

        completion = client.chat.completions.create(
            model="deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B",
            messages=[
                {"role": "user", "content": prompt}
            ],
        )

        return completion.choices[0].message.content

    except Exception as e:
        return f"Error calling Hugging Face chat model: {str(e)}"

# === Main entry point ===
if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Error: Please provide a query")
        sys.exit(1)

    query = sys.argv[1]
    index = load_faiss_index()
    chunks = load_chunks()
    relevant_chunks = query_retrieval(query, index, chunks)
    context = "\n\n".join(relevant_chunks)

    response = call_chat_completion_hf(query, context)
    print(response)
