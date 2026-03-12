import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const { messages } = await req.json();
    
    const apiKey = process.env.MODELSCOPE_API_KEY;
    
    if (!apiKey || apiKey === 'your_api_key_here') {
      return NextResponse.json({ 
        role: "assistant", 
        content: "AI is currently offline (MODELSCOPE_API_KEY not set in .env.local)."
      });
    }

    // Call ModelScope API (OpenAI-compatible)
    const response = await fetch('https://api-inference.modelscope.cn/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'Qwen/Qwen3-8B', // Qwen3 series — actively supported on ModelScope API-Inference (2025)
        messages: [
          { 
            role: "system", 
            content: "You are a helpful AI assistant on the portfolio website of plusesee — a designer and creative. You MUST always reply in Chinese (Simplified). Keep your responses concise, friendly, and creative." 
          },
          ...messages
        ],
        stream: false,
        enable_thinking: false, // Required for Qwen3 non-streaming calls
      }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      console.error('ModelScope API error:', data);
      return NextResponse.json({ 
        role: "assistant", 
        content: `API Error: ${data.error?.message || JSON.stringify(data)}` 
      });
    }

    return NextResponse.json(data.choices[0].message);

  } catch (error) {
    console.error('Chat API Error:', error);
    return NextResponse.json(
      { role: "assistant", content: "Oops, something went wrong on our end." },
      { status: 500 }
    );
  }
}
