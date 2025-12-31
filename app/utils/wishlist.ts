// 찜 목록 데이터 타입
export interface WishlistItem {
  id: number;
  title: string;
  image: string;
  price: string;
}

// localStorage 키
const WISHLIST_KEY = 'jikgumate_wishlist';

// 찜 목록 불러오기
export function getWishlist(): WishlistItem[] {
  if (typeof window === 'undefined') return [];

  try {
    const stored = localStorage.getItem(WISHLIST_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('찜 목록 불러오기 실패:', error);
    return [];
  }
}

// 찜 목록 저장하기
export function saveWishlist(items: WishlistItem[]): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(WISHLIST_KEY, JSON.stringify(items));
  } catch (error) {
    console.error('찜 목록 저장 실패:', error);
  }
}

// 찜 목록에 상품 추가
export function addToWishlist(item: WishlistItem): void {
  const currentItems = getWishlist();
  const exists = currentItems.some(existing => existing.id === item.id);

  if (!exists) {
    const newItems = [...currentItems, item];
    saveWishlist(newItems);
  }
}

// 찜 목록에서 상품 제거
export function removeFromWishlist(id: number): void {
  const currentItems = getWishlist();
  const newItems = currentItems.filter(item => item.id !== id);
  saveWishlist(newItems);
}

// 상품이 찜 목록에 있는지 확인
export function isInWishlist(id: number): boolean {
  const currentItems = getWishlist();
  return currentItems.some(item => item.id === id);
}

// 찜 목록 토글 (추가/제거)
export function toggleWishlistItem(item: WishlistItem): void {
  if (isInWishlist(item.id)) {
    removeFromWishlist(item.id);
  } else {
    addToWishlist(item);
  }
}
