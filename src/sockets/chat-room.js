const socketio = require("socket.io");
const values = require("lodash/values");
const {
  usersByName,
  leaveRoom,
  getUsers,
  checkIfUserCanJoinAndJoin,
  addMessage,
  getRecentMessages
} = require("../services/chat-service.js");

const onJoinRoom = socket => async ({ username, imageUrl }, callback) => {
  const [userJoined, error] = await checkIfUserCanJoinAndJoin(
    username,
    imageUrl,
    socket.id
  );
  if (userJoined) {
    callback({
      users: values(getUsers()).reduce(
        (acc, user) => ({ ...acc, [user.username]: user }),
        {}
      ),
      messages: await getRecentMessages()
    });
    socket.broadcast.emit("joinedRoom", { username, imageUrl });
  } else {
    callback(null, error);
  }
};

const onDisconnect = socket => reason => {
  const user = leaveRoom(socket.id);
  if (user) {
    socket.emit("leftRoom", user);
  }
};
const onSendMessage = socket => async ({ username, message }, callback) => {
  try {
    if (usersByName[username]) {
      await addMessage(username, message);
      socket.emit("message", { username, message, sent_at: new Date() });
    } else {
      socket.emit("leftRoom", { username });
    }
  } catch (e) {
    callback(null, e.message);
  }
};
//server
const ChatRoom = server => {
  const io = socketio(server, { forceNew: true });
  io.on("connection", async socket => {
    try {
      socket.on("joinRoom", onJoinRoom(socket));
      socket.on("sendMessage", onSendMessage(socket));
      socket.on("disconnect", onDisconnect(socket));
    } catch (e) {
      console.error(e);
    }
  });
  io.on("error", error => {
    console.error(error);
  });

  return io;
};
module.exports = { ChatRoom };
