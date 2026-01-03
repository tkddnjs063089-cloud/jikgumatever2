"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { getApiBaseUrl, fetchUserProfile } from "../utils/api";
import "../i18n/config";

// 백엔드 응답 타입
interface CartProduct {
  productId: number;
  originalUrl: string;
  nameKo: string;
  nameEn: string;
  category: string;
  priceUsd: string;
  imageUrl: string;
  createdAt: string;
}

interface CartItem {
  cartItemId: number;
  cartId: number;
  productId: number;
  quantity: number;
  createdAt: string;
  updatedAt: string;
  product: CartProduct;
}

interface CartData {
  cartId: number;
  userId: number;
  updatedAt: string;
  cartItems: CartItem[];
}

export default function CartPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const [cartData, setCartData] = useState<CartData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isOrdering, setIsOrdering] = useState(false);

  // 장바구니 데이터 가져오기
  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem("token");
      
      if (!token) {
        setError("로그인이 필요합니다.");
        setIsLoading(false);
        return;
      }

      const baseUrl = getApiBaseUrl();
      const response = await fetch(`${baseUrl}/carts`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          setError("로그인이 필요합니다.");
          router.push("/login");
          return;
        }
        throw new Error("장바구니를 불러오는데 실패했습니다.");
      }

      const data: CartData = await response.json();
      setCartData(data);
    } catch (err) {
      console.error("장바구니 불러오기 실패:", err);
      setError(err instanceof Error ? err.message : "장바구니를 불러오는데 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  // 수량 변경 (UI만, 나중에 API 연동)
  const handleUpdateQuantity = (cartItemId: number, newQuantity: number) => {
    if (!cartData) return;
    
    if (newQuantity < 1) {
      return;
    }

    setCartData({
      ...cartData,
      cartItems: cartData.cartItems.map((item) =>
        item.cartItemId === cartItemId ? { ...item, quantity: newQuantity } : item
      ),
    });
  };

  // 아이템 삭제
  const handleRemoveFromCart = async (cartItemId: number) => {
    if (!cartData) return;

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("로그인이 필요합니다.");
        router.push("/login");
        return;
      }

      const baseUrl = getApiBaseUrl();
      const response = await fetch(`${baseUrl}/carts/items/${cartItemId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          alert("로그인이 필요합니다.");
          router.push("/login");
          return;
        }
        throw new Error("장바구니에서 삭제하는데 실패했습니다.");
      }

      // 성공 시 장바구니 데이터 다시 불러오기
      await fetchCart();
    } catch (err) {
      console.error("장바구니 삭제 실패:", err);
      alert(err instanceof Error ? err.message : "장바구니에서 삭제하는데 실패했습니다.");
    }
  };

  // 가격 포맷팅
  const formatPrice = (priceUsd: string) => {
    const price = parseFloat(priceUsd);
    if (price === 0) return t("home.priceInquiry");
    return `₩${Math.round(price).toLocaleString()}`;
  };

  // 총 금액 계산
  const getTotalPrice = () => {
    if (!cartData || !cartData.cartItems) return 0;
    return cartData.cartItems.reduce((total, item) => {
      const price = parseFloat(item.product.priceUsd) || 0;
      return total + price * item.quantity;
    }, 0);
  };

  // 수량 동기화 - 모든 장바구니 아이템의 수량을 백엔드에 동기화
  const syncQuantities = async () => {
    if (!cartData || !cartData.cartItems || cartData.cartItems.length === 0) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("로그인이 필요합니다.");
      }

      const baseUrl = getApiBaseUrl();

      // 모든 장바구니 아이템의 수량을 백엔드에 업데이트
      const updatePromises = cartData.cartItems.map(async (item) => {
        const response = await fetch(`${baseUrl}/carts/items/${item.cartItemId}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            quantity: item.quantity,
          }),
        });

        if (!response.ok) {
          if (response.status === 401) {
            throw new Error("로그인이 필요합니다.");
          }
          throw new Error(`상품 수량 업데이트에 실패했습니다. (상품 ID: ${item.cartItemId})`);
        }

        return response.json();
      });

      // 모든 업데이트 요청이 완료될 때까지 대기
      await Promise.all(updatePromises);
    } catch (err) {
      console.error("수량 동기화 실패:", err);
      throw err;
    }
  };

  // UUID 생성 함수
  const generateUUID = () => {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === "x" ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  };

  // 주문 처리 - 백엔드에 주문 요청
  const createOrder = async () => {
    if (!cartData || !cartData.cartItems || cartData.cartItems.length === 0) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const email = localStorage.getItem("email");
      
      if (!token || !email) {
        throw new Error("로그인이 필요합니다.");
      }

      // 사용자 정보 가져오기
      const userInfo = await fetchUserProfile(email);
      
      if (!userInfo.name || !userInfo.defaultAddress || !userInfo.phone) {
        alert("배송 정보가 부족합니다. 마이페이지에서 주소와 연락처를 설정해주세요.");
        router.push("/mypage");
        return;
      }

      const baseUrl = getApiBaseUrl();

      // 주문 데이터 구성
      const orderData = {
        items: cartData.cartItems.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
        shippingInfo: {
          recipientName: userInfo.name,
          recipientAddress: userInfo.defaultAddress,
          recipientPhone: userInfo.phone,
          shippingCompany: "CJ대한통운",
          trackingNumber: "",
        },
      };

      // 주문 생성 API 호출
      const response = await fetch(`${baseUrl}/orders/from-cart`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(orderData),
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("로그인이 필요합니다.");
        }
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "주문 생성에 실패했습니다.");
      }

      return await response.json();
    } catch (err) {
      console.error("주문 생성 실패:", err);
      throw err;
    }
  };

  // 주문하기 - 수량 동기화 후 주문 처리
  const handleOrder = async () => {
    if (!cartData || !cartData.cartItems || cartData.cartItems.length === 0) {
      return;
    }

    setIsOrdering(true);
    setError("");

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("로그인이 필요합니다.");
        router.push("/login");
        return;
      }

      // 1. 먼저 수량 동기화
      await syncQuantities();

      // 2. 주문 처리
      await createOrder();

      // 성공 메시지 및 장바구니 새로고침
      alert("주문이 완료되었습니다!");
      await fetchCart(); // 장바구니 데이터 다시 불러오기
    } catch (err) {
      console.error("주문 처리 실패:", err);
      setError(err instanceof Error ? err.message : "주문 처리에 실패했습니다.");
    } finally {
      setIsOrdering(false);
    }
  };

  // 로딩 상태
  if (isLoading) {
    return (
      <div className="max-w-[1200px] mx-auto px-4 py-8">
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  // 에러 상태
  if (error) {
    return (
      <div className="max-w-[1200px] mx-auto px-4 py-8">
        <div className="text-center py-20">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => router.push("/login")}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            {t("header.login")}
          </button>
        </div>
      </div>
    );
  }

  // 빈 장바구니 상태
  if (!cartData || !cartData.cartItems || cartData.cartItems.length === 0) {
    return (
      <div className="max-w-[1200px] mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">{t("cart.title")}</h1>
        <div className="flex flex-col items-center justify-center py-20">
          <svg className="w-24 h-24 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.1 5H19M7 13l-1.1 5M7 13l2.5-2.5M17.5 10.5L19 12m-4.5-1.5l2.5 2.5M9 5h.01M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"
            />
          </svg>
          <p className="text-xl text-gray-600 mb-2">{t("cart.empty")}</p>
          <p className="text-gray-400">{t("cart.addProducts")}</p>
        </div>
      </div>
    );
  }

  const totalPrice = getTotalPrice();

  return (
    <div className="max-w-[1200px] mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">{t("cart.title")}</h1>
      </div>

      <div className="space-y-4">
        {cartData.cartItems.map((item) => {
          const itemPrice = parseFloat(item.product.priceUsd) || 0;
          const itemTotal = itemPrice * item.quantity;
          
          return (
            <div
              key={item.cartItemId}
              className="border border-gray-200 rounded-lg p-6 bg-white flex items-center gap-6 hover:shadow-md transition-shadow"
            >
              {/* 상품 이미지 */}
              <div className="w-24 h-24 bg-gray-100 rounded flex items-center justify-center flex-shrink-0 overflow-hidden">
                <img
                  src={item.product.imageUrl || "/placeholder-image.png"}
                  alt={item.product.nameKo}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = "/placeholder-image.png";
                  }}
                />
              </div>

              {/* 상품 정보 */}
              <div className="flex-1">
                <h3 className="text-lg font-medium text-gray-900 mb-2">{item.product.nameKo}</h3>
                <div className="flex items-center gap-4 text-gray-600 mb-2">
                  <span>{t("cart.unitPrice")}: {formatPrice(item.product.priceUsd)}</span>
                </div>

                {/* 수량 조절 */}
                <div className="flex items-center gap-2">
                  <label className="text-sm text-gray-600">{t("cart.quantity")}:</label>
                  <button
                    onClick={() => handleUpdateQuantity(item.cartItemId, item.quantity - 1)}
                    disabled={item.quantity <= 1}
                    className="w-8 h-8 rounded border border-gray-300 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    -
                  </button>
                  <span className="w-12 text-center">{item.quantity}</span>
                  <button
                    onClick={() => handleUpdateQuantity(item.cartItemId, item.quantity + 1)}
                    className="w-8 h-8 rounded border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* 가격 및 삭제 */}
              <div className="text-right flex flex-col items-end gap-4">
                <div className="text-xl font-bold text-gray-900">
                  {Math.round(itemTotal).toLocaleString()}원
                </div>
                <button
                  onClick={() => handleRemoveFromCart(item.cartItemId)}
                  className="text-gray-500 hover:text-red-600 transition-colors p-2 rounded-full hover:bg-red-50"
                  aria-label={t("cart.delete")}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-6 h-6"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-8 border-t border-gray-200 pt-6">
        <div className="flex justify-end">
          <div className="w-full max-w-md space-y-4">
            <div className="flex justify-between text-lg text-gray-700">
              <span>{t("cart.totalProductPrice")}</span>
              <span>{Math.round(totalPrice).toLocaleString()}원</span>
            </div>
            <div className="flex justify-between text-lg text-gray-700">
              <span>{t("cart.shippingFee")}</span>
              <span>3,000원</span>
            </div>
            <div className="flex justify-between text-2xl font-bold text-gray-900 pt-4 border-t border-gray-200">
              <span>{t("cart.totalPayment")}</span>
              <span>{(Math.round(totalPrice) + 3000).toLocaleString()}원</span>
            </div>
            <button
              onClick={handleOrder}
              disabled={isOrdering}
              className="w-full bg-blue-600 text-white py-4 rounded-lg hover:bg-blue-700 transition-colors font-medium text-lg mt-6 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isOrdering ? "주문 처리 중..." : t("cart.order")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
