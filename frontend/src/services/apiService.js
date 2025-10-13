import axiosInstance from './axios';
import { API_ENDPOINTS } from '../config/api';

const apiService = {
  // Services
  getServices: () => axiosInstance.get(API_ENDPOINTS.SERVICES),
  getService: (id) => axiosInstance.get(API_ENDPOINTS.SERVICE_DETAIL(id)),
  createService: (data) => axiosInstance.post(API_ENDPOINTS.SERVICES, data),
  updateService: (id, data) => axiosInstance.patch(API_ENDPOINTS.SERVICE_DETAIL(id), data),
  deleteService: (id) => axiosInstance.delete(API_ENDPOINTS.SERVICE_DETAIL(id)),

  // Required Documents
  getRequiredDocuments: () => axiosInstance.get(API_ENDPOINTS.REQUIRED_DOCUMENTS),
  getRequiredDocumentsByService: (serviceId) => axiosInstance.get(API_ENDPOINTS.REQUIRED_DOCUMENTS_BY_SERVICE(serviceId)),
  getRequiredDocument: (id) => axiosInstance.get(API_ENDPOINTS.REQUIRED_DOCUMENT_DETAIL(id)),
  createRequiredDocument: (data) => axiosInstance.post(API_ENDPOINTS.REQUIRED_DOCUMENTS, data),
  updateRequiredDocument: (id, data) => axiosInstance.patch(API_ENDPOINTS.REQUIRED_DOCUMENT_DETAIL(id), data),
  deleteRequiredDocument: (id) => axiosInstance.delete(API_ENDPOINTS.REQUIRED_DOCUMENT_DETAIL(id)),

  // Applications
  getApplications: () => axiosInstance.get(API_ENDPOINTS.APPLICATIONS),
  getApplication: (id) => axiosInstance.get(API_ENDPOINTS.APPLICATION_DETAIL(id)),
  createApplication: (data) => axiosInstance.post(API_ENDPOINTS.APPLICATIONS, data),
  updateApplicationStatus: (id, status, reason = '') => 
    axiosInstance.post(API_ENDPOINTS.APPLICATION_STATUS(id), { status, reject_reason: reason }),
  
  // Documents
  getDocuments: () => axiosInstance.get(API_ENDPOINTS.DOCUMENTS),
  uploadDocument: (applicationId, file, documentName, requiredDocumentId = null) => {
    const formData = new FormData();
    formData.append('application', applicationId);
    formData.append('document_name', documentName);
    if (requiredDocumentId) {
      formData.append('required_document', requiredDocumentId);
    }
    formData.append('file_path', file);
    return axiosInstance.post(API_ENDPOINTS.DOCUMENTS, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  deleteDocument: (id) => axiosInstance.delete(API_ENDPOINTS.DOCUMENT_DETAIL(id)),

  // Final Documents
  getFinalDocuments: () => axiosInstance.get(API_ENDPOINTS.FINAL_DOCUMENTS),
  uploadFinalDocument: (applicationId, file) => {
    const formData = new FormData();
    formData.append('application', applicationId);
    formData.append('file_path', file);
    return axiosInstance.post(API_ENDPOINTS.FINAL_DOCUMENTS, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  // Users (Admin only)
  getUsers: () => axiosInstance.get(API_ENDPOINTS.USERS),
  getUser: (id) => axiosInstance.get(API_ENDPOINTS.USER_DETAIL(id)),
  createUser: (data) => axiosInstance.post(API_ENDPOINTS.USERS, data),
  updateUser: (id, data) => axiosInstance.patch(API_ENDPOINTS.USER_DETAIL(id), data),
  deleteUser: (id) => axiosInstance.delete(API_ENDPOINTS.USER_DETAIL(id)),
  
  // Announcements
  getAnnouncements: () => axiosInstance.get(API_ENDPOINTS.ANNOUNCEMENTS),
  getAnnouncement: (id) => axiosInstance.get(API_ENDPOINTS.ANNOUNCEMENT_DETAIL(id)),
  createAnnouncement: (data) => axiosInstance.post(API_ENDPOINTS.ANNOUNCEMENTS, data),
  updateAnnouncement: (id, data) => axiosInstance.patch(API_ENDPOINTS.ANNOUNCEMENT_DETAIL(id), data),
  deleteAnnouncement: (id) => axiosInstance.delete(API_ENDPOINTS.ANNOUNCEMENT_DETAIL(id)),
  
  // Payments
  getPayments: () => axiosInstance.get(API_ENDPOINTS.PAYMENTS),
  getPayment: (id) => axiosInstance.get(API_ENDPOINTS.PAYMENT_DETAIL(id)),
  createPayment: (data) => axiosInstance.post(API_ENDPOINTS.PAYMENTS, data),
  updatePayment: (id, data) => axiosInstance.patch(API_ENDPOINTS.PAYMENT_DETAIL(id), data),
  deletePayment: (id) => axiosInstance.delete(API_ENDPOINTS.PAYMENT_DETAIL(id)),
  markPaymentCompleted: (id) => axiosInstance.post(API_ENDPOINTS.PAYMENT_MARK_COMPLETED(id)),
  getPaymentStatistics: () => axiosInstance.get(API_ENDPOINTS.PAYMENT_STATISTICS),
  
  // Payment Settings
  getPaymentSettings: () => axiosInstance.get(API_ENDPOINTS.PAYMENT_SETTINGS),
  getActivePaymentSettings: () => axiosInstance.get(API_ENDPOINTS.PAYMENT_SETTINGS_ACTIVE),
  updatePaymentSettings: (id, data) => axiosInstance.patch(API_ENDPOINTS.PAYMENT_SETTINGS_DETAIL(id), data),
};

export { apiService };
export default apiService;
