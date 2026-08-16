import axiosInstance from "../../../shared/utils/axiosInstance";

export const getVersionsByRepo = (repoId) => axiosInstance.get(`/versions/${repoId}`);

export const uploadVersion = (repoId, formData) =>
  axiosInstance.post(`/versions/${repoId}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

export const getVersionFileUrl = (fileId) =>
  `${axiosInstance.defaults.baseURL}/versions/file/${fileId}`;

export const linkVersion = (id, linkedTo) =>
  axiosInstance.patch(`/versions/${id}/link`, { linkedTo });