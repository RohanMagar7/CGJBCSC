"""
Custom storage backends for Django file uploads.
This module provides Dropbox storage integration.
"""

import os
import posixpath
from io import BytesIO
from django.core.files.base import File
from django.core.files.storage import Storage
from django.conf import settings
from django.utils.deconstruct import deconstructible
import dropbox
from dropbox.files import WriteMode
from dropbox.exceptions import ApiError


@deconstructible
class DropboxStorage(Storage):
    """
    Custom storage backend that saves files to Dropbox.
    """
    
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.access_token = getattr(settings, 'DROPBOX_ACCESS_TOKEN', None)
        self.root_path = getattr(settings, 'DROPBOX_ROOT_PATH', '/sewa_portal')
        self.timeout = getattr(settings, 'DROPBOX_TIMEOUT', 100)
        
        if not self.access_token:
            raise ValueError("DROPBOX_ACCESS_TOKEN not configured in settings")
        
        self.client = dropbox.Dropbox(
            self.access_token,
            timeout=self.timeout
        )
    
    def _full_path(self, name):
        """
        Get the full Dropbox path for a file.
        Ensures the path starts with / and doesn't have double slashes.
        """
        if name.startswith('/'):
            name = name[1:]
        
        path = posixpath.join(self.root_path, name)
        # Ensure path starts with /
        if not path.startswith('/'):
            path = '/' + path
        return path
    
    def _open(self, name, mode='rb'):
        """
        Retrieve a file from Dropbox.
        """
        path = self._full_path(name)
        try:
            metadata, response = self.client.files_download(path)
            return File(BytesIO(response.content), name)
        except ApiError as e:
            raise FileNotFoundError(f"File not found in Dropbox: {path}") from e
    
    def _save(self, name, content):
        """
        Save a file to Dropbox.
        """
        path = self._full_path(name)
        
        # Ensure parent folders exist (Dropbox auto-creates them)
        # Read the content
        if hasattr(content, 'read'):
            file_data = content.read()
        else:
            file_data = content
        
        try:
            # Upload file to Dropbox with overwrite mode
            self.client.files_upload(
                file_data,
                path,
                mode=WriteMode('overwrite'),
                autorename=False,
                mute=False
            )
            return name
        except ApiError as e:
            raise IOError(f"Error uploading file to Dropbox: {e}") from e
    
    def delete(self, name):
        """
        Delete a file from Dropbox.
        """
        path = self._full_path(name)
        try:
            self.client.files_delete_v2(path)
        except ApiError:
            # If file doesn't exist, consider it already deleted
            pass
    
    def exists(self, name):
        """
        Check if a file exists in Dropbox.
        """
        path = self._full_path(name)
        try:
            self.client.files_get_metadata(path)
            return True
        except ApiError:
            return False
    
    def size(self, name):
        """
        Get the size of a file in Dropbox.
        """
        path = self._full_path(name)
        try:
            metadata = self.client.files_get_metadata(path)
            return metadata.size
        except ApiError as e:
            raise FileNotFoundError(f"File not found in Dropbox: {path}") from e
    
    def url(self, name):
        """
        Generate a temporary download link for a file.
        This creates a direct download link valid for 4 hours.
        
        Note: Returns a Dropbox temporary link, NOT a local URL.
        If the file doesn't exist or link generation fails, returns the file path.
        """
        path = self._full_path(name)
        try:
            # Get a temporary link (valid for 4 hours)
            result = self.client.files_get_temporary_link(path)
            return result.link
        except ApiError as e:
            # If file doesn't exist or link can't be generated
            # Return the relative path (frontend should handle this gracefully)
            import logging
            logger = logging.getLogger(__name__)
            logger.warning(f"Could not generate Dropbox URL for {name}: {e}")
            return f"/dropbox-file-not-found/{name}"
    
    def listdir(self, path):
        """
        List the contents of a directory in Dropbox.
        Returns a tuple of (directories, files).
        """
        full_path = self._full_path(path)
        try:
            result = self.client.files_list_folder(full_path)
            directories = []
            files = []
            
            for entry in result.entries:
                if isinstance(entry, dropbox.files.FolderMetadata):
                    directories.append(entry.name)
                else:
                    files.append(entry.name)
            
            return directories, files
        except ApiError:
            return [], []
    
    def get_accessed_time(self, name):
        """
        Return the last accessed time (not supported by Dropbox).
        """
        return self.get_modified_time(name)
    
    def get_created_time(self, name):
        """
        Return the creation time of a file.
        """
        path = self._full_path(name)
        try:
            metadata = self.client.files_get_metadata(path)
            if hasattr(metadata, 'client_modified'):
                return metadata.client_modified
            return None
        except ApiError:
            return None
    
    def get_modified_time(self, name):
        """
        Return the last modified time of a file.
        """
        path = self._full_path(name)
        try:
            metadata = self.client.files_get_metadata(path)
            if hasattr(metadata, 'server_modified'):
                return metadata.server_modified
            return None
        except ApiError:
            return None
