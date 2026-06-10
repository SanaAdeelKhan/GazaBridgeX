from django.core.management.base import BaseCommand
from django.db import connection
from django.utils import timezone


class Command(BaseCommand):
    help = 'Migrate offers and requests from Supabase to Django'

    def handle(self, *args, **options):
        self.migrate_offers()
        self.migrate_requests()

    def migrate_offers(self):
        self.stdout.write('\n--- Migrating Offers ---')
        migrated = 0
        skipped = 0

        with connection.cursor() as cursor:
            cursor.execute("""
                SELECT 
                    o.category,
                    o.description,
                    o.availability,
                    o.created_at,
                    u.email
                FROM offers o
                JOIN profiles p ON o.user_id = p.id
                JOIN auth.users u ON p.id = u.id
            """)
            rows = cursor.fetchall()

        for row in rows:
            category, description, availability, created_at, email = row

            with connection.cursor() as cursor:
                # Get Django user id by email
                cursor.execute("SELECT id FROM users_user WHERE email = %s", [email])
                user_row = cursor.fetchone()
                if not user_row:
                    self.stdout.write(f'  Skipping offer - user not found: {email}')
                    skipped += 1
                    continue

                user_id = user_row[0]

                # Generate offer_name from description
                offer_name = (description or '').strip()[:50] or category

                # Clean fields
                availability = (availability or 'flexible').strip()[:20]
                category = (category or '').replace('💼 ', '').replace('💻 ', '').replace('📖 ', '').replace('🌍 ', '').replace('🎨 ', '').strip()[:50]

                cursor.execute("""
                    INSERT INTO posts_offer (
                        offer_name, category, description,
                        availability, status,
                        created_at, updated_at, user_id
                    ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                """, [
                    offer_name, category, description or '',
                    availability, 'active',
                    created_at, created_at, user_id
                ])

                migrated += 1
                self.stdout.write(f'  Migrated offer: {email} - {offer_name[:30]}')

        self.stdout.write(self.style.SUCCESS(
            f'Offers done! Migrated: {migrated}, Skipped: {skipped}'
        ))

    def migrate_requests(self):
        self.stdout.write('\n--- Migrating Requests ---')
        migrated = 0
        skipped = 0

        with connection.cursor() as cursor:
            cursor.execute("""
                SELECT 
                    r.category,
                    r.description,
                    r.created_at,
                    u.email
                FROM requests r
                JOIN profiles p ON r.user_id = p.id
                JOIN auth.users u ON p.id = u.id
            """)
            rows = cursor.fetchall()

        for row in rows:
            category, description, created_at, email = row

            with connection.cursor() as cursor:
                # Get Django user id by email
                cursor.execute("SELECT id FROM users_user WHERE email = %s", [email])
                user_row = cursor.fetchone()
                if not user_row:
                    self.stdout.write(f'  Skipping request - user not found: {email}')
                    skipped += 1
                    continue

                user_id = user_row[0]

                # Generate request_name from description
                request_name = (description or '').strip()[:50] or category

                # Clean category
                category = (category or '').replace('💼 ', '').replace('💻 ', '').replace('📖 ', '').replace('🌍 ', '').replace('🎨 ', '').strip()[:50]

                cursor.execute("""
                    INSERT INTO posts_request (
                        request_name, category, description,
                        status, created_at, updated_at, user_id
                    ) VALUES (%s, %s, %s, %s, %s, %s, %s)
                """, [
                    request_name, category, description or '',
                    'active', created_at, created_at, user_id
                ])

                migrated += 1
                self.stdout.write(f'  Migrated request: {email} - {request_name[:30]}')

        self.stdout.write(self.style.SUCCESS(
            f'Requests done! Migrated: {migrated}, Skipped: {skipped}'
        ))
