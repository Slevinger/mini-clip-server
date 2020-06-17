const values = require("lodash/values");

console.log("connecting to remote DB...");
let users = {};

const getUsers = () => {
  return users;
};

leaveRoom = id => {
  const username = users[id];
  delete users[id];
  return username;
};
const joinRoom = async (username, imageUrl, id) => {
  if (
    values(users)
      .map(user => user.username.toLowerCase())
      .includes(username.toLowerCase())
  ) {
    return false;
  }
  users[id] = { username, imageUrl };
  return true;
};

module.exports = { joinRoom, getUsers, leaveRoom };
