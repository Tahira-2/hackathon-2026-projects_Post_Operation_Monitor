const API_BASE = "http://127.0.0.1:5000";

async function request(path, options) {
  const response = await fetch(`${API_BASE}${path}`, options);
  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }
  return response.json();
}

export function getPatient() {
  return request("/api/patient/default");
}

export function generateBrief() {
  return request("/api/brief", { method: "POST" });
}

export function getDrugWarnings(medications) {
  const medQuery = medications.filter(Boolean).join(",");
  return request(`/api/drugs/interactions?meds=${encodeURIComponent(medQuery)}`);
}

export function getQr() {
  return request("/api/qr/default");
}
