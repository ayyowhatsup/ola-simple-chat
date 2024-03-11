import "dotenv/config";
import express from "express";
import ViteExpress from "vite-express";
import session from "express-session";
import { createServer } from "http";
import { Server } from "socket.io";
import sequelize, { Message } from "./sequelize.js";
import router from "./route.js";

const app = express();
const httpServer = createServer(app);

httpServer.listen(3000, () =>
  console.log("Server is listening on port 3000...")
);

const io = new Server(httpServer, { serveClient: false });

const sessionMiddleware = session({
  secret: process.env.CK_SECRET,
  saveUninitialized: true,
  cookie: {
    secure: process.env.CK_SECURE == 'true',
    httpOnly: process.env.CK_HTTP_ONLY == 'true',
    maxAge: Number(process.env.CK_MAX_AGE),
  },
});
// parse json request body
app.use(express.json());
app.use(sessionMiddleware);
// parse urlencoded request body
app.use(express.urlencoded({ extended: true }));
app.use("/api/v1", router);

io.engine.use(sessionMiddleware);

io.use((socket, next) => {
  if (socket.request.session.user) next();
  else next("authentication_required");
});

const sanitize = (text) => {
  let sanitizedText = text;
  if (text.indexOf("<") > -1 || text.indexOf(">") > -1) {
    sanitizedText = text.replace(/</g, "&lt").replace(/>/g, "&gt");
  }
  return sanitizedText;
};

const privateRoom = (userId1, userId2) =>
  userId1 < userId2
    ? `room:${userId1}:${userId2}`
    : `room:${userId2}:${userId1}`;
const online_users = {};
io.on("connection", function (socket) {
  const userId = socket.request.session.user.id;
  online_users[userId] = socket.id;
  socket.broadcast.emit("user.connected", userId);
  socket.on("room.join", (toId) => {
    socket.join(privateRoom(userId, toId));
  });
  socket.on("room.leave", (toId) => {
    socket.leave(privateRoom(userId, toId));
  });
  socket.on("message", async (msg) => {
    const message = { ...msg, message: sanitize(msg.message) };
    socket.broadcast.emit("user.connected", userId);
    Message.create(message)
      .then(async (newMessage) => {
        // :D
        const a = await newMessage.getSender();
        const b = await newMessage.getReceiver();
        const r = JSON.parse(JSON.stringify(message));
        r.sender = JSON.parse(JSON.stringify(a));
        r.receiver = JSON.parse(JSON.stringify(b));
        socket.emit("message.new", r);
        if (online_users[message.toId]) {
          socket.to(online_users[message.toId]).emit("message.new", r);
        }
        io.to(privateRoom(userId, message.toId)).emit("message", message);
      })
      .catch((e) => console.log(e));
  });
  socket.on("disconnect", function () {
    socket.broadcast.emit("user.disconnected", userId);
  });
});

async function start() {
  try {
    await sequelize.authenticate();
    sequelize.sync();
    ViteExpress.bind(app, io, function () {
      console.log("bind successfully!");
    });
  } catch (error) {
    console.log("error: " + error.message);
  }
}

start();
