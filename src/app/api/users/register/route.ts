import { NextRequest, NextResponse } from 'next/server';
import { UserRepo } from '@/repos/UserRepo';
import { User } from '@prisma/client';
import { FirstUseService } from '@/services/FirstUseService';
import { SettingRepo } from '@/repos/SettingRepo';
import { MailService } from '@/lib/mailService';

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
    
    // 使用统一的邮件服务发送验证码
    const mailService = new MailService();
    await mailService.sendRegistrationCode(data.email);
    
    return NextResponse.json({ 
      message: '验证码已发送至您的邮箱，请查收并完成注册',
      email: data.email
    }, { status: 200 });
  } catch (error) {
    console.error('Failed to register user:', error);
    return NextResponse.json({ error: 'Failed to register user: ' + (error as Error).message }, { status: 500 });
  }
}

// 验证验证码并完成注册
export async function PUT(request: NextRequest) {
  try {
    const data = await request.json();
    const { email, code, userInfo } = data;
    
    // 使用统一的邮件服务验证验证码
    const mailService = new MailService();
    const isValid = await mailService.verifyRegistrationCode(email, code);
    
    if (!isValid) {
      return NextResponse.json({ error: '验证码错误或已过期' }, { status: 400 });
    }
    
    // 创建用户
    const userRepo = new UserRepo();
    const user = await userRepo.create(userInfo);
    
  // 移除密码字段再返回
  const userCopy: Partial<User> = { ...user };
  delete (userCopy as Partial<User>).password;
  const userWithoutPassword = userCopy;

    // If this is the first setup (no settings exist), seed initial data
    try {
      const settingRepo = new SettingRepo();
      const existingSetting = await settingRepo.get();
      if (!existingSetting) {
        const firstUse = new FirstUseService();
        // fire-and-forget but catch errors
        firstUse.seedInitialData(user.id).catch((err) => console.error('First use seeding failed:', err));
      }
    } catch (e) {
      console.error('Failed to check/seed first use data:', e);
    }

    return NextResponse.json(userWithoutPassword, { status: 201 });
  } catch (error) {
    console.error('Failed to complete user registration:', error);
    return NextResponse.json({ error: 'Failed to complete user registration: ' + (error as Error).message }, { status: 500 });
  }
}
