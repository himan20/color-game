import dotenv from 'dotenv';

// Set the NODE_ENV to 'development' by default
process.env.NODE_ENV = process.env.NODE_ENV || 'development';

dotenv.config();

export const config = {
  port: process.env.PORT,
  logs: {
    level: process.env.LOG_LEVEL || 'silly',
  },
};
