"use client";

import { useState, useEffect } from "react";

// 장바구니 아이템 타입
interface CartItem {
  id: number;
  title: string;
  image: string;
  price: string;
  size: string;
  quantity: number;
  addedAt: string;
}

const CART_KEY = "jikgumate_cart";

function getCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(CART_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error("장바구니 불러오기 실패:", error);
    return [];
  }
}

function saveCart(items: CartItem[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(CART_KEY, JSON.stringify(items));
  } catch (error) {
    console.error("장바구니 저장 실패:", error);
  }
}

function removeFromCart(id: number, size: string): void {
  const currentItems = getCart();
  const newItems = currentItems.filter((item) => !(item.id === id && item.size === size));
  saveCart(newItems);
}

function updateCartItemQuantity(id: number, size: string, quantity: number): void {
  const currentItems = getCart();
  const item = currentItems.find((item) => item.id === id && item.size === size);

  if (item) {
    if (quantity <= 0) {
      removeFromCart(id, size);
    } else {
      item.quantity = quantity;
      saveCart(currentItems);
    }
  }
}

function clearCart(): void {
  saveCart([]);
}

function getCartTotal(): number {
  const items = getCart();
  return items.reduce((total, item) => {
    const price = parseInt(item.price.replace(/[^\d]/g, "")) || 0;
    return total + price * item.quantity;
  }, 0);
}

// 고유 키 생성 (id + size 조합)
function getCartItemKey(id: number, size: string): string {
  return `${id}-${size}`;
}

export default function CartPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  // 컴포넌트 마운트 시 장바구니 데이터 불러오기
  useEffect(() => {
    const items = getCart();
    setCartItems(items);
  }, []);

  const handleRemoveFromCart = (id: number, size: string) => {
    removeFromCart(id, size);
    setCartItems((prev) => prev.filter((item) => !(item.id === id && item.size === size)));
  };

  const handleUpdateQuantity = (id: number, size: string, newQuantity: number) => {
    updateCartItemQuantity(id, size, newQuantity);
    setCartItems((prev) =>
      prev.map((item) => (item.id === id && item.size === size ? { ...item, quantity: Math.max(1, newQuantity) } : item))
    );
  };

  const handleClearCart = () => {
    if (confirm("장바구니를 비우시겠습니까?")) {
      clearCart();
      setCartItems([]);
    }
  };

  const totalPrice = getCartTotal();

  // 빈 장바구니 상태
  if (cartItems.length === 0) {
    return (
      <div className="max-w-[1200px] mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">장바구니</h1>
        <div className="flex flex-col items-center justify-center py-20">
          <svg className="w-24 h-24 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.1 5H19M7 13l-1.1 5M7 13l2.5-2.5M17.5 10.5L19 12m-4.5-1.5l2.5 2.5M9 5h.01M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"
            />
          </svg>
          <p className="text-xl text-gray-600 mb-2">장바구니가 비어있습니다</p>
          <p className="text-gray-400">상품을 추가해보세요!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1200px] mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">장바구니</h1>
        </div>
        <button onClick={handleClearCart} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
          장바구니 비우기
        </button>
      </div>

      <div className="space-y-4">
        {cartItems.map((item) => (
          <div
            key={getCartItemKey(item.id, item.size)}
            className="border border-gray-200 rounded-lg p-6 bg-white flex items-center gap-6 hover:shadow-md transition-shadow"
          >
            {/* 상품 이미지 */}
            <div className="w-24 h-24 bg-gray-100 rounded flex items-center justify-center flex-shrink-0 overflow-hidden">
              <img
                src={item.image}
                alt={item.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = "/placeholder-image.png";
                }}
              />
            </div>

            {/* 상품 정보 */}
            <div className="flex-1">
              <h3 className="text-lg font-medium text-gray-900 mb-2">{item.title}</h3>
              <div className="flex items-center gap-4 text-gray-600 mb-2">
                <span className="bg-gray-100 px-2 py-1 rounded text-sm font-medium">사이즈: {item.size}</span>
                <span>단가: {item.price}</span>
              </div>

              {/* 수량 조절 */}
              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-600">수량:</label>
                <button
                  onClick={() => handleUpdateQuantity(item.id, item.size, item.quantity - 1)}
                  disabled={item.quantity <= 1}
                  className="w-8 h-8 rounded border border-gray-300 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  -
                </button>
                <span className="w-12 text-center">{item.quantity}</span>
                <button
                  onClick={() => handleUpdateQuantity(item.id, item.size, item.quantity + 1)}
                  className="w-8 h-8 rounded border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                >
                  +
                </button>
              </div>
            </div>

            {/* 가격 및 삭제 */}
            <div className="text-right">
              <div className="text-xl font-bold text-gray-900 mb-4">
                {(parseInt(item.price.replace(/[^\d]/g, "")) * item.quantity).toLocaleString()}원
              </div>
              <button
                onClick={() => handleRemoveFromCart(item.id, item.size)}
                className="text-red-500 hover:text-red-700 transition-colors px-3 py-1 rounded border border-red-200 hover:bg-red-50"
                aria-label="삭제"
              >
                삭제
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 border-t border-gray-200 pt-6">
        <div className="flex justify-end">
          <div className="w-full max-w-md space-y-4">
            <div className="flex justify-between text-lg text-gray-700">
              <span>총 상품 금액</span>
              <span>{totalPrice.toLocaleString()}원</span>
            </div>
            <div className="flex justify-between text-lg text-gray-700">
              <span>배송비</span>
              <span>3,000원</span>
            </div>
            <div className="flex justify-between text-2xl font-bold text-gray-900 pt-4 border-t border-gray-200">
              <span>총 결제 금액</span>
              <span>{(totalPrice + 3000).toLocaleString()}원</span>
            </div>
            <button className="w-full bg-blue-600 text-white py-4 rounded-lg hover:bg-blue-700 transition-colors font-medium text-lg mt-6">
              주문하기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
