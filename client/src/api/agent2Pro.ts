import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

export const agent2Pro = async (data) => {
  const response = await axios.post(`${API_URL}/agent2Pro`, data);
  return response.data;
};
