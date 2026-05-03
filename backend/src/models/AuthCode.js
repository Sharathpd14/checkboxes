import mongoose from 'mongoose';

const authCodeSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true, index: true },
  clientId: { type: String, required: true },
  redirectUri: { type: String, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  scope: { type: String, default: 'openid profile email' },
  nonce: String,
  expiresAt: { type: Date, required: true }
}, { timestamps: true });

export const AuthCode = mongoose.model('AuthCode', authCodeSchema);
