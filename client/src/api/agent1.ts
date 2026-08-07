import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

export const agent1 = async (data) => {
  const response = await axios.post(`${API_URL}/agent1`, data);
  return response.data;
};
