import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

export const agent3Free = async (data) => {
  const response = await axios.post(`${API_URL}/agent3Free`, data);
  return response.data;
};
