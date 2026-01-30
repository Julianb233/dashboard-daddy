import { NextRequest, NextResponse } from 'next/server';

// Mock database - replace with actual database
const shareLinks: any[] = [];

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: shareId } = await params;
    const shareLink = shareLinks.find(link => link.id === shareId);
    
    if (!shareLink) {
      return NextResponse.json(
        { error: 'Share link not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ shareLink });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to get share link' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: shareId } = await params;
    const updates = await request.json();
    
    const shareIndex = shareLinks.findIndex(link => link.id === shareId);
    
    if (shareIndex === -1) {
      return NextResponse.json(
        { error: 'Share link not found' },
        { status: 404 }
      );
    }
    
    // Update share link
    shareLinks[shareIndex] = {
      ...shareLinks[shareIndex],
      ...updates,
      updatedAt: new Date(),
    };
    
    return NextResponse.json({ shareLink: shareLinks[shareIndex] });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update share link' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: shareId } = await params;
    const shareIndex = shareLinks.findIndex(link => link.id === shareId);
    
    if (shareIndex === -1) {
      return NextResponse.json(
        { error: 'Share link not found' },
        { status: 404 }
      );
    }
    
    // Remove share link
    shareLinks.splice(shareIndex, 1);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete share link' },
      { status: 500 }
    );
  }
}