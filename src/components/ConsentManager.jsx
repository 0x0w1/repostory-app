import { useState, useEffect } from 'react';
import {
  isEEARegion,
  updateGoogleConsent,
  getSavedConsent,
  saveConsent,
  needsConsentRefresh,
  CONSENT_PRESETS
} from '../utils/consentUtils';

const ConsentManager = () => {
  const [showBanner, setShowBanner] = useState(false);
  const [consentGiven, setConsentGiven] = useState(null);

  useEffect(() => {
    // Check if consent has already been given
    const savedConsent = getSavedConsent();
    
    if (savedConsent) {
      // Check if consent needs refresh (GDPR requires renewal every 13 months)
      if (needsConsentRefresh(savedConsent)) {
        // Clear old consent and show banner again
        localStorage.removeItem('google-consent');
        if (isEEARegion()) {
          setShowBanner(true);
        }
      } else {
        // Use existing consent
        setConsentGiven(savedConsent);
        updateGoogleConsent(savedConsent);
      }
    } else {
      // No saved consent, check if user is in EEA region
      if (isEEARegion()) {
        setShowBanner(true);
      } else {
        // For non-EEA regions, consent is already granted by default
        const defaultConsent = CONSENT_PRESETS.acceptAll;
        setConsentGiven(defaultConsent);
        saveConsent(defaultConsent);
      }
    }
  }, []);

  const handleAcceptAll = () => {
    const consent = CONSENT_PRESETS.acceptAll;
    const savedConsent = saveConsent(consent);
    
    setConsentGiven(savedConsent);
    setShowBanner(false);
    updateGoogleConsent(consent);
  };

  const handleRejectAll = () => {
    const consent = CONSENT_PRESETS.rejectAll;
    const savedConsent = saveConsent(consent);
    
    setConsentGiven(savedConsent);
    setShowBanner(false);
    updateGoogleConsent(consent);
  };

  const handleManagePreferences = () => {
    // Show detailed preferences dialog
    const preferences = window.confirm(
      "맞춤 설정을 선택하시겠습니까?\n\n" +
      "OK = 분석만 허용 (광고 없이 사이트 개선에만 사용)\n" +
      "Cancel = 모든 기능 허용"
    );
    
    if (preferences) {
      // Analytics only
      const consent = CONSENT_PRESETS.analyticsOnly;
      const savedConsent = saveConsent(consent);
      
      setConsentGiven(savedConsent);
      setShowBanner(false);
      updateGoogleConsent(consent);
    } else {
      handleAcceptAll();
    }
  };

  if (!showBanner) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-gray-900 text-white p-4 shadow-lg border-t-2 border-blue-500">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold mb-2">쿠키 및 개인정보 설정</h3>
            <p className="text-sm text-gray-300 leading-relaxed">
              이 웹사이트는 최적의 사용자 경험을 제공하고 맞춤형 광고를 표시하기 위해 쿠키와 유사한 기술을 사용합니다. 
              Google AdSense를 통한 광고 표시 및 분석을 위해 귀하의 데이터를 처리할 수 있습니다. 
              언제든지 설정을 변경할 수 있습니다.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 min-w-fit">
            <button
              onClick={handleRejectAll}
              className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md text-sm font-medium transition-colors"
            >
              필수만 허용
            </button>
            <button
              onClick={handleManagePreferences}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium transition-colors"
            >
              설정 관리
            </button>
            <button
              onClick={handleAcceptAll}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md text-sm font-medium transition-colors"
            >
              모두 허용
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConsentManager;