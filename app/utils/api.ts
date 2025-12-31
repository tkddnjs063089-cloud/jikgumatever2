import { isValidToken } from './token';

// API 호출을 위한 기본 설정
export function getApiBaseUrl(): string {
  let apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

  // 환경 변수가 없거나 빈 문자열인 경우 기본값 사용
  if (!apiBaseUrl || apiBaseUrl.trim() === '') {
    apiBaseUrl = 'https://ci-cd-jikgumate-1.onrender.com';
  }

  // URL 정리: 앞뒤 공백 제거, 마지막 슬래시 제거
  apiBaseUrl = apiBaseUrl.trim().replace(/\/+$/, '');

  // URL이 올바른 형식인지 확인
  if (!apiBaseUrl.startsWith('http://') && !apiBaseUrl.startsWith('https://')) {
    throw new Error('API 서버 URL 형식이 올바르지 않습니다.');
  }

  return apiBaseUrl;
}

// 인증 헤더 생성
export function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('인증 토큰이 없습니다.');
  }

  if (!isValidToken(token)) {
    throw new Error('토큰이 만료되었습니다. 다시 로그인해주세요.');
  }

  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  };
}

// API 호출 함수 (토큰 검증 포함)
export async function apiCall(
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> {
  const baseUrl = getApiBaseUrl();
  const url = `${baseUrl}${endpoint}`;

  // 기본 헤더 설정
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  // 인증이 필요한 경우 토큰 검증 및 헤더 추가
  if (endpoint.includes('/users/') ||
      endpoint.includes('/products/') ||
      endpoint.includes('/auth/logout')) {
    try {
      const authHeaders = getAuthHeaders();
      Object.assign(headers, authHeaders);
    } catch (error) {
      // 토큰이 없거나 만료된 경우
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('email');
        localStorage.removeItem('user');

        if (window.location.pathname !== '/login') {
          alert('세션이 만료되었습니다. 다시 로그인해주세요.');
          window.location.href = '/login';
        }
      }
      throw error;
    }
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  return response;
}

// 사용자 정보 조회
export async function fetchUserProfile(email: string) {
  const response = await apiCall(`/users/${encodeURIComponent(email)}`);

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('인증이 필요합니다.');
    }
    throw new Error('사용자 정보를 가져오는데 실패했습니다.');
  }

  return await response.json();
}

// 상품 분석
export async function analyzeProduct(url: string) {
  const response = await apiCall(`/products/analyze?url=${encodeURIComponent(url)}`);

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('인증이 필요합니다.');
    }
    throw new Error('상품 정보를 분석하는데 실패했습니다.');
  }

  return await response.json();
}
