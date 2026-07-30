import mongoose from 'mongoose';
import User from '../models/User.js';

const bootstrapAdminUser = async () => {
  const { ADMIN_NAME, ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;

  if (mongoose.connection.readyState !== 1) {
    return;
  }

  if (!ADMIN_NAME || !ADMIN_EMAIL || !ADMIN_PASSWORD) {
    return;
  }

  try {
    const existingAdmin = await User.findOne({ email: ADMIN_EMAIL.toLowerCase().trim() });

    if (existingAdmin) {
      return;
    }

    await User.create({
      name: ADMIN_NAME.trim(),
      email: ADMIN_EMAIL.toLowerCase().trim(),
      password: ADMIN_PASSWORD,
      role: 'admin'
    });

    console.log(`Default admin created for ${ADMIN_EMAIL}`);
  } catch (error) {
    console.error(`Admin bootstrap failed: ${error.message}`);
  }
};

export default bootstrapAdminUser;
