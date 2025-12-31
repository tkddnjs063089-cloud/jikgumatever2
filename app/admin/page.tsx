'use client';

import Link from 'next/link';

export default function AdminPage() {

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-6xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">관리자 페이지</h1>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* 관리자 기능들 - 추후 구현 */}
            <Link
              href="/admin/users"
              className="bg-blue-50 p-6 rounded-lg border border-blue-200 hover:bg-blue-100 transition-colors block"
            >
              <h3 className="text-lg font-semibold text-blue-900 mb-2">사용자 관리</h3>
              <p className="text-blue-700">등록된 사용자들을 관리합니다.</p>
            </Link>

            <Link
              href="/admin/products"
              className="bg-green-50 p-6 rounded-lg border border-green-200 hover:bg-green-100 transition-colors block"
            >
              <h3 className="text-lg font-semibold text-green-900 mb-2">상품 관리</h3>
              <p className="text-green-700">등록된 상품들을 관리합니다.</p>
            </Link>

            <Link
              href="/admin/orderItems"
              className="bg-purple-50 p-6 rounded-lg border border-purple-200 hover:bg-purple-100 transition-colors block"
            >
              <h3 className="text-lg font-semibold text-purple-900 mb-2">주문 관리</h3>
              <p className="text-purple-700">고객 주문들을 관리합니다.</p>
            </Link>

            
          </div>
        </div>
      </div>
    </div>
  );
}
