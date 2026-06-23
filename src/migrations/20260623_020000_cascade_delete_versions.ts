import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    -- 1. Clean up existing orphaned versions where parent_id is null
    DELETE FROM "_posts_v" WHERE "parent_id" IS NULL;
    DELETE FROM "_pages_v" WHERE "parent_id" IS NULL;

    -- 2. Drop the old ON DELETE set null constraints
    ALTER TABLE "_posts_v" DROP CONSTRAINT IF EXISTS "_posts_v_parent_id_posts_id_fk";
    ALTER TABLE "_pages_v" DROP CONSTRAINT IF EXISTS "_pages_v_parent_id_pages_id_fk";

    -- 3. Re-add the constraints with ON DELETE CASCADE
    ALTER TABLE "_posts_v" ADD CONSTRAINT "_posts_v_parent_id_posts_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."posts"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
    ALTER TABLE "_pages_v" ADD CONSTRAINT "_pages_v_parent_id_pages_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."pages"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    -- Drop constraints first
    ALTER TABLE "_posts_v" DROP CONSTRAINT IF EXISTS "_posts_v_parent_id_posts_id_fk";
    ALTER TABLE "_pages_v" DROP CONSTRAINT IF EXISTS "_pages_v_parent_id_pages_id_fk";

    -- Re-add constraints with ON DELETE set null
    ALTER TABLE "_posts_v" ADD CONSTRAINT "_posts_v_parent_id_posts_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."posts"("id") ON DELETE SET NULL ON UPDATE NO ACTION;
    ALTER TABLE "_pages_v" ADD CONSTRAINT "_pages_v_parent_id_pages_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."pages"("id") ON DELETE SET NULL ON UPDATE NO ACTION;
  `)
}
