const socketio = require("socket.io");
const values = require("lodash/values");
const {
  getMessages,
  addMessage,
  joinRoom,
  leaveRoom,
  getUsers
} = require("../services/chat-service.js");

//server
const Socket = server => {
  const io = socketio(server, { forceNew: true });

  io.on("connection", async socket => {
    try {
      socket.on("joinRoom", async ({ username }, callback) => {
        const canJoin = await joinRoom(username, socket.id);
        if (canJoin) {
          callback({
            users: values(getUsers()),
            messages: await getMessages()
          });
          socket.broadcast.emit("joinedRoom", { username });
        } else {
          callback(null, "The name is taken");
        }
      });

      socket.on("sendMessage", async ({ username, message }, callback) => {
        try {
          if (values(getUsers()).includes(username)) {
            await addMessage(username, message);
            io.emit("message", { username, message, sent_at: new Date() });
          } else {
            io.emit("leftRoom", { username });
          }
        } catch (e) {
          callback(null, e);
        }
      });

      socket.on("disconnect", reason => {
        const username = leaveRoom(socket.id);
        if (username) {
          io.emit("leftRoom", { username });
        }
      });
    } catch (e) {
      console.log(e);
    }
  });
  io.on("error", error => {
    console.log(error);
  });

  return io;
};

module.exports = { Socket };
