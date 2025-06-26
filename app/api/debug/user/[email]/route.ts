import { NextRequest, NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ email: string }> }
) {
  try {
    const { email } = await params
    
    const uri = process.env.MONGODB_URI!
    const client = new MongoClient(uri)
    await client.connect()
    
    const db = client.db(process.env.MONGODB_DB || 'genedu')
    const collection = db.collection('users')

    const user = await collection.findOne({ 
      email: decodeURIComponent(email).toLowerCase() 
    })

    await client.close()

    if (!user) {
      return NextResponse.json({ 
        success: false, 
        message: 'User not found' 
      }, { status: 404 })
    }

    // Return user data without password for debugging
    const { password, ...userData } = user
    
    return NextResponse.json({
      success: true,
      user: userData,
      verificationFields: {
        isEmailVerified: user.isEmailVerified,
        isVerified: user.isVerified,
        emailVerified: user.emailVerified,
        checkResult: user.isEmailVerified || user.isVerified || user.emailVerified
      }
    })

  } catch (error) {
    console.error('Debug user error:', error)
    return NextResponse.json({ 
      success: false, 
      message: 'Internal server error' 
    }, { status: 500 })
  }
}
