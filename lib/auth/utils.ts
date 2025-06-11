import jwt from 'jsonwebtoken';
import { IUser } from '@/lib/models/User';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key';
const JWT_EXPIRES_IN = '7d';

export interface TokenPayload {
  userId: string;
  email: string;
  role: string;
}

export class AuthUtils {
  // Generate JWT token
  static generateToken(user: IUser): string {
    const payload: TokenPayload = {
      userId: user.userId,
      email: user.email,
      role: user.role
    };

    return jwt.sign(payload, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN,
      issuer: 'genedu-app'
    });
  }

  // Verify JWT token
  static verifyToken(token: string): TokenPayload | null {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as TokenPayload;
      return decoded;
    } catch (error) {
      console.error('Token verification failed:', error);
      return null;
    }
  }

  // Generate verification token
  static generateVerificationToken(): string {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15);
  }

  // Generate reset password token
  static generateResetToken(): string {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15) +
           Date.now().toString(36);
  }

  // Validate email format
  static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Validate password strength
  static isValidPassword(password: string): { isValid: boolean; message: string } {
    if (password.length < 6) {
      return { isValid: false, message: 'Password must be at least 6 characters long' };
    }
    
    if (password.length > 128) {
      return { isValid: false, message: 'Password must be less than 128 characters' };
    }
    
    // Check for at least one letter and one number
    const hasLetter = /[a-zA-Z]/.test(password);
    const hasNumber = /\d/.test(password);
    
    if (!hasLetter || !hasNumber) {
      return { isValid: false, message: 'Password must contain at least one letter and one number' };
    }
    
    return { isValid: true, message: 'Password is valid' };
  }

  // Sanitize user data for client
  static sanitizeUser(user: IUser) {
    const { password, verificationToken, resetPasswordToken, resetPasswordExpires, ...sanitizedUser } = user.toObject();
    return sanitizedUser;
  }

  // Generate random avatar URL
  static generateAvatarUrl(email: string): string {
    const hash = email.toLowerCase().trim();
    return `https://api.dicebear.com/7.x/initials/svg?seed=${hash}&backgroundColor=6366f1&textColor=ffffff`;
  }

  // Check if user has permission
  static hasPermission(userRole: string, requiredRole: string): boolean {
    const roleHierarchy = {
      'student': 1,
      'teacher': 2,
      'admin': 3
    };

    return roleHierarchy[userRole as keyof typeof roleHierarchy] >= 
           roleHierarchy[requiredRole as keyof typeof roleHierarchy];
  }

  // Calculate password strength score
  static calculatePasswordStrength(password: string): number {
    let score = 0;
    
    // Length score
    if (password.length >= 8) score += 25;
    if (password.length >= 12) score += 25;
    
    // Character variety score
    if (/[a-z]/.test(password)) score += 10;
    if (/[A-Z]/.test(password)) score += 10;
    if (/\d/.test(password)) score += 10;
    if (/[^a-zA-Z\d]/.test(password)) score += 20;
    
    return Math.min(100, score);
  }

  // Format error messages
  static formatAuthError(error: any): string {
    if (error.code === 11000) {
      if (error.keyPattern?.email) {
        return 'Email address is already registered';
      }
      if (error.keyPattern?.userId) {
        return 'User ID already exists';
      }
      return 'Duplicate entry found';
    }
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((err: any) => err.message);
      return messages.join(', ');
    }
    
    return error.message || 'An unexpected error occurred';
  }
}

export default AuthUtils;
