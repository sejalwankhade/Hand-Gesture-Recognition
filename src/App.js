import React, { useRef, useEffect, useState } from "react";
import Webcam from "react-webcam";
import * as handpose from "@tensorflow-models/handpose";
import * as tf from "@tensorflow/tfjs";
import { drawHand } from "./utilities";

const speak = (text) => {
  const synth = window.speechSynthesis;
  synth.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  synth.speak(utterance);
};

const App = () => {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const [gesture, setGesture] = useState("");
  const [lastSpokenGesture, setLastSpokenGesture] = useState("");
  let gestureBuffer = [];

  const detect = async (net) => {
    if (webcamRef.current && webcamRef.current.video.readyState === 4) {
      const video = webcamRef.current.video;
      const hand = await net.estimateHands(video);

      if (hand.length > 0) {
        const landmarks = hand[0].landmarks;

        // Extract finger tips & base positions
        const fingers = [4, 8, 12, 16, 20].map(i => landmarks[i][1]);
        const bases = [5, 9, 13, 17].map(i => landmarks[i][1]);

        // Adjusted thresholds for better detection
        const isThumbUp = fingers[0] < bases[0] - 50;
        const isIndexUp = fingers[1] < bases[1] - 40;
        const isMiddleUp = fingers[2] < bases[2] - 40;
        const isRingUp = fingers[3] < bases[3] - 40;
        const isPinkyUp = fingers[4] < bases[3] - 40;

        let detectedGesture = "Unknown Gesture";

        if (isThumbUp && !isIndexUp && !isMiddleUp && !isRingUp && !isPinkyUp) {
          detectedGesture = "Thumbs Up 👍";
        } else if (!isThumbUp && isIndexUp && isMiddleUp && !isRingUp && !isPinkyUp) {
          detectedGesture = "Peace ✌️";
        } else if (isThumbUp && isIndexUp && isMiddleUp && isRingUp && isPinkyUp) {
          detectedGesture = "Open Hand 🖐️";
        } else if (!isThumbUp && !isIndexUp && !isMiddleUp && !isRingUp && !isPinkyUp) {
          detectedGesture = "Fist ✊";
        } else if (!isThumbUp && isIndexUp && !isMiddleUp && !isRingUp && isPinkyUp) {
          detectedGesture = "Rock 🤘";
        } else if (!isThumbUp && isIndexUp && !isMiddleUp && !isRingUp && !isPinkyUp) {
          detectedGesture = "Pointing ☝️";
        }

        // Store recent gestures for stability
        gestureBuffer.push(detectedGesture);
        if (gestureBuffer.length > 5) gestureBuffer.shift();

        const mostFrequentGesture = gestureBuffer.sort(
          (a, b) =>
            gestureBuffer.filter((v) => v === a).length -
            gestureBuffer.filter((v) => v === b).length
        ).pop();

        if (mostFrequentGesture !== gesture) {
          setGesture(mostFrequentGesture);
        }
        drawHand(hand, canvasRef.current);
      } else {
        setGesture("No Hand");
      }
    }
  };

  useEffect(() => {
    const runHandpose = async () => {
      await tf.setBackend("webgl");
      const net = await handpose.load();
      console.log("Handpose model loaded!");
      setInterval(() => {
        detect(net);
      }, 300);
    };
    runHandpose();
  }, []);

  useEffect(() => {
    if (gesture && gesture !== "No Hand" && gesture !== lastSpokenGesture) {
      speak(gesture);
      setLastSpokenGesture(gesture);
    }
  }, [gesture]);

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100vh" }}>
      <div style={{ position: "relative" }}>
        <Webcam ref={webcamRef} style={{ width: 640, height: 480, borderRadius: "10px" }} />
        <canvas ref={canvasRef} style={{ position: "absolute", top: 0, left: 0, width: 640, height: 480 }} />
      </div>
      <h1 style={{ marginTop: "20px" }}>Gesture: {gesture}</h1>
    </div>
  );
};

export default App;