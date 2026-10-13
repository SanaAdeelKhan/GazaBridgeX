from django.db import migrations

from backend.trigram_migrations import create_trigram_indexes


class Migration(migrations.Migration):
    """Additive, PostgreSQL-only pg_trgm GIN indexes serving search_q (no-op on SQLite)."""

    atomic = False

    dependencies = [
        ("live_sections", "0002_created_at_desc_indexes"),
    ]

    operations = [
        create_trigram_indexes("live_sections_livesection", ["title", "description"]),
    ]
