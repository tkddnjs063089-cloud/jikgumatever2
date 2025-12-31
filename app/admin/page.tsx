'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { fetchUserProfile } from '../utils/api';

export default function AdminPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const checkAdminAccess = async () => {
      try {
        const token = localStorage.getItem('token');
        const email = localStorage.getItem('email');

        if (!token || !email) {
          alert('관리자 권한이 필요합니다.');
          router.push('/login');
          return;
        }

        // 사용자 정보 가져오기
        const userData = await fetchUserProfile(email);

        if (userData.isAdmin === 1) {
          setIsAuthorized(true);
        } else {
          alert('관리자 권한이 필요합니다.');
          router.push('/');
          return;
        }
      } catch (error) {
        console.error('관리자 권한 확인 실패:', error);
        alert('관리자 권한이 필요합니다.');
        router.push('/');
        return;
      } finally {
        setIsLoading(false);
      }
    };

    checkAdminAccess();
  }, [router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">관리자 권한 확인 중...</p>
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    return null; // 권한이 없으면 아무것도 표시하지 않음 (이미 리다이렉트됨)
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-6xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">관리자 페이지</h1>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* 관리자 기능들 - 추후 구현 */}
            <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
              <h3 className="text-lg font-semibold text-blue-900 mb-2">사용자 관리</h3>
              <p className="text-blue-700">등록된 사용자들을 관리합니다.</p>
            </div>

            <div className="bg-green-50 p-6 rounded-lg border border-green-200">
              <h3 className="text-lg font-semibold text-green-900 mb-2">상품 관리</h3>
              <p className="text-green-700">등록된 상품들을 관리합니다.</p>
            </div>

            <div className="bg-purple-50 p-6 rounded-lg border border-purple-200">
              <h3 className="text-lg font-semibold text-purple-900 mb-2">주문 관리</h3>
              <p className="text-purple-700">고객 주문들을 관리합니다.</p>
            </div>

            
          </div>
        </div>
      </div>
    </div>
  );
}
