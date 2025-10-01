import { NextRequest, NextResponse } from 'next/server';
import { CreatorRepo } from '@/repos/CreatorRepo';
import { withAuth } from '@/lib/authMiddleware';

export async function GET(request: NextRequest) {
  try {
    const creatorRepo = new CreatorRepo();
    const result = await creatorRepo.findAll({
      orderBy: { id: 'asc' }
    });
    
    return NextResponse.json({ 
      creators: result.creators, 
      total: result.total 
    });
  } catch (error) {
    console.error('Failed to fetch creators:', error);
    return NextResponse.json({ error: 'Failed to fetch creators' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    // 检查用户权限（只有管理员可以创建创建者信息）
    const authResponse = await withAuth(request, ['ADMIN']);
    if (authResponse) return authResponse; // 如果验证失败，直接返回错误响应
    
    const data = await request.json();
    const creatorRepo = new CreatorRepo();
    const creator = await creatorRepo.create(data);
    
    return NextResponse.json(creator, { status: 201 });
  } catch (error) {
    console.error('Failed to create creator:', error);
    return NextResponse.json({ error: 'Failed to create creator' }, { status: 500 });
  }
}