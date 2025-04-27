import React from "react";

const TextToSpeech = ({ text }) => {
  const speak = () => {
    const speech = new SpeechSynthesisUtterance(text);
    window.speechSynthesis.speak(speech);
  };

  return (
    <div>
      <button onClick={speak}>🔊 Speak</button>
    </div>
  );
};

export default TextToSpeech;
