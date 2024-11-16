const fetch = require("node-fetch");

exports.handler = async function (event, context) {
  const { prompt } = JSON.parse(event.body);
  const response = await fetch("https://api-inference.huggingface.co/models/black-forest-labs/FLUX.1-dev", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ inputs: prompt }),
  });

  const data = await response.json();

  return {
    statusCode: 200,
    body: JSON.stringify(data),
  };
};
