'use client';

import React, {useState, useEffect} from 'react';
import {useRouter} from 'next/navigation';

export default function FirstUseSetup() {
    const [step, setStep] = useState(1); // 步骤 1: 邮件设置, 步骤 2: 验证码验证, 步骤 3: 管理员注册
    const [emailSettings, setEmailSettings] = useState({
        smtpServer: '',
        smtpPort: '',
        smtpEmail: '',
        smtpPassword: '',
        testEmail: ''
    });
    const [verificationCode, setVerificationCode] = useState('');
    const [adminUser, setAdminUser] = useState({
        name: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: ''
    });
    const [adminVerificationCode, setAdminVerificationCode] = useState(''); // 管理员注册验证码
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const router = useRouter();

    // 检查是否已经存在设置
    useEffect(() => {
        const checkExistingSettings = async () => {
            try {
                const response = await fetch('/api/settings');
                if (response.ok) {
                    const settings = await response.json();
                    console.log('Existing settings:', settings)
                    if (settings && settings.smtpServer && settings.smtpPost && settings.smtpEmail) {
                        // 如果已经存在完整的设置，直接跳到管理员注册步骤
                        setStep(3);
                    }
                }
            } catch {
                // 如果检查失败，继续正常流程
                console.log('Failed to check existing settings, continuing with normal flow');
            }
        };

        checkExistingSettings();
    }, []);

    const handleEmailSettingsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const {name, value} = e.target;
        setEmailSettings(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleVerificationCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setVerificationCode(e.target.value);
    };

    const handleAdminUserChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const {name, value} = e.target;
        setAdminUser(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleAdminVerificationCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setAdminVerificationCode(e.target.value);
    };

    // 测试邮件设置
    const handleTestEmailSettings = async () => {
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const response = await fetch('/api/settings/test-email', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    ...emailSettings,
                    smtpPort: parseInt(emailSettings.smtpPort)
                })
            });

            const data = await response.json();

            if (response.ok) {
                setSuccess(data.message);
                setStep(2); // 进入下一步，验证码验证
            } else {
                setError(data.error || '测试邮件发送失败');
            }
        } catch {
            setError('网络错误，请稍后重试');
        } finally {
            setLoading(false);
        }
    };

    // 验证验证码
    const handleVerifyCode = async () => {
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const response = await fetch('/api/settings/verify-code', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    code: verificationCode,
                    email: emailSettings.testEmail
                })
            });

            const data = await response.json();

            if (response.ok) {
                setSuccess('验证码验证成功');
                // 保存设置
                await saveSettings();
                setStep(3); // 进入管理员注册步骤
            } else {
                setError(data.error || '验证码验证失败');
            }
        } catch {
            setError('网络错误，请稍后重试');
        } finally {
            setLoading(false);
        }
    };

    // 保存邮件设置
    const saveSettings = async () => {
        try {
            const response = await fetch('/api/settings', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    ...emailSettings,
                    smtpPort: parseInt(emailSettings.smtpPort)
                })
            });

            if (!response.ok) {
                throw new Error('设置保存失败');
            }
        } catch (err) {
            setError('设置保存失败');
            throw err;
        }
    };

    // 注册管理员用户
    const handleRegisterAdmin = async () => {
        if (adminUser.password !== adminUser.confirmPassword) {
            setError('密码和确认密码不匹配');
            return;
        }

        setLoading(true);
        setError('');
        setSuccess('');

        try {
            // 发送验证码到邮箱
            const registerResponse = await fetch('/api/users/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name: adminUser.name,
                    email: adminUser.email,
                    phone: adminUser.phone,
                    password: adminUser.password
                })
            });

            const registerData = await registerResponse.json();

            if (!registerResponse.ok) {
                setError(registerData.error || '发送验证码失败');
                setLoading(false);
                return;
            }

            // 显示提示信息
            setSuccess(registerData.message);
        } catch {
            setError('网络错误，请稍后重试');
        }finally {
            setLoading(false);
        }
    };

    // 验证管理员注册验证码并完成注册
    const handleVerifyAdminCode = async () => {
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const completeResponse = await fetch('/api/users/register', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email: adminUser.email,
                    code: adminVerificationCode, // 使用用户输入的验证码
                    userInfo: {
                        name: adminUser.name,
                        email: adminUser.email,
                        phone: adminUser.phone,
                        password: adminUser.password,
                        role: 'ADMIN' // 强制设置为管理员角色
                    }
                })
            });

            const completeData = await completeResponse.json();

            if (completeResponse.ok) {
                setSuccess('管理员用户创建成功');
                // 延迟跳转到主页
                setTimeout(() => {
                    router.push('/login');
                }, 1500);
            } else {
                setError(completeData.error || '管理员用户创建失败');
            }
        } catch {
            setError('网络错误，请稍后重试');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center redirect-bg p-4">
            <div className="card bg-base-100 w-full max-w-2xl shadow-lg">
                <div className="card-body">
                    <h2 className="card-title text-2xl justify-center mb-6">系统初始设置</h2>

                    {/* 步骤指示器 */}
                    <div className="steps steps-vertical lg:steps-horizontal mb-8">
                        <div className={`step ${step >= 1 ? 'step-primary' : ''}`}>邮件设置</div>
                        <div className={`step ${step >= 2 ? 'step-primary' : ''}`}>邮件验证</div>
                        <div className={`step ${step >= 3 ? 'step-primary' : ''}`}>管理员注册</div>
                    </div>

                    {/* 步骤 1: 邮件设置 */}
                    {step === 1 && (
                        <div className="space-y-4">
                            <h3 className="text-xl font-bold">邮件服务器设置</h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="form-control">
                                    <label className="label">
                                        <span className="label-text">SMTP服务器</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="smtpServer"
                                        placeholder="smtp.example.com"
                                        className="input input-bordered"
                                        value={emailSettings.smtpServer}
                                        onChange={handleEmailSettingsChange}
                                        required
                                    />
                                </div>

                                <div className="form-control">
                                    <label className="label">
                                        <span className="label-text">SMTP端口</span>
                                    </label>
                                    <input
                                        type="number"
                                        name="smtpPort"
                                        placeholder="587"
                                        className="input input-bordered"
                                        value={emailSettings.smtpPort}
                                        onChange={handleEmailSettingsChange}
                                        required
                                    />
                                </div>

                                <div className="form-control">
                                    <label className="label">
                                        <span className="label-text">邮箱账号</span>
                                    </label>
                                    <input
                                        type="email"
                                        name="smtpEmail"
                                        placeholder="your-email@example.com"
                                        className="input input-bordered"
                                        value={emailSettings.smtpEmail}
                                        onChange={handleEmailSettingsChange}
                                        required
                                    />
                                </div>

                                <div className="form-control">
                                    <label className="label">
                                        <span className="label-text">邮箱密码</span>
                                    </label>
                                    <input
                                        type="password"
                                        name="smtpPassword"
                                        placeholder="password"
                                        className="input input-bordered"
                                        value={emailSettings.smtpPassword}
                                        onChange={handleEmailSettingsChange}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="form-control">
                                <label className="label">
                                    <span className="label-text">测试邮箱地址</span>
                                </label>
                                <input
                                    type="email"
                                    name="testEmail"
                                    placeholder="test@example.com"
                                    className="input input-bordered"
                                    value={emailSettings.testEmail}
                                    onChange={handleEmailSettingsChange}
                                    required
                                />
                            </div>

                            {error && <div className="alert alert-error">{error}</div>}
                            {success && <div className="alert alert-success">{success}</div>}

                            <div className="card-actions justify-end mt-4">
                                <button
                                    className={`btn btn-primary ${loading ? 'loading' : ''}`}
                                    onClick={handleTestEmailSettings}
                                    disabled={loading}
                                >
                                    {loading ? '测试中...' : '测试并继续'}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* 步骤 2: 验证码验证 */}
                    {step === 2 && (
                        <div className="space-y-4">
                            <h3 className="text-xl font-bold">邮箱验证</h3>
                            <p>我们已经向 {emailSettings.testEmail} 发送了一封包含验证码的邮件，请查收并在下方输入验证码。</p>

                            <div className="form-control">
                                <label className="label">
                                    <span className="label-text">验证码</span>
                                </label>
                                <input
                                    type="text"
                                    placeholder="请输入6位验证码"
                                    className="input input-bordered"
                                    value={verificationCode}
                                    onChange={handleVerificationCodeChange}
                                    maxLength={6}
                                    required
                                />
                            </div>

                            {error && <div className="alert alert-error">{error}</div>}
                            {success && <div className="alert alert-success">{success}</div>}

                            <div className="card-actions justify-between mt-4">
                                <button
                                    className="btn btn-outline"
                                    onClick={() => setStep(1)}
                                    disabled={loading}
                                >
                                    上一步
                                </button>
                                <button
                                    className={`btn btn-primary ${loading ? 'loading' : ''}`}
                                    onClick={handleVerifyCode}
                                    disabled={loading}
                                >
                                    {loading ? '验证中...' : '验证并继续'}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* 步骤 3: 管理员注册 */}
                    {step === 3 && (
                        <div className="space-y-4">
                            <h3 className="text-xl font-bold">管理员用户注册</h3>

                            {!success && (
                                <>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="form-control">
                                            <label className="label">
                                                <span className="label-text">姓名</span>
                                            </label>
                                            <input
                                                type="text"
                                                name="name"
                                                placeholder="管理员姓名"
                                                className="input input-bordered"
                                                value={adminUser.name}
                                                onChange={handleAdminUserChange}
                                                required
                                            />
                                        </div>

                                        <div className="form-control">
                                            <label className="label">
                                                <span className="label-text">邮箱</span>
                                            </label>
                                            <input
                                                type="email"
                                                name="email"
                                                placeholder="admin@example.com"
                                                className="input input-bordered"
                                                value={adminUser.email}
                                                onChange={handleAdminUserChange}
                                                required
                                            />
                                        </div>

                                        <div className="form-control">
                                            <label className="label">
                                                <span className="label-text">手机号</span>
                                            </label>
                                            <input
                                                type="tel"
                                                name="phone"
                                                placeholder="手机号"
                                                className="input input-bordered"
                                                value={adminUser.phone}
                                                onChange={handleAdminUserChange}
                                                required
                                            />
                                        </div>

                                        <div className="form-control">
                                            <label className="label">
                                                <span className="label-text">密码</span>
                                            </label>
                                            <input
                                                type="password"
                                                name="password"
                                                placeholder="密码"
                                                className="input input-bordered"
                                                value={adminUser.password}
                                                onChange={handleAdminUserChange}
                                                required
                                            />
                                        </div>

                                        <div className="form-control md:col-span-2">
                                            <label className="label">
                                                <span className="label-text">确认密码</span>
                                            </label>
                                            <input
                                                type="password"
                                                name="confirmPassword"
                                                placeholder="再次输入密码"
                                                className="input input-bordered"
                                                value={adminUser.confirmPassword}
                                                onChange={handleAdminUserChange}
                                                required
                                            />
                                        </div>
                                    </div>

                                    {error && <div className="alert alert-error">{error}</div>}

                                    <div className="card-actions justify-end mt-4">
                                        <button
                                            className={`btn btn-primary ${loading ? 'loading' : ''}`}
                                            onClick={handleRegisterAdmin}
                                            disabled={loading}
                                        >
                                            {loading ? '发送验证码中...' : '发送验证码'}
                                        </button>
                                    </div>
                                </>
                            )}

                            {success && (
                                <div className="space-y-4">
                                    <p>我们已经向 {adminUser.email} 发送了一封包含验证码的邮件，请查收并在下方输入验证码完成注册。</p>

                                    <div className="form-control">
                                        <label className="label">
                                            <span className="label-text">验证码</span>
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="请输入6位验证码"
                                            className="input input-bordered"
                                            value={adminVerificationCode}
                                            onChange={handleAdminVerificationCodeChange}
                                            maxLength={6}
                                            required
                                        />
                                    </div>

                                    {error && <div className="alert alert-error">{error}</div>}

                                    <div className="card-actions justify-between">
                                        <button
                                            className="btn btn-outline"
                                            onClick={() => setSuccess('')}
                                            disabled={loading}
                                        >
                                            重新发送
                                        </button>
                                        <button
                                            className={`btn btn-primary ${loading ? 'loading' : ''}`}
                                            onClick={handleVerifyAdminCode}
                                            disabled={loading}
                                        >
                                            {loading ? '注册中...' : '完成注册'}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}