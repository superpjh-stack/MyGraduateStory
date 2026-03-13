import { NextResponse } from "next/server";
import { refreshGrowthSnapshot } from "@/lib/actions/growth";

export async function POST() {
  const result = await refreshGrowthSnapshot();

  if (result.error) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  return NextResponse.json({ data: result.data });
}
