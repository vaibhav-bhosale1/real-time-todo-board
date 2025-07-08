require('dotenv').config();
const express = require('express');
const connectDB = require('./config/db'); // Import the DB connection function

// Connect to database
connectDB();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware to parse JSON bodies
app.use(express.json());

// Basic route
app.get('/', (req, res) => {
  res.send('API is running...');
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});