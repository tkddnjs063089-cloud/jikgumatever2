// JWT 토큰 디코딩 함수
export function decodeJWT(token: string): any {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('토큰 디코딩 실패:', error);
    return null;
  }
}

// 토큰 만료 시간 확인
export function getTokenExpiration(token: string): Date | null {
  const decoded = decodeJWT(token);
  if (decoded && decoded.exp) {
    return new Date(decoded.exp * 1000); // JWT exp는 초 단위
  }
  return null;
}

// 토큰이 만료되었는지 확인
export function isTokenExpired(token: string): boolean {
  const expiration = getTokenExpiration(token);
  if (!expiration) return true;

  // 만료 30초 전에 만료로 간주 (버퍼 시간)
  const now = new Date();
  now.setSeconds(now.getSeconds() + 30);

  return expiration <= now;
}

// 토큰이 곧 만료되는지 확인 (5분 이내)
export function isTokenExpiringSoon(token: string): boolean {
  const expiration = getTokenExpiration(token);
  if (!expiration) return true;

  const now = new Date();
  const fiveMinutesFromNow = new Date(now.getTime() + 5 * 60 * 1000);

  return expiration <= fiveMinutesFromNow;
}

// 토큰 유효성 기본 확인
export function isValidToken(token: string): boolean {
  if (!token || typeof token !== 'string') return false;
  return !isTokenExpired(token);
}
