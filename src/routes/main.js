const config = require('../config/settings');
const { analyzeUrl, analyzeUrls, getCacheStats, clearCache } = require('../lib/helpers');

/**
 * Routes for the Counter HREF API
 * @param {FastifyInstance} fastify
 */
async function routes(fastify) {
  
  // API Information endpoint
  fastify.get('/', {
    schema: {
      tags: ['General'],
      summary: 'API Information',
      description: 'Returns basic API information and available endpoints',
      response: {
        200: {
          type: 'object',
          properties: {
            data: { 
              type: 'string',
              example: '/v1/tags | /docs | /healthcheck | /cache/stats'
            }
          }
        }
      }
    }
  }, async (request, reply) => {
    return { 
      data: '/v1/tags | /docs | /healthcheck | /cache/stats' 
    };
  });

  // Health check endpoint
  fastify.get('/healthcheck', {
    schema: {
      tags: ['Health'],
      summary: 'Health Check',
      description: 'Returns server health status, memory usage, cache statistics, and system information',
      response: {
        200: {
          type: 'object',
          properties: {
            data: { type: 'string', example: 'Ok!' },
            timestamp: { type: 'string', format: 'date-time' },
            uptime: { type: 'number', description: 'Server uptime in seconds' },
            memory: {
              type: 'object',
              properties: {
                rss: { type: 'number' },
                heapTotal: { type: 'number' },
                heapUsed: { type: 'number' },
                external: { type: 'number' },
                arrayBuffers: { type: 'number' }
              }
            },
            cache: {
              type: 'object',
              properties: {
                keys: { type: 'number' },
                hits: { type: 'number' },
                misses: { type: 'number' },
                hitRate: { type: 'number' }
              }
            },
            nodeVersion: { type: 'string' }
          }
        }
      }
    }
  }, async (request, reply) => {
    const cacheStats = getCacheStats();
    
    return {
      data: 'Ok!',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      cache: cacheStats,
      nodeVersion: process.version
    };
  });

  // Analyze all URLs (batch processing)
  fastify.get('/v1/tags', {
    schema: {
      tags: ['Analysis'],
      summary: 'Analyze All URLs (Batch)',
      description: 'Count words in href attributes for all configured URLs using parallel processing',
      response: {
        200: {
          type: 'object',
          properties: {
            data: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'integer' },
                  url: { type: 'string' },
                  result: { type: 'integer' },
                  status: { type: 'string' },
                  time: { type: 'number' },
                  fromCache: { type: 'boolean' }
                }
              }
            },
            time: { type: 'number', description: 'Total processing time in seconds' },
            urls_processed: { type: 'integer' },
            success_count: { type: 'integer' },
            error_count: { type: 'integer' },
            concurrency: { type: 'integer' },
            timestamp: { type: 'string', format: 'date-time' }
          }
        }
      }
    }
  }, async (request, reply) => {
    const startTime = Date.now();
    
    fastify.log.info(`🚀 Starting parallel analysis of ${config.urls.length} URLs`);
    
    const results = await analyzeUrls(config.urls, config.performance.maxConcurrency);
    
    const endTime = Date.now();
    const totalTime = (endTime - startTime) / 1000; // Convert to seconds
    
    // Format response
    const formattedData = results.data.map(result => ({
      id: result.id,
      url: result.url,
      result: result.wordCount,
      status: result.status,
      time: Math.round(result.totalTime) / 1000,
      fromCache: result.fromCache,
      ...(result.error && { error: result.error })
    }));
    
    const response = {
      data: formattedData,
      time: Math.round(totalTime * 1000) / 1000,
      urls_processed: results.urlsProcessed,
      success_count: results.successCount,
      error_count: results.errorCount,
      concurrency: config.performance.maxConcurrency,
      timestamp: results.timestamp
    };
    
    fastify.log.info(`✅ Parallel analysis completed in ${response.time}s`);
    
    return response;
  });

  // Analyze single URL by ID
  fastify.get('/v1/tags/:id', {
    schema: {
      tags: ['Analysis'],
      summary: 'Analyze Single URL',
      description: 'Count words in href attributes for a specific URL by ID (0-9)',
      params: {
        type: 'object',
        properties: {
          id: { 
            type: 'integer',
            minimum: 0,
            maximum: 9,
            description: 'URL ID to analyze (0-9)'
          }
        },
        required: ['id']
      },
      response: {
        200: {
          type: 'object',
          properties: {
            url_id: { type: 'integer' },
            url: { type: 'string' },
            count: { type: 'integer' },
            time: { type: 'number' },
            status: { type: 'string' },
            fromCache: { type: 'boolean' },
            timestamp: { type: 'string', format: 'date-time' }
          }
        },
        404: {
          type: 'object',
          properties: {
            error: { type: 'string' },
            timestamp: { type: 'string', format: 'date-time' }
          }
        }
      }
    }
  }, async (request, reply) => {
    const urlId = parseInt(request.params.id, 10);
    
    // Validate URL ID
    if (isNaN(urlId) || urlId < 0 || urlId >= config.urls.length) {
      reply.code(404);
      return {
        error: 'Invalid site_id. Must be between 0 and 9',
        timestamp: new Date().toISOString()
      };
    }
    
    const startTime = Date.now();
    const url = config.urls[urlId];
    const result = await analyzeUrl(url);
    const endTime = Date.now();
    const totalTime = endTime - startTime;
    
    const response = {
      url_id: urlId,
      url: result.url,
      count: result.wordCount,
      time: Math.round(totalTime) / 1000,
      status: result.status,
      fromCache: result.fromCache,
      timestamp: result.timestamp
    };
    
    fastify.log.info(`📊 Single URL analysis completed for ID ${urlId} in ${response.time}s`);
    
    return response;
  });

  // Get cache statistics
  fastify.get('/cache/stats', {
    schema: {
      tags: ['Cache'],
      summary: 'Get Cache Statistics',
      description: 'Returns detailed cache statistics including hit rates, memory usage, and entry counts',
      response: {
        200: {
          type: 'object',
          properties: {
            cache: {
              type: 'object',
              properties: {
                keys: { type: 'integer' },
                hits: { type: 'integer' },
                misses: { type: 'integer' },
                hitRate: { type: 'number' },
                ksize: { type: 'integer' },
                vsize: { type: 'integer' }
              }
            },
            timestamp: { type: 'string', format: 'date-time' }
          }
        }
      }
    }
  }, async (request, reply) => {
    const stats = getCacheStats();
    return {
      cache: stats,
      timestamp: new Date().toISOString()
    };
  });

  // Clear cache
  fastify.delete('/cache', {
    schema: {
      tags: ['Cache'],
      summary: 'Clear Cache',
      description: 'Clears all cached analysis results from memory',
      response: {
        200: {
          type: 'object',
          properties: {
            message: { type: 'string' },
            timestamp: { type: 'string', format: 'date-time' }
          }
        }
      }
    }
  }, async (request, reply) => {
    clearCache();
    return {
      message: 'Cache cleared successfully',
      timestamp: new Date().toISOString()
    };
  });
}

module.exports = routes;
