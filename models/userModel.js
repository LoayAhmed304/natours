const crypto = require('crypto');
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'A user must have a username'],
    unique: [true, 'Username is already taken'],
    minLength: [10, 'Username must have more than 10 characters'],
  },
  email: {
    type: String,
    required: [true, 'A user must have an e-mail'],
    unique: [true, 'This e-mail is already in use'],
    validate: [validator.isEmail, 'Invalid e-mail address'],
    lowercase: true, // transforms the input into lowercase
  },
  photo: String,
  role: {
    type: String,
    enum: ['user', 'guide', 'admin', 'lead-guide'],
    default: 'user',
  },
  password: {
    type: String,
    required: [true, 'A user must have a password'],
    minLength: [8, 'Password is too short'],
    select: false,
    // validate: [validator.isStrongPassword, 'This password is too weak'],
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Please enter the confirmation password'],
    unique: false,
    validate: {
      // ONLY works on CREATE & SAVE!!! (not update/patch)
      validator: function (val) {
        return val === this.password;
      },
      message: "Password doesn't match",
    },
    select: false,
  },
  passwordChangeAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  active: {
    type: Boolean,
    default: true,
    select: false,
  },
});

userSchema.pre('save', function (next) {
  if (!this.isModified('password') || this.isNew) return next();

  this.passwordChangeAt = Date.now() - 1000;
  next();
});

userSchema.pre('find', function (next) {
  // This points to the current query
  this.find({ active: { $ne: false } });
  next();
});

userSchema.pre('save', async function (next) {
  // Only run if password was modified/created
  if (!this.isModified('password')) return next();

  // Hash with cost 12
  this.password = await bcrypt.hash(this.password, 12);
  // Delete password confirmation field
  // this.passwordConfirm = undefined;
  next();
});

userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword,
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangeAt) {
    const changedTimestamp = parseInt(
      this.passwordChangeAt.getTime() / 1000,
      10,
    );

    return JWTTimestamp < changedTimestamp;
  }

  // Not changed
  return false;
};

userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  console.log(resetToken, this.passwordResetToken);
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

const User = mongoose.model('User', userSchema);
module.exports = User;
