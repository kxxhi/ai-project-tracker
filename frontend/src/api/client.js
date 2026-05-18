import axios from "axios";

const api = axios.create({ baseURL: "/api" });

export const getProjects = () => api.get("/projects/");
export const getProject = (id) => api.get(`/projects/${id}`);
export const createProject = (data) => api.post("/projects/", data);
export const deleteProject = (id) => api.delete(`/projects/${id}`);
export const addTask = (projectId, data) => api.post(`/projects/${projectId}/tasks`, data);
export const generateReport = (projectId, tone) => api.post(`/report/${projectId}`, { tone });
