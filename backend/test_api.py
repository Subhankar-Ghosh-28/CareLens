from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_system():
    # 1. Health check
    res = client.get("/")
    assert res.status_code == 200
    assert res.json()["service"] == "CareLens Pre-Consultation AI Platform"
    print("[PASS] Health check passed")

    # 2. Colloquial Rural Lexicon
    res = client.get("/api/lexicon")
    assert res.status_code == 200
    assert len(res.json()["lexicon"]) > 5
    print("[PASS] Rural lexicon endpoint passed")

    # 3. Conversational Intake with Rural Term
    res = client.post("/api/intake/chat", json={"message": "Mujhe bohot ghabrahat aur buk dhorche ho raha hai"})
    assert res.status_code == 200
    data = res.json()
    assert len(data["interpreted_terms"]) >= 1
    print("[PASS] Conversational intake & rural interpretation passed:", [t["clinical_term"] for t in data["interpreted_terms"]])

    # 4. Red-Flag Acute Coronary Syndrome Triage
    res = client.post("/api/intake/chat", json={"message": "Mujhe chhati me tez dard hai aur saans phool raha hai"})
    data = res.json()
    assert data["triage"]["red_flag_detected"] is True
    assert "Suspected Acute Coronary Syndrome" in data["triage"]["flag_title"]
    print("[PASS] Red-flag triage routing passed:", data["triage"]["flag_title"])

    # 5. FHIR R4 Export
    res = client.get("/api/fhir/patient/P-101")
    assert res.status_code == 200
    fhir = res.json()
    assert fhir["resourceType"] == "Bundle"
    assert fhir["type"] == "document"
    print("[PASS] ABDM FHIR R4 export passed. Total resources in bundle:", fhir["total"])

if __name__ == "__main__":
    test_system()
