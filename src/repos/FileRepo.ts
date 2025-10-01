import { prisma } from '@/lib/prisma';
import { File, Prisma } from '@prisma/client';
import { minioClient, BUCKET_NAME, ensureBucketExists } from '@/lib/minio';
import { createHash } from 'crypto';

export class FileRepo {
  /**
   * 创建文件记录
   * @param data 文件数据
   * @returns 创建的文件记录
   */
  async create(data: Prisma.FileCreateInput): Promise<File> {
    return prisma.file.create({
      data,
    });
  }

  /**
   * 上传文件到 MinIO 并创建记录
   * @param fileBuffer 文件二进制数据
   * @param fileName 文件名
   * @param mimeType 文件 MIME 类型
   * @returns 文件记录
   */
  async uploadFile(fileBuffer: Buffer, fileName: string, mimeType: string): Promise<File> {
    // 确保存储桶存在
    await ensureBucketExists();
    
    // 计算文件哈希值
    const hash = createHash('md5').update(fileBuffer).digest('hex');
    
    // 生成文件路径（使用哈希值避免重复）
    const filePath = `${hash}/${fileName}`;
    
    // 检查文件是否已存在
    const existingFile = await this.findByHash(hash);
    if (existingFile) {
      return existingFile;
    }
    
    // 上传文件到 MinIO
    await minioClient.putObject(BUCKET_NAME, filePath, fileBuffer, fileBuffer.length, {
      'Content-Type': mimeType,
    });
    
    // 在数据库中创建文件记录
    return await this.create({
      path: filePath,
      hash: hash,
    });
  }

  /**
   * 根据ID获取文件记录
   * @param id 文件ID
   * @returns 文件信息或null
   */
  async findById(id: number): Promise<File | null> {
    return prisma.file.findUnique({
      where: { id },
    });
  }

  /**
   * 根据路径获取文件记录
   * @param path 文件路径
   * @returns 文件信息或null
   */
  async findByPath(path: string): Promise<File | null> {
    return prisma.file.findUnique({
      where: { path },
    });
  }

  /**
   * 根据哈希值获取文件记录
   * @param hash 文件哈希值
   * @returns 文件信息或null
   */
  async findByHash(hash: string): Promise<File | null> {
    return prisma.file.findUnique({
      where: { hash },
    });
  }

  /**
   * 获取文件记录列表
   * @param params 查询参数
   * @returns 文件记录列表
   */
  async findAll(params: {
    skip?: number;
    take?: number;
    orderBy?: Prisma.FileOrderByWithRelationInput;
    where?: Prisma.FileWhereInput;
  }): Promise<{ files: File[]; total: number }> {
    const { skip, take, orderBy, where } = params;
    
    const [files, total] = await Promise.all([
      prisma.file.findMany({
        skip,
        take,
        orderBy,
        where,
      }),
      prisma.file.count({ where }),
    ]);

    return { files, total };
  }

  /**
   * 更新文件记录
   * @param id 文件ID
   * @param data 更新数据
   * @returns 更新后的文件记录
   */
  async update(id: number, data: Prisma.FileUpdateInput): Promise<File> {
    return prisma.file.update({
      where: { id },
      data,
    });
  }

  /**
   * 删除文件记录
   * @param id 文件ID
   * @returns 删除的文件记录
   */
  async delete(id: number): Promise<File> {
    const file = await this.findById(id);
    if (file) {
      // 从 MinIO 删除文件
      await minioClient.removeObject(BUCKET_NAME, file.path);
    }
    
    return prisma.file.delete({
      where: { id },
    });
  }
  
  /**
   * 获取文件的 MinIO 签名 URL
   * @param path 文件路径
   * @param expiry 过期时间（秒）
   * @returns 签名 URL
   */
  async getFileSignedUrl(path: string, expiry: number = 3600): Promise<string> {
    return await minioClient.presignedGetObject(BUCKET_NAME, path, expiry);
  }
}