const express = require("express");

const http = require("http");

const { Socket } = require("./sockets/chat-room");
const app = express();
const server = http.createServer(app);

Socket(server); // assign server to socket io
const port = process.env.PORT || 3000;

app.set("port", port);

app.get("/", (req, res) => {
  res.send("mini-clip chat");
});

server.listen(port, () => {
  console.log("Server is listening on " + port);
});
