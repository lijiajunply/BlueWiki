import React from "react";
import Header from "@/components/Layout/Header";
import SidebarContent from "@/components/Layout/SidebarContent";

export default function RootLayout({
                                       children,
                                   }: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <div className="flex flex-col h-screen">
            <Header/>

            {/* 主体部分 */}
            <div className="flex flex-1 overflow-hidden">
                {/* 侧边栏 */}
                <aside className="w-64 bg-base-100 shadow-md hidden md:block overflow-y-auto">
                    <div className="p-4">
                        <SidebarContent/>
                    </div>
                </aside>

                {/* 内容区域 */}
                <main className="flex-1 bg-base-200 overflow-y-auto">
                    <div className='min-h-full flex flex-col'>
                        <main className='flex-1'>
                            {children}
                        </main>
                        {/* 页脚 */}
                        <footer className="bg-base-100 py-4">
                            <div className="container mx-auto px-4 text-center text-sm text-base-content">
                                <p>© 2025 Blue Wiki. 保留所有权利。</p>
                            </div>
                        </footer>
                    </div>

                </main>
            </div>
        </div>
    );
}