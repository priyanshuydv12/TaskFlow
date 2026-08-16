const http = require('http');
const socketIo = require('socket.io');
const app = require('./app');
const connectDB = require('./config/db');

const { initSockets } = require('./sockets/socketHandler');

const PORT = process.env.PORT || 5001;

const server = http.createServer(app);

// Attach Socket.io
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';
const io = socketIo(server, {
  cors: {
    origin: CLIENT_URL,
    methods: ['GET', 'POST'],
    credentials: true
  }
});

const { checkDeadlines } = require('./utils/deadlineChecker');

// Initialize authenticated Socket.io handler
initSockets(io);

// Async wrapper to connect to DB before starting server listening
const startServer = async () => {
  // Connect to database
  await connectDB();

  // Start the server
  server.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
    
    // Execute deadline checks on boot
    checkDeadlines(io);
    
    // Check every hour
    setInterval(() => {
      checkDeadlines(io);
    }, 60 * 60 * 1000);
  });
};

startServer();
