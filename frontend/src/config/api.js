// API Configuration
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
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
};
