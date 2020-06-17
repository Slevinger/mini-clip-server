const express = require("express");

const http = require("http");
const dbClient = require("./services/db-service");

const { Socket } = require("./sockets/chat-room");
const app = express();
const server = http.createServer(app);

(startServer = async () => {
  await dbClient.init({
    host: "remotemysql.com",
    port: 3306,
    user: "Chg9hWNC5G",
    password: "Jg5rR15uDe",
    database: "Chg9hWNC5G"
  });
  Socket(server); // assign server to socket io
  const port = process.env.PORT || 3000;

  app.set("port", port);

  app.get("/healtz", (req, res) => {
    res.send("ok");
  });

  server.listen(port, () => {
    console.log("Server is listening on " + port);
  });
})();
