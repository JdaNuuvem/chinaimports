import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const MESSAGES_FILE = path.join(process.cwd(), "src/data/contact-messages.json");

export async function POST(request: NextRequest) {
  try {
    const { name, email, message } = await request.json();

    if (!name || !email || !message) {
      return NextResponse.json({ error: "Todos os campos são obrigatórios" }, { status: 400 });
    }

    const entry = {
      id: Date.now().toString(),
      name,
      email,
      message,
      createdAt: new Date().toISOString(),
    };

    // Append to JSON file
    let messages: unknown[] = [];
    if (fs.existsSync(MESSAGES_FILE)) {
      messages = JSON.parse(fs.readFileSync(MESSAGES_FILE, "utf-8"));
    }
    messages.push(entry);
    fs.writeFileSync(MESSAGES_FILE, JSON.stringify(messages, null, 2));

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Erro ao processar mensagem" }, { status: 500 });
  }
}
