const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");

// THIS CREATES A USER MODEL USING MONGOOSE
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please tell us your name"],
  },
  email: {
    type: String,
    required: [true, "Please provide your email"],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, "Please provide a valid email"],
  },
  photo: String,
  password: {
    type: String,
    required: [true, "Please provide a password"],
    minlength: 8,
    select: false,
  },
  passwordConfirm: {
    type: String,
    required: [true, "Please confirm your password"],
    validate: {
      validator: function (el) {
        return el === this.password;
      },
      message: "Password are not the same",
    },
  },
});

//THIS FUNCTION ONLY WORKS IF THE PASSWORD WAS ACTUALLY MODIFIED
userSchema.pre("save", async function (next) {
  //RETURN IF PASSWORD WAS NOT MODIFIED AND MOVE TO THE NEXT FUNCTION
  if (!this.isModified("password")) return next();

  //HASH THE PASSWORD WITH COST OF 12
  this.password = await bcrypt.hash(this.password, 12);

  // DELETE PASSWORDCONFIRM FIELD
  this.passwordConfirm = undefined;
  next();
});

// COMPARE THE INSTANCES OF THE PASSWORD USING BCRYPT DURING LOG IN
userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

const User = mongoose.model("User", userSchema);

module.exports = User;
