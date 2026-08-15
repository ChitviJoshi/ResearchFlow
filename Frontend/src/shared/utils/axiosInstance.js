import axios from "axios";

// Central axios instance with baseURL + auth token interceptor
const axiosInstance = axios.create({ baseURL: "/api" });

export default axiosInstance;
