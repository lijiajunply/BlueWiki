import { prisma } from '@/lib/prisma';
import { File, Prisma } from '@prisma/client';

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
    return prisma.file.delete({
      where: { id },
    });
  }
}