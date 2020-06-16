const values = require("lodash/values");
const { makeDb } = require("./db");
const db = makeDb({
  host: "remotemysql.com",
  port: 3306,
  user: "Chg9hWNC5G",
  password: "Jg5rR15uDe",
  database: "Chg9hWNC5G"
});

console.log("connecting to remote DB...");
let messages = [];
let users = {};
//SELECT `id`, `username`, `message`,  CONVERT_TZ(`sent_at`,'SYSTEM','Asia/Jerusalem') FROM `messages` WHERE 1 order by sent_at desc limit 10
const getMessages = async () => {
  if (messages.length == 0) {
    const results = await db.query(
      "SELECT `id`, `username`, `message`, `sent_at` FROM `messages` WHERE 1 order by sent_at desc limit 10"
    );
    messages = results.reverse();
    return messages;
  } else {
    return messages;
  }
};

const getUsers = () => {
  return users;
};

leaveRoom = id => {
  const username = users[id];
  delete users[id];
  return username;
};
const joinRoom = async (username, id) => {
  if (
    values(users)
      .map(user => user.toLowerCase())
      .includes(username.toLowerCase())
  ) {
    return false;
  }
  users[id] = username;
  return true;
};
const addMessage = async (username, text) => {
  try {
    const res = await db.query(
      `INSERT into \`messages\` (\`username\`,\`message\`,\`sent_at\`) VALUES('${username}','${text}','${new Date().getTime()}')`
    );
  } catch (e) {
    console.log(e);
  }
};

module.exports = { getMessages, addMessage, joinRoom, getUsers, leaveRoom };
