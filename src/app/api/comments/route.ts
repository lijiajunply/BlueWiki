import { NextRequest, NextResponse } from 'next/server';
import { CommentRepo } from '@/repos/CommentRepo';
import {AuthenticatedRequest, withAuth} from '@/lib/authMiddleware';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const articleId = searchParams.get('articleId');
    
    const skip = (page - 1) * limit;
    
    const commentRepo = new CommentRepo();
    const where = articleId ? { articleId: parseInt(articleId) } : {};
    
    const result = await commentRepo.findAll({
      skip,
      take: limit,
      orderBy: { createdAt: 'asc' },
      where
    });
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Failed to fetch comments:', error);
    return NextResponse.json({ error: 'Failed to fetch comments' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    // 检查用户权限
    const authResponse = await withAuth(request);
    if (authResponse) return authResponse; // 如果验证失败，直接返回错误响应
    
    const data = await request.json();
    const commentRepo = new CommentRepo();
    
    // 确保作者ID来自当前用户
    const commentData = {
      ...data,
      author: {
        connect: {
          id: parseInt((request as AuthenticatedRequest).user!.userId)
        }
      }
    };
    
    const comment = await commentRepo.create(commentData);
    return NextResponse.json(comment, { status: 201 });
  } catch (error) {
    console.error('Failed to create comment:', error);
    return NextResponse.json({ error: 'Failed to create comment' }, { status: 500 });
  }
}