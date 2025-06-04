require('dotenv').config();

const fastify = require('fastify')({
  logger: {
    level: 'info',
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: true,
        translateTime: 'HH:MM:ss Z',
        ignore: 'pid,hostname'
      }
    }
  }
});

const config = require('./config/settings');

// Start server function
async function start() {
  try {
    console.log('🚀 Starting Fastify Counter HREF Server...');
    
    // Register CORS
    await fastify.register(require('@fastify/cors'), {
      origin: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE'],
      allowedHeaders: ['Content-Type', 'Authorization'],
      credentials: true
    });

    // Register Security Headers
    await fastify.register(require('@fastify/helmet'), {
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'", "https:", "cdn.jsdelivr.net"],
          scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "cdn.jsdelivr.net"],
          imgSrc: ["'self'", "data:", "https:", "validator.swagger.io"],
          fontSrc: ["'self'", "fonts.gstatic.com", "cdn.jsdelivr.net"],
          connectSrc: ["'self'"],
          objectSrc: ["'none'"],
          mediaSrc: ["'self'"],
          frameSrc: ["'self'"],
        },
      }
    });

    // Register Compression
    await fastify.register(require('@fastify/compress'), {
      global: true
    });

    // Register Swagger
    await fastify.register(require('@fastify/swagger'), {
      openapi: {
        openapi: '3.0.0',
        info: {
          title: 'Fastify Counter HREF API',
          description: 'High-performance web scraper that counts words within HTML href tags using Fastify.',
          version: '1.0.0',
          contact: {
            name: 'API Support',
            email: 'alarolinarescabre@gmail.com'
          },
          license: {
            name: 'MIT',
            url: 'https://opensource.org/licenses/MIT'
          }
        },
        servers: [
          {
            url: 'http://localhost:8080',
            description: 'Development server'
          }
        ],
        tags: [
          { name: 'General', description: 'General API endpoints' },
          { name: 'Analysis', description: 'URL analysis endpoints' },
          { name: 'Cache', description: 'Cache management endpoints' },
          { name: 'Health', description: 'Health check and monitoring' }
        ]
      }
    });

    // Register Swagger UI
    await fastify.register(require('@fastify/swagger-ui'), {
      routePrefix: '/docs',
      uiConfig: {
        docExpansion: 'list',
        deepLinking: true,
        filter: true,
        showRequestDuration: true
      },
      staticCSP: false,
      transformSpecificationClone: true
    });

    // Register routes
    await fastify.register(require('./routes/main'));

    // Start listening
    const address = await fastify.listen({
      host: config.server.host,
      port: config.server.port
    });

    console.log('\n🚀 Fastify Counter HREF Server Started Successfully!');
    console.log('==================================================');
    console.log(`📍 Server running on ${address}`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`💾 Cache TTL: ${config.cache.expire}s`);
    console.log(`🔄 Max Concurrency: ${config.performance.maxConcurrency}`);
    console.log(`📊 URLs to analyze: ${config.urls.length}`);
    console.log('');
    console.log('📋 Available endpoints:');
    console.log(`   GET  /                    - API info`);
    console.log(`   GET  /docs                - Swagger documentation`);
    console.log(`   GET  /healthcheck         - Health check`);
    console.log(`   GET  /v1/tags             - Analyze all URLs`);
    console.log(`   GET  /v1/tags/:id         - Analyze single URL by ID`);
    console.log(`   GET  /cache/stats         - Cache statistics`);
    console.log(`   DELETE /cache             - Clear cache`);
    console.log('');
    console.log('🏃‍♂️ Ready to process requests!');
    console.log('🔍 Swagger UI available at: http://localhost:8080/docs');

  } catch (err) {
    console.error('❌ Error starting server:', err.message);
    console.error('📄 Stack trace:', err.stack);
    process.exit(1);
  }
}

// Graceful shutdown
const gracefulShutdown = async (signal) => {
  console.log(`\n🛑 Received ${signal}. Starting graceful shutdown...`);
  
  try {
    await fastify.close();
    console.log('✅ Graceful shutdown completed');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error during shutdown:', err);
    process.exit(1);
  }
};

// Handle shutdown signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle unhandled rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('💥 Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('💥 Uncaught Exception:', error);
  process.exit(1);
});

// Start the application
start();
