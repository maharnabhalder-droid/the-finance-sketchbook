import { NextResponse } from "next/server";
import { INITIAL_SEED_DATA } from "@/lib/seed/demo-data";

export async function GET() {
  return NextResponse.json({
    status: "success",
    events: INITIAL_SEED_DATA.unexpectedEvents,
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    return NextResponse.json({
      status: "success",
      message: "Event simulated successfully",
      event: {
        id: `evt_mock_${Date.now()}`,
        ...body,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { status: "error", message: "Invalid payload" },
      { status: 400 }
    );
  }
}
