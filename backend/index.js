const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const cors = require("cors");
const PORT = process.env.PORT || 4000;

app.use(cors());

const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

let users = [];

io.on("connection", (socket) => {
  console.log(`⚡: ${socket.id} user just connected!`);
  socket.on("message", (data) => {
    io.emit("messageResponse", data);
  });

  socket.on("typing", (data) => socket.broadcast.emit("typingResponse", data));

  //Listens when a new user joins the server
  socket.on("newUser", (data) => {
    users.push(data);
    io.emit("newUserResponse", users);
  });

  socket.on("disconnect", () => {
    console.log("🔥: A user disconnected");
    //Updates the list of users when a user disconnects from the server
    users = users.filter((user) => user.socketID !== socket.id);
    io.emit("newUserResponse", users);
    socket.disconnect();
  });
});

app.get("/", (req, res) => {
  res.send("<h1>Hello world</h1>");
});

server.listen(PORT, () => {
  console.log("listening on *:" + PORT);
});