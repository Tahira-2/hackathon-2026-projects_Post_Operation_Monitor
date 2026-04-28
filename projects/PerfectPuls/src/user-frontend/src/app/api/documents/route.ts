import { NextResponse } from "next/server";
import { fetchDocuments, deleteDocument } from "@/lib/cosmosdb";

export async function GET() {
  try {
    const documents = await fetchDocuments();
    return NextResponse.json(documents);
  } catch (error) {
    console.error("Cosmos DB fetch error:", error);
    // Return empty array so the UI degrades gracefully when Cosmos is unconfigured
    return NextResponse.json([]);
  }
}

export async function DELETE(request: Request) {
  try {
    const { id } = await request.json();
    if (!id) {
      return NextResponse.json({ error: "Missing document id" }, { status: 400 });
    }
    await deleteDocument(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Cosmos DB delete error:", error);
    return NextResponse.json({ error: "Failed to delete document" }, { status: 500 });
  }
}
