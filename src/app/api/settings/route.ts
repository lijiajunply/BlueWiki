import { NextRequest, NextResponse } from 'next/server';
import { SettingRepo } from '@/repos/SettingRepo';
import nodemailer from "nodemailer";
import { getRedisClient } from '@/lib/redis';

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const settingRepo = new SettingRepo();
    
    // 保存设置
    const setting = await settingRepo.upsert({
      smtpServer: data.smtpServer.toString(),
      smtpPost: parseInt(data.smtpPort),
      smtpEmail: data.smtpEmail,
      smtpPassword: data.smtpPassword,
      googleKey: data.googleKey || '', // 如果没有googleKey字段，提供默认值
    });
    
    return NextResponse.json(setting, { status: 200 });
  } catch (error) {
    console.error('Failed to save settings:', error);
    return NextResponse.json({ error: 'Failed to save settings' }, { status: 500 });
  }
}

// 测试邮件设置接口
export async function PUT(request: NextRequest) {
  try {
    const data = await request.json();
    
    // 创建邮件传输器
    const transporter = nodemailer.createTransport({
      host: data.smtpServer,
      port: parseInt(data.smtpPort),
      secure: parseInt(data.smtpPort) === 465, // true for 465, false for other ports
      auth: {
        user: data.smtpEmail,
        pass: data.smtpPassword,
      },
    });
    
    // 生成6位验证码
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    
    // 保存验证码（5分钟有效期）到Redis中
    const redis = await getRedisClient();
    await redis.setEx(`verify_code:${data.testEmail}`, 5 * 60, code);
    await redis.setEx(`verify_code_expires:${data.testEmail}`, 5 * 60, (Date.now() + 5 * 60 * 1000).toString());
    
    // 发送测试邮件
    await transporter.sendMail({
      from: data.smtpEmail,
      to: data.testEmail,
      subject: 'Blue Wiki 系统配置验证码',
      text: `您的验证码是: ${code}，有效期为5分钟。\n\n如果不是您本人操作，请忽略此邮件。`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Blue Wiki 系统配置验证码</h2>
          <p>您好！</p>
          <p>您正在配置 Blue Wiki 系统的邮件服务，您的验证码是：</p>
          <div style="background-color: #f5f5f5; padding: 15px; text-align: center; border-radius: 5px; margin: 20px 0;">
            <span style="font-size: 24px; font-weight: bold; color: #333; letter-spacing: 5px;">${code}</span>
          </div>
          <p style="color: #666;">该验证码有效期为 <strong>5分钟</strong>，请尽快完成验证。</p>
          <br>
          <p style="color: #999; font-size: 14px;">如果不是您本人操作，请忽略此邮件。</p>
        </div>
      `,
    });
    
    return NextResponse.json({ 
      message: `测试邮件已发送至 ${data.testEmail}，请查收邮件并输入验证码完成验证。` 
    }, { status: 200 });
  } catch (error) {
    console.error('Failed to send test email:', error);
    return NextResponse.json({ error: '测试邮件发送失败: ' + (error as Error).message }, { status: 500 });
  }
}