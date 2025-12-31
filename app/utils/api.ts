import { isValidToken } from './token';

// API 호출을 위한 기본 설정
export function getApiBaseUrl(): string {
  let apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

  // 환경 변수가 없거나 빈 문자열인 경우 에러 발생
  if (!apiBaseUrl || apiBaseUrl.trim() === '') {
    throw new Error('🚨 API 서버 URL이 설정되지 않았습니다.\n환경변수 NEXT_PUBLIC_API_BASE_URL을 설정해주세요.');
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

// 서버 상태 확인 및 알럿 표시
function checkServerStatus(response: Response, url: string): void {
  // 서버가 닫혀있는 경우 감지 (5xx 에러)
  if (response.status >= 500 && response.status < 600) {
    if (typeof window !== 'undefined') {
      alert('🚨 서버가 현재 닫혀있습니다.\n잠시 후 다시 시도해주세요.');
    }
    return;
  }

  // 기타 서버 에러
  if (!response.ok && response.status >= 500) {
    if (typeof window !== 'undefined') {
      alert('🚨 서버에 문제가 발생했습니다.\n잠시 후 다시 시도해주세요.');
    }
  }
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

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    // 서버 상태 확인
    checkServerStatus(response, url);

    return response;
  } catch (error) {
    // 네트워크 에러 (서버가 완전히 닫혀있는 경우)
    if (typeof window !== 'undefined') {
      alert('🚨 서버에 연결할 수 없습니다.\n네트워크 연결을 확인하거나 잠시 후 다시 시도해주세요.');
    }
    throw error;
  }
}

// 사용자 정보 조회
export async function fetchUserProfile(email: string) {
  try {
    const response = await apiCall(`/users/${encodeURIComponent(email)}`);

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('인증이 필요합니다.');
      }
      // 서버 에러는 apiCall에서 이미 처리됨
      throw new Error('사용자 정보를 가져오는데 실패했습니다.');
    }

    return await response.json();
  } catch (error) {
    // apiCall에서 서버 상태를 이미 확인했으므로 추가 처리 불필요
    throw error;
  }
}

// 상품 분석
export async function analyzeProduct(url: string) {
  try {
    const response = await apiCall(`/products/analyze?url=${encodeURIComponent(url)}`);

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('인증이 필요합니다.');
      }
      // 서버 에러는 apiCall에서 이미 처리됨
      throw new Error('상품 정보를 분석하는데 실패했습니다.');
    }

    return await response.json();
  } catch (error) {
    // apiCall에서 서버 상태를 이미 확인했으므로 추가 처리 불필요
    throw error;
  }
}
