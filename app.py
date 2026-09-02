import io
import os
import tempfile
import threading
from flask import Flask, jsonify, request, send_file
from flask_cors import CORS
from morse_engine import MorseEngine

app = Flask(__name__, static_folder="static", static_url_path="")
CORS(app)  # Enable Cross-Origin Resource Sharing for accessibility switch integration

# Global locks to ensure thread safety
engine_lock = threading.Lock()
tts_lock = threading.Lock()

# Initialize Morse Engine
engine = MorseEngine()

# ---------------------------------------------------------------------------
# TTS Helper Functions
# ---------------------------------------------------------------------------
def text_to_speech_gtts(text):
    """
    Generate TTS using Google Text-to-Speech (online, high quality).
    """
    try:
        from gtts import gTTS
        tts = gTTS(text=text, lang="en", slow=False)
        fp = io.BytesIO()
        tts.write_to_fp(fp)
        fp.seek(0)
        return fp.read(), "audio/mpeg"
    except Exception as e:
        print(f"[gTTS] Failed to generate TTS: {e}")
        return None, None


def text_to_speech_pyttsx3(text):
    """
    Generate TTS using pyttsx3 (offline fallback).
    Saves to a temporary WAV file, reads it, and returns the raw bytes.
    """
    with tts_lock:
        try:
            import pyttsx3
            # Initialize pyttsx3 inside the locked region
            py_engine = pyttsx3.init()
            
            # Best-effort: pick a female-sounding voice
            try:
                voices = py_engine.getProperty("voices")
                female_voice = None
                for voice in voices:
                    voice_name = voice.name.lower()
                    if any(hint in voice_name for hint in ["female", "zira", "samantha", "hazel", "susie", "salli"]):
                        female_voice = voice.id
                        break
                if female_voice:
                    py_engine.setProperty("voice", female_voice)
            except Exception as e:
                print(f"[pyttsx3] Error finding voice selection: {e}")

            # Slow down rate for calmer speech
            py_engine.setProperty("rate", 140)
            
            # Write speech to a temporary file
            fd, temp_path = tempfile.mkstemp(suffix=".wav")
            os.close(fd)
            
            py_engine.save_to_file(text, temp_path)
            py_engine.runAndWait()
            
            # Read back generated audio bytes
            with open(temp_path, "rb") as f:
                data = f.read()
            
            # Clean up temp file
            try:
                os.remove(temp_path)
            except Exception:
                pass
                
            return data, "audio/wav"
        except Exception as e:
            print(f"[pyttsx3] Offline generator failed: {e}")
            return None, None

# ---------------------------------------------------------------------------
# Static Routes
# ---------------------------------------------------------------------------
@app.route("/")
def index():
    return app.send_static_file("index.html")

# ---------------------------------------------------------------------------
# API Endpoints
# ---------------------------------------------------------------------------
@app.route("/api/state", methods=["GET"])
def get_state():
    with engine_lock:
        return jsonify(engine.get_state())


@app.route("/api/press/dot", methods=["POST"])
def press_dot():
    with engine_lock:
        engine.press_dot()
        return jsonify(engine.get_state())


@app.route("/api/press/dash", methods=["POST"])
def press_dash():
    with engine_lock:
        engine.press_dash()
        return jsonify(engine.get_state())


@app.route("/api/press/space", methods=["POST"])
def press_space():
    with engine_lock:
        decoded = engine.press_space()
        return jsonify({
            "decoded": decoded,
            "state": engine.get_state()
        })


@app.route("/api/press/backspace", methods=["POST"])
def press_backspace():
    with engine_lock:
        removed = engine.backspace()
        return jsonify({
            "removed": removed,
            "state": engine.get_state()
        })


@app.route("/api/press/clear", methods=["POST"])
def press_clear():
    with engine_lock:
        engine.clear_message()
        return jsonify(engine.get_state())


@app.route("/api/tutorial/toggle", methods=["POST"])
def tutorial_toggle():
    with engine_lock:
        engine.tutorial_toggle()
        return jsonify(engine.get_state())


@app.route("/api/tutorial/next", methods=["POST"])
def tutorial_next():
    with engine_lock:
        engine.tutorial_next()
        return jsonify(engine.get_state())
@app.route("/api/tutorial/prev", methods=["POST"])
def tutorial_prev():
    with engine_lock:
        engine.tutorial_previous()
        return jsonify(engine.get_state())
@app.route("/api/tts", methods=["GET"])
def api_tts():
    text = request.args.get("text", "").strip()
    if not text:
        return "Parameter 'text' is required", 400

    # 1. Try online gTTS first for premium speech quality
    data, mimetype = text_to_speech_gtts(text)
    
    # 2. Fall back to offline pyttsx3 system TTS
    if not data:
        print("[TTS] Falling back to offline pyttsx3 generator...")
        data, mimetype = text_to_speech_pyttsx3(text)
        
    if data:
        return send_file(
            io.BytesIO(data),
            mimetype=mimetype,
            as_attachment=False,
            download_name="speech.mp3" if mimetype == "audio/mpeg" else "speech.wav"
        )
    else:
        return "Text-to-speech rendering failed", 500


if __name__ == "__main__":
    import os

    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port)