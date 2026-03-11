import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

export async function GET() {
  const dataFilePath = path.join(process.cwd(), 'src', 'data', 'portfolio.json');
  try {
    const fileContents = await fs.readFile(dataFilePath, 'utf8');
    const data = JSON.parse(fileContents);
    return NextResponse.json(data);
  } catch (error) {
    console.error('Failed to load portfolio data', error);
    return NextResponse.json([], { status: 500 });
  }
}
