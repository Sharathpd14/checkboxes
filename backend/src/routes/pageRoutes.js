import { Router } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const publicDir = path.resolve(__dirname, '../../../frontend/public');

export const pageRouter = Router();

pageRouter.get('/', (_req, res) => res.redirect('/login'));
pageRouter.get('/login', (_req, res) => res.sendFile(path.join(publicDir, 'login.html')));
pageRouter.get('/register', (_req, res) => res.sendFile(path.join(publicDir, 'register.html')));
pageRouter.get('/app', (req, res) => {
  if (!req.session.user) return res.redirect('/login');
  res.sendFile(path.join(publicDir, 'app.html'));
});
