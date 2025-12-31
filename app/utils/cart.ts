// 장바구니 데이터 타입
export interface CartItem {
  id: number;
  title: string;
  image: string;
  price: string;
  quantity: number;
  addedAt: string;
}

// localStorage 키
const CART_KEY = 'jikgumate_cart';

// 장바구니 불러오기
export function getCart(): CartItem[] {
  if (typeof window === 'undefined') return [];

  try {
    const stored = localStorage.getItem(CART_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('장바구니 불러오기 실패:', error);
    return [];
  }
}

// 장바구니 저장하기
export function saveCart(items: CartItem[]): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(CART_KEY, JSON.stringify(items));
  } catch (error) {
    console.error('장바구니 저장 실패:', error);
  }
}

// 장바구니에 상품 추가
export function addToCart(item: Omit<CartItem, 'quantity' | 'addedAt'>): void {
  const currentItems = getCart();
  const existingItem = currentItems.find(cartItem => cartItem.id === item.id);

  if (existingItem) {
    // 이미 있는 상품이면 수량 증가
    existingItem.quantity += 1;
  } else {
    // 새로운 상품 추가
    const newItem: CartItem = {
      ...item,
      quantity: 1,
      addedAt: new Date().toISOString(),
    };
    currentItems.push(newItem);
  }

  saveCart(currentItems);
}

// 장바구니에서 상품 제거
export function removeFromCart(id: number): void {
  const currentItems = getCart();
  const newItems = currentItems.filter(item => item.id !== id);
  saveCart(newItems);
}

// 장바구니 상품 수량 변경
export function updateCartItemQuantity(id: number, quantity: number): void {
  const currentItems = getCart();
  const item = currentItems.find(item => item.id === id);

  if (item) {
    if (quantity <= 0) {
      removeFromCart(id);
    } else {
      item.quantity = quantity;
      saveCart(currentItems);
    }
  }
}

// 장바구니 비우기
export function clearCart(): void {
  saveCart([]);
}

// 장바구니 총 가격 계산
export function getCartTotal(): number {
  const items = getCart();
  return items.reduce((total, item) => {
    const price = parseInt(item.price.replace(/[^\d]/g, '')) || 0;
    return total + (price * item.quantity);
  }, 0);
}

// 장바구니 총 상품 개수
export function getCartItemCount(): number {
  const items = getCart();
  return items.reduce((total, item) => total + item.quantity, 0);
}

// 상품이 장바구니에 있는지 확인
export function isInCart(id: number): boolean {
  const currentItems = getCart();
  return currentItems.some(item => item.id === id);
}
