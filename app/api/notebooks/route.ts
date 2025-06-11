import { NextRequest, NextResponse } from 'next/server';
import { AuthUtils } from '@/lib/auth/utils';
import dbConnect from '@/lib/database/mongodb';
import Notebook from '@/lib/models/Notebook';
import User from '@/lib/models/User';

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

    // Get user's notebooks
    const notebooks = await Notebook.find({ userId: payload.userId })
      .sort({ updatedAt: -1 })
      .select('notebookId title description metadata stats createdAt updatedAt lastSaved');

    return NextResponse.json({
      success: true,
      notebooks
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

    const { title, description, metadata = {}, cells = [] } = await request.json();

    if (!title) {
      return NextResponse.json(
        { success: false, message: 'Title is required' },
        { status: 400 }
      );
    }

    await dbConnect();

    // Generate unique notebookId
    const notebookId = `nb_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Create default cell if no cells provided
    const defaultCells = cells.length > 0 ? cells : [
      {
        id: `cell_${Date.now()}`,
        type: 'markdown',
        content: '# Welcome to your new notebook\n\nStart typing to begin...',
        metadata: {
          language: 'markdown'
        }
      }
    ];

    const notebook = new Notebook({
      notebookId,
      title,
      description,
      userId: payload.userId,
      cells: defaultCells,
      metadata: {
        language: 'javascript',
        tags: [],
        difficulty: 'beginner',
        estimatedTime: 30,
        subjects: [],
        ...metadata
      }
    });

    await notebook.save();    // Update user statistics
    const user = await User.findOne({ userId: payload.userId });
    if (user) {
      // Initialize statistics if it doesn't exist or any field is missing
      if (!user.statistics) {
        user.statistics = {
          notebooksCreated: 0,
          quizzesCompleted: 0,
          quizzesCreated: 0,
          totalStudyTime: 0,
          streakDays: 0,
          lastActive: new Date()
        };
      } else {
        // Ensure all fields exist with defaults
        if (typeof user.statistics.notebooksCreated !== 'number') {
          user.statistics.notebooksCreated = 0;
        }
        if (typeof user.statistics.quizzesCompleted !== 'number') {
          user.statistics.quizzesCompleted = 0;
        }
        if (typeof user.statistics.quizzesCreated !== 'number') {
          user.statistics.quizzesCreated = 0;
        }
        if (typeof user.statistics.totalStudyTime !== 'number') {
          user.statistics.totalStudyTime = 0;
        }
        if (typeof user.statistics.streakDays !== 'number') {
          user.statistics.streakDays = 0;
        }
        if (!user.statistics.lastActive) {
          user.statistics.lastActive = new Date();
        }
      }
      
      user.statistics.notebooksCreated += 1;
      user.statistics.lastActive = new Date();
      await user.save();
    }

    return NextResponse.json({
      success: true,
      message: 'Notebook created successfully',
      notebook
    }, { status: 201 });

  } catch (error) {
    console.error('Create notebook error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
