import http from 'http';
import app from './app.js';
import { container } from './shared/container.js';
import { logger } from './shared/logger.js'; // Pino

const PORT = Number(process.env.PORT) || 3000;

// Crear server HTTP
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
});
process.on('uncaughtException', (err) => {
  logger.fatal({ err }, 'UNCAUGHT EXCEPTION');
});

// !!! Fixear para q aparezca en consola al cerrar con ctrl+c, el watcher lo mata antes

// Apagado ordenado
const shutdown = async (signal: string) => {
  logger.warn({ signal }, 'Shutdown signal received');
  server.close(async (closeErr) => {
    if (closeErr) {
      logger.error({ closeErr }, 'Error closing HTTP server');
    }
    try {
      // Cerrar la pool de Postgres
      await container.pool.end();
      logger.info('Postgres pool closed');
    } catch (e) {
      logger.error({ e }, 'Error closing Postgres pool');
    } finally {
      process.exit(0);
    }
  });
};

process.on('SIGINT',  () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));