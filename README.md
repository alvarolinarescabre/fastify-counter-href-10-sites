# Fastify HREF Counter API

🚀 **High-performance web scraper** that counts words within HTML `href` tags using Fastify as the main framework. This application includes caching capabilities, parallel processing, and comprehensive Swagger documentation.

## 📋 Table of Contents

- [Features](#-features)
- [Technologies Used](#-technologies-used)
- [Requirements](#-requirements)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [Usage](#-usage)
- [API Endpoints](#-api-endpoints)
- [Swagger Documentation](#-swagger-documentation)
- [Docker](#-docker)
- [Project Structure](#-project-structure)
- [Testing](#-testing)
- [Contributing](#-contributing)
- [License](#-license)

## ✨ Features

- **🔥 High performance** with Fastify framework
- **📊 Intelligent web scraping** that analyzes href tags
- **⚡ Parallel processing** of multiple URLs
- **💾 Caching system** to optimize performance
- **📚 Complete Swagger/OpenAPI documentation**
- **🛡️ Integrated security** with helmet and CORS
- **📝 Structured logging** with Pino
- **🗜️ Automatic response compression**
- **🔧 Flexible configuration** via environment variables
- **🐳 Docker support**

## 🛠 Technologies Used

- **[Fastify](https://fastify.io/)** - Ultra-fast web framework
- **[Cheerio](https://cheerio.js.org/)** - Server-side HTML parser
- **[Axios](https://axios-http.com/)** - HTTP client for requests
- **[Swagger](https://swagger.io/)** - Interactive API documentation
- **[Pino](https://getpino.io/)** - High-performance JSON logger
- **Node.js 18+** - JavaScript runtime

## 📋 Requirements

- Node.js v18.0.0 or higher
- npm v8.0.0 or higher
- 2GB RAM minimum recommended
- Internet connection for scraping

## 🚀 Installation

### Local Installation

```bash
# Clone the repository
git clone <repository-url>
cd fastly-counter-href-10-sites

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env
# Edit .env with your configurations

# Start the server
npm start

# For development with hot reload
npm run dev
```

### Docker Installation

```bash
# Build the image
docker build -t fastify-href-counter .

# Run the container
docker run -p 8080:8080 --env-file .env fastify-href-counter
```

## ⚙️ Configuration

The project uses environment variables defined in the `.env` file:

```bash
# Server Configuration
HOST=0.0.0.0              # Listen host
PORT=8080                 # Server port
NODE_ENV=development      # Runtime environment

# Cache Configuration
CACHE_EXPIRE=60          # Cache expiration time in seconds

# Performance Configuration
MAX_CONCURRENCY=12       # Maximum concurrent requests
REQUEST_TIMEOUT=30000    # Request timeout in ms

# CORS Configuration
CORS_ORIGIN=*           # Allowed origin for CORS
```

### Pre-configured URLs

The system analyzes these URLs by default:

1. https://example.com
2. https://httpbin.org
3. https://jsonplaceholder.typicode.com
4. https://reqres.in
5. https://cat-fact.herokuapp.com
6. https://dog.ceo
7. https://api.github.com
8. https://httpstat.us
9. https://randomuser.me
10. https://api.coindesk.com

## 🎯 Usage

### Start the Server

```bash
# Production mode
npm start

# Development mode (with hot reload)
npm run dev
```

The server will be available at: `http://localhost:8080`

### Check Status

```bash
# Health check
curl http://localhost:8080/healthcheck

# API information
curl http://localhost:8080/
```

## 🔗 API Endpoints

### General Information

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/` | Basic API information |
| `GET` | `/docs` | Swagger UI documentation |
| `GET` | `/healthcheck` | Server status and metrics |

### URL Analysis

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/v1/tags` | Analyze all configured URLs |
| `GET` | `/v1/tags/:id` | Analyze a specific URL by ID (1-10) |

### Cache Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/cache/stats` | Cache statistics |
| `DELETE` | `/cache` | Clear all cache |

### Usage Examples

#### Analyze all URLs
```bash
curl -X GET http://localhost:8080/v1/tags
```

**Response:**
```json
{
  "data": [
    {
      "id": 1,
      "url": "https://example.com",
      "wordCount": 15,
      "processing_time": 1250,
      "cache_hit": false,
      "error": null
    }
  ],
  "summary": {
    "total_urls": 10,
    "successful": 8,
    "failed": 2,
    "total_words": 247,
    "cache_hits": 3,
    "total_processing_time": 8450
  }
}
```

#### Analyze specific URL
```bash
curl -X GET http://localhost:8080/v1/tags/1
```

#### View cache statistics
```bash
curl -X GET http://localhost:8080/cache/stats
```

#### Clear cache
```bash
curl -X DELETE http://localhost:8080/cache
```

## 📚 Swagger Documentation

Interactive documentation is available at:

**URL:** `http://localhost:8080/docs`

The documentation includes:
- ✅ Complete OpenAPI 3.0 specification
- ✅ Detailed request/response schemas
- ✅ Usage examples for each endpoint
- ✅ HTTP status codes and descriptions
- ✅ Interactive interface to test the API

## 🐳 Docker

### Dockerfile

The project includes a production-optimized Dockerfile:

```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy configuration files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY src/ ./src/

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

# Change permissions
USER nodejs

# Expose port
EXPOSE 8080

# Start command
CMD ["node", "src/app.js"]
```

### Docker Compose (optional)

```yaml
version: '3.8'
services:
  fastify-href-counter:
    build: .
    ports:
      - "8080:8080"
    environment:
      - NODE_ENV=production
      - HOST=0.0.0.0
      - PORT=8080
    restart: unless-stopped
```

### Docker Commands

```bash
# Build image
docker build -t fastify-href-counter .

# Run container
docker run -d -p 8080:8080 --name href-counter fastify-href-counter

# View logs
docker logs -f href-counter

# Stop container
docker stop href-counter
```

## 📁 Project Structure

```
fastly-counter-href-10-sites/
├── src/
│   ├── app.js              # Main Fastify application
│   ├── config/
│   │   └── settings.js     # Centralized configurations
│   ├── lib/
│   │   └── helpers.js      # Scraping and cache utilities
│   └── routes/
│       └── main.js         # Route definitions and schemas
├── .env                    # Environment variables
├── .env.example           # Configuration example
├── .gitignore             # Files ignored by Git
├── Dockerfile             # Docker configuration
├── package.json           # Dependencies and scripts
└── README.md             # This file
```

### File Descriptions

- **`src/app.js`**: Main entry point, Fastify configuration and plugins
- **`src/config/settings.js`**: Centralized configurations and target URLs
- **`src/lib/helpers.js`**: Web scraping logic, cache and processing
- **`src/routes/main.js`**: Route definitions with validation schemas

## 🧪 Testing

### Manual Testing

```bash
# Verify server starts correctly
npm start

# In another terminal, test endpoints
curl http://localhost:8080/healthcheck
curl http://localhost:8080/v1/tags
curl http://localhost:8080/cache/stats
```

### Performance Metrics

The `/healthcheck` endpoint provides detailed metrics:

- **Uptime**: Server activity time
- **Memory**: RSS and heap memory usage
- **Cache**: Hit/miss statistics
- **Version**: Node.js and application information

## 🤝 Contributing

1. Fork the project
2. Create a feature branch (`git checkout -b feature/new-feature`)
3. Commit your changes (`git commit -am 'Add new feature'`)
4. Push to the branch (`git push origin feature/new-feature`)
5. Open a Pull Request

### Contribution Guidelines

- Keep code clean and well-commented
- Follow existing naming conventions
- Update documentation when necessary
- Ensure there are no errors in logs

## 📊 Performance

### Expected Benchmarks

- **Average latency**: < 100ms for cached URLs
- **Throughput**: > 1000 requests/second
- **Concurrency**: Up to 12 simultaneous requests
- **Memory**: < 100MB in stable state

### Implemented Optimizations

- ✅ In-memory cache with automatic expiration
- ✅ Parallel URL processing
- ✅ Automatic gzip compression
- ✅ Keep-alive for HTTP connections
- ✅ Configurable timeouts
- ✅ Efficient structured logging

## 🔧 Troubleshooting

### Common Issues

**Server won't start:**
```bash
# Check Node.js version
node --version  # Must be >= 18.0.0

# Check available port
lsof -i :8080
```

**Scraping errors:**
- Verify internet connectivity
- Review timeout configuration
- Check logs at `/healthcheck`

**Swagger UI won't load:**
- Verify `/docs` responds
- Review CSP configuration in app.js
- Check browser logs

### Logs

The system uses structured logging. To see detailed logs:

```bash
# Development mode (pretty-printed logs)
npm run dev

# Production mode (JSON logs)
NODE_ENV=production npm start
```

## 📄 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for more details.

## 👨‍💻 Author

- **Álvaro Linares** - [alvarolinarescabre@gmail.com](mailto:alvarolinarescabre@gmail.com)

## 🙏 Acknowledgments

- Fastify team for the excellent framework
- Node.js community for the tools
- Contributors of the libraries used

---

**⭐ If you like this project, don't forget to give it a star!**
