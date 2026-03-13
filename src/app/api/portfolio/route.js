import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { writeFile } from 'fs/promises';

const dataFilePath = path.join(process.cwd(), 'src', 'data', 'portfolio.json');

export async function GET() {
  try {
    const fileContents = await fs.readFile(dataFilePath, 'utf8');
    const normalized = fileContents.replace(/^\uFEFF/, '');
    return NextResponse.json(JSON.parse(normalized));
  } catch {
    return NextResponse.json([], { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const fileContents = await fs.readFile(dataFilePath, 'utf8');
    const normalized = fileContents.replace(/^\uFEFF/, '');
    const items = JSON.parse(normalized);

    if (body.action === 'delete') {
      const updated = items.filter(item => item.id !== body.id);
      await writeFile(dataFilePath, JSON.stringify(updated, null, 2));
      return NextResponse.json({ success: true });
    }

    const normalizedId = String(Date.now());
    const normalizedMediaType = body.mediaType || 'image';
    const normalizedMediaUrl = body.mediaUrl || '';
    const normalizedThumbUrl =
      body.thumbUrl ||
      (normalizedMediaType === 'image' ? normalizedMediaUrl : '/placeholder1.jpg');

    // Create new item
    const newItem = {
      id: normalizedId,
      title: body.title || 'Untitled',
      category: body.category || 'personal design',
      description: body.description || '',
      date: body.date || '',
      mediaType: normalizedMediaType,
      mediaUrl: normalizedMediaUrl,
      thumbUrl: normalizedThumbUrl,
    };

    items.push(newItem);
    await writeFile(dataFilePath, JSON.stringify(items, null, 2));
    return NextResponse.json(newItem, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
