"use client";

import {useAuth} from '@/contexts/AuthContext';
import Link from 'next/link';
import Image from "next/image";
import Icon from 'supercons'
import {useEffect, useState} from 'react';

export default function Header() {
    const {user, logout} = useAuth();

    // Controlled state for theme toggle. This avoids issues where the DOM
    // checkbox becomes out-of-sync with application state and ensures every
    // click updates <html data-theme> and localStorage consistently.
    const [isDark, setIsDark] = useState(false);

    useEffect(() => {
        try {
            const saved = localStorage.getItem('theme');
            if (saved) {
                const dark = saved !== 'light';
                setIsDark(dark);
                if (dark) document.documentElement.setAttribute('data-theme', saved);
                else document.documentElement.setAttribute('data-theme', 'light');
                return;
            }
        } catch {
            // ignore
        }

        // fallback: respect current document attribute or prefers-color-scheme
        const current = document.documentElement.getAttribute('data-theme');
        if (current) {
            setIsDark(current !== 'light');
        } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            setIsDark(true);
            document.documentElement.setAttribute('data-theme', 'dark');
        }
    }, []);

    useEffect(() => {
        console.debug('[Header] isDark state changed:', isDark);
    }, [isDark]);

    return (
        <header className="bg-base-100 shadow-md z-10">
            <div className="container mx-auto px-4 py-3 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                    <Image src='/logo.png' alt={'BlueWiki Logo'} className={'rounded-lg'} width={40} height={40}/>
                    <Link href="/" className="text-xl font-bold">Blue Wiki</Link>
                </div>
                <div className="flex items-center space-x-4">
                    <button className="btn btn-ghost btn-circle">
                        <Icon glyph="cloud" size={32}/>
                    </button>
                    <label className="swap swap-rotate">
                        {/* this hidden checkbox controls the state */}
                        <input
                            type="checkbox"
                            className="theme-controller"
                            value="dark"
                            checked={isDark}
                            onChange={(e) => {
                                const checked = e.currentTarget.checked;
                                setIsDark(checked);
                                if (checked) {
                                    document.documentElement.setAttribute('data-theme', 'dark');
                                    try { localStorage.setItem('theme', 'dark'); } catch {}
                                } else {
                                    document.documentElement.setAttribute('data-theme', 'light');
                                    try { localStorage.setItem('theme', 'light'); } catch {}
                                }
                            }}
                        />

                        {/* sun icon */}
                        <svg
                            className="swap-off h-10 w-10 fill-current"
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24">
                            <path
                                d="M5.64,17l-.71.71a1,1,0,0,0,0,1.41,1,1,0,0,0,1.41,0l.71-.71A1,1,0,0,0,5.64,17ZM5,12a1,1,0,0,0-1-1H3a1,1,0,0,0,0,2H4A1,1,0,0,0,5,12Zm7-7a1,1,0,0,0,1-1V3a1,1,0,0,0-2,0V4A1,1,0,0,0,12,5ZM5.64,7.05a1,1,0,0,0,.7.29,1,1,0,0,0,.71-.29,1,1,0,0,0,0-1.41l-.71-.71A1,1,0,0,0,4.93,6.34Zm12,.29a1,1,0,0,0,.7-.29l.71-.71a1,1,0,1,0-1.41-1.41L17,5.64a1,1,0,0,0,0,1.41A1,1,0,0,0,17.66,7.34ZM21,11H20a1,1,0,0,0,0,2h1a1,1,0,0,0,0-2Zm-9,8a1,1,0,0,0-1,1v1a1,1,0,0,0,2,0V20A1,1,0,0,0,12,19ZM18.36,17A1,1,0,0,0,17,18.36l.71.71a1,1,0,0,0,1.41,0,1,1,0,0,0,0-1.41ZM12,6.5A5.5,5.5,0,1,0,17.5,12,5.51,5.51,0,0,0,12,6.5Zm0,9A3.5,3.5,0,1,1,15.5,12,3.5,3.5,0,0,1,12,15.5Z" />
                        </svg>

                        {/* moon icon */}
                        <svg
                            className="swap-on h-10 w-10 fill-current"
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24">
                            <path
                                d="M21.64,13a1,1,0,0,0-1.05-.14,8.05,8.05,0,0,1-3.37.73A8.15,8.15,0,0,1,9.08,5.49a8.59,8.59,0,0,1,.25-2A1,1,0,0,0,8,2.36,10.14,10.14,0,1,0,22,14.05,1,1,0,0,0,21.64,13Zm-9.5,6.69A8.14,8.14,0,0,1,7.08,5.22v.27A10.15,10.15,0,0,0,17.22,15.63a9.79,9.79,0,0,0,2.1-.22A8.11,8.11,0,0,1,12.14,19.73Z" />
                        </svg>
                    </label>
                    {user ? (
                        <div className="dropdown dropdown-end">
                            <div tabIndex={0} role="button" className="btn btn-ghost btn-circle avatar">
                                <Image
                                    className="rounded-full h-6 w-6"
                                    width={24}
                                    height={24}
                                    alt="用户头像"
                                    src="/person.png"
                                />
                            </div>
                            <ul tabIndex={0}
                                className="mt-3 z-[1] p-2 shadow menu menu-sm dropdown-content bg-base-100 rounded-box w-52">
                                <li>
                                    <a className="justify-between">
                                        个人资料
                                    </a>
                                </li>
                                <li><a>设置</a></li>
                                <li>
                                    <button onClick={() => logout()}>
                                        退出
                                    </button>
                                </li>
                            </ul>
                        </div>
                    ) : (
                        <Link
                            href="/login"
                            className="btn btn-primary btn-sm"
                        >
                            登录
                        </Link>
                    )}
                </div>
            </div>
        </header>
    );
}