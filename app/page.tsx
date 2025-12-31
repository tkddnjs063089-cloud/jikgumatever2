'use client';

import { useState, useEffect } from 'react';

// 임시: wishlist 함수들 직접 정의
interface WishlistItem {
  id: number;
  title: string;
  image: string;
  price: string;
}

const WISHLIST_KEY = 'jikgumate_wishlist';

function getWishlist(): WishlistItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(WISHLIST_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('찜 목록 불러오기 실패:', error);
    return [];
  }
}

function saveWishlist(items: WishlistItem[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(WISHLIST_KEY, JSON.stringify(items));
  } catch (error) {
    console.error('찜 목록 저장 실패:', error);
  }
}

function addToWishlist(item: WishlistItem): void {
  const currentItems = getWishlist();
  const exists = currentItems.some(existing => existing.id === item.id);
  if (!exists) {
    const newItems = [...currentItems, item];
    saveWishlist(newItems);
  }
}

function removeFromWishlist(id: number): void {
  const currentItems = getWishlist();
  const newItems = currentItems.filter(item => item.id !== id);
  saveWishlist(newItems);
}

function isInWishlist(id: number): boolean {
  const currentItems = getWishlist();
  return currentItems.some(item => item.id === id);
}

function toggleWishlistItem(item: WishlistItem): void {
  if (isInWishlist(item.id)) {
    removeFromWishlist(item.id);
  } else {
    addToWishlist(item);
  }
}

export default function Home() {
  // 카테고리 데이터
  const categories = [
    {
      id: 1,
      title: '남성정장',
      image: '/mansclothes.jpg',
      price: '₩89,000',
    },
    {
      id: 2,
      title: '여성복장',
      image: '/womansclothes.jpg',
      price: '₩65,000',
    },
    {
      id: 3,
      title: '애기옷',
      image: '/babysclothes.jpg',
      price: '₩25,000',
    },
    {
      id: 4,
      title: '강아지',
      image: '/dog.jpg',
      price: '₩45,000',
    },
  ];

  // 하트 상태 관리 (wishlist와 동기화)
  const [likedItems, setLikedItems] = useState<Set<number>>(new Set());

  // 컴포넌트 마운트 시 wishlist 상태 불러오기
  useEffect(() => {
    const currentWishlist = getWishlist();
    const likedIds = new Set(currentWishlist.map(item => item.id));
    setLikedItems(likedIds);
  }, []);

  const toggleLike = (categoryId: number) => {
    const category = categories.find(cat => cat.id === categoryId);
    if (!category) return;

    // wishlist에 추가/제거
    const wishlistItem: WishlistItem = {
      id: category.id,
      title: category.title,
      image: category.image,
      price: category.price,
    };

    toggleWishlistItem(wishlistItem);

    // UI 상태 업데이트
    setLikedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId);
      } else {
        newSet.add(categoryId);
      }
      return newSet;
    });
  };

  return (
    <div className="max-w-[1200px] mx-auto px-4 py-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {categories.map((category) => (
          <div
            key={category.id}
            className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow cursor-pointer bg-white"
          >
            <div className="relative">
              {/* 상품 이미지 */}
              <div className="aspect-square bg-gray-100">
                <img
                  src={category.image}
                  alt={category.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = '/placeholder-image.png';
                  }}
                />
              </div>

              {/* 하트 버튼 */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleLike(category.id);
                }}
                className="absolute top-3 right-3 p-2 bg-white bg-opacity-80 rounded-full hover:bg-opacity-100 transition-all"
              >
                <svg
                  className={`w-5 h-5 transition-colors ${
                    likedItems.has(category.id) ? 'text-red-500 fill-current' : 'text-gray-400'
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                  />
                </svg>
              </button>
            </div>

            {/* 카테고리 제목과 가격 */}
            <div className="p-4">
              <h3 className="text-lg font-medium text-gray-900 text-center mb-2">{category.title}</h3>
              <p className="text-xl font-bold text-gray-900 text-center">{category.price}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
