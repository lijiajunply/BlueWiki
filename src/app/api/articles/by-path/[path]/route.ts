import { NextRequest, NextResponse } from 'next/server';
import { ArticleRepo } from '@/repos/ArticleRepo';

export async function GET(request: NextRequest, { params }: { params: { path: string } }) {
  try {
    const { path } = params;
    
    if (!path) {
      return NextResponse.json({ error: 'Path parameter is required' }, { status: 400 });
    }
    
    const articleRepo = new ArticleRepo();
    const article = await articleRepo.findByPath(path);
    
    if (!article) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 });
    }
    
    return NextResponse.json(article);
  } catch (error) {
    console.error('Failed to fetch article by path:', error);
    return NextResponse.json({ error: 'Failed to fetch article by path' }, { status: 500 });
  }
}