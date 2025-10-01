"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Markdown from '@/components/Markdown/Markdown';

export default function NewArticlePage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [path, setPath] = useState('');
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/articles', {
        method: 'POST',
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
        throw new Error(errorData.error || '创建文章失败');
      }

      const article = await response.json();
      router.push(article.path);
    } catch (err) {
      console.error('创建文章失败:', err);
      setError(err instanceof Error ? err.message : '创建文章失败');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-base-100">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-base-100 rounded-2xl shadow-sm p-6 transition-all duration-300">
          <h1 className="text-3xl font-bold text-base-content mb-6">创建新文章</h1>
          
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
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <span className="loading loading-spinner loading-sm"></span>
                      创建中...
                    </>
                  ) : (
                    '创建文章'
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