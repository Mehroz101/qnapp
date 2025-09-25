import dotenv from 'dotenv';

dotenv.config();

export const env = {
  port: parseInt(process.env.PORT || '4000', 10),
  jwtSecret: process.env.JWT_SECRET || 'dev_secret_change_me',
  mongoUri: process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/qna_hub',
  useMockApi: (process.env.USE_MOCK_API || 'true').toLowerCase() === 'true',
  clientOrigin: process.env.CLIENT_ORIGIN || 'http://localhost:5173'
};


