const devConfig = require("../src/config/config.dev.json");

const env = {};

env.init = () => {
  switch (process.env.NODE_ENV) {
    case "prod":
      env.dbHost = process.env.SQL_HOST || "MISSING";
      env.dbPort = process.env.SQL_PORT || "MISSING";
      env.dbName = process.env.SQL_DB_NAME || "MISSING";
      env.dbPass = process.env.SQL_DB_PASS || "MISSING";
      break;
    default:
      env.dbHost = devConfig.dbHost || "MISSING";
      env.dbPort = devConfig.dbPort || "MISSING";
      env.dbName = devConfig.dbName || "MISSING";
      env.dbPass = devConfig.dbPass || "MISSING";
      break;
  }
  const missingFields = Object.keys(env).filter(key => env[key] === "MISSING");
  if (missingFields.length > 0) {
    console.error("missing mandatory env variables", missingFields);
    process.exit(1);
  }
  return env;
};

module.exports = env;
