import axios from "axios";

const API_URL = "http://192.168.1.113:3001/api";

export async function fetchGloves(params = {}) {
  const res = await axios.get(`${API_URL}/gloves`, { params });
  return res.data;
}

export async function fetchGlove(id) {
  const res = await axios.get(`${API_URL}/gloves/${id}`);
  return res.data;
}

export async function fetchBrands() {
  const res = await axios.get(`${API_URL}/gloves/meta/brands`);
  return res.data;
}

export async function fetchSubcategories() {
  const res = await axios.get(`${API_URL}/gloves/meta/subcategories`);
  return res.data;
}

export async function fetchStatus() {
  const res = await axios.get(`${API_URL}/status`);
  return res.data;
}
