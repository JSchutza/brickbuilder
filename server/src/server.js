const app = require('./app');
const connectDB = require('./config/db');

// Connect to MongoDB
connectDB();

// Set port
const PORT = process.env.PORT || 5000;

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 