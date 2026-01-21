// Use environment variable or dynamically determine backend URL based on current host
const getBackendUrl = () => {
  if (process.env.REACT_APP_BACKEND_URL && process.env.REACT_APP_BACKEND_URL !== 'http://localhost:8000') {
    return process.env.REACT_APP_BACKEND_URL;
  }
  // For shared ports/tunnels, use the same host with port 8000
  const { protocol, hostname } = window.location;
  return `${protocol}//${hostname}:8000`;
};

export const BACKEND_URL = getBackendUrl();
export const API = `${BACKEND_URL}/api`;
