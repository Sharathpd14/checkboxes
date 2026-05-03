import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { env } from '../config/env.js';
import { User } from '../models/User.js';
import { AuthCode } from '../models/AuthCode.js';
import { signAccessToken, signIdToken } from '../services/jwt.js';

function randomCode() {
  return crypto.randomBytes(24).toString('hex');
}

export async function registerUser({ name, email, password }) {
  const exists = await User.findOne({ email });
  if (exists) throw new Error('Email already registered');
  const passwordHash = await bcrypt.hash(password, 10);
  const oidcSub = `user-${crypto.randomUUID()}`;
  const user = await User.create({ name, email, passwordHash, oidcSub });
  return user;
}

export async function verifyUser({ email, password }) {
  const user = await User.findOne({ email });
  if (!user) throw new Error('Invalid credentials');
  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) throw new Error('Invalid credentials');
  return user;
}

export function oidcMetadata() {
  return {
    issuer: env.appBaseUrl,
    authorization_endpoint: `${env.appBaseUrl}/oidc/authorize`,
    token_endpoint: `${env.appBaseUrl}/oidc/token`,
    userinfo_endpoint: `${env.appBaseUrl}/oidc/userinfo`,
    jwks_uri: `${env.appBaseUrl}/oidc/jwks`,
    response_types_supported: ['code'],
    subject_types_supported: ['public'],
    id_token_signing_alg_values_supported: ['HS256'],
    scopes_supported: ['openid', 'profile', 'email']
  };
}

export async function issueAuthorizationCode({ userId, clientId, redirectUri, scope, nonce }) {
  const code = randomCode();
  await AuthCode.create({ code, userId, clientId, redirectUri, scope, nonce, expiresAt: new Date(Date.now() + 5 * 60 * 1000) });
  return code;
}

export async function exchangeCode({ code, clientId, redirectUri }) {
  const authCode = await AuthCode.findOne({ code, clientId, redirectUri }).populate('userId');
  if (!authCode) throw new Error('Invalid authorization code');
  if (authCode.expiresAt.getTime() < Date.now()) throw new Error('Authorization code expired');
  const user = authCode.userId;
  const result = {
    access_token: signAccessToken(user),
    id_token: signIdToken(user, authCode.nonce),
    token_type: 'Bearer',
    expires_in: 3600,
    scope: authCode.scope,
    user: { id: user.id, sub: user.oidcSub, name: user.name, email: user.email }
  };
  await AuthCode.deleteOne({ _id: authCode._id });
  return result;
}
