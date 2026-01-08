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

const setupAdmin = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(`${process.env.MONGODB_URL}/ecommerce`);
    console.log('✓ Connected to MongoDB\n');
    
    // Drop existing admins collection
    try {
      await mongoose.connection.collection('admins').drop();
      console.log('✓ Cleared existing admin accounts');
    } catch (err) {
      console.log('ℹ No existing admin collection to clear');
    }
    
    // Create new admin account
    const adminData = {
      userName: 'admin',
      email: 'admin@gadgetworld.com',
      password: await bcrypt.hash('admin123', 10),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    await mongoose.connection.collection('admins').insertOne(adminData);
    
    console.log('\n✓ Admin account created successfully!\n');
    console.log('='.repeat(50));
    console.log('Login Credentials:');
    console.log('='.repeat(50));
    console.log(`  Email:    ${adminData.email}`);
    console.log(`  Username: ${adminData.userName}`);
    console.log(`  Password: admin123`);
    console.log('='.repeat(50));
    console.log('\nYou can now login at: http://localhost:5173/admin/login\n');
    
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('✗ Error:', error.message);
    await mongoose.connection.close().catch(() => {});
    process.exit(1);
  }
};

setupAdmin();
