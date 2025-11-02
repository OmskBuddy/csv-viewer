import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 300000,
  headers: {
    'Content-Type': 'application/json'
  }
});

export const csvService = {
  async uploadFile(file) {
    const formData = new FormData();
    formData.append('file', file);

    const response = await apiClient.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      onUploadProgress: (progressEvent) => {
        const percentCompleted = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total
        );
        return percentCompleted;
      }
    });

    return response.data;
  },

  async getHeaders(fileId) {
    const response = await apiClient.get(`/file/${fileId}/headers`);
    return response.data;
  },

  async getRows(fileId, page = 1, pageSize = 50, searchQuery = null) {
    const params = {
      page,
      pageSize
    };

    if (searchQuery) {
      params.search = searchQuery;
    }

    const response = await apiClient.get(`/file/${fileId}/rows`, { params });
    return response.data;
  },

  async search(fileId, query, limit = 100) {
    const response = await apiClient.get(`/file/${fileId}/search`, {
      params: { q: query, limit }
    });
    return response.data;
  },

  async deleteFile(fileId) {
    const response = await apiClient.delete(`/file/${fileId}`);
    return response.data;
  }
};

export default apiClient;

