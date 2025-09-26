// src/models/User.js
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import validator from 'validator';
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      validate: {
        validator: validator.isEmail,
        message: 'Invalid email format',
      },
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters'],
      validate: {
        validator: function (value) {
          return (
            /[A-Z]/.test(value) && // uppercase
            /[a-z]/.test(value) && // lowercase
            /[0-9]/.test(value) && // number
            /[!@#$%^&*(),.?":{}|<>]/.test(value) // special char
          );
        },
        message:
          'Password must contain uppercase, lowercase, number, and special character',
      },
    },
    ip: { type: String },
    device: { type: String },
    location: {
      country: String,
      city: String,
    },
    otp: { type: String },
    otpExpiry: { type: Date },
  },
  { timestamps: true }
);

// Indexes
userSchema.index({ email: 1 });
userSchema.index({ createdAt: -1 });
// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Method to compare password
userSchema.methods.matchPassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

const User = mongoose.model('User', userSchema);

export default User;
