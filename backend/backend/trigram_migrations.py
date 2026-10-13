"""Helpers for vendor-guarded expression-index migrations.

Production runs on PostgreSQL (Supabase); local dev runs on SQLite. The
indexes created here only exist on PostgreSQL and are a no-op elsewhere.

``search_q`` compiles to ``UPPER(col::text) LIKE UPPER('%term%')`` on
PostgreSQL, which is served by a pg_trgm GIN index on ``upper(col)``.

Migrations using these helpers must set ``atomic = False`` because
``CREATE INDEX CONCURRENTLY`` cannot run inside a transaction. Concurrent
builds avoid locking writes on large production tables, and ``IF NOT
EXISTS`` makes re-running a migration safe.
"""

from django.db import migrations


def _is_postgres(schema_editor) -> bool:
    return schema_editor.connection.vendor == "postgresql"


def trigram_index_name(table: str, column: str) -> str:
    return f"{table}_{column}_trgm_idx"[:63]


def upper_btree_index_name(table: str, column: str) -> str:
    return f"{table}_{column}_upper_idx"[:63]


def create_trigram_indexes(table: str, columns: list[str]) -> migrations.RunPython:
    """GIN ``upper(col) gin_trgm_ops`` index per column (PostgreSQL only)."""

    def forwards(apps, schema_editor):
        if not _is_postgres(schema_editor):
            return
        with schema_editor.connection.cursor() as cursor:
            cursor.execute("CREATE EXTENSION IF NOT EXISTS pg_trgm")
            for column in columns:
                cursor.execute(
                    f'CREATE INDEX CONCURRENTLY IF NOT EXISTS "{trigram_index_name(table, column)}" '
                    f'ON "{table}" USING gin (upper("{column}") gin_trgm_ops)'
                )

    def backwards(apps, schema_editor):
        if not _is_postgres(schema_editor):
            return
        with schema_editor.connection.cursor() as cursor:
            for column in columns:
                cursor.execute(
                    f'DROP INDEX CONCURRENTLY IF EXISTS "{trigram_index_name(table, column)}"'
                )

    return migrations.RunPython(forwards, backwards)


def create_upper_btree_index(table: str, column: str) -> migrations.RunPython:
    """B-tree ``upper(col)`` index for ``__iexact`` lookups (PostgreSQL only)."""

    def forwards(apps, schema_editor):
        if not _is_postgres(schema_editor):
            return
        with schema_editor.connection.cursor() as cursor:
            cursor.execute(
                f'CREATE INDEX CONCURRENTLY IF NOT EXISTS "{upper_btree_index_name(table, column)}" '
                f'ON "{table}" (upper("{column}"))'
            )

    def backwards(apps, schema_editor):
        if not _is_postgres(schema_editor):
            return
        with schema_editor.connection.cursor() as cursor:
            cursor.execute(
                f'DROP INDEX CONCURRENTLY IF EXISTS "{upper_btree_index_name(table, column)}"'
            )

    return migrations.RunPython(forwards, backwards)
