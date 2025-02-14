from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from transformers import pipeline
import json
import os
import logging

# sqlalchemy logging
logging.basicConfig()
logging.getLogger("sqlalchemy.engine").setLevel(logging.INFO)

app = Flask(__name__)
CORS(app)

# database config
BASE_DIR = os.path.abspath(os.path.dirname(__file__))
app.config["SQLALCHEMY_DATABASE_URI"] = f"sqlite:///{os.path.join(BASE_DIR, 'logs.db')}"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
db = SQLAlchemy(app)

# database model
class Log(db.Model):
    __tablename__ = "log"
    id = db.Column(db.Integer, primary_key=True)
    text = db.Column(db.String(500), nullable=False)
    result = db.Column(db.String(1000), nullable=False)

# initialize db
with app.app_context():
    db.create_all()
    print("Database initialized. Using table: 'log'")

# loading ml models
gibberish_model = pipeline("text-classification", model="wajidlinux99/gibberish-text-detector", trust_remote_code=True)
emotion_model = pipeline("text-classification", model="SamLowe/roberta-base-go_emotions", trust_remote_code=True)

# homepage
@app.route("/")
def home():
    return """
    <h1>API is Running</h1>
    """

@app.route("/score", methods=["POST"])
def score_text():
    """processes input text with gibberish and emotion models"""
    data = request.json
    text = data.get("text")

    if not text:
        return jsonify({"error": "No text provided"}), 400

    try:
        # get model scores
        gibberish_result = gibberish_model(text)[0]
        emotion_result = emotion_model(text)[0]

        response = {
            "gibberish": gibberish_result["label"],
            "gibberish_score": gibberish_result["score"],
            "emotion": emotion_result["label"],
            "emotion_score": emotion_result["score"],
        }

        # save to db
        new_log = Log(text=text, result=json.dumps(response))
        db.session.add(new_log)
        db.session.commit()
        print(f"Log saved: {new_log.id} | Text: {text}")

        return jsonify(response)

    except Exception as e:
        db.session.rollback()
        print(f"Error processing text: {e}")
        return jsonify({"error": "Internal Server Error"}), 500

@app.route("/logs", methods=["GET"])
def get_logs():
    """retrieves stored logs from database"""
    logs = Log.query.all()
    data = []
    for log in logs:
        try:
            parsed_result = json.loads(log.result) if isinstance(log.result, str) else log.result
            data.append({
                "id": log.id,
                "text": log.text,
                "gibberish": parsed_result["gibberish"],
                "gibberish_score": parsed_result["gibberish_score"],
                "emotion": parsed_result["emotion"],
                "emotion_score": parsed_result["emotion_score"],
            })
        except json.JSONDecodeError as e:
            print(f"JSONDecodeError in log ID {log.id}: {e}")
            continue

    return jsonify(data)

# endpoint to clear logs
@app.route('/clear', methods=['DELETE'])
def clear_logs():
    """Deletes all logs from the database."""
    try:
        db.session.query(Log).delete()  # deltes all records
        db.session.commit()
        print("All logs cleared.")
        return jsonify({"message": "All logs cleared."}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"Failed to clear logs: {str(e)}"}), 500

if __name__ == "__main__":
    app.run(debug=True)