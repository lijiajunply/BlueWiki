import {NextRequest, NextResponse} from 'next/server';
import {PageRepo} from '@/repos/PageRepo';
import {Article} from "@prisma/client";

export async function GET(request: NextRequest) {
    try {
        // 获取路径参数
        const {searchParams} = new URL(request.url);
        const path = (searchParams.get('page') || '/');

        const pageRepo = new PageRepo();

        // 查找父目录下的内容
        const parentPath = path.substring(0, path.lastIndexOf('/')) || '/';
        const searchPath = parentPath === '/' ? '/' : `${parentPath}/`;

        // 查找父目录下的所有页面（只选择需要的字段）
        const result = await pageRepo.findAll({
            where: {
                path: {
                    startsWith: searchPath
                }
            },
            orderBy: {createdAt: 'desc'},
            select: {
                id: true,
                path: true,
                title: true,
                createdAt: true,
                updatedAt: true,
                authorId: true
            }
        });

        // 分离文件夹和文章
        const folders: Set<string> = new Set();
        const articles: Article[] = [];

        result.articles.forEach(article => {
            // 移除父路径部分
            const relativePath = article.path.substring(searchPath === '/' ? 0 : searchPath.length);

            // 检查是否包含更多的路径分隔符（表示子文件夹）
            const pathSegments = relativePath.split('/').filter(segment => segment.length > 0);

            if (pathSegments.length > 1) {
                // 这是一个文件夹，添加文件夹名称到集合中
                folders.add(pathSegments[0]);
            } else if (pathSegments.length === 1) {
                // 这是一个直接子页面
                articles.push(article);
            }
        });

        // 构造文件夹对象
        const folderList = Array.from(folders).map(folderName => ({
            name: folderName,
            path: `${searchPath === '/' ? '' : searchPath}${folderName}`,
            type: 'folder',
            createdAt: new Date().toISOString()
        }));

        // 构造文章对象（不包含内容）
        const articleList = articles.map(article => ({
            ...article,
            type: 'article'
        }));

        if (parentPath === '/' || path === '/') {
            articleList.push({
                id: -1,
                path: '/creator',
                title: 'Creator',
                type: 'article'
            } as Article & {type: 'article'});
        }

        return NextResponse.json({
            parentPath,
            contents: [...folderList, ...articleList],
            total: folderList.length + articleList.length
        });
    } catch (error) {
        console.error('Failed to fetch page or parent directory contents:', error);
        return NextResponse.json({error: 'Failed to fetch page or parent directory contents'}, {status: 500});
    }
}