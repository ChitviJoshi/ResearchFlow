import axiosInstance from "../../../shared/utils/axiosInstance";

export const getMessages = (repoId) => axiosInstance.get(`/messages/${repoId}`);

export const postMessage = (repoId, formData) =>
  axiosInstance.post(`/messages/${repoId}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

// The discussion page also needs the repo, its items, its reviews and an item's lineage
export const getRepoById = (repoId) => axiosInstance.get(`/repos/${repoId}`);
export const getVersionsByRepo = (repoId) => axiosInstance.get(`/versions/${repoId}`);
export const getReviewsByRepo = (repoId) => axiosInstance.get(`/reviews/repo/${repoId}`);
export const getLineage = (versionId) => axiosInstance.get(`/versions/${versionId}/lineage?depth=10`);