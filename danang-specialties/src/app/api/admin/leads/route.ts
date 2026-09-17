import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/adminAuth";
import {
  readLeads,
  updateLeadStatus,
  type LeadStatus,
} from "@/lib/leads";
import { isLeadNotifyConfigured } from "@/lib/leadNotify";

const STATUSES: LeadStatus[] = ["pending", "contacted", "done"];

export async function GET() {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  try {
    const leads = await readLeads();
    return NextResponse.json({
      leads,
      notifyConfigured: isLeadNotifyConfigured(),
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to load leads." },
      { status: 500 },
    );
  }
}

export async function PATCH(request: Request) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  try {
    const body = (await request.json()) as { id?: string; status?: string };
    const id = String(body.id ?? "").trim();
    const status = body.status as LeadStatus | undefined;
    if (!id || !status || !STATUSES.includes(status)) {
      return NextResponse.json(
        { error: "id and a valid status are required." },
        { status: 400 },
      );
    }

    const lead = await updateLeadStatus(id, status);
    if (!lead) {
      return NextResponse.json({ error: "Lead not found." }, { status: 404 });
    }
    return NextResponse.json({ lead });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to update lead." },
      { status: 500 },
    );
  }
}
