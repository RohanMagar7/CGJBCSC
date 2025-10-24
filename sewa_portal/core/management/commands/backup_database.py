"""
Django management command for automated database backups
Run with: python manage.py backup_database
Schedule with cron or Render cron jobs
"""
from django.core.management.base import BaseCommand
from core.backup_manager import backup_manager


class Command(BaseCommand):
    help = 'Create database backup and upload to Dropbox'

    def add_arguments(self, parser):
        parser.add_argument(
            '--cleanup',
            action='store_true',
            help='Clean up old backups (keep last 7)',
        )

    def handle(self, *args, **options):
        self.stdout.write('Starting database backup...')
        
        # Create backup
        success, message, file_info = backup_manager.create_backup()
        
        if success:
            self.stdout.write(self.style.SUCCESS(f'✓ {message}'))
            if file_info:
                self.stdout.write(f"  File: {file_info['filename']}")
                self.stdout.write(f"  Size: {file_info['size']} bytes")
        else:
            self.stdout.write(self.style.ERROR(f'✗ {message}'))
            return
        
        # Cleanup old backups if requested
        if options['cleanup']:
            self.stdout.write('Cleaning up old backups...')
            success, deleted_count = backup_manager.delete_old_backups(keep_count=7)
            if success:
                self.stdout.write(self.style.SUCCESS(f'✓ Deleted {deleted_count} old backup(s)'))
            else:
                self.stdout.write(self.style.WARNING('⚠ Failed to cleanup old backups'))
        
        self.stdout.write(self.style.SUCCESS('Backup completed!'))
