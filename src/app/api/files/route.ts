import { NextRequest, NextResponse } from 'next/server';
import { FileRepo } from '@/repos/FileRepo';
import { withAuth } from '@/lib/authMiddleware';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;
    
    const fileRepo = new FileRepo();
    const result = await fileRepo.findAll({
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' }
    });
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Failed to fetch files:', error);
    return NextResponse.json({ error: 'Failed to fetch files' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    // 只有管理员可以创建文件记录
    const authResponse = await withAuth(request, ['ADMIN']);
    if (authResponse) return authResponse; // 如果验证失败，直接返回错误响应
    
    const data = await request.json();
    const fileRepo = new FileRepo();
    const file = await fileRepo.create(data);
    
    return NextResponse.json(file, { status: 201 });
  } catch (error) {
    console.error('Failed to create file:', error);
    return NextResponse.json({ error: 'Failed to create file' }, { status: 500 });
  }
}