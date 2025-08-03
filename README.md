### Backend Development

This backend app is created with Express as the server and Supabase as the database, written in Typescript, and tested with Jest.

This project acknowledges the use of AI tools like Claude to help with project setup, development, and tests.

Once you have the server running, check out the [Swagger UI](http://localhost:3000/api-docs) to see the API documentation.

#### Pre-requisites

- NVM (Node Version Manager)
- Node.js >= 20 (or follow the .nvmrc file)
- Docker (for running the Supabase server)
- Supabase
- Claude Code (optional for AI assistance)

#### Setup

- Clone the repository
- Run `nvm use` to use the correct Node.js version
- Run `npm install` to install dependencies
- Ensure docker is running before starting the Supabase server
- Start the Supabase server by running `npm run sb:start`
- Reset the database and apply the migrations and seed data by running `npm run db:reset`
- Clone env.example to .env and fill in the values

```bash
cp env.example .env
```

- SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY can be obtained from your local Supabase project by running `npm run sb:status`.

#### Local Development

- Run `npm run sb:start` to start the Supabase server
- Run `npm run db:reset` to reset the database, this will also seed the database with the seed.sql data
- Run `npm run dev` to start the development server
- Run `npm run test` to run the tests

#### Production

- Run `npm run build` to build the project
- Run `npm run start` to start the production server
- Deployments TBC

#### Endpoints

Check out the [Swagger UI](http://localhost:3000/api-docs) to see the API documentation.

- [GET] /health - Health check endpoint
- [GET] /api-docs - Swagger UI documentation

- [GET] /api/v1/nodes/{node_id} - Get a node by ID
- [POST] /api/v1/nodes - Create a new node
- [POST] /api/v1/nodes/{node_id}/properties - Upsert a property to a node
- [GET] /api/v1/paths?q={path} - Get the subtree of a node and properties by path

#### Database Maintenance

Whenever you want to make changes to the database schema, use the Supabase Declarative Schemas and then generate the database diff using `npm run db:diff`.

#### Future

- Assumes we always only have one unique key property per node. (hence the upsert rather than explicit insert for #2 requirement). Maybe we can consider splitting it into 2 distinct operations.
- Responses can get pretty large as we add more properties to the nodes and properties tables so we can consider pagination or caching in the future.
- Add ability to auth different users since we're only using the service role key for now so anyone with the key can access the endpoints.
- Caching of the data to reduce the number of queries to the database.
- Add UI visualization of the data.
- Consider using database views to improve query performance when queries get more complex.
- Add logging to the server.
- Add deleted_at column to the nodes and properties tables for soft deletes to keep the history of the data.
- Add CI/CD pipeline for deployments across environments.
- Use proper git workflow for development rather than just pushing to main.
