const crypto = require("crypto");
const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const AppError = require("../utils/appError");

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
  role: {
    type: String,
    enum: ["user", "guide", "lead-guide", "admin"],
    default: "user",
  },
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
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  active: {
    type: Boolean,
    default: true,
    select: false,
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

// THIS MIDDLEWARE UPDATES THE PASSWORDCHANGEDAT AFTER THE PASSWORD HAS BEEN RESET
userSchema.pre("save", function (next) {
  if (!this.isModified("password") || this.isNew) return next();

  this.passwordChangedAt = Date.now() - 1000;
  next();
});

// THIS QUERY MIDDLEWARE POINTS TO THE CURRENT QUERY AND RETURN ONLY USERS WITH ACTIVE SET TO TRUE
userSchema.pre(/^find/, function (next) {
  this.find({ active: { $ne: false } });
  next();
});

// COMPARE THE INSTANCES OF THE PASSWORD USING BCRYPT DURING LOG IN
userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

// COMPARE PASSWORD CREATION TIMESTAMP TO AVOID SOMEONE USING STOLEN TOKEN AFTER A USER WAS DELETED OR CHANGED PASSWORD
userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    console.log(changedTimestamp, JWTTimestamp);
    return JWTTimestamp < changedTimestamp;
  }

  // FALSE MEANS PASSWORD WAS NOT CHANGED
  return false;
};

// USE IN-BUILD CRYPTO METHOD TO CREATE A TOKEN FOR PASSWORD RESET
userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString("hex");

  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  console.log({ resetToken }, this.passwordResetToken);

  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

const User = mongoose.model("User", userSchema);

module.exports = User;
