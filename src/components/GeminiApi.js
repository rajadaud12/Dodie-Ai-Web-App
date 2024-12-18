import axios from 'axios';


const callGeminiApi = async (context) => {
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
                          text: context, // Pass limited context
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
      return 'API key is expired or limit is reached.';
  }
};

export default callGeminiApi;

