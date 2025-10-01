"use client";

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Markdown from '@/components/Markdown/Markdown';
import Link from 'next/link';

interface PageData {
  id: number;
  path: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  authorId: number;
}

interface Comment {
  id: number;
  content: string;
  createdAt: string;
  author: {
    name: string;
  };
}

interface Tag {
  id: number;
  name: string;
}

interface Author {
  id: number;
  name: string;
  bio: string;
}

export default function PageClient() {
  const params = useParams();
  const raw = params.page;
  const pagePath = Array.isArray(raw) ? '/' + raw.join('/') : (raw ? '/' + raw : '/');
  const [page, setPage] = useState<PageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [author, setAuthor] = useState<Author | null>(null);
  const [commentsLoading, setCommentsLoading] = useState(true);
  const [tagsLoading, setTagsLoading] = useState(true);
  const [authorLoading, setAuthorLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        // 使用文章路径API获取页面数据
        const segments = pagePath.split('/').filter(Boolean);
        const encoded = segments.map(s => encodeURIComponent(s)).join('/');
        const url = encoded ? `/api/articles/by-path/${encoded}` : `/api/articles/by-path/%2F`;
        
        const res = await fetch(url, { cache: 'no-store' });
        if (res.status === 404) {
          throw new Error('页面未找到');
        } else if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.error || '加载失败');
        }
        
        const data = await res.json();
        if (isMounted) setPage(data);
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        if (isMounted) setError(msg || '加载失败');
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    load();
    return () => { isMounted = false; };
  }, [pagePath]);

  // 加载评论
  useEffect(() => {
    if (!page) return;
    
    const loadComments = async () => {
      setCommentsLoading(true);
      try {
        const res = await fetch(`/api/articles/${page.id}/comments`);
        if (res.ok) {
          const data = await res.json();
          setComments(data.comments || []);
        }
      } catch (err) {
        console.error('Failed to load comments:', err);
      } finally {
        setCommentsLoading(false);
      }
    };

    loadComments();
  }, [page]);

  // 加载标签
  useEffect(() => {
    if (!page) return;
    
    const loadTags = async () => {
      setTagsLoading(true);
      try {
        const res = await fetch(`/api/articles/${page.id}/tags`);
        if (res.ok) {
          const data = await res.json();
          setTags(data.tags || []);
        }
      } catch (err) {
        console.error('Failed to load tags:', err);
      } finally {
        setTagsLoading(false);
      }
    };

    loadTags();
  }, [page]);

  // 加载作者信息
  useEffect(() => {
    if (!page) return;
    
    const loadAuthor = async () => {
      setAuthorLoading(true);
      try {
        const res = await fetch(`/api/users/${page.authorId}`);
        if (res.ok) {
          const data = await res.json();
          setAuthor(data);
        }
      } catch (err) {
        console.error('Failed to load author:', err);
      } finally {
        setAuthorLoading(false);
      }
    };

    loadAuthor();
  }, [page]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-base-100 p-4">
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 rounded-full bg-base-200 flex items-center justify-center mb-4">
            <div className="w-8 h-8 rounded-full bg-primary animate-pulse"></div>
          </div>
          <div className="text-lg text-base-content">正在加载页面…</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-base-100 p-4">
        <div className="max-w-md text-center">
          <div className="w-16 h-16 rounded-full bg-error/10 flex items-center justify-center mx-auto mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-error" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="text-error mb-4">{error}</div>
          <Link 
            href="/" 
            className="px-4 py-2 bg-base-200 text-base-content rounded-full font-medium hover:bg-base-300 transition-colors duration-200"
          >
            返回首页
          </Link>
        </div>
      </div>
    );
  }

  if (!page) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-base-100 p-4">
        <div className="max-w-md text-center">
          <div className="w-16 h-16 rounded-full bg-warning/10 flex items-center justify-center mx-auto mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-warning" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h3 className="font-bold text-lg mb-1">未找到页面</h3>
          <p className="text-base-content/70 mb-6">请求的页面不存在</p>
          <Link 
            href="/" 
            className="px-4 py-2 bg-base-200 text-base-content rounded-full font-medium hover:bg-base-300 transition-colors duration-200"
          >
            返回首页
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-100">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <article className="bg-base-100 rounded-2xl shadow-sm p-6 mb-8 transition-all duration-300">
          <header className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-base-content mb-4">{page.title}</h1>
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-sm text-base-content/70">
              <span>路径: {page.path}</span>
              <span className="hidden sm:inline">•</span>
              <span>创建于: {new Date(page.createdAt).toLocaleString()}</span>
              <span className="hidden sm:inline">•</span>
              <span>更新于: {new Date(page.updatedAt).toLocaleString()}</span>
            </div>
          </header>
          <main>
            <Markdown content={page.content} />
          </main>
        </article>

        {/* 标签和作者信息 (桌面端在右侧，移动端在上方) */}
        <div className="flex flex-col md:flex-row gap-8 mb-8">
          {/* 在移动端首先显示，在桌面端显示在左侧 */}
          <div className="md:order-1 md:w-2/3">
            {/* 标签部分 */}
            <section className="bg-base-100 rounded-2xl shadow-sm p-6 mb-8 md:mb-0 transition-all duration-300">
              <h2 className="text-xl font-semibold text-base-content mb-4 pb-2 border-b border-base-200">标签</h2>
              {tagsLoading ? (
                <div className="flex space-x-2">
                  <div className="h-6 w-16 bg-base-200 rounded-full animate-pulse"></div>
                  <div className="h-6 w-20 bg-base-200 rounded-full animate-pulse"></div>
                  <div className="h-6 w-24 bg-base-200 rounded-full animate-pulse"></div>
                </div>
              ) : tags.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {tags.map(tag => (
                    <span 
                      key={tag.id} 
                      className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium"
                    >
                      {tag.name}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-base-content/70">暂无标签</p>
              )}
            </section>
          </div>

          {/* 在桌面端显示在右侧 */}
          <div className="md:order-2 md:w-1/3">
            {/* 作者信息 */}
            <section className="bg-base-100 rounded-2xl shadow-sm p-6 transition-all duration-300">
              <h2 className="text-xl font-semibold text-base-content mb-4 pb-2 border-b border-base-200">作者</h2>
              {authorLoading ? (
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-full bg-base-200 animate-pulse"></div>
                  <div className="space-y-2">
                    <div className="h-4 w-24 bg-base-200 rounded animate-pulse"></div>
                    <div className="h-3 w-32 bg-base-200 rounded animate-pulse"></div>
                  </div>
                </div>
              ) : author ? (
                <div className="flex items-center">
                  <div className="avatar placeholder mr-4">
                    <div className="bg-base-200 text-base-content rounded-full w-12 md:w-16 border border-base-300">
                      <span className="text-lg md:text-xl font-medium">{author.name.charAt(0)}</span>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-base-content">{author.name}</h3>
                    <p className="text-base-content/70 text-sm md:text-base">{author.bio || '暂无简介'}</p>
                  </div>
                </div>
              ) : (
                <p className="text-base-content/70">无法加载作者信息</p>
              )}
            </section>
          </div>
        </div>

        {/* 评论部分 (始终在底部) */}
        <section className="bg-base-100 rounded-2xl shadow-sm p-6 transition-all duration-300">
          <h2 className="text-xl font-semibold text-base-content mb-4 pb-2 border-b border-base-200">评论</h2>
          {commentsLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((item) => (
                <div key={item} className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 rounded-full bg-base-200 animate-pulse"></div>
                    <div className="h-3 w-20 bg-base-200 rounded animate-pulse"></div>
                    <div className="h-3 w-24 bg-base-200 rounded animate-pulse"></div>
                  </div>
                  <div className="space-y-2 pl-10">
                    <div className="h-3 w-full bg-base-200 rounded animate-pulse"></div>
                    <div className="h-3 w-3/4 bg-base-200 rounded animate-pulse"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : comments.length > 0 ? (
            <div className="space-y-6">
              {comments.map(comment => (
                <div 
                  key={comment.id} 
                  className="border-b border-base-200 pb-6 last:border-0 last:pb-0 transition-all duration-200 hover:bg-base-200 rounded-lg p-4"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="font-semibold text-base-content">{comment.author.name}</div>
                    <div className="text-sm text-base-content/70">
                      {new Date(comment.createdAt).toLocaleString()}
                    </div>
                  </div>
                  <div className="text-base-content">
                    {comment.content}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="w-16 h-16 rounded-full bg-base-200 flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-base-content/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <p className="text-base-content/70">暂无评论</p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}