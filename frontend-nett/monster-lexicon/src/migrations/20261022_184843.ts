import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_monster_origin" AS ENUM('Movies', 'other', 'literary', 'folk lore');
  CREATE TABLE "artist" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"picture_id" integer,
  	"nationality" varchar,
  	"biography" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "monster" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"picture_id" integer,
  	"origin" "enum_monster_origin",
  	"description" varchar,
  	"artist_id" integer NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "artist_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "monster_id" integer;
  ALTER TABLE "artist" ADD CONSTRAINT "artist_picture_id_media_id_fk" FOREIGN KEY ("picture_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "monster" ADD CONSTRAINT "monster_picture_id_media_id_fk" FOREIGN KEY ("picture_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "monster" ADD CONSTRAINT "monster_artist_id_artist_id_fk" FOREIGN KEY ("artist_id") REFERENCES "public"."artist"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "artist_picture_idx" ON "artist" USING btree ("picture_id");
  CREATE INDEX "artist_updated_at_idx" ON "artist" USING btree ("updated_at");
  CREATE INDEX "artist_created_at_idx" ON "artist" USING btree ("created_at");
  CREATE INDEX "monster_picture_idx" ON "monster" USING btree ("picture_id");
  CREATE INDEX "monster_artist_idx" ON "monster" USING btree ("artist_id");
  CREATE INDEX "monster_updated_at_idx" ON "monster" USING btree ("updated_at");
  CREATE INDEX "monster_created_at_idx" ON "monster" USING btree ("created_at");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_artist_fk" FOREIGN KEY ("artist_id") REFERENCES "public"."artist"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_monster_fk" FOREIGN KEY ("monster_id") REFERENCES "public"."monster"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_artist_id_idx" ON "payload_locked_documents_rels" USING btree ("artist_id");
  CREATE INDEX "payload_locked_documents_rels_monster_id_idx" ON "payload_locked_documents_rels" USING btree ("monster_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "artist" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "monster" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "artist" CASCADE;
  DROP TABLE "monster" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_artist_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_monster_fk";
  
  DROP INDEX "payload_locked_documents_rels_artist_id_idx";
  DROP INDEX "payload_locked_documents_rels_monster_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "artist_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "monster_id";
  DROP TYPE "public"."enum_monster_origin";`)
}
