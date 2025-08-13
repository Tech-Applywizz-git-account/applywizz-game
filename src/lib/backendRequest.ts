import axios from "axios";
const backend_url = `${import.meta.env.VITE_BACKEND_URL}/api/v1`;

export async function backendRequest(endpoint: string, token: string) {
  try {
    const res = await axios.get(`${backend_url}${endpoint}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    console.log("came here");
    return res.data;
  } catch (error: any) {
    console.error("Request failed:", error?.response?.data || error.message);
    throw error;
  }
}

export async function backendPostRequest(
  endpoint: string,
  token: string,
  data: any
) {
  try {
    const res = await axios.post(`${backend_url}${endpoint}`, data, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    return res.data;
  } catch (error: any) {
    console.error(
      "POST request failed:",
      error?.response?.data || error.message
    );
    throw error;
  }
}
