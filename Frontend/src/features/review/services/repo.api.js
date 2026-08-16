import axiosInstance from "../../../shared/utils/axiosInstance";

// Used to fetch collaborators (to pick a professor) and paper versions (to pick which draft to review)
export const getRepoById = (id) => axiosInstance.get(`/repos/${id}`);
export const getVersionsByRepo = (id) => axiosInstance.get(`/versions/${id}`);