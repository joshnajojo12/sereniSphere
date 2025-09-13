from flask import Flask, request, jsonify
from flask_cors import CORS
import parselmouth
from parselmouth.praat import call
import os

app = Flask(__name__)
CORS(app)

# --- Helper: Analyze voice tremor/jitter/shimmer ---
def analyze_voice(file_path):
    snd = parselmouth.Sound(file_path)
    pitch = call(snd, "To Pitch", 0.0, 75, 600)

    jitter = call(pitch, "Get jitter (local)", 0, 0.02, 75, 500, 1.3)
    shimmer = call([snd, pitch], "Get shimmer (local)", 0, 0.02, 75, 500, 1.3, 1.6)

    harmonicity = call(snd, "To Harmonicity (cc)", 0.01, 75, 0.1, 1.0)
    hnr = call(harmonicity, "Get mean", 0, 0)

    return {
        "jitter": jitter,
        "shimmer": shimmer,
        "hnr": hnr
    }

@app.route("/analyze", methods=["POST"])
def analyze():
    if "file" not in request.files:
        return jsonify({"error": "No file uploaded"}), 400

    file = request.files["file"]
    file_path = "temp.wav"
    file.save(file_path)

    try:
        results = analyze_voice(file_path)
        return jsonify(results)
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        if os.path.exists(file_path):
            os.remove(file_path)

if __name__ == "__main__":
    app.run(port=5000, debug=True)
