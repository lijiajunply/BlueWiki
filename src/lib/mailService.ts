import nodemailer from 'nodemailer';
import { SettingRepo } from '@/repos/SettingRepo';
import { getRedisClient } from '@/lib/redis';

export class MailService {
  /**
   * 发送注册验证码邮件
   * @param to 收件人邮箱
   * @returns 验证码
   */
  async sendRegistrationCode(to: string): Promise<string> {
    // 获取数据库中的邮件设置
    const settingRepo = new SettingRepo();
    const settings = await settingRepo.get();
    
    if (!settings) {
      throw new Error('Email settings are not configured in the database');
    }
    
    // 生成6位验证码
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    
    // 保存验证码到Redis（15分钟有效期）
    const redis = await getRedisClient();
    await redis.setEx(`register_code:${to}`, 15 * 60, code);
    
    // 创建邮件传输器
    const transporter = nodemailer.createTransport({
      host: settings.smtpServer,
      port: settings.smtpPost,
      secure: settings.smtpPost === 465,
      auth: {
        user: settings.smtpEmail,
        pass: settings.smtpPassword,
      },
    });
    
    // 发送邮件
    await transporter.sendMail({
      from: settings.smtpEmail,
      to,
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
    
    return code;
  }

  /**
   * 发送测试邮件
   * @param smtpSettings SMTP设置
   * @param to 收件人邮箱
   * @returns 验证码
   */
  async sendTestEmail(smtpSettings: { 
    smtpServer: string; 
    smtpPort: number; 
    smtpEmail: string; 
    smtpPassword: string 
  }, to: string): Promise<string> {
    const { smtpServer, smtpPort, smtpEmail, smtpPassword } = smtpSettings;
    
    // 生成6位验证码
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    
    // 保存验证码到Redis（5分钟有效期）
    const redis = await getRedisClient();
    await redis.setEx(`test_verify_code:${to}`, 5 * 60, code);
    await redis.setEx(`test_verify_code_expires:${to}`, 5 * 60, (Date.now() + 5 * 60 * 1000).toString());
    
    // 创建邮件传输器
    const transporter = nodemailer.createTransport({
      host: smtpServer,
      port: smtpPort,
      secure: smtpPort === 465,
      auth: {
        user: smtpEmail,
        pass: smtpPassword,
      },
    });
    
    // 发送测试邮件
    await transporter.sendMail({
      from: smtpEmail,
      to,
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
    
    return code;
  }

  /**
   * 验证注册验证码
   * @param email 邮箱地址
   * @param code 验证码
   * @returns 验证结果
   */
  async verifyRegistrationCode(email: string, code: string): Promise<boolean> {
    const redis = await getRedisClient();
    const storedCode = await redis.get(`register_code:${email}`);
    
    if (!storedCode) {
      return false;
    }
    
    if (storedCode !== code) {
      return false;
    }
    
    // 验证成功后删除验证码
    await redis.del(`register_code:${email}`);
    return true;
  }

  /**
   * 验证测试验证码
   * @param email 邮箱地址
   * @param code 验证码
   * @returns 验证结果
   */
  async verifyTestCode(email: string, code: string): Promise<{ valid: boolean; message: string }> {
    const redis = await getRedisClient();
    
    // 检查常规验证码
    const storedCode = await redis.get(`verify_code:${email}`);
    const codeExpires = await redis.get(`verify_code_expires:${email}`);
    
    // 如果没有找到常规验证码，尝试查找测试验证码
    if (!storedCode || !codeExpires) {
      const testCode = await redis.get(`test_verify_code:${email}`);
      const testCodeExpires = await redis.get(`test_verify_code_expires:${email}`);
      
      if (testCode && testCodeExpires) {
        // 检查验证码是否过期
        if (Date.now() > parseInt(testCodeExpires)) {
          // 删除过期的验证码
          await redis.del(`test_verify_code:${email}`);
          await redis.del(`test_verify_code_expires:${email}`);
          return { valid: false, message: '验证码已过期' };
        }
        
        // 验证验证码
        if (testCode !== code) {
          return { valid: false, message: '验证码错误' };
        }
        
        // 验证成功，删除验证码
        await redis.del(`test_verify_code:${email}`);
        await redis.del(`test_verify_code_expires:${email}`);
        
        return { valid: true, message: '验证码验证成功' };
      }
    }
    
    // 检查常规验证码是否存在
    if (!storedCode || !codeExpires) {
      return { valid: false, message: '验证码已过期或不存在' };
    }
    
    // 检查验证码是否过期
    if (Date.now() > parseInt(codeExpires)) {
      // 删除过期的验证码
      await redis.del(`verify_code:${email}`);
      await redis.del(`verify_code_expires:${email}`);
      return { valid: false, message: '验证码已过期' };
    }
    
    // 验证验证码
    if (storedCode !== code) {
      return { valid: false, message: '验证码错误' };
    }
    
    // 验证成功，删除验证码
    await redis.del(`verify_code:${email}`);
    await redis.del(`verify_code_expires:${email}`);
    
    return { valid: true, message: '验证码验证成功' };
  }
}