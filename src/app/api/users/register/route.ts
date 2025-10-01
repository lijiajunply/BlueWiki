import { NextRequest, NextResponse } from 'next/server';
import { UserRepo } from '@/repos/UserRepo';
import nodemailer from 'nodemailer';
import { getRedisClient } from '@/lib/redis';

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
    
    // 生成6位验证码
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    
    // 保存验证码到Redis（15分钟有效期）
    const redis = await getRedisClient();
    await redis.setEx(`register_code:${data.email}`, 15 * 60, code);
    
    // 发送验证邮件
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_SERVER,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: parseInt(process.env.SMTP_PORT || '587') === 465,
      auth: {
        user: process.env.SMTP_EMAIL,
        pass: process.env.SMTP_PASSWORD,
      },
    });
    
    await transporter.sendMail({
      from: process.env.SMTP_EMAIL,
      to: data.email,
      subject: 'Blue Wiki 用户注册验证码',
      text: `您的注册验证码是: ${code}，有效期为15分钟。\n\n如果不是您本人操作，请忽略此邮件。`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Blue Wiki 用户注册验证码</h2>
          <p>您好！</p>
          <p>您正在注册 Blue Wiki 账号，您的验证码是：</p>
          <div style="background-color: #f5f5f5; padding: 15px; text-align: center; border-radius: 5px; margin: 20px 0;">
            <span style="font-size: 24px; font-weight: bold; color: #333; letter-spacing: 5px;">${code}</span>
          </div>
          <p style="color: #666;">该验证码有效期为 <strong>15分钟</strong>，请尽快完成注册。</p>
          <br>
          <p style="color: #999; font-size: 14px;">如果不是您本人操作，请忽略此邮件。</p>
        </div>
      `,
    });
    
    return NextResponse.json({ 
      message: '验证码已发送至您的邮箱，请查收并完成注册',
      email: data.email
    }, { status: 200 });
  } catch (error) {
    console.error('Failed to register user:', error);
    return NextResponse.json({ error: 'Failed to register user' }, { status: 500 });
  }
}

// 验证验证码并完成注册
export async function PUT(request: NextRequest) {
  try {
    const data = await request.json();
    const { email, code, userInfo } = data;
    
    // 从Redis获取存储的验证码
    const redis = await getRedisClient();
    const storedCode = await redis.get(`register_code:${email}`);
    
    // 检查验证码是否存在
    if (!storedCode) {
      return NextResponse.json({ error: '验证码已过期或不存在' }, { status: 400 });
    }
    
    // 验证验证码
    if (storedCode !== code) {
      return NextResponse.json({ error: '验证码错误' }, { status: 400 });
    }
    
    // 验证成功，删除验证码
    await redis.del(`register_code:${email}`);
    
    // 创建用户
    const userRepo = new UserRepo();
    const user = await userRepo.create(userInfo);
    
    // 移除密码字段再返回
    const { password, ...userWithoutPassword } = user;
    return NextResponse.json(userWithoutPassword, { status: 201 });
  } catch (error) {
    console.error('Failed to complete user registration:', error);
    return NextResponse.json({ error: 'Failed to complete user registration' }, { status: 500 });
  }
}