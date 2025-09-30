import { prisma } from '@/lib/prisma';
import { Tag, Prisma } from '@prisma/client';

export class TagRepo {
  /**
   * 创建标签
   * @param data 标签数据
   * @returns 创建的标签
   */
  async create(data: Prisma.TagCreateInput): Promise<Tag> {
    return prisma.tag.create({
      data,
    });
  }

  /**
   * 根据ID获取标签
   * @param id 标签ID
   * @returns 标签信息或null
   */
  async findById(id: number): Promise<Tag | null> {
    return prisma.tag.findUnique({
      where: { id },
    });
  }

  /**
   * 根据名称获取标签
   * @param name 标签名称
   * @returns 标签信息或null
   */
  async findByName(name: string): Promise<Tag | null> {
    return prisma.tag.findUnique({
      where: { name },
    });
  }

  /**
   * 获取标签列表
   * @param params 查询参数
   * @returns 标签列表
   */
  async findAll(params: {
    skip?: number;
    take?: number;
    orderBy?: Prisma.TagOrderByWithRelationInput;
    where?: Prisma.TagWhereInput;
  }): Promise<{ tags: Tag[]; total: number }> {
    const { skip, take, orderBy, where } = params;
    
    const [tags, total] = await Promise.all([
      prisma.tag.findMany({
        skip,
        take,
        orderBy,
        where,
      }),
      prisma.tag.count({ where }),
    ]);

    return { tags, total };
  }

  /**
   * 更新标签
   * @param id 标签ID
   * @param data 更新数据
   * @returns 更新后的标签
   */
  async update(id: number, data: Prisma.TagUpdateInput): Promise<Tag> {
    return prisma.tag.update({
      where: { id },
      data,
    });
  }

  /**
   * 删除标签
   * @param id 标签ID
   * @returns 删除的标签
   */
  async delete(id: number): Promise<Tag> {
    return prisma.tag.delete({
      where: { id },
    });
  }

  /**
   * 获取包含指定文章的标签
   * @param articleId 文章ID
   * @returns 标签列表
   */
  async findByArticleId(articleId: number): Promise<Tag[]> {
    return prisma.tag.findMany({
      where: {
        articles: {
          some: {
            id: articleId,
          },
        },
      },
    });
  }
}