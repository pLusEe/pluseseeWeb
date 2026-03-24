import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');

    if (!file) {
      return NextResponse.json({ error: 'No file received' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const filename = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;

    // Determine folder by file type
    const mime = file.type || '';
    let category = 'images';
    if (mime.startsWith('video/')) category = 'videos';
    else if (mime.startsWith('audio/')) category = 'audios';

    const targetDir = path.join(process.cwd(), 'public', 'media', category);
    await mkdir(targetDir, { recursive: true });

    const filePath = path.join(targetDir, filename);
    await writeFile(filePath, buffer);

    return NextResponse.json({ url: `/media/${category}/${filename}` });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
