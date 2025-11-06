// API Configuration
// Priority:
// 1. Runtime override via `window.__env.VITE_API_URL` (useful for changing API without rebuilding)
// 2. Vite-injected build-time env `import.meta.env.VITE_API_URL`
// 3. If neither is set and we're running on a non-localhost origin, assume same-origin backend
// 4. Fallback to localhost for local development
const runtimeApi = typeof window !== 'undefined' && window.__env && window.__env.VITE_API_URL;
const buildApi = typeof import.meta !== 'undefined' ? import.meta.env.VITE_API_URL : undefined;

let resolvedApi = runtimeApi || buildApi || 'http://127.0.0.1:8000';

if (typeof window !== 'undefined' && !runtimeApi && !buildApi) {
  // If the app is served from a non-localhost host and no API URL was provided,
  // assume the API is served from the same origin (common when frontend + backend
  // are hosted together or proxied).
  const host = window.location.hostname;
  if (host && host !== 'localhost' && host !== '127.0.0.1') {
    resolvedApi = window.location.origin;
  }
}

// If we're running on a non-localhost origin but resolvedApi still points to localhost,
// log a helpful warning to ease debugging of "NetworkError when attempting to fetch resource" in production.
if (typeof window !== 'undefined' && window.location && !['localhost', '127.0.0.1'].includes(window.location.hostname)) {
  if (resolvedApi.includes('127.0.0.1') || resolvedApi.includes('localhost')) {
    // eslint-disable-next-line no-console
    console.warn('[API_BASE_URL] No runtime or build API URL set and fallback is localhost. Network requests may fail in production. Set window.__env.VITE_API_URL or build-time VITE_API_URL.');
  }
}

export const API_BASE_URL = resolvedApi;
export const API_ENDPOINTS = {
  // Auth
  TOKEN: '/api/token/',
  TOKEN_REFRESH: '/api/token/refresh/',
  
  // Users
  USERS: '/api/users/',
  USER_DETAIL: (id) => `/api/users/${id}/`,
  
  // Services
  SERVICES: '/api/services/',
  SERVICE_DETAIL: (id) => `/api/services/${id}/`,
  
  // Required Documents
  REQUIRED_DOCUMENTS: '/api/required-documents/',
  REQUIRED_DOCUMENT_DETAIL: (id) => `/api/required-documents/${id}/`,
  REQUIRED_DOCUMENTS_BY_SERVICE: (serviceId) => `/api/required-documents/?service_id=${serviceId}`,
  
  // Applications
  APPLICATIONS: '/api/applications/',
  APPLICATION_DETAIL: (id) => `/api/applications/${id}/`,
  APPLICATION_STATUS: (id) => `/api/applications/${id}/update_status/`,
  
  // Documents
  DOCUMENTS: '/api/documents/',
  DOCUMENT_DETAIL: (id) => `/api/documents/${id}/`,
  
  // Final Documents
  FINAL_DOCUMENTS: '/api/final_documents/',
  FINAL_DOCUMENT_DETAIL: (id) => `/api/final_documents/${id}/`,
  
  // Announcements
  ANNOUNCEMENTS: '/api/announcements/',
  ANNOUNCEMENT_DETAIL: (id) => `/api/announcements/${id}/`,
  
  // Payments
  PAYMENTS: '/api/payments/',
  PAYMENT_DETAIL: (id) => `/api/payments/${id}/`,
  PAYMENT_MARK_COMPLETED: (id) => `/api/payments/${id}/mark_completed/`,
  PAYMENT_STATISTICS: '/api/payments/statistics/',
  
  // Payment Settings
  PAYMENT_SETTINGS: '/api/payment-settings/',
  PAYMENT_SETTINGS_DETAIL: (id) => `/api/payment-settings/${id}/`,
  PAYMENT_SETTINGS_ACTIVE: '/api/payment-settings/active/',
  // Government Schemes
  GOV_SCHEMES: '/api/gov-schemes/',
  GOV_SCHEME_DETAIL: (id) => `/api/gov-schemes/${id}/`,
  
  // Backups
  BACKUP_CREATE: '/api/backups/create/',
  BACKUP_LIST: '/api/backups/list/',
  BACKUP_CLEANUP: '/api/backups/cleanup/',
  // Gopinath Scheme Applications
  GOPINATH_APPLICATIONS: '/api/gopinath-applications/',
  GOPINATH_APPLICATION_DETAIL: (id) => `/api/gopinath-applications/${id}/`,
};
