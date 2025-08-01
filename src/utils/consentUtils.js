/**
 * Google AdSense CMP Consent Utilities
 * Provides helper functions for managing consent state and Google Consent Mode v2
 */

// EEA countries and regions that require explicit consent
export const EEA_REGIONS = [
  'AT', 'BE', 'BG', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR', 'DE', 'GR', 'HU', 
  'HR', 'IS', 'IE', 'IT', 'LV', 'LI', 'LT', 'LU', 'MT', 'NL', 'NO', 'PL', 
  'PT', 'RO', 'SK', 'SI', 'ES', 'SE', 'CH', 'GB'
];

// Timezone to country mapping for basic geolocation
export const TIMEZONE_TO_COUNTRY = {
  'Europe/Vienna': 'AT',
  'Europe/Brussels': 'BE',
  'Europe/Sofia': 'BG',
  'Europe/Zagreb': 'HR',
  'Europe/Prague': 'CZ',
  'Europe/Copenhagen': 'DK',
  'Europe/Tallinn': 'EE',
  'Europe/Helsinki': 'FI',
  'Europe/Paris': 'FR',
  'Europe/Berlin': 'DE',
  'Europe/Athens': 'GR',
  'Europe/Budapest': 'HU',
  'Atlantic/Reykjavik': 'IS',
  'Europe/Dublin': 'IE',
  'Europe/Rome': 'IT',
  'Europe/Riga': 'LV',
  'Europe/Vilnius': 'LT',
  'Europe/Luxembourg': 'LU',
  'Europe/Malta': 'MT',
  'Europe/Amsterdam': 'NL',
  'Europe/Oslo': 'NO',
  'Europe/Warsaw': 'PL',
  'Europe/Lisbon': 'PT',
  'Europe/Bucharest': 'RO',
  'Europe/Bratislava': 'SK',
  'Europe/Ljubljana': 'SI',
  'Europe/Madrid': 'ES',
  'Europe/Stockholm': 'SE',
  'Europe/Zurich': 'CH',
  'Europe/London': 'GB'
};

/**
 * Check if user is in EEA region based on timezone
 * Note: This is a basic implementation. In production, use a proper geolocation service
 */
export const isEEARegion = () => {
  try {
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const country = TIMEZONE_TO_COUNTRY[timezone];
    return EEA_REGIONS.includes(country);
  } catch (error) {
    console.warn('Unable to determine timezone:', error);
    // Default to requiring consent for safety
    return true;
  }
};

/**
 * Update Google Consent Mode v2 settings
 */
export const updateGoogleConsent = (consentSettings) => {
  if (typeof window !== 'undefined' && typeof gtag === 'function') {
    gtag('consent', 'update', {
      'ad_storage': consentSettings.ad_storage ? 'granted' : 'denied',
      'ad_user_data': consentSettings.ad_user_data ? 'granted' : 'denied',
      'ad_personalization': consentSettings.ad_personalization ? 'granted' : 'denied',
      'analytics_storage': consentSettings.analytics_storage ? 'granted' : 'denied',
      'functionality_storage': consentSettings.functionality_storage ? 'granted' : 'denied',
      'personalization_storage': consentSettings.personalization_storage ? 'granted' : 'denied'
    });
    
    // Log consent update for debugging
    console.log('Google Consent Mode updated:', consentSettings);
  } else {
    console.warn('gtag function not available for consent update');
  }
};

/**
 * Default consent settings
 */
export const DEFAULT_CONSENT_SETTINGS = {
  ad_storage: false,
  ad_user_data: false,
  ad_personalization: false,
  analytics_storage: false,
  functionality_storage: true, // Usually granted for basic site functionality
  personalization_storage: false
};

/**
 * Get consent from localStorage
 */
export const getSavedConsent = () => {
  try {
    const saved = localStorage.getItem('google-consent');
    return saved ? JSON.parse(saved) : null;
  } catch (error) {
    console.error('Error reading consent from localStorage:', error);
    return null;
  }
};

/**
 * Save consent to localStorage
 */
export const saveConsent = (consentSettings) => {
  try {
    const consent = {
      ...consentSettings,
      timestamp: Date.now(),
      version: '2.0' // Track consent mode version
    };
    localStorage.setItem('google-consent', JSON.stringify(consent));
    return consent;
  } catch (error) {
    console.error('Error saving consent to localStorage:', error);
    return null;
  }
};

/**
 * Check if consent needs to be refreshed (older than 13 months per GDPR)
 */
export const needsConsentRefresh = (consentData) => {
  if (!consentData || !consentData.timestamp) {
    return true;
  }
  
  const thirteenMonthsInMs = 13 * 30 * 24 * 60 * 60 * 1000; // Approximate
  const timeSinceConsent = Date.now() - consentData.timestamp;
  
  return timeSinceConsent > thirteenMonthsInMs;
};

/**
 * Initialize consent mode with default denied state for EEA regions
 */
export const initializeConsentMode = () => {
  if (typeof window !== 'undefined' && typeof gtag === 'function') {
    const isEEA = isEEARegion();
    
    if (isEEA) {
      // Set default to denied for EEA regions
      gtag('consent', 'default', {
        'ad_storage': 'denied',
        'ad_user_data': 'denied',
        'ad_personalization': 'denied',
        'analytics_storage': 'denied',
        'functionality_storage': 'denied',
        'personalization_storage': 'denied',
        'security_storage': 'granted',
        'wait_for_update': 2000
      });
    } else {
      // Grant consent for non-EEA regions
      gtag('consent', 'default', {
        'ad_storage': 'granted',
        'ad_user_data': 'granted',
        'ad_personalization': 'granted',
        'analytics_storage': 'granted',
        'functionality_storage': 'granted',
        'personalization_storage': 'denied',
        'security_storage': 'granted'
      });
    }
    
    console.log('Consent Mode initialized for', isEEA ? 'EEA' : 'non-EEA', 'region');
  }
};

/**
 * Create preset consent configurations
 */
export const CONSENT_PRESETS = {
  acceptAll: {
    ad_storage: true,
    ad_user_data: true,
    ad_personalization: true,
    analytics_storage: true,
    functionality_storage: true,
    personalization_storage: true
  },
  
  rejectAll: {
    ad_storage: false,
    ad_user_data: false,
    ad_personalization: false,
    analytics_storage: false,
    functionality_storage: true, // Keep essential functionality
    personalization_storage: false
  },
  
  analyticsOnly: {
    ad_storage: false,
    ad_user_data: false,
    ad_personalization: false,
    analytics_storage: true,
    functionality_storage: true,
    personalization_storage: false
  }
};