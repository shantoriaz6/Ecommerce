import dotenv from "dotenv";
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import mongoose from "mongoose";
import bcrypt from "bcrypt";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({
    path: join(__dirname, '../../.env')
});

const testPassword = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(`${process.env.MONGODB_URL}/ecommerce`, {
      serverSelectionTimeoutMS: 5000
    });
    console.log('✓ Connected to DB');
    
    const Admin = mongoose.model('Admin', new mongoose.Schema({
      userName: String,
      email: String,
      password: String,
      refreshToken: String
    }, { timestamps: true }));
    
    const admin = await Admin.findOne({ email: 'admin@gadgetworld.com' });
    
    if (!admin) {
      console.log('✗ Admin not found');
      await mongoose.connection.close();
      process.exit(1);
    }
    
    console.log('✓ Admin found:', admin.email);
    console.log('  Username:', admin.userName);
    console.log('  Password hash:', admin.password.substring(0, 30) + '...');
    console.log('  Hash length:', admin.password?.length);
    
    // Test if it's already hashed
    const startsWithBcrypt = admin.password.startsWith('$2');
    console.log('  Looks like bcrypt hash:', startsWithBcrypt);
    
    // Test password comparison
    const testPass = 'admin123';
    console.log(`\nTesting password '${testPass}'...`);
    const isValid = await bcrypt.compare(testPass, admin.password);
    console.log(isValid ? '✓ Password matches!' : '✗ Password does not match');
    
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('✗ Error:', error.message);
    await mongoose.connection.close().catch(() => {});
    process.exit(1);
  }
};

testPassword();
