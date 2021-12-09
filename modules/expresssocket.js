import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import http from 'http';
import {
  Server
} from 'socket.io';
import {
  path,
  dirname
} from './defaults.js';
import {
  addIOuser
} from './user.js';

const app = express();
const httpServer = http.createServer(app);
httpServer.listen(process.env.PORT, () => {
  console.log(`HTTP/socket Server running on port ${process.env.PORT}`);
});
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});
export default {
  io
};

io.sockets.on('connection', (socket) => {
  // FIXME: Something better
  let clientIp = '0.0.0.0';
  if ('x-real-ip' in socket.handshake.headers) {
    clientIp = socket.handshake.headers['x-real-ip'];
  } else {
    clientIp = socket.handshake.address.split(':').pop().toString();
  }
  const userID = Math.round(clientIp.split('.').reduce((a, b) => a + b, 0) * Math.PI);
  addIOuser(socket, clientIp, userID);
  // TODO: Create user in DB, pass user when adding pos FIXME: get a better formula for IP2ID
  // TODO: Pass to data.js and match with udpServer
  // const userID = Math.round(clientIp.split('.').reduce((a, b) => a + b, 0) * Math.PI)
  // socket.emit('chordPack',)
});

// Access the session as req.session

app.use(express.static(path.join(`${dirname}/dist`)));

export {
  io
};