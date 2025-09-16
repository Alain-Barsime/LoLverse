export const textToSpeech = (text) => {
  if (!('speechSynthesis' in window)) {
    console.error('Text-to-Speech not supported in this browser.');
    return;
  }

  // Create a function that returns a Promise to wait until speech finishes
  const speak = () => {
    return new Promise((resolve, reject) => {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      utterance.volume = 1.0;
      utterance.rate = 1.0;
      utterance.pitch = 1.0;

      utterance.onerror = (event) => {
        console.error('Speech synthesis error:', event.error);
        reject(event.error); // Reject if there's an error
      };

      utterance.onend = () => {
        console.log('Speech finished');
        resolve(); // Resolve the promise once speech is done
      };

      window.speechSynthesis.speak(utterance);
    });
  };

  // Wait for voices to be loaded and speak once they are available
  const voices = window.speechSynthesis.getVoices();

  if (voices.length > 0) {
    // Voices are already loaded, speak immediately
    speak().then(() => {
      console.log("Text-to-speech has finished.");
      // Place further code here that should run after speech finishes
    }).catch(error => {
      console.error("Error in text-to-speech:", error);
    });
  } else {
    // Wait for voices to load
    window.speechSynthesis.onvoiceschanged = () => {
      const updatedVoices = window.speechSynthesis.getVoices();
      if (updatedVoices.length > 0) {
        speak().then(() => {
       
        }).catch(error => {
          console.error("Error in text-to-speech:", error);
        });
        window.speechSynthesis.onvoiceschanged = null; // Clean up the event listener
      }
    };
  }
};
