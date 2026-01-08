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

const forceUpdatePassword = async () => {
  try {
    await mongoose.connect(`${process.env.MONGODB_URL}/ecommerce`);
    console.log('✓ Connected to MongoDB');
    
    const email = 'admin@gadgetworld.com';
    const newPassword = 'admin123';
    
    // Hash the password directly
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    console.log('✓ Password hashed');
    
    // Update directly in database
    const result = await mongoose.connection.collection('admins').updateOne(
      { email },
      { $set: { password: hashedPassword } }
    );
    
    if (result.modifiedCount > 0) {
      console.log('✓ Password updated successfully!');
      console.log(`\nLogin credentials:`);
      console.log(`  Email: ${email}`);
      console.log(`  Password: ${newPassword}`);
    } else {
      console.log('✗ No admin found with that email');
    }
    
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('✗ Error:', error.message);
    process.exit(1);
  }
};

forceUpdatePassword();
