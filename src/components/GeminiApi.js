import axios from 'axios';


const callGeminiApi = async (prompt) => {
  // Extract the latest message (last message in the chain)
  const latestMessage = prompt.split(' ').slice(-50).join(' ').toLowerCase();

 

  const apiKey = process.env.REACT_APP_GEMINI_API_KEY;

  if (!apiKey) {
    console.error('Gemini API key is not set');
    return 'API key is missing. Please set REACT_APP_GEMINI_API_KEY in your .env file.';
  }

  const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`;

  try {
    const requestBody = {
      contents: [
        {
          parts: [
            {
              text: prompt, // The entire conversation context
            }
          ]
        }
      ]
    };

    const response = await axios.post(apiUrl, requestBody, {
      headers: {
        'Content-Type': 'application/json',
      }
    });

    const answer = response.data.candidates[0]?.content?.parts[0]?.text || "No answer found";
    return answer;

  } catch (error) {
    console.error('Error calling Gemini API:', error);
    return 'Api key is expired or limit is reached';
  }
};

export default callGeminiApi;