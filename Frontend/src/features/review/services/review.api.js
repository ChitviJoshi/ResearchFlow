import axiosInstance from "../../../shared/utils/axiosInstance";

export const getReviewsByRepo = (repoId) => axiosInstance.get(`/reviews/repo/${repoId}`);
export const getReviewById = (id) => axiosInstance.get(`/reviews/${id}`);
export const createReviewRequest = (repoId, data) => axiosInstance.post(`/reviews/${repoId}`, data);

export const addThreadEntry = (id, formData) =>
  axiosInstance.post(`/reviews/${id}/thread`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

export const updateStatus = (id, status) => axiosInstance.patch(`/reviews/${id}/status`, { status });