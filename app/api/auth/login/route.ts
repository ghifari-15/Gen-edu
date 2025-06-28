import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/database/mongodb';
import User from '@/lib/models/User';
import Activity from '@/lib/models/Activity';
import { AuthUtils } from '@/lib/auth/utils';

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    
    const { email, password } = await request.json();

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: 'Email and password are required' },
        { status: 400 }
      );
    }

    if (!AuthUtils.isValidEmail(email)) {
      return NextResponse.json(
        { success: false, message: 'Invalid email format' },
        { status: 400 }
      );
    }    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { success: false, message: 'Invalid email or password' },
        { status: 401 }
      );
    }    // Check if user is verified - be more flexible for admin-created users
    const isVerified = user.isEmailVerified || user.isVerified || user.emailVerified || user.role === 'admin';
    
    console.log('Verification check for user:', {
      email: user.email,
      role: user.role,
      isEmailVerified: user.isEmailVerified,
      isVerified: user.isVerified,
      emailVerified: user.emailVerified,
      finalVerificationResult: isVerified
    });
    
    if (!isVerified) {
      console.log('Login blocked - user not verified:', {
        email: user.email,
        isEmailVerified: user.isEmailVerified,
        isVerified: user.isVerified,
        emailVerified: user.emailVerified,
        role: user.role
      });
      return NextResponse.json(
        { success: false, message: 'Please verify your email before logging in' },
        { status: 401 }
      );
    }    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Track login activity
    try {
      await (Activity as any).trackActivity(user.userId, 'login', {
        title: 'Logged in',
        description: 'User logged into the platform',
        metadata: {
          sessionDuration: 0, // Will be updated when user logs out or session ends
        }
      });
    } catch (activityError) {
      console.error('Error tracking login activity:', activityError);
      // Don't fail login if activity tracking fails
    }

    // Generate JWT token
    const token = AuthUtils.generateToken(user);

    // Sanitize user data
    const sanitizedUser = AuthUtils.sanitizeUser(user);

    // Create response with cookie
    const response = NextResponse.json({
      success: true,
      message: 'Login successful',
      user: sanitizedUser,
      token
    });

    // Set HTTP-only cookie
    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      path: '/'
    });

    return response;

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
