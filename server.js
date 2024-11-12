import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 3000;

app.use(express.json());
app.use(express.static('public'));

const API_URL = "https://api-inference.huggingface.co/models/black-forest-labs/FLUX.1-dev";
const headers = {
  "Authorization": `Bearer ${process.env.HUGGINGFACE_API_KEY}`
};

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.post('/generate', async (req, res) => {
  try {
    const { text } = req.body;
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify({ inputs: text })
    });

    if (!response.ok) {
      throw new Error('Failed to generate image');
    }

    const buffer = await response.buffer();
    res.type('image/jpeg').send(buffer);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});