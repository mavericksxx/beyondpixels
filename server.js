import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static('public'));

// Validate environment variables on startup
if (!process.env.HUGGINGFACE_API_KEY) {
  console.error('HUGGINGFACE_API_KEY is not set in environment variables');
  process.exit(1);
}

const API_URL = "https://api-inference.huggingface.co/models/black-forest-labs/FLUX.1-dev";
const headers = {
  "Authorization": `Bearer ${process.env.HUGGINGFACE_API_KEY}`
};

app.post('/generate', async (req, res) => {
  console.log('Generate endpoint called');
  try {
    console.log('Request body:', JSON.stringify(req.body));
    
    if (!req.body || !req.body.text) {
      console.error('Invalid request body');
      return res.status(400).json({ error: 'Invalid request. Text is required.' });
    }

    console.log('Making request to Hugging Face API...');
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify({ inputs: req.body.text })
    });

    console.log('Hugging Face API response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Hugging Face API error:', {
        status: response.status,
        statusText: response.statusText,
        body: errorText
      });
      throw new Error(`Hugging Face API error: ${response.status} ${errorText}`);
    }

    console.log('Successfully received image from Hugging Face');
    const buffer = await response.buffer();
    res.type('image/jpeg').send(buffer);

  } catch (error) {
    console.error('Error in generate endpoint:', error);
    res.status(500).json({ 
      error: 'Failed to generate image',
      details: error.message
    });
  }
});

// Add a health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', env: process.env.NODE_ENV });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
  console.log('Environment:', process.env.NODE_ENV);
  console.log('Hugging Face API key configured:', !!process.env.HUGGINGFACE_API_KEY);
});

// Handle uncaught errors
process.on('unhandledRejection', (error) => {
  console.error('Unhandled rejection:', error);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught exception:', error);
});