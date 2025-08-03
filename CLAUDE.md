# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a backend development challenge repository for building a NodeJS TypeScript application. The project is currently empty (only contains a README.md) and needs to be implemented from scratch.

## Challenge Requirements

The goal is to create a hierarchical node-tree system for PC components with the following core features:

1. **Database Schema**: Relational database storing PC component hierarchies where:
   - Each PC is a root node containing a tree of component nodes
   - Nodes have names and can contain properties (key-value pairs with decimal values)
   - Node paths are hierarchical (e.g., `/root/parent/child`)

2. **Data Structure**: The application should support a complex nested structure like:
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

3. **HTTP API**: REST endpoints for:
   - Creating nodes with specified parents
   - Adding properties to existing nodes
   - Retrieving subtrees with properties by node path

## Development Setup

Since this is a blank project, you'll need to:

1. Initialize a TypeScript NodeJS project with `npm init` and install TypeScript dependencies
2. Set up a database (PostgreSQL, MySQL, or SQLite) and configure an ORM
3. Create the database schema for nodes and properties
4. Implement the seed data structure shown above
5. Build REST API endpoints
6. Add unit tests specifically for the subtree retrieval endpoint
7. Create project documentation for running and testing

## Architecture Considerations

- **Database Design**: Need to model hierarchical relationships between nodes and their properties
- **ORM Choice**: Should use any appropriate ORM for TypeScript (Prisma, TypeORM, Sequelize, etc.)
- **API Structure**: RESTful design with proper validation and error handling
- **Testing**: Focus on unit tests for the subtree retrieval functionality
- **Path Handling**: Implement efficient node path resolution and tree traversal

## Key Implementation Areas

1. **Models**: Node and Property entities with proper relationships
2. **Services**: Business logic for tree operations and path resolution
3. **Controllers**: HTTP request handlers with validation
4. **Database**: Seeding scripts and migration setup
5. **Testing**: Unit tests for API endpoints, particularly subtree retrieval