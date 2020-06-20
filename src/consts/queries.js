const INSERT_ONE_ROW_TO_MESSAGES = (username, message) =>
  `INSERT into \`messages\` (\`username\`,\`message\`,\`sent_at\`) VALUES('${username}','${message}','${new Date().getTime()}')`;

const GET_LAST_10_MESSAGES =
  "select * from (SELECT `id`, `username`, `message`, `sent_at` FROM `messages` WHERE 1=1 order by id desc limit 10) t where 1=1 order by id asc";

const REMOVE_ALL_BUT_LAST_50_MESSAGES = `delete from \`messages\` WHERE \`id\` in (
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
  INSERT_ONE_ROW_TO_MESSAGES,
  GET_LAST_10_MESSAGES,
  REMOVE_ALL_BUT_LAST_50_MESSAGES
};
