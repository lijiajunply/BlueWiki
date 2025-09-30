import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/lib/auth';

export interface AuthenticatedRequest extends NextRequest {
  user?: {
    userId: string;
    userHash: string;
    role?: string;
  };
}

export async function withAuth(
  request: NextRequest,
  requiredRole?: string[]
): Promise<NextResponse | null> {
  const token = request.cookies.get('auth_token')?.value;

  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const user = await AuthService.getUserFromToken(token);
  if (!user) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  }

  // 如果指定了角色要求，检查用户角色
  if (requiredRole && user.role && !requiredRole.includes(user.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  // 将用户信息添加到请求对象中
  (request as AuthenticatedRequest).user = user;
  return null; // 表示验证通过
}