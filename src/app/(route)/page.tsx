'use client';

import ProtectedRoute from '@/components/Auth/ProtectedRoute';

export default function HomePage() {
  return (
    <ProtectedRoute>
      <div className="p-4">
        <div className="bg-base-100 rounded-lg shadow p-6">
          <h1 className="text-2xl font-bold mb-4">欢迎来到 Blue Wiki</h1>
          <p className="mb-4">这是一个受保护的页面，只有登录用户才能访问。</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="card bg-primary text-primary-content">
              <div className="card-body">
                <h2 className="card-title">文档</h2>
                <p>查看和管理所有文档</p>
              </div>
            </div>
            <div className="card bg-secondary text-secondary-content">
              <div className="card-body">
                <h2 className="card-title">用户</h2>
                <p>管理系统用户</p>
              </div>
            </div>
            <div className="card bg-accent text-accent-content">
              <div className="card-body">
                <h2 className="card-title">设置</h2>
                <p>配置系统设置</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}