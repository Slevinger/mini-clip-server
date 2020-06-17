const util = require("util");
const mysql = require("mysql");

let connection;

function handleDisconnect(db_config) {
  connection = mysql.createConnection(db_config); // Recreate the connection, since
  // the old one cannot be reused.

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
    // TODO: thibk about error handling in DB client.. should be here or outside?
    if (!message.trim()) {
      throw new Error("Message Cannot Be Empty");
    }
    const res = await query(
      `INSERT into \`messages\` (\`username\`,\`message\`,\`sent_at\`) VALUES('${username}','${message}','${new Date().getTime()}')`
    );
    await query(`commit`);
    return res;
  } catch (e) {
    console.error(e, e.stack);
    throw e;
  }
};

const getMessages = async () => {
  try {
    const res = await query(
      "SELECT `id`, `username`, `message`, `sent_at` FROM `messages` WHERE 1=1 order by id desc limit 10"
    );
    return res.reverse();
  } catch (e) {
    console.error(e, e.stack);
    throw e;
  }
};

// const cleanUp = setInterval(()=>{
//   try {
//     const res = await query(
//       "SELECT `id`, `username`, `message`, `sent_at` FROM `messages` WHERE 1=1 order by id desc limit 10"
//     );
//     return res.reverse();
//   } catch (e) {
//     console.error(e, e.stack);
//     throw e;
//   }
// },100*60)

module.exports = {
  init,
  getMessages,
  addMessage
};
