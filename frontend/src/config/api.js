// API Configuration
// Priority:
// 1. Runtime override via `window.__env.VITE_API_URL` (useful for changing API without rebuilding)
// 2. Vite-injected build-time env `import.meta.env.VITE_API_URL`
// 3. Fallback to localhost for local development
const runtimeApi = typeof window !== 'undefined' && window.__env && window.__env.VITE_API_URL;
export const API_BASE_URL = runtimeApi || import.meta.env.VITE_API_URL || 'https://cgjbcsc.onrender.com'
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
};
