import { isTokenExpiringSoon, isValidToken } from './token';

// 토큰 상태 관리
let tokenCheckInterval: NodeJS.Timeout | null = null;

// 토큰 만료 경고 표시
export function showTokenExpirationWarning() {
  // 이미 경고가 표시되어 있다면 중복 표시하지 않음
  if (document.querySelector('.token-expiration-warning')) {
    return;
  }

  const warningDiv = document.createElement('div');
  warningDiv.className = 'token-expiration-warning fixed top-4 right-4 bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded-lg shadow-lg z-50 max-w-sm';
  warningDiv.innerHTML = `
    <div class="flex items-center">
      <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
        <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path>
      </svg>
      <div class="flex-1">
        <p class="font-medium">세션이 곧 만료됩니다</p>
        <p class="text-sm">계속 사용하려면 다시 로그인해주세요.</p>
      </div>
      <button onclick="this.parentElement.parentElement.remove()" class="ml-2 text-yellow-700 hover:text-yellow-900">
        <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path>
        </svg>
      </button>
    </div>
  `;

  document.body.appendChild(warningDiv);

  // 10초 후 자동으로 사라지게 함
  setTimeout(() => {
    if (warningDiv.parentElement) {
      warningDiv.remove();
    }
  }, 10000);
}

// 토큰 상태 모니터링 시작
export function startTokenMonitoring() {
  if (tokenCheckInterval) {
    clearInterval(tokenCheckInterval);
  }

  tokenCheckInterval = setInterval(() => {
    const token = localStorage.getItem('token');
    if (token) {
      if (!isValidToken(token)) {
        // 토큰이 만료됨 - 로그아웃 처리
        console.log('토큰이 만료되어 로그아웃 처리합니다.');
        handleTokenExpired();
      } else if (isTokenExpiringSoon(token)) {
        // 토큰이 곧 만료될 예정 - 경고 표시
        console.log('토큰이 곧 만료됩니다.');
        showTokenExpirationWarning();
      }
    }
  }, 30000); // 30초마다 확인
}

// 토큰 상태 모니터링 중지
export function stopTokenMonitoring() {
  if (tokenCheckInterval) {
    clearInterval(tokenCheckInterval);
    tokenCheckInterval = null;
  }
}

// 토큰 만료 시 처리
export function handleTokenExpired() {
  stopTokenMonitoring();

  // localStorage 정리
  localStorage.removeItem('token');
  localStorage.removeItem('email');
  localStorage.removeItem('user');

  // 경고 표시 제거
  const warning = document.querySelector('.token-expiration-warning');
  if (warning) {
    warning.remove();
  }

  // 로그인 페이지로 리다이렉트 (현재 페이지가 로그인 페이지가 아닐 경우)
  if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
    alert('세션이 만료되어 로그아웃되었습니다. 다시 로그인해주세요.');
    window.location.href = '/login';
  }
}

// 로그인 성공 시 토큰 모니터링 시작
export function onLoginSuccess() {
  startTokenMonitoring();
}

// 로그아웃 시 토큰 모니터링 중지
export function onLogout() {
  stopTokenMonitoring();
}
