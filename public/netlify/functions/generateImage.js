const axios = require('axios');

exports.handler = async function (event, context) {
  const apiKey = process.env.HUGGINGFACE_API_KEY;
  const model = 'black-forest-labs/FLUX.1-dev'; 
  const input = JSON.parse(event.body).input; 

  try {
    const response = await axios.post(
      `https://api-inference.huggingface.co/models/${model}`,
      { inputs: input },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
      }
    );
    return {
      statusCode: 200,
      body: JSON.stringify(response.data),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
