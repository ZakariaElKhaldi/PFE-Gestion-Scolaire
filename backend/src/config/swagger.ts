import swaggerJSDoc from 'swagger-jsdoc';

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'School Management System API',
    version: '1.0.0',
    description: 'API documentation for the School Management System',
    contact: {
      name: 'API Support',
      email: 'support@schoolmanagementsystem.com'
    }
  },
  servers: [
    {
      url: '/api/v1',
      description: 'Development server'
    }
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT'
      }
    }
  },
  security: [
    {
      bearerAuth: []
    }
  ],
  tags: [
    {
      name: 'Auth',
      description: 'Authentication endpoints'
    },
    {
      name: 'Users',
      description: 'User management endpoints'
    },
    {
      name: 'Courses',
      description: 'Course management endpoints'
    },
    {
      name: 'Assignments',
      description: 'Assignment management endpoints'
    },
    {
      name: 'Submissions',
      description: 'Submission management endpoints'
    },
    {
      name: 'System',
      description: 'System related endpoints'
    }
  ]
};

const options = {
  swaggerDefinition,
  apis: ['./src/routes/*.ts', './src/controllers/*.ts', './src/models/*.ts']
};

const swaggerSpec = swaggerJSDoc(options);

export default swaggerSpec; 