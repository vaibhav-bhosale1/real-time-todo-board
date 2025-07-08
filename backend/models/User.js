const mongoose = require('mongoose');
const bcrypt = require('bcryptjs'); // For hashing passwords

const userSchema = mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true, // Ensure usernames are unique
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true, // Ensure emails are unique
      trim: true,
      lowercase: true,
      match: [/.+@.+\..+/, 'Please fill a valid email address'], // Basic email validation
    },
    password: {
      type: String,
      required: true,
      minlength: 6, // Enforce a minimum password length
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt timestamps
  }
);

// Pre-save hook to hash password before saving a new user
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    next(); // Only hash if password field is new or modified
  }

  const salt = await bcrypt.genSalt(10); // Generate a salt
  this.password = await bcrypt.hash(this.password, salt); // Hash the password
  next();
});

// Method to compare entered password with hashed password in DB
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);

module.exports = User;