import { NextRequest, NextResponse } from 'next/server';
import { AuthUtils } from '@/lib/auth/utils';
import { LLMContextProvider } from '@/lib/utils/llm-context';

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

    const summary = await LLMContextProvider.getContextSummary(payload.userId);

    return NextResponse.json({
      success: true,
      ...summary
    });

  } catch (error) {
    console.error('Error fetching context summary:', error);
    return NextResponse.json(
      { error: 'Failed to fetch context summary' },
      { status: 500 }
    );
  }
}
