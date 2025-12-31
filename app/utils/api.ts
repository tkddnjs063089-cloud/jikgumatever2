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
  try {
    const response = await apiCall(`/users/${encodeURIComponent(email)}`);

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('인증이 필요합니다.');
      }
      throw new Error('사용자 정보를 가져오는데 실패했습니다.');
    }

    // 응답이 JSON인지 확인
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      throw new Error('서버에서 잘못된 응답을 받았습니다.');
    }

    return await response.json();
  } catch (error) {
    // JSON 파싱 에러 처리 (HTML 응답 등)
    if (error instanceof SyntaxError) {
      console.error('JSON 파싱 에러 (HTML 응답 수신):', error);
      throw new Error('서버 연결에 문제가 있습니다. 잠시 후 다시 시도해주세요.');
    }
    throw error;
  }
}

// 사용자 목록 조회 (관리자용)
export async function fetchUsers() {
  try {
    const response = await apiCall('/users');

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('인증이 필요합니다.');
      }
      if (response.status === 403) {
        throw new Error('관리자 권한이 필요합니다.');
      }
      throw new Error('사용자 목록을 가져오는데 실패했습니다.');
    }

    // 응답이 JSON인지 확인
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      throw new Error('서버에서 잘못된 응답을 받았습니다.');
    }

    return await response.json();
  } catch (error) {
    // JSON 파싱 에러 처리 (HTML 응답 등)
    if (error instanceof SyntaxError) {
      console.error('JSON 파싱 에러 (HTML 응답 수신):', error);
      throw new Error('서버 연결에 문제가 있습니다. 잠시 후 다시 시도해주세요.');
    }
    throw error;
  }
}

// 상품 분석 (POST 요청으로 변경)
export async function analyzeProduct(url: string) {
  try {
    const response = await apiCall('/products/analyze', {
      method: 'POST',
      body: JSON.stringify({ url })
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('인증이 필요합니다.');
      }
      throw new Error('상품 정보를 분석하는데 실패했습니다.');
    }

    // 응답이 JSON인지 확인
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      throw new Error('서버에서 잘못된 응답을 받았습니다.');
    }

    return await response.json();
  } catch (error) {
    // JSON 파싱 에러 처리 (HTML 응답 등)
    if (error instanceof SyntaxError) {
      console.error('JSON 파싱 에러 (HTML 응답 수신):', error);
      throw new Error('서버 연결에 문제가 있습니다. 잠시 후 다시 시도해주세요.');
    }
    throw error;
  }
}
