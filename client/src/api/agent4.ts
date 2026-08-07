import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

export const agent4 = async (data) => {
  const response = await axios.post(`${API_URL}/agent4`, data);
  return response.data;
};
