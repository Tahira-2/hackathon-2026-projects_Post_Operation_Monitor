import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const backendResponse = await fetch("http://localhost:8000/api/visualize-current-policy");
    const htmlContent = await backendResponse.text();
    
    return new NextResponse(htmlContent, {
      headers: { "Content-Type": "text/html" }
    });
  } catch (error) {
    return new NextResponse("Error fetching graph", { status: 500 });
  }
}