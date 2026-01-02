"use client";

import { useState, useEffect } from "react";
import { getApiBaseUrl } from "@/app/utils/api";

interface Product {
  productId: number;
  originalUrl: string;
  nameKo: string;
  nameEn: string;
  category: string;
  priceUsd: string;
  imageUrl: string;
  createdAt: string;
}

interface OrderItem {
  orderItemId: number;
  orderId: number;
  productId: number;
  quantity: number;
  product: Product;
}

interface ShippingInfo {
  shippingId: number;
  orderId: number;
  trackingNumber: string | null;
  shippingCompany: string | null;
  recipientName: string;
  recipientAddress: string;
  recipientPhone: string;
}

interface Order {
  orderId: number;
  userId: number;
  totalAmount: string;
  status: string;
  orderDate: string;
  orderItems: OrderItem[];
  shippingInfo: ShippingInfo;
}

export default function AdminOrderItemsPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusUpdates, setStatusUpdates] = useState<{ [key: number]: string }>({});
  const [savingStatus, setSavingStatus] = useState<{ [key: number]: boolean }>({});

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const baseUrl = getApiBaseUrl();

      // 토큰 확인
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("로그인이 필요합니다.");
      }

      const response = await fetch(`${baseUrl}/orders`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      // 응답이 JSON인지 확인
      const contentType = response.headers.get("content-type");

      if (!response.ok) {
        // 에러 응답 처리
        if (contentType && contentType.includes("application/json")) {
          const errorData = await response.json();
          throw new Error(errorData.message || "주문 목록을 가져오는데 실패했습니다.");
        } else {
          const errorText = await response.text();
          console.error("API Error:", errorText);
          if (response.status === 401) {
            throw new Error("인증이 필요합니다. 다시 로그인해주세요.");
          }
          if (response.status === 403) {
            throw new Error("관리자 권한이 필요합니다.");
          }
          throw new Error("주문 목록을 가져오는데 실패했습니다.");
        }
      }

      // 성공 응답이 JSON인지 확인
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("서버에서 잘못된 응답을 받았습니다.");
      }

      const data = await response.json();
      setOrders(data);

      // 초기 상태 설정
      const initialStatuses: { [key: number]: string } = {};
      data.forEach((order: Order) => {
        initialStatuses[order.orderId] = order.status;
      });
      setStatusUpdates(initialStatuses);
    } catch (err) {
      console.error("fetchOrders error:", err);
      setError(err instanceof Error ? err.message : "주문 목록을 불러오는데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = (orderId: number, newStatus: string) => {
    setStatusUpdates((prev) => ({
      ...prev,
      [orderId]: newStatus,
    }));
  };

  const handleSaveStatus = async (orderId: number) => {
    const newStatus = statusUpdates[orderId];
    if (!newStatus) return;

    setSavingStatus((prev) => ({ ...prev, [orderId]: true }));

    try {
      const baseUrl = getApiBaseUrl();

      // 토큰 확인
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("로그인이 필요합니다.");
      }

      const response = await fetch(`${baseUrl}/orders/${orderId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          const errorData = await response.json();
          throw new Error(errorData.message || "상태 업데이트에 실패했습니다.");
        } else {
          const errorText = await response.text();
          console.error("API Error:", errorText);
          throw new Error("상태 업데이트에 실패했습니다.");
        }
      }

      // 주문 목록 새로고침
      await fetchOrders();
      alert("상태가 업데이트되었습니다.");
    } catch (err) {
      alert(err instanceof Error ? err.message : "상태 업데이트에 실패했습니다.");
    } finally {
      setSavingStatus((prev) => ({ ...prev, [orderId]: false }));
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case "PENDING":
        return "bg-yellow-100 text-yellow-800";
      case "PROCESSING":
        return "bg-blue-100 text-blue-800";
      case "SHIPPED":
        return "bg-purple-100 text-purple-800";
      case "DELIVERED":
        return "bg-green-100 text-green-800";
      case "CANCELLED":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: string) => {
    switch (status.toUpperCase()) {
      case "PENDING":
        return "대기중";
      case "PROCESSING":
        return "처리중";
      case "SHIPPED":
        return "배송중";
      case "DELIVERED":
        return "배송완료";
      case "CANCELLED":
        return "취소됨";
      default:
        return status;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatPrice = (price: string) => {
    return `₩${parseFloat(price).toLocaleString()}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-600">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">주문 관리</h1>

          <div className="space-y-6">
            {orders.map((order) => (
              <div key={order.orderId} className="border border-gray-200 rounded-lg p-6">
                {/* 주문 헤더 */}
                <div className="flex flex-wrap justify-between items-start mb-4 pb-4 border-b border-gray-200">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">주문번호: #{order.orderId}</h2>
                    <p className="text-sm text-gray-500">주문일: {formatDate(order.orderDate)}</p>
                  </div>
                  <div className="flex items-center gap-3 mt-2 sm:mt-0">
                    <span className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(order.status)}`}>{getStatusText(order.status)}</span>
                    <select
                      value={statusUpdates[order.orderId] || order.status}
                      onChange={(e) => handleStatusChange(order.orderId, e.target.value)}
                      className="px-3 py-1 border border-gray-300 rounded text-sm"
                    >
                      <option value="PENDING">대기중</option>
                      <option value="PROCESSING">처리중</option>
                      <option value="SHIPPED">배송중</option>
                      <option value="DELIVERED">배송완료</option>
                      <option value="CANCELLED">취소</option>
                    </select>
                    <button
                      onClick={() => handleSaveStatus(order.orderId)}
                      disabled={savingStatus[order.orderId]}
                      className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 disabled:opacity-50"
                    >
                      {savingStatus[order.orderId] ? "저장중..." : "저장"}
                    </button>
                  </div>
                </div>

                {/* 주문 상품 목록 */}
                <div className="mb-4">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">주문 상품</h3>
                  <div className="space-y-3">
                    {order.orderItems.map((item) => (
                      <div key={item.orderItemId} className="flex items-center gap-4 bg-gray-50 p-3 rounded">
                        <img
                          src={item.product.imageUrl || "/placeholder-image.png"}
                          alt={item.product.nameKo}
                          className="w-16 h-16 object-cover rounded"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = "/placeholder-image.png";
                          }}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{item.product.nameKo}</p>
                          <p className="text-sm text-gray-500">
                            수량: {item.quantity}개 | 단가: {formatPrice(item.product.priceUsd)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold text-gray-900">{formatPrice((parseFloat(item.product.priceUsd) * item.quantity).toString())}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 배송 정보 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-2">배송 정보</h3>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p>
                        <span className="font-medium">수령인:</span> {order.shippingInfo.recipientName}
                      </p>
                      <p>
                        <span className="font-medium">연락처:</span> {order.shippingInfo.recipientPhone}
                      </p>
                      <p>
                        <span className="font-medium">주소:</span> {order.shippingInfo.recipientAddress}
                      </p>
                      {order.shippingInfo.shippingCompany && (
                        <p>
                          <span className="font-medium">택배사:</span> {order.shippingInfo.shippingCompany}
                        </p>
                      )}
                      {order.shippingInfo.trackingNumber && (
                        <p>
                          <span className="font-medium">운송장:</span> {order.shippingInfo.trackingNumber}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <h3 className="text-sm font-medium text-gray-700 mb-2">총 결제금액</h3>
                    <p className="text-2xl font-bold text-blue-600">{formatPrice(order.totalAmount)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {orders.length === 0 && <div className="text-center py-12 text-gray-500">주문 내역이 없습니다.</div>}
        </div>
      </div>
    </div>
  );
}
