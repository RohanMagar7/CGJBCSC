"""
Database Backup Manager for Production
Handles manual and automatic backups to Dropbox
"""
import os
import subprocess
import tempfile
from datetime import datetime
from django.conf import settings
import dropbox
from dropbox.exceptions import ApiError
import logging

logger = logging.getLogger(__name__)


class BackupManager:
    def __init__(self):
        """Initialize Dropbox client"""
        self.dropbox_client = None
        self._initialize_dropbox()
    
    def _initialize_dropbox(self):
        """Initialize Dropbox client with refresh token"""
        try:
            app_key = settings.DROPBOX_APP_KEY
            app_secret = settings.DROPBOX_APP_SECRET
            refresh_token = settings.DROPBOX_REFRESH_TOKEN
            
            if not all([app_key, app_secret, refresh_token]):
                logger.error("Dropbox credentials not configured")
                return
            
            # Use refresh token to get access token
            self.dropbox_client = dropbox.Dropbox(
                app_key=app_key,
                app_secret=app_secret,
                oauth2_refresh_token=refresh_token
            )
            logger.info("Dropbox client initialized successfully")
        except Exception as e:
            logger.error(f"Failed to initialize Dropbox: {e}")
    
    def create_backup(self):
        """
        Create a database backup and upload to Dropbox
        Returns: (success: bool, message: str, file_info: dict)
        """
        if not self.dropbox_client:
            return False, "Dropbox not configured", None
        
        # Only backup in production (when DATABASE_URL is set)
        database_url = os.environ.get('DATABASE_URL')
        if not database_url:
            return False, "Production database not configured (DATABASE_URL not set)", None
        
        try:
            # Generate backup filename with timestamp
            timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
            backup_filename = f"backup_{timestamp}.sql"
            
            # Create temporary file for backup
            with tempfile.NamedTemporaryFile(mode='w', delete=False, suffix='.sql') as temp_file:
                temp_path = temp_file.name
            
            # Run pg_dump to create backup
            # Parse DATABASE_URL to get connection params
            import dj_database_url
            db_config = dj_database_url.parse(database_url)
            
            pg_dump_cmd = [
                'pg_dump',
                '-h', db_config['HOST'],
                '-p', str(db_config['PORT']),
                '-U', db_config['USER'],
                '-d', db_config['NAME'],
                '-F', 'p',  # Plain text format
                '-f', temp_path,
                '--no-synchronized-snapshots',  # Avoid snapshot issues
            ]
            
            # Set password environment variable
            env = os.environ.copy()
            env['PGPASSWORD'] = db_config['PASSWORD']
            
            # Execute pg_dump
            result = subprocess.run(
                pg_dump_cmd,
                env=env,
                capture_output=True,
                text=True
            )
            
            # Check for actual errors (ignore version warnings if dump succeeded)
            if result.returncode != 0:
                # If file was created and has content, version mismatch might be just a warning
                if os.path.exists(temp_path) and os.path.getsize(temp_path) > 0:
                    logger.warning(f"pg_dump completed with warnings: {result.stderr}")
                    # Continue with upload despite warning
                else:
                    logger.error(f"pg_dump failed: {result.stderr}")
                    os.unlink(temp_path)
                    return False, f"Database dump failed: {result.stderr}", None
            
            # Upload to Dropbox
            dropbox_path = f"/backups/{backup_filename}"
            
            with open(temp_path, 'rb') as f:
                file_content = f.read()
                
                # Upload to Dropbox
                self.dropbox_client.files_upload(
                    file_content,
                    dropbox_path,
                    mode=dropbox.files.WriteMode.overwrite
                )
            
            # Get file metadata
            metadata = self.dropbox_client.files_get_metadata(dropbox_path)
            
            # Clean up temp file
            os.unlink(temp_path)
            
            file_info = {
                'filename': backup_filename,
                'path': dropbox_path,
                'size': metadata.size,
                'created_at': datetime.now().isoformat()
            }
            
            logger.info(f"Backup created successfully: {backup_filename}")
            return True, f"Backup created: {backup_filename}", file_info
            
        except subprocess.CalledProcessError as e:
            logger.error(f"Backup subprocess error: {e}")
            return False, f"Backup failed: {str(e)}", None
        except ApiError as e:
            logger.error(f"Dropbox API error: {e}")
            return False, f"Dropbox upload failed: {str(e)}", None
        except Exception as e:
            logger.error(f"Backup error: {e}")
            return False, f"Backup failed: {str(e)}", None
    
    def list_backups(self):
        """
        List all backups in Dropbox
        Returns: (success: bool, backups: list)
        """
        if not self.dropbox_client:
            return False, []
        
        try:
            result = self.dropbox_client.files_list_folder('/backups')
            
            backups = []
            for entry in result.entries:
                if isinstance(entry, dropbox.files.FileMetadata):
                    backups.append({
                        'name': entry.name,
                        'path': entry.path_display,
                        'size': entry.size,
                        'modified': entry.client_modified.isoformat()
                    })
            
            # Sort by modified date (newest first)
            backups.sort(key=lambda x: x['modified'], reverse=True)
            
            return True, backups
        except ApiError as e:
            if e.error.is_path() and e.error.get_path().is_not_found():
                # Backups folder doesn't exist yet
                return True, []
            logger.error(f"Failed to list backups: {e}")
            return False, []
        except Exception as e:
            logger.error(f"Failed to list backups: {e}")
            return False, []
    
    def delete_old_backups(self, keep_count=7):
        """
        Delete old backups, keeping only the most recent ones
        Args:
            keep_count: Number of recent backups to keep (default: 7)
        Returns: (success: bool, deleted_count: int)
        """
        if not self.dropbox_client:
            return False, 0
        
        try:
            success, backups = self.list_backups()
            if not success or len(backups) <= keep_count:
                return True, 0
            
            # Delete old backups
            backups_to_delete = backups[keep_count:]
            deleted_count = 0
            
            for backup in backups_to_delete:
                try:
                    self.dropbox_client.files_delete_v2(backup['path'])
                    deleted_count += 1
                    logger.info(f"Deleted old backup: {backup['name']}")
                except Exception as e:
                    logger.error(f"Failed to delete backup {backup['name']}: {e}")
            
            return True, deleted_count
        except Exception as e:
            logger.error(f"Failed to clean old backups: {e}")
            return False, 0


# Singleton instance
backup_manager = BackupManager()
