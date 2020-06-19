const util = require("util");
const mysql = require("mysql");
const { MESSAGE_CANNOT_BE_EMPTY } = require("../consts/errors");
const {
  insertMessageAndUserToTable,
  getLastTenMessagesFromTable,
  removeAllButLast50Messages
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
    console.log("clening");
    const res = await query(removeAllButLast50Messages);
    if (res.affectedRows === 0) {
      clearInterval(interval);
    }
    await query("commit");
  }, 24 * 60 * 60 * 100);
};

const init = config => {
  handleDisconnect(config);
};

const closeConnection = () => {
  return util.promisify(connection.end).call(connection);
};

const query = async (sql, ...args) => {
  return await util.promisify(connection.query).call(connection, sql, args);
};

const addMessage = async (username, message) => {
  try {
    if (!message.trim()) {
      throw new Error(MESSAGE_CANNOT_BE_EMPTY);
    }
    const res = await query(insertMessageAndUserToTable(username, message));
    await query(`commit`);
    return res;
  } catch (e) {
    console.error(e, e.stack);
    throw e;
  }
};

const getMessages = async () => {
  try {
    const res = await query(getLastTenMessagesFromTable);
    return res.reverse();
  } catch (e) {
    console.error(e, e.stack);
    throw e;
  }
};

module.exports = {
  init,
  getMessages,
  addMessage
};
