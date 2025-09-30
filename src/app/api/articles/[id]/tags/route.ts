import { NextRequest, NextResponse } from 'next/server';
import { TagRepo } from '@/repos/TagRepo';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const articleId = parseInt(params.id);
    if (isNaN(articleId)) {
      return NextResponse.json({ error: 'Invalid article ID' }, { status: 400 });
    }
    
    const tagRepo = new TagRepo();
    const tags = await tagRepo.findByArticleId(articleId);
    
    return NextResponse.json({ tags, total: tags.length });
  } catch (error) {
    console.error('Failed to fetch tags:', error);
    return NextResponse.json({ error: 'Failed to fetch tags' }, { status: 500 });
  }
}