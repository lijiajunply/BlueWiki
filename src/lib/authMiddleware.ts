import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from './auth';

export interface AuthenticatedRequest extends NextRequest {
  user?: {
    userId: string;
    role: string;
  };
}

export async function withAuth(
  request: NextRequest,
  allowedRoles: string[] = []
): Promise<NextResponse | null> {
  try {
    const token = request.cookies.get('auth_token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = await AuthService.getUserFromToken(token);
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // 检查角色权限
    if (allowedRoles.length > 0 && !allowedRoles.includes(payload.role || '')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // 将用户信息添加到请求中
    (request as AuthenticatedRequest).user = {
      userId: payload.userId,
      role: payload.role || '',
    };

    return null; // 表示验证通过
  } catch (error) {
    console.error('Auth middleware error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}