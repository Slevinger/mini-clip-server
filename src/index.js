const express = require("express");

const http = require("http");
const dbClient = require("./services/db-service");

const { Socket } = require("./sockets/chat-room");
const app = express();
const server = http.createServer(app);
console.log(process.env);
(startServer = async () => {
  await dbClient.init({
    host: process.env.SQL_HOST,
    port: process.env.SQL_PORT,
    user: process.env.SQL_DB_NAME,
    password: process.env.SQL_DB_PAS,
    database: process.env.SQL_DB_NAME
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
