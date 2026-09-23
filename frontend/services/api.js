import axios from "axios";

const API = axios.create({
  baseURL: "http://127.0.0.1:5000/api",
});

export const getProducts = async (search = "", category = "") => {
  const response = await API.get("/products", {
    params: {
      search,
      category,
    },
  });

  return response.data;
};

export default API;