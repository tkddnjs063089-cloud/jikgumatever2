'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';
import { fetchUserProfile } from '../utils/api';

type Language = 'ko' | 'en' | 'ja' | 'zh' | 'es';

const languages: { code: Language; name: string; nativeName: string }[] = [
  { code: 'ko', name: 'Korean', nativeName: '한국어' },
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語' },
  { code: 'zh', name: 'Chinese', nativeName: '中文' },
  { code: 'es', name: 'Spanish', nativeName: 'Español' },
];

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [currentLanguage, setCurrentLanguage] = useState<Language>('ko');
  const [isLanguageMenuOpen, setIsLanguageMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [userInfo, setUserInfo] = useState<any>(null);
  const [authTrigger, setAuthTrigger] = useState(0);
  const languageMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (languageMenuRef.current && !languageMenuRef.current.contains(event.target as Node)) {
        setIsLanguageMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // 로그인 상태 및 사용자 정보 확인
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const token = localStorage.getItem('token');
        const email = localStorage.getItem('email');

        if (token && email) {
          setIsLoggedIn(true);
          setUserEmail(email);

          // 사용자 정보 가져오기 (관리자 권한 확인용)
          try {
            const userData = await fetchUserProfile(email);
            setUserInfo(userData);
          } catch (error) {
            console.error('사용자 정보 가져오기 실패:', error);
            setUserInfo(null);
          }
        } else {
          setIsLoggedIn(false);
          setUserEmail('');
          setUserInfo(null);
        }
      } catch (error) {
        console.error('로그인 상태 확인 실패:', error);
        setIsLoggedIn(false);
        setUserEmail('');
        setUserInfo(null);
      }
    };

    checkAuthStatus();

    const handleAuthChange = () => {
      checkAuthStatus();
      setAuthTrigger(prev => prev + 1);
    };

    window.addEventListener('authChange', handleAuthChange);

    return () => {
      window.removeEventListener('authChange', handleAuthChange);
    };
  }, [authTrigger]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchQuery.trim();

    if (!query) {
      if (pathname === '/wishlist') {
        router.push(pathname);
      } else {
        router.push('/');
      }
      return;
    }

    if (pathname === '/wishlist') {
      router.push(`/wishlist?search=${encodeURIComponent(query)}`);
    } else {
      router.push(`/?search=${encodeURIComponent(query)}`);
    }
  };

  const shouldShowSearch = pathname !== '/purchase-request' && pathname !== '/cart' && pathname !== '/mypage';

  const handleLanguageChange = (lang: Language) => {
    setCurrentLanguage(lang);
    setIsLanguageMenuOpen(false);
    console.log('언어 변경:', lang);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('email');
    localStorage.removeItem('user');
    setIsLoggedIn(false);
    setUserEmail('');
    setUserInfo(null);
    window.dispatchEvent(new Event('authChange'));
    router.push('/');
  };

  const currentLang = languages.find(lang => lang.code === currentLanguage);

  return (
    <header className="border-b border-gray-200 sticky top-0 bg-white z-50">
      <nav className="max-w-[1200px] mx-auto px-4">
        {/* 상단: 로고, 검색창, 우측 메뉴 */}
        <div className="flex items-center justify-between py-4">
          {/* JikguMate 로고 */}
          <div>
            <Link
              href="/"
              className="text-xl font-bold text-gray-900 hover:text-gray-700 transition-colors"
            >
              JikguMate
            </Link>
          </div>

          {/* 검색창 (구매요청 페이지에서는 숨김) */}
          {shouldShowSearch && (
            <div className="flex-1 max-w-md mx-4">
              <form onSubmit={handleSearch}>
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="상품 검색..."
                    className="w-full px-4 py-2 pl-10 pr-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <svg
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>
              </form>
            </div>
          )}

          {/* 우측 메뉴: 언어 설정, 마이페이지, 장바구니 */}
          <div className="flex items-center gap-6">
            {/* 언어 설정 드롭다운 */}
            <div className="relative" ref={languageMenuRef}>
              <button
                onClick={() => setIsLanguageMenuOpen(!isLanguageMenuOpen)}
                className="flex items-center gap-2 text-gray-700 hover:text-gray-900 font-medium transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-5 h-5 flex-shrink-0"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3 12h18M12 3a15.3 15.3 0 0 1 4.5 9 15.3 15.3 0 0 1-4.5 9 15.3 15.3 0 0 1-4.5-9 15.3 15.3 0 0 1 4.5-9Z"
                  />
                </svg>
                <span>{currentLang?.nativeName}</span>
                <svg
                  className={`w-4 h-4 transition-transform ${isLanguageMenuOpen ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              {/* 언어 선택 메뉴 */}
              {isLanguageMenuOpen && (
                <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                  <ul className="py-1">
                    {languages.map((lang) => (
                      <li key={lang.code}>
                        <button
                          onClick={() => handleLanguageChange(lang.code)}
                          className={`w-full text-left px-4 py-2 hover:bg-gray-100 transition-colors ${
                            currentLanguage === lang.code
                              ? 'bg-blue-50 text-blue-600 font-medium'
                              : 'text-gray-700'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span>{lang.nativeName}</span>
                            <span className="text-xs text-gray-500">{lang.name}</span>
                          </div>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* 로그인 상태 표시 (마이페이지 위에 작게) */}
            {isLoggedIn ? (
              <div className="flex items-center gap-2 text-xs">
                <span className="font-medium text-gray-400">
                  {userEmail}님 환영합니다
                </span>
                <button
                  onClick={handleLogout}
                  className="px-2 py-1 text-black rounded hover:bg-gray-200 transition-colors font-medium"
                >
                  로그아웃
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-xs">
                <Link
                  href="/login"
                  className="text-gray-600 hover:text-gray-800 transition-colors"
                >
                  로그인
                </Link>
                <span className="text-gray-400">|</span>
                <Link
                  href="/signup"
                  className="text-gray-600 hover:text-gray-800 transition-colors"
                >
                  회원가입
                </Link>
              </div>
            )}

            <Link
              href="/mypage"
              className="text-gray-700 hover:text-gray-900 font-medium transition-colors"
            >
              마이페이지
            </Link>
            <Link
              href="/cart"
              className="text-gray-700 hover:text-gray-900 transition-colors"
              aria-label="장바구니"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-6 h-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z"
                />
              </svg>
            </Link>
          </div>
        </div>

        {/* 하단: 네비게이션 메뉴 */}
        <div className="flex gap-8 pb-4 justify-end">
          {/* 관리자 버튼 (관리자인 경우에만 표시) */}
          {isLoggedIn && (userInfo?.isAdmin === true || userInfo?.isAdmin === 1) && (
            <Link
              href="/admin"
              className={`transition-colors ${
                pathname === '/admin'
                  ? 'text-red-600 font-medium'
                  : 'text-gray-700 hover:text-gray-900'
              }`}
            >
              관리자
            </Link>
          )}
          <Link
            href="/purchase-request"
            className={`transition-colors ${
              pathname === '/purchase-request'
                ? 'text-blue-600 font-medium'
                : 'text-gray-700 hover:text-gray-900'
            }`}
          >
            구매요청
          </Link>
          <Link
            href="/wishlist"
            className={`transition-colors ${
              pathname === '/wishlist'
                ? 'text-blue-600 font-medium'
                : 'text-gray-700 hover:text-gray-900'
            }`}
          >
            찜
          </Link>
        </div>
      </nav>
    </header>
  );
}