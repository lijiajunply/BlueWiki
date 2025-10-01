// src/app/api-doc/page.tsx
"use client";

import React from 'react';
import ReactSwagger from './react-swagger';

export default function IndexPage() {
  const [spec, setSpec] = React.useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await fetch('/api/openapi');
        if (!res.ok) throw new Error(`Failed to load OpenAPI: ${res.status}`);
        const j = await res.json();
        if (mounted) setSpec(j);
      } catch (err: unknown) {
        let msg = String(err);
        if (err && typeof err === 'object' && 'message' in err) {
          const possible = (err as { message?: unknown }).message;
          if (typeof possible === 'string') msg = possible;
        }
        if (mounted) setError(msg);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  if (loading) return <div className="p-6">加载 API 文档…</div>;
  if (error) return <div className="p-6 text-red-500">{error}</div>;
  if (!spec) return <div className="p-6">未找到 API 规范。</div>;

  return (
    <section className="container">
      <ReactSwagger spec={spec} />
    </section>
  );
}