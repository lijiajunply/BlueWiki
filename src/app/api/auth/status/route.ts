import {NextRequest, NextResponse} from 'next/server';
import {AuthService} from '@/lib/auth';

export async function GET(request: NextRequest) {
    try {
        const token = request.cookies.get('auth_token')?.value;

        if (!token) {
            return NextResponse.json({error: '未登录'}, {status: 401});
        }

        const payload = await AuthService.getUserFromToken(token);
        if (!payload) {
            return NextResponse.json({error: '令牌无效'}, {status: 401});
        }

        // 获取完整的用户信息
        const user = await AuthService.getUserById(payload.userId);
        if (!user) {
            return NextResponse.json({error: '用户不存在'}, {status: 401});
        }

        return NextResponse.json({
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                role: user.role,
            }
        });
    } catch (error) {
        console.error('检查用户状态错误:', error);
        return NextResponse.json({error: '内部服务器错误'}, {status: 500});
    }
}