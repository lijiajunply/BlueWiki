"use client";

import React, {useEffect, useState} from "react";
import Icon from 'supercons'
import Link from "next/link";
import {usePathname} from "next/navigation";

interface ContentItem {
    id?: number;
    name?: string;
    title?: string;
    path: string;
    type: "folder" | "article";
    createdAt?: string;
}

export default function SidebarContent() {
    const [contents, setContents] = useState<ContentItem[]>([]);
    const [loading, setLoading] = useState(true);
    const pathname = usePathname();

    useEffect(() => {
        const fetchContents = async () => {
            setLoading(true);
            try {
                // 获取当前路径
                const response = await fetch(`/api/pages/path?page=${pathname}`);

                if (response.ok) {
                    const data = await response.json();
                    setContents(data.contents);
                }
            } catch (error) {
                console.error("获取侧边栏内容失败:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchContents();
    }, [pathname]);

    if (loading) {
        return <div className="text-center py-4">加载中...</div>;
    }

    return (
        <ul className="menu menu-sm w-full">
            {contents.map((item, index) => (
                <li key={index}>
                    <Link
                        href={item.path}
                        className="flex items-center py-2 px-3 hover:bg-base-200 rounded-lg transition-colors w-full"
                    >
                        <div className="mr-2">
                            {item.type === "folder" ? (
                                <Icon glyph='credit-card' className="w-5 h-5 text-blue-500"/>
                            ) : (
                                <Icon glyph='card-text' className="w-5 h-5 text-green-500"/>
                            )}
                        </div>
                        <span className="truncate">
              {item.name || item.title || item.path}
            </span>
                    </Link>
                </li>
            ))}

            {contents.length === 0 && (
                <li className="py-2 px-3 text-gray-500">

                </li>
            )}
        </ul>
    );
}