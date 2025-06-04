require('dotenv').config();

module.exports = {
  // Server configuration
  server: {
    host: process.env.HOST || '0.0.0.0',
    port: parseInt(process.env.PORT, 10) || 8080,
  },
  
  // Cache configuration
  cache: {
    expire: parseInt(process.env.CACHE_EXPIRE, 10) || 60, // seconds
  },
  
  // Performance settings
  performance: {
    maxConcurrency: parseInt(process.env.MAX_CONCURRENCY, 10) || 12,
    timeout: parseInt(process.env.REQUEST_TIMEOUT, 10) || 30000, // ms
  },
  
  // URLs to analyze
  urls: [
    'https://go.dev',
    'https://www.python.org',
    'https://www.realpython.com',
    'https://nodejs.org',
    'https://www.facebook.com',
    'https://www.gitlab.com',
    'https://www.youtube.com',
    'https://www.mozilla.org',
    'https://www.github.com',
    'https://www.google.com'
  ]
};
