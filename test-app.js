// Test file to isolate the problem
require('dotenv').config();

console.log('Testing requires...');

try {
  console.log('1. Testing fastify...');
  const fastify = require('fastify')({ logger: true });
  
  console.log('2. Testing config...');
  const config = require('./src/config/settings');
  console.log('Config loaded:', config);
  
  console.log('3. Testing helpers...');
  const { cleanup } = require('./src/lib/helpers');
  
  console.log('4. Testing cors...');
  const cors = require('@fastify/cors');
  
  console.log('5. Testing helmet...');
  const helmet = require('@fastify/helmet');
  
  console.log('6. Testing compress...');
  const compress = require('@fastify/compress');
  
  console.log('7. Testing swagger...');
  const swagger = require('@fastify/swagger');
  
  console.log('8. Testing swagger-ui...');
  const swaggerUi = require('@fastify/swagger-ui');
  
  console.log('9. Testing routes...');
  const routes = require('./src/routes/main');
  
  console.log('All requires successful!');
  
} catch (error) {
  console.error('Error:', error.message);
  console.error('Stack:', error.stack);
}
