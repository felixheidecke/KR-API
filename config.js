import { config as dotenv } from 'dotenv';
dotenv();
const { env } = process;

export const API = {
  HOST: env.API_HOST || 'localhost',
  PORT: env.API_PORT || 8080,
  CERT: env.API_CERT || null,
  KEY: env.API_KEY || null,
  PREFIX: 'v1'
};

export const DB = {
  HOST: env.DB_HOST || 'localhost',
  USER: env.DB_USER || null,
  DATABASE: env.DB_DATABASE || null,
  PASSWORD: env.DB_PASSWORD || null
};

export const MAILER = {
  HOST: env.MAILER_HOST || 'localhost',
  PORT: env.MAILER_PORT || 25,
  FROM: env.MAILER_FROM || 'mailer@localhost',
  SECURE: env.MAILER_SECURE || false,
  USER: env.MAILER_USER || null,
  PASSWORD: env.MAILER_PASSWORD || null
};
