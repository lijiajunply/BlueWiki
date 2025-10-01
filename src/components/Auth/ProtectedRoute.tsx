'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import FullScreenLoading from '@/components/Loading/FullScreenLoading';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (!loading) {
      setChecked(true);
      
      if (!user) {
        router.push('/login');
      }
    }
  }, [user, loading, router]);

  // 如果还在检查认证状态，显示加载页面
  if (loading || !checked) {
    return <FullScreenLoading />;
  }

  // 如果用户未登录，不显示内容（已经重定向）
  if (!user) {
    return null;
  }

  return <>{children}</>;
}