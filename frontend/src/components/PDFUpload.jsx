import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';

const PDFUpload = ({ onUploadSuccess }) => {
const [message, setMessage] = useState('');
const [isLoading, setIsLoading] = useState(false);

const onDrop = async (acceptedFiles) => {
    console.log(acceptedFiles)
    const file = acceptedFiles[0];
    if (!file) return;

    setIsLoading(true);
    setMessage('');

    const formData = new FormData();
    formData.append('pdf', file);

    try {
    const response = await axios.post('http://localhost:5000/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
    setMessage('PDF uploaded successfully!');
    onUploadSuccess(response.data.text); // Pass extracted text to parent
    } catch (error) {
    setMessage('Error uploading PDF: ' + (error.response?.data?.error || error.message));
    } finally {
    setIsLoading(false);
    }
};

const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { 'application/pdf': ['.pdf'] },
    onDrop,
    multiple: false,
});

return (
    <div className="p-4">
    <div
        {...getRootProps()}
        className={`border-2 border-dashed p-6 rounded-lg text-center ${
        isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
        }`}
    >
        <input {...getInputProps()} />
        {isDragActive ? (
        <p className="text-blue-500">Drop the PDF here...</p>
        ) : (
        <p className="text-gray-600">
            Drag & drop a PDF file here, or click to select one
        </p>
        )}
    </div>
    {isLoading && <p className="mt-2 text-blue-500">Processing...</p>}
    {message && (
        <p className={`mt-2 ${message.includes('Error') ? 'text-red-500' : 'text-green-500'}`}>
        {message}
        </p>
    )}
    </div>
);
};

export default PDFUpload;