import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Call your FastAPI backend to get user data
    const response = await fetch("http://localhost:8000/api/dashboard-data", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (response.ok) {
      const data = await response.json();
      return NextResponse.json(data);
    } else {
      // Return mock data if backend is not available
      return NextResponse.json({
        message: "Using mock data - backend not available",
        mock: true,
      });
    }
  } catch (error) {
    console.error("Dashboard API error:", error);
    // Return mock data as fallback
    return NextResponse.json({
      message: "Using mock data - backend connection failed",
      mock: true,
    });
  }
}