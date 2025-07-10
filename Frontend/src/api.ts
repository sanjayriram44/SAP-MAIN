import axios from "axios";


const api = axios.create({
  baseURL: "http://localhost:8000",
});

export const getProcessUnderstanding = async () => {
  const response = await api.post("/generate_process_understanding", { history });
  return response.data.process_understanding;
};