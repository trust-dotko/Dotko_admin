import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(
  request: NextRequest,
  { params }: { params: { filename: string } }
) {
  const filename = params.filename;
  
  // Sanitize filename to prevent directory traversal
  const safeFilename = path.basename(filename);
  const filePath = path.join(process.cwd(), 'assets', safeFilename);

  try {
    if (!fs.existsSync(filePath)) {
      return new NextResponse('File not found', { status: 404 });
    }

    const fileBuffer = await fs.promises.readFile(filePath);
    
    // Determine content type
    let contentType = 'application/octet-stream';
    if (safeFilename.endsWith('.png')) {
      contentType = 'image/png';
    } else if (safeFilename.endsWith('.jpg') || safeFilename.endsWith('.jpeg')) {
      contentType = 'image/jpeg';
    } else if (safeFilename.endsWith('.svg')) {
      contentType = 'image/svg+xml';
    } else if (safeFilename.endsWith('.mp4')) {
      contentType = 'video/mp4';
    } else if (safeFilename.endsWith('.json')) {
      contentType = 'application/json';
    }

    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (error) {
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
