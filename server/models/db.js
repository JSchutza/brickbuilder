const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@jschutzacluster.vzcgxea.mongodb.net/brickbuilddb?retryWrites=true&w=majority&appName=jschutzaCluster`;


async function connectDB() {
  try {
    await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('MongoDB Connected');
  } catch (err) {
    console.error('MongoDB connection error:', err);
    throw err;
  }
}

module.exports = connectDB;