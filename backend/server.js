require('dotenv').config();
const express = require('express');
const http = require('http'); // Import http module
const { Server } = require('socket.io'); // Import Server from socket.io
const connectDB = require('./config/db');
const userRoutes = require('./routes/userRoutes');
const taskRoutes = require('./routes/taskRoutes');

// Connect to database
connectDB();

const app = express();
const PORT = process.env.PORT || 5000;

// Create HTTP server instance from Express app
const server = http.createServer(app);

// Initialize Socket.IO with the HTTP server
// You might need to configure CORS for Socket.IO if your frontend is on a different origin
const io = new Server(server, {
  cors: {
    origin: "*", // Allow all origins for now, will restrict later for production
    methods: ["GET", "POST", "PUT", "DELETE"]
  }
});


// Middleware to parse JSON bodies - Must be before routes
app.use(express.json());

// Basic route
app.get('/', (req, res) => {
  res.send('API is running...');
});

// User Routes
app.use('/api/users', userRoutes);
// Task Routes
app.use('/api/tasks', taskRoutes);

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  // Example: Joining a room (e.g., a "board" room)
  socket.on('joinBoard', (boardId) => {
    socket.join(boardId);
    console.log(`${socket.id} joined board ${boardId}`);
  });

  // Handle disconnect
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});


// Error Handling Middleware
app.use((err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode);
  res.json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
});

// Start the server (using the http server, not just app)
server.listen(PORT, () => { // Change app.listen to server.listen
  console.log(`Server running on port ${PORT}`);
});

// Export io for use in controllers
module.exports = { app, server, io }; // Export io along with app and server