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
    const days = parseInt(searchParams.get('days') || '7');
    const limit = parseInt(searchParams.get('limit') || '10');

    const recentQuizzes = await KnowledgeBaseManager.getRecentQuizzes(payload.userId, days, limit);

    return NextResponse.json({
      success: true,
      data: recentQuizzes,
      count: recentQuizzes.length,
      filters: {
        days,
        limit
      }
    });

  } catch (error) {
    console.error('Error fetching recent quizzes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch recent quizzes' },
      { status: 500 }
    );
  }
}
