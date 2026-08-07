import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

export const payment = async (data) => {
  const response = await axios.post(`${API_URL}/payment`, data);
  return response.data;
};
