const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config({ path: "./config.env" });
const app = require("./app");

// CONNECT HOSTED MONGODB TO APP USING MONGOOSE
const DB = process.env.DATABASE.replace(
  "<PASSWORD>",
  process.env.DATABASE_PASSWORD
);

mongoose
  .connect(DB)
  // .then((con) => console.log(con.connections))
  .then(() => console.log("DB Connected Successfully"))
  .catch((err) => console.log(err));

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Server running on port ${port}....`);
});
