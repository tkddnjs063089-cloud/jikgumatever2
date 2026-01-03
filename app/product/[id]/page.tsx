"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { getApiBaseUrl } from "@/app/utils/api";

// 상품 데이터 타입
interface Product {
  productId: number;
  imageUrl: string;
  price: number;
  ko_name: string;
}

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();

  const [product, setProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [error, setError] = useState("");

  // 상품 데이터 가져오기
  useEffect(() => {
    const fetchProduct = async () => {
      const productId = params.id;
      if (!productId || typeof productId !== "string") {
        setError("잘못된 상품 ID입니다.");
        setIsLoading(false);
        return;
      }

      try {
        const baseUrl = getApiBaseUrl();
        const response = await fetch(`${baseUrl}/products/${productId}`);

        if (!response.ok) {
          if (response.status === 404) {
            throw new Error("상품을 찾을 수 없습니다.");
          }
          throw new Error("상품 정보를 가져오는데 실패했습니다.");
        }

        const data = await response.json();
        setProduct(data);
      } catch (err) {
        console.error("상품 로딩 실패:", err);
        setError(err instanceof Error ? err.message : "상품을 불러오는데 실패했습니다.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProduct();
  }, [params.id]);

  // 가격 포맷팅 함수
  const formatPrice = (price: number) => {
    if (price === 0) return "가격 문의";
    return `₩${price.toLocaleString()}`;
  };

  // 수량 조절 함수들
  const increaseQuantity = () => {
    setQuantity((prev) => prev + 1);
  };

  const decreaseQuantity = () => {
    setQuantity((prev) => (prev > 1 ? prev - 1 : 1));
  };

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value >= 1) {
      setQuantity(value);
    }
  };

  // 장바구니 추가 함수
  const handleAddToCart = async () => {
    if (!product) return;

    try {
      setIsAddingToCart(true);

      // 토큰 확인
      const token = localStorage.getItem("token");
      if (!token) {
        alert("장바구니를 사용하려면 로그인이 필요합니다.");
        router.push("/login");
        return;
      }

      const baseUrl = getApiBaseUrl();
      
      // 백엔드 API에 장바구니 아이템 추가
      const response = await fetch(`${baseUrl}/carts/items`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          productId: product.productId,
          quantity: quantity,
        }),
      });

      if (!response.ok) {
        if (response.status === 401) {
          alert("로그인이 필요합니다.");
          router.push("/login");
          return;
        }
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "장바구니 추가에 실패했습니다.");
      }

      alert(`${product.ko_name} ${quantity}개가 장바구니에 추가되었습니다!`);
    } catch (error) {
      console.error("장바구니 추가 실패:", error);
      alert(error instanceof Error ? error.message : "장바구니 추가에 실패했습니다.");
    } finally {
      setIsAddingToCart(false);
    }
  };

  // 구매하기 함수
  const handlePurchase = () => {
    if (!product) return;

    // 구매 페이지로 이동 (구매요청 페이지로 이동)
    router.push("/purchase-request");
  };

  // 로딩 상태
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // 에러 상태
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button onClick={() => router.back()} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            뒤로 가기
          </button>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">상품을 찾을 수 없습니다.</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-8">
            {/* 왼쪽: 상품 이미지 */}
            <div className="flex justify-center">
              <div className="relative">
                <img
                  src={product.imageUrl || "/placeholder-image.png"}
                  alt={product.ko_name}
                  className="w-full max-w-md h-auto object-cover rounded-lg shadow-md"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = "/placeholder-image.png";
                  }}
                />
              </div>
            </div>

            {/* 오른쪽: 상품 정보 */}
            <div className="flex flex-col space-y-6">
              {/* 상품명 */}
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">{product.ko_name}</h1>
                <div className="w-16 h-1 bg-blue-600 rounded"></div>
              </div>

              {/* 가격 */}
              <div>
                <span className="text-3xl font-bold text-blue-600">{formatPrice(product.price)}</span>
              </div>

              {/* 수량 선택 */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">수량</h3>
                <div className="flex items-center gap-3">
                  <button
                    onClick={decreaseQuantity}
                    className="w-10 h-10 bg-gray-200 hover:bg-gray-300 rounded-lg flex items-center justify-center font-bold text-gray-700 transition-colors"
                    disabled={quantity <= 1}
                  >
                    -
                  </button>
                  <input
                    type="number"
                    value={quantity}
                    onChange={handleQuantityChange}
                    min="1"
                    className="w-20 h-10 text-center border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button onClick={increaseQuantity} className="w-10 h-10 bg-gray-200 hover:bg-gray-300 rounded-lg flex items-center justify-center font-bold text-gray-700 transition-colors">
                    +
                  </button>
                </div>
              </div>

              {/* 총 금액 */}
              {product.price > 0 && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">총 상품 금액</span>
                    <span className="text-2xl font-bold text-blue-600">{formatPrice(product.price * quantity)}</span>
                  </div>
                </div>
              )}

              {/* 버튼들 */}
              <div className="space-y-3 pt-6">
                {/* 장바구니 버튼 */}
                <button
                  onClick={handleAddToCart}
                  disabled={isAddingToCart}
                  className="w-full py-4 px-6 bg-blue-600 text-white rounded-lg font-semibold text-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {isAddingToCart ? "처리 중..." : "장바구니 담기"}
                </button>

                {/* 구매하기 버튼 */}
                <button onClick={handlePurchase} className="w-full py-4 px-6 bg-red-600 text-white rounded-lg font-semibold text-lg hover:bg-red-700 transition-colors">
                  구매하기
                </button>
              </div>

              {/* 상품 ID */}
              <div className="border-t pt-6">
                <p className="text-sm text-gray-500">상품 ID: {product.productId}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
