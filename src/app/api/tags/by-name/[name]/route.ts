import { NextRequest, NextResponse } from 'next/server';
import { TagRepo } from '@/repos/TagRepo';

export async function GET(request: NextRequest, { params }: { params: { name: string } }) {
  try {
    const { name } = params;
    
    if (!name) {
      return NextResponse.json({ error: 'Name parameter is required' }, { status: 400 });
    }
    
    const tagRepo = new TagRepo();
    const tag = await tagRepo.findByName(name);
    
    if (!tag) {
      return NextResponse.json({ error: 'Tag not found' }, { status: 404 });
    }
    
    return NextResponse.json(tag);
  } catch (error) {
    console.error('Failed to fetch tag by name:', error);
    return NextResponse.json({ error: 'Failed to fetch tag by name' }, { status: 500 });
  }
}