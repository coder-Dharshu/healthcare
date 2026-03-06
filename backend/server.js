const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const doctorRoutes = require('./routes/doctors');
const appointmentRoutes = require('./routes/appointments');
const symptomRoutes = require('./routes/symptoms');
const dashboardRoutes = require('./routes/dashboard');
const chatRoutes = require('./routes/chat');
const prescriptionRoutes = require('./routes/prescriptions');
const reportRoutes = require('./routes/reports');

const Message = require('./models/Message');

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: '*', methods: ['GET', 'POST'] }
});

app.use(cors());
app.use(express.json());

// REST Routes
app.use('/api/auth', authRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/symptoms', symptomRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/prescriptions', prescriptionRoutes);
app.use('/api/reports', reportRoutes);

app.get('/', (req, res) => res.json({ message: 'Healthcare API Running' }));

// Socket.io — Real-time Chat + Video Signaling
io.on('connection', (socket) => {
  console.log('Socket connected:', socket.id);

  socket.on('joinRoom', ({ room }) => {
    socket.join(room);
    console.log(`Socket ${socket.id} joined room ${room}`);
  });

  socket.on('sendMessage', async ({ room, senderId, senderName, text }) => {
    try {
      const msg = await Message.create({ room, sender: senderId, senderName, text });
      io.to(room).emit('newMessage', {
        _id: msg._id,
        room,
        sender: { _id: senderId, name: senderName },
        text,
        createdAt: msg.createdAt
      });
    } catch (err) {
      console.error('Message save error:', err.message);
    }
  });

  // WebRTC Video signaling
  socket.on('callUser', ({ to, signal, from, name }) => {
    io.to(to).emit('incomingCall', { signal, from, name });
  });

  socket.on('answerCall', ({ to, signal }) => {
    io.to(to).emit('callAccepted', signal);
  });

  socket.on('endCall', ({ to }) => {
    io.to(to).emit('callEnded');
  });

  socket.on('disconnect', () => {
    console.log('Socket disconnected:', socket.id);
  });
});

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('MongoDB Connected');
    server.listen(process.env.PORT || 5000, () =>
      console.log(`Server running on port ${process.env.PORT || 5000}`)
    );
  })
  .catch(err => console.error('DB Connection Error:', err));
