const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    codeStudent: {
      type: String,
    },
    password: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    address: {
      type: String,
    },
    isVerify: {
      type: Boolean,
      default: false,
    },
    verificationToken: {
      type: String,
    },
    verificationTokenExpires: { type: Date },
    birthDay: {
      type: Date,
    },
    level: {
      type: String,
    },
    skill: {
      type: String,
    },
    level: {
      type: String,
    },
    forte: {
      type: Array,
    },
    githubId: {
      type: String,
    },
    role: {
      type: String,
      enum: ["admin", "member", "visitor", "teamLeader"],
      default: "visitor",
    },
    avatar: {
      type: String,
    },
  },
  { timestamps: true }
);

// Mã hóa mật khẩu trước khi lưu vào DB
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model("User", userSchema);
module.exports = User;
