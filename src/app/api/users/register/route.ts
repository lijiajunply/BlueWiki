import { NextRequest, NextResponse } from 'next/server';
import { UserRepo } from '@/repos/UserRepo';

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    // 检查必需字段
    if (!data.name || !data.email || !data.phone || !data.password) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    
    const userRepo = new UserRepo();
    
    // 检查邮箱和手机号是否已存在
    const existingUserByEmail = await userRepo.findByEmail(data.email);
    if (existingUserByEmail) {
      return NextResponse.json({ error: 'Email already exists' }, { status: 409 });
    }
    
    const existingUserByPhone = await userRepo.findByPhone(data.phone);
    if (existingUserByPhone) {
      return NextResponse.json({ error: 'Phone already exists' }, { status: 409 });
    }
    
    // 创建用户
    const user = await userRepo.create(data);
    
    // 移除密码字段再返回
    const { password, ...userWithoutPassword } = user;
    return NextResponse.json(userWithoutPassword, { status: 201 });
  } catch (error) {
    console.error('Failed to register user:', error);
    return NextResponse.json({ error: 'Failed to register user' }, { status: 500 });
  }
}