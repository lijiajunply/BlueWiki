"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Markdown from '@/components/Markdown/Markdown';

export default function EditArticlePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const articlePath = searchParams.get('path') || '/';
  
  const [title, setTitle] = useState('');
  const [path, setPath] = useState('');
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [articleId, setArticleId] = useState<number | null>(null);

  // 获取文章数据
  useEffect(() => {
    const fetchArticle = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // 首先通过路径获取文章ID
        const encodedPath = encodeURIComponent(articlePath);
        const response = await fetch(`/api/articles/by-path/${encodedPath}`);
        
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('文章未找到');
          }
          const errorData = await response.json();
          throw new Error(errorData.error || '获取文章失败');
        }
        
        const article = await response.json();
        setArticleId(article.id);
        setTitle(article.title);
        setPath(article.path);
        setContent(article.content);
      } catch (err) {
        console.error('获取文章失败:', err);
        setError(err instanceof Error ? err.message : '获取文章失败');
      } finally {
        setIsLoading(false);
      }
    };

    if (articlePath) {
      fetchArticle();
    } else {
      setError('未提供文章路径');
      setIsLoading(false);
    }
  }, [articlePath]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!articleId) return;
    
    setIsSaving(true);
    setError(null);

    try {
      const response = await fetch(`/api/articles/${articleId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          path: path.startsWith('/') ? path : `/${path}`,
          content,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '更新文章失败');
      }

      const article = await response.json();
      router.push(article.path);
    } catch (err) {
      console.error('更新文章失败:', err);
      setError(err instanceof Error ? err.message : '更新文章失败');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!articleId) return;
    
    if (!confirm('确定要删除这篇文章吗？此操作无法撤销。')) {
      return;
    }

    try {
      const response = await fetch(`/api/articles/${articleId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '删除文章失败');
      }

      router.push('/');
    } catch (err) {
      console.error('删除文章失败:', err);
      setError(err instanceof Error ? err.message : '删除文章失败');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-base-100 flex items-center justify-center">
        <div className="text-center">
          <span className="loading loading-spinner loading-lg"></span>
          <p className="mt-4 text-base-content">加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-100">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-base-100 rounded-2xl shadow-sm p-6 transition-all duration-300">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-base-content">编辑文章</h1>
            <button 
              className="btn btn-error btn-outline btn-sm"
              onClick={handleDelete}
              disabled={isSaving}
            >
              删除文章
            </button>
          </div>
          
          {error && (
            <div className="alert alert-error mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 shrink-0 stroke-current" fill="none" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="space-y-6">
              <div className="form-control">
                <label className="label">
                  <span className="label-text text-base-content font-medium">标题</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="input input-bordered bg-base-100 text-base-content"
                  placeholder="输入文章标题"
                  required
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text text-base-content font-medium">路径</span>
                </label>
                <div className="flex items-center">
                  <span className="mr-2 text-base-content">/</span>
                  <input
                    type="text"
                    value={path.startsWith('/') ? path.substring(1) : path}
                    onChange={(e) => setPath(e.target.value)}
                    className="input input-bordered bg-base-100 text-base-content flex-1"
                    placeholder="输入文章路径（例如：docs/getting-started）"
                    required
                  />
                </div>
                <p className="text-sm text-base-content/70 mt-1">路径将自动以 / 开头</p>
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text text-base-content font-medium">内容</span>
                </label>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <textarea
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      className="textarea textarea-bordered bg-base-100 text-base-content w-full h-96"
                      placeholder="使用 Markdown 编写文章内容..."
                      required
                    />
                  </div>
                  <div className="border border-base-200 rounded-lg p-4 bg-base-100">
                    <h3 className="text-lg font-semibold text-base-content mb-3">预览</h3>
                    <div className="prose max-w-none h-96 overflow-y-auto">
                      <Markdown content={content || '在此处输入内容以预览...'} />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-4 pt-4">
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => router.back()}
                  disabled={isSaving}
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <>
                      <span className="loading loading-spinner loading-sm"></span>
                      保存中...
                    </>
                  ) : (
                    '保存更改'
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}