import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import * as faceapi from "face-api.js";

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

  const videoRef = useRef();

  // 1️⃣ Load face-api models
  useEffect(() => {
    const loadModels = async () => {
      await faceapi.nets.tinyFaceDetector.loadFromUri("/models");
      await faceapi.nets.faceLandmark68Net.loadFromUri("/models");
      await faceapi.nets.faceExpressionNet.loadFromUri("/models");
    };
    loadModels();
  }, []);

  // 2️⃣ Start webcam
  const startVideo = () => {
    navigator.mediaDevices
      .getUserMedia({ video: true })
      .then((stream) => {
        if (videoRef.current) videoRef.current.srcObject = stream;
      })
      .catch((err) => console.error("Camera error:", err));
  };

  // 3️⃣ Detect facial emotion
  const handleVideoPlay = () => {
    setInterval(async () => {
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

  // 4️⃣ Voice confidence detection
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

      // detect pauses
      const now = Date.now();
      const gap = (now - lastTimestamp) / 1000;
      if (gap > 2) pauseCount++;
      lastTimestamp = now;

      // words per minute
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

  // 5️⃣ Comfort kit trigger (sad OR low confidence)
  useEffect(() => {
    const lowConfidence = confidence.includes("Low");

    if ((emotion === "sad" || lowConfidence) && !activated) {
      setActivated(true);

      // Music
      if (form.music) {
        let audioFile = "";
        if (form.music === "Soft piano or guitar") audioFile = "/sounds/piano.mp3";
        if (form.music === "Rain / Ocean waves") audioFile = "/sounds/rain.mp3";
        if (form.music === "Uplifting playlist") audioFile = "/sounds/uplift.mp3";

        if (audioFile) {
          const audio = new Audio(audioFile);
          audio.play().catch((e) => console.error("Autoplay error:", e));
        }
      }

      // Visuals
      if (form.visual) {
        let bgImage = "";
        if (form.visual === "Nature (trees, water, sky)") bgImage = "/visuals/nature.jpg";
        if (form.visual === "Space / Stars") bgImage = "/visuals/space.jpg";
        if (form.visual === "Cozy room vibes") bgImage = "/visuals/cozy.jpg";

        if (bgImage) {
          document.body.style.backgroundImage = `url(${bgImage})`;
          document.body.style.backgroundSize = "cover";
          document.body.style.backgroundPosition = "center";
        }
      }

      // Activities
      if (form.activity) {
        if (form.activity === "Meditation / Journaling") {
          alert("🧘 Time for a meditation or journaling break!");
        } else if (form.activity === "Games / Puzzles") {
          alert("🧩 Try a quick puzzle to relax your mind.");
        } else if (form.activity === "Drawing / Coloring") {
          alert("🎨 Grab some colors and draw something fun!");
        } else if (form.activity === "Reading / Story audio") {
          alert("📖 Relax with a story or audiobook.");
        }
      }

      // Support
      if (form.support) {
        if (form.support === "Breathing exercise") {
          alert("🌬️ Inhale deeply... exhale slowly... repeat 5 times.");
        } else if (form.support === "Comfort chatbot") {
          alert("💬 Talk to me anytime — I’m here to listen.");
        } else if (form.support === "Affirmations / Quotes") {
          alert("💡 Remember: You are stronger than you think!");
        }
      }

      // Anchor
      if (form.anchor) {
        alert(`📷 Anchor Reminder: ${form.anchor}`);
      }
    }
  }, [emotion, confidence, activated, form]);

  const handleChange = (field, value) => setForm({ ...form, [field]: value });

  const handleSubmit = () => {
    setPreview(true);
    setActivated(false);
    startVideo();
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 transition-all">
      <AnimatePresence mode="wait">
        {!preview ? (
          // ---------------- FORM PAGE ----------------
          <motion.div
            key="form"
            initial={{ opacity: 0, scale: 0.9, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -40 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="w-full max-w-2xl bg-white/80 backdrop-blur-md rounded-3xl shadow-2xl p-10"
          >
            <h1 className="text-4xl font-extrabold text-purple-700 mb-4 text-center">
              🌿 Build Your Comfort Kit
            </h1>
            <p className="text-gray-700 text-center mb-10">
              Select what makes you feel better, and we’ll use it when you look sad 💜
              or sound unconfident 🎤
            </p>

            {/* Music */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-2">🎵 Music & Sounds</h2>
              <select
                className="w-full p-3 rounded-lg border border-purple-300 focus:ring-2 focus:ring-purple-400 transition"
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
                className="w-full p-3 rounded-lg border border-pink-300 focus:ring-2 focus:ring-pink-400 transition"
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
                className="w-full p-3 rounded-lg border border-blue-300 focus:ring-2 focus:ring-blue-400 transition"
                value={form.activity}
                onChange={(e) => handleChange("activity", e.target.value)}
              >
                <option value="">Select one...</option>
                <option>Drawing / Coloring</option>
                <option>Reading / Story audio</option>
                <option>Games / Puzzles</option>
                <option>Meditation / Journaling</option>
              </select>
            </div>

            {/* Support */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-2">🤝 Support Tools</h2>
              <select
                className="w-full p-3 rounded-lg border border-green-300 focus:ring-2 focus:ring-green-400 transition"
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
                className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-400 transition"
                value={form.anchor}
                onChange={(e) => handleChange("anchor", e.target.value)}
              />
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSubmit}
              className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-500 hover:opacity-90 text-white font-bold rounded-xl shadow-lg transition"
            >
              Build My Comfort Kit 🌿
            </motion.button>
          </motion.div>
        ) : (
          // ---------------- PREVIEW + DETECTION PAGE ----------------
          <motion.div
            key="preview"
            initial={{ opacity: 0, scale: 0.9, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -40 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="w-full max-w-3xl bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl p-10 text-center"
          >
            <h1 className="text-3xl font-extrabold text-green-700 mb-6">
              🌟 Your Comfort Kit in Action 🌟
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
              <span className="font-bold text-purple-600">{emotion}</span>
            </p>

            <p className="mt-2 text-xl">
              Voice Confidence:{" "}
              <span className="font-bold text-blue-600">{confidence}</span>
            </p>

            {(emotion === "sad" || confidence.includes("Low")) && (
              <p className="mt-2 text-red-500 font-semibold">
                😔 Activating your comfort kit!
              </p>
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
              className="mt-8 px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 hover:opacity-90 text-white rounded-xl font-semibold shadow-lg transition"
            >
              Edit Again ✏️
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
