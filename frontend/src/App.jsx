import React, { useState } from 'react';
import PDFUpload from './components/PDFUpload';
import ChatInterface from './components/ChatInterface';
import './index.css';

function App() {
  const [extractedText, setExtractedText] = useState('');

  const handleUploadSuccess = (text) => {
    setExtractedText(text);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center p-4">
      <h1 className="text-3xl font-bold mb-6">RAG Chatbot</h1>
      <div className="w-full max-w-2xl">
        <PDFUpload onUploadSuccess={handleUploadSuccess} />
        <ChatInterface extractedText={extractedText} />
      </div>
    </div>
  );
}

export default App;