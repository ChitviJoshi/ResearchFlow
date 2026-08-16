import axiosInstance from "../../../shared/utils/axiosInstance";

export const getRepoById = (id) => axiosInstance.get(`/repos/${id}`);