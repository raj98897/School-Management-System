import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import User from '../models/User.js';

dotenv.config();

const seedAdmin = async () => {
  try {
    const mongoURI = process.env.MONGO_URI;
    if (mongoURI) {
      await mongoose.connect(mongoURI);
      console.log('MongoDB Connected for Seeding...');
    }

    const adminEmail = 'admin@school.com';
    const adminPassword = 'admin123';

    if (mongoURI) {
      const adminExists = await User.findOne({ email: adminEmail });
      if (adminExists) {
        console.log('Admin account already exists in MongoDB.');
        process.exit();
      }

      const hashedPassword = await bcrypt.hash(adminPassword, 10);
      await User.create({
        name: 'System Admin',
        email: adminEmail,
        password: hashedPassword,
        role: 'admin',
        phone: '+1 (555) 019-2834'
      });

      console.log('Default Admin created successfully in MongoDB:');
      console.log(`Email: ${adminEmail}`);
      console.log(`Password: ${adminPassword}`);
      console.log(`Role: admin`);
      process.exit();
    } else {
      console.log('Running in local/preview mode. Default accounts:');
      console.log('Admin   -> Email: admin@school.com   | Password: admin123');
      console.log('Teacher -> Email: teacher@school.com | Password: teacher123');
      console.log('Student -> Email: student@school.com | Password: student123');
    }
  } catch (error) {
    console.error('Error seeding admin:', error);
    process.exit(1);
  }
};

seedAdmin();
