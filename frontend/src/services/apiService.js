import axiosInstance from './axios';
import { API_ENDPOINTS } from '../config/api';

const apiService = {
  // Services
  getServices: () => axiosInstance.get(API_ENDPOINTS.SERVICES),
  getService: (id) => axiosInstance.get(API_ENDPOINTS.SERVICE_DETAIL(id)),
  createService: (data) => axiosInstance.post(API_ENDPOINTS.SERVICES, data),
  updateService: (id, data) => axiosInstance.patch(API_ENDPOINTS.SERVICE_DETAIL(id), data),
  deleteService: (id) => axiosInstance.delete(API_ENDPOINTS.SERVICE_DETAIL(id)),

  // Applications
  getApplications: () => axiosInstance.get(API_ENDPOINTS.APPLICATIONS),
  getApplication: (id) => axiosInstance.get(API_ENDPOINTS.APPLICATION_DETAIL(id)),
  createApplication: (data) => axiosInstance.post(API_ENDPOINTS.APPLICATIONS, data),
  updateApplicationStatus: (id, status, reason = '') => 
    axiosInstance.post(API_ENDPOINTS.APPLICATION_STATUS(id), { status, reject_reason: reason }),
  
  // Documents
  getDocuments: () => axiosInstance.get(API_ENDPOINTS.DOCUMENTS),
  uploadDocument: (applicationId, file) => {
    const formData = new FormData();
    formData.append('application', applicationId);
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
};

export { apiService };
export default apiService;
