"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { analyzeProduct, getApiBaseUrl } from "../utils/api";

interface ProductInfo {
  title: string;
  image: string;
  price: number;
  url: string;
  productId: number;
}

interface UserInfo {
  name: string;
  defaultAddress: string;
  phone: string;
}

export default function PurchaseRequestPage() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [productLink, setProductLink] = useState("");
  const [productInfo, setProductInfo] = useState<ProductInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [isOrdering, setIsOrdering] = useState(false);
  const hasCheckedAuthRef = useRef(false);

  // 로그인 체크 및 사용자 정보 가져오기
  useEffect(() => {
    if (hasCheckedAuthRef.current) {
      return;
    }
    hasCheckedAuthRef.current = true;

    const checkAuth = async () => {
      try {
        const token = localStorage.getItem("token");
        const email = localStorage.getItem("email");

        if (!token || !email) {
          console.log("구매요청 페이지: 로그인이 필요합니다.");
          alert("로그인이 필요합니다.");
          router.push("/login");
          return;
        }

        console.log("구매요청 페이지: 로그인 확인됨");
        setIsLoggedIn(true);

        // 사용자 정보 가져오기
        const baseUrl = getApiBaseUrl();
        const response = await fetch(`${baseUrl}/users/${encodeURIComponent(email)}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const userData = await response.json();
          setUserInfo({
            name: userData.name || "",
            defaultAddress: userData.defaultAddress || "",
            phone: userData.phone || "",
          });
        }
      } catch (error) {
        console.error("로그인 체크 오류:", error);
        alert("로그인 상태 확인 중 오류가 발생했습니다.");
        router.push("/login");
      } finally {
        setIsAuthLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProductLink(e.target.value);
    if (error) setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!productLink.trim()) {
      setError("상품 링크를 입력해주세요.");
      return;
    }

    setIsLoading(true);
    setError("");
    setProductInfo(null);
    setQuantity(1); // 새 상품 검색 시 수량 초기화

    try {
      console.log("상품 분석 시작:", productLink);

      const data = await analyzeProduct(productLink);
      console.log("상품 분석 결과:", data);

      setProductInfo(data);
    } catch (error) {
      console.error("상품 분석 오류:", error);

      let errorMessage = "상품 정보를 가져오는 중 오류가 발생했습니다.";

      if (error instanceof Error) {
        if (error.message.includes("인증")) {
          errorMessage = "인증이 필요합니다. 다시 로그인해주세요.";
        } else {
          errorMessage = error.message;
        }
      }

      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // 수량 증가
  const handleIncreaseQuantity = () => {
    setQuantity((prev) => prev + 1);
  };

  // 수량 감소
  const handleDecreaseQuantity = () => {
    setQuantity((prev) => (prev > 1 ? prev - 1 : 1));
  };

  // 수량 직접 입력
  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    if (!isNaN(value) && value >= 1) {
      setQuantity(value);
    } else if (e.target.value === "") {
      setQuantity(1);
    }
  };

  // UUID 생성 함수
  const generateUUID = () => {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
      const r = (Math.random() * 16) | 0;
      const v = c === "x" ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  };

  // 구매 요청 처리
  const handlePurchaseRequest = async () => {
    if (!productInfo) {
      alert("상품 정보가 없습니다.");
      return;
    }

    if (!userInfo || !userInfo.name || !userInfo.defaultAddress || !userInfo.phone) {
      alert("배송 정보가 부족합니다. 마이페이지에서 주소와 연락처를 설정해주세요.");
      router.push("/mypage");
      return;
    }

    setIsOrdering(true);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("로그인이 필요합니다.");
        router.push("/login");
        return;
      }

      const baseUrl = getApiBaseUrl();
      const orderData = {
        items: [
          {
            productId: productInfo.productId,
            quantity: quantity,
          },
        ],
        shippingInfo: {
          recipientName: userInfo.name,
          recipientAddress: userInfo.defaultAddress,
          recipientPhone: userInfo.phone,
          shippingCompany: "CJ대한통운",
          trackingNumber: generateUUID(),
        },
      };

      console.log("주문 요청 데이터:", orderData);
      console.log("productInfo 전체:", productInfo);
      console.log("productId 값:", productInfo.productId, "타입:", typeof productInfo.productId);

      const response = await fetch(`${baseUrl}/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(orderData),
      });

      console.log("응답 상태:", response.status, response.statusText);
      const contentType = response.headers.get("content-type");

      if (!response.ok) {
        const responseText = await response.text();
        console.error("API Error Response:", responseText);
        console.error("Status:", response.status);

        // JSON 파싱 시도
        try {
          const errorData = JSON.parse(responseText);
          throw new Error(errorData.message || `주문 요청 실패 (${response.status})`);
        } catch {
          throw new Error(`주문 요청 실패: ${response.status} - ${responseText.substring(0, 100)}`);
        }
      }

      alert("구매 요청이 완료되었습니다!");
      // 초기화
      setProductInfo(null);
      setProductLink("");
      setQuantity(1);
    } catch (error) {
      console.error("주문 요청 오류:", error);
      alert(error instanceof Error ? error.message : "주문 요청에 실패했습니다.");
    } finally {
      setIsOrdering(false);
    }
  };

  // 인증 로딩 중
  if (isAuthLoading) {
    return (
      <div className="max-w-[1200px] mx-auto px-4 py-8">
        <div className="flex items-center justify-center py-20">
          <div className="text-gray-600">로딩 중...</div>
        </div>
      </div>
    );
  }

  // 로그인되지 않은 경우는 이미 리다이렉트됨
  if (!isLoggedIn) {
    return null;
  }

  return (
    <div className="max-w-[1200px] mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">구매 요청</h1>

      {/* 상품 링크 입력 폼 */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 mb-8">
        <form onSubmit={handleSubmit} className="space-y-4">
          <label htmlFor="productLink" className="block text-sm font-medium text-gray-700 mb-2">
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
            <button type="submit" className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium whitespace-nowrap">
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
                  e.currentTarget.src = "/placeholder-image.png";
                }}
              />
            </div>

            {/* 오른쪽: 상품 정보 */}
            <div className="flex-1 flex flex-col gap-4">
              {/* 상단: 수량 조절 */}
              <div className="flex justify-end">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-700 mr-2">수량</span>
                  <button
                    type="button"
                    onClick={handleDecreaseQuantity}
                    className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors text-gray-700 font-bold"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={handleQuantityChange}
                    className="w-16 h-8 text-center border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    onClick={handleIncreaseQuantity}
                    className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors text-gray-700 font-bold"
                  >
                    +
                  </button>
                </div>
              </div>

              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">상품명</h2>
                <p className="text-base text-gray-700">{productInfo.title}</p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">가격</h3>
                <p className="text-2xl font-bold text-blue-600">{productInfo.price.toLocaleString()}원</p>
                {quantity > 1 && (
                  <p className="text-sm text-gray-500 mt-1">
                    총 금액: {(productInfo.price * quantity).toLocaleString()}원 ({quantity}개)
                  </p>
                )}
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">상품 ID</h3>
                <p className="text-base text-gray-700">{productInfo.productId}</p>
              </div>

              {/* 구매 요청 버튼 */}
              <div className="mt-auto pt-4">
                <button
                  type="button"
                  onClick={handlePurchaseRequest}
                  disabled={isOrdering}
                  className="w-full py-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isOrdering ? "주문 처리 중..." : "구매 요청"}
                </button>
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
