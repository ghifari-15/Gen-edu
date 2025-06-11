import { NextRequest, NextResponse } from 'next/server';
import { AuthUtils } from '@/lib/auth/utils';
import dbConnect from '@/lib/database/mongodb';
import User from '@/lib/models/User';

// Model untuk Notebook
interface INotebook {
  id: string;
  userId: string;
  title: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  isPublic: boolean;
  tags: string[];
  sources: Array<{
    id: string;
    name: string;
    type: string;
    url?: string;
  }>;
}

// Untuk saat ini kita gunakan localStorage simulation
// Nanti bisa diganti dengan MongoDB model untuk Notebook

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Verify token
    const payload = AuthUtils.verifyToken(token);
    if (!payload) {
      return NextResponse.json(
        { success: false, message: 'Invalid token' },
        { status: 401 }
      );
    }

    await dbConnect();
    const user = await User.findByUserId(payload.userId);
    
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    // Untuk sekarang return sample notebooks dengan user info
    // Nanti bisa diganti dengan query dari database
    const { sampleNotebooks } = await import('@/data/sample-notebooks');
    
    const userNotebooks = sampleNotebooks.map(notebook => ({
      ...notebook,
      userId: user.userId,
      createdAt: new Date(),
      updatedAt: new Date(),
      isPublic: false,
      tags: [],
      sources: []
    }));

    return NextResponse.json({
      success: true,
      notebooks: userNotebooks
    });

  } catch (error) {
    console.error('Get notebooks error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Verify token
    const payload = AuthUtils.verifyToken(token);
    if (!payload) {
      return NextResponse.json(
        { success: false, message: 'Invalid token' },
        { status: 401 }
      );
    }

    const { title, content = '', isPublic = false, tags = [] } = await request.json();

    if (!title) {
      return NextResponse.json(
        { success: false, message: 'Title is required' },
        { status: 400 }
      );
    }

    await dbConnect();
    const user = await User.findByUserId(payload.userId);
    
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    // Create new notebook
    const newNotebook = {
      id: `notebook_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId: user.userId,
      title,
      content,
      createdAt: new Date(),
      updatedAt: new Date(),
      isPublic,
      tags,
      sources: []
    };

    // Update user statistics
    user.statistics.notebooksCreated += 1;
    await user.save();

    return NextResponse.json({
      success: true,
      message: 'Notebook created successfully',
      notebook: newNotebook
    }, { status: 201 });

  } catch (error) {
    console.error('Create notebook error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
