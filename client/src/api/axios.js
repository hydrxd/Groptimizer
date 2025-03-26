// File: src/api/axios.js

import axios from "axios";
import { getToken } from "../utils/auth"; // Helper to get token

const API = axios.create({
    baseURL: "http://localhost:8000/api",
    headers: { "Content-Type": "application/json" },
});

// Add authorization header dynamically
API.interceptors.request.use((config) => {
    const token = getToken();
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => Promise.reject(error));

export default API;
