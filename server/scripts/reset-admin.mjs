import dotenv from 'dotenv';
import mongoose from 'mongoose';
import path from 'path';
import { fileURLToPath } from 'url';
import { ensureAdmin, ADMIN_EMAIL, ADMIN_PASSWORD } from '../src/utils/ensureAdmin.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../.env') });

const mongoUri = process.env.MONGODB_URI;
if (!mongoUri) {
  console.error('MONGODB_URI missing in server/.env');
  process.exit(1);
}

await mongoose.connect(mongoUri);
await ensureAdmin();
console.log('\nAdmin login credentials:');
console.log(`  Email:    ${ADMIN_EMAIL}`);
console.log(`  Password: ${ADMIN_PASSWORD}`);
console.log('\nUse the Admin tab on /auth/login\n');
await mongoose.disconnect();