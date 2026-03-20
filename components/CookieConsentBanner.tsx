'use client';

import React, { useEffect, useState } from 'react';

const CookieConsentBanner = () => {
  // Initialize state as null to indicate "loading" state
  const [showConsent, setShowConsent] = useState<boolean | null>(null);

  useEffect(() => {
    // Check localStorage when component mounts
    const cookieConsent = localStorage.getItem('cookieConsent');
    // Only show banner if there's no stored preference
    setShowConsent(cookieConsent === null);
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookieConsent', 'accepted');
    setShowConsent(false);
  };

  const handleDecline = () => {
    localStorage.setItem('cookieConsent', 'declined');
    setShowConsent(false);
  };

  // Don't render anything while checking localStorage (prevents flash)
  if (showConsent === null) {
    return null;
  }

  return (
    showConsent && (
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white shadow-lg border-t border-gray-200">
        <div className="w-full max-w-7xl mx-auto px-4 py-4 sm:px-6 sm:py-6">
          <div className="flex flex-col gap-4">
            <div className="space-y-2">
              <h3 className="text-base sm:text-lg font-semibold">Chúng tôi tôn trọng quyền riêng tư của bạn</h3>
              <p className="text-sm sm:text-base text-gray-600">
                Website du lịch của chúng tôi sử dụng cookie để cải thiện trải nghiệm đặt tour và nâng cao chất lượng dịch vụ.
                Cookie giúp lưu tùy chọn của bạn, hỗ trợ quy trình đặt tour và bảo mật trang web.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-end">
              <button
                onClick={handleDecline}
                aria-label="Từ chối tất cả cookie"
                className="w-full sm:w-auto px-4 py-2.5 text-sm border border-gray-300 rounded-md 
                  hover:bg-gray-50 text-gray-700 order-1 sm:order-none"
              >
                Từ chối tất cả
              </button>
              <button
                onClick={handleAccept}
                 aria-label="Chấp nhận tất cả cookie"
                className="w-full sm:w-auto px-4 py-2.5 text-sm bg-green-600 text-white rounded-md 
                  hover:bg-green-700 order-2 sm:order-none"
              >
                Chấp nhận tất cả
              </button>
            </div>
            <div className="text-xs text-gray-500">
              <p>
                Để biết thêm về cách chúng tôi sử dụng cookie, vui lòng xem{' '}
                <a href="/terms-and-condition" className="underline hover:text-gray-700">Chính sách quyền riêng tư</a>.
                Bạn có thể thay đổi lựa chọn bất cứ lúc nào.
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  );
};

export default CookieConsentBanner;
