import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

export const agent2Free = async (data) => {
  const response = await axios.post(`${API_URL}/agent2Free`, data);
  return response.data;
};
