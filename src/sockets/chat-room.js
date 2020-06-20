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

const onJoinRoom = emitter => async ({ username, imageUrl }, callback) => {
  const [userJoined, error] = await checkIfUserCanJoinAndJoin(
    username,
    imageUrl,
    emitter.id
  );
  if (userJoined) {
    callback({
      users: values(getUsers()).reduce(
        (acc, user) => ({ ...acc, [user.username]: user }),
        {}
      ),
      messages: await getRecentMessages()
    });
    emitter.broadcast.emit("joinedRoom", { username, imageUrl });
  } else {
    callback(null, error);
  }
};

const onDisconnect = emitter => reason => {
  const user = leaveRoom(emitter.id);
  if (user) {
    emitter.broadcast.emit("leftRoom", user);
  }
};
const onSendMessage = emitter => async ({ username, message }, callback) => {
  try {
    if (usersByName[username]) {
      await addMessage(username, message);
      emitter.emit("message", { username, message, sent_at: new Date() });
    } else {
      emitter.emit("leftRoom", { username });
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
      socket.on("sendMessage", onSendMessage(io));
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
