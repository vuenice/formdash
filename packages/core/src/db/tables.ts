import type { Generated } from 'kysely';

export interface FormTable {
    id: string;
    slug: string;
    title: string;
    status: 'draft' | 'published' | 'archieved';
    is_multi_step: number;
    schema_json: string;
    created_at: Generated<string>;
    updated_at: Generated<string>;
}

export interface EntryTable {
    id: string;
    form_id: string;
    data_json: string;
    status: 'unread' | 'read' | 'archived' | 'spam';
    payment_status: 'none' | 'pending' | 'succeeded' | 'failed';
    payment_intent_id: string | null;
    ip_hash: string | null;
    created_at: Generated<string>;
}

export interface Database {
    formdash_forms: FormTable;
    formdash_entries: EntryTable;
}