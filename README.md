# RAGChatbot

A full-stack chatbot application that enables users to **upload PDF documents**, ask questions about their content, and receive both **text** and **AI-generated verbal responses** using **Retrieval-Augmented Generation (RAG)**.

---

## 🚀 Features

- 📂 **PDF Upload**: Drag-and-drop interface for uploading PDF files.  
- 🔎 **RAG Pipeline**:  
  - Extracts text from PDFs  
  - Generates embeddings with **Sentence-Transformers**  
  - Stores embeddings in **FAISS** for efficient query retrieval  
- 💬 **Text and Voice Responses**:  
  - Text answers powered by **Hugging Face Inference API**  
  - Voice responses generated using **ElevenLabs Text-to-Speech API**  
- 🎨 **Responsive UI**: Built with **React** + **Tailwind CSS** for a smooth chat experience.  

---

## 🛠️ Tech Stack

### Frontend
- JavaScript, React, Tailwind CSS  
- Axios, React-Dropzone  

### Backend
- Node.js, Express.js  
- Python, PyPDF2, Sentence-Transformers, FAISS  
- Python-Shell (for Node–Python integration)  

### APIs
- Hugging Face Inference API  
- ElevenLabs Text-to-Speech API  

### Database
- MongoDB *(optional, for metadata storage)*  

---

## 📦 Project Structure

