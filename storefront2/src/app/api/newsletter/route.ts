import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const SUBSCRIBERS_FILE = path.join(process.cwd(), "src/data/newsletter-subscribers.json");

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email || typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json({ error: "E-mail inválido" }, { status: 400 });
    }

    let subscribers: string[] = [];
    if (fs.existsSync(SUBSCRIBERS_FILE)) {
      subscribers = JSON.parse(fs.readFileSync(SUBSCRIBERS_FILE, "utf-8"));
    }

    if (subscribers.includes(email)) {
      return NextResponse.json({ success: true, message: "Já cadastrado" });
    }

    subscribers.push(email);
    fs.writeFileSync(SUBSCRIBERS_FILE, JSON.stringify(subscribers, null, 2));

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Erro ao processar" }, { status: 500 });
  }
}
