require('dotenv').config(); // Load environment variables from .env file
const express = require('express');
const app = express();
const PORT = process.env.PORT || 5000; // Use port from environment variable or default to 5000

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