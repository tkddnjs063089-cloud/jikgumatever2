'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { onLoginSuccess } from '../utils/auth';
import { getApiBaseUrl } from '../utils/api';

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: 'tkddnjs0630@naver.com',
    password: 'tkddnjs0729!',
  });
  const [error, setError] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    // 에러 메시지 초기화
    if (error) setError('');
  };

  const handleLogin = async () => {
    // 입력 검증
    if (!formData.email.trim()) {
      setError('이메일을 입력해주세요.');
      return;
    }
    if (!formData.password.trim()) {
      setError('비밀번호를 입력해주세요.');
      return;
    }

    try {
      const apiBaseUrl = getApiBaseUrl();

      const response = await fetch(`${apiBaseUrl}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();
      console.log('로그인 응답 데이터:', data); // 디버깅용

      if (response.ok) {
        // 백엔드 응답에서 액세스 토큰 추출 (여러 가능한 필드명 확인)
        const accessToken = data.access_token || data.accessToken || data.token;
        
        if (accessToken) {
          localStorage.setItem('token', accessToken);
          console.log('토큰 저장 완료');
        } else {
          console.error('토큰을 찾을 수 없습니다. 응답 데이터:', data);
          setError('로그인 응답에 토큰이 없습니다.');
          return;
        }
        
        // 백엔드 응답에서 이메일 추출 (백엔드 응답 구조에 따라 다름)
        const email = data.user?.email || data.email || formData.email;
        
        if (!email) {
          console.error('이메일을 찾을 수 없습니다. 응답 데이터:', data);
          setError('로그인 응답에 이메일이 없습니다.');
          return;
        }
        
        // 이메일 저장 (백엔드 API 호출에 필요)
        localStorage.setItem('email', email);
        console.log('이메일 저장 완료:', email);

        // 사용자 정보가 있으면 저장
        if (data.user) {
          localStorage.setItem('user', JSON.stringify(data.user));
        }

        // 토큰 모니터링 시작
        onLoginSuccess();

        router.push('/mypage');
      } else {
        setError(data.message || data.error || '이메일 또는 비밀번호가 올바르지 않습니다.');
      }
    } catch (err) {
      console.error('로그인 오류:', err);
      setError('로그인 중 오류가 발생했습니다. 네트워크 연결을 확인해주세요.');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleLogin();
  };

  const handlePasswordKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleLogin();
    }
  };

  return (
    <div className="min-h-screen py-12 flex items-center justify-center">
      <div className="w-full max-w-md">
        <div className="bg-white border border-gray-200 rounded-lg p-8 shadow-sm">
          <h1 className="text-2xl font-bold text-gray-900 mb-8 text-center">
            로그인
          </h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 이메일 입력 */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                이메일
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="이메일을 입력하세요"
                autoComplete="email"
              />
            </div>

            {/* 비밀번호 입력 */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                비밀번호
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                onKeyPress={handlePasswordKeyPress}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="비밀번호를 입력하세요"
                autoComplete="current-password"
              />
            </div>

            {/* 에러 메시지 */}
            {error && (
              <div className="text-red-600 text-sm text-center">
                {error}
              </div>
            )}

            {/* 로그인 버튼 */}
            <button
              type="submit"
              className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-lg"
            >
              로그인
            </button>
          </form>

          {/* 회원가입 링크 */}
          <div className="mt-6 text-center">
            <span className="text-gray-600 text-sm">계정이 없으신가요? </span>
            <Link
              href="/signup"
              className="text-blue-600 hover:text-blue-700 font-medium text-sm"
            >
              회원가입
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

