import { io } from 'socket.io-client';

// The URL should match your backend's Socket.IO server URL.
// Since we are using a proxy in package.json, a relative path usually works fine in dev.
// For production, you might need the full URL (e.g., process.env.REACT_APP_BACKEND_URL).
const socket = io('https://real-time-todo-board.onrender.com', {
  // Optional: autoConnect: false, if you want to connect manually later
  // transports: ['websocket'], // Force WebSocket transport if needed
});

socket.on('connect', () => {
  console.log('Socket.IO connected:', socket.id);
});

socket.on('disconnect', (reason) => {
  console.log('Socket.IO disconnected:', reason);
});

socket.on('connect_error', (error) => {
  console.error('Socket.IO connection error:', error);
});

export default socket;