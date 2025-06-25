import { NextRequest } from 'next/server'
import { AuthUtils, TokenPayload } from './utils'

export async function verifyAdminToken(request: NextRequest): Promise<TokenPayload | null> {
  try {
    // Try to get token from cookies
    const token = request.cookies.get('admin-token')?.value || 
                  request.cookies.get('auth-token')?.value

    if (!token) {
      // Try to get token from Authorization header
      const authHeader = request.headers.get('authorization')
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return null
      }
      const headerToken = authHeader.substring(7)
      const payload = AuthUtils.verifyToken(headerToken)
      
      if (!payload || payload.role !== 'admin') {
        return null
      }
      
      return payload
    }

    const payload = AuthUtils.verifyToken(token)
    
    if (!payload || payload.role !== 'admin') {
      return null
    }

    return payload
  } catch (error) {
    console.error('Admin token verification failed:', error)
    return null
  }
}

export async function verifyUserToken(request: NextRequest): Promise<TokenPayload | null> {
  try {
    // Try to get token from cookies
    const token = request.cookies.get('auth-token')?.value

    if (!token) {
      // Try to get token from Authorization header
      const authHeader = request.headers.get('authorization')
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return null
      }
      const headerToken = authHeader.substring(7)
      return AuthUtils.verifyToken(headerToken)
    }

    return AuthUtils.verifyToken(token)
  } catch (error) {
    console.error('User token verification failed:', error)
    return null
  }
}
