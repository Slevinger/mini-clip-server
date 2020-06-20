const util = require("util");
const mysql = require("mysql");
const { MESSAGE_CANNOT_BE_EMPTY } = require("../consts/errors");
const {
  INSERT_ONE_ROW_TO_MESSAGES,
  GET_LAST_10_MESSAGES,
  REMOVE_ALL_BUT_LAST_50_MESSAGES
} = require("../consts/queries");
let connection;

function handleDisconnect(db_config) {
  connection = mysql.createConnection(db_config); // Recreate the connection, since
  // the old one cannot be reused.
  const interval = startCleanUp();

  connection.connect(function(err) {
    // The server is either down
    if (err) {
      // or restarting (takes a while sometimes).
      console.log("error when connecting to db:", err);
      setTimeout(handleDisconnect, 2000, db_config); // We introduce a delay before attempting to reconnect,
    } // to avoid a hot loop, and to allow our node script to
  }); // process asynchronous requests in the meantime.
  // If you're also serving http, display a 503 error.
  connection.on("error", function(err) {
    clearInterval(interval);
    console.log("db error", err);
    if (err.code === "PROTOCOL_CONNECTION_LOST") {
      console.log("DB disconected! trying to reconnect...");
      // Connection to the MySQL server is usually
      handleDisconnect(db_config); // lost due to either server restart, or a
    } else {
      // connnection idle timeout (the wait_timeout
      throw err; // server variable configures this)
    }
  });
}

const startCleanUp = () => {
  return setInterval(async () => {
    console.log("cleaning");
    const res = await queryAndCommit(REMOVE_ALL_BUT_LAST_50_MESSAGES);
    if (res.affectedRows === 0) {
      clearInterval(interval);
    }
  }, 24 * 60 * 60 * 100);
};

const init = config => {
  handleDisconnect(config);
};

const closeConnection = () => {
  return util.promisify(connection.end).call(connection);
};

const queryAndCommit = async (sql, ...args) => {
  const res = await util
    .promisify(connection.query)
    .call(connection, sql, args);
  await query(`commit`);
  return res;
};

const query = async (sql, ...args) => {
  return util.promisify(connection.query).call(connection, sql, args);
};

const addMessage = async (username, message) => {
  try {
    if (!message.trim()) {
      throw new Error(MESSAGE_CANNOT_BE_EMPTY);
    }
    return queryAndCommit(INSERT_ONE_ROW_TO_MESSAGES(username, message));
  } catch (e) {
    console.error(e, e.stack);
    throw e;
  }
};
const getRecentMessages = async () => {
  try {
    return query(GET_LAST_10_MESSAGES);
  } catch (e) {
    console.error(e, e.stack);
    throw e;
  }
};

module.exports = {
  init,
  getRecentMessages,
  addMessage
};
