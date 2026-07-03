const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { isValidEmail, isNonEmptyString, sanitizeString } = require('../utils/validators');

const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET || 'secret', {
    expiresIn: '30d',
  });
};

const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const safeName = sanitizeString(name);
    const safeEmail = sanitizeString(email);
    const safePassword = sanitizeString(password);

    if (!isNonEmptyString(safeName) || !isNonEmptyString(safeEmail) || !isNonEmptyString(safePassword)) {
      return res.status(400).json({ message: 'Vui lòng cung cấp đầy đủ tên, email và mật khẩu' });
    }
    if (!isValidEmail(safeEmail)) {
      return res.status(400).json({ message: 'Email không hợp lệ' });
    }
    if (safePassword.length < 6) {
      return res.status(400).json({ message: 'Mật khẩu phải có ít nhất 6 ký tự' });
    }

    const normalizedEmail = safeEmail.toLowerCase();
    const userExists = await User.findOne({ email: normalizedEmail });

    if (userExists) {
      return res.status(400).json({ message: 'Email đã được sử dụng' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(safePassword, salt);

    const user = await User.create({
      name: safeName,
      email: normalizedEmail,
      password: hashedPassword,
    });

    if (user) {
      res.status(201).json({
        _id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id, user.role),
      });
    } else {
      res.status(400).json({ message: 'Dữ liệu không hợp lệ' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const safeEmail = sanitizeString(email);
    const safePassword = sanitizeString(password);

    if (!isNonEmptyString(safeEmail) || !isNonEmptyString(safePassword)) {
      return res.status(400).json({ message: 'Vui lòng nhập email và mật khẩu' });
    }
    if (!isValidEmail(safeEmail)) {
      return res.status(400).json({ message: 'Email không hợp lệ' });
    }

    const normalizedEmail = safeEmail.toLowerCase();
    const user = await User.findOne({ email: normalizedEmail });

    if (user && (await bcrypt.compare(password, user.password))) {
      res.json({
        _id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id, user.role),
      });
    } else {
      res.status(401).json({ message: 'Email hoặc mật khẩu không chính xác' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user?._id).select('-password');
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ message: 'Không tìm thấy người dùng' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user?._id);
    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    }

    const { name, email, password } = req.body;
    if (email) {
      const safeEmail = sanitizeString(email).toLowerCase();
      if (!isValidEmail(safeEmail)) {
        return res.status(400).json({ message: 'Email không hợp lệ' });
      }
      const existing = await User.findOne({ email: safeEmail });
      if (existing && existing._id.toString() !== user._id.toString()) {
        return res.status(400).json({ message: 'Email đã được sử dụng bởi người khác' });
      }
      user.email = safeEmail;
    }
    if (name) {
      const safeName = sanitizeString(name);
      if (!isNonEmptyString(safeName)) {
        return res.status(400).json({ message: 'Tên không được để trống' });
      }
      user.name = safeName;
    }
    if (password) {
      const safePassword = sanitizeString(password);
      if (safePassword.length < 6) {
        return res.status(400).json({ message: 'Mật khẩu phải có ít nhất 6 ký tự' });
      }
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(safePassword, salt);
    }

    const updatedUser = await user.save();
    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      token: generateToken(updatedUser._id, updatedUser.role),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getProfile,
  updateProfile,
};
