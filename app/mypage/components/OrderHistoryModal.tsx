"use client";

import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { getApiBaseUrl } from "@/app/utils/api";
import "../../i18n/config";

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

interface OrderHistoryModalProps {
  onClose: () => void;
}

export default function OrderHistoryModal({ onClose }: OrderHistoryModalProps) {
  const { t } = useTranslation();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchMyOrders();
  }, []);

  const fetchMyOrders = async () => {
    try {
      const baseUrl = getApiBaseUrl();
      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error(t("mypage.loginRequired"));
      }

      const response = await fetch(`${baseUrl}/orders/my`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error(t("mypage.authRequired"));
        }
        throw new Error(t("mypage.fetchOrdersFailed"));
      }

      const data = await response.json();
      setOrders(data);
    } catch (err) {
      console.error("fetchMyOrders error:", err);
      setError(err instanceof Error ? err.message : t("mypage.orderHistoryError"));
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case "PENDING":
        return "bg-yellow-100 text-yellow-800";
      case "SHIPPING":
        return "bg-blue-100 text-blue-800";
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
        return t("mypage.pending");
      case "SHIPPING":
        return t("mypage.shipping");
      case "DELIVERED":
        return t("mypage.delivered");
      case "CANCELLED":
        return t("mypage.cancelled");
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
    });
  };

  const formatPrice = (price: string) => {
    return `₩${parseFloat(price).toLocaleString()}`;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-lg w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
        {/* 헤더 */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold">{t("mypage.orderHistory")}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors" aria-label={t("mypage.close")}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* 주문 내역 리스트 */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : error ? (
            <div className="text-center py-12 text-red-600">{error}</div>
          ) : orders.length === 0 ? (
            <div className="text-center py-12 text-gray-500">{t("mypage.noOrders")}</div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <div key={order.orderId} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <p className="text-sm text-gray-500">{t("mypage.orderNumber")}</p>
                      <p className="text-lg font-medium">#{order.orderId}</p>
                      <p className="text-sm text-gray-500 mt-1">{formatDate(order.orderDate)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500 mb-1">{t("mypage.orderStatus")}</p>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>{getStatusText(order.status)}</span>
                    </div>
                  </div>

                  {/* 주문 상품 목록 */}
                  <div className="border-t border-gray-200 pt-4 mb-4">
                    {order.orderItems.map((item) => (
                      <div key={item.orderItemId} className="flex items-center gap-4 mb-3">
                        <img
                          src={item.product.imageUrl || "/placeholder-image.png"}
                          alt={item.product.nameKo}
                          className="w-16 h-16 object-cover rounded"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = "/placeholder-image.png";
                          }}
                        />
                        <div className="flex-1">
                          <p className="text-gray-900 font-medium">{item.product.nameKo}</p>
                          <p className="text-sm text-gray-500">{t("mypage.quantity")}: {item.quantity}</p>
                        </div>
                        <p className="text-gray-900 font-medium">{formatPrice((parseFloat(item.product.priceUsd) * item.quantity).toString())}</p>
                      </div>
                    ))}
                  </div>

                  {/* 배송 정보 */}
                  {order.shippingInfo && (
                    <div className="border-t border-gray-200 pt-4 mb-4">
                      <p className="text-sm text-gray-500 mb-2">{t("mypage.shippingInfo")}</p>
                      <p className="text-sm text-gray-700">
                        {order.shippingInfo.recipientName} | {order.shippingInfo.recipientPhone}
                      </p>
                      <p className="text-sm text-gray-700">{order.shippingInfo.recipientAddress}</p>
                      {order.shippingInfo.trackingNumber && (
                        <p className="text-sm text-blue-600 mt-1">
                          {t("mypage.trackingNumber")}: {order.shippingInfo.shippingCompany} {order.shippingInfo.trackingNumber}
                        </p>
                      )}
                    </div>
                  )}

                  <div className="flex justify-end pt-4 border-t border-gray-200">
                    <div className="text-right">
                      <p className="text-sm text-gray-500 mb-1">{t("mypage.totalPayment")}</p>
                      <p className="text-xl font-bold text-blue-600">{formatPrice(order.totalAmount)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
