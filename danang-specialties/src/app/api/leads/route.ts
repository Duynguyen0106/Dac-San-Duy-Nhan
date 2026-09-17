import { NextResponse } from "next/server";
import { createLead, validateLeadInput } from "@/lib/leads";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validated = validateLeadInput(body);
    if (!validated.ok) {
      return NextResponse.json({ error: validated.error }, { status: 400 });
    }

    const lead = await createLead(validated.data);
    return NextResponse.json({ lead }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to save order lead." },
      { status: 500 },
    );
  }
}
