// Use environment variable or dynamically determine backend URL based on current host
const getBackendUrl = () => {
  // Use environment variable if set (for production)
  if (process.env.REACT_APP_BACKEND_URL) {
    return process.env.REACT_APP_BACKEND_URL;
  }
  // For local development, use the same host with port 8000
  const { protocol, hostname } = window.location;
  return `${protocol}//${hostname}:8000`;
};

export const BACKEND_URL = getBackendUrl();
export const API = `${BACKEND_URL}/api`;
