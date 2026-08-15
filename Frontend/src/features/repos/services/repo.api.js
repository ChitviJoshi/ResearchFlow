import axios from "axios";

const API = "/api/repos";

export const getMyRepos = () => axios.get(API);
export const createRepo = (data) => axios.post(API, data);
export const getRepoById = (id) => axios.get(`${API}/${id}`);
export const addCollaborator = (id, data) => axios.post(`${API}/${id}/collaborators`, data);
