'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();
  const { login, user, loading } = useAuth();

  useEffect(() => {
    // 如果用户已经登录，重定向到主页
    if (user) {
      router.push('/');
    }
  }, [user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const { success, error: loginError } = await login(email, password);
    
    if (success) {
      router.push('/');
    } else {
      setError(loginError || '登录失败');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center redirect-bg">
        <div className="loading loading-spinner loading-lg"></div>
      </div>
    );
  }

  // 如果用户已经登录，不显示登录表单
  if (user) {
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center redirect-bg p-4">
      <div className="card bg-base-100 w-full max-w-md shadow-lg">
        <div className="card-body">
          <h2 className="card-title text-2xl justify-center mb-6">用户登录</h2>
          
          {error && (
            <div className="alert alert-error mb-4">
              <span>{error}</span>
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            <div className="form-control mb-4">
              <label className="label">
                <span className="label-text">邮箱</span>
              </label>
              <input
                type="email"
                placeholder="请输入邮箱"
                className="input input-bordered"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            
            <div className="form-control mb-6">
              <label className="label">
                <span className="label-text">密码</span>
              </label>
              <input
                type="password"
                placeholder="请输入密码"
                className="input input-bordered"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            
            <div className="form-control mb-4">
              <button 
                type="submit" 
                className="btn btn-primary w-full"
              >
                登录
              </button>
            </div>
          </form>
          
          <div className="text-center mt-4">
            <p className="text-sm">
              还没有账户？{' '}
              <button 
                onClick={() => router.push('/register')}
                className="link link-primary"
              >
                立即注册
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}