import { NextResponse } from "next/server"

export async function POST(request: Request) {
  const body = await request.json().catch(() => null)

  if (
    !body ||
    typeof body.email !== "string" ||
    !body.email.includes("@") ||
    !body.selections ||
    !body.quote
  ) {
    return NextResponse.json(
      { message: "Payload non valido" },
      { status: 400 }
    )
  }

  // In un contesto reale qui invieremmo i dati al CRM / webhook.
  console.info("Lead ricevuto dal calcolatore", body)

  return NextResponse.json({ ok: true })
}
