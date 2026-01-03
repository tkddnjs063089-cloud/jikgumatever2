'use client';

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import '../../i18n/config';

interface Profile {
  nickname: string;
  email: string;
  address: string;
  profileImage: string;
}

interface ProfileEditModalProps {
  profile: Profile;
  onClose: () => void;
  onSave: (profile: Profile) => void;
}

export default function ProfileEditModal({ profile, onSave, onClose }: ProfileEditModalProps) {
  const { t } = useTranslation();
  const [formData, setFormData] = useState<Profile>(profile);
  const [imagePreview, setImagePreview] = useState<string>(profile.profileImage);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setFormData(profile);
    setImagePreview(profile.profileImage);
  }, [profile]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (error) setError('');
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setImagePreview(result);
        setFormData(prev => ({ ...prev, profileImage: result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const email = formData.email;

      if (!token) {
        setError(t('mypage.loginRequiredError'));
        return;
      }

      if (!email) {
        setError(t('mypage.emailRequired'));
        return;
      }

      // API URL 설정
      let apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://tactful-skyler-histrionically.ngrok-free.dev';
      
      // /api 경로 제거
      if (apiBaseUrl.endsWith('/api')) {
        apiBaseUrl = apiBaseUrl.slice(0, -4);
      } else if (apiBaseUrl.includes('/api/')) {
        apiBaseUrl = apiBaseUrl.replace('/api', '');
      }
      apiBaseUrl = apiBaseUrl.endsWith('/') ? apiBaseUrl.slice(0, -1) : apiBaseUrl;

      // 백엔드에 PATCH 요청
      const response = await fetch(`${apiBaseUrl}/users/${encodeURIComponent(email)}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: formData.nickname,
          email: formData.email,
          profile_image: formData.profileImage || undefined,
        }),
      });

      if (response.ok) {
        const updatedData = await response.json();
        // 성공 시 부모 컴포넌트에 업데이트된 프로필 전달
        onSave({
          nickname: updatedData.name || formData.nickname,
          email: updatedData.email || formData.email,
          address: updatedData.default_address || formData.address,
          profileImage: updatedData.profile_image || formData.profileImage,
        });
        onClose();
      } else {
        const errorData = await response.json();
        setError(errorData.message || t('mypage.updateFailed'));
      }
    } catch (error) {
      console.error('프로필 수정 오류:', error);
      setError(t('mypage.updateError'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-lg p-6 w-full max-w-md mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">{t('mypage.editProfile')}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
            aria-label={t('mypage.close')}
          >
            <svg 
              className="w-6 h-6" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M6 18L18 6M6 6l12 12" 
              />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 프로필 사진 업로드 */}
          <div className="flex flex-col items-center mb-4">
            <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden mb-3">
              {imagePreview ? (
                <img 
                  src={imagePreview} 
                  alt="프로필 미리보기" 
                  className="w-full h-full object-cover"
                />
              ) : (
                <svg 
                  className="w-12 h-12 text-gray-400" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" 
                  />
                </svg>
              )}
            </div>
            <label className="cursor-pointer">
              <span className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium">
                {t('mypage.changePhoto')}
              </span>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
            </label>
          </div>

          {/* 닉네임 */}
          <div>
            <label htmlFor="nickname" className="block text-sm font-medium text-gray-700 mb-1">
              {t('mypage.nickname')}
            </label>
            <input
              type="text"
              id="nickname"
              name="nickname"
              value={formData.nickname}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* 이메일 */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              {t('mypage.email')}
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* 에러 메시지 */}
          {error && (
            <div className="text-red-600 text-sm text-center">
              {error}
            </div>
          )}

          {/* 버튼 */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {t('mypage.cancel')}
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? t('mypage.saving') : t('mypage.save')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

