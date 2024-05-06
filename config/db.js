const mongoose = require('mongoose');
const config = require("./variables")
const kleur = require("kleur")

const { bold, red, green } = kleur;

const connectDB = () =>
  mongoose
    .connect(config.MONGODB_URL || "")
    .then(() =>
      console.log(
        bold(green(`⚡️[Database]: Database connection successful`)))
      
    )
    .catch((err) => {
      console.log(err);
      console.log(bold(red(`Failed to connect to database: ${err.message}`)));
      setTimeout(connectDB, 5000);
    });


module.exports = connectDB;
