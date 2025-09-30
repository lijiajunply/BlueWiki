import { NextRequest, NextResponse } from 'next/server';
import { TagRepo } from '@/repos/TagRepo';
import { withAuth } from '@/lib/authMiddleware';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = parseInt(params.id);
    if (isNaN(id)) {
      return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
    }
    
    const tagRepo = new TagRepo();
    const tag = await tagRepo.findById(id);
    
    if (!tag) {
      return NextResponse.json({ error: 'Tag not found' }, { status: 404 });
    }
    
    return NextResponse.json(tag);
  } catch (error) {
    console.error('Failed to fetch tag:', error);
    return NextResponse.json({ error: 'Failed to fetch tag' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = parseInt(params.id);
    if (isNaN(id)) {
      return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
    }
    
    // 只有管理员可以更新标签
    const authResponse = await withAuth(request, ['ADMIN']);
    if (authResponse) return authResponse; // 如果验证失败，直接返回错误响应
    
    const tagRepo = new TagRepo();
    const existingTag = await tagRepo.findById(id);
    
    if (!existingTag) {
      return NextResponse.json({ error: 'Tag not found' }, { status: 404 });
    }
    
    const data = await request.json();
    const updatedTag = await tagRepo.update(id, data);
    
    return NextResponse.json(updatedTag);
  } catch (error) {
    console.error('Failed to update tag:', error);
    return NextResponse.json({ error: 'Failed to update tag' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = parseInt(params.id);
    if (isNaN(id)) {
      return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
    }
    
    // 只有管理员可以删除标签
    const authResponse = await withAuth(request, ['ADMIN']);
    if (authResponse) return authResponse; // 如果验证失败，直接返回错误响应
    
    const tagRepo = new TagRepo();
    const existingTag = await tagRepo.findById(id);
    
    if (!existingTag) {
      return NextResponse.json({ error: 'Tag not found' }, { status: 404 });
    }
    
    await tagRepo.delete(id);
    return NextResponse.json({ message: 'Tag deleted successfully' });
  } catch (error) {
    console.error('Failed to delete tag:', error);
    return NextResponse.json({ error: 'Failed to delete tag' }, { status: 500 });
  }
}