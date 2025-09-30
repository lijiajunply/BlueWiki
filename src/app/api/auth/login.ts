// app/api/auth/login.ts
import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/lib/auth';
import { cookies } from 'next/headers';
import { UserRepo } from '@/repos/UserRepo';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    // 验证用户凭证
    const userRepo = new UserRepo();
    const user = await userRepo.validateCredentials(email, password);
    if (!user) {
      return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
    }

    // 生成 Token
    const payload = { 
      userId: user.id.toString(), 
      userHash: user.password,
      role: user.role
    };
    const token = AuthService.generateToken(payload);

    // 存储到 Redis
    await AuthService.storeToken(user.id.toString(), token);

    // 设置 HTTP-only Cookie
    cookies().set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 // 7 days
    });

    // 移除密码字段再返回
    const { password: _, ...userWithoutPassword } = user;
    return NextResponse.json({
      success: true,
      user: userWithoutPassword
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}