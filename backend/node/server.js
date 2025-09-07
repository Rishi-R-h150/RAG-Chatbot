const express = require('express');
const cors = require('cors');
const multer = require('multer');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const app = express();
const port = 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Set up storage for uploaded PDFs
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir);
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed!'), false);
    }
  },
});

// Test endpoint
app.get('/', (req, res) => {
  res.send('Backend server is running!');
});

// === PDF Upload Endpoint ===
app.post('/upload', upload.single('pdf'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No PDF file uploaded' });
  }

  const pdfPath = req.file.path;
  const pythonScriptPath = path.join(__dirname, '..', 'python', 'extract_text.py');
  const pythonExePath = path.join(__dirname, '..', 'python', 'venv', 'Scripts', 'python.exe');

  const pythonProcess = spawn(pythonExePath, [pythonScriptPath, pdfPath]);

  let extractedText = '';
  let errorText = '';

  pythonProcess.stdout.on('data', (data) => {
    extractedText += data.toString();
  });

  pythonProcess.stderr.on('data', (data) => {
    errorText += data.toString();
  });

  pythonProcess.on('close', (code) => {
    if (code === 0) {
      console.log('Extracted Text:', extractedText);
      res.json({ message: 'PDF uploaded and processed', text: extractedText });
    } else {
      console.error('Python script error:', errorText || 'Unknown error');
      res.status(500).json({ error: 'Error processing PDF', details: errorText });
    }
  });
});

// === Query Endpoint Using Hugging Face Chat Model ===
app.post('/query', (req, res) => {
  const { question } = req.body;
  if (!question) {
    return res.status(400).json({ error: 'No question provided' });
  }

  const pythonScriptPath = path.join(__dirname, '..', 'python', 'query_processing.py');
  const pythonExePath = path.join(__dirname, '..', 'python', 'venv', 'Scripts', 'python.exe');

  const pythonProcess = spawn(pythonExePath, [pythonScriptPath, question]);

  let result = '';
  let errorText = '';

  pythonProcess.stdout.on('data', (data) => {
    result += data.toString();
  });

  pythonProcess.stderr.on('data', (data) => {
    errorText += data.toString();
  });

  pythonProcess.on('close', (code) => {
    if (code === 0) {
      const finalAnswer = result.trim();
      res.json({ answer: finalAnswer });
    } else {
      console.error('Query Python script error:', errorText || 'Unknown error');
      res.status(500).json({ error: 'Error processing query', details: errorText });
    }
  });
});

// Start server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
