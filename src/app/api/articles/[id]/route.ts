import { NextRequest, NextResponse } from 'next/server';
import { ArticleRepo } from '@/repos/ArticleRepo';
import {AuthenticatedRequest, withAuth} from '@/lib/authMiddleware';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = parseInt(params.id);
    if (isNaN(id)) {
      return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
    }
    
    const articleRepo = new ArticleRepo();
    const article = await articleRepo.findById(id);
    
    if (!article) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 });
    }
    
    return NextResponse.json(article);
  } catch (error) {
    console.error('Failed to fetch article:', error);
    return NextResponse.json({ error: 'Failed to fetch article' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // 检查用户权限
    const authResponse = await withAuth(request);
    if (authResponse) return authResponse; // 如果验证失败，直接返回错误响应
    
    const id = parseInt(params.id);
    if (isNaN(id)) {
      return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
    }
    
    const articleRepo = new ArticleRepo();
    const existingArticle = await articleRepo.findById(id);
    
    if (!existingArticle) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 });
    }
    
    // 检查用户是否有权限编辑这篇文章
    if (existingArticle.authorId !== parseInt((request as AuthenticatedRequest).user!.userId)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    
    const data = await request.json();
    const updatedArticle = await articleRepo.update(id, data);
    
    return NextResponse.json(updatedArticle);
  } catch (error) {
    console.error('Failed to update article:', error);
    return NextResponse.json({ error: 'Failed to update article' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // 检查用户权限
    const authResponse = await withAuth(request);
    if (authResponse) return authResponse; // 如果验证失败，直接返回错误响应
    
    const id = parseInt(params.id);
    if (isNaN(id)) {
      return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
    }
    
    const articleRepo = new ArticleRepo();
    const existingArticle = await articleRepo.findById(id);
    
    if (!existingArticle) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 });
    }
    
    // 检查用户是否有权限删除这篇文章
    if (existingArticle.authorId !== parseInt((request as AuthenticatedRequest).user!.userId) &&
        (request as AuthenticatedRequest).user!.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    
    await articleRepo.delete(id);
    return NextResponse.json({ message: 'Article deleted successfully' });
  } catch (error) {
    console.error('Failed to delete article:', error);
    return NextResponse.json({ error: 'Failed to delete article' }, { status: 500 });
  }
}