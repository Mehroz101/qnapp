import axiosClient from './axiosClient';

export const authApi = {
  async getProfile() {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      return null;
    }
    const res = await axiosClient.get('/auth/me', { headers: { Authorization: `Bearer ${token}` } });
    return res;
  },
  async login(username: string, password: string) {
    const res = await axiosClient.post('/auth/login', { username, password });
    return res;
  },
  async logout() {
    const res = await axiosClient.post('/auth/logout');
    return res;
  },
};

export const userApi = {
  async getMyQuestions() {
    const res = await axiosClient.get('/qna/me/questions');
    return res.data;
  },
};
