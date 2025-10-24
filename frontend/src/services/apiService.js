import axiosInstance from './axios';
import { API_ENDPOINTS } from '../config/api';
import { cacheManager, withCache } from '../utils/cacheManager';

// Cache configuration
const CACHE_TTL = {
  SHORT: 2 * 60 * 1000,      // 2 minutes - for frequently changing data
  MEDIUM: 5 * 60 * 1000,     // 5 minutes - for moderately changing data
  LONG: 15 * 60 * 1000,      // 15 minutes - for rarely changing data
};

const apiService = {
  // Services - Cache for medium duration (services don't change often)
  getServices: withCache(
    () => axiosInstance.get(API_ENDPOINTS.SERVICES),
    'services',
    CACHE_TTL.MEDIUM
  ),
  getService: (id) => {
    const cached = cacheManager.get(`service-${id}`, CACHE_TTL.MEDIUM);
    if (cached) return Promise.resolve(cached);
    
    return axiosInstance.get(API_ENDPOINTS.SERVICE_DETAIL(id)).then(res => {
      cacheManager.set(`service-${id}`, res);
      return res;
    });
  },
  createService: (data) => {
    // Invalidate services cache on create
    cacheManager.invalidate(/^services/);
    return axiosInstance.post(API_ENDPOINTS.SERVICES, data);
  },
  updateService: (id, data) => {
    // Invalidate services cache on update
    cacheManager.invalidate(/^services/);
    cacheManager.invalidate(`service-${id}`);
    return axiosInstance.patch(API_ENDPOINTS.SERVICE_DETAIL(id), data);
  },
  deleteService: (id) => {
    // Invalidate services cache on delete
    cacheManager.invalidate(/^services/);
    cacheManager.invalidate(`service-${id}`);
    return axiosInstance.delete(API_ENDPOINTS.SERVICE_DETAIL(id));
  },

  // Required Documents - Cache for long duration (rarely change)
  getRequiredDocuments: withCache(
    () => axiosInstance.get(API_ENDPOINTS.REQUIRED_DOCUMENTS),
    'required-documents',
    CACHE_TTL.LONG
  ),
  getRequiredDocumentsByService: (serviceId) => {
    const cached = cacheManager.get(`required-documents-service-${serviceId}`, CACHE_TTL.LONG);
    if (cached) return Promise.resolve(cached);
    
    return axiosInstance.get(API_ENDPOINTS.REQUIRED_DOCUMENTS_BY_SERVICE(serviceId)).then(res => {
      cacheManager.set(`required-documents-service-${serviceId}`, res);
      return res;
    });
  },
  getRequiredDocument: (id) => axiosInstance.get(API_ENDPOINTS.REQUIRED_DOCUMENT_DETAIL(id)),
  createRequiredDocument: (data) => {
    cacheManager.invalidate(/^required-documents/);
    return axiosInstance.post(API_ENDPOINTS.REQUIRED_DOCUMENTS, data);
  },
  updateRequiredDocument: (id, data) => {
    cacheManager.invalidate(/^required-documents/);
    return axiosInstance.patch(API_ENDPOINTS.REQUIRED_DOCUMENT_DETAIL(id), data);
  },
  deleteRequiredDocument: (id) => {
    cacheManager.invalidate(/^required-documents/);
    return axiosInstance.delete(API_ENDPOINTS.REQUIRED_DOCUMENT_DETAIL(id));
  },

  // Applications - Short cache (frequently change)
  getApplications: () => axiosInstance.get(API_ENDPOINTS.APPLICATIONS),
  getApplication: (id) => axiosInstance.get(API_ENDPOINTS.APPLICATION_DETAIL(id)),
  createApplication: (data) => {
    cacheManager.invalidate(/^applications/);
    return axiosInstance.post(API_ENDPOINTS.APPLICATIONS, data);
  },
  updateApplicationStatus: (id, status, reason = '') => {
    cacheManager.invalidate(/^applications/);
    cacheManager.invalidate(`application-${id}`);
    return axiosInstance.post(API_ENDPOINTS.APPLICATION_STATUS(id), { status, reject_reason: reason });
  },
  
  // Documents - No cache (file uploads)
  getDocuments: () => axiosInstance.get(API_ENDPOINTS.DOCUMENTS),
  uploadDocument: (applicationId, file, documentName, requiredDocumentId = null) => {
    const formData = new FormData();
    formData.append('application', applicationId);
    formData.append('document_name', documentName);
    if (requiredDocumentId) {
      formData.append('required_document', requiredDocumentId);
    }
    formData.append('file_path', file);
    
    // Invalidate application cache on document upload
    cacheManager.invalidate(/^applications/);
    cacheManager.invalidate(`application-${applicationId}`);
    
    return axiosInstance.post(API_ENDPOINTS.DOCUMENTS, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  deleteDocument: (id) => {
    cacheManager.invalidate(/^applications/);
    return axiosInstance.delete(API_ENDPOINTS.DOCUMENT_DETAIL(id));
  },

  // Final Documents - No cache (file uploads)
  getFinalDocuments: () => axiosInstance.get(API_ENDPOINTS.FINAL_DOCUMENTS),
  uploadFinalDocument: (applicationId, file) => {
    const formData = new FormData();
    formData.append('application', applicationId);
    formData.append('file_path', file);
    
    // Invalidate application cache on final document upload
    cacheManager.invalidate(/^applications/);
    cacheManager.invalidate(`application-${applicationId}`);
    
    return axiosInstance.post(API_ENDPOINTS.FINAL_DOCUMENTS, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  // Users (Admin only) - Medium cache
  getUsers: withCache(
    () => axiosInstance.get(API_ENDPOINTS.USERS),
    'users',
    CACHE_TTL.MEDIUM
  ),
  getUser: (id) => axiosInstance.get(API_ENDPOINTS.USER_DETAIL(id)),
  createUser: (data) => {
    cacheManager.invalidate(/^users/);
    return axiosInstance.post(API_ENDPOINTS.USERS, data);
  },
  updateUser: (id, data) => {
    cacheManager.invalidate(/^users/);
    cacheManager.invalidate(`user-${id}`);
    return axiosInstance.patch(API_ENDPOINTS.USER_DETAIL(id), data);
  },
  deleteUser: (id) => {
    cacheManager.invalidate(/^users/);
    cacheManager.invalidate(`user-${id}`);
    return axiosInstance.delete(API_ENDPOINTS.USER_DETAIL(id));
  },
  
  // Announcements - Short cache (frequently updated)
  getAnnouncements: withCache(
    () => axiosInstance.get(API_ENDPOINTS.ANNOUNCEMENTS),
    'announcements',
    CACHE_TTL.SHORT
  ),
  getAnnouncement: (id) => axiosInstance.get(API_ENDPOINTS.ANNOUNCEMENT_DETAIL(id)),
  createAnnouncement: (data) => {
    cacheManager.invalidate(/^announcements/);
    return axiosInstance.post(API_ENDPOINTS.ANNOUNCEMENTS, data);
  },
  updateAnnouncement: (id, data) => {
    cacheManager.invalidate(/^announcements/);
    return axiosInstance.patch(API_ENDPOINTS.ANNOUNCEMENT_DETAIL(id), data);
  },
  deleteAnnouncement: (id) => {
    cacheManager.invalidate(/^announcements/);
    return axiosInstance.delete(API_ENDPOINTS.ANNOUNCEMENT_DETAIL(id));
  },
  
  // Payments - No cache (real-time data)
  getPayments: () => axiosInstance.get(API_ENDPOINTS.PAYMENTS),
  getPayment: (id) => axiosInstance.get(API_ENDPOINTS.PAYMENT_DETAIL(id)),
  createPayment: (data) => axiosInstance.post(API_ENDPOINTS.PAYMENTS, data),
  updatePayment: (id, data) => axiosInstance.patch(API_ENDPOINTS.PAYMENT_DETAIL(id), data),
  deletePayment: (id) => axiosInstance.delete(API_ENDPOINTS.PAYMENT_DETAIL(id)),
  markPaymentCompleted: (id) => {
    cacheManager.invalidate(/^payment-statistics/);
    return axiosInstance.post(API_ENDPOINTS.PAYMENT_MARK_COMPLETED(id));
  },
  getPaymentStatistics: withCache(
    () => axiosInstance.get(API_ENDPOINTS.PAYMENT_STATISTICS),
    'payment-statistics',
    CACHE_TTL.SHORT
  ),
  
  // Payment Settings - Long cache (rarely changes)
  getPaymentSettings: withCache(
    () => axiosInstance.get(API_ENDPOINTS.PAYMENT_SETTINGS),
    'payment-settings',
    CACHE_TTL.LONG
  ),
  getActivePaymentSettings: withCache(
    () => axiosInstance.get(API_ENDPOINTS.PAYMENT_SETTINGS_ACTIVE),
    'payment-settings-active',
    CACHE_TTL.LONG
  ),
  updatePaymentSettings: (id, data) => {
    cacheManager.invalidate(/^payment-settings/);
    return axiosInstance.patch(API_ENDPOINTS.PAYMENT_SETTINGS_DETAIL(id), data);
  },

  // Government Schemes - Medium cache (admin can update)
  getGovSchemes: withCache(
    () => axiosInstance.get(API_ENDPOINTS.GOV_SCHEMES),
    'gov-schemes',
    CACHE_TTL.MEDIUM
  ),
  createGovScheme: (data) => {
    cacheManager.invalidate(/^gov-schemes/);
    return axiosInstance.post(API_ENDPOINTS.GOV_SCHEMES, data);
  },
  updateGovScheme: (id, data) => {
    cacheManager.invalidate(/^gov-schemes/);
    return axiosInstance.patch(API_ENDPOINTS.GOV_SCHEME_DETAIL(id), data);
  },
  deleteGovScheme: (id) => {
    cacheManager.invalidate(/^gov-schemes/);
    return axiosInstance.delete(API_ENDPOINTS.GOV_SCHEME_DETAIL(id));
  },
  
  // Backups - Admin only, no caching needed
  createBackup: () => axiosInstance.post(API_ENDPOINTS.BACKUP_CREATE),
  listBackups: () => axiosInstance.get(API_ENDPOINTS.BACKUP_LIST),
  cleanupBackups: (keepCount = 7) => axiosInstance.post(API_ENDPOINTS.BACKUP_CLEANUP, { keep_count: keepCount }),
  
  // Cache management utilities
  clearCache: () => cacheManager.clear(),
  invalidateCache: (pattern) => cacheManager.invalidate(pattern),
};

export { apiService };
export default apiService;
