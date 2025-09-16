# LoLverse
An AI-powered personal memorizer that listens to you in speech or text, remembers what you tell it, and chats with you to give advice or recall anything you’ve stored — anytime you ask.



# AI Personal Memorizer

AI Personal Memorizer is your personal AI assistant that remembers anything you tell it via text or speech. You can chat or speak with it anytime, and it gives advice based on stored memories. It uses Google Gemini API for AI, and includes support for Text-to-Speech (TTS) and Speech-to-Text (SST) via dependencies.

## Requirements
- Node.js >= 18
- npm or yarn
- Google Gemini API key

## Setup and Run


# Clone the repository
git clone https://github.com/your-username/ai-personal-memorizer.git
cd ai-personal-memorizer

# Install all dependencies
npm install

# Create a .env file with your API key
echo "GEMINI_API_KEY=your_google_gemini_api_key_here" > .env

# Start backend server
cd src
node server.js
