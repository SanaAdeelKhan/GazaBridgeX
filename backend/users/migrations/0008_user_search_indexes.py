from django.db import migrations

from backend.trigram_migrations import (
    create_trigram_indexes,
    create_upper_btree_index,
)


class Migration(migrations.Migration):
    """Additive, PostgreSQL-only indexes for user search (no-op on SQLite).

    - trigram GIN on upper(email/first_name/last_name): serves search_q
    - btree on upper(country): serves country__iexact
    """

    atomic = False

    dependencies = [
        ("users", "0007_user_profile_fields_completed"),
    ]

    operations = [
        create_trigram_indexes("users_user", ["email", "first_name", "last_name"]),
        create_upper_btree_index("users_user", "country"),
    ]
