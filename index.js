import '#utils/env';

import { host, port } from '#config/app.config';
import baseHeader from '#hooks/base-header';
import App from '#libs/fastify';

// Global Hooks
App.addHook('onRequest', baseHeader);

// Handling CORS
App.register(import('@fastify/cors'), {
  methods: ['GET', 'POST'],
  origin: '*'
});

// Register routes
// App.register(import('#routes/form'));
App.register(import('#routes/article'));
App.register(import('#routes/articles'));

// Startup
App.listen(port, host, (err, address) => {
  if (err) {
    App.log.error(err);
    return process.exit(1);
  }

  console.log('[KR-API]', 'listening on', address);
});
