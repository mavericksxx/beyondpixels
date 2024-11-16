import fetch from 'node-fetch';

const API_URL = "https://api-inference.huggingface.co/models/black-forest-labs/FLUX.1-dev";
const headers = {
  "Authorization": `Bearer ${process.env.HUGGINGFACE_API_KEY}`
};

// Validate environment variables on initialization
if (!process.env.HUGGINGFACE_API_KEY) {
  throw new Error('HUGGINGFACE_API_KEY is not set in environment variables');
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    console.log('Generate function called');
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
    console.error('Error in generate function:', error);
    res.status(500).json({ 
      error: 'Failed to generate image',
      details: error.message
    });
  }
}