// Klickrhein API

import Fastify from 'fastify';
import fs from 'fs';

import { API as API_CONFIG } from '#config';

const App = Fastify({
  logger: true,
  trustProxy: true,
  https: !!API_CONFIG.CERT
    ? {
      cert: fs.readFileSync(API_CONFIG.CERT),
      key: fs.readFileSync(API_CONFIG.KEY),
      allowHTTP1: true
    }
    : false
});

// Handling CORS
App.register(import('@fastify/cors'), {
  methods: ['GET', 'POST'],
  origin: '*'
});

// Register routes
App.register(import('#routes/form'), { prefix: API_CONFIG.PREFIX });
App.register(import('#routes/article'), { prefix: API_CONFIG.PREFIX });
App.register(import('#routes/articles'), { prefix: API_CONFIG.PREFIX });

// Startup
App.listen(API_CONFIG.PORT, API_CONFIG.HOST, (err, address) => {
  if (err) {
    App.log.error(err);
    return process.exit(1);
  }

  console.log('[KR-API]', 'listening on', address);
});
