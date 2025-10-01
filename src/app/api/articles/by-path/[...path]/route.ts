import { NextRequest, NextResponse } from 'next/server';
import { ArticleRepo } from '@/repos/ArticleRepo';

export async function GET(request: NextRequest, { params }: { params: { path: string[] } }) {
  try {
    const pathParts = params.path || [];
    const decoded = '/' + pathParts.map(p => decodeURIComponent(p)).join('/');
    const repo = new ArticleRepo();
    const article = await repo.findByPath(decoded);
    if (!article) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(article);
  } catch (err) {
    console.error('Failed to fetch article by path:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
