import { NextRequest, NextResponse } from 'next/server';
import { CreatorRepo } from '@/repos/CreatorRepo';
import { withAuth, AuthenticatedRequest } from '@/lib/authMiddleware';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = parseInt(params.id);
    if (isNaN(id)) {
      return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
    }
    
    // 检查用户权限（创建者可以查看自己的信息，管理员可以查看所有创建者）
    const authResponse = await withAuth(request);
    if (authResponse) return authResponse; // 如果验证失败，直接返回错误响应
    
    const currentUserId = parseInt((request as AuthenticatedRequest).user!.userId);
    
    const creatorRepo = new CreatorRepo();
    const creator = await creatorRepo.findById(id);
    
    if (!creator) {
      return NextResponse.json({ error: 'Creator not found' }, { status: 404 });
    }
    
    // 检查权限：用户只能查看自己的创建者信息，管理员可以查看所有
    if (creator.userId !== currentUserId && (request as AuthenticatedRequest).user!.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    
    return NextResponse.json(creator);
  } catch (error) {
    console.error('Failed to fetch creator:', error);
    return NextResponse.json({ error: 'Failed to fetch creator' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = parseInt(params.id);
    if (isNaN(id)) {
      return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
    }
    
    // 检查用户权限（创建者可以编辑自己的信息，管理员可以编辑所有创建者）
    const authResponse = await withAuth(request);
    if (authResponse) return authResponse; // 如果验证失败，直接返回错误响应
    
    const currentUserId = parseInt((request as AuthenticatedRequest).user!.userId);
    
    const creatorRepo = new CreatorRepo();
    const existingCreator = await creatorRepo.findById(id);
    
    if (!existingCreator) {
      return NextResponse.json({ error: 'Creator not found' }, { status: 404 });
    }
    
    // 检查权限：用户只能编辑自己的创建者信息，管理员可以编辑所有
    if (existingCreator.userId !== currentUserId && (request as AuthenticatedRequest).user!.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    
    const data = await request.json();
    const updatedCreator = await creatorRepo.update(id, data);
    
    return NextResponse.json(updatedCreator);
  } catch (error) {
    console.error('Failed to update creator:', error);
    return NextResponse.json({ error: 'Failed to update creator' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = parseInt(params.id);
    if (isNaN(id)) {
      return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
    }
    
    // 检查用户权限（只有管理员可以删除创建者信息）
    const authResponse = await withAuth(request, ['ADMIN']);
    if (authResponse) return authResponse; // 如果验证失败，直接返回错误响应
    
    const creatorRepo = new CreatorRepo();
    const existingCreator = await creatorRepo.findById(id);
    
    if (!existingCreator) {
      return NextResponse.json({ error: 'Creator not found' }, { status: 404 });
    }
    
    await creatorRepo.delete(id);
    return NextResponse.json({ message: 'Creator deleted successfully' });
  } catch (error) {
    console.error('Failed to delete creator:', error);
    return NextResponse.json({ error: 'Failed to delete creator' }, { status: 500 });
  }
}