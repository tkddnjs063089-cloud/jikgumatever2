'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

declare global {
  interface Window {
    daum: {
      Postcode: new (options: {
        oncomplete: (data: {
          zonecode: string;
          address: string;
          addressEnglish: string;
          addressType: string;
          bname: string;
          buildingName: string;
        }) => void;
        width?: string;
        height?: string;
      }) => {
        open: () => void;
      };
    };
  }
}

export default function SignupPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    countryCode: '+82', // 기본값: 한국
    phone: '',
    postcode: '',
    address: '',
    detailAddress: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);
  const [isEmailAvailable, setIsEmailAvailable] = useState<boolean | null>(null);

  // 다음 우편번호 API 스크립트 로드
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js';
    script.async = true;
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  // 주소 찾기 함수
  const handleAddressSearch = () => {
    if (!window.daum) {
      alert('주소 검색 서비스를 불러오는 중입니다. 잠시 후 다시 시도해주세요.');
      return;
    }

    new window.daum.Postcode({
      oncomplete: (data) => {
        let addr = '';
        
        // 사용자가 선택한 주소 타입에 따라 해당 주소 값을 가져온다.
        if (data.addressType === 'R') {
          // 사용자가 도로명 주소를 선택했을 경우
          addr = data.address;
        } else {
          // 사용자가 지번 주소를 선택했을 경우(J)
          addr = data.address;
        }

        // 우편번호와 주소 정보를 해당 필드에 넣는다.
        setFormData(prev => ({
          ...prev,
          postcode: data.zonecode,
          address: addr,
        }));
      },
      width: '100%',
      height: '100%',
    }).open();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    // 에러 메시지 초기화
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
    // 이메일 변경 시 중복확인 결과 초기화
    if (name === 'email') {
      setIsEmailAvailable(null);
    }
  };

  // 이메일 중복확인 함수
  const handleEmailCheck = async () => {
    if (!formData.email.trim()) {
      setErrors({ email: '이메일을 입력해주세요.' });
      return;
    }

    if (!isValidEmail()) {
      setErrors({ email: '올바른 이메일 형식을 입력해주세요.' });
      return;
    }

    setIsCheckingEmail(true);
    setIsEmailAvailable(null);

    try {
      // TODO: 실제 API 호출
      // const response = await fetch(`/api/auth/check-email?email=${encodeURIComponent(formData.email)}`);
      // const data = await response.json();
      // setIsEmailAvailable(data.available);

      // 임시 처리 (실제로는 API 호출)
      console.log('이메일 중복확인:', formData.email);
      
      // 임시로 성공 처리
      setTimeout(() => {
        setIsEmailAvailable(true);
        setIsCheckingEmail(false);
      }, 500);
    } catch (error) {
      setIsEmailAvailable(false);
      setErrors({ email: '이메일 중복확인 중 오류가 발생했습니다.' });
    } finally {
      setIsCheckingEmail(false);
    }
  };

  // 실시간 검증 함수들
  const isValidEmail = () => {
    if (!formData.email.trim()) return false;
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email);
  };

  const isValidPassword = () => {
    if (!formData.password.trim()) return false;
    const hasMinLength = formData.password.length >= 7;
    const hasMaxLength = formData.password.length <= 20;
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(formData.password);
    return hasMinLength && hasMaxLength && hasSpecialChar;
  };

  const isPasswordMatch = () => {
    if (!formData.confirmPassword.trim()) return false;
    return formData.password === formData.confirmPassword;
  };

  const isValidName = () => {
    if (!formData.name.trim()) return false;
    return formData.name.trim().length >= 2;
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // 이메일 검증
    if (!formData.email.trim()) {
      newErrors.email = '이메일을 입력해주세요.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = '올바른 이메일 형식을 입력해주세요.';
    }

    // 비밀번호 검증
    if (!formData.password.trim()) {
      newErrors.password = '비밀번호를 입력해주세요.';
    } else if (formData.password.length < 7 || formData.password.length > 20) {
      newErrors.password = '비밀번호는 7자 이상 20자 이하여야 합니다.';
    } else if (!/[!@#$%^&*(),.?":{}|<>]/.test(formData.password)) {
      newErrors.password = '비밀번호에 특수문자가 포함되어야 합니다.';
    }

    // 비밀번호 확인 검증
    if (!formData.confirmPassword.trim()) {
      newErrors.confirmPassword = '비밀번호 확인을 입력해주세요.';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = '비밀번호가 일치하지 않습니다.';
    }

    // 이름 검증
    if (!formData.name.trim()) {
      newErrors.name = '이름을 입력해주세요.';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = '이름은 최소 2글자 이상이어야 합니다.';
    }

    // 전화번호 검증 (선택사항이지만 입력된 경우 형식 검증)
    if (formData.phone && !/^[0-9\s\-()]+$/.test(formData.phone)) {
      newErrors.phone = '올바른 전화번호 형식을 입력해주세요.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 필수 필드 검증 및 알림
    if (!formData.email.trim()) {
      alert('이메일을 기입해주세요.');
      return;
    }
    if (!formData.password.trim()) {
      alert('비밀번호를 기입해주세요.');
      return;
    }
    if (!formData.confirmPassword.trim()) {
      alert('비밀번호 확인을 기입해주세요.');
      return;
    }
    if (!formData.name.trim()) {
      alert('이름을 기입해주세요.');
      return;
    }
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // 회원가입 API 호출 예정
      const default_address = formData.postcode && formData.address
        ? `${formData.address} ${formData.detailAddress}`.trim()
        : null;

      const phone = formData.phone 
        ? `${formData.countryCode} ${formData.phone}`.trim()
        : null;

      const signupData = {
        email: formData.email,
        password: formData.password,
        name: formData.name,
        phone: phone,
        default_address: default_address,
      };

      console.log('회원가입 데이터:', signupData);

      let apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
      
      // 환경 변수가 없거나 빈 문자열인 경우 기본값 사용
      if (!apiBaseUrl || apiBaseUrl.trim() === '') {
        apiBaseUrl = 'https://ci-cd-jikgumate-1.onrender.com';
      }
      
      // URL 정리: 앞뒤 공백 제거, 마지막 슬래시 제거
      apiBaseUrl = apiBaseUrl.trim().replace(/\/+$/, '');
      
      // URL이 올바른 형식인지 확인
      if (!apiBaseUrl.startsWith('http://') && !apiBaseUrl.startsWith('https://')) {
        throw new Error('API 서버 URL 형식이 올바르지 않습니다.');
      }
      
      const response = await fetch(`${apiBaseUrl}/auth/signup`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(signupData),
      });

      console.log('응답 상태:', response.status, response.statusText);
      
      let data;
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        const text = await response.text();
        console.log('응답 본문 (JSON 아님):', text);
        throw new Error(`서버 오류: ${response.status} ${response.statusText}`);
      }

      if (!response.ok) {
        throw new Error(data.message || data.error || '회원가입에 실패했습니다.');
      }

      // 회원가입 성공
      alert('회원가입이 완료되었습니다!');
      router.push('/login');
    } catch (error) {
      console.error('회원가입 오류 상세:', error);
      if (error instanceof TypeError && error.message.includes('fetch')) {
        setErrors({ submit: '네트워크 오류가 발생했습니다. 백엔드 서버 연결을 확인해주세요.' });
      } else {
        setErrors({ submit: error instanceof Error ? error.message : '회원가입 중 오류가 발생했습니다.' });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen py-12 flex items-center justify-center">
      <div className="w-full max-w-md">
        <div className="bg-white border border-gray-200 rounded-lg p-8 shadow-sm">
          <h1 className="text-2xl font-bold text-gray-600 mb-8 text-center">
            회원가입
          </h1>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* 이메일 (필수) */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-400 mb-2"
              >
                이메일 <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-2">
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`flex-1 px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.email ? 'border-red-500' : isValidEmail() ? 'border-green-500' : 'border-gray-300'
                  }`}
                  placeholder="example@email.com"
                  autoComplete="email"
                />
                <button
                  type="button"
                  onClick={handleEmailCheck}
                  disabled={isCheckingEmail || !formData.email.trim()}
                  className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium whitespace-nowrap disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {isCheckingEmail ? '확인 중...' : '중복확인'}
                </button>
              </div>
              {isEmailAvailable === true && (
                <p className="mt-1 text-sm text-green-600 flex items-center gap-1">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  사용 가능한 이메일입니다.
                </p>
              )}
              {isEmailAvailable === false && (
                <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                  <svg
                    className="w-4 h-4"
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
                  이미 사용 중인 이메일입니다.
                </p>
              )}
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
              )}
              {!errors.email && !isEmailAvailable && formData.email && (
                <div className={`mt-1 text-sm flex items-center gap-1 ${isValidEmail() ? 'text-green-600' : 'text-gray-400'}`}>
                  <svg
                    className={`w-4 h-4 ${isValidEmail() ? 'text-green-600' : 'text-gray-400'}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span>이메일 형식</span>
                </div>
              )}
              {!errors.email && !isEmailAvailable && !formData.email && (
                <div className="mt-1 text-sm text-gray-400 flex items-center gap-1">
                  <svg
                    className="w-4 h-4 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span>이메일 형식</span>
                </div>
              )}
            </div>

            {/* 비밀번호 (필수) */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-400 mb-2"
              >
                비밀번호 <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.password ? 'border-red-500' : isValidPassword() ? 'border-green-500' : 'border-gray-300'
                }`}
                placeholder="7-20자, 특수문자 포함"
                autoComplete="new-password"
              />
              {errors.password ? (
                <p className="mt-1 text-sm text-red-600">{errors.password}</p>
              ) : formData.password ? (
                <div className={`mt-1 text-sm flex items-center gap-1 ${isValidPassword() ? 'text-green-600' : 'text-gray-400'}`}>
                  <svg
                    className={`w-4 h-4 ${isValidPassword() ? 'text-green-600' : 'text-gray-400'}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span>7-20자, 특수문자 포함</span>
                </div>
              ) : (
                <div className="mt-1 text-sm text-gray-400 flex items-center gap-1">
                  <svg
                    className="w-4 h-4 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span>7-20자, 특수문자 포함</span>
                </div>
              )}
            </div>

            {/* 비밀번호 확인 (필수) */}
            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-gray-400 mb-2"
              >
                비밀번호 확인 <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.confirmPassword ? 'border-red-500' : isPasswordMatch() ? 'border-green-500' : 'border-gray-300'
                }`}
                placeholder="비밀번호를 다시 입력해주세요"
                autoComplete="new-password"
              />
              {errors.confirmPassword ? (
                <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
              ) : formData.confirmPassword ? (
                <div className={`mt-1 text-sm flex items-center gap-1 ${isPasswordMatch() ? 'text-green-600' : 'text-gray-400'}`}>
                  <svg
                    className={`w-4 h-4 ${isPasswordMatch() ? 'text-green-600' : 'text-gray-400'}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span>비밀번호 일치</span>
                </div>
              ) : (
                <div className="mt-1 text-sm text-gray-400 flex items-center gap-1">
                  <svg
                    className="w-4 h-4 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span>비밀번호 일치</span>
                </div>
              )}
            </div>

            {/* 이름 (필수) */}
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-400 mb-2"
              >
                이름 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.name ? 'border-red-500' : isValidName() ? 'border-green-500' : 'border-gray-300'
                }`}
                placeholder="이름을 입력하세요"
                autoComplete="name"
              />
              {errors.name ? (
                <p className="mt-1 text-sm text-red-600">{errors.name}</p>
              ) : formData.name ? (
                <div className={`mt-1 text-sm flex items-center gap-1 ${isValidName() ? 'text-green-600' : 'text-gray-400'}`}>
                  <svg
                    className={`w-4 h-4 ${isValidName() ? 'text-green-600' : 'text-gray-400'}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span>최소 2글자</span>
                </div>
              ) : (
                <div className="mt-1 text-sm text-gray-400 flex items-center gap-1">
                  <svg
                    className="w-4 h-4 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span>최소 2글자</span>
                </div>
              )}
            </div>

            {/* 전화번호 (선택) */}
            <div>
              <label
                htmlFor="phone"
                className="block text-sm font-medium text-gray-400 mb-2"
              >
                핸드폰 번호
              </label>
              <div className="flex gap-2">
                <select
                  id="countryCode"
                  name="countryCode"
                  value={formData.countryCode}
                  onChange={handleInputChange}
                  className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                >
                  <option value="+82">🇰🇷 +82</option>
                  <option value="+1">🇺🇸 +1</option>
                  <option value="+81">🇯🇵 +81</option>
                  <option value="+86">🇨🇳 +86</option>
                  <option value="+44">🇬🇧 +44</option>
                  <option value="+33">🇫🇷 +33</option>
                  <option value="+49">🇩🇪 +49</option>
                  <option value="+39">🇮🇹 +39</option>
                  <option value="+34">🇪🇸 +34</option>
                  <option value="+7">🇷🇺 +7</option>
                  <option value="+61">🇦🇺 +61</option>
                  <option value="+55">🇧🇷 +55</option>
                  <option value="+91">🇮🇳 +91</option>
                  <option value="+65">🇸🇬 +65</option>
                  <option value="+852">🇭🇰 +852</option>
                  <option value="+886">🇹🇼 +886</option>
                  <option value="+971">🇦🇪 +971</option>
                  <option value="+966">🇸🇦 +966</option>
                  <option value="+60">🇲🇾 +60</option>
                  <option value="+66">🇹🇭 +66</option>
                  <option value="+84">🇻🇳 +84</option>
                  <option value="+62">🇮🇩 +62</option>
                  <option value="+63">🇵🇭 +63</option>
                  <option value="+64">🇳🇿 +64</option>
                </select>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className={`flex-1 px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.phone ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="전화번호를 입력하세요"
                  autoComplete="tel"
                />
              </div>
              {errors.phone && (
                <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
              )}
            </div>

            {/* 기본 배송지 (선택) */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                기본 배송지
              </label>
              
              {/* 우편번호 */}
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  id="postcode"
                  name="postcode"
                  value={formData.postcode}
                  readOnly
                  className="w-32 px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 cursor-not-allowed"
                  placeholder="우편번호"
                />
                <button
                  type="button"
                  onClick={handleAddressSearch}
                  className="px-4 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium whitespace-nowrap"
                >
                  주소 찾기
                </button>
              </div>

              {/* 기본 주소 */}
              <input
                type="text"
                id="address"
                name="address"
                value={formData.address}
                readOnly
                className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 mb-2 cursor-not-allowed"
                placeholder="주소를 검색해주세요"
              />

              {/* 상세 주소 */}
              <input
                type="text"
                id="detailAddress"
                name="detailAddress"
                value={formData.detailAddress}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="상세 주소를 입력하세요"
              />
            </div>

            {/* 전체 에러 메시지 */}
            {errors.submit && (
              <div className="text-red-600 text-sm text-center">
                {errors.submit}
              </div>
            )}

            {/* 회원가입 버튼 */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-lg disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isSubmitting ? '처리 중...' : '회원가입'}
            </button>
          </form>

          {/* 로그인 링크 */}
          <div className="mt-6 text-center">
            <span className="text-gray-400 text-sm">이미 계정이 있으신가요? </span>
            <Link
              href="/login"
              className="text-blue-600 hover:text-blue-700 font-medium text-sm"
            >
              로그인
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

