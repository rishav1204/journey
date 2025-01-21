import app from './src/app.js';
import connectDB from './src/database/dbConnection.js';
import { info, error } from './src/utils/errorLogger.utils.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const PORT = process.env.PORT || 3000;

// Connect to MongoDB
connectDB()
    .then(() => {
      info("Connected to MongoDB");
      app.listen(PORT, () => {
          info(`Server is running on port ${PORT}`);
          // Handle graceful shutdown of the server   
            process.on('SIGINT', () => {
                info('Shutting down server');
                process.exit(0);
            }
            );
      });
  })
  .catch((err) => {
    error(`Error connecting to MongoDB: ${err.message}`);
    process.exit(1);
  });


// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  error(`Uncaught Exception: ${err.message}`);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  error(`Unhandled Promise Rejection: ${err.message}`);
  process.exit(1);
});
