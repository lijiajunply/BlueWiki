import { NextRequest, NextResponse } from 'next/server';
import { UserRepo } from '@/repos/UserRepo';
import { withAuth } from '@/lib/authMiddleware';

export async function GET(request: NextRequest) {
  try {
    // 检查用户权限（只有管理员或编辑可以获取用户列表）
    const authResponse = await withAuth(request, ['ADMIN', 'EDITOR']);
    if (authResponse) return authResponse; // 如果验证失败，直接返回错误响应
    
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;
    
    const userRepo = new UserRepo();
    const result = await userRepo.findAll({
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' }
    });
    
    // 移除密码字段
    const usersWithoutPassword = result.users.map(user => {
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    });
    
    return NextResponse.json({ 
      users: usersWithoutPassword, 
      total: result.total 
    });
  } catch (error) {
    console.error('Failed to fetch users:', error);
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const userRepo = new UserRepo();
    const user = await userRepo.create(data);
    
    // 移除密码字段再返回
    const { password, ...userWithoutPassword } = user;
    return NextResponse.json(userWithoutPassword, { status: 201 });
  } catch (error) {
    console.error('Failed to create user:', error);
    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
  }
}