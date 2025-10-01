import { NextRequest, NextResponse } from 'next/server';
import { getRedisClient } from '@/lib/redis';

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const { code, email } = data;
    
    // 从Redis获取存储的验证码
    const redis = await getRedisClient();
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
          return NextResponse.json({ error: '验证码已过期' }, { status: 400 });
        }
        
        // 验证验证码
        if (testCode !== code) {
          return NextResponse.json({ error: '验证码错误' }, { status: 400 });
        }
        
        // 验证成功，删除验证码
        await redis.del(`test_verify_code:${email}`);
        await redis.del(`test_verify_code_expires:${email}`);
        
        return NextResponse.json({ message: '验证码验证成功' }, { status: 200 });
      }
    }
    
    // 检查常规验证码是否存在
    if (!storedCode || !codeExpires) {
      return NextResponse.json({ error: '验证码已过期或不存在' }, { status: 400 });
    }
    
    // 检查验证码是否过期
    if (Date.now() > parseInt(codeExpires)) {
      // 删除过期的验证码
      await redis.del(`verify_code:${email}`);
      await redis.del(`verify_code_expires:${email}`);
      return NextResponse.json({ error: '验证码已过期' }, { status: 400 });
    }
    
    // 验证验证码
    if (storedCode !== code) {
      return NextResponse.json({ error: '验证码错误' }, { status: 400 });
    }
    
    // 验证成功，删除验证码
    await redis.del(`verify_code:${email}`);
    await redis.del(`verify_code_expires:${email}`);
    
    return NextResponse.json({ message: '验证码验证成功' }, { status: 200 });
  } catch (error) {
    console.error('Failed to verify code:', error);
    return NextResponse.json({ error: '验证码验证失败' }, { status: 500 });
  }
}