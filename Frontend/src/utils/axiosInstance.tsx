import axios from 'axios'
axios.defaults.withCredentials = true;
// Accessing the backend API URL from environment variables
const baseURL: string = import.meta.env.VITE_BACKEND_API_URL;
console.log(baseURL);

const api = axios.create({
  baseURL, // Setting the base URL for axios
});

export default api;
