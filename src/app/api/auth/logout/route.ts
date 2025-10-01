// app/api/auth/logout.ts
import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('auth_token')?.value;

    if (token) {
      const user = await AuthService.getUserFromToken(token);
      if (user) {
        await AuthService.revokeToken(user.userId);
      }
    }

    // 清除cookie
    cookies().delete('auth_token');
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}