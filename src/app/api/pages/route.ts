import { NextRequest, NextResponse } from 'next/server';
import { PageRepo } from '@/repos/PageRepo';
import { withAuth } from '@/lib/authMiddleware';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const skip = (page - 1) * limit;
    
    const pageRepo = new PageRepo();
    
    // 如果有搜索参数，则执行搜索
    if (search) {
      const articles = await pageRepo.search(search);
      const total = articles.length;
      const paginatedArticles = articles.slice(skip, skip + limit);
      
      return NextResponse.json({
        articles: paginatedArticles,
        total,
      });
    }
    
    // 否则获取所有页面
    const result = await pageRepo.findAll({
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' }
    });
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Failed to fetch pages:', error);
    return NextResponse.json({ error: 'Failed to fetch pages' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    // 检查用户权限
    const authResponse = await withAuth(request);
    if (authResponse) return authResponse; // 如果验证失败，直接返回错误响应
    
    const data = await request.json();
    const pageRepo = new PageRepo();
    
    const page = await pageRepo.create(data);
    return NextResponse.json(page, { status: 201 });
  } catch (error) {
    console.error('Failed to create page:', error);
    return NextResponse.json({ error: 'Failed to create page' }, { status: 500 });
  }
}