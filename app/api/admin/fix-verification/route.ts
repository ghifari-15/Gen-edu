import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminToken } from '@/lib/auth/verify-token';
import { MongoClient } from 'mongodb';

export async function POST(request: NextRequest) {
  try {
    const adminUser = await verifyAdminToken(request)
    if (!adminUser) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

    const uri = process.env.MONGODB_URI!
    const client = new MongoClient(uri)
    await client.connect()
    
    const db = client.db(process.env.MONGODB_DB || 'genedu')
    const collection = db.collection('users')

    // First, let's see what users we have
    const allUsers = await collection.find({}, { projection: { email: 1, isEmailVerified: 1, isVerified: 1, emailVerified: 1 } }).toArray()
    console.log('All users before fix:', allUsers)

    // Update all users to ensure they have proper verification fields
    const result = await collection.updateMany(
      {}, // Update all users
      { 
        $set: { 
          isVerified: true,
          emailVerified: true,
          isEmailVerified: true, // Set all verification fields to true
          verifiedAt: new Date(),
          updatedAt: new Date()
        } 
      }
    )

    // Check results after update
    const updatedUsers = await collection.find({}, { projection: { email: 1, isEmailVerified: 1, isVerified: 1, emailVerified: 1 } }).toArray()
    console.log('All users after fix:', updatedUsers)

    await client.close()

    console.log('Fixed verification for users:', result.modifiedCount)

    return NextResponse.json({
      success: true,
      message: `Fixed verification for ${result.modifiedCount} users`,
      beforeFix: allUsers.length,
      afterFix: updatedUsers.length,
      usersFixed: updatedUsers
    })

  } catch (error) {
    console.error('Fix verification error:', error)
    return NextResponse.json({ 
      success: false, 
      message: 'Internal server error' 
    }, { status: 500 })
  }
}
