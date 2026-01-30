import { NextRequest, NextResponse } from 'next/server';
import { ShareLink, CreateShareRequest, ShareResponse } from '@/types/sharing';

// Mock database - replace with actual database
const shareLinks: ShareLink[] = [];

export async function GET() {
  return NextResponse.json({ shareLinks });
}

export async function POST(request: NextRequest) {
  try {
    const data: CreateShareRequest = await request.json();
    
    // Generate unique token
    const token = `share_${Math.random().toString(36).substr(2, 16)}`;
    
    // Create share link
    const shareLink: ShareLink = {
      id: Date.now().toString(),
      token,
      name: data.name,
      config: data.config,
      createdAt: new Date(),
      updatedAt: new Date(),
      accessCount: 0,
      isActive: true,
    };
    
    // Store in mock database
    shareLinks.push(shareLink);
    
    // Generate response with URLs
    const fullUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/share/${token}`;
    const embedCode = data.config.allowEmbedding 
      ? `<iframe src="${fullUrl}" width="100%" height="600" frameborder="0"></iframe>`
      : '';
    
    const response: ShareResponse = {
      shareLink,
      fullUrl,
      embedCode,
    };
    
    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create share link' },
      { status: 500 }
    );
  }
}