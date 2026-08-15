import mongoose from 'mongoose';
import { ENV, isDevelopmentEnv, MONGOOSE_OPTIONS, PROCESS } from './constants/const.js';
// DATABASE
export async function Database() {
  const dbUrl = isDevelopmentEnv ? ENV.DB_DEV! : ENV.DB_PROD!;
  if (!dbUrl) throw new Error('database url missing');
  try {
    await mongoose.connect(dbUrl, MONGOOSE_OPTIONS);
    console.info('✅ Database connection Success');
    if (mongoose.connection.db) {
      mongoose.connection.db.admin().command({ ping: 1 });
      console.info('Pinged your deployment successfully, connected to MongoDB!');
    }
  } catch (e) {
    console.error(e);
    console.error('❌ Database connection failed');
    PROCESS.exit(1);
  }
}
