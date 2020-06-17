const socketio = require("socket.io");
var validator = require("validator");

const values = require("lodash/values");
const {
  joinRoom,
  leaveRoom,
  getUsers
} = require("../services/chat-service.js");
const { addMessage, getMessages } = require("../services/db-service.js");

//server
const Socket = server => {
  const io = socketio(server, { forceNew: true });
  io.on("connection", async socket => {
    try {
      socket.on("joinRoom", async ({ username, imageUrl }, callback) => {
        if (!validator.isAlpha(username)) {
          return callback(null, "Username must be alphaNumeric");
        }
        const canJoin = await joinRoom(username, imageUrl, socket.id);
        if (canJoin) {
          callback({
            users: values(getUsers()).reduce(
              (acc, user) => ({ ...acc, [user.username]: user }),
              {}
            ),
            messages: await getMessages()
          });
          socket.broadcast.emit("joinedRoom", { username, imageUrl });
        } else {
          callback(null, "The name is taken");
        }
      });

      socket.on("sendMessage", async ({ username, message }, callback) => {
        try {
          if (
            values(getUsers()).findIndex(user => user.username == username) >= 0
          ) {
            await addMessage(username, message);
            io.emit("message", { username, message, sent_at: new Date() });
          } else {
            io.emit("leftRoom", { username });
          }
        } catch (e) {
          callback(null, e.message);
        }
      });
      /*
socket.on("image", function(info) {
  if (info.image) {
    var img = new Image();
    img.src = 'data:image/jpeg;base64,' + info.buffer;
    ctx.drawImage(img, 0, 0);
  }
});
 */

      socket.on("disconnect", reason => {
        const user = leaveRoom(socket.id);
        if (user) {
          io.emit("leftRoom", user);
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
