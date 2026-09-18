import { NextResponse } from "next/server";
import { createLead, validateLeadInput } from "@/lib/leads";
import { notifyLeadCreated } from "@/lib/leadNotify";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validated = validateLeadInput(body);
    if (!validated.ok) {
      return NextResponse.json({ error: validated.error }, { status: 400 });
    }

    const lead = await createLead(validated.data);
    const notify = await notifyLeadCreated(lead);
    return NextResponse.json({ lead, notify }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to save order lead." },
      { status: 500 },
    );
  }
}
