"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { getApiBaseUrl, fetchUserProfile } from "../utils/api";
import "../i18n/config";

export default function ReportPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [adminEmail, setAdminEmail] = useState<string>("");
  const [isLoadingAdmin, setIsLoadingAdmin] = useState(true);
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    email: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 로그인 확인 및 이메일 가져오기, 관리자 이메일 찾기
  useEffect(() => {
    const loadData = async () => {
      const token = localStorage.getItem("token");
      const email = localStorage.getItem("email");

      if (!token || !email) {
        alert("로그인이 필요합니다.");
        router.push("/login");
        return;
      }

      setIsLoggedIn(true);
      setFormData((prev) => ({
        ...prev,
        email: email,
      }));

      // 관리자 이메일 찾기 - 현재 로그인한 사용자가 관리자인 경우 자신의 이메일 사용
      // 또는 특정 관리자 이메일을 사용
      try {
        const userData = await fetchUserProfile(email);
        // 현재 사용자가 관리자인 경우 자신의 이메일을 수신자로 사용
        if (userData.isAdmin === true || userData.isAdmin === 1) {
          setAdminEmail(email);
        } else {
          // 일반 사용자인 경우 관리자 이메일 찾기
          // 관리자 이메일을 찾기 위해 알려진 관리자 이메일을 시도하거나
          // 또는 첫 번째 관리자 이메일을 찾기 위해 여러 이메일을 시도
          // 일단 기본값으로 설정 (나중에 관리자 이메일을 찾는 로직 추가 가능)
          setAdminEmail("admin@jikgumate.com"); // 기본 관리자 이메일
        }
      } catch (error) {
        console.error("사용자 정보 가져오기 실패:", error);
        // 기본 관리자 이메일 사용
        setAdminEmail("admin@jikgumate.com");
      } finally {
        setIsLoadingAdmin(false);
      }
    };

    loadData();
  }, [router]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (error) setError("");
    if (success) setSuccess(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 입력 검증
    if (!formData.title.trim()) {
      setError("제목을 입력해주세요.");
      return;
    }
    if (!formData.content.trim()) {
      setError("문의 내용을 입력해주세요.");
      return;
    }

    if (!adminEmail) {
      setError("관리자 이메일을 불러오는 중입니다. 잠시 후 다시 시도해주세요.");
      return;
    }

    setIsSubmitting(true);
    setError("");
    setSuccess(false);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("로그인이 필요합니다.");
        router.push("/login");
        return;
      }

      const baseUrl = getApiBaseUrl();
      
      // 백엔드 API를 통해 문의사항 전송
      const response = await fetch(`${baseUrl}/reports`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: formData.title,
          content: formData.content,
          email: formData.email,
          recipientEmail: adminEmail,
        }),
      });

      if (!response.ok) {
        if (response.status === 401) {
          alert("로그인이 필요합니다.");
          router.push("/login");
          return;
        }
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "문의사항 전송에 실패했습니다.");
      }

      // 성공 메시지 표시
      setSuccess(true);
      setFormData({
        title: "",
        content: "",
        email: formData.email,
      });
    } catch (err) {
      console.error("문의사항 전송 실패:", err);
      setError(err instanceof Error ? err.message : "문의사항 전송에 실패했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isLoggedIn || isLoadingAdmin) {
    return (
      <div className="min-h-screen py-8 flex items-center justify-center">
        <div className="text-gray-600">로딩 중...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-2xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">문의하기</h1>

        {/* 성공 메시지 */}
        {success && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <p className="text-green-600 text-sm">
              문의사항이 성공적으로 전송되었습니다. 빠른 시일 내에 답변드리겠습니다.
            </p>
          </div>
        )}

        {/* 에러 메시지 */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {/* 문의 폼 */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 이메일 */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                이메일
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                disabled
                className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
              />
              <p className="mt-1 text-xs text-gray-500">
                답변을 받을 이메일 주소입니다.
              </p>
            </div>

            {/* 제목 */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                제목 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="문의 제목을 입력하세요"
              />
            </div>

            {/* 내용 */}
            <div>
              <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
                문의 내용 <span className="text-red-500">*</span>
              </label>
              <textarea
                id="content"
                name="content"
                value={formData.content}
                onChange={handleInputChange}
                required
                rows={10}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                placeholder="문의 내용을 자세히 입력해주세요"
              />
            </div>

            {/* 제출 버튼 */}
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => router.back()}
                className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
              >
                취소
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "전송 중..." : "문의하기"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

