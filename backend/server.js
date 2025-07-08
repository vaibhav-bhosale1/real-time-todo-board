// backend/server.js (or index.js)

const express = require('express');
const http = require('http'); // Import http module
const { Server } = require('socket.io'); // Import Server from socket.io
const dotenv = require('dotenv').config();
const connectDB = require('./config/db'); // Your DB connection
const taskRoutes = require('./routes/taskRoutes'); // Your task routes
const userRoutes = require('./routes/userRoutes'); // Your user routes
const { errorHandler } = require('./middleware/errorMiddleware');
const path = require('path');
const cors = require('cors'); // Import cors

const port = process.env.PORT || 5000;

connectDB(); // Connect to database

const app = express();
const server = http.createServer(app); // Create HTTP server from app

// Initialize Socket.IO with CORS settings
const io = new Server(server, {
    cors: {
        origin: ['http://localhost:5173', 'http://localhost:3000'], // Allow your frontend origin(s)
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
        credentials: true
    }
});

// Store io on the app object to make it accessible in controllers
app.set('io', io);

// Socket.IO connection handling (basic example)
io.on('connection', (socket) => {
    console.log(`User Connected: ${socket.id}`);

    socket.on('disconnect', () => {
        console.log('User Disconnected', socket.id);
    });

    // You might have other socket listeners here (e.g., for real-time updates)
});

// Middleware to parse JSON and URL-encoded data
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// CORS middleware (ensure it allows your frontend origin)
app.use(cors({
    origin: 'http://localhost:5173', // Your frontend URL
    credentials: true
}));

// Routes
app.use('/api/tasks', taskRoutes);
app.use('/api/users', userRoutes);
// Add other routes as needed

// Serve frontend (if applicable for deployment)
// For local development, this part is often commented out or handled differently
if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, '../frontend/dist')));

    app.get('*', (req, res) =>
        res.sendFile(path.resolve(__dirname, '../frontend/dist', 'index.html'))
    );
} else {
    app.get('/', (req, res) => res.send('Please set to production'));
}

// Error handling middleware (should be last middleware)
app.use(errorHandler);

server.listen(port, () => console.log(`Server running on port ${port}`));