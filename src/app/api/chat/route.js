import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

const contentFilePath = path.join(process.cwd(), "src", "data", "site-content.json");

const defaultSystemPrompt =
  "You are a helpful AI assistant on the portfolio website of plusesee, a designer and creative. Always reply in Chinese (Simplified). Keep responses concise, friendly, and creative.";
const defaultOfflineMessage = "AI 暂时离线（MODELSCOPE_API_KEY 未配置）。";

const readAIConfig = async () => {
  try {
    const fileContents = await fs.readFile(contentFilePath, "utf8");
    const normalized = fileContents.replace(/^\uFEFF/, "");
    const content = JSON.parse(normalized);
    return {
      systemPrompt: content?.home?.ai?.systemPrompt || defaultSystemPrompt,
      offlineMessage: content?.home?.ai?.offlineMessage || defaultOfflineMessage,
    };
  } catch {
    return {
      systemPrompt: defaultSystemPrompt,
      offlineMessage: defaultOfflineMessage,
    };
  }
};

export async function POST(req) {
  try {
    const { messages } = await req.json();
    const aiConfig = await readAIConfig();

    const apiKey = process.env.MODELSCOPE_API_KEY;

    if (!apiKey || apiKey === "your_api_key_here") {
      return NextResponse.json({
        role: "assistant",
        content: aiConfig.offlineMessage,
      });
    }

    const response = await fetch("https://api-inference.modelscope.cn/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "Qwen/Qwen3-8B",
        messages: [
          {
            role: "system",
            content: aiConfig.systemPrompt,
          },
          ...messages,
        ],
        stream: false,
        enable_thinking: false,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("ModelScope API error:", data);
      return NextResponse.json({
        role: "assistant",
        content: `API Error: ${data.error?.message || JSON.stringify(data)}`,
      });
    }

    return NextResponse.json(data.choices[0].message);
  } catch (error) {
    console.error("Chat API Error:", error);
    return NextResponse.json(
      { role: "assistant", content: "Oops, something went wrong on our end." },
      { status: 500 }
    );
  }
}
