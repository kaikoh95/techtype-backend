create schema if not exists "techtype";

create table "techtype"."nodes" (
    "id" uuid not null default gen_random_uuid(),
    "name" character varying(255) not null,
    "parent_id" uuid,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now()
);


alter table "techtype"."nodes" enable row level security;

create table "techtype"."properties" (
    "id" uuid not null default gen_random_uuid(),
    "node_id" uuid not null,
    "key" character varying(255) not null,
    "value" numeric(15,6) not null,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now()
);


alter table "techtype"."properties" enable row level security;

CREATE INDEX idx_nodes_name ON techtype.nodes USING btree (name);

CREATE INDEX idx_nodes_parent_id ON techtype.nodes USING btree (parent_id);

CREATE INDEX idx_properties_key ON techtype.properties USING btree (key);

CREATE INDEX idx_properties_node_id ON techtype.properties USING btree (node_id);

CREATE UNIQUE INDEX nodes_pkey ON techtype.nodes USING btree (id);

CREATE UNIQUE INDEX properties_pkey ON techtype.properties USING btree (id);

CREATE UNIQUE INDEX unique_name_per_parent ON techtype.nodes USING btree (parent_id, name);

CREATE UNIQUE INDEX unique_node_key ON techtype.properties USING btree (node_id, key);

alter table "techtype"."nodes" add constraint "nodes_pkey" PRIMARY KEY using index "nodes_pkey";

alter table "techtype"."properties" add constraint "properties_pkey" PRIMARY KEY using index "properties_pkey";

alter table "techtype"."nodes" add constraint "check_node_name_not_empty" CHECK ((TRIM(BOTH FROM name) <> ''::text)) not valid;

alter table "techtype"."nodes" validate constraint "check_node_name_not_empty";

alter table "techtype"."nodes" add constraint "nodes_parent_id_fkey" FOREIGN KEY (parent_id) REFERENCES techtype.nodes(id) ON DELETE SET NULL not valid;

alter table "techtype"."nodes" validate constraint "nodes_parent_id_fkey";

alter table "techtype"."nodes" add constraint "unique_name_per_parent" UNIQUE using index "unique_name_per_parent";

alter table "techtype"."properties" add constraint "check_property_key_not_empty" CHECK ((TRIM(BOTH FROM key) <> ''::text)) not valid;

alter table "techtype"."properties" validate constraint "check_property_key_not_empty";

alter table "techtype"."properties" add constraint "properties_node_id_fkey" FOREIGN KEY (node_id) REFERENCES techtype.nodes(id) ON DELETE CASCADE not valid;

alter table "techtype"."properties" validate constraint "properties_node_id_fkey";

alter table "techtype"."properties" add constraint "unique_node_key" UNIQUE using index "unique_node_key";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION techtype.update_updated_at_column()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY INVOKER
AS $function$
begin
  new.updated_at = now();
  return new;
end;
$function$
;

CREATE TRIGGER update_nodes_updated_at BEFORE UPDATE ON techtype.nodes FOR EACH ROW EXECUTE FUNCTION techtype.update_updated_at_column();

CREATE TRIGGER update_properties_updated_at BEFORE UPDATE ON techtype.properties FOR EACH ROW EXECUTE FUNCTION techtype.update_updated_at_column();

GRANT USAGE ON SCHEMA "techtype" TO service_role;
GRANT ALL ON "techtype"."nodes" TO service_role;
GRANT ALL ON "techtype"."properties" TO service_role;
