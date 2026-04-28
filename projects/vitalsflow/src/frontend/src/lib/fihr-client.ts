// Using HAPI FHIR public R4 server with a confirmed existing patient
const fhirServerUrl = "https://hapi.fhir.org/baseR4";

async function fhirRequest(path: string) {
  let response: Response;
  try {
    response = await fetch(`${fhirServerUrl}/${path}`, {
      headers: {
        Accept: "application/fhir+json",
      },
    });
  } catch (err: unknown) {
    const cause = err instanceof Error ? err : new Error(String(err));
    throw new Error(`Network error fetching ${fhirServerUrl}/${path}: ${cause.message}`, { cause });
  }

  if (!response.ok) {
    throw new Error(`FHIR request failed [${response.status} ${response.statusText}]: ${fhirServerUrl}/${path}`);
  }

  return response.json();
}

export async function getPatientData(patientId: string) {
  try {
    // Fetch Patient resource
    const patient = await fhirRequest(`Patient/${patientId}`);

    // Fetch Observations (vitals) for the patient
    const vitals = await fhirRequest(`Observation?patient=${patientId}&_count=5`);

    return { patient, vitals };
  } catch (error) {
    console.error("FHIR Fetch Error:", error);
    throw error;
  }
}
