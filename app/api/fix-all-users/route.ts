import { NextRequest, NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';

export async function POST(request: NextRequest) {
  try {
    const uri = process.env.MONGODB_URI!
    const client = new MongoClient(uri)
    await client.connect()
    
    const db = client.db(process.env.MONGODB_DB || 'genedu')
    const collection = db.collection('users')

    // First, let's see what users we have
    const allUsers = await collection.find({}).toArray()
    console.log('All users before fix:', allUsers.map(u => ({
      email: u.email,
      isEmailVerified: u.isEmailVerified,
      isVerified: u.isVerified,
      emailVerified: u.emailVerified
    })))

    // Update all users to ensure they have proper verification fields
    const result = await collection.updateMany(
      {}, // Update all users
      { 
        $set: { 
          isEmailVerified: true,
          isVerified: true,
          emailVerified: true,
          verifiedAt: new Date(),
          updatedAt: new Date()
        } 
      }
    )

    // Check results after update
    const updatedUsers = await collection.find({}).toArray()
    console.log('All users after fix:', updatedUsers.map(u => ({
      email: u.email,
      isEmailVerified: u.isEmailVerified,
      isVerified: u.isVerified,
      emailVerified: u.emailVerified
    })))

    await client.close()

    return NextResponse.json({
      success: true,
      message: `Fixed verification for ${result.modifiedCount} users`,
      beforeFix: allUsers.length,
      afterFix: updatedUsers.length
    })

  } catch (error) {
    console.error('Fix verification error:', error)
    return NextResponse.json({ 
      success: false, 
      message: 'Internal server error',
      error: error.message 
    }, { status: 500 })
  }
}
