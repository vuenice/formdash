import { Kysely, sql } from "kysely";

export async function up(db:Kysely<any>): Promise<void> {
    //  1. Create Forms Table
    await db.schema
        .createTable('formdash_forms')
            .ifNotExists()
            .addColumn('id', 'text', (col) => col.primaryKey())
            .addColumn('slug', 'text', (col) => col.unique().notNull())
            .addColumn('title','text', (col) => col.notNull())
            .addColumn('status', 'text', (col) => col.defaultTo('draft').notNull())
            .addColumn('is_multi_step', 'integer', (col) => col.defaultTo(0).notNull())
            .addColumn('schema_json', 'text', (col) => col.notNull())
            .addColumn('created_at', 'text', (col) => col.defaultTo(sql`CURRENT_TIMESTAMP`).notNull())
            .addColumn('updated_at', 'text', (col) => col.defaultTo(sql`CURRENT_TIMESTAMP`).notNull())
            .execute();

    // 2. Create Entries Table
    await db.schema
        .createTable('formdash_entries')
            .ifNotExists()
            .addColumn('id', 'text', (col) => col.primaryKey())
            .addColumn('form_id', 'text', (col) => col.references('formdash_forms.id').onDelete('cascade').notNull())
            .addColumn('data_json', 'text', (col) => col.notNull())
            .addColumn('status', 'text', (col) => col.defaultTo('unread').notNull())
            .addColumn('payment_status', 'text', (col) => col.defaultTo('none').notNull())
            .addColumn('payment_intent_id', 'text')
            .addColumn('ip_hash', 'text')
            .addColumn('created_at', 'text', (col) => col.defaultTo(sql`CURRENT_TIMESTAMP`).notNull())
            .execute();

    // 3. Create indices for fast lookup
    await db.schema
        .createIndex('idx_formdash_entries_form_id')
            .ifNotExists()
            .on('formdash_entries')
            .column('form_id')
            .execute();
}

export async function down(db:Kysely<any>): Promise<void> {
    await db.schema.dropTable('formdash_entries').ifExists().execute();
    await db.schema.dropTable('formdash_forms').ifExists().execute();    
}