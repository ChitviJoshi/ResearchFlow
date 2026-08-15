import axios from "axios";

const API = "/api/auth";

export const signup = (data) => axios.post(`${API}/signup`, data);
export const login = (data) => axios.post(`${API}/login`, data);
export const logout = () => axios.post(`${API}/logout`);
export const getMe = () => axios.get(`${API}/me`);
