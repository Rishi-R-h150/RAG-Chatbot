import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

const ChatInterface = ({ extractedText }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Update messages when extractedText changes
  useEffect(() => {
    if (extractedText) {
      setMessages([{ sender: 'bot', text: 'PDF processed! Ready to answer questions.' }]);
    }
  }, [extractedText]);

  // Scroll to the latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    setMessages([...messages, { sender: 'user', text: input }]);
    setIsLoading(true);

    try {
      const response = await axios.post('http://localhost:5000/query', { question: input });
      setMessages((prev) => [...prev, { sender: 'bot', text: response.data.answer }]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        { sender: 'bot', text: 'Error: ' + (error.response?.data?.error || error.message) },
      ]);
    } finally {
      setIsLoading(false);
      setInput('');
    }
  };

  return (
    <div className="flex flex-col h-96 border rounded-lg p-4 bg-gray-50">
      <div className="flex-1 overflow-y-auto mb-4">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`mb-2 ${msg.sender === 'user' ? 'text-right' : 'text-left'}`}
          >
            <span
              className={`inline-block p-2 rounded-lg ${
                msg.sender === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-200'
              }`}
            >
              {msg.text}
            </span>
          </div>
        ))}
        {isLoading && <div className="text-center text-blue-500">Processing...</div>}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={handleSend} className="flex">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-1 p-2 border rounded-l-lg focus:outline-none"
          placeholder="Ask a question about the PDF..."
          disabled={isLoading}
        />
        <button
          type="submit"
          className="p-2 bg-blue-500 text-white rounded-r-lg hover:bg-blue-600"
          disabled={isLoading}
        >
          Send
        </button>
      </form>
    </div>
  );
};

export default ChatInterface;