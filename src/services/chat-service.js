const validator = require("validator");
const { addMessage, getRecentMessages } = require("../services/db-service.js");
const {
  USER_NAME_ALPHANUMERIC,
  NAME_IS_TAKEN,
  TOO_MANY_USERS
} = require("../consts/errors");

const usersByID = {};
const usersByName = {};

const getUsers = () => {
  return usersByID;
};

leaveRoom = id => {
  const { username } = usersByID[id] || {};
  delete usersByID[id];
  delete usersByName[username];
  return username;
};

const canUserJoinRoom = username => {
  if (Object.values(usersByName).filter(Boolean).length === 1) {
    return [false, TOO_MANY_USERS];
  }
  if (!validator.isAlphanumeric(username)) {
    return [false, USER_NAME_ALPHANUMERIC];
  }

  if (usersByName[username]) {
    return [false, NAME_IS_TAKEN];
  }

  return [true, null];
};

const checkIfUserCanJoinAndJoin = async (username, imageUrl, id) => {
  const [userCanJoin, error] = canUserJoinRoom(username);
  if (userCanJoin) {
    usersByID[id] = { username, imageUrl };
    usersByName[username] = usersByID[id];
    return [userCanJoin, error];
  } else {
    return [false, error];
  }
};
module.exports = {
  checkIfUserCanJoinAndJoin,
  getUsers,
  leaveRoom,
  canUserJoinRoom,
  getRecentMessages,
  addMessage,
  usersByName
};
