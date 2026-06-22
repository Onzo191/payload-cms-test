import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    -- Enum types for posts
    CREATE TYPE "public"."enum_posts_approval_status" AS ENUM(
      'draft', 'pending_review', 'changes_requested', 'approved', 'published', 'archived'
    );
    CREATE TYPE "public"."enum__posts_v_version_approval_status" AS ENUM(
      'draft', 'pending_review', 'changes_requested', 'approved', 'published', 'archived'
    );

    -- Enum types for pages
    CREATE TYPE "public"."enum_pages_approval_status" AS ENUM(
      'draft', 'pending_review', 'changes_requested', 'approved', 'published', 'archived'
    );
    CREATE TYPE "public"."enum__pages_v_version_approval_status" AS ENUM(
      'draft', 'pending_review', 'changes_requested', 'approved', 'published', 'archived'
    );

    -- Workflow columns on posts
    ALTER TABLE "posts"
      ADD COLUMN "approval_status" "enum_posts_approval_status" DEFAULT 'draft',
      ADD COLUMN "review_note" varchar,
      ADD COLUMN "submitted_by_id" uuid,
      ADD COLUMN "reviewed_by_id" uuid,
      ADD COLUMN "reviewed_at" timestamp(3) with time zone;

    -- Workflow columns on versioned posts
    ALTER TABLE "_posts_v"
      ADD COLUMN "version_approval_status" "enum__posts_v_version_approval_status" DEFAULT 'draft',
      ADD COLUMN "version_review_note" varchar,
      ADD COLUMN "version_submitted_by_id" uuid,
      ADD COLUMN "version_reviewed_by_id" uuid,
      ADD COLUMN "version_reviewed_at" timestamp(3) with time zone;

    -- Workflow columns on pages
    ALTER TABLE "pages"
      ADD COLUMN "approval_status" "enum_pages_approval_status" DEFAULT 'draft',
      ADD COLUMN "review_note" varchar,
      ADD COLUMN "submitted_by_id" uuid,
      ADD COLUMN "reviewed_by_id" uuid,
      ADD COLUMN "reviewed_at" timestamp(3) with time zone;

    -- Workflow columns on versioned pages
    ALTER TABLE "_pages_v"
      ADD COLUMN "version_approval_status" "enum__pages_v_version_approval_status" DEFAULT 'draft',
      ADD COLUMN "version_review_note" varchar,
      ADD COLUMN "version_submitted_by_id" uuid,
      ADD COLUMN "version_reviewed_by_id" uuid,
      ADD COLUMN "version_reviewed_at" timestamp(3) with time zone;

    -- FK constraints for posts
    ALTER TABLE "posts"
      ADD CONSTRAINT "posts_submitted_by_id_users_id_fk"
        FOREIGN KEY ("submitted_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action,
      ADD CONSTRAINT "posts_reviewed_by_id_users_id_fk"
        FOREIGN KEY ("reviewed_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;

    -- FK constraints for versioned posts
    ALTER TABLE "_posts_v"
      ADD CONSTRAINT "_posts_v_version_submitted_by_id_users_id_fk"
        FOREIGN KEY ("version_submitted_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action,
      ADD CONSTRAINT "_posts_v_version_reviewed_by_id_users_id_fk"
        FOREIGN KEY ("version_reviewed_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;

    -- FK constraints for pages
    ALTER TABLE "pages"
      ADD CONSTRAINT "pages_submitted_by_id_users_id_fk"
        FOREIGN KEY ("submitted_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action,
      ADD CONSTRAINT "pages_reviewed_by_id_users_id_fk"
        FOREIGN KEY ("reviewed_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;

    -- FK constraints for versioned pages
    ALTER TABLE "_pages_v"
      ADD CONSTRAINT "_pages_v_version_submitted_by_id_users_id_fk"
        FOREIGN KEY ("version_submitted_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action,
      ADD CONSTRAINT "_pages_v_version_reviewed_by_id_users_id_fk"
        FOREIGN KEY ("version_reviewed_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    -- Drop FK constraints
    ALTER TABLE "posts"
      DROP CONSTRAINT IF EXISTS "posts_submitted_by_id_users_id_fk",
      DROP CONSTRAINT IF EXISTS "posts_reviewed_by_id_users_id_fk";
    ALTER TABLE "_posts_v"
      DROP CONSTRAINT IF EXISTS "_posts_v_version_submitted_by_id_users_id_fk",
      DROP CONSTRAINT IF EXISTS "_posts_v_version_reviewed_by_id_users_id_fk";
    ALTER TABLE "pages"
      DROP CONSTRAINT IF EXISTS "pages_submitted_by_id_users_id_fk",
      DROP CONSTRAINT IF EXISTS "pages_reviewed_by_id_users_id_fk";
    ALTER TABLE "_pages_v"
      DROP CONSTRAINT IF EXISTS "_pages_v_version_submitted_by_id_users_id_fk",
      DROP CONSTRAINT IF EXISTS "_pages_v_version_reviewed_by_id_users_id_fk";

    -- Drop columns
    ALTER TABLE "posts"
      DROP COLUMN IF EXISTS "approval_status",
      DROP COLUMN IF EXISTS "review_note",
      DROP COLUMN IF EXISTS "submitted_by_id",
      DROP COLUMN IF EXISTS "reviewed_by_id",
      DROP COLUMN IF EXISTS "reviewed_at";
    ALTER TABLE "_posts_v"
      DROP COLUMN IF EXISTS "version_approval_status",
      DROP COLUMN IF EXISTS "version_review_note",
      DROP COLUMN IF EXISTS "version_submitted_by_id",
      DROP COLUMN IF EXISTS "version_reviewed_by_id",
      DROP COLUMN IF EXISTS "version_reviewed_at";
    ALTER TABLE "pages"
      DROP COLUMN IF EXISTS "approval_status",
      DROP COLUMN IF EXISTS "review_note",
      DROP COLUMN IF EXISTS "submitted_by_id",
      DROP COLUMN IF EXISTS "reviewed_by_id",
      DROP COLUMN IF EXISTS "reviewed_at";
    ALTER TABLE "_pages_v"
      DROP COLUMN IF EXISTS "version_approval_status",
      DROP COLUMN IF EXISTS "version_review_note",
      DROP COLUMN IF EXISTS "version_submitted_by_id",
      DROP COLUMN IF EXISTS "version_reviewed_by_id",
      DROP COLUMN IF EXISTS "version_reviewed_at";

    -- Drop enum types
    DROP TYPE IF EXISTS "public"."enum_posts_approval_status";
    DROP TYPE IF EXISTS "public"."enum__posts_v_version_approval_status";
    DROP TYPE IF EXISTS "public"."enum_pages_approval_status";
    DROP TYPE IF EXISTS "public"."enum__pages_v_version_approval_status";
  `)
}
