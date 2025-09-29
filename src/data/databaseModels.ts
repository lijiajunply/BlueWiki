export interface UserModel{
    id: number;
    name: string;
    email: string;
    phone: string;
    password: string;
    role: string;
    createdAt: Date;
    updatedAt: Date;
    articles: ArticleModel[];
    comments: CommentModel[];
}

export interface ArticleModel{
    id: number;
    path: string;
    title: string;
    content: string;
    authorId: string;
    createdAt: Date;
    updatedAt: Date;
    comments: CommentModel[];
    tags: TagModel[];
}

export interface CommentModel{
    id: number;
    content: string;
    authorId: string;
    articleId: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface TagModel{
    id: number;
    name: string;
    createdAt: Date;
    updatedAt: Date;
    articles: ArticleModel[];
}

export interface File{
    id: number;
    path: string;
    hash: string;
    createdAt: Date;
    updatedAt: Date;
}