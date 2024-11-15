// controllers/userController.js
const User = require("../models/User");
const Event = require("../models/Event");
const jwt = require("jsonwebtoken");
const { validationResult } = require("express-validator");
const sendVerificationEmail = require("../utils/sendEmail");
const generateAccessToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: "1m" });
};

const generateRefreshToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: "7d",
  });
};

// Đăng ký người dùng mới
const registerUser = async (req, res) => {
  const { username, email, phone, codeStudent, password } = req.body;

  // const errors = validationResult(req);
  // if (!errors.isEmpty()) {
  //   return res.status(400).json({ errors: errors.array() });
  // }
  try {
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: "User already exists" });
    }

    user = new User({
      username,
      email,
      phone,
      codeStudent,
      password,
    });

    await user.save();

    // Tạo token xác thực email
    // const emailToken = jwt.sign(
    //   { userId: user._id },
    //   process.env.EMAIL_SECRET,
    //   {
    //     expiresIn: "1h",
    //   }
    // );

    // // Gửi email xác thực
    // await sendVerificationEmail(user.email, emailToken);

    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    // Lưu refresh token vào cơ sở dữ liệu
    user.refreshToken = refreshToken;
    await user.save();

    res.json({
      message: "Register success",
      data: { accessToken, refreshToken },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// Đăng nhập người dùng
const loginUser = async (req, res) => {
  // const errors = validationResult(req);
  // if (!errors.isEmpty()) {
  //   return res.status(400).json({ errors: errors.array() });
  // }
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

    // Lưu refresh token vào cơ sở dữ liệu
    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);
    user.refreshToken = refreshToken;
    await user.save();

    res.json({
      message: "Login success",
      data: { token: { accessToken, refreshToken }, user },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

const logoutUser = async (req, res) => {
  const { userId } = req.body;

  try {
    // Tìm user và xóa refreshToken
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.refreshToken = null; // Xóa refresh token
    await user.save();

    res.json({ message: "Logged out successfully" });
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
    res.json({ message: "Get user profile success", data: { user } });
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
    res.json({ message: "Get user by id success", data: { user } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// Lấy thông tin tất cả thành viên

const getAllMembers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json({ message: "Get all members success", data: { users } });
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
    res.json({ message: "Update success", data: { updatedUser } });
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
    res.json({ message: "Filter success", data: { filteredUsers } });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error" });
  }
};

const filterAndSearchMembers = async (req, res) => {
  const { skill, level, q, page = 1, limit = 10 } = req.query;

  try {
    let query = {};

    // Áp dụng bộ lọc
    if (skill) query.skill = skill;
    if (level) query.level = level;

    // Tìm kiếm từ khóa
    if (q) {
      query.$or = [
        { username: { $regex: q, $options: "i" } },
        { email: { $regex: q, $options: "i" } },
        { phone: { $regex: q, $options: "i" } },
      ];
    }

    // Phân trang
    const skip = (page - 1) * limit;
    const filteredAndSearchedUsers = await User.find(query)
      .select("-password")
      .skip(skip)
      .limit(parseInt(limit));

    // Đếm tổng số kết quả để xác định tổng số trang
    const totalResults = await User.countDocuments(query);
    const totalPages = Math.ceil(totalResults / limit);

    res.json({
      message: "Filter and search success",
      data: {
        users: filteredAndSearchedUsers,
        pagination: {
          totalResults,
          totalPages,
          currentPage: parseInt(page),
          limit: parseInt(limit),
        },
      },
    });
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
    res.json({ message: "Search success", data: { users } });
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
    res.json({ message: "Sort success", data: { users } });
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
    res.json({ message: "Pagination success", data: { users } });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error" });
  }
};

// Cập nhật hồ sơ cá nhân
// const updateUserProfile = async (req, res) => {
//   const userId = req.user.id; // Giả định rằng userId được lấy từ token đã xác thực
//   const { name, email, skills } = req.body;

//   try {
//     const updatedUser = await User.findByIdAndUpdate(
//       userId,
//       { name, email, skills },
//       { new: true }
//     );
//     if (!updatedUser) {
//       return res.status(404).json({ message: "User not found" });
//     }
//     res.json({ message: "Profile updated", user: updatedUser });
//   } catch (error) {
//     res.status(500).json({ message: "Server error", error });
//   }
// };

// Cập nhật hồ sơ cá nhân
const updateUserProfile = async (req, res) => {
  const userId = req.user.id; //userId được lấy từ token đã xác thực
  const updateFields = req.body;

  try {
    // Tìm và cập nhật chỉ các trường được cung cấp trong yêu cầu
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updateFields },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ message: "Profile updated successfully", user: updatedUser });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
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

    res
      .status(200)
      .json({ message: `Role updated to ${role}`, data: { user } });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

const registerForEvent = async (req, res) => {
  const userId = req.user.id; // Giả định userId lấy từ token đã xác thực
  const { eventId } = req.params;

  try {
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }
    if (event.status !== "active") {
      return res.status(400).json({ message: "Event is not active" });
    }
    if (
      event.maxParticipants &&
      event.registeredParticipants.length >= event.maxParticipants
    ) {
      return res.status(400).json({
        message: "Event is full",
        data: event.registeredParticipants.length,
      });
    }

    // Thêm thành viên vào danh sách tham gia
    event.registeredParticipants.push(userId);
    await event.save();
    res.json({ message: "Register for event success", data: { event } });
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
  logoutUser,
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
  updateUserProfile,
  registerForEvent,
  filterAndSearchMembers,
};
