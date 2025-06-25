import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminToken } from '@/lib/auth/verify-token'

// Mock settings storage
let systemSettings = {
  siteName: "GenEdu Platform",
  adminEmail: "admin@genedu.com",
  maxUsersPerRole: {
    student: 1000,
    teacher: 100
  },
  emailNotifications: true,
  autoBackup: true,
  maintenanceMode: false,
  allowRegistration: true
}

export async function GET(request: NextRequest) {
  try {
    const adminUser = await verifyAdminToken(request)
    if (!adminUser) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

    return NextResponse.json({
      success: true,
      settings: systemSettings
    })
  } catch (error) {
    console.error('Settings fetch error:', error)
    return NextResponse.json({ 
      success: false, 
      message: 'Internal server error' 
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const adminUser = await verifyAdminToken(request)
    if (!adminUser) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    
    // Update settings
    systemSettings = {
      ...systemSettings,
      ...body
    }

    return NextResponse.json({
      success: true,
      settings: systemSettings,
      message: 'Settings updated successfully'
    })
  } catch (error) {
    console.error('Settings update error:', error)
    return NextResponse.json({ 
      success: false, 
      message: 'Internal server error' 
    }, { status: 500 })
  }
}
