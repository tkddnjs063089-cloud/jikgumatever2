'use client';

import { useState } from 'react';
import Image from 'next/image';
import { analyzeProduct } from '../utils/api';

  interface ProductInfo {
  title: string;
  image: string;
  price: number;
  desc: string;
  url: string;
}

export default function PurchaseRequestPage() {
  const [productLink, setProductLink] = useState('');
  const [productInfo, setProductInfo] = useState<ProductInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProductLink(e.target.value);
    if (error) setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!productLink.trim()) {
      setError('상품 링크를 입력해주세요.');
      return;
    }

    setIsLoading(true);
    setError('');
    setProductInfo(null);

    try {
      console.log('상품 분석 시작:', productLink);

      const data = await analyzeProduct(productLink);
      console.log('상품 분석 결과:', data);

      setProductInfo(data);
    } catch (error) {
      console.error('상품 분석 오류:', error);

      let errorMessage = '상품 정보를 가져오는 중 오류가 발생했습니다.';

      if (error instanceof Error) {
        if (error.message.includes('인증')) {
          errorMessage = '인증이 필요합니다. 다시 로그인해주세요.';
        } else {
          errorMessage = error.message;
        }
      }

      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-[1200px] mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">구매 요청</h1>
      
      {/* 상품 링크 입력 폼 */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 mb-8">
        <form onSubmit={handleSubmit} className="space-y-4">
          <label
            htmlFor="productLink"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            상품 링크
          </label>
          <div className="flex gap-2">
            <input
              type="url"
              id="productLink"
              name="productLink"
              value={productLink}
              onChange={handleInputChange}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="https://www.shopee.kr/examplelink"
            />
            <button
              type="submit"
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium whitespace-nowrap"
            >
              확인
            </button>
          </div>
        </form>
      </div>

      {/* 에러 메시지 */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      {/* 로딩 상태 */}
      {isLoading && (
        <div className="bg-white border border-gray-200 rounded-lg p-12 mb-8 flex items-center justify-center">
          <div className="text-gray-600">상품 정보를 분석하는 중...</div>
        </div>
      )}

      {/* 상품 정보 표시 */}
      {productInfo && (
        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-8">
          <div className="flex gap-6">
            {/* 왼쪽: 상품 이미지 */}
            <div className="flex-shrink-0">
              <img
                src={productInfo.image}
                alt={productInfo.title}
                className="w-64 h-64 object-cover rounded-lg border border-gray-200"
                onError={(e) => {
                  e.currentTarget.src = '/placeholder-image.png'; // 이미지 로드 실패 시 대체 이미지
                }}
              />
            </div>

            {/* 오른쪽: 상품 정보 */}
            <div className="flex-1 flex flex-col gap-4">
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">상품명</h2>
                <p className="text-base text-gray-700">{productInfo.title}</p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">가격</h3>
                <p className="text-2xl font-bold text-blue-600">{productInfo.price.toLocaleString()}원</p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">상품 설명</h3>
                <p className="text-base text-gray-700 whitespace-pre-line">{productInfo.desc}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 인포그래픽 이미지 */}
      {!productInfo && !isLoading && (
        <div className="bg-white border border-gray-200 rounded-lg p-6 flex justify-center">
          <img src="/aigeranator.png" alt="구매 요청" className="w-1/2 h-auto object-contain" />
        </div>
      )}
    </div>
  );
}

