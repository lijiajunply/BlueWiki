import {prisma} from '@/lib/prisma';
import {Article, Prisma} from '@prisma/client';

export class PageRepo {
    /**
     * 创建页面（文章）
     * @param data 页面数据
     * @returns 创建的页面
     */
    async create(data: Prisma.ArticleCreateInput): Promise<Article> {
        return prisma.article.create({
            data,
        });
    }

    /**
     * 根据ID获取页面
     * @param id 页面ID
     * @returns 页面信息或null
     */
    async findById(id: number): Promise<Article | null> {
        return prisma.article.findUnique({
            where: {id},
        });
    }

    /**
     * 根据路径获取页面
     * @param path 页面路径
     * @returns 页面信息或null
     */
    async findByPath(path: string): Promise<Article | null> {
        const articles = await prisma.article.findMany({
            where: {path},
        });
        return articles.length > 0 ? articles[0] : null;
    }

    /**
     * 获取页面列表
     * @param params 查询参数
     * @returns 页面列表
     */
    async findAll(params: {
        skip?: number;
        take?: number;
        orderBy?: Prisma.ArticleOrderByWithRelationInput;
        where?: Prisma.ArticleWhereInput;
        select?: Prisma.ArticleSelect;
    }): Promise<{ articles: Article[]; total: number }> {
        const {skip, take, orderBy, where, select} = params;

        const [articles, total] = await Promise.all([
            prisma.article.findMany({
                skip,
                take,
                orderBy,
                where,
                ...(select ? {select} : {}),
            }),
            prisma.article.count({where}),
        ]);

        return {articles, total};
    }

    /**
     * 更新页面
     * @param id 页面ID
     * @param data 更新数据
     * @returns 更新后的页面
     */
    async update(id: number, data: Prisma.ArticleUpdateInput): Promise<Article> {
        return prisma.article.update({
            where: {id},
            data,
        });
    }

    /**
     * 删除页面
     * @param id 页面ID
     * @returns 删除的页面
     */
    async delete(id: number): Promise<Article> {
        return prisma.article.delete({
            where: {id},
        });
    }

    /**
     * 搜索页面
     * @param query 搜索关键词
     * @returns 匹配的页面列表
     */
    async search(query: string): Promise<Article[]> {
        return prisma.article.findMany({
            where: {
                OR: [
                    {title: {contains: query}},
                    {content: {contains: query}},
                ],
            },
            orderBy: {createdAt: 'desc'},
        });
    }
}