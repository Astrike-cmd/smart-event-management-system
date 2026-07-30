import mongoose from 'mongoose';

const databaseState = {
  status: 'disconnected',
  message: 'MongoDB connection has not been initialized.'
};

export const getDatabaseState = () => databaseState;

const connectDatabase = async () => {
  const { MONGODB_URI } = process.env;

  if (!MONGODB_URI) {
    databaseState.status = 'disconnected';
    databaseState.message =
      'MONGODB_URI is missing. Add your MongoDB Atlas connection string in backend/.env.';
    console.warn(databaseState.message);
    return;
  }

  try {
    const connection = await mongoose.connect(MONGODB_URI);
    databaseState.status = 'connected';
    databaseState.message = `MongoDB connected: ${connection.connection.host}`;
    console.log(databaseState.message);
  } catch (error) {
    databaseState.status = 'error';
    databaseState.message = error.message;
    console.error(`MongoDB connection failed: ${error.message}`);
  }
};

export default connectDatabase;
