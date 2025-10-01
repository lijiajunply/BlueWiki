import {NextRequest, NextResponse} from 'next/server';
import {SettingRepo} from '@/repos/SettingRepo';

export async function GET() {
    try {
        const settingRepo = new SettingRepo();
        const setting = await settingRepo.get();

        if (!setting) {
            return NextResponse.json(null, {status: 404});
        }

        // 移除敏感信息
        const { smtpPassword: _, ...settingWithoutPassword } = setting;
        return NextResponse.json(settingWithoutPassword, {status: 200});
    } catch (error) {
        console.error('Failed to get settings:', error);
        return NextResponse.json({error: 'Failed to get settings'}, {status: 500});
    }
}

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

        // 移除敏感信息
        const { smtpPassword: _, ...settingWithoutPassword } = setting;
        return NextResponse.json(settingWithoutPassword, {status: 200});
    } catch (error) {
        console.error('Failed to save settings:', error);
        return NextResponse.json({error: 'Failed to save settings'}, {status: 500});
    }
}