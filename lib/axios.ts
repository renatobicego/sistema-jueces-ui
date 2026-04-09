import axios from "axios";
import { useAuthStore } from "@/store/authStore";

// AMA backend — uses x-token header
export const amaApi = axios.create({
  baseURL: process.env.NEXT_PUBLIC_AMA_API_URL,
});

// sistemaJueces API — uses Authorization: Bearer header
export const juecesApi = axios.create({
  baseURL: process.env.NEXT_PUBLIC_JUECES_API_URL,
});

amaApi.interceptors.request.use((config) => {
  const token = useAuthStore.getState().amaToken;
  if (token) config.headers["x-token"] = token;
  return config;
});

juecesApi.interceptors.request.use((config) => {
  const token = useAuthStore.getState().juezSession?.token;
  if (token) config.headers["Authorization"] = `Bearer ${token}`;
  const amaToken = useAuthStore.getState().amaToken;
  if (amaToken) config.headers["x-token"] = amaToken;
  return config;
});
