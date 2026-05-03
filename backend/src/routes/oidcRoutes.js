import { Router } from 'express';
import { env } from '../config/env.js';
import { exchangeCode, issueAuthorizationCode, oidcMetadata, registerUser, verifyUser } from '../auth/customOidc.js';

export const oidcRouter = Router();

oidcRouter.get('/.well-known/openid-configuration', (_req, res) => {
  res.json(oidcMetadata());
});

oidcRouter.get('/jwks', (_req, res) => {
  res.json({ keys: [] });
});

oidcRouter.post('/register', async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) throw new Error('Name, email and password are required');
    const user = await registerUser({ name, email, password });
    res.status(201).json({ ok: true, user: { id: user.id, name: user.name, email: user.email } });
  } catch (error) {
    next(error);
  }
});

oidcRouter.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await verifyUser({ email, password });
    req.session.localUserId = user.id;
    req.session.localUser = { id: user.id, sub: user.oidcSub, name: user.name, email: user.email };
    res.json({ ok: true, user: req.session.localUser });
  } catch (error) {
    next(error);
  }
});

oidcRouter.get('/authorize', async (req, res, next) => {
  try {
    const { client_id, redirect_uri, scope = 'openid profile email', state = '', nonce = '' } = req.query;
    if (client_id !== env.clientId) throw new Error('Invalid client_id');
    if (redirect_uri !== env.clientRedirectUri) throw new Error('Invalid redirect_uri');
    if (!req.session.localUserId) return res.redirect('/login');
    const code = await issueAuthorizationCode({ userId: req.session.localUserId, clientId: client_id, redirectUri: redirect_uri, scope, nonce });
    const callbackUrl = new URL(String(redirect_uri));
    callbackUrl.searchParams.set('code', code);
    if (state) callbackUrl.searchParams.set('state', String(state));
    res.redirect(callbackUrl.toString());
  } catch (error) {
    next(error);
  }
});

oidcRouter.post('/token', async (req, res, next) => {
  try {
    const { grant_type, code, client_id, redirect_uri } = req.body;
    if (grant_type !== 'authorization_code') throw new Error('Unsupported grant_type');
    const result = await exchangeCode({ code, clientId: client_id, redirectUri: redirect_uri });
    res.json(result);
  } catch (error) {
    next(error);
  }
});

oidcRouter.get('/userinfo', (req, res) => {
  if (!req.session.user) return res.status(401).json({ error: 'Not authenticated' });
  res.json(req.session.user);
});
