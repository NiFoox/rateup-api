import http from 'http';
import app from './app.js';
import { logger } from './shared/logger.js'; // Pino

const PORT = Number(process.env.PORT) || 3000;

// Crear server HTTP para configurar los timeouts
const server = http.createServer(app);

server.keepAliveTimeout = 60_000;  // conexiones keep-alive hasta 60s
server.headersTimeout   = 65_000;  // mayor que keepAliveTimeout
server.requestTimeout   = 60_000;  // timeout de request

// Arrancar
server.listen(PORT, () => {
  const url = `http://localhost:${PORT}`;
  logger.info({ port: PORT, url }, `Server is running on ${url}`);
});

// Manejo de errores no capturados
process.on('unhandledRejection', (reason) => {
  logger.error({ reason }, 'UNHANDLED REJECTION');
  process.exit(1);
});
process.on('uncaughtException', (err) => {
  logger.fatal({ err }, 'UNCAUGHT EXCEPTION');
  process.exit(1);
});