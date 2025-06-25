import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminToken } from '@/lib/auth/verify-token';
import { MongoClient, ObjectId } from 'mongodb';
import { AuthUtils } from '@/lib/auth/utils';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const adminUser = await verifyAdminToken(request)
    if (!adminUser) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

    const { id } = params
    const body = await request.json()
    const { name, email, role, isVerified, status } = body

    // Validate input
    if (role && !['student', 'teacher'].includes(role)) {
      return NextResponse.json({ 
        success: false, 
        message: 'Invalid role specified' 
      }, { status: 400 })
    }

    if (email && !AuthUtils.isValidEmail(email)) {
      return NextResponse.json({ 
        success: false, 
        message: 'Invalid email format' 
      }, { status: 400 })
    }

    const uri = process.env.MONGODB_URI!
    const client = new MongoClient(uri)
    await client.connect()
    
    const db = client.db(process.env.MONGODB_DB || 'genedu')
    const collection = db.collection('users')

    // Find the user to update
    const existingUser = await collection.findOne({ userId: id })
    if (!existingUser) {
      await client.close()
      return NextResponse.json({ 
        success: false, 
        message: 'User not found' 
      }, { status: 404 })
    }

    // Don't allow updating admin users
    if (existingUser.role === 'admin') {
      await client.close()
      return NextResponse.json({ 
        success: false, 
        message: 'Cannot update admin users' 
      }, { status: 403 })
    }

    // Check if email is being changed and if it already exists
    if (email && email.toLowerCase() !== existingUser.email) {
      const emailExists = await collection.findOne({ 
        email: email.toLowerCase(),
        userId: { $ne: id }
      })
      if (emailExists) {
        await client.close()
        return NextResponse.json({ 
          success: false, 
          message: 'Email already exists' 
        }, { status: 400 })
      }
    }

    // Prepare update document
    const updateDoc: any = {
      updatedAt: new Date()
    }

    if (name !== undefined) updateDoc.name = name.trim()
    if (email !== undefined) updateDoc.email = email.toLowerCase().trim()
    if (role !== undefined) updateDoc.role = role
    if (isVerified !== undefined) updateDoc.isVerified = isVerified
    if (status !== undefined) updateDoc.status = status

    // Update the user
    const result = await collection.updateOne(
      { userId: id },
      { $set: updateDoc }
    )

    if (result.matchedCount === 0) {
      await client.close()
      return NextResponse.json({ 
        success: false, 
        message: 'User not found' 
      }, { status: 404 })
    }

    // Get the updated user
    const updatedUser = await collection.findOne({ userId: id })
    
    await client.close()

    // Return user data without password
    const { password: _, ...userWithoutPassword } = updatedUser!

    return NextResponse.json({
      success: true,
      user: userWithoutPassword,
      message: 'User updated successfully'
    })
  } catch (error) {
    console.error('User update error:', error)
    return NextResponse.json({ 
      success: false, 
      message: 'Internal server error' 
    }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const adminUser = await verifyAdminToken(request)
    if (!adminUser) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

    const { id } = params

    const uri = process.env.MONGODB_URI!
    const client = new MongoClient(uri)
    await client.connect()
    
    const db = client.db(process.env.MONGODB_DB || 'genedu')
    const collection = db.collection('users')

    // Find the user to delete
    const userToDelete = await collection.findOne({ userId: id })
    if (!userToDelete) {
      await client.close()
      return NextResponse.json({ 
        success: false, 
        message: 'User not found' 
      }, { status: 404 })
    }

    // Don't allow deleting admin users
    if (userToDelete.role === 'admin') {
      await client.close()
      return NextResponse.json({ 
        success: false, 
        message: 'Cannot delete admin users' 
      }, { status: 403 })
    }

    // Delete the user
    const result = await collection.deleteOne({ userId: id })
    
    await client.close()

    if (result.deletedCount === 0) {
      return NextResponse.json({ 
        success: false, 
        message: 'User not found' 
      }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: 'User deleted successfully'
    })
  } catch (error) {
    console.error('User delete error:', error)
    return NextResponse.json({ 
      success: false, 
      message: 'Internal server error' 
    }, { status: 500 })
  }
}
