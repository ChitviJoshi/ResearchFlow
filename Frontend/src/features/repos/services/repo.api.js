import axiosInstance from "../../../shared/utils/axiosInstance";

export const getMyRepos = () => axiosInstance.get("/repos");
export const createRepo = (data) => axiosInstance.post("/repos", data);
export const getRepoById = (id) => axiosInstance.get(`/repos/${id}`);
export const addCollaborator = (id, data) => axiosInstance.post(`/repos/${id}/collaborators`, data);
export const deleteRepo = (id) => axiosInstance.delete(`/repos/${id}`);
