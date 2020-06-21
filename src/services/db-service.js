const db = require("../models");
const mysql = require("mysql");

const Message = db.Messages;
const Op = db.Sequelize.Op;
db.sequelize.sync({ force: true });
const { MESSAGE_CANNOT_BE_EMPTY } = require("../consts/errors");
let connection;

function handleDisconnect(db_config) {
  connection = mysql.createConnection(db_config); // Recreate the connection, since
  // the old one cannot be reused.
  const interval = checkIfCleanUpNeededAndClean();

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

const cleanOldData = async () => {
  const keepIds = await Message.findAll({
    order: [["id", "desc"]],
    limit: 1000
  });

  const deleted = await Message.destroy({
    where: {
      id: {
        [Op.notIn]: keepIds.map(({ id }) => id)
      }
    }
  });

  return deleted;
};

const checkIfCleanUpNeededAndClean = () => {
  return setInterval(() => {
    console.log("checking if cleaning is needed");
    const count = Message.findAndCountAll({});
    if (count > 1000) {
      const rowCount = cleanOldData();
      console.log(`${rowCount} messages were cleaned`);
    }
  }, 12 * 60 * 60 * 100);
};

const init = config => {
  handleDisconnect(config);
};

const addMessage = async message => {
  try {
    if (message.message.trim().length === 0) {
      throw new Error(MESSAGE_CANNOT_BE_EMPTY);
    }
    const msg = await new Message(message);
    msg.save();
    return msg;
  } catch (e) {
    console.error(e, e.stack);
    throw e;
  }
};

const getRecentMessages = async () => {
  try {
    const res = await Message.findAll({
      order: [["id", "DESC"]],
      limit: 10
    });

    const values = res.reverse().map(rowRes => rowRes.dataValues);
    return values;
  } catch (e) {
    console.error(e, e.stack);
    throw new Error("Message cannot be empty");
  }
};

module.exports = {
  init,
  getRecentMessages,
  addMessage
};
