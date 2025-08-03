# API Documentation

## Overview

This NodeJS TypeScript application provides a REST API for managing hierarchical PC component structures with properties. The system uses Supabase as the backend database with Row Level Security (RLS) and requires service role authentication.

## Interactive Documentation

Visit [http://localhost:3000/api-docs](http://localhost:3000/api-docs) for the interactive Swagger documentation with a complete OpenAPI 3.0 specification.

## Authentication

All API endpoints require authentication via Bearer token:

```
Authorization: Bearer <SUPABASE_SERVICE_ROLE_KEY>
```

## Base URL

```
http://localhost:3000/api/v1
```

## Endpoints

### 1. Create Node

**POST** `/api/v1/nodes`

Creates a new node in the hierarchy.

**Request Body:**

```json
{
  "name": "string", // Required: Node name (non-empty)
  "parentId": "string" // Optional: Parent node ID (null for root nodes)
}
```

**Response (201):**

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "string",
    "parent_id": "uuid|null",
    "created_at": "timestamp",
    "updated_at": "timestamp"
  }
}
```

**Example:**

```bash
curl -X POST http://localhost:3000/api/v1/nodes \
  -H "Authorization: Bearer <SERVICE_ROLE_KEY>" \
  -H "Content-Type: application/json" \
  -d '{"name": "TestPC"}'
```

**Error Responses:**

- `400`: Validation errors (missing/invalid name)
- `409`: Duplicate name under same parent
- `404`: Parent node not found

### 2. Add Property to Node

**POST** `/api/v1/nodes/:nodeId/properties`

Adds or updates a property on an existing node.

**Parameters:**

- `nodeId`: UUID of the target node

**Request Body:**

```json
{
  "key": "string",    // Required: Property key (non-empty)
  "value": number     // Required: Decimal value
}
```

**Response (201):**

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "node_id": "uuid",
    "key": "string",
    "value": number,
    "created_at": "timestamp",
    "updated_at": "timestamp"
  }
}
```

**Example:**

```bash
curl -X POST http://localhost:3000/api/v1/nodes/00000000-0000-0000-0000-000000000005/properties \
  -H "Authorization: Bearer <SERVICE_ROLE_KEY>" \
  -H "Content-Type: application/json" \
  -d '{"key": "Height", "value": 450.00}'
```

**Error Responses:**

- `400`: Validation errors (missing/invalid key or value)
- `404`: Node not found

### 3. Get Subtree by Path

**GET** `/api/v1/paths?q=<path>`

Retrieves a node subtree with all properties by hierarchical path.

**Query Parameters:**

- `q`: Required string - Node path (e.g., "AlphaPC/Processing/CPU")

**Response (200):**

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "string",
    "parent_id": "uuid|null",
    "created_at": "timestamp",
    "updated_at": "timestamp",
    "properties": [
      {
        "id": "uuid",
        "node_id": "uuid",
        "key": "string",
        "value": number,
        "created_at": "timestamp",
        "updated_at": "timestamp"
      }
    ],
    "children": [
      // ... nested NodeWithProperties objects
    ]
  }
}
```

**Example:**

```bash
curl "http://localhost:3000/api/v1/paths?q=AlphaPC/Processing/CPU" \
  -H "Authorization: Bearer <SERVICE_ROLE_KEY>"
```

**Error Responses:**

- `400`: Missing or invalid path format
- `404`: Node not found in path

## Health Check

**GET** `/health`

Public endpoint (no authentication required) for health monitoring.

**Response (200):**

```json
{
  "status": "healthy",
  "database": "connected",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## Pre-seeded Data Structure

The database comes pre-seeded with the following AlphaPC structure:

```
AlphaPC
├── Height: 450.00
├── Width: 180.00
├── Processing/
│   ├── CPU/
│   │   ├── Cores: 4
│   │   └── Power: 2.41
│   ├── Graphics/
│   │   ├── RAM: 4000.00
│   │   └── Ports: 8.00
│   └── RAM: 32000.00
└── Storage/
    ├── SSD/
    │   ├── Capacity: 1024.00
    │   └── WriteSpeed: 250.00
    └── HDD/
        ├── Capacity: 5120.00
        └── WriteSpeed: 1.724752
```

## Example Usage Flows

### Creating a Complete Component Tree

1. **Create root node:**

```bash
curl -X POST http://localhost:3000/api/v1/nodes \
  -H "Authorization: Bearer <SERVICE_ROLE_KEY>" \
  -H "Content-Type: application/json" \
  -d '{"name": "MyPC"}'
```

2. **Add properties to root:**

```bash
curl -X POST http://localhost:3000/api/v1/nodes/<root-id>/properties \
  -H "Authorization: Bearer <SERVICE_ROLE_KEY>" \
  -H "Content-Type: application/json" \
  -d '{"key": "Height", "value": 400.0}'
```

3. **Create child component:**

```bash
curl -X POST http://localhost:3000/api/v1/nodes \
  -H "Authorization: Bearer <SERVICE_ROLE_KEY>" \
  -H "Content-Type: application/json" \
  -d '{"name": "Motherboard", "parentId": "<root-id>"}'
```

4. **Retrieve complete structure:**

```bash
curl "http://localhost:3000/api/v1/paths?q=MyPC" \
  -H "Authorization: Bearer <SERVICE_ROLE_KEY>"
```

### Exploring Pre-seeded Data

1. **Get AlphaPC overview:**

```bash
curl "http://localhost:3000/api/v1/paths?q=AlphaPC" \
  -H "Authorization: Bearer <SERVICE_ROLE_KEY>"
```

2. **Get specific component:**

```bash
curl "http://localhost:3000/api/v1/paths?q=AlphaPC/Processing/CPU" \
  -H "Authorization: Bearer <SERVICE_ROLE_KEY>"
```

## Error Handling

All endpoints return consistent error responses:

```json
{
  "error": "ERROR_CODE",
  "message": "Human readable error message"
}
```

Common error codes:

- `VALIDATION_FAILED`: Request validation errors
- `NODE_NOT_FOUND`: Node does not exist
- `PARENT_NOT_FOUND`: Parent node does not exist
- `DUPLICATE_NAME`: Node name already exists under parent
- `INVALID_PATH`: Path format is invalid
- `UNAUTHORIZED`: Missing or invalid authentication
- `FORBIDDEN`: Invalid service role key

## Development

### Running Tests

```bash
npm test
```

### Starting Development Server

```bash
npm run dev
```

### Database Operations

```bash
npm run sb:start    # Start Supabase
npm run db:reset    # Reset database with migrations
npm run db:types    # Generate TypeScript types
```
