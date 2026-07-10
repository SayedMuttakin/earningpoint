const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const path = require('path');
const User = require('./models/User');

dotenv.config({ path: path.join(__dirname, '.env') });

const createDemoUser = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error('MONGO_URI is not defined in environment variables.');
    }

    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB.');

    const email = 'playtest@zenivio.it.com';
    let user = await User.findOne({ phoneOrEmail: email });

    if (user) {
      console.log('Demo user already exists. Updating password and verification status...');
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash('Playtest@12345', salt);
      user.isEmailVerified = true;
      user.name = 'Play Store Reviewer';
      user.username = 'playreviewer';
      user.referralCode = 'PLAYTEST';
      user.balance = 500;
      user.points = 1000;
      user.lifetimePoints = 1000;
      await user.save();
      console.log('Demo user updated successfully.');
    } else {
      console.log('Creating demo user...');
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('Playtest@12345', salt);
      
      user = await User.create({
        name: 'Play Store Reviewer',
        phoneOrEmail: email,
        password: hashedPassword,
        username: 'playreviewer',
        referralCode: 'PLAYTEST',
        isEmailVerified: true,
        balance: 500,
        points: 1000,
        lifetimePoints: 1000,
      });
      console.log('Demo user created successfully.');
    }

    await mongoose.connection.close();
    console.log('Database connection closed.');
  } catch (error) {
    console.error('Error creating demo user:', error);
  }
};

createDemoUser();
