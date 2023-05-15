const Sequelize = require("sequelize");
//we add our personal details to the .env and call it in. The .env file stays in the .ignore so is never uploaded but always needs to be re-created for each developer.
require("dotenv").config();

// Creates a new instance of Sequelize within the database,
//using connection details from the environment variables
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: process.env.DB_DIALECT,
  }
);

module.exports = sequelize;
