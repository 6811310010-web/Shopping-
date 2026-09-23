import axios from "axios";

const API = axios.create({
  baseURL: "https://shopping-backend-6gpx.onrender.com/api",
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