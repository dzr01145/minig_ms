import React, { useState, useEffect } from 'react';
import { Lock, AlertCircle } from 'lucide-react';

interface LoginProps {
    onLogin: () => void;
}

export function Login({ onLogin }: LoginProps) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();

        const envUser = import.meta.env.VITE_BASIC_AUTH_USER;
        const envPass = import.meta.env.VITE_BASIC_AUTH_PASSWORD;

        // 環境変数が設定されていない場合は、デフォルトでログイン許可（開発用）
        // 本番環境では必ず環境変数を設定すること
        if (!envUser && !envPass) {
            console.warn('Basic Auth credentials not set. Allowing access.');
            sessionStorage.setItem('isAuthenticated', 'true');
            onLogin();
            return;
        }

        if (username === envUser && password === envPass) {
            sessionStorage.setItem('isAuthenticated', 'true');
            onLogin();
        } else {
            setError('ユーザー名またはパスワードが間違っています');
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-lg max-w-md w-full p-8">
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Lock className="w-8 h-8 text-primary-600" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900">ログイン</h1>
                    <p className="text-gray-600 mt-2">システムを利用するにはログインしてください</p>
                </div>

                {error && (
                    <div className="bg-danger-50 text-danger-700 p-3 rounded-lg flex items-center gap-2 mb-6 text-sm">
                        <AlertCircle className="w-4 h-4 flex-shrink-0" />
                        {error}
                    </div>
                )}

                <form onSubmit={handleLogin} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            ユーザー名
                        </label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            placeholder="ユーザー名を入力"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            パスワード
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            placeholder="パスワードを入力"
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-primary-600 text-white py-2 rounded-lg hover:bg-primary-700 transition-colors font-medium"
                    >
                        ログイン
                    </button>
                </form>

                <p className="text-xs text-gray-400 text-center mt-6">
                    Mining Safety Management System
                </p>
            </div>
        </div>
    );
}
