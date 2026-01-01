'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { fetchUserProfile } from '../utils/api';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const alertShownRef = useRef(false);

  useEffect(() => {
    const checkAdminAccess = async () => {
      try {
        const token = localStorage.getItem('token');
        const email = localStorage.getItem('email');

        if (!token || !email) {
          if (!alertShownRef.current) {
            alertShownRef.current = true;
            alert('관리자 권한이 필요합니다.');
          }
          router.push('/login');
          return;
        }

        // 사용자 정보 가져오기
        const userData = await fetchUserProfile(email);

        if (userData.isAdmin === true || userData.isAdmin === 1) {
          setIsAuthorized(true);
        } else {
          if (!alertShownRef.current) {
            alertShownRef.current = true;
            alert('관리자 권한이 필요합니다.');
          }
          router.push('/');
          return;
        }
      } catch (error) {
        console.error('관리자 권한 확인 실패:', error);
        if (!alertShownRef.current) {
          alertShownRef.current = true;
          alert('관리자 권한이 필요합니다.');
        }
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
    <>
      {children}
    </>
  );
}
