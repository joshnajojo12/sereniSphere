import { useEffect, useRef, useState } from "react";
import * as faceapi from "face-api.js";

export default function DemoApp() {
  const videoRef = useRef(null);
  const [emotion, setEmotion] = useState("😐 Neutral (simulated Sad)");
  const [confidence, setConfidence] = useState("⚠ Moderate (Simulated 60%)");
  const [activated, setActivated] = useState(false);

  // Emojis
  const emotionEmoji = {
    happy: "😊",
    sad: "😢",
    angry: "😠",
    surprised: "😲",
    fearful: "😨",
    disgusted: "🤢",
    neutral: "😐",
  };

  // Load models + start camera
  useEffect(() => {
    const loadModels = async () => {
      try {
        await faceapi.nets.tinyFaceDetector.loadFromUri("/models");
        await faceapi.nets.faceLandmark68Net.loadFromUri("/models");
        await faceapi.nets.faceExpressionNet.loadFromUri("/models");
        startVideo();
      } catch (err) {
        console.error("❌ Model loading failed:", err);
      }
    };
    loadModels();

    // Simulate confidence score updates
    const interval = setInterval(() => {
      const fakeScores = ["✅ Confident (90%)", "⚠ Moderate (60%)", "❌ Low Confidence (40%)"];
      const random = fakeScores[Math.floor(Math.random() * fakeScores.length)];
      setConfidence(random);

      // Trigger comfort kit if low
      if (random.includes("Low") && !activated) setActivated(true);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const startVideo = () => {
    navigator.mediaDevices
      .getUserMedia({ video: true })
      .then((stream) => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      })
      .catch((err) => console.error("❌ Camera error:", err));
  };

  // Fake detection: Always trigger SAD for demo
  const handleVideoPlay = () => {
    setTimeout(() => {
      setEmotion(${emotionEmoji.sad} sad);
      setActivated(true);
    }, 2000);
  };

  return (
    <div className="flex flex-col items-center p-6 min-h-screen bg-gradient-to-br from-sky-200 via-pink-100 to-purple-200">
      <h1 className="text-3xl font-bold mb-4">🧪 Emotion + Voice Detection Demo</h1>

      {/* Webcam */}
      <video
        ref={videoRef}
        autoPlay
        muted
        width="480"
        height="360"
        onPlay={handleVideoPlay}
        className="rounded-lg shadow-lg border mb-4"
      />

      <p className="text-xl">
        Facial Emotion: <span className="font-bold text-pink-600">{emotion}</span>
      </p>
      <p className="text-xl">
        Voice Confidence: <span className="font-bold text-blue-600">{confidence}</span>
      </p>

      {activated && (
        <div className="mt-6 p-6 bg-gradient-to-r from-pink-100 to-purple-100 rounded-xl shadow-lg text-center w-full max-w-md">
          <h3 className="text-xl font-bold text-purple-700 mb-3">
            🌟 Comfort Activity Unlocked 🌟
          </h3>
          <p className="text-lg text-gray-700 mb-4">Repeat after me:</p>
          <ul className="space-y-2 text-md font-semibold text-gray-800">
            <li>💖 “I am calm and in control.”</li>
            <li>🌿 “This moment will pass, and I’ll be stronger.”</li>
            <li>✨ “I am worthy of peace and happiness.”</li>
          </ul>
        </div>
      )}
    </div>
  );
}