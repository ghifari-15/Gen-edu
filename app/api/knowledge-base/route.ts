import { NextRequest, NextResponse } from 'next/server';
import { AuthUtils } from '@/lib/auth/utils';
import { KnowledgeBaseManager } from '@/lib/utils/knowledge-base';

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = AuthUtils.verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const source = searchParams.get('source') ?? undefined;
    const subject = searchParams.get('subject') ?? undefined;
    const tags = searchParams.get('tags')?.split(',').filter(Boolean);
    const limit = parseInt(searchParams.get('limit') || '50');
    const search = searchParams.get('search') ?? undefined;
    const days = searchParams.get('days') ? parseInt(searchParams.get('days')!) : undefined;

    const knowledgeBase = await KnowledgeBaseManager.getKnowledgeBaseForUser(
      payload.userId,
      { source, subject, tags, limit, search, days }
    );

    return NextResponse.json({
      success: true,
      data: knowledgeBase,
      count: knowledgeBase.length,
      filters: {
        source,
        subject,
        tags,
        limit,
        search,
        days
      }
    });

  } catch (error) {
    console.error('Error fetching knowledge base:', error);
    return NextResponse.json(
      { error: 'Failed to fetch knowledge base' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = AuthUtils.verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Knowledge base ID is required' },
        { status: 400 }
      );
    }

    const result = await KnowledgeBaseManager.deleteEntry(payload.userId, id);

    if (!result) {
      return NextResponse.json(
        { error: 'Knowledge base entry not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Knowledge base entry deleted successfully',
    });

  } catch (error) {
    console.error('Error deleting knowledge base entry:', error);
    return NextResponse.json(
      { error: 'Failed to delete knowledge base entry' },
      { status: 500 }
    );
  }
}
