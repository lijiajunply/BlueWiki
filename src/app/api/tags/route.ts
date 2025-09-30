import { NextRequest, NextResponse } from 'next/server';
import { TagRepo } from '@/repos/TagRepo';
import { withAuth } from '@/lib/authMiddleware';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;
    
    const tagRepo = new TagRepo();
    const result = await tagRepo.findAll({
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' }
    });
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Failed to fetch tags:', error);
    return NextResponse.json({ error: 'Failed to fetch tags' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    // 只有管理员可以创建标签
    const authResponse = await withAuth(request, ['ADMIN']);
    if (authResponse) return authResponse; // 如果验证失败，直接返回错误响应
    
    const data = await request.json();
    const tagRepo = new TagRepo();
    const tag = await tagRepo.create(data);
    
    return NextResponse.json(tag, { status: 201 });
  } catch (error) {
    console.error('Failed to create tag:', error);
    return NextResponse.json({ error: 'Failed to create tag' }, { status: 500 });
  }
}