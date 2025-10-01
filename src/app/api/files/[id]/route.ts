import { NextRequest, NextResponse } from 'next/server';
import { FileRepo } from '@/repos/FileRepo';
import { withAuth } from '@/lib/authMiddleware';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = parseInt(params.id);
    if (isNaN(id)) {
      return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
    }
    
    const fileRepo = new FileRepo();
    const file = await fileRepo.findById(id);
    
    if (!file) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }
    
    // 生成文件访问 URL
    const fileUrl = await fileRepo.getFileSignedUrl(file.path);
    
    // 返回文件信息和访问 URL
    return NextResponse.json({
      ...file,
      url: fileUrl
    });
  } catch (error) {
    console.error('Failed to fetch file:', error);
    return NextResponse.json({ error: 'Failed to fetch file' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = parseInt(params.id);
    if (isNaN(id)) {
      return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
    }
    
    // 只有管理员可以更新文件记录
    const authResponse = await withAuth(request, ['ADMIN']);
    if (authResponse) return authResponse; // 如果验证失败，直接返回错误响应
    
    const fileRepo = new FileRepo();
    const existingFile = await fileRepo.findById(id);
    
    if (!existingFile) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }
    
    const data = await request.json();
    const updatedFile = await fileRepo.update(id, data);
    
    return NextResponse.json(updatedFile);
  } catch (error) {
    console.error('Failed to update file:', error);
    return NextResponse.json({ error: 'Failed to update file' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = parseInt(params.id);
    if (isNaN(id)) {
      return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
    }
    
    // 只有管理员可以删除文件记录
    const authResponse = await withAuth(request, ['ADMIN']);
    if (authResponse) return authResponse; // 如果验证失败，直接返回错误响应
    
    const fileRepo = new FileRepo();
    const existingFile = await fileRepo.findById(id);
    
    if (!existingFile) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }
    
    await fileRepo.delete(id);
    return NextResponse.json({ message: 'File deleted successfully' });
  } catch (error) {
    console.error('Failed to delete file:', error);
    return NextResponse.json({ error: 'Failed to delete file' }, { status: 500 });
  }
}