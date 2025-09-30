const mongoose = require("mongoose");
const dotenv = require("dotenv");
const app = require("./app");

dotenv.config({ path: "./config.env" });

// CONNECT HOSTED MONGODB TO APP USING MONGOOSE
const DB = process.env.DATABASE.replace(
  "<PASSWORD>",
  process.env.DATABASE_PASSWORD
);

mongoose
  .connect(DB)
  .then((con) => console.log(con.connections))
  .then(() => console.log("DB Connected Successfully"))
  .catch((err) => console.log(err));

// THIS CREATES A TOUR MODEL USING MONGOOSE
const tourSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "A tour must have a name"],
    unique: true,
  },
  rating: {
    type: Number,
    default: 4.5,
  },
  price: {
    type: Number,
    required: [true, "A tour must have a price"],
  },
});

const Tour = mongoose.model("Tour", tourSchema);

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Server running on port ${port}....`);
});
