import React, { useState, useRef } from 'react';
import axios from 'axios';
import background from './background.jpg';
import { textToSpeech } from './Sounder'; 

const Homepage = () => {
  const [prompt, setPrompt] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isVoiceMode, setIsVoiceMode] = useState(false);
  const [isRecording, setIsRecording] = useState(false);

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const recognitionRef = useRef(null);

  if (SpeechRecognition && !recognitionRef.current) {
    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.continuous = false;
    recognitionRef.current.interimResults = false;
    recognitionRef.current.lang = 'en-US';
  }

  const startRecording = () => {
    if (!SpeechRecognition) {
      setError('Speech recognition is not supported in this browser.');
      return;
    }

    setIsRecording(true);
    setError(null);
    setPrompt('');

    recognitionRef.current.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setPrompt(transcript); // update UI
      if (transcript.trim() !== '') {
        submitPrompt(transcript); // send actual transcript directly
      } else {
        setError('Voice input was empty.');
      }
    };

    recognitionRef.current.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      setError('Voice input error: ' + event.error);
      setIsRecording(false);
    };

    recognitionRef.current.onend = () => {
      setIsRecording(false);
    };

    recognitionRef.current.start();
  };

  const stopRecording = () => {
    if (recognitionRef.current && isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    } else {
      setError('No active recording to stop.');
    }
  };

  const submitPrompt = async (promptText) => {
    if (!promptText || promptText.trim() === '') {
      setError('Prompt cannot be empty.');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      console.log("Submitting prompt:", promptText, typeof promptText);
      const response = await axios.post(
        'http://localhost:5000/generate-text',
        { prompt: promptText },
        { headers: { 'Content-Type': 'application/json' } }
      );
      if (!response.data.text) {
        throw new Error('No text generated from server.');
      }
      textToSpeech(response.data.text);
    } catch (err) {
      console.error('Server Error:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
      });
      setError(err.response?.data?.error || 'Failed to fetch text: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    submitPrompt(prompt);
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.header}>LoLverse </h1>
      <div style={styles.toggleContainer}>
        <button style={styles.toggleButton} onClick={() => setIsVoiceMode(!isVoiceMode)}>
          {isVoiceMode ? 'Switch to Text Mode' : 'Switch to Voice Mode'}
        </button>
      </div>
      <form onSubmit={handleSubmit} style={styles.form}>
        {isVoiceMode ? (
          <div style={styles.voiceContainer}>
            <button
              type="button"
              style={styles.recordButton}
              onClick={isRecording ? stopRecording : startRecording}
              disabled={loading}
            >
              {isRecording ? 'Stop Recording' : 'Record Voice'}
            </button>
            <p style={styles.promptDisplay}>Voice Input: {prompt}</p>
          </div>
        ) : (
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Enter your prompt here..."
            rows="4"
            style={styles.textarea}
            disabled={loading}
          />
        )}
        {!isVoiceMode && (
          <button type="submit" style={styles.submitButton} disabled={loading}>
            {loading ? 'Thinking...' : 'Talk to me'}
          </button>
        )}
      </form>

      {error && (
        <div style={styles.errorContainer}>
          <h3 style={styles.errorHeader}>Error:</h3>
          <p style={styles.errorText}>{error}</p>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    padding: '20px',
    maxWidth: '600px',
    margin: '40px auto',
    borderRadius: '10px',
    background: 'linear-gradient(135deg, #8e2de2, #ff416c)',
    color: '#fff',
    fontFamily: 'Arial, sans-serif',
    boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
  },
  header: {
    textAlign: 'center',
    marginBottom: '20px',
  },
  toggleContainer: {
    display: 'flex',
    justifyContent: 'center',
    marginBottom: '20px',
  },
  toggleButton: {
    padding: '10px 20px',
    border: 'none',
    borderRadius: '5px',
    backgroundColor: '#fff',
    color: '#8e2de2',
    cursor: 'pointer',
    fontWeight: 'bold',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
  },
  voiceContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  recordButton: {
    padding: '10px 20px',
    marginBottom: '10px',
    border: 'none',
    borderRadius: '5px',
    backgroundColor: '#fff',
    color: '#8e2de2',
    cursor: 'pointer',
    fontWeight: 'bold',
  },
  promptDisplay: {
    marginBottom: '10px',
    fontStyle: 'italic',
  },
  textarea: {
    width: '98%',
    marginBottom: '10px',
    padding: '10px',
    borderRadius: '5px',
    border: 'none',
    fontSize: '16px',
  },
  submitButton: {
    padding: '10px',
    border: 'none',
    borderRadius: '5px',
    backgroundColor: '#fff',
    color: '#8e2de2',
    cursor: 'pointer',
    fontWeight: 'bold',
  },
  errorContainer: {
    marginTop: '20px',
    backgroundColor: 'rgba(255, 0, 0, 0.3)',
    padding: '15px',
    borderRadius: '5px',
  },
  errorHeader: {
    marginBottom: '10px',
  },
  errorText: {
    lineHeight: '1.5',
  },
};

export default Homepage;
