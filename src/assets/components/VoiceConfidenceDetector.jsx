import React, { useEffect, useRef, useState } from "react";

export default function VoiceAnalyzer() {
  const [listening, setListening] = useState(false);
  const [volume, setVolume] = useState(0);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const dataArrayRef = useRef(null);
  const rafIdRef = useRef(null);

  const startListening = async () => {
    if (listening) return;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      const source = audioContextRef.current.createMediaStreamSource(stream);

      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 256;

      const bufferLength = analyserRef.current.frequencyBinCount;
      dataArrayRef.current = new Uint8Array(bufferLength);

      source.connect(analyserRef.current);

      const updateVolume = () => {
        analyserRef.current.getByteFrequencyData(dataArrayRef.current);
        const avg = dataArrayRef.current.reduce((a, b) => a + b, 0) / bufferLength;
        setVolume(Math.round(avg));
        rafIdRef.current = requestAnimationFrame(updateVolume);
      };

      updateVolume();
      setListening(true);
    } catch (err) {
      console.error("Mic error:", err);
    }
  };

  const stopListening = () => {
    if (!listening) return;

    cancelAnimationFrame(rafIdRef.current);
    if (audioContextRef.current) {
      audioContextRef.current.close();
    }
    setListening(false);
    setVolume(0);
  };

  return (
    <div className="flex flex-col items-center p-6">
      <h2 className="text-2xl font-bold mb-4">🎤 Voice Analyzer</h2>

      <button
        onClick={listening ? stopListening : startListening}
        className={`px-6 py-3 rounded-lg text-white font-semibold ${
          listening ? "bg-red-500" : "bg-green-500"
        }`}
      >
        {listening ? "Stop Listening" : "Start Listening"}
      </button>

      <div className="mt-6 w-full max-w-md">
        <div className="h-6 bg-gray-200 rounded-lg overflow-hidden">
          <div
            className="h-full bg-blue-500 transition-all duration-100"
            style={{ width: `${volume}%` }}
          />
        </div>
        <p className="mt-2 text-lg text-center">
          Voice Level: <span className="font-bold">{volume}</span>
        </p>
      </div>
    </div>
  );
}
