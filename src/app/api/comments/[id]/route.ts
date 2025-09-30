import { NextRequest, NextResponse } from 'next/server';
import { CommentRepo } from '@/repos/CommentRepo';
import {AuthenticatedRequest, withAuth} from '@/lib/authMiddleware';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = parseInt(params.id);
    if (isNaN(id)) {
      return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
    }
    
    const commentRepo = new CommentRepo();
    const comment = await commentRepo.findById(id);
    
    if (!comment) {
      return NextResponse.json({ error: 'Comment not found' }, { status: 404 });
    }
    
    return NextResponse.json(comment);
  } catch (error) {
    console.error('Failed to fetch comment:', error);
    return NextResponse.json({ error: 'Failed to fetch comment' }, { status: 500 });
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
    
    const commentRepo = new CommentRepo();
    const existingComment = await commentRepo.findById(id);
    
    if (!existingComment) {
      return NextResponse.json({ error: 'Comment not found' }, { status: 404 });
    }
    
    // 检查用户是否有权限编辑这条评论
    if (existingComment.authorId !== parseInt((request as AuthenticatedRequest).user!.userId) &&
        (request as AuthenticatedRequest).user!.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    
    const data = await request.json();
    const updatedComment = await commentRepo.update(id, data);
    
    return NextResponse.json(updatedComment);
  } catch (error) {
    console.error('Failed to update comment:', error);
    return NextResponse.json({ error: 'Failed to update comment' }, { status: 500 });
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
    
    const commentRepo = new CommentRepo();
    const existingComment = await commentRepo.findById(id);
    
    if (!existingComment) {
      return NextResponse.json({ error: 'Comment not found' }, { status: 404 });
    }
    
    // 检查用户是否有权限删除这条评论
    if (existingComment.authorId !== parseInt((request as AuthenticatedRequest).user!.userId) &&
        (request as AuthenticatedRequest).user!.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    
    await commentRepo.delete(id);
    return NextResponse.json({ message: 'Comment deleted successfully' });
  } catch (error) {
    console.error('Failed to delete comment:', error);
    return NextResponse.json({ error: 'Failed to delete comment' }, { status: 500 });
  }
}