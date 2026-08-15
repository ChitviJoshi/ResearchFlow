import axios from "axios";

const API = "/api/reviews";

export const getReviewsByRepo = (repoId) => axios.get(`${API}/repo/${repoId}`);
export const getReviewById = (id) => axios.get(`${API}/${id}`);
export const createReviewRequest = (repoId, data) => axios.post(`${API}/${repoId}`, data);
export const addThreadEntry = (id, formData) =>
  axios.post(`${API}/${id}/thread`, formData, { headers: { "Content-Type": "multipart/form-data" } });
export const updateStatus = (id, status) => axios.patch(`${API}/${id}/status`, { status });
