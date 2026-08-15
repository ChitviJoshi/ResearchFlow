import axios from "axios";

const API = "/api/versions";

export const getVersionsByRepo = (repoId) => axios.get(`${API}/${repoId}`);
export const uploadVersion = (repoId, formData) =>
  axios.post(`${API}/${repoId}`, formData, { headers: { "Content-Type": "multipart/form-data" } });
export const linkVersion = (id, data) => axios.patch(`${API}/${id}/link`, data);
