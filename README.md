# 직구메이트 (JikguMate)

해외 직구 상품 구매대행 서비스 프론트엔드 프로젝트

## 기술 스택

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **State Management:** React Hooks (useState, useEffect)
- **Storage:** LocalStorage (장바구니, 찜목록)

## 프로젝트 구조

```
app/
├── admin/                    # 관리자 페이지
│   ├── layout.tsx           # 관리자 레이아웃
│   ├── page.tsx             # 관리자 대시보드
│   ├── orderItems/          # 주문 관리
│   │   └── page.tsx
│   ├── products/            # 상품 관리
│   │   └── page.tsx
│   └── users/               # 사용자 관리
│       └── page.tsx
├── cart/                     # 장바구니
│   └── page.tsx
├── components/               # 공통 컴포넌트
│   └── Header.tsx
├── login/                    # 로그인
│   └── page.tsx
├── mypage/                   # 마이페이지
│   ├── page.tsx
│   └── components/
│       ├── OrderHistoryModal.tsx
│       └── ProfileEditModal.tsx
├── product/                  # 상품 상세
│   └── [id]/
│       └── page.tsx
├── purchase-request/         # 구매대행 요청
│   └── page.tsx
├── signup/                   # 회원가입
│   └── page.tsx
├── utils/                    # 유틸리티 함수
│   ├── api.ts               # API 호출 함수
│   ├── auth.ts              # 인증 관련
│   ├── cart.ts              # 장바구니 관련
│   ├── token.ts             # 토큰 관리
│   └── wishlist.ts          # 찜목록 관련
├── wishlist/                 # 찜목록
│   └── page.tsx
├── globals.css              # 전역 스타일
├── layout.tsx               # 루트 레이아웃
└── page.tsx                 # 메인 페이지
```

## 주요 기능

### 사용자 기능

| 기능            | 설명                                                          |
| --------------- | ------------------------------------------------------------- |
| 회원가입        | 이메일 중복확인, 비밀번호 검증, 주소 검색 (다음 우편번호 API) |
| 로그인/로그아웃 | JWT 토큰 기반 인증                                            |
| 상품 목록       | 백엔드 API 연동, 검색 필터링, 찜하기                          |
| 상품 상세       | 상품 정보, 수량 선택, 장바구니 담기                           |
| 장바구니        | 로컬 스토리지 기반, 수량 조절                                 |
| 찜목록          | 로컬 스토리지 기반                                            |
| 마이페이지      | 프로필 조회/수정, 주문 내역 조회                              |
| 구매대행 요청   | 구매 요청 폼                                                  |

### 관리자 기능

| 기능        | 설명                                                     |
| ----------- | -------------------------------------------------------- |
| 사용자 관리 | 사용자 목록 조회                                         |
| 상품 관리   | 상품 목록 조회, 삭제                                     |
| 주문 관리   | 주문 목록 조회, 상태 변경 (대기중/배송중/배송완료), 삭제 |

## 백엔드 API 연동

### 환경 변수 설정

```env
# .env.local
NEXT_PUBLIC_API_BASE_URL=https://your-backend-url.com
```

### API 엔드포인트

#### 인증

| Method | Endpoint       | 설명     |
| ------ | -------------- | -------- |
| POST   | `/auth/signup` | 회원가입 |
| POST   | `/auth/login`  | 로그인   |
| POST   | `/auth/logout` | 로그아웃 |

#### 사용자

| Method | Endpoint                       | 설명                      |
| ------ | ------------------------------ | ------------------------- |
| GET    | `/users/:email`                | 사용자 정보 조회          |
| GET    | `/users/all`                   | 전체 사용자 목록 (관리자) |
| GET    | `/users/check-email?email=xxx` | 이메일 중복 확인          |

#### 상품

| Method | Endpoint        | 설명               |
| ------ | --------------- | ------------------ |
| GET    | `/products/all` | 전체 상품 목록     |
| GET    | `/products/:id` | 상품 상세 조회     |
| DELETE | `/products/:id` | 상품 삭제 (관리자) |

#### 주문

| Method | Endpoint             | 설명                    |
| ------ | -------------------- | ----------------------- |
| GET    | `/orders`            | 전체 주문 목록 (관리자) |
| GET    | `/orders/my`         | 내 주문 목록            |
| PATCH  | `/orders/:id/status` | 주문 상태 변경          |
| DELETE | `/orders/:id`        | 주문 삭제               |

### API 응답 형식

#### 상품 목록 (`GET /products/all`)

```json
[
  {
    "productId": 1,
    "imageUrl": "https://example.com/image.jpg",
    "price": 115497,
    "ko_name": "상품명"
  }
]
```

#### 주문 상태 값

| 값          | 설명     |
| ----------- | -------- |
| `PENDING`   | 대기중   |
| `SHIPPING`  | 배송중   |
| `DELIVERED` | 배송완료 |

## 설치 및 실행

### 요구사항

- Node.js 18+
- npm 또는 yarn

### 설치

```bash
npm install
```

### 개발 서버 실행

```bash
npm run dev
```

### 빌드

```bash
npm run build
```

### 프로덕션 실행

```bash
npm start
```

## 배포

Vercel에 배포되어 있습니다.

```json
// vercel.json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/" }]
}
```

## 로컬 스토리지 키

| 키                   | 설명                   |
| -------------------- | ---------------------- |
| `token`              | JWT 인증 토큰          |
| `email`              | 로그인한 사용자 이메일 |
| `user`               | 사용자 정보            |
| `jikgumate_cart`     | 장바구니 데이터        |
| `jikgumate_wishlist` | 찜목록 데이터          |

## 라이선스

MIT License
