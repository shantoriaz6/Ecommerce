import dotenv from "dotenv";
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import connectDB from "../db/index.js";
import { Admin } from "../models/admin.model.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({
    path: join(__dirname, '../../.env')
});

const listAdmins = async () => {
  try {
    await connectDB();
    
    const admins = await Admin.find().select('-password -refreshToken');
    
    console.log('\n=== Admin Accounts ===\n');
    
    if (admins.length === 0) {
      console.log('No admin accounts found.');
      console.log('\nTo create an admin account, send a POST request to:');
      console.log('http://localhost:8000/api/v1/admin/register');
      console.log('\nWith body: { "userName": "admin", "email": "admin@example.com", "password": "yourpassword" }');
    } else {
      admins.forEach((admin, index) => {
        console.log(`${index + 1}. Username: ${admin.userName}`);
        console.log(`   Email: ${admin.email}`);
        console.log(`   Created: ${admin.createdAt}`);
        console.log('');
      });
      
      console.log(`Total: ${admins.length} admin(s)\n`);
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error listing admins:', error);
    process.exit(1);
  }
};

listAdmins();
