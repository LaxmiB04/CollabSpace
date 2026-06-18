import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import passport from 'passport';
import { configurePassport } from './config/passport.js';
import authRoutes from './routes/authRoutes.js';
import workspaceRoutes from './routes/workspaceRoutes.js';
import channelRoutes from './routes/channelRoutes.js';
import messageRoutes from './routes/messageRoutes.js';
import taskRoutes from './routes/taskRoutes.js';

dotenv.config();
configurePassport();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST'],
  },
});

app.use(cors());
app.use(express.json());
app.use(passport.initialize());

app.get('/', (req, res) => {
  res.json({ message: 'CollabSpace API is running!' });
});

app.use('/api/auth', authRoutes);
app.use('/api/workspaces', workspaceRoutes);
app.use('/api/channels', channelRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/tasks', taskRoutes);

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('joinChannel', (channelId) => {
    socket.join(channelId);
    console.log(`User ${socket.id} joined channel ${channelId}`);
  });

  socket.on('sendMessage', async (data) => {
    const { content, channelId, sender } = data;
    io.to(channelId).emit('receiveMessage', {
      content,
      channelId,
      sender,
      createdAt: new Date(),
    });
  });

  socket.on('typing', (data) => {
    socket.to(data.channelId).emit('userTyping', data);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB connected');
    httpServer.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => console.error(err));