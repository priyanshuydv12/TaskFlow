const http = require('http');
const socketIo = require('socket.io');
const app = require('./app');
const connectDB = require('./config/db');

const PORT = process.env.PORT || 5001;

const server = http.createServer(app);

// Attach Socket.io
const io = socketIo(server, {
  cors: {
    origin: '*', // Will be restricted to client URL in later phases
    methods: ['GET', 'POST']
  }
});

// Basic Socket connection logs
io.on('connection', (socket) => {
  console.log(`Socket client connected: ${socket.id}`);
  
  socket.on('disconnect', () => {
    console.log(`Socket client disconnected: ${socket.id}`);
  });
});

// Async wrapper to connect to DB before starting server listening
const startServer = async () => {
  // Connect to database
  await connectDB();

  // Start the server
  server.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  });
};

startServer();
