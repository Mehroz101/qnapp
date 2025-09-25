import mongoose from 'mongoose';
import { env } from '../config/env';

export async function connectMongo() {
  if (env.useMockApi) {
    console.log('USE_MOCK_API=true → skipping Mongo connection');
    return;
  }
  await mongoose.connect(env.mongoUri);
  console.log('Connected to MongoDB');
}


