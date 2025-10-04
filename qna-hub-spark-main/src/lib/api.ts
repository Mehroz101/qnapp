import axiosClient from './axiosClient';
import type { InterviewQuestion } from '../types';

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
    localStorage.removeItem('accessToken');

    return {
      message: 'Logged out',
    };
  },
};

export const userApi = {
  async getMyQuestions() {
    const res = await axiosClient.get('/qna/me/questions');
    return res.data;
  },
};

export const questionsApi = {
  async list(params?: { search?: string; categories?: string[]; sortBy?: string, limit: number, cursor?: string | null}) {
   
    return (await axiosClient.get('/qna', { params })).data;
  },
  async addQuestion(data: Partial<InterviewQuestion>) {
    return (await axiosClient.post('/qna', data)).data;
  },
  async upvote(id: string) {
    return (await axiosClient.post(`/qna/${id}/upvote`)).data;
  },
  async downvote(id: string) {
    return (await axiosClient.post(`/qna/${id}/downvote`)).data;
  },
  async bookmark(id: string) {
    return (await axiosClient.post(`/qna/${id}/bookmark`)).data;
  },
  async editQuestion(data: { _id: string } & Partial<InterviewQuestion>) {
    // Sends a PUT request to update a question by _id
    return (await axiosClient.put(`/qna/${data._id}`, data)).data;
  },
  async generateWithAI(prompt: string) {
    return (await axiosClient.post('/qna/generate', { prompt })).data;
  },
  async viewQuestion(id: string) {
    return (await axiosClient.post(`/qna/view`, { questionId: id })).data;
  },
  async getCategories() {
    return (await axiosClient.get('/qna/categories')).data;
  }
};
