'use client';

import React, {useState} from 'react';
import {useRouter} from 'next/navigation';

export default function RegisterPage() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [verificationCode, setVerificationCode] = useState('');
    const [step, setStep] = useState(1); // 1: 填写信息, 2: 验证码验证
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            setError('密码和确认密码不匹配');
            return;
        }

        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const response = await fetch('/api/users/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({name, email, phone, password}),
            });

            const data = await response.json();

            if (response.ok) {
                setSuccess(data.message);
                setStep(2); // 进入验证码验证步骤
            } else {
                setError(data.error || '注册失败');
            }
        } catch {
            setError('网络错误，请稍后重试');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyCode = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const response = await fetch('/api/users/register', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email,
                    code: verificationCode,
                    userInfo: {name, email, phone, password}
                }),
            });

            const data = await response.json();

            if (response.ok) {
                setSuccess('注册成功！正在跳转到登录页面...');
                setTimeout(() => {
                    router.push('/login');
                }, 2000);
            } else {
                setError(data.error || '验证码验证失败');
            }
        } catch {
            setError('网络错误，请稍后重试');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-base-200 p-4">
            <div className="card bg-base-100 w-full max-w-md shadow-lg">
                <div className="card-body">
                    <h2 className="card-title text-2xl justify-center mb-6">用户注册</h2>

                    {error && (
                        <div className="alert alert-error mb-4">
                            <span>{error}</span>
                        </div>
                    )}

                    {success && (
                        <div className="alert alert-success mb-4">
                            <span>{success}</span>
                        </div>
                    )}

                    {step === 1 && (
                        <form onSubmit={handleSubmit}>
                            <div className="form-control mb-4">
                                <label className="label">
                                    <span className="label-text">姓名</span>
                                </label>
                                <input
                                    type="text"
                                    placeholder="请输入姓名"
                                    className="input input-bordered"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                />
                            </div>

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

                            <div className="form-control mb-4">
                                <label className="label">
                                    <span className="label-text">手机号</span>
                                </label>
                                <input
                                    type="tel"
                                    placeholder="请输入手机号"
                                    className="input input-bordered"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="form-control mb-4">
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

                            <div className="form-control mb-6">
                                <label className="label">
                                    <span className="label-text">确认密码</span>
                                </label>
                                <input
                                    type="password"
                                    placeholder="请再次输入密码"
                                    className="input input-bordered"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="form-control mb-4">
                                <button
                                    type="submit"
                                    className={`btn btn-primary w-full ${loading ? 'loading' : ''}`}
                                    disabled={loading}
                                >
                                    {loading ? '注册中...' : '注册'}
                                </button>
                            </div>
                        </form>
                    )}

                    {step === 2 && (
                        <form onSubmit={handleVerifyCode}>
                            <div className="mb-6">
                                <p>我们已经向 {email} 发送了一封包含验证码的邮件，请查收并在下方输入验证码完成注册。</p>
                            </div>

                            <div className="form-control mb-6">
                                <label className="label">
                                    <span className="label-text">验证码</span>
                                </label>
                                <input
                                    type="text"
                                    placeholder="请输入6位验证码"
                                    className="input input-bordered"
                                    value={verificationCode}
                                    onChange={(e) => setVerificationCode(e.target.value)}
                                    maxLength={6}
                                    required
                                />
                            </div>

                            <div className="form-control mb-4">
                                <button
                                    type="submit"
                                    className={`btn btn-primary w-full ${loading ? 'loading' : ''}`}
                                    disabled={loading}
                                >
                                    {loading ? '验证中...' : '验证并完成注册'}
                                </button>
                            </div>
                        </form>
                    )}

                    <div className="text-center mt-4">
                        <p className="text-sm">
                            已有账户？{' '}
                            <button
                                onClick={() => router.push('/login')}
                                className="link link-primary"
                            >
                                立即登录
                            </button>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}