import axios from "axios";

const api = axios.create({
  baseURL: "/api",
  withCredentials: true,
});

// Automatically use JSON for normal object requests,
// but let Axios set multipart/form-data for FormData requests.
api.interceptors.request.use((config) => {
  if (typeof FormData !== "undefined" && config.data instanceof FormData) {
    // Remove any manually configured JSON Content-Type.
    if (typeof config.headers?.delete === "function") {
      config.headers.delete("Content-Type");
    } else if (config.headers) {
      delete config.headers["Content-Type"];
      delete config.headers["content-type"];
    }
  } else if (
    config.data &&
    typeof config.data === "object" &&
    !(config.data instanceof Blob) &&
    !(config.data instanceof ArrayBuffer)
  ) {
    config.headers.set
      ? config.headers.set("Content-Type", "application/json")
      : (config.headers["Content-Type"] = "application/json");
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      "Something went wrong";

    return Promise.reject(
      Object.assign(new Error(message), {
        response: error.response,
        status: error.response?.status,
      }),
    );
  },
);

export default api;
