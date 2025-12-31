'use client';

import { useState } from 'react';

export default function WishlistPage() {
  // 임시 찜 목록 데이터
  const [wishlistItems, setWishlistItems] = useState([
    { id: 1, name: '상품 1', price: 15000, image: '이미지' },
    { id: 2, name: '상품 2', price: 25000, image: '이미지' },
    { id: 3, name: '상품 3', price: 30000, image: '이미지' },
    { id: 4, name: '상품 4', price: 45000, image: '이미지' },
    { id: 5, name: '상품 5', price: 20000, image: '이미지' },
    { id: 6, name: '상품 6', price: 35000, image: '이미지' },
  ]);

  const handleRemoveFromWishlist = (id: number) => {
    setWishlistItems(prev => prev.filter(item => item.id !== id));
  };

  const handleAddToCart = (item: typeof wishlistItems[0]) => {
    // 장바구니 추가 로직 구현 예정
    console.log('장바구니 추가:', item);
    alert(`${item.name}이(가) 장바구니에 추가되었습니다.`);
  };

  if (wishlistItems.length === 0) {
    return (
      <div className="max-w-[1200px] mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">찜 목록</h1>
        <div className="flex flex-col items-center justify-center py-20">
          <svg
            className="w-24 h-24 text-gray-400 mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
            />
          </svg>
          <p className="text-xl text-gray-600 mb-2">찜한 상품이 없습니다</p>
          <p className="text-gray-400">마음에 드는 상품을 찜해보세요!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1200px] mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">찜 목록</h1>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {wishlistItems.map((item) => (
          <div
            key={item.id}
            className="border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow bg-white relative group"
          >
            {/* 찜 해제 버튼 */}
            <button
              onClick={() => handleRemoveFromWishlist(item.id)}
              className="absolute top-4 right-4 p-2 text-red-500 hover:text-red-700 transition-colors opacity-0 group-hover:opacity-100 z-10"
              aria-label="찜 해제"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="currentColor"
                viewBox="0 0 24 24"
                className="w-6 h-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
                />
              </svg>
            </button>

            {/* 상품 이미지 */}
            <div className="aspect-square bg-gray-100 rounded mb-4 flex items-center justify-center cursor-pointer">
              <span className="text-gray-400">{item.image}</span>
            </div>

            {/* 상품 정보 */}
            <h3 className="text-lg font-medium text-gray-900 mb-2">{item.name}</h3>
            <p className="text-xl font-bold text-gray-900 mb-4">
              {item.price.toLocaleString()}원
            </p>

            {/* 장바구니 추가 버튼 */}
            <button
              onClick={() => handleAddToCart(item)}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              장바구니 담기
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

