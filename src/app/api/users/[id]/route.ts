import { NextRequest, NextResponse } from 'next/server';
import { UserRepo } from '@/repos/UserRepo';
import { withAuth, AuthenticatedRequest } from '@/lib/authMiddleware';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = parseInt(params.id);
    if (isNaN(id)) {
      return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
    }
    
    // 检查用户权限（用户只能查看自己的信息，管理员可以查看所有用户）
    const authResponse = await withAuth(request);
    if (authResponse) return authResponse; // 如果验证失败，直接返回错误响应
    
    const currentUserId = parseInt((request as AuthenticatedRequest).user!.userId);
    if (currentUserId !== id && (request as AuthenticatedRequest).user!.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    
    const userRepo = new UserRepo();
    const user = await userRepo.findById(id);
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    // 移除密码字段再返回
    const { password, ...userWithoutPassword } = user;
    return NextResponse.json(userWithoutPassword);
  } catch (error) {
    console.error('Failed to fetch user:', error);
    return NextResponse.json({ error: 'Failed to fetch user' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = parseInt(params.id);
    if (isNaN(id)) {
      return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
    }
    
    // 检查用户权限（用户只能编辑自己的信息，管理员可以编辑所有用户）
    const authResponse = await withAuth(request);
    if (authResponse) return authResponse; // 如果验证失败，直接返回错误响应
    
    const currentUserId = parseInt((request as AuthenticatedRequest).user!.userId);
    if (currentUserId !== id && (request as AuthenticatedRequest).user!.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    
    const userRepo = new UserRepo();
    const existingUser = await userRepo.findById(id);
    
    if (!existingUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    const data = await request.json();
    const updatedUser = await userRepo.update(id, data);
    
    // 移除密码字段再返回
    const { password, ...userWithoutPassword } = updatedUser;
    return NextResponse.json(userWithoutPassword);
  } catch (error) {
    console.error('Failed to update user:', error);
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = parseInt(params.id);
    if (isNaN(id)) {
      return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
    }
    
    // 检查用户权限（用户不能删除自己，只有管理员可以删除用户）
    const authResponse = await withAuth(request, ['ADMIN']);
    if (authResponse) return authResponse; // 如果验证失败，直接返回错误响应
    
    const currentUserId = parseInt((request as AuthenticatedRequest).user!.userId);
    if (currentUserId === id) {
      return NextResponse.json({ error: 'Cannot delete yourself' }, { status: 400 });
    }
    
    const userRepo = new UserRepo();
    const existingUser = await userRepo.findById(id);
    
    if (!existingUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    await userRepo.delete(id);
    return NextResponse.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Failed to delete user:', error);
    return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 });
  }
}