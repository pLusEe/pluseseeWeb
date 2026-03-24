import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

const contentFilePath = path.join(process.cwd(), "src", "data", "site-content.json");

const readContent = async () => {
  const fileContents = await fs.readFile(contentFilePath, "utf8");
  const normalized = fileContents.replace(/^\uFEFF/, "");
  return JSON.parse(normalized);
};

export async function GET() {
  try {
    const content = await readContent();
    return NextResponse.json(content);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to read site content", detail: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const content = body?.content ?? body;

    if (!content || typeof content !== "object" || Array.isArray(content)) {
      return NextResponse.json({ error: "Invalid content payload" }, { status: 400 });
    }

    const next = JSON.stringify(content, null, 2) + "\n";
    await fs.writeFile(contentFilePath, next, "utf8");
    return NextResponse.json({ success: true, content });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to save site content", detail: error.message },
      { status: 500 }
    );
  }
}
