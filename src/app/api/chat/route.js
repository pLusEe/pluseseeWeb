import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const { messages } = await req.json();
    
    // Check if the API key is configured
    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'your_api_key_here') {
      return NextResponse.json({ 
        role: "assistant", 
        content: "I'm currently running in offline mode because the OPENAI_API_KEY is not set in `.env.local` or Vercel Environment Variables. Please set up your key to chat with me!"
      });
    }

    // Call OpenAI API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo', // You can change this to gpt-4 or Claude/DeepSeek if using compatible endpoints
        messages: [
          { role: "system", content: "You are a helpful AI assistant residing on the portfolio website of d3adrabbit. You should answer questions playfully and concisely." },
          ...messages
        ],
      }),
    });

    const data = await response.json();
    
    if (!response.ok) {
       return NextResponse.json({ role: "assistant", content: `Error from LLM API: ${data.error?.message || 'Unknown Error'}` });
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
