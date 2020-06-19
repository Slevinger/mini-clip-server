const insertMessageAndUserToTable = (username, message) =>
  `INSERT into \`messages\` (\`username\`,\`message\`,\`sent_at\`) VALUES('${username}','${message}','${new Date().getTime()}')`;

const getLastTenMessagesFromTable =
  "SELECT `id`, `username`, `message`, `sent_at` FROM `messages` WHERE 1=1 order by id desc limit 10";

const removeAllButLast50Messages = `delete from \`messages\` WHERE \`id\` in (
    SELECT \`id\`  from (
        SELECT @rownum:=@rownum+1 rownum, 
        t.* 
      FROM (SELECT @rownum:=0) r,
        \`messages\` t 
      where 1=1 
      ORDER by t.id 
    ) tt 
    where 1=1 
    and tt.rownum > 100)`;

module.exports = {
  insertMessageAndUserToTable,
  getLastTenMessagesFromTable,
  removeAllButLast50Messages
};
