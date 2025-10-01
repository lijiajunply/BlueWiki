import Link from "next/link";

export default function ArticlesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-base-100">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-base-content">文章管理</h1>
          <div className="flex space-x-4">
            <Link 
              href="/articles/new" 
              className="btn btn-primary"
            >
              创建文章
            </Link>
          </div>
        </div>
        <div className="bg-base-100 rounded-2xl shadow-sm p-6">
          {children}
        </div>
      </div>
    </div>
  );
}