import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import * as faceapi from "face-api.js";
import StressReliefZone from "./StressReliefZone.jsx"; // stress relief page

export default function App() {
  const [form, setForm] = useState({
    music: "",
    visual: "",
    activity: "",
    support: "",
    anchor: "",
  });

  const [preview, setPreview] = useState(false);
  const [emotion, setEmotion] = useState("neutral");
  const [confidence, setConfidence] = useState("Analyzing...");
  const [activated, setActivated] = useState(false);
  const [manualMode, setManualMode] = useState(""); // dropdown state
  const [affirmIndex, setAffirmIndex] = useState(0); // track affirmations

  const affirmations = [
    "I am safe and in control.",
    "I am calm, I am strong.",
    "I can handle whatever comes my way.",
    "I choose peace over worry.",
    "I believe in myself.",
  ];

  const videoRef = useRef();
  const intervalRef = useRef();

  // Load face-api models
  useEffect(() => {
    const loadModels = async () => {
      await faceapi.nets.tinyFaceDetector.loadFromUri("/models");
      await faceapi.nets.faceLandmark68Net.loadFromUri("/models");
      await faceapi.nets.faceExpressionNet.loadFromUri("/models");
    };
    loadModels();
  }, []);

  // Start webcam
  const startVideo = () => {
    navigator.mediaDevices
      .getUserMedia({ video: true })
      .then((stream) => {
        if (videoRef.current) videoRef.current.srcObject = stream;
      })
      .catch((err) => console.error("Camera error:", err));
  };

  // Detect facial emotion
  const handleVideoPlay = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);

    intervalRef.current = setInterval(async () => {
      if (!videoRef.current) return;

      const detections = await faceapi
        .detectSingleFace(
          videoRef.current,
          new faceapi.TinyFaceDetectorOptions()
        )
        .withFaceLandmarks()
        .withFaceExpressions();

      if (detections && detections.expressions) {
        const bestEmotion = Object.entries(detections.expressions).reduce(
          (a, b) => (a[1] > b[1] ? a : b)
        )[0];
        setEmotion(bestEmotion);
      }
    }, 2000);
  };

  // Cleanup interval on unmount
  useEffect(() => {
    return () => clearInterval(intervalRef.current);
  }, []);

  // Voice confidence detection
  useEffect(() => {
    if (!preview) return;

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn("❌ Speech recognition not supported.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    let pauseCount = 0;
    let lastTimestamp = Date.now();
    const startTime = Date.now();

    recognition.onresult = (event) => {
      const text = Array.from(event.results)
        .map((result) => result[0].transcript)
        .join(" ");

      const now = Date.now();
      const gap = (now - lastTimestamp) / 1000;
      if (gap > 2) pauseCount++;
      lastTimestamp = now;

      const words = text.split(" ").filter((w) => w.length > 0);
      const wpm = (words.length / ((now - startTime) / 60000)).toFixed(1);

      let score = 100;
      if (pauseCount > 3) score -= 20;
      if (wpm < 80) score -= 20;
      if (wpm > 200) score -= 10;

      if (score >= 80) setConfidence("✅ Confident (" + score + "%)");
      else if (score >= 50) setConfidence("⚠️ Moderate (" + score + "%)");
      else setConfidence("❌ Low Confidence (" + score + "%)");
    };

    recognition.start();
    return () => recognition.stop();
  }, [preview]);

  // Comfort kit trigger
  useEffect(() => {
    const lowConfidence = confidence.includes("Low");

    if ((emotion === "sad" || lowConfidence) && !activated) {
      setActivated(true);
      setManualMode("stress");
    }
  }, [emotion, confidence, activated]);

  const handleChange = (field, value) => setForm({ ...form, [field]: value });

  const handleSubmit = () => {
    setPreview(true);
    setActivated(false);
    startVideo();
  };

  // ---------------- MANUAL MODE HANDLER ----------------
  if (manualMode === "stress") {
    return <StressReliefZone onExit={() => setManualMode("")} />;
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden bg-gradient-to-br from-sky-200 via-pink-100 to-purple-200 text-gray-900">
      {/* soft background glow */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,rgba(147,197,253,0.4),transparent_70%)]"
      />

      <AnimatePresence mode="wait">
        {!preview ? (
          // ---------------- FORM PAGE ----------------
          <motion.div
            key="form"
            initial={{ opacity: 0, scale: 0.95, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -30 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="w-full max-w-2xl bg-white/70 backdrop-blur-md rounded-3xl shadow-2xl p-10 text-gray-800"
          >
            <h1 className="text-4xl font-extrabold text-sky-600 mb-4 text-center">
              🌿 Build Your Comfort Kit
            </h1>
            <p className="text-gray-600 text-center mb-6">
              Select what makes you feel better, and we’ll use it when you look sad 💜
              or sound unconfident 🎤
            </p>

            {/* Manual Mode Dropdown */}
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-2">🕹 Manual Mode</h2>
              <select
                className="w-full p-3 rounded-lg bg-white border border-yellow-400 text-gray-800 focus:ring-2 focus:ring-yellow-300 transition"
                value={manualMode}
                onChange={(e) => setManualMode(e.target.value)}
              >
                <option value="">Normal (Automatic Detection)</option>
                <option value="stress">Stress Relief Mode</option>
              </select>
            </div>

            {/* Music */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-2">🎵 Music & Sounds</h2>
              <select
                className="w-full p-3 rounded-lg bg-white border border-sky-400 text-gray-800 focus:ring-2 focus:ring-sky-300 transition"
                value={form.music}
                onChange={(e) => handleChange("music", e.target.value)}
              >
                <option value="">Select one...</option>
                <option>Soft piano or guitar</option>
                <option>Rain / Ocean waves</option>
                <option>Uplifting playlist</option>
              </select>
            </div>

            {/* Visuals */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-2">🌸 Visuals</h2>
              <select
                className="w-full p-3 rounded-lg bg-white border border-pink-400 text-gray-800 focus:ring-2 focus:ring-pink-300 transition"
                value={form.visual}
                onChange={(e) => handleChange("visual", e.target.value)}
              >
                <option value="">Select one...</option>
                <option>Nature (trees, water, sky)</option>
                <option>Space / Stars</option>
                <option>Cozy room vibes</option>
              </select>
            </div>

            {/* Activity */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-2">🎨 Activities</h2>
              <select
                className="w-full p-3 rounded-lg bg-white border border-blue-400 text-gray-800 focus:ring-2 focus:ring-blue-300 transition"
                value={form.activity}
                onChange={(e) => handleChange("activity", e.target.value)}
              >
                <option value="">Select one...</option>
                <option>Drawing / Coloring</option>
                <option>Reading / Story audio</option>
                <option>Games / Puzzles</option>
                <option>Meditation / Journaling</option>
                <option>🗣️ Repeat After Me</option> {/* ✅ new activity */}
              </select>
            </div>

            {/* Support */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-2">🤝 Support Tools</h2>
              <select
                className="w-full p-3 rounded-lg bg-white border border-green-400 text-gray-800 focus:ring-2 focus:ring-green-300 transition"
                value={form.support}
                onChange={(e) => handleChange("support", e.target.value)}
              >
                <option value="">Select one...</option>
                <option>Breathing exercise</option>
                <option>Comfort chatbot</option>
                <option>Affirmations / Quotes</option>
              </select>
            </div>

            {/* Anchor */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-2">📷 Anchor</h2>
              <input
                type="text"
                placeholder='e.g. "My pet cat 🐱"'
                className="w-full p-3 rounded-lg bg-white border border-gray-400 text-gray-800 focus:ring-2 focus:ring-indigo-300 transition"
                value={form.anchor}
                onChange={(e) => handleChange("anchor", e.target.value)}
              />
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSubmit}
              className="w-full py-3 bg-gradient-to-r from-sky-400 to-pink-400 hover:opacity-90 text-white font-bold rounded-xl shadow-lg transition"
            >
              Build My Comfort Kit 🌿
            </motion.button>
          </motion.div>
        ) : (
          // ---------------- PREVIEW + DETECTION PAGE ----------------
          <motion.div
            key="preview"
            initial={{ opacity: 0, scale: 0.95, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -30 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="w-full max-w-3xl bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl p-10 text-center text-gray-800"
          >
            <h1 className="text-3xl font-extrabold text-sky-600 mb-6">
              Your Comfort Zone
            </h1>

            <video
              ref={videoRef}
              autoPlay
              muted
              width="480"
              height="360"
              onPlay={handleVideoPlay}
              className="rounded-lg shadow-lg border mx-auto"
            />

            <p className="mt-4 text-xl">
              Current Emotion:{" "}
              <span className="font-bold text-pink-500">{emotion}</span>
            </p>

            <p className="mt-2 text-xl">
              Voice Confidence:{" "}
              <span className="font-bold text-blue-500">{confidence}</span>
            </p>

            {(emotion === "sad" || confidence.includes("Low")) && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: [0.6, 1, 0.6] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="mt-2 text-red-500 font-semibold"
              >
                😔 Activating your comfort kit!
              </motion.p>
            )}

            {/* ✅ Repeat After Me Activity */}
            {form.activity === "🗣️ Repeat After Me" && (
              <div className="mt-8 bg-sky-100 rounded-2xl p-6 shadow-lg">
                <h2 className="text-2xl font-bold text-sky-700 mb-4">
                  🗣️ Repeat After Me
                </h2>
                <motion.p
                  key={affirmIndex}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.8 }}
                  className="text-xl font-semibold text-gray-800"
                >
                  {affirmations[affirmIndex]}
                </motion.p>
                <button
                  onClick={() =>
                    setAffirmIndex((prev) => (prev + 1) % affirmations.length)
                  }
                  className="mt-4 px-4 py-2 bg-gradient-to-r from-sky-400 to-blue-500 text-white rounded-xl shadow hover:opacity-90"
                >
                  Next Affirmation ➡️
                </button>
              </div>
            )}

            <div className="text-left space-y-4 text-lg mt-6">
              <p>🎵 Music: <span className="font-bold">{form.music}</span></p>
              <p>🌸 Visual: <span className="font-bold">{form.visual}</span></p>
              <p>🎨 Activity: <span className="font-bold">{form.activity}</span></p>
              <p>🤝 Support: <span className="font-bold">{form.support}</span></p>
              <p>📷 Anchor: <span className="font-bold">{form.anchor}</span></p>
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setPreview(false)}
              className="mt-8 px-6 py-3 bg-gradient-to-r from-pink-400 to-sky-400 hover:opacity-90 text-white rounded-xl font-semibold shadow-lg transition"
            >
              Edit Again ✏️
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
