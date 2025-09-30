import { NextRequest, NextResponse } from 'next/server';
import { ArticleRepo } from '@/repos/ArticleRepo';
import { withAuth, AuthenticatedRequest } from '@/lib/authMiddleware';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;
    
    const articleRepo = new ArticleRepo();
    const result = await articleRepo.findAll({
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' }
    });
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Failed to fetch articles:', error);
    return NextResponse.json({ error: 'Failed to fetch articles' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    // 检查用户权限
    const authResponse = await withAuth(request);
    if (authResponse) return authResponse; // 如果验证失败，直接返回错误响应
    
    const data = await request.json();
    const articleRepo = new ArticleRepo();
    
    // 确保作者ID来自当前用户
    const articleData = {
      ...data,
      author: {
        connect: {
          id: parseInt((request as AuthenticatedRequest).user!.userId)
        }
      }
    };
    
    const article = await articleRepo.create(articleData);
    return NextResponse.json(article, { status: 201 });
  } catch (error) {
    console.error('Failed to create article:', error);
    return NextResponse.json({ error: 'Failed to create article' }, { status: 500 });
  }
}