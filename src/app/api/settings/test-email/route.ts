import { NextRequest, NextResponse } from 'next/server';
import { MailService } from '@/lib/mailService';

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    // 使用统一的邮件服务发送测试邮件
    const mailService = new MailService();
    await mailService.sendTestEmail(
      {
        smtpServer: data.smtpServer,
        smtpPort: parseInt(data.smtpPort),
        smtpEmail: data.smtpEmail,
        smtpPassword: data.smtpPassword
      },
      data.testEmail
    );
    
    return NextResponse.json({ 
      message: `测试邮件已发送至 ${data.testEmail}，请查收邮件并输入验证码完成验证。` 
    }, { status: 200 });
  } catch (error) {
    console.error('Failed to send test email:', error);
    return NextResponse.json({ error: '测试邮件发送失败: ' + (error as Error).message }, { status: 500 });
  }
}