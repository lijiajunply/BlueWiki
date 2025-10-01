import { prisma } from '@/lib/prisma';
import { Creator, Prisma } from '@prisma/client';

export class CreatorRepo {
  /**
   * 创建创建者信息
   * @param data 创建者数据
   * @returns 创建的创建者信息
   */
  async create(data: Prisma.CreatorCreateInput): Promise<Creator> {
    return prisma.creator.create({
      data,
    });
  }

  /**
   * 根据ID获取创建者信息
   * @param id 创建者ID
   * @returns 创建者信息或null
   */
  async findById(id: number): Promise<Creator | null> {
    return prisma.creator.findUnique({
      where: { id },
    });
  }

  /**
   * 根据用户ID获取创建者信息
   * @param userId 用户ID
   * @returns 创建者信息或null
   */
  async findByUserId(userId: number): Promise<Creator | null> {
    return prisma.creator.findFirst({
      where: { userId },
    });
  }

  /**
   * 获取创建者列表
   * @param params 查询参数
   * @returns 创建者列表
   */
  async findAll(params: {
    skip?: number;
    take?: number;
    orderBy?: Prisma.CreatorOrderByWithRelationInput;
    where?: Prisma.CreatorWhereInput;
  }): Promise<{ creators: Creator[]; total: number }> {
    const { skip, take, orderBy, where } = params;

    const [creators, total] = await Promise.all([
      prisma.creator.findMany({
        skip,
        take,
        orderBy,
        where,
      }),
      prisma.creator.count({ where }),
    ]);

    return { creators, total };
  }

  /**
   * 更新创建者信息
   * @param id 创建者ID
   * @param data 更新数据
   * @returns 更新后的创建者信息
   */
  async update(id: number, data: Prisma.CreatorUpdateInput): Promise<Creator> {
    return prisma.creator.update({
      where: { id },
      data,
    });
  }

  /**
   * 删除创建者信息
   * @param id 创建者ID
   * @returns 删除的创建者信息
   */
  async delete(id: number): Promise<Creator> {
    return prisma.creator.delete({
      where: { id },
    });
  }
}