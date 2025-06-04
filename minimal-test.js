// Minimal test server
const fastify = require('fastify')({ logger: true });

console.log('Starting minimal fastify server...');

fastify.get('/', async (request, reply) => {
  return { message: 'Hello World' };
});

async function start() {
  try {
    const address = await fastify.listen({ 
      host: '0.0.0.0',
      port: 8080 
    });
    console.log(`Server listening on ${address}`);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

start();
