require('dotenv').config();
const WebSocket = require('ws');
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const User = require('./models/user');
require('dotenv').config();

connectDB();

const wss = new WebSocket.Server({ port: process.env.PORT || 8080 });

wss.on('connection', (ws) => {
  console.log("New client connected !");
  let userId;
  let timeoutHandle;

  ws.on('message', async (message) => {

    console.log(`message ${message}`);
    const data = JSON.parse(message);
    let user;

    if (data.userId) {
      user = await User.findOneAndUpdate(
        { userId: data.userId },
        { status: 'online', lastActive: Date.now() },
        { new: true }
      );
      userId = user.userId;
    } else {
      user = new User({ userId: new mongoose.Types.ObjectId().toString(), status: 'online', lastActive: Date.now() });
      await user.save();
      userId = user.userId;
    }

    ws.send(JSON.stringify({ userId: user.userId, status: user.status }));

    clearTimeout(timeoutHandle);
    timeoutHandle = setTimeout(async () => {
      await User.findOneAndUpdate(
        { userId: user.userId },
        { status: 'offline' }
      );
      ws.send(JSON.stringify({ userId: user.userId, status: 'offline' }));
    }, 5 * 1000); // 5 sec

  });

  const setOffline = async () => {
    console.log(`setOffline ${{ userId, status: 'offline' }}`);
    if (userId) {
      await User.findOneAndUpdate(
        { userId },
        { status: 'offline' }
      );
      ws.send(JSON.stringify({ userId, status: 'offline' }));
    }
  };

  ws.on('close', setOffline);
  ws.on('error', setOffline);
});


