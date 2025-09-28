import mongoose from 'mongoose';

export async function connectMongo() {
 const mongoUri = process.env.MONGO_URI;
 if (!mongoUri) {
   throw new Error('MONGO_URI environment variable is not defined');
 }
  await mongoose.connect(mongoUri);
  console.log('Connected to MongoDB');
}

