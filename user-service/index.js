import app from './src/app.js';
import connectDB from './src/database/dbConnection.js';
import logger from './src/utils/errorLogger.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const PORT = process.env.PORT || 8000;

// Test logging
logger.info("Starting application...");

// Connect to MongoDB
connectDB()
    .then(() => {
      logger.info("Connected to MongoDB");
      app.listen(PORT, () => {
          logger.info(`Server is running on port ${PORT}`);
          // Handle graceful shutdown of the server   
            process.on('SIGINT', () => {
                logger.info('Shutting down server');
                process.exit(0);
            }
            );
      });
  })
  .catch((err) => {
    logger.error(`Error connecting to MongoDB: ${err.message}`);
    process.exit(1);
  });


// Handle uncaught exceptions

process.on("uncaughtException", (err) => {
  logger.error(`Uncaught Exception: ${err.stack}`); // Use err.stack for full trace
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  logger.error(`Unhandled Promise Rejection: ${err.message}`);
  process.exit(1);
});
