"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { fetchUserProfile, getApiBaseUrl } from "./utils/api";

const WISHLIST_KEY = "jikgumate_wishlist";

interface WishlistItem {
  id: number;
  title: string;
  image: string;
  price: string;
}

interface Product {
  productId: number;
  imageUrl: string;
  price: number;
  ko_name: string;
}

function getWishlist(): WishlistItem[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(WISHLIST_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error("찜 목록 불러오기 실패:", error);
    return [];
  }
}

function saveWishlist(items: WishlistItem[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(WISHLIST_KEY, JSON.stringify(items));
  } catch (error) {
    console.error("찜 목록 저장 실패:", error);
  }
}

function addToWishlist(item: WishlistItem): void {
  const currentItems = getWishlist();
  const exists = currentItems.some((existing) => existing.id === item.id);
  if (!exists) {
    const newItems = [...currentItems, item];
    saveWishlist(newItems);
  }
}

function removeFromWishlist(id: number): void {
  const currentItems = getWishlist();
  const newItems = currentItems.filter((item) => item.id !== id);
  saveWishlist(newItems);
}

// 실제 홈 콘텐츠 컴포넌트 (useSearchParams 사용)
function HomeContent() {
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get("search") || "";
  const router = useRouter();

  // 관리자 권한 및 모달 상태
  const [isAdmin, setIsAdmin] = useState(false);
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [newProduct, setNewProduct] = useState({
    image: "",
    name: "",
    price: "",
    stock: "",
  });
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // 상품 데이터 상태
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  // 검색어에 따라 상품 필터링
  const filteredProducts = searchQuery ? products.filter((product) => product.ko_name.toLowerCase().includes(searchQuery.toLowerCase())) : products;

  // 위시리스트 상태
  const [likedItems, setLikedItems] = useState<Set<number>>(new Set());

  // 컴포넌트 마운트 시 wishlist 상태 불러오기
  useEffect(() => {
    const currentWishlist = getWishlist();
    const likedIds = new Set(currentWishlist.map((item) => item.id));
    setLikedItems(likedIds);
  }, []);

  // 상품 데이터 가져오기
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const baseUrl = getApiBaseUrl();
        const response = await fetch(`${baseUrl}/products/all`);

        if (!response.ok) {
          throw new Error("상품 목록을 가져오는데 실패했습니다.");
        }

        const data = await response.json();
        setProducts(data);
      } catch (error) {
        console.error("상품 로딩 실패:", error);
        setLoadError(error instanceof Error ? error.message : "상품을 불러오는데 실패했습니다.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // 관리자 권한 확인
  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        const token = localStorage.getItem("token");
        const email = localStorage.getItem("email");

        if (token && email) {
          const userData = await fetchUserProfile(email);
          setIsAdmin(userData.isAdmin === true || userData.isAdmin === 1);
        }
      } catch (error) {
        console.error("관리자 권한 확인 실패:", error);
        setIsAdmin(false);
      }
    };

    checkAdminStatus();
  }, []);

  // 상품 상세 페이지로 이동
  const goToProductDetail = (productId: number) => {
    router.push(`/product/${productId}`);
  };

  // 가격 포맷팅 함수
  const formatPrice = (price: number) => {
    if (price === 0) return "가격 문의";
    return `₩${price.toLocaleString()}`;
  };

  const toggleLike = (productId: number) => {
    const product = products.find((p) => p.productId === productId);
    if (!product) return;

    const newLikedItems = new Set(likedItems);
    if (newLikedItems.has(productId)) {
      newLikedItems.delete(productId);
      removeFromWishlist(productId);
    } else {
      newLikedItems.add(productId);
      addToWishlist({
        id: product.productId,
        title: product.ko_name,
        image: product.imageUrl,
        price: formatPrice(product.price),
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
    setNewProduct({ image: "", name: "", price: "", stock: "" });
    setImagePreview(null);
  };

  // 이미지 파일 선택 핸들러
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // 파일 크기 체크 (5MB 제한)
      if (file.size > 5 * 1024 * 1024) {
        alert("이미지 크기는 5MB 이하로 선택해주세요.");
        return;
      }

      // 이미지 미리보기 생성
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setImagePreview(result);
        setNewProduct((prev) => ({ ...prev, image: result }));
      };
      reader.readAsDataURL(file);
    }
  };

  // 상품 추가 폼 제출
  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newProduct.name || !newProduct.price || !newProduct.stock) {
      alert("모든 필드를 입력해주세요.");
      return;
    }

    try {
      // TODO: 백엔드 API로 상품 추가 요청
      console.log("새 상품 추가:", newProduct);
      alert("상품이 성공적으로 추가되었습니다!");
      closeAddProductModal();
    } catch (error) {
      console.error("상품 추가 실패:", error);
      alert("상품 추가에 실패했습니다.");
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

          {/* 로딩 상태 */}
          {isLoading && (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          )}

          {/* 에러 상태 */}
          {loadError && <div className="text-center py-12 text-red-600">{loadError}</div>}

          {/* 상품 그리드 */}
          {!isLoading && !loadError && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map((product) => (
                <div
                  key={product.productId}
                  className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => goToProductDetail(product.productId)}
                >
                  {/* 상품 이미지 */}
                  <div className="relative">
                    <img
                      src={product.imageUrl || "/placeholder-image.png"}
                      alt={product.ko_name}
                      className="w-full h-64 object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = "/placeholder-image.png";
                      }}
                    />

                    {/* 찜하기 버튼 */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleLike(product.productId);
                      }}
                      className="absolute top-4 right-4 p-2 bg-white bg-opacity-80 rounded-full hover:bg-opacity-100 transition-all"
                    >
                      <div className="flex items-center gap-1">
                        <svg className={`w-5 h-5 ${likedItems.has(product.productId) ? "text-red-500 fill-current" : "text-gray-600"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                          />
                        </svg>
                        <span className={likedItems.has(product.productId) ? "text-red-500" : "text-gray-600"}>찜하기</span>
                      </div>
                    </button>
                  </div>

                  {/* 상품 제목과 가격 */}
                  <div className="p-4">
                    <h3 className="text-sm font-medium text-gray-900 line-clamp-2 mb-2" title={product.ko_name}>
                      {product.ko_name}
                    </h3>
                    <p className="text-lg font-bold text-blue-600">{formatPrice(product.price)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* 검색 결과 없음 */}
          {!isLoading && !loadError && filteredProducts.length === 0 && <div className="text-center py-12 text-gray-500">{searchQuery ? "검색 결과가 없습니다." : "등록된 상품이 없습니다."}</div>}
        </div>

        {/* 관리자용 상품 추가 버튼 */}
        {isAdmin && (
          <button onClick={openAddProductModal} className="fixed bottom-6 right-6 bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition-colors z-40" title="상품 추가">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </button>
        )}

        {/* 상품 추가 모달 */}
        {showAddProductModal && (
          <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4 shadow-xl">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">상품 추가</h2>

              <form onSubmit={handleAddProduct} className="space-y-4">
                {/* 상품 이미지 선택 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">상품 이미지</label>
                  <div className="flex flex-col items-center gap-3">
                    {/* 이미지 미리보기 */}
                    {imagePreview ? (
                      <div className="relative w-full h-40 border border-gray-300 rounded-md overflow-hidden">
                        <img src={imagePreview} alt="미리보기" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => {
                            setImagePreview(null);
                            setNewProduct((prev) => ({ ...prev, image: "" }));
                          }}
                          className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ) : (
                      <label className="w-full h-40 border-2 border-dashed border-gray-300 rounded-md flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-colors">
                        <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                        <span className="mt-2 text-sm text-gray-500">클릭하여 이미지 선택</span>
                        <input type="file" accept="image/*" onChange={handleImageSelect} className="hidden" />
                      </label>
                    )}
                  </div>
                </div>

                {/* 상품 이름 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">상품 이름 *</label>
                  <input
                    type="text"
                    value={newProduct.name}
                    onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                    placeholder="상품 이름을 입력하세요"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                {/* 상품 가격 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">상품 가격 *</label>
                  <input
                    type="text"
                    value={newProduct.price}
                    onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                    placeholder="₩50,000"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                {/* 상품 재고 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">상품 재고 *</label>
                  <input
                    type="number"
                    value={newProduct.stock}
                    onChange={(e) => setNewProduct({ ...newProduct, stock: e.target.value })}
                    placeholder="100"
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                {/* 버튼들 */}
                <div className="flex gap-3 pt-4">
                  <button type="button" onClick={closeAddProductModal} className="flex-1 px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors">
                    취소
                  </button>
                  <button type="submit" className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
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
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      }
    >
      <HomeContent />
    </Suspense>
  );
}
