// actions_pdfConfig.js
import axios from 'axios';

const api = axios.create({ baseURL: 'http://localhost:3000' });

// sadece GET var — toast eklemedim
export const getPdfConfigByKey = (key) => async (dispatch) => {
  const { data } = await api.get(`/pdfler?key=${encodeURIComponent(key)}`);
  const rec = Array.isArray(data) ? data[0] : data;
  const cfg = rec?.config_json ?? rec; // güvenli fallback
  dispatch({ type: 'pdfConfigs/loaded', payload: { key, config: cfg } });
  return cfg;
};

export const getBrandConfigByKey = (key) => async (dispatch) => {
  const { data } = await api.get(`/brands?key=${encodeURIComponent(key)}`);
  const rec = Array.isArray(data) ? data[0] : data;
  const cfg = rec?.config_json ?? rec;
  dispatch({ type: 'pdfBrands/loaded', payload: { key, config: cfg } });
  return cfg;
};
