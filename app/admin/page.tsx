'use client';

import { useTranslation } from 'react-i18next';
import Link from 'next/link';
import '../i18n/config';

export default function AdminPage() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-6xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">{t("admin.title")}</h1>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* 관리자 기능들 - 추후 구현 */}
            <Link
              href="/admin/users"
              className="bg-blue-50 p-6 rounded-lg border border-blue-200 hover:bg-blue-100 transition-colors block"
            >
              <h3 className="text-lg font-semibold text-blue-900 mb-2">{t("admin.userManagement")}</h3>
              <p className="text-blue-700">{t("admin.userManagementDesc")}</p>
            </Link>

            <Link
              href="/admin/products"
              className="bg-green-50 p-6 rounded-lg border border-green-200 hover:bg-green-100 transition-colors block"
            >
              <h3 className="text-lg font-semibold text-green-900 mb-2">{t("admin.productManagement")}</h3>
              <p className="text-green-700">{t("admin.productManagementDesc")}</p>
            </Link>

            <Link
              href="/admin/orderItems"
              className="bg-purple-50 p-6 rounded-lg border border-purple-200 hover:bg-purple-100 transition-colors block"
            >
              <h3 className="text-lg font-semibold text-purple-900 mb-2">{t("admin.orderManagement")}</h3>
              <p className="text-purple-700">{t("admin.orderManagementDesc")}</p>
            </Link>

            
          </div>
        </div>
      </div>
    </div>
  );
}
