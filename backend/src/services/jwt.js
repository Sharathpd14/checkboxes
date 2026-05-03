import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

export function signIdToken(user, nonce) {
  return jwt.sign({
    iss: env.appBaseUrl,
    sub: user.oidcSub,
    aud: env.clientId,
    name: user.name,
    email: user.email,
    nonce
  }, env.jwtSigningSecret, { expiresIn: '1h' });
}

export function signAccessToken(user) {
  return jwt.sign({
    iss: env.appBaseUrl,
    sub: user.oidcSub,
    aud: 'checkbox-api',
    scope: 'openid profile email checkbox:read checkbox:write'
  }, env.jwtSigningSecret, { expiresIn: '1h' });
}
