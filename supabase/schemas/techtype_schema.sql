-- Techtype Schema - PC Components Hierarchy System
-- Complete database schema for hierarchical node tree structure

-- Create the techtype schema
create schema if not exists "techtype";

-- PC Component Nodes Table
-- Hierarchical structure for storing PC components as tree nodes
create table "techtype"."nodes" (
  "id" uuid primary key default gen_random_uuid(),
  "name" varchar(255) not null,
  "parent_id" uuid references "techtype"."nodes"("id") on delete set null,
  "created_at" timestamp with time zone default now(),
  "updated_at" timestamp with time zone default now()
);

-- Node Properties Table
-- Key-value pairs with decimal values for node attributes
create table "techtype"."properties" (
  "id" uuid primary key default gen_random_uuid(),
  "node_id" uuid not null references "techtype"."nodes"("id") on delete cascade,
  "key" varchar(255) not null,
  "value" decimal(15,6) not null,
  "created_at" timestamp with time zone default now(),
  "updated_at" timestamp with time zone default now()
);

-- Indexes for efficient queries
create index "idx_nodes_parent_id" on "techtype"."nodes"("parent_id");
create index "idx_nodes_name" on "techtype"."nodes"("name");
create index "idx_properties_node_id" on "techtype"."properties"("node_id");
create index "idx_properties_key" on "techtype"."properties"("key");

-- Constraints
alter table "techtype"."nodes" add constraint "unique_name_per_parent" 
  unique ("parent_id", "name");

alter table "techtype"."nodes" add constraint "check_node_name_not_empty" 
  check (trim("name") != '');

alter table "techtype"."properties" add constraint "unique_node_key" 
  unique ("node_id", "key");

alter table "techtype"."properties" add constraint "check_property_key_not_empty" 
  check (trim("key") != '');

-- Function to update updated_at timestamp
create or replace function "techtype"."update_updated_at_column"()
returns trigger
language "plpgsql"
security invoker
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Triggers for auto-updating timestamps
create trigger "update_nodes_updated_at" 
  before update on "techtype"."nodes"
  for each row execute function "techtype"."update_updated_at_column"();

create trigger "update_properties_updated_at" 
  before update on "techtype"."properties"
  for each row execute function "techtype"."update_updated_at_column"();

-- Enable Row Level Security
alter table "techtype"."nodes" enable row level security;
alter table "techtype"."properties" enable row level security;

grant usage on schema "techtype" to service_role;
grant all on "techtype"."nodes" to service_role;
grant all on "techtype"."properties" to service_role;
