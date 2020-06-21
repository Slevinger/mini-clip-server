module.exports = (sequelize, Sequelize) => {
  const Message = sequelize.define(
    "message",
    {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
      },
      username: {
        type: Sequelize.STRING
      },
      message: {
        allowNull: false,
        type: Sequelize.STRING(1000)
      },
      sent_at: {
        type: Sequelize.INTEGER
      }
    },
    { timestamps: false, initialAutoIncrement: 0 }
  );

  return Message;
};
