import { prisma } from '@/lib/prisma';
import { Comment, Prisma } from '@prisma/client';

export class CommentRepo {
  /**
   * 创建评论
   * @param data 评论数据
   * @returns 创建的评论
   */
  async create(data: Prisma.CommentCreateInput): Promise<Comment> {
    return prisma.comment.create({
      data,
    });
  }

  /**
   * 根据ID获取评论
   * @param id 评论ID
   * @returns 评论信息或null
   */
  async findById(id: number): Promise<Comment | null> {
    return prisma.comment.findUnique({
      where: { id },
    });
  }

  /**
   * 获取评论列表
   * @param params 查询参数
   * @returns 评论列表
   */
  async findAll(params: {
    skip?: number;
    take?: number;
    orderBy?: Prisma.CommentOrderByWithRelationInput;
    where?: Prisma.CommentWhereInput;
  }): Promise<{ comments: Comment[]; total: number }> {
    const { skip, take, orderBy, where } = params;
    
    const [comments, total] = await Promise.all([
      prisma.comment.findMany({
        skip,
        take,
        orderBy,
        where,
      }),
      prisma.comment.count({ where }),
    ]);

    return { comments, total };
  }

  /**
   * 更新评论
   * @param id 评论ID
   * @param data 更新数据
   * @returns 更新后的评论
   */
  async update(id: number, data: Prisma.CommentUpdateInput): Promise<Comment> {
    return prisma.comment.update({
      where: { id },
      data,
    });
  }

  /**
   * 删除评论
   * @param id 评论ID
   * @returns 删除的评论
   */
  async delete(id: number): Promise<Comment> {
    return prisma.comment.delete({
      where: { id },
    });
  }

  /**
   * 根据文章ID获取评论
   * @param articleId 文章ID
   * @returns 评论列表
   */
  async findByArticleId(articleId: number): Promise<Comment[]> {
    return prisma.comment.findMany({
      where: { articleId },
      orderBy: { createdAt: 'asc' },
    });
  }
}