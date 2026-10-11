import { NextResponse } from "next/server";
import { INITIAL_SEED_DATA } from "@/lib/seed/demo-data";

export async function GET() {
  return NextResponse.json({
    status: "success",
    data: INITIAL_SEED_DATA,
  });
}
