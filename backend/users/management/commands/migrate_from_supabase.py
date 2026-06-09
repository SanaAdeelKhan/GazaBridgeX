from django.core.management.base import BaseCommand
from django.db import connection
from django.contrib.auth.hashers import make_password


class Command(BaseCommand):
    help = 'Migrate users from Supabase profiles to Django users_user'

    def handle(self, *args, **options):
        with connection.cursor() as cursor:
            cursor.execute("""
                SELECT 
                    u.email,
                    p.name,
                    p.country,
                    p.gender,
                    p.languages,
                    p.whatsapp_number,
                    p.linkedin,
                    p.role,
                    u.created_at
                FROM profiles p
                JOIN auth.users u ON p.id = u.id
            """)
            rows = cursor.fetchall()

        migrated = 0
        skipped = 0

        for row in rows:
            email, name, country, gender, languages, whatsapp, linkedin, role, created_at = row

            parts = (name or '').strip().split(' ', 1)
            first_name = parts[0] if parts else ''
            last_name = parts[1] if len(parts) > 1 else ''

            country = (country or '').strip()
            gender = (gender or '').replace('👩 ', '').replace('👨 ', '').strip()
            languages = str(languages) if languages else ''
            whatsapp = (whatsapp or '').strip()
            linkedin = (linkedin or '').strip()

            with connection.cursor() as cursor:
                cursor.execute("SELECT id FROM users_user WHERE email = %s", [email])
                if cursor.fetchone():
                    self.stdout.write(f'  Skipping existing: {email}')
                    skipped += 1
                    continue

                cursor.execute("""
                    INSERT INTO users_user (
                        email, first_name, last_name, password,
                        country, gender, languages, whatsapp_number, linkedin,
                        is_superuser, is_staff, is_active, date_joined
                    ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, false, false, true, %s)
                    RETURNING id
                """, [
                    email, first_name, last_name,
                    make_password(None),
                    country, gender, languages, whatsapp, linkedin,
                    created_at
                ])
                user_id = cursor.fetchone()[0]

                role_name = 'volunteer' if role == 'volunteer' else 'seeker'
                cursor.execute("SELECT id FROM users_role WHERE name = %s", [role_name])
                role_row = cursor.fetchone()
                if role_row:
                    cursor.execute("""
                        INSERT INTO users_user_roles (user_id, role_id)
                        VALUES (%s, %s)
                        ON CONFLICT DO NOTHING
                    """, [user_id, role_row[0]])

                migrated += 1
                self.stdout.write(f'  Migrated: {email} ({role_name})')

        self.stdout.write(self.style.SUCCESS(
            f'\nDone! Migrated: {migrated}, Skipped: {skipped}'
        ))
