import pino from 'pino';

const isDev = process.env.NODE_ENV !== 'production';
const isTTY = process.stdout.isTTY === true;

export const logger = pino({
  level: process.env.LOG_LEVEL || (isDev ? 'debug' : 'info'),
  base: undefined, // { app: 'rateup-api' } sino
  transport:
    isDev && isTTY
      ? { target: 'pino-pretty', options: { colorize: true, translateTime: 'SYS:standard' } }
      : undefined,
});
