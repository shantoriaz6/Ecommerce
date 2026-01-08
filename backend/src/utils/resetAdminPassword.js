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

const resetPassword = async () => {
  try {
    await connectDB();
    
    const email = process.argv[2];
    const newPassword = process.argv[3];
    
    if (!email || !newPassword) {
      console.error('Usage: node resetAdminPassword.js <admin-email> <new-password>');
      process.exit(1);
    }
    
    const admin = await Admin.findOne({ email });
    
    if (!admin) {
      console.error(`Admin with email ${email} not found`);
      process.exit(1);
    }
    
    console.log(`Found admin: ${admin.userName} (${admin.email})`);
    
    // Update password - this will trigger the pre-save hook
    admin.password = newPassword;
    await admin.save();
    
    console.log('Password updated successfully!');
    console.log(`You can now login with email: ${email} and the new password`);
    
    process.exit(0);
  } catch (error) {
    console.error('Error resetting password:', error);
    process.exit(1);
  }
};

resetPassword();
