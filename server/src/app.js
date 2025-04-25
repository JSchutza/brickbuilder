const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { notFound, errorHandler } = require('./middlewares/errorMiddleware');
const userRoutes = require('./routes/userRoutes');
const buildRoutes = require('./routes/buildRoutes');

// Load environment variables
dotenv.config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Welcome route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to BrickBuilder API' });
});

// Connect to MongoDB
app.get('/api/test-db', async (req, res) => {
  try {
    const mongoose = require('mongoose');
    const isConnected = mongoose.connection.readyState === 1;
    
    if (isConnected) {
      res.json({ status: 'success', message: 'Database connection is active' });
    } else {
      res.status(500).json({ status: 'error', message: 'Database is not connected' });
    }
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});


// Routes
app.use('/api/users', userRoutes);
app.use('/api/builds', buildRoutes);

// Error handling middlewares
app.use(notFound);
app.use(errorHandler);

module.exports = app; 