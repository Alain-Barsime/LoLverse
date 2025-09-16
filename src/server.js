import express from 'express';
import cors from 'cors';
import axios from 'axios';
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 5000;
const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;
const API_URL = process.env.API_URL;

// Middleware
app.use(express.json());
app.use(cors({ origin: 'http://localhost:5173' }));

// In-memory conversation history (for a single user, just you)
let conversationHistory = [];

// Endpoint to generate text
app.post('/generate-text', async (req, res) => {
  const { prompt } = req.body;

  // Ensure prompt is provided
  if (!prompt || typeof prompt !== 'string') {
    console.warn('Invalid request received:', req.body);
    return res.status(400).json({ error: 'Prompt is required and must be a string' });
  }

  console.log('Received prompt:', prompt);

  // Add the new prompt to the conversation history
  conversationHistory.push({ role: 'user', text: prompt });

  try {
    // Create the conversation context (just the prompt history so far)
    const conversationContext = conversationHistory.map((message) => ({
      text: message.text,
    }));

    // Request to Gemini API with conversation history
    const response = await axios.post(
      `${API_URL}?key=${GOOGLE_API_KEY}`,
      {
        contents: [
          {
            parts: [
              {
                text: `,Respond casually like you're having a friendly conversation.
                 Don't mention you're an AI or robot. Just talk like a person would,
                 be human like, for example if you are asked unexpected question, tell why did you ask?
                 just be human
                  in a friendly and relaxed way in minimum words accordingly but make sure you continue conversation. 
                  respond accordingly and dont ask why i am asking just respond
                  Remember, you are LoLverse ai for making fun with people, and you were made by alain barsime in 2025\nConversation so far: 
                       
                ${conversationContext.map(
                  (msg) => `${msg.text}`
                ).join('\n')}\nUser: ${prompt}`
              }
            ]
          }
        ],
        generationConfig: {
          maxOutputTokens: 150,  
          temperature: 0.85,     
        },
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 10000,
      }
    );
   
    // Extract AI response
    const text = response.data.candidates?.[0]?.content?.parts?.[0]?.text || 'Sorry, I couldn’t generate a response.';

    // Add AI response to the conversation history
    conversationHistory.push({ role: 'ai', text });

    // Return the response to the frontend
    res.json({ text });
  } catch (error) {
    console.error('Google AI Studio API Error:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data ? JSON.stringify(error.response.data, null, 2) : 'No data',
      headers: error.response?.headers,
    });

    // Handle error and send a proper response
    const status = error.response?.status || 500;
    const errorDetails = error.response?.data?.error?.message || error.message;
    res.status(status).json({
      error: 'Failed to generate text',
      details: errorDetails,
    });
  }
});

// Start server
app.listen(5000, () => {
  console.log(`Server running on http://localhost:5000`);
});
