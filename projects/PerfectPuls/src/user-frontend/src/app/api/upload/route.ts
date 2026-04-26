import { NextRequest, NextResponse } from "next/server";
import { saveDocument } from "@/lib/cosmosdb";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const policyName = (formData.get("policy_name") as string) ?? "unknown";

    // Forward the request to the FastAPI backend
    const backendResponse = await fetch("http://localhost:8000/api/process-pdf", {
      method: "POST",
      body: formData,
    });

    if (backendResponse.ok) {
      const data = await backendResponse.json();

      // Persist the upload response + document name in Cosmos DB (non-blocking)
      saveDocument({
        id: data.policy_id,
        document_name: policyName,
        policy_id: data.policy_id,
        status: data.status,
        upload_date: new Date().toISOString().split("T")[0],
        extraction_summary: data.extraction_summary,
        graph_preview: data.graph_preview,
        processing_time_ms: data.processing_time_ms,
      }).catch((err) => console.error("Cosmos DB save error (non-fatal):", err));

      return NextResponse.json(data);
    } else {
      const error = await backendResponse.text();
      return NextResponse.json(
        { error: `Backend error: ${error}` },
        { status: backendResponse.status }
      );
    }
  } catch (error) {
    console.error("Upload API error:", error);
    return NextResponse.json({ error: "Failed to upload file" }, { status: 500 });
  }
}
