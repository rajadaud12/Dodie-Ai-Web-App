import axios from 'axios';

const apiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=API_KEY_HERE';

const predefinedResponses = [
  { keyword: 'who are you', response: 'I am dodie Ai , powered by google gemini' },



];

const callGeminiApi = async (prompt) => {
  const normalizedPrompt = prompt.trim().toLowerCase();

  for (const { keyword, response } of predefinedResponses) {
    if (normalizedPrompt.includes(keyword)) {
      return response;
    }
  }

  try {
    const requestBody = {
      contents: [
        {
          parts: [
            {
              text: prompt // This is where the user's question goes
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
    return 'An error occurred while processing your request.';
  }
};

export default callGeminiApi;
