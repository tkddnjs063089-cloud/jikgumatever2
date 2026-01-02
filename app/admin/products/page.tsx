"use client";

import { useState, useEffect } from "react";
import { getApiBaseUrl } from "@/app/utils/api";

interface Product {
  productId: number;
  imageUrl: string;
  price: number;
  ko_name: string;
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const baseUrl = getApiBaseUrl();
      const response = await fetch(`${baseUrl}/products/all`);

      if (!response.ok) {
        throw new Error("상품 목록을 가져오는데 실패했습니다.");
      }

      const data = await response.json();
      setProducts(data);
    } catch (err) {
      console.error("상품 로딩 실패:", err);
      setError(err instanceof Error ? err.message : "상품을 불러오는데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = async (productId: number) => {
    if (!confirm("정말 이 상품을 삭제하시겠습니까?")) return;

    try {
      const baseUrl = getApiBaseUrl();
      const token = localStorage.getItem("token");

      if (!token) {
        alert("로그인이 필요합니다.");
        return;
      }

      const response = await fetch(`${baseUrl}/products/${productId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("상품 삭제에 실패했습니다.");
      }

      // 목록 새로고침
      await fetchProducts();
      alert("상품이 삭제되었습니다.");
    } catch (err) {
      alert(err instanceof Error ? err.message : "상품 삭제에 실패했습니다.");
    }
  };

  // 가격 포맷팅 함수
  const formatPrice = (price: number) => {
    if (price === 0) return "가격 문의";
    return `₩${price.toLocaleString()}`;
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
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">상품 관리</h1>
            <div className="text-sm text-gray-500">총 {products.length}개 상품</div>
          </div>

          {products.length === 0 ? (
            <div className="text-center py-12 text-gray-500">등록된 상품이 없습니다.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white border border-gray-300">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">이미지</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">상품명</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">가격</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">관리</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {products.map((product) => (
                    <tr key={product.productId} className="hover:bg-gray-50">
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">{product.productId}</td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <img
                          src={product.imageUrl || "/placeholder-image.png"}
                          alt={product.ko_name}
                          className="w-16 h-16 object-cover rounded"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = "/placeholder-image.png";
                          }}
                        />
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-900">
                        <div className="max-w-xs truncate" title={product.ko_name}>
                          {product.ko_name}
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">{formatPrice(product.price)}</td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                        <button onClick={() => handleDeleteProduct(product.productId)} className="text-red-600 hover:text-red-900">
                          삭제
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
