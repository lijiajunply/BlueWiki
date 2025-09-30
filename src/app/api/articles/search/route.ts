import { NextRequest, NextResponse } from 'next/server';
import { ArticleRepo } from '@/repos/ArticleRepo';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    
    if (!query) {
      return NextResponse.json({ error: 'Query parameter "q" is required' }, { status: 400 });
    }
    
    const articleRepo = new ArticleRepo();
    const articles = await articleRepo.search(query);
    
    return NextResponse.json(articles);
  } catch (error) {
    console.error('Failed to search articles:', error);
    return NextResponse.json({ error: 'Failed to search articles' }, { status: 500 });
  }
}