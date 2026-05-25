const mongoose = require("mongoose");
const dotenv = require("dotenv");
const dns = require("dns");
dns.setServers(["8.8.8.8", "8.8.4.4"]);

process.on("uncaughtException", (err) => {
  console.log("UNCAUGHT EXCEPTION! Shutting down...");
  console.log(err.name, err.message);
  process.exit(1);
});

dotenv.config({ path: "./config.env" });
const app = require("./app");

// CONNECT HOSTED MONGODB TO APP USING MONGOOSE
const DB = process.env.DATABASE.replace(
  "<PASSWORD>",
  process.env.DATABASE_PASSWORD
);

mongoose
  .connect(DB, { family: 4 })
  .then(() => console.log("DB Connected Successfully"))
  .catch((err) => console.log(err));

const port = process.env.PORT || 3000;

const server = app.listen(port, () => {
  console.log(`Server running on port ${port}....`);
});

process.on("unhandledRejection", (err) => {
  console.log(err.name, err.message);
  console.log("UNHANDLED REJECTION! Shutting down...");
  server.close(() => {
    process.exit(1);
  });
});
