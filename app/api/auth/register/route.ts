import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/database/mongodb';
import User from '@/lib/models/User';
import { AuthUtils } from '@/lib/auth/utils';

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    
    const { name, email, password, role = 'student' } = await request.json();

    // Validate input
    if (!name || !email || !password) {
      return NextResponse.json(
        { success: false, message: 'Name, email, and password are required' },
        { status: 400 }
      );
    }

    // Validate email format
    if (!AuthUtils.isValidEmail(email)) {
      return NextResponse.json(
        { success: false, message: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Validate password strength
    const passwordValidation = AuthUtils.isValidPassword(password);
    if (!passwordValidation.isValid) {
      return NextResponse.json(
        { success: false, message: passwordValidation.message },
        { status: 400 }
      );
    }    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return NextResponse.json(
        { success: false, message: 'Email address is already registered' },
        { status: 409 }
      );
    }    // Generate verification token
    const verificationToken = AuthUtils.generateVerificationToken();

    // Generate userId
    const userId = `user_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 8)}`;

    // Create new user
    const userData = {
      userId,
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password, // Will be hashed by pre-save middleware
      role,
      avatar: AuthUtils.generateAvatarUrl(email),
      isEmailVerified: true // Set to true for testing, false for production
    };    const user = new User(userData);
    await user.save();

    // Generate JWT token
    const token = AuthUtils.generateToken(user);

    // Sanitize user data
    const sanitizedUser = AuthUtils.sanitizeUser(user);

    // In production, send verification email here
    // await sendVerificationEmail(user.email, verificationToken)

    // Create response with cookie
    const response = NextResponse.json({
      success: true,
      message: 'Registration successful',
      user: sanitizedUser,
      token
    }, { status: 201 });

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
    console.error('Registration error:', error);
    
    const errorMessage = AuthUtils.formatAuthError(error);
    
    return NextResponse.json(
      { success: false, message: errorMessage },
      { status: 500 }
    );
  }
}
