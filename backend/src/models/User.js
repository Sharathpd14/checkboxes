import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, index: true },
  passwordHash: { type: String, required: true },
  oidcSub: { type: String, required: true, unique: true, index: true }
}, { timestamps: true });

export const User = mongoose.model('User', userSchema);
