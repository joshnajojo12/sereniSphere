import { useEffect, useRef, useState } from "react";
import * as faceapi from "face-api.js";

export default function EmotionDetector({ kit }) {
  const videoRef = useRef(null);
  const [emotion, setEmotion] = useState("😐 Waiting...");
  const [activated, setActivated] = useState(false);
  const [evaluation, setEvaluation] = useState({});
  const historyRef = useRef([]); // store last few frames

  // Emoji mapping
  const emotionEmoji = {
    happy: "😊",
    sad: "😢",
    angry: "😠",
    surprised: "😲",
    fearful: "😨",
    disgusted: "🤢",
    neutral: "😐",
  };

  // Load models
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
  }, []);

  // Start webcam
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

  // Detect emotions
  const handleVideoPlay = () => {
    const interval = setInterval(async () => {
      if (!videoRef.current) return;

      const detections = await faceapi
        .detectSingleFace(
          videoRef.current,
          new faceapi.TinyFaceDetectorOptions()
        )
        .withFaceLandmarks()
        .withFaceExpressions();

      if (detections && detections.expressions) {
        const expressions = detections.expressions;
        setEvaluation(expressions);

        // Add to rolling history (last 5 frames)
        historyRef.current.push(expressions);
        if (historyRef.current.length > 5) historyRef.current.shift();

        // Average over last frames
        const avg = {};
        for (let emo in expressions) {
          avg[emo] =
            historyRef.current.reduce((sum, e) => sum + e[emo], 0) /
            historyRef.current.length;
        }

        // Pick best emotion
        let bestEmotion = Object.entries(avg).reduce(
          (a, b) => (a[1] > b[1] ? a : b)
        )[0];

        // --- Smarter bias for sadness ---
        if (
          avg.sad > 0.2 && // lower threshold
          avg.sad >= avg.neutral * 0.9 && // allow close to neutral
          avg.sad > avg.happy
        ) {
          bestEmotion = "sad";
        }

        setEmotion(`${emotionEmoji[bestEmotion] || ""} ${bestEmotion}`);

        // Trigger comfort kit once
        if (bestEmotion === "sad" && !activated) {
          activateComfortKit();
          setActivated(true);
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  };

  // Activate comfort kit
  const activateComfortKit = () => {
    console.log("🎭 Sad detected → Activating Comfort Kit");

    if (kit.music) {
      const audio = new Audio(`/music/${kit.music}.mp3`);
      audio.play();
    }

    if (kit.visual) {
      document.body.style.backgroundImage = `url(/visuals/${kit.visual}.jpg)`;
      document.body.style.backgroundSize = "cover";
      document.body.style.backgroundPosition = "center";
    }

    if (kit.activity === "Meditation / Journaling") {
      alert("🧘 Time for a meditation session.");
    } else if (kit.activity === "Games / Puzzles") {
      alert("🧩 Try a quick puzzle to distract your mind.");
    }

    if (kit.support === "Breathing exercise") {
      alert("🌬️ Take deep breaths: Inhale... Exhale...");
    } else if (kit.support === "Affirmations / Quotes") {
      alert("💡 You are stronger than you think!");
    }

    if (kit.anchor) {
      alert(`📷 Anchor Reminder: ${kit.anchor}`);
    }
  };

  return (
    <div className="flex flex-col items-center p-6">
      <h2 className="text-2xl font-bold mb-4">Real-Time Emotion Detector</h2>

      <video
        ref={videoRef}
        autoPlay
        muted
        width="480"
        height="360"
        onPlay={handleVideoPlay}
        className="rounded-lg shadow-lg border"
      />

      <p className="mt-4 text-xl">
        Detected Emotion: <span className="font-bold">{emotion}</span>
      </p>

      {activated && (
        <p className="mt-6 text-green-600 font-semibold text-lg">
          🌟 Comfort Zone Activated 🌟
        </p>
      )}

      {Object.keys(evaluation).length > 0 && (
        <div className="mt-6 w-full max-w-md bg-gray-100 p-4 rounded-lg shadow">
          <h3 className="text-lg font-bold mb-2">Emotion Evaluation</h3>
          <ul className="text-sm text-gray-700">
            {Object.entries(evaluation).map(([emo, val]) => (
              <li key={emo}>
                {emotionEmoji[emo]} {emo}: {(val * 100).toFixed(1)}%
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
