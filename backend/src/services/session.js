import session from 'express-session';
import MongoStore from 'connect-mongo';
import { env } from '../config/env.js';

export function createSessionMiddleware() {
  return session({
    secret: env.sessionSecret,
    resave: false,
    saveUninitialized: false,
    proxy: env.isProduction,
    store: MongoStore.create({ mongoUrl: env.mongodbUri, collectionName: 'sessions', ttl: 60 * 60 * 8 }),
    cookie: {
      httpOnly: true,
      secure: env.isProduction,
      sameSite: 'lax',
      maxAge: 1000 * 60 * 60 * 8
    }
  });
}
