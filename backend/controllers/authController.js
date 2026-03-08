const User = require('../models/User');
const Doctor = require('../models/Doctor');
const Patient = require('../models/Patient');
const jwt = require('jsonwebtoken');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'secret', {
    expiresIn: '30d',
  });
};

const signup = async (req, res) => {
  const { name, email, password, role, ...extra } = req.body;

  try {
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const user = await User.create({
      name,
      email,
      password,
      role
    });

    if (role === 'doctor') {
      await Doctor.create({
        user: user._id,
        name: user.name,
        department: extra.department || 'General Medicine',
        experience: extra.experience,
        availability: 'Available',
        availableTime: extra.availableTime,
        hospitalId: extra.hospitalId
      });
    } else if (role === 'patient') {
      await Patient.create({
        user: user._id,
        name: user.name,
        age: extra.age,
        gender: extra.gender,
        phone: extra.phone
      });
    }

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const login = async (req, res) => {
  const { email, password, role } = req.body;

  try {
    const user = await User.findOne({ email });

    if (user && (await user.comparePassword(password))) {
      if (user.role !== role) {
        return res.status(401).json({ message: 'Invalid role for this user' });
      }

      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { signup, login };
