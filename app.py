from flask import Flask, request, jsonify
import speech_recognition as sr
from googletrans import Translator
import logging

app = Flask(__name__)

# Initialize recognizer and translator
recognizer = sr.Recognizer()
translator = Translator()

# Setup logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

@app.route('/recognize_speech', methods=['POST'])
def recognize_speech():
    try:
        # Log that a request was received
        logging.info("Received a speech recognition request")

        # Get the audio from the request
        audio_file = request.files['audio']
        logging.info(f"Audio file received: {audio_file}")

        # Load the audio file
        with sr.AudioFile(audio_file) as source:
            audio = recognizer.record(source)

        # Recognize speech in Hindi
        text = recognizer.recognize_google(audio, language="hi-IN")
        logging.info(f"Recognized Hindi text: {text}")

        # Translate to English
        translated_text = translator.translate(text, src='hi', dest='en').text
        logging.info(f"Translated text to English: {translated_text}")

        return jsonify({"original_text": text, "translated_text": translated_text})

    except Exception as e:
        logging.error(f"Error during speech recognition or translation: {str(e)}")
        return jsonify({"error": str(e)})
    
@app.route('/')
def home():
    return "Flask API is running!", 200    

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)  # Host on local network

