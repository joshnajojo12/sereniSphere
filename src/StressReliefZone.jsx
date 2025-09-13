import React, { useState, useEffect } from "react";

export default function StressReliefZone() {
  const [mode, setMode] = useState(""); // breathing | bubbles
  const [bubbles, setBubbles] = useState([]);
  const [phase, setPhase] = useState("Inhale");
  const [timeLeft, setTimeLeft] = useState(4);

  // Phases for breathing (name + duration in sec)
  const phases = [
    { name: "Inhale", duration: 4 },
    { name: "Hold", duration: 4 },
    { name: "Exhale", duration: 6 },
    { name: "Hold", duration: 2 },
  ];

  // Breathing cycle logic
  useEffect(() => {
    if (mode === "breathing") {
      let i = 0;
      setPhase(phases[i].name);
      setTimeLeft(phases[i].duration);

      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev > 1) return prev - 1;

          // next phase
          i = (i + 1) % phases.length;
          setPhase(phases[i].name);
          return phases[i].duration;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [mode]);

  // Bubble pop challenge logic
  useEffect(() => {
    if (mode === "bubbles") {
      const interval = setInterval(() => {
        setBubbles((prev) => [
          ...prev,
          {
            id: Date.now(),
            x: Math.random() * 90, // random left %
            y: Math.random() * 80, // random top %
            size: Math.random() * 50 + 30, // 30–80px
          },
        ]);
      }, 1200);
      return () => clearInterval(interval);
    }
  }, [mode]);

  const popBubble = (id) => {
    setBubbles((prev) => prev.filter((b) => b.id !== id));
  };

  return (
    <div className="p-6 text-center min-h-screen bg-gradient-to-br from-blue-100 via-white to-purple-100">
      <h1 className="text-3xl font-bold text-purple-700 mb-6">
        Stress Relief Zone 🌿
      </h1>

      {/* Dropdown to choose mode */}
      <select
        value={mode}
        onChange={(e) => setMode(e.target.value)}
        className="p-2 rounded border mb-6"
      >
        <option value="">-- Select an Activity --</option>
        <option value="breathing">🌬️ Breathing Exercise</option>
        <option value="bubbles">🫧 Bubble Pop Challenge</option>
      </select>

      {/* Breathing exercise */}
      {mode === "breathing" && (
        <div className="flex flex-col items-center justify-center mt-10">
          <div
            className={`w-48 h-48 rounded-full flex items-center justify-center text-xl font-bold text-white shadow-2xl transition-all duration-1000 ease-in-out 
            ${
              phase === "Inhale"
                ? "scale-125 bg-gradient-to-r from-blue-400 to-teal-400"
                : phase === "Exhale"
                ? "scale-75 bg-gradient-to-r from-purple-400 to-pink-400"
                : "scale-100 bg-gradient-to-r from-indigo-400 to-purple-400"
            }`}
          >
            {phase}
          </div>
          <p className="mt-6 text-2xl font-semibold text-gray-700">
            {timeLeft}s
          </p>
        </div>
      )}

      {/* Bubble pop challenge */}
      {mode === "bubbles" && (
        <div className="relative w-full h-[400px] border rounded-lg bg-blue-50 overflow-hidden shadow-inner mt-8">
          {bubbles.map((bubble) => (
            <div
              key={bubble.id}
              onClick={() => popBubble(bubble.id)}
              className="absolute rounded-full cursor-pointer shadow-lg transition transform hover:scale-110"
              style={{
                top: `${bubble.y}%`,
                left: `${bubble.x}%`,
                width: `${bubble.size}px`,
                height: `${bubble.size}px`,
                background: `radial-gradient(circle at 30% 30%, #aee1f9, #60a5fa)`,
              }}
            />
          ))}
          {bubbles.length === 0 && (
            <p className="absolute inset-0 flex items-center justify-center text-gray-500">
              Tap bubbles to pop! 🫧
            </p>
          )}
        </div>
      )}
    </div>
  );
}
