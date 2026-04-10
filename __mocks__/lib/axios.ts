import axios from "axios";

// Point to the URLs used in MSW handlers
export const amaApi = axios.create({ baseURL: "http://localhost:3001" });
export const juecesApi = axios.create({ baseURL: "http://localhost:3002" });
