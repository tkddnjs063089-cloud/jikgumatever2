'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';

// 상품 데이터 타입
interface Product {
  id: number;
  title: string;
  image: string;
  price: string;
}

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();

  const [product, setProduct] = useState<Product | null>(null);
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  // 상품 데이터
  const allProducts: Product[] = [
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

  // 사이즈 옵션
  const sizeOptions = ['S', 'M', 'L', 'XL', 'XXL'];

  useEffect(() => {
    const productId = params.id;
    if (productId && typeof productId === 'string') {
      const foundProduct = allProducts.find(p => p.id === parseInt(productId));
      if (foundProduct) {
        setProduct(foundProduct);
      }
    }
  }, [params.id]);

  // 수량 조절 함수들
  const increaseQuantity = () => {
    setQuantity(prev => prev + 1);
  };

  const decreaseQuantity = () => {
    setQuantity(prev => prev > 1 ? prev - 1 : 1);
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

    if (!selectedSize) {
      alert("사이즈를 선택해주세요.");
      return;
    }

    try {
      setIsLoading(true);

      // 로컬 스토리지에서 기존 장바구니 불러오기
      const existingCart = JSON.parse(localStorage.getItem("jikgumate_cart") || "[]");

      // 같은 상품 ID + 같은 사이즈가 있는지 확인
      const existingItemIndex = existingCart.findIndex(
        (item: { id: number; size: string }) => item.id === product.id && item.size === selectedSize
      );

      if (existingItemIndex !== -1) {
        // 이미 있으면 수량만 증가
        existingCart[existingItemIndex].quantity += quantity;
      } else {
        // 없으면 새로 추가
        const cartItem = {
          id: product.id,
          title: product.title,
          image: product.image,
          price: product.price,
          size: selectedSize,
          quantity: quantity,
          addedAt: new Date().toISOString(),
        };
        existingCart.push(cartItem);
      }

      // 로컬 스토리지에 저장
      localStorage.setItem("jikgumate_cart", JSON.stringify(existingCart));

      alert(`${product.title} (${selectedSize}) ${quantity}개가 장바구니에 추가되었습니다!`);
    } catch (error) {
      console.error("장바구니 추가 실패:", error);
      alert("장바구니 추가에 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  // 구매하기 함수
  const handlePurchase = () => {
    if (!product) return;

    if (!selectedSize) {
      alert('사이즈를 선택해주세요.');
      return;
    }

    // 구매 페이지로 이동 (구매요청 페이지로 이동)
    router.push('/purchase-request');
  };

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
                  src={product.image}
                  alt={product.title}
                  className="w-full max-w-md h-auto object-cover rounded-lg shadow-md"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = '/placeholder-image.png';
                  }}
                />
              </div>
            </div>

            {/* 오른쪽: 상품 정보 */}
            <div className="flex flex-col space-y-6">

              {/* 상품명 */}
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.title}</h1>
                <div className="w-16 h-1 bg-blue-600 rounded"></div>
              </div>

              {/* 가격 */}
              <div>
                <span className="text-3xl font-bold text-blue-600">{product.price}</span>
              </div>

              {/* 사이즈 선택 */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">사이즈 선택</h3>
                <div className="grid grid-cols-5 gap-2">
                  {sizeOptions.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`py-2 px-4 border rounded-lg font-medium transition-colors ${
                        selectedSize === size
                          ? 'border-blue-600 bg-blue-600 text-white'
                          : 'border-gray-300 hover:border-gray-400 text-gray-700'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
                {selectedSize && (
                  <p className="text-sm text-green-600 mt-2">
                    선택된 사이즈: <span className="font-medium">{selectedSize}</span>
                  </p>
                )}
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
                  <button
                    onClick={increaseQuantity}
                    className="w-10 h-10 bg-gray-200 hover:bg-gray-300 rounded-lg flex items-center justify-center font-bold text-gray-700 transition-colors"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* 버튼들 */}
              <div className="space-y-3 pt-6">
                {/* 장바구니 버튼 */}
                <button
                  onClick={handleAddToCart}
                  disabled={isLoading || !selectedSize}
                  className="w-full py-4 px-6 bg-blue-600 text-white rounded-lg font-semibold text-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {isLoading ? '처리 중...' : '장바구니 담기'}
                </button>

                {/* 구매하기 버튼 */}
                <button
                  onClick={handlePurchase}
                  disabled={!selectedSize}
                  className="w-full py-4 px-6 bg-red-600 text-white rounded-lg font-semibold text-lg hover:bg-red-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  구매하기
                </button>
              </div>

              {/* 상품 설명 */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">상품 설명</h3>
                <div className="text-gray-600 space-y-2">
                  <p>• 고품질 소재 사용</p>
                  <p>• 편안한 착용감</p>
                  <p>• 세탁기 사용 가능</p>
                  <p>• 다양한 사이즈 제공</p>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}