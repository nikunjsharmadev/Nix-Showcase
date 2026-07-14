import dotenv from 'dotenv';
import mongoose from 'mongoose';
dotenv.config();
export async function Database() {
  const dbUrl = process.env.DB_URL;
  if (!dbUrl) throw new Error('database url missing');
  try {
    await mongoose.connect(dbUrl, {
      autoIndex: true,
    });
    console.info('✅ Database connection Success');
  } catch {
    console.error('❌ Database connection failed');
    process.exit(1);
  }
}
