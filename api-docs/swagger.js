const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

// Swagger definition
const swaggerOptions = {
    swaggerDefinition: {
        openapi: '3.0.0',
        info: {
            title: 'Antique Bible API',
            version: '1.0.0',
            description: 'API for generating antique Bibles with user comments',
        },
        servers: [
            {
                url: 'http://localhost:3000/api', // Base URL for API
            },
        ],
    },
    apis: ['./routes/*.js'], // Path to route files with Swagger comments
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);

module.exports = { swaggerDocs, swaggerUi };
