// controllers/userController.js
const User = require("../models/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { validationResult } = require("express-validator");

// Đăng ký người dùng mới
const registerUser = async (req, res) => {
  const { username, email, phone, password } = req.body;

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: "User already exists" });
    }

    user = new User({
      username,
      email,
      phone,
      password,
    });

    await user.save();

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    res.json({ message: "Register success", token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// Đăng nhập người dùng
const loginUser = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    res.json({ message: "Login success", token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// Lấy thông tin người dùng đang đăng nhập
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
// lấy thông tin thanh viên by id
const getMemberById = async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await User.findById(userId).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// Lấy thông tin tất cả thành viên

const getAllMembers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error" });
  }
};
const updateMember = async (req, res) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    }).select("-password");
    res.json(updatedUser);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
const deleteMember = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "Delete success" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
const deleteAllMembers = async (req, res) => {
  try {
    await User.deleteMany();
    res.json({ message: "Delete all members success" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
const filterMembers = async (req, res) => {
  const { skill, level } = req.query;
  try {
    const query = {};
    if (skill) query.skill = skill;
    if (level) query.level = level;

    const filteredUsers = await User.find(query).select("-password");
    res.json(filteredUsers);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error" });
  }
};
const sortMembers = async (req, res) => {
  const { sortBy } = req.query;
  try {
    const users = await User.find()
      .sort({ [sortBy]: 1 })
      .select("-password");
    res.json(users);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error" });
  }
};
// pagination
const paginationMembers = async (req, res) => {
  const { page, limit } = req.query;
  try {
    const users = await User.find()
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .select("-password");
    res.json(users);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error" });
  }
};

// search members much field or by name
const searchMembers = async (req, res) => {
  const { q, name } = req.query;

  try {
    let query = {};
    if (name) {
      query.username = { $regex: name, $options: "i" };
    }
    if (q) {
      query = {
        $or: [
          { username: { $regex: q, $options: "i" } },
          { email: { $regex: q, $options: "i" } },
          { phone: { $regex: q, $options: "i" } },
        ],
      };
    }
    const users = await User.find(query).select("-password");
    res.json(users);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error" });
  }
};
// phân quyền cho thành viên

const assignRole = async (req, res) => {
  const { userId } = req.params; // ID của thành viên cần phân quyền
  const { role } = req.body; // Vai trò mới (admin, member, teamLeader, visitor)

  try {
    // Tìm thành viên
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Kiểm tra role hợp lệ
    const validRoles = ["admin", "member", "visitor", "teamLeader"];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    // Cập nhật vai trò của thành viên
    user.role = role;
    await user.save();

    res.status(200).json({ message: `Role updated to ${role}`, user });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};
// // search member by name
// const searchMemberByName = async (req, res) => {
//   const { name } = req.query;
//   try {
//     const users = await User.find({
//       username: { $regex: name, $options: "i" },
//     }).select("-password");
//     res.json(users);
//   } catch (error) {
//     console.log(error);
//     res.status(500).json({ message: "Server error" });
//   }
// };
module.exports = {
  registerUser,
  loginUser,
  getUserProfile,
  getAllMembers,
  getMemberById,
  updateMember,
  deleteMember,
  deleteAllMembers,
  filterMembers,
  sortMembers,
  paginationMembers,
  searchMembers,
  assignRole,
};
