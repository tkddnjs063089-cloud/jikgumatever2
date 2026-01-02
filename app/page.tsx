'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { fetchUserProfile } from './utils/api';

const WISHLIST_KEY = 'jikgumate_wishlist';

interface WishlistItem {
  id: number;
  title: string;
  image: string;
  price: string;
}

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

// 실제 홈 콘텐츠 컴포넌트 (useSearchParams 사용)
function HomeContent() {
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get('search') || '';
  const router = useRouter();

  // 관리자 권한 및 모달 상태
  const [isAdmin, setIsAdmin] = useState(false);
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [newProduct, setNewProduct] = useState({
    image: '',
    name: '',
    price: '',
    stock: ''
  });

  // 카테고리 데이터
  const allCategories = [
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
      title: '아기옷',
      image: '/babysclothes.jpg',
      price: '₩25,000',
    },
    {
      id: 4,
      title: '강아지',
      image: '/dog.jpg',
      price: '₩35,000',
    },
  ];

  // 검색어에 따라 카테고리 필터링
  const categories = searchQuery
    ? allCategories.filter(category =>
        category.title.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : allCategories;

  // 위시리스트 상태
  const [likedItems, setLikedItems] = useState<Set<number>>(new Set());

  // 컴포넌트 마운트 시 wishlist 상태 불러오기
  useEffect(() => {
    const currentWishlist = getWishlist();
    const likedIds = new Set(currentWishlist.map(item => item.id));
    setLikedItems(likedIds);
  }, []);

  // 관리자 권한 확인
  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        const token = localStorage.getItem('token');
        const email = localStorage.getItem('email');

        if (token && email) {
          const userData = await fetchUserProfile(email);
          setIsAdmin(userData.isAdmin === true || userData.isAdmin === 1);
        }
      } catch (error) {
        console.error('관리자 권한 확인 실패:', error);
        setIsAdmin(false);
      }
    };

    checkAdminStatus();
  }, []);

  // 상품 상세 페이지로 이동
  const goToProductDetail = (categoryId: number) => {
    router.push(`/product/${categoryId}`);
  };

  const toggleLike = (categoryId: number) => {
    const category = categories.find(cat => cat.id === categoryId);
    if (!category) return;

    const newLikedItems = new Set(likedItems);
    if (newLikedItems.has(categoryId)) {
      newLikedItems.delete(categoryId);
      removeFromWishlist(categoryId);
    } else {
      newLikedItems.add(categoryId);
      addToWishlist({
        id: category.id,
        title: category.title,
        image: category.image,
        price: category.price,
      });
    }
    setLikedItems(newLikedItems);
  };


  // 상품 추가 모달 열기
  const openAddProductModal = () => {
    setShowAddProductModal(true);
  };

  // 상품 추가 모달 닫기
  const closeAddProductModal = () => {
    setShowAddProductModal(false);
    setNewProduct({ image: '', name: '', price: '', stock: '' });
  };

  // 상품 추가 폼 제출
  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newProduct.name || !newProduct.price || !newProduct.stock) {
      alert('모든 필드를 입력해주세요.');
      return;
    }

    try {
      // TODO: 백엔드 API로 상품 추가 요청
      console.log('새 상품 추가:', newProduct);
      alert('상품이 성공적으로 추가되었습니다!');
      closeAddProductModal();
    } catch (error) {
      console.error('상품 추가 실패:', error);
      alert('상품 추가에 실패했습니다.');
    }
  };

  return (
    <>
      {/* 기존 메인페이지 내용 */}
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 py-8">
          

          {/* 검색어 표시 */}
          {searchQuery && (
            <div className="mb-6 text-center">
              <p className="text-lg text-gray-600">
                "<span className="font-medium text-gray-900">{searchQuery}</span>" 검색 결과
              </p>
            </div>
          )}

          {/* 카테고리 그리드 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((category) => (
              <div
                key={category.id}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => goToProductDetail(category.id)}
              >
                {/* 상품 이미지 */}
                <div className="relative">
                  <img
                    src={category.image}
                    alt={category.title}
                    className="w-full h-64 object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = '/placeholder-image.png';
                    }}
                  />

                  {/* 찜하기 버튼 */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleLike(category.id);
                    }}
                    className="absolute top-4 right-4 p-2 bg-white bg-opacity-80 rounded-full hover:bg-opacity-100 transition-all"
                  >
                    <div className="flex items-center gap-1">
                      <svg
                        className={`w-5 h-5 ${likedItems.has(category.id) ? 'text-red-500 fill-current' : 'text-gray-600'}`}
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
                      <span className={likedItems.has(category.id) ? 'text-red-500' : 'text-gray-600'}>
                        찜하기
                      </span>
                    </div>
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

        {/* 관리자용 상품 추가 버튼 */}
        {isAdmin && (
          <button
            onClick={openAddProductModal}
            className="fixed bottom-6 right-6 bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition-colors z-40"
            title="상품 추가"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              />
            </svg>
          </button>
      )}

        {/* 상품 추가 모달 */}
        {showAddProductModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">상품 추가</h2>

              <form onSubmit={handleAddProduct} className="space-y-4">
                {/* 상품 이미지 URL */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    상품 이미지 URL
                  </label>
                  <input
                    type="url"
                    value={newProduct.image}
                    onChange={(e) => setNewProduct({...newProduct, image: e.target.value})}
                    placeholder="https://example.com/image.jpg"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* 상품 이름 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    상품 이름 *
                  </label>
                  <input
                    type="text"
                    value={newProduct.name}
                    onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                    placeholder="상품 이름을 입력하세요"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                {/* 상품 가격 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    상품 가격 *
                  </label>
                  <input
                    type="text"
                    value={newProduct.price}
                    onChange={(e) => setNewProduct({...newProduct, price: e.target.value})}
                    placeholder="₩50,000"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                {/* 상품 재고 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    상품 재고 *
                  </label>
                  <input
                    type="number"
                    value={newProduct.stock}
                    onChange={(e) => setNewProduct({...newProduct, stock: e.target.value})}
                    placeholder="100"
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                {/* 버튼들 */}
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={closeAddProductModal}
                    className="flex-1 px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
                  >
                    취소
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    추가
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

// 메인 Home 컴포넌트 - Suspense로 감싸서 prerendering 방지
export default function Home() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    }>
      <HomeContent />
    </Suspense>
  );
}