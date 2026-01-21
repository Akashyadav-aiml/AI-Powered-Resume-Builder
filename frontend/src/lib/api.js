// Use environment variable or dynamically determine backend URL based on current host
const getBackendUrl = () => {
  // Use environment variable if set (for production)
  if (process.env.REACT_APP_BACKEND_URL) {
    return process.env.REACT_APP_BACKEND_URL;
  }
  // Production fallback
  if (window.location.hostname !== 'localhost') {
    return 'https://ai-powered-resume-builder-dbkz.onrender.com';
  }
  // For local development, use localhost with port 8000
  return 'http://localhost:8000';
};

export const BACKEND_URL = getBackendUrl();
export const API = `${BACKEND_URL}/api`;
