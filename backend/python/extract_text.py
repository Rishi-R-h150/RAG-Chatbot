import sys
import PyPDF2
from sentence_transformers import SentenceTransformer
import faiss
import numpy as np
import pickle
import os

def extract_text_from_pdf(pdf_path):
    try:
        with open(pdf_path, 'rb') as file:
            reader = PyPDF2.PdfReader(file)
            text = ""
            for page in reader.pages:
                page_text = page.extract_text() or ""
                text += page_text + "\n"
            return text
    except Exception as e:
        return f"Error extracting text: {str(e)}"

def chunk_text(text, chunk_size=500):
    words = text.split()
    chunks = []
    for i in range(0, len(words), chunk_size):
        chunk = " ".join(words[i:i + chunk_size])
        chunks.append(chunk)
    return chunks

def generate_embeddings(chunks):
    model = SentenceTransformer('all-MiniLM-L6-v2')
    embeddings = model.encode(chunks, show_progress_bar=True)
    return embeddings

def store_in_faiss(embeddings, chunks, index_path="faiss_index.bin", chunks_path="chunks.pkl"):
    dimension = embeddings.shape[1]
    index = faiss.IndexFlatL2(dimension)
    index.add(embeddings)
    faiss.write_index(index, index_path)
    with open(chunks_path, 'wb') as f:
        pickle.dump(chunks, f)
    return index_path, chunks_path

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Error: Please provide a PDF file path")
        sys.exit(1)

    pdf_path = sys.argv[1]
    text = extract_text_from_pdf(pdf_path)
    
    if text.startswith("Error"):
        print(text)
        sys.exit(1)

    # Chunk text
    chunks = chunk_text(text)
    if not chunks:
        print("Error: No text chunks created")
        sys.exit(1)

    # Generate embeddings
    embeddings = generate_embeddings(chunks)

    # Store in FAISS
    index_path, chunks_path = store_in_faiss(embeddings, chunks)
    print(f"Embeddings stored in {index_path}, chunks saved in {chunks_path}")
    print(text)