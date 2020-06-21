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
    const messages = await getRecentMessages();
    callback({
      users: values(getUsers()).reduce(
        (acc, user) => ({ ...acc, [user.username]: user }),
        {}
      ),
      messages
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
    const sent_at = new Date().getTime();
    if (usersByName[username]) {
      await addMessage({ username, message, sent_at });
      emitter.emit("message", { username, message, sent_at });
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
