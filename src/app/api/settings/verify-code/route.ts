import { NextRequest, NextResponse } from 'next/server';
import { MailService } from '@/lib/mailService';

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const { code, email } = data;
    
    // 使用统一的邮件服务验证测试验证码
    const mailService = new MailService();
    const result = await mailService.verifyTestCode(email, code);
    
    if (!result.valid) {
      return NextResponse.json({ error: result.message }, { status: 400 });
    }
    
    return NextResponse.json({ message: result.message }, { status: 200 });
  } catch (error) {
    console.error('Failed to verify code:', error);
    return NextResponse.json({ error: '验证码验证失败' }, { status: 500 });
  }
}