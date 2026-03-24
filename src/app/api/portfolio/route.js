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
    const fallbackThumbUrl = '/media/images/placeholder1.jpg';
    const sanitizeUrl = (value) => (typeof value === 'string' ? value.trim() : '');
    const isInvalidUrl = (value) =>
      !value || value === '.' || value === '/.' || value.endsWith('/.');

    if (body.action === 'delete') {
      const updated = items.filter(item => item.id !== body.id);
      await writeFile(dataFilePath, JSON.stringify(updated, null, 2));
      return NextResponse.json({ success: true });
    }

    if (body.action === 'update') {
      const targetId = String(body.id || '');
      const index = items.findIndex((item) => String(item.id) === targetId);
      if (index < 0) {
        return NextResponse.json({ error: 'Item not found' }, { status: 404 });
      }

      const previous = items[index];
      const nextMediaType = body.mediaType || previous.mediaType || 'image';
      const incomingMediaUrl = sanitizeUrl(body.mediaUrl);
      const nextMediaUrl = isInvalidUrl(incomingMediaUrl)
        ? previous.mediaUrl || ''
        : incomingMediaUrl;
      const incomingThumbUrl = sanitizeUrl(body.thumbUrl);
      const nextThumbUrl = !isInvalidUrl(incomingThumbUrl)
        ? incomingThumbUrl
        : nextMediaType === 'image' && !isInvalidUrl(nextMediaUrl)
          ? nextMediaUrl
          : previous.thumbUrl || fallbackThumbUrl;

      const nextItem = {
        ...previous,
        title: body.title ?? previous.title ?? 'Untitled',
        category: body.category ?? previous.category ?? 'personal design',
        description: body.description ?? previous.description ?? '',
        date: body.date ?? previous.date ?? '',
        mediaType: nextMediaType,
        mediaUrl: nextMediaUrl,
        thumbUrl: nextThumbUrl,
      };

      items[index] = nextItem;
      await writeFile(dataFilePath, JSON.stringify(items, null, 2));
      return NextResponse.json(nextItem);
    }

    const normalizedId = String(Date.now());
    const normalizedMediaType = body.mediaType || 'image';
    const normalizedMediaUrl = sanitizeUrl(body.mediaUrl);
    const requestedThumbUrl = sanitizeUrl(body.thumbUrl);
    const normalizedThumbUrl = !isInvalidUrl(requestedThumbUrl)
      ? requestedThumbUrl
      : normalizedMediaType === 'image' && !isInvalidUrl(normalizedMediaUrl)
        ? normalizedMediaUrl
        : fallbackThumbUrl;

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
