const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const path = require('path');
const User = require('../models/User');

// Load environment variables dynamically based on file location
dotenv.config({ path: path.join(__dirname, '../.env') });

const seedAdmin = async () => {
  const mongoUri = process.env.MONGO_URI;

  if (!mongoUri) {
    console.error('Fatal Error: MONGO_URI is not defined in environment variables.');
    process.exit(1);
  }

  try {
    console.log('Connecting to database...');
    await mongoose.connect(mongoUri);
    console.log('Database connected successfully.');

    // Check if the default admin account already exists
    const adminEmail = 'admin@example.com';
    const adminExists = await User.findOne({ email: adminEmail });

    if (adminExists) {
      console.log(`An admin account with email '${adminEmail}' already exists. Seeding skipped.`);
      await mongoose.connection.close();
      process.exit(0);
    }

    console.log('Creating default administrator account...');

    // Hash default admin password explicitly
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('admin123', salt);

    await User.create({
      name: 'Default Admin',
      email: adminEmail,
      password: hashedPassword,
      role: 'admin',
      avatar: '',
    });

    console.log('----------------------------------------------------');
    console.log('Admin account seeded successfully!');
    console.log(`Email:    ${adminEmail}`);
    console.log('Password: admin123');
    console.log('----------------------------------------------------');

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error(`Fatal Error during admin seeding: ${error.message}`);
    process.exit(1);
  }
};

seedAdmin();
