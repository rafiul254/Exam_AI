import axios from "axios";

const BASE = import.meta.env.VITE_API_URL || "";

const API = axios.create({
    baseURL: `${BASE}/api`,
});

API.interceptors.request.use((config) => {
    const token = localStorage.getItem("examai_token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

API.interceptors.response.use(
    (res) => res,
    (err) => {
        if (err.response?.status === 401) {
            localStorage.removeItem("examai_token");
            window.location.href = "/login";
        }
        return Promise.reject(err);
    }
);

export const authAPI = {
    register: (data) => API.post("/auth/register", data),
    login:    (data) => API.post("/auth/login", data),
    me:       ()     => API.get("/auth/me"),
};

export const notesAPI = {
    getAll:  (params) => API.get("/notes", { params }),
    getOne:  (id)     => API.get(`/notes/${id}`),
    delete:  (id)     => API.delete(`/notes/${id}`),
    updateMastery: (id, level) => API.put(`/notes/${id}/mastery`, { level }),
    ask:     (id, question)    => API.post(`/notes/${id}/ask`, { question }),
};

export const uploadAPI = {
    upload: (file, subject, title) => {
        const fd = new FormData();
        fd.append("file", file);
        fd.append("subject", subject);
        fd.append("title", title);
        return API.post("/upload", fd, {
            headers: { "Content-Type": "multipart/form-data" },
        });
    },
    status: (noteId) => API.get(`/upload/status/${noteId}`),
};

export const revisionAPI = {
    saveSession: (data) => API.post("/revision/session", data),
    stats:       ()     => API.get("/revision/stats"),
};

export const youtubeAPI = {
    process: (url, subject, title) =>
        API.post("/youtube", { url, subject, title }),
};

export default API;
