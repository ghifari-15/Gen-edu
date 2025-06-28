import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminToken } from '@/lib/auth/verify-token'

export async function GET(request: NextRequest) {
  try {
    const adminUser = await verifyAdminToken(request)
    if (!adminUser) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

    // Mock stats data
    const stats = {
      totalUsers: 24,
      totalKnowledgeBase: 45,
      activeUsers: 18,
      systemHealth: 'Good'
    }

    return NextResponse.json({
      success: true,
      stats
    })
  } catch (error) {
    console.error('Stats fetch error:', error)
    return NextResponse.json({ 
      success: false, 
      message: 'Internal server error' 
    }, { status: 500 })
  }
}
