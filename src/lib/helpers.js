const axios = require('axios');
const cheerio = require('cheerio');
const config = require('../config/settings');

// In-memory cache
const cache = new Map();
let cacheStats = {
  hits: 0,
  misses: 0,
  keys: 0
};

/**
 * Analyze a single URL and count words in href attributes
 * @param {string} url - URL to analyze
 * @returns {Promise<Object>} Analysis result
 */
async function analyzeUrl(url) {
  const cacheKey = url;
  const now = Date.now();
  
  // Check cache first
  if (cache.has(cacheKey)) {
    const cached = cache.get(cacheKey);
    if (now - cached.timestamp < config.cache.expire * 1000) {
      cacheStats.hits++;
      return {
        ...cached.data,
        fromCache: true,
        timestamp: new Date().toISOString()
      };
    } else {
      // Remove expired entry
      cache.delete(cacheKey);
      cacheStats.keys--;
    }
  }
  
  cacheStats.misses++;
  
  try {
    const startTime = Date.now();
    
    // Fetch the webpage
    const response = await axios.get(url, {
      timeout: config.performance.timeout,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; Counter-HREF-Bot/1.0)',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
      }
    });
    
    // Parse HTML and count words in href attributes
    const $ = cheerio.load(response.data);
    let wordCount = 0;
    
    $('a[href]').each((_, element) => {
      const href = $(element).attr('href');
      if (href) {
        // Count words in href (split by non-word characters)
        const words = href.split(/\W+/).filter(word => word.length > 0);
        wordCount += words.length;
      }
    });
    
    const endTime = Date.now();
    const totalTime = endTime - startTime;
    
    const result = {
      url,
      wordCount,
      status: 'success',
      totalTime,
      fromCache: false,
      timestamp: new Date().toISOString()
    };
    
    // Cache the result
    cache.set(cacheKey, {
      data: result,
      timestamp: now
    });
    cacheStats.keys++;
    
    return result;
    
  } catch (error) {
    console.error(`Error analyzing ${url}:`, error.message);
    
    const result = {
      url,
      wordCount: 0,
      status: 'error',
      error: error.message,
      totalTime: 0,
      fromCache: false,
      timestamp: new Date().toISOString()
    };
    
    return result;
  }
}

/**
 * Analyze multiple URLs in parallel
 * @param {Array<string>} urls - URLs to analyze
 * @param {number} maxConcurrency - Maximum concurrent requests
 * @returns {Promise<Object>} Batch analysis result
 */
async function analyzeUrls(urls, maxConcurrency = 10) {
  const startTime = Date.now();
  
  // Process URLs in batches to control concurrency
  const results = [];
  for (let i = 0; i < urls.length; i += maxConcurrency) {
    const batch = urls.slice(i, i + maxConcurrency);
    const batchPromises = batch.map((url, index) => 
      analyzeUrl(url).then(result => ({
        ...result,
        id: i + index
      }))
    );
    
    const batchResults = await Promise.all(batchPromises);
    results.push(...batchResults);
  }
  
  const endTime = Date.now();
  const totalTime = endTime - startTime;
  
  const successCount = results.filter(r => r.status === 'success').length;
  const errorCount = results.filter(r => r.status === 'error').length;
  
  return {
    data: results,
    totalTime,
    urlsProcessed: results.length,
    successCount,
    errorCount,
    timestamp: new Date().toISOString()
  };
}

/**
 * Get cache statistics
 * @returns {Object} Cache statistics
 */
function getCacheStats() {
  const hitRate = cacheStats.hits + cacheStats.misses > 0 
    ? (cacheStats.hits / (cacheStats.hits + cacheStats.misses)) * 100 
    : 0;
    
  return {
    keys: cache.size,
    hits: cacheStats.hits,
    misses: cacheStats.misses,
    hitRate: Math.round(hitRate * 100) / 100,
    ksize: JSON.stringify(Array.from(cache.keys())).length,
    vsize: JSON.stringify(Array.from(cache.values())).length
  };
}

/**
 * Clear cache
 */
function clearCache() {
  cache.clear();
  cacheStats = {
    hits: 0,
    misses: 0,
    keys: 0
  };
  console.log('🗑️ Cache cleared');
}

/**
 * Cleanup resources
 */
function cleanup() {
  clearCache();
  console.log('🧹 Resources cleaned up');
}

module.exports = {
  analyzeUrl,
  analyzeUrls,
  getCacheStats,
  clearCache,
  cleanup
};
