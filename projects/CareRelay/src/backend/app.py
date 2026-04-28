import base64
import io
from pathlib import Path

import qrcode
from flask import Flask, jsonify, request, send_file
from flask_cors import CORS
from ai_brief import generate_brief
from drug_check import check_interactions
from fhir_utils import load_patient
from rag_chat import answer as rag_answer

app = Flask(__name__)
CORS(app)


@app.route("/api/patient/<patient_id>")
def get_patient(patient_id):
    try:
        return jsonify(load_patient(patient_id))
    except FileNotFoundError:
        return jsonify({"error": "patient data file not found"}), 404
    except Exception as exc:
        return jsonify({"error": str(exc)}), 500


@app.route("/api/brief", methods=["POST"])
def get_brief():
    request_data = request.get_json(silent=True) or {}
    patient_data = request_data.get("patientData") or request_data or load_patient("default")
    return jsonify(generate_brief(patient_data))


@app.route("/api/drugs/interactions")
def get_interactions():
    meds = [med.strip() for med in request.args.get("meds", "").split(",") if med.strip()]
    if not meds:
        return jsonify({"error": "Provide medications with ?meds=med1,med2"}), 400
    return jsonify(check_interactions(meds))


@app.route("/api/ner", methods=["POST"])
def get_entities():
    return jsonify({"message": "NER endpoint ready"})


@app.route("/api/chat", methods=["POST"])
def chat():
    data = request.get_json(silent=True) or {}
    query = data.get("question", "").strip()
    if not query:
        return jsonify({"error": "Provide a 'question' field."}), 400
    try:
        result = rag_answer(query)
        return jsonify(result)
    except Exception as exc:
        return jsonify({"error": str(exc)}), 500


PDF_FILE = Path(__file__).resolve().parent.parent / "data" / "Patient_EHR_James_Mitchell.pdf"


@app.route("/api/pdf/mitchell")
def serve_mitchell_pdf():
    if not PDF_FILE.exists():
        return jsonify({"error": "PDF not found"}), 404
    return send_file(
        PDF_FILE,
        mimetype="application/pdf",
        download_name="Patient_EHR_James_Mitchell.pdf",
    )


@app.route("/api/qr/<patient_id>")
def get_qr(patient_id):
    patient_url = request.args.get("url") or f"http://localhost:5173/patient/{patient_id}"

    qr = qrcode.make(patient_url)
    buffer = io.BytesIO()
    qr.save(buffer, format="PNG")
    encoded = base64.b64encode(buffer.getvalue()).decode("utf-8")

    return jsonify(
        {
            "patientId": patient_id,
            "url": patient_url,
            "qr": f"data:image/png;base64,{encoded}",
            "disclaimer": "For demonstration only. Uses synthetic patient data. Not for clinical use.",
        }
    )


if __name__ == "__main__":
    app.run(debug=True, port=5000)
