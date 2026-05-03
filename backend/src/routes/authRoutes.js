import { Router } from 'express';
import { env } from '../config/env.js';

export const authRouter = Router();

function buildAuthParams() {
  return new URLSearchParams({
    client_id: env.clientId,
    redirect_uri: env.clientRedirectUri,
    scope: 'openid profile email',
    state: Math.random().toString(36).slice(2),
    nonce: Math.random().toString(36).slice(2)
  });
}

authRouter.get('/login', (_req, res) => {
  res.redirect(`/oidc/authorize?${buildAuthParams().toString()}`);
});

authRouter.get('/callback', async (req, res, next) => {
  try {
    const { code } = req.query;
    if (!code) throw new Error('Missing authorization code');
    const tokenResponse = await fetch(`${env.appBaseUrl}/oidc/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        grant_type: 'authorization_code',
        code,
        client_id: env.clientId,
        redirect_uri: env.clientRedirectUri
      })
    });
    const data = await tokenResponse.json();
    if (!tokenResponse.ok) throw new Error(data.error || data.message || 'Token exchange failed');
    req.session.user = data.user;
    req.session.tokens = {
      accessToken: data.access_token,
      idToken: data.id_token,
      expiresIn: data.expires_in
    };
    res.redirect('/app');
  } catch (error) {
    next(error);
  }
});

authRouter.get('/me', (req, res) => {
  res.json({ authenticated: !!req.session.user, user: req.session.user || null });
});

authRouter.post('/logout', (req, res) => {
  req.session.destroy(() => res.json({ ok: true }));
});
