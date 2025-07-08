require('dotenv').config();
const express = require('express');
const connectDB = require('./config/db');
const userRoutes = require('./routes/userRoutes');
const taskRoutes = require('./routes/taskRoutes'); // Assuming you've added this already

// Connect to database
connectDB();

const app = express();
const PORT = process.env.PORT || 5000;

// IMPORTANT: Middleware to parse JSON bodies - This must be BEFORE your routes
app.use(express.json()); // This line is crucial for parsing JSON request bodies

// Basic route
app.get('/', (req, res) => {
  res.send('API is running...');
});

// User Routes
app.use('/api/users', userRoutes);
// Task Routes (if you've already added them)
app.use('/api/tasks', taskRoutes);


// Basic Error Handling Middleware (can be expanded later)
app.use((err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode);
  res.json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});