import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Task Reporting API',
      version: '1.0.0',
      description: `API documentation for the Task Reporting Web Application - A comprehensive system for managing developer tasks and reports.
      
Rate Limiting:
- All API endpoints are protected by rate limiting
- Limits: 100 requests per 15 minutes per IP
- Responses include rate limit headers (X-RateLimit-Limit, X-RateLimit-Remaining)

Authentication:
- Most endpoints require JWT authentication
- Obtain JWT token via /api/auth/login
- Include token in Authorization header: Bearer <token>
      `,
      license: {
        name: 'MIT',
        url: 'https://spdx.org/licenses/MIT.html',
      },
      contact: {
        name: 'API Support',
        url: 'http://localhost:5001',
      },
    },
    servers: [
      {
        url: process.env.BACKEND_URL || 'http://localhost:5001',
        description: 'API Server',
      },
    ],
    tags: [
      {
        name: 'Auth',
        description: 'Authentication and authorization endpoints',
      },
      {
        name: 'Tasks',
        description: 'Task management endpoints for both developers and admins',
      },
      {
        name: 'Reports',
        description: 'Report generation and missing reports tracking',
      },
      {
        name: 'Developers',
        description: 'Developer management endpoints',
      },
      {
        name: 'Admins',
        description: 'Admin management endpoints',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter your JWT token in the format: Bearer <token>'
        },
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            error: {
              type: 'string',
              description: 'Error message',
            },
            details: {
              type: 'string',
              description: 'Detailed error message (only in development)',
            },
          },
        },
        RateLimitError: {
          type: 'object',
          properties: {
            error: {
              type: 'string',
              description: 'Rate limit exceeded message',
            },
            retryAfter: {
              type: 'number',
              description: 'Time in seconds to wait before retrying',
            },
          },
        },
      },
      responses: {
        UnauthorizedError: {
          description: 'Access token is missing or invalid',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error'
              }
            }
          }
        },
        RateLimitError: {
          description: 'Too many requests, please try again later',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/RateLimitError'
              }
            }
          }
        }
      }
    },
    security: [{
      bearerAuth: [],
    }],
  },
  apis: [
    './routes/*.js',
    './models/*.js',
  ],
};

const specs = swaggerJsdoc(options);

export default specs;