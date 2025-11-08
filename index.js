// server.js
import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import authRouter from './routes/Auth.js';
import businessRouter from './routes/BusinessIdeas.js';
import blogRouter from './routes/Blog.js';
import userRouter from './routes/User.js';
import http from 'http';
import { Server } from 'socket.io';
import Message from './models/Message.js';
import messageRouter from './routes/Message.js';
import connectDB from './util/ConnectDb.js'; // Updated import for Mongoose connection
import boardRouter from './routes/Bord.js';
import videoRoutes from './routes/video.js';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*' },
});

app.use(
  cors({
    origin: 'http://localhost:3000',
    credentials: true,
  })
);
app.use(express.json());
app.use(bodyParser.json({ limit: '30mb', extended: true }));
app.use(bodyParser.urlencoded({ limit: '30mb', extended: true }));
app.use('/uploads', express.static('uploads'));

// Connect to MongoDB via Mongoose
connectDB();

// Set up socket.io connection handlers
io.on('connection', (socket) => {
  console.log('new client connected: ', socket.id);

  socket.on('joinRoom', (conversationId) => {
    console.log(
      `Received joinRoom request for ${conversationId} from socket ${socket.id}`
    );
    socket.join(conversationId);
    console.log(`Socket ${socket.id} joined room ${conversationId}`);

    console.log('Current rooms:', socket.rooms);
  });

  socket.on('sendMessage', async (data) => {
    console.log('Message received from client: ', data);
    try {
      const message = new Message(data);
      await message.save();
      // console.log("message saved: ", message);
      //  Populate conversationId before emitting
      const populatedMessage = await message.populate(
        'conversationId',
        'participants'
      );
      console.log('Message saved & populated:', populatedMessage);
      const roomId = message.conversationId._id.toString();
      console.log(`📢 Emitting message to room: ${roomId}`);

      io.to(roomId).emit('message', populatedMessage);
      //  Log sockets in the room before sending messages
      // const clients = await io.in(message.conversationId).allSockets();
      // console.log(
      //   `Sending message to ${clients.size} clients in room ${message.conversationId}`
      // );

      // io.to(message.conversationId).emit("message", message);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  });

  socket.on('receiveMessage', (data) => {
    console.log('received message: ', data);
  });

  socket.on('disconnect', () => {
    console.log('client disconnected: ', socket.id);
  });
});
app.use('/api/v1', authRouter);
app.use('/api/v1', businessRouter);
app.use('/api/v1', blogRouter);
app.use('/api/v1', userRouter);
app.use('/api/v1', messageRouter);
app.use('/api/v1', boardRouter);
app.use('/api/v1', videoRoutes);

const PORT = process.env.PORT || 3000; // fallback for local dev
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
