import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'PC Node Tree API',
      version: '1.0.0',
      description: 'A REST API for managing hierarchical PC component structures with properties',
      contact: {
        name: 'API Support',
        email: 'support@example.com',
      },
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter your Supabase service role key',
        },
      },
      schemas: {
        Node: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              description: 'Unique identifier for the node',
            },
            name: {
              type: 'string',
              description: 'Name of the node',
            },
            parent_id: {
              type: 'string',
              format: 'uuid',
              nullable: true,
              description: 'ID of the parent node (null for root nodes)',
            },
            created_at: {
              type: 'string',
              format: 'date-time',
              description: 'Timestamp when the node was created',
            },
            updated_at: {
              type: 'string',
              format: 'date-time',
              description: 'Timestamp when the node was last updated',
            },
          },
          required: ['id', 'name'],
        },
        Property: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              description: 'Unique identifier for the property',
            },
            node_id: {
              type: 'string',
              format: 'uuid',
              description: 'ID of the node this property belongs to',
            },
            key: {
              type: 'string',
              description: 'Property key name',
            },
            value: {
              type: 'number',
              format: 'decimal',
              description: 'Decimal value of the property',
            },
            created_at: {
              type: 'string',
              format: 'date-time',
              description: 'Timestamp when the property was created',
            },
            updated_at: {
              type: 'string',
              format: 'date-time',
              description: 'Timestamp when the property was last updated',
            },
          },
          required: ['id', 'node_id', 'key', 'value'],
        },
        NodeWithProperties: {
          allOf: [
            { $ref: '#/components/schemas/Node' },
            {
              type: 'object',
              properties: {
                properties: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/Property' },
                  description: 'Array of properties belonging to this node',
                },
                children: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/NodeWithProperties' },
                  description: 'Array of child nodes with their properties',
                },
              },
            },
          ],
        },
        CreateNodeRequest: {
          type: 'object',
          properties: {
            name: {
              type: 'string',
              description: 'Name of the node to create',
              example: 'TestPC',
            },
            parentId: {
              type: 'string',
              format: 'uuid',
              nullable: true,
              description: 'ID of the parent node (omit for root nodes)',
              example: '00000000-0000-0000-0000-000000000005',
            },
          },
          required: ['name'],
        },
        CreatePropertyRequest: {
          type: 'object',
          properties: {
            key: {
              type: 'string',
              description: 'Property key name',
              example: 'Height',
            },
            value: {
              type: 'number',
              format: 'decimal',
              description: 'Decimal value of the property',
              example: 450.0,
            },
          },
          required: ['key', 'value'],
        },
        ApiResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              description: 'Indicates if the request was successful',
            },
            data: {
              type: 'object',
              description: 'Response data',
            },
          },
          required: ['success'],
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            error: {
              type: 'string',
              description: 'Error code',
            },
          },
          required: ['error'],
        },
        ValidationError: {
          type: 'object',
          properties: {
            error: {
              type: 'string',
              example: 'Validation failed',
            },
            errors: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  field: {
                    type: 'string',
                    description: 'Field that failed validation',
                  },
                  message: {
                    type: 'string',
                    description: 'Validation error message',
                  },
                },
              },
            },
          },
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ['./src/routes/*.ts'], // paths to files containing OpenAPI definitions
};

export const specs = swaggerJsdoc(options);
