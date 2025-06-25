import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminToken } from '@/lib/auth/verify-token'

export async function GET(request: NextRequest) {
  try {
    const adminUser = await verifyAdminToken(request)
    
    if (!adminUser) {
      return NextResponse.json(
        { success: false, message: 'Admin authentication required' },
        { status: 401 }
      )
    }

    return NextResponse.json({
      success: true,
      user: {
        userId: adminUser.userId,
        email: adminUser.email,
        role: adminUser.role
      }
    })
  } catch (error) {
    console.error('Admin auth check error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}
